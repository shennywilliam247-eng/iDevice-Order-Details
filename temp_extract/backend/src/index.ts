import { Hono } from "hono";
import type { Client } from "@sdk/server-types";
import { tables, buckets } from "@generated";
import { eq, desc, like, or, and } from "drizzle-orm";

export async function createApp(
  edgespark: Client<typeof tables>
): Promise<Hono> {
  const app = new Hono();

  // ============================================
  // PUBLIC ENDPOINTS
  // ============================================

  // Public: Get all devices (product catalog)
  app.get('/api/public/devices', async (c) => {
    console.log("[API] GET /api/public/devices - fetching all devices");
    const deviceList = await edgespark.db.select().from(tables.devices);
    console.log("[API] GET /api/public/devices - found", deviceList.length, "devices");
    return c.json({ data: deviceList });
  });

  // Public: Secure Order Access (Login to Dashboard)
  app.post('/api/public/order-access', async (c) => {
    const body = await c.req.json();
    const { email, reference } = body;
    
    console.log("[API] POST /api/public/order-access - attempt for:", email);

    if (!email || !reference) {
      return c.json({ error: 'Email and Order/Tracking Number are required' }, 400);
    }

    // Find order matching email AND (orderNumber OR trackingNumber)
    const orderList = await edgespark.db.select()
      .from(tables.orders)
      .where(and(
        eq(tables.orders.customerEmail, email),
        or(
          eq(tables.orders.orderNumber, reference),
          eq(tables.orders.trackingNumber, reference)
        )
      ))
      .limit(1);

    const order = orderList[0];

    if (!order) {
      console.log("[API] POST /api/public/order-access - no match found");
      return c.json({ error: 'Order not found or email does not match' }, 401);
    }

    // Get device details
    const deviceList = await edgespark.db.select()
      .from(tables.devices)
      .where(eq(tables.devices.id, order.deviceId))
      .limit(1);
    
    const device = deviceList[0];

    // Get tracking events
    const events = await edgespark.db.select()
      .from(tables.trackingEvents)
      .where(eq(tables.trackingEvents.orderId, order.id))
      .orderBy(desc(tables.trackingEvents.id));

    console.log("[API] POST /api/public/order-access - success for:", order.orderNumber);
    
    return c.json({
      order: {
        ...order,
        device: device
      },
      timeline: events
    });
  });

  // ============================================
  // USER MANAGEMENT
  // ============================================

  // Sync User (Call on login)
  app.post('/api/users/sync', async (c) => {
    const user = edgespark.auth.user!; // Guaranteed by framework

    const existing = await edgespark.db.select().from(tables.appUsers).where(eq(tables.appUsers.authId, user.id)).limit(1);
    
    if (existing.length === 0) {
      // Create new user
      const newUser = await edgespark.db.insert(tables.appUsers).values({
        authId: user.id,
        email: user.email || '',
        name: user.name,
        role: 'user', // Default role
        createdAt: Date.now()
      }).returning();
      return c.json({ user: newUser[0] });
    }

    return c.json({ user: existing[0] });
  });

  // List Users (Admin only)
  app.get('/api/users', async (c) => {
    const user = edgespark.auth.user!;
    
    const appUser = await edgespark.db.select().from(tables.appUsers).where(eq(tables.appUsers.authId, user.id)).limit(1);
    if (appUser[0]?.role !== 'admin') return c.json({ error: 'Forbidden' }, 403);

    const users = await edgespark.db.select().from(tables.appUsers);
    return c.json({ data: users });
  });

  // Update Role
  app.put('/api/users/:id/role', async (c) => {
    const user = edgespark.auth.user!;
    const appUser = await edgespark.db.select().from(tables.appUsers).where(eq(tables.appUsers.authId, user.id)).limit(1);
    if (appUser[0]?.role !== 'admin') return c.json({ error: 'Forbidden' }, 403);

    const id = parseInt(c.req.param('id'));
    const { role } = await c.req.json();
    
    await edgespark.db.update(tables.appUsers).set({ role }).where(eq(tables.appUsers.id, id));
    return c.json({ success: true });
  });

  // Link Order to User
  app.post('/api/users/link-order', async (c) => {
    const { userId, orderIdentifier } = await c.req.json();
    
    // Find order
    const order = await edgespark.db.select().from(tables.orders).where(or(
      eq(tables.orders.orderNumber, orderIdentifier),
      eq(tables.orders.trackingNumber, orderIdentifier),
      eq(tables.orders.id, parseInt(orderIdentifier) || 0)
    )).limit(1);

    if (!order[0]) return c.json({ error: 'Order not found' }, 404);

    await edgespark.db.update(tables.orders).set({ userId }).where(eq(tables.orders.id, order[0].id));
    return c.json({ success: true });
  });

  // ============================================
  // ASSET MANAGEMENT
  // ============================================

  // Upload Asset
  app.post('/api/assets/upload', async (c) => {
    const user = edgespark.auth.user!;
    const appUser = await edgespark.db.select().from(tables.appUsers).where(eq(tables.appUsers.authId, user.id)).limit(1);
    if (appUser[0]?.role !== 'admin') return c.json({ error: 'Forbidden' }, 403);

    const body = await c.req.parseBody();
    const file = body['file']; 

    if (!file || typeof file === 'string') {
      return c.json({ error: 'No file uploaded' }, 400);
    }

    const filename = file.name;
    const buffer = await file.arrayBuffer();
    
    // Upload to R2
    const key = `${Date.now()}-${filename}`;
    await edgespark.storage.from(buckets.assets).put(key, buffer, {
      contentType: file.type
    });

    // Store S3 URI in DB
    const s3Uri = edgespark.storage.toS3Uri(buckets.assets, key);

    // Insert into DB
    const asset = await edgespark.db.insert(tables.assets).values({
      filename: filename,
      url: s3Uri,
      size: file.size,
      mimeType: file.type,
      uploadedAt: Date.now()
    }).returning();

    return c.json({ data: asset[0] });
  });

  // List Assets
  app.get('/api/assets', async (c) => {
    const user = edgespark.auth.user!;
    const appUser = await edgespark.db.select().from(tables.appUsers).where(eq(tables.appUsers.authId, user.id)).limit(1);
    if (appUser[0]?.role !== 'admin') return c.json({ error: 'Forbidden' }, 403);

    const assets = await edgespark.db.select().from(tables.assets).orderBy(desc(tables.assets.uploadedAt));
    
    // Generate presigned URLs
    const assetsWithUrls = await Promise.all(assets.map(async (a) => {
      if (!a.url) return a;
      try {
        const { path } = edgespark.storage.fromS3Uri(a.url);
        const { downloadUrl } = await edgespark.storage.from(buckets.assets).createPresignedGetUrl(path, 3600); // 1 hour
        return { ...a, downloadUrl };
      } catch (e) {
        return { ...a, downloadUrl: null };
      }
    }));

    return c.json({ data: assetsWithUrls });
  });

  // Delete Asset
  app.delete('/api/assets/:id', async (c) => {
    const user = edgespark.auth.user!;
    const appUser = await edgespark.db.select().from(tables.appUsers).where(eq(tables.appUsers.authId, user.id)).limit(1);
    if (appUser[0]?.role !== 'admin') return c.json({ error: 'Forbidden' }, 403);

    const id = parseInt(c.req.param('id'));
    const asset = await edgespark.db.select().from(tables.assets).where(eq(tables.assets.id, id)).limit(1);
    
    if (!asset[0]) return c.json({ error: 'Not found' }, 404);

    // Delete from Storage
    try {
      const { path } = edgespark.storage.fromS3Uri(asset[0].url);
      await edgespark.storage.from(buckets.assets).delete(path);
    } catch (e) {
      console.error("Failed to delete from storage", e);
    }

    // Delete from DB
    await edgespark.db.delete(tables.assets).where(eq(tables.assets.id, id));
    return c.json({ success: true });
  });

  // ============================================
  // ADMIN ENDPOINTS - DEVICES
  // ============================================

  // Admin: Get all devices (Protected)
  app.get('/api/devices', async (c) => {
    const user = edgespark.auth.user!;
    const appUser = await edgespark.db.select().from(tables.appUsers).where(eq(tables.appUsers.authId, user.id)).limit(1);
    if (appUser[0]?.role !== 'admin') return c.json({ error: 'Forbidden' }, 403);

    const deviceList = await edgespark.db.select().from(tables.devices);
    return c.json({ data: deviceList });
  });

  // Admin: Create Device
  app.post('/api/devices', async (c) => {
    const user = edgespark.auth.user!;
    const appUser = await edgespark.db.select().from(tables.appUsers).where(eq(tables.appUsers.authId, user.id)).limit(1);
    if (appUser[0]?.role !== 'admin') return c.json({ error: 'Forbidden' }, 403);

    const body = await c.req.json();
    const result = await edgespark.db.insert(tables.devices).values({
      model: body.model,
      name: body.name,
      description: body.description,
      color: body.color,
      storage: body.storage,
      price: body.price,
      imageUrl: body.imageUrl
    }).returning();
    return c.json({ data: result[0] });
  });

  // ============================================
  // ADMIN ENDPOINTS - ORDERS
  // ============================================

  // Admin: Get all orders
  app.get('/api/orders', async (c) => {
    const user = edgespark.auth.user!;
    const appUser = await edgespark.db.select().from(tables.appUsers).where(eq(tables.appUsers.authId, user.id)).limit(1);
    if (appUser[0]?.role !== 'admin') return c.json({ error: 'Forbidden' }, 403);

    const orderList = await edgespark.db.select().from(tables.orders).orderBy(desc(tables.orders.createdAt));
    return c.json({ data: orderList });
  });

  // Admin: Create Order
  app.post('/api/orders', async (c) => {
    const user = edgespark.auth.user!;
    const appUser = await edgespark.db.select().from(tables.appUsers).where(eq(tables.appUsers.authId, user.id)).limit(1);
    if (appUser[0]?.role !== 'admin') return c.json({ error: 'Forbidden' }, 403);

    const body = await c.req.json();
    
    // Generate random order number if not provided
    const orderNum = body.orderNumber || `ORD-${Math.floor(Math.random() * 100000)}`;
    const trackNum = body.trackingNumber || `TRK-${Math.floor(Math.random() * 100000)}`;

    const result = await edgespark.db.insert(tables.orders).values({
      orderNumber: orderNum,
      trackingNumber: trackNum,
      deviceId: body.deviceId,
      customerName: body.customerName,
      customerEmail: body.customerEmail,
      shippingAddress: body.shippingAddress,
      waybill: body.waybill,
      packageDimensions: body.packageDimensions,
      senderInfo: body.senderInfo,
      receiverInfo: body.receiverInfo,
      status: 'processing'
    }).returning();

    return c.json({ data: result[0] });
  });

  // Admin: Update Order Status and Info
  app.put('/api/orders/:id', async (c) => {
    const user = edgespark.auth.user!;
    const appUser = await edgespark.db.select().from(tables.appUsers).where(eq(tables.appUsers.authId, user.id)).limit(1);
    if (appUser[0]?.role !== 'admin') return c.json({ error: 'Forbidden' }, 403);

    const id = parseInt(c.req.param('id'));
    const body = await c.req.json();
    
    const updateData: any = {};
    if (body.status !== undefined) updateData.status = body.status;
    if (body.waybill !== undefined) updateData.waybill = body.waybill;
    if (body.packageDimensions !== undefined) updateData.packageDimensions = body.packageDimensions;
    if (body.senderInfo !== undefined) updateData.senderInfo = body.senderInfo;
    if (body.receiverInfo !== undefined) updateData.receiverInfo = body.receiverInfo;
    if (body.trackingNumber !== undefined) updateData.trackingNumber = body.trackingNumber;
    if (body.orderNumber !== undefined) updateData.orderNumber = body.orderNumber;
    if (body.customerName !== undefined) updateData.customerName = body.customerName;
    if (body.customerEmail !== undefined) updateData.customerEmail = body.customerEmail;
    if (body.shippingAddress !== undefined) updateData.shippingAddress = body.shippingAddress;
    
    // Only update if there's data
    if (Object.keys(updateData).length > 0) {
      await edgespark.db.update(tables.orders)
        .set(updateData)
        .where(eq(tables.orders.id, id));
    }
      
    return c.json({ success: true });
  });

  // Admin: Add Tracking Event
  app.post('/api/orders/:id/events', async (c) => {
    const user = edgespark.auth.user!;
    const appUser = await edgespark.db.select().from(tables.appUsers).where(eq(tables.appUsers.authId, user.id)).limit(1);
    if (appUser[0]?.role !== 'admin') return c.json({ error: 'Forbidden' }, 403);

    const id = parseInt(c.req.param('id'));
    const body = await c.req.json();
    
    const result = await edgespark.db.insert(tables.trackingEvents).values({
      orderId: id,
      packageId: 0, // Placeholder if not using packages table strictly
      date: body.date,
      location: body.location,
      description: body.description
    }).returning();

    // Optionally update order status
    if (body.updateStatus) {
      await edgespark.db.update(tables.orders)
        .set({ status: body.updateStatus })
        .where(eq(tables.orders.id, id));
    }

    return c.json({ data: result[0] });
  });

  return app;
}
