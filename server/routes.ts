import type { Express } from "express";
import type { Server } from "http";
import { db } from "./db";
import { devices, orders, trackingEvents, appUsers, assets } from "@shared/schema";
import { eq, desc, or, and } from "drizzle-orm";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {

  // Seed initial data if database is empty
  const deviceCount = await db.select().from(devices);
  if (deviceCount.length === 0) {
    const [macbook] = await db.insert(devices).values({
      name: "MacBook Pro 14-inch",
      model: "M3 Pro",
      description: "Supercharged by M3 Pro",
      color: "Space Black",
      storage: "512GB",
      price: "From RM 9,999",
      quantity: 10
    }).returning();

    const [order] = await db.insert(orders).values({
      orderNumber: "ORD-77821",
      trackingNumber: "TRK-99012",
      deviceId: macbook.id,
      customerName: "John Doe",
      customerEmail: "john@example.com",
      shippingAddress: "123 Apple St, Tech City",
      status: "processing"
    }).returning();

    await db.insert(trackingEvents).values({
      orderId: order.id,
      location: "Shah Alam Warehouse",
      description: "Order processed and ready for packing",
      date: new Date()
    });
  }

  // ============================================
  // PUBLIC ENDPOINTS
  // ============================================

  app.get('/api/public/devices', async (req, res) => {
    const deviceList = await db.select().from(devices);
    res.json({ data: deviceList });
  });

  app.post('/api/public/order-access', async (req, res) => {
    const { email, reference } = req.body;
    if (!email || !reference) {
      return res.status(400).json({ error: 'Email and Order/Tracking Number are required' });
    }

    const orderList = await db.select()
      .from(orders)
      .where(and(
        eq(orders.customerEmail, email),
        or(eq(orders.orderNumber, reference), eq(orders.trackingNumber, reference))
      ))
      .limit(1);

    const order = orderList[0];
    if (!order) return res.status(401).json({ error: 'Order not found' });

    let device = null;
    if (order.deviceId) {
      const deviceList = await db.select().from(devices).where(eq(devices.id, order.deviceId)).limit(1);
      device = deviceList[0];
    }

    const events = await db.select().from(trackingEvents).where(eq(trackingEvents.orderId, order.id)).orderBy(desc(trackingEvents.date));
    
    res.json({ order: { ...order, device }, timeline: events });
  });

  // ============================================
  // ADMIN & USER ENDPOINTS
  // ============================================
  
  app.post('/api/users/sync', (req, res) => {
    res.json({ user: { id: 1, role: 'admin', name: 'Admin User' } });
  });

  app.get('/api/users', async (req, res) => {
    const userList = await db.select().from(appUsers);
    res.json({ data: userList });
  });

  app.get('/api/devices', async (req, res) => {
    const deviceList = await db.select().from(devices);
    res.json({ data: deviceList });
  });

  app.post('/api/devices', async (req, res) => {
    const [result] = await db.insert(devices).values(req.body).returning();
    res.json({ data: result });
  });

  app.put('/api/devices/:id', async (req, res) => {
    const [result] = await db.update(devices).set(req.body).where(eq(devices.id, parseInt(req.params.id))).returning();
    res.json({ data: result });
  });

  app.get('/api/orders', async (req, res) => {
    const orderList = await db.select().from(orders).orderBy(desc(orders.createdAt));
    res.json({ data: orderList });
  });

  app.post('/api/orders', async (req, res) => {
    const body = req.body;
    const orderNum = body.orderNumber || `ORD-${Math.floor(Math.random() * 100000)}`;
    const trackNum = body.trackingNumber || `TRK-${Math.floor(Math.random() * 100000)}`;
    const [result] = await db.insert(orders).values({ ...body, orderNumber: orderNum, trackingNumber: trackNum }).returning();
    res.json({ data: result });
  });

  app.put('/api/orders/:id', async (req, res) => {
    const [result] = await db.update(orders).set({ ...req.body, updatedAt: new Date() }).where(eq(orders.id, parseInt(req.params.id))).returning();
    res.json({ success: true, data: result });
  });

  app.post('/api/orders/:id/events', async (req, res) => {
    const id = parseInt(req.params.id);
    const [event] = await db.insert(trackingEvents).values({
      orderId: id,
      date: req.body.date ? new Date(req.body.date) : new Date(),
      location: req.body.location,
      description: req.body.description
    }).returning();

    if (req.body.updateStatus) {
      await db.update(orders).set({ status: req.body.updateStatus, updatedAt: new Date() }).where(eq(orders.id, id));
    }
    res.json({ data: event });
  });

  app.get('/api/assets', async (req, res) => {
    const assetList = await db.select().from(assets).orderBy(desc(assets.uploadedAt));
    res.json({ data: assetList });
  });

  return httpServer;
}
