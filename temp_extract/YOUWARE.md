# Gadget Order Tracking System

## Project Overview
A gadget order tracking system for managing Apple device orders with real-time package tracking.

## Technology Stack
- **Frontend**: Vanilla JS + Vite
- **Backend**: Youbase (Hono + Drizzle ORM)
- **Database**: D1 (SQLite)
- **Storage**: R2 (Bucket: `assets`)
- **Auth**: Built-in Youbase auth

## Backend URL
- Staging: `https://staging--lujlgtmiqfc8uzc6ury0.youbase.cloud`

## Database Schema
- **devices**: Product catalog
- **orders**: Customer orders (linked to `app_users` via `user_id`)
- **tracking_events**: Delivery tracking timeline
- **app_users**: User roles and metadata (synced with Auth)
- **assets**: File metadata (linked to Storage)

## Pages
- `index.html`: Landing page with device catalog and tracking search (Modern Design)
- `tracking.html`: Order tracking results page (Live updates)
- `admin.html`: Admin panel (requires login) for managing:
  - Orders
  - Devices
  - Users (Role management, Order linking)
  - Assets (File upload/management)

## API Endpoints
- **Public**:
  - `GET /api/public/devices`
  - `POST /api/public/order-access`
- **Protected (Admin/User)**:
  - `POST /api/users/sync` - Sync user on login
  - `POST /api/users/link-order` - Link order to user
- **Protected (Admin Only)**:
  - `GET /api/users` - List users
  - `PUT /api/users/:id/role` - Update role
  - `POST /api/assets/upload` - Upload file
  - `GET /api/assets` - List files
  - `DELETE /api/assets/:id` - Delete file
  - `GET/POST /api/devices` - Manage devices
  - `GET/POST/PUT /api/orders` - Manage orders
  - `POST /api/orders/:id/events` - Add tracking event

## Assets
- Stored in R2 bucket `assets`
- Managed via Admin Panel > Assets

## Design System
- **Theme**: Modern Apple Education Store (Minimalist, Premium)
- **Typography**: Inter (Large headings, tight tracking)
- **Colors**: White, Soft Gray (#f5f5f7), Apple Blue (#0071e3)
- **Animations**: Fade-in up, smooth transitions, glassmorphism header
