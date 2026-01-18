import type { Express } from "express";
import { createServer, type Server } from "http";
import { db } from "./db";
import { devices, orders, trackingEvents, appUsers, assets } from "@shared/schema";
import { eq, desc, or, and } from "drizzle-orm";
import { z } from "zod";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {

  // ============================================
  // PUBLIC ENDPOINTS
  // ============================================

  // Public: Get all devices (product catalog)
  app.get('/api/public/devices', async (req, res) => {
    console.log("[API] GET /api/public/devices - fetching all devices");
    const deviceList = await db.select().from(devices);
    console.log("[API] GET /api/public/devices - found", deviceList.length, "devices");
    res.json({ data: deviceList });
  });

  // Public: Secure Order Access (Login to Dashboard)
  app.post('/api/public/order-access', async (req, res) => {
    const { email, reference } = req.body;
    
    console.log("[API] POST /api/public/order-access - attempt for:", email);

    if (!email || !reference) {
      return res.status(400).json({ error: 'Email and Order/Tracking Number are required' });
    }

    // Find order matching email AND (orderNumber OR trackingNumber)
    const orderList = await db.select()
      .from(orders)
      .where(and(
        eq(orders.customerEmail, email),
        or(
          eq(orders.orderNumber, reference),
          eq(orders.trackingNumber, reference)
        )
      ))
      .limit(1);

    const order = orderList[0];

    if (!order) {
      console.log("[API] POST /api/public/order-access - no match found");
      return res.status(401).json({ error: 'Order not found or email does not match' });
    }

    // Get device details
    let device = null;
    if (order.deviceId) {
      const deviceList = await db.select()
        .from(devices)
        .where(eq(devices.id, order.deviceId))
        .limit(1);
      device = deviceList[0];
    }

    // Get tracking events
    const events = await db.select()
      .from(trackingEvents)
      .where(eq(trackingEvents.orderId, order.id))
      .orderBy(desc(trackingEvents.id));

    console.log("[API] POST /api/public/order-access - success for:", order.orderNumber);
    
    res.json({
      order: {
        ...order,
        device: device
      },
      timeline: events
    });
  });

  // ============================================
  // USER MANAGEMENT (Mock for Admin Access)
  // ============================================
  
  app.post('/api/users/sync', (req, res) => {
    // Return a mock admin user to allow access to admin panel
    res.json({ 
      user: { 
        id: 1, 
        role: 'admin', 
        name: 'Admin User',
        email: 'admin@example.com'
      } 
    });
  });

  app.get('/api/users', async (req, res) => {
    const userList = await db.select().from(appUsers);
    res.json({ data: userList });
  });

  // ============================================
  // ADMIN ENDPOINTS - DEVICES
  // ============================================

  // Admin: Get all devices
  app.get('/api/devices', async (req, res) => {
    const deviceList = await db.select().from(devices);
    res.json({ data: deviceList });
  });

  // Admin: Create Device
  app.post('/api/devices', async (req, res) => {
    const body = req.body;
    const result = await db.insert(devices).values({
      model: body.model,
      name: body.name,
      description: body.description,
      color: body.color,
      storage: body.storage,
      price: body.price,
      imageUrl: body.imageUrl,
      quantity: body.quantity || 1
    }).returning();
    res.json({ data: result[0] });
  });

  // ============================================
  // ADMIN ENDPOINTS - ORDERS
  // ============================================

  // Admin: Get all orders
  app.get('/api/orders', async (req, res) => {
    const orderList = await db.select().from(orders).orderBy(desc(orders.createdAt));
    res.json({ data: orderList });
  });

  // Admin: Create Order
  app.post('/api/orders', async (req, res) => {
    const body = req.body;
    
    // Generate random order number if not provided
    const orderNum = body.orderNumber || `ORD-${Math.floor(Math.random() * 100000)}`;
    const trackNum = body.trackingNumber || `TRK-${Math.floor(Math.random() * 100000)}`;

    const result = await db.insert(orders).values({
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

    res.json({ data: result[0] });
  });

  // Admin: Update Order Status and Info
  app.put('/api/orders/:id', async (req, res) => {
    const id = parseInt(req.params.id);
    const body = req.body;
    
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
      await db.update(orders)
        .set(updateData)
        .where(eq(orders.id, id));
    }
      
    res.json({ success: true });
  });

  // Admin: Add Tracking Event
  app.post('/api/orders/:id/events', async (req, res) => {
    const id = parseInt(req.params.id);
    const body = req.body;
    
    const result = await db.insert(trackingEvents).values({
      orderId: id,
      packageId: 0, 
      date: body.date ? new Date(body.date) : new Date(),
      location: body.location,
      description: body.description
    }).returning();

    // Optionally update order status
    if (body.updateStatus) {
      await db.update(orders)
        .set({ status: body.updateStatus })
        .where(eq(orders.id, id));
    }

    res.json({ data: result[0] });
  });

  return httpServer;
}
