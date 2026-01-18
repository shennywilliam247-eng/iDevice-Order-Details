import { pgTable, text, serial, timestamp, boolean, jsonb, integer, real } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { relations } from "drizzle-orm";

// === Devices ===
export const devices = pgTable("devices", {
  id: serial("id").primaryKey(),
  model: text("model"),
  name: text("name").notNull(),
  description: text("description"),
  color: text("color"),
  storage: text("storage"),
  price: text("price"),
  imageUrl: text("image_url"),
  quantity: integer("quantity").default(1),
  createdAt: timestamp("created_at").defaultNow(),
});

// === Users (App Users) ===
export const appUsers = pgTable("app_users", {
  id: serial("id").primaryKey(),
  authId: text("auth_id"), // Link to Replit Auth or external
  email: text("email"),
  name: text("name"),
  role: text("role").default("user"), // 'admin', 'user'
  createdAt: timestamp("created_at").defaultNow(),
});

// === Orders ===
export const orders = pgTable("orders", {
  id: serial("id").primaryKey(),
  orderNumber: text("order_number").notNull().unique(),
  trackingNumber: text("tracking_number").unique(),
  deviceId: integer("device_id").references(() => devices.id),
  userId: integer("user_id").references(() => appUsers.id),
  customerName: text("customer_name"),
  customerEmail: text("customer_email"),
  shippingAddress: text("shipping_address"),
  waybill: text("waybill"),
  packageDimensions: text("package_dimensions"),
  senderInfo: jsonb("sender_info"),
  receiverInfo: jsonb("receiver_info"),
  status: text("status").default("processing"), // processing, shipped, delivered
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// === Tracking Events ===
export const trackingEvents = pgTable("tracking_events", {
  id: serial("id").primaryKey(),
  orderId: integer("order_id").references(() => orders.id).notNull(),
  packageId: integer("package_id").default(0),
  date: timestamp("date"),
  location: text("location"),
  description: text("description"),
  createdAt: timestamp("created_at").defaultNow(),
});

// === Assets ===
export const assets = pgTable("assets", {
  id: serial("id").primaryKey(),
  filename: text("filename").notNull(),
  url: text("url").notNull(),
  size: integer("size"),
  mimeType: text("mime_type"),
  uploadedAt: timestamp("uploaded_at").defaultNow(),
});

// === Relations ===
export const ordersRelations = relations(orders, ({ one, many }) => ({
  device: one(devices, {
    fields: [orders.deviceId],
    references: [devices.id],
  }),
  user: one(appUsers, {
    fields: [orders.userId],
    references: [appUsers.id],
  }),
  events: many(trackingEvents),
}));

export const trackingEventsRelations = relations(trackingEvents, ({ one }) => ({
  order: one(orders, {
    fields: [trackingEvents.orderId],
    references: [orders.id],
  }),
}));

// === Schemas ===
export const insertDeviceSchema = createInsertSchema(devices).omit({ id: true, createdAt: true });
export const insertOrderSchema = createInsertSchema(orders).omit({ id: true, createdAt: true, updatedAt: true });
export const insertTrackingEventSchema = createInsertSchema(trackingEvents).omit({ id: true, createdAt: true });
export const insertAppUserSchema = createInsertSchema(appUsers).omit({ id: true, createdAt: true });
export const insertAssetSchema = createInsertSchema(assets).omit({ id: true, uploadedAt: true });

export type Device = typeof devices.$inferSelect;
export type Order = typeof orders.$inferSelect;
export type TrackingEvent = typeof trackingEvents.$inferSelect;
export type AppUser = typeof appUsers.$inferSelect;
export type Asset = typeof assets.$inferSelect;
