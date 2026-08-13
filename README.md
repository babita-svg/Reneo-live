# Reneo Live — Full-Stack Live Commerce Platform

A live commerce application for solo entrepreneurs in Africa built with **React**, **TypeScript**, **Supabase** (Auth, Database, Storage, Realtime), and **Agora RTC** (Low-latency Live Video Streaming).

---

## 🌟 Context & Mission

Reneo brings commerce, content, payments, and communication into a single unified environment for African entrepreneurs. **Reneo Live** allows a seller to create a live session, present products in real-time, stream HD video, chat with viewers, and process direct shopping cart purchases without customers ever leaving the live stream.

---

## 🚀 Quick Setup & Local Development

### 1. Prerequisites & Environment Variables
Create a `.env` or set environment variables as detailed in `.env.example`:

```env
# Optional: Supabase configuration (falls back to resilient embedded store if omitted)
VITE_SUPABASE_URL="https://your-supabase-project.supabase.co"
VITE_SUPABASE_ANON_KEY="your-supabase-anon-key"

# Optional: Agora RTC configuration (server generates secure RTC tokens via /api/agora-token)
AGORA_APP_ID="your-agora-app-id"
AGORA_APP_CERTIFICATE="your-agora-app-certificate"
```

### 2. Install Dependencies & Run Server
```bash
# Start development server on Port 3000
npm run dev

# Production Build & Start
npm run build
npm run start
```

---

## 🔒 A10. Security & Access Control Review

### Question Answer (Mandatory Requirement):
> **What stops a user from editing the ID in a request and deleting another seller's product?**

**Answer:** 
Row Level Security (RLS) enabled on the PostgreSQL `public.products` table in Supabase. A hidden UI button is never an access control.

```sql
-- Enforced Supabase Row Level Security Policy
CREATE POLICY "Sellers can delete their own products" 
ON public.products FOR DELETE 
USING (auth.uid() = seller_id);
```

When an HTTP request or client API call requests deletion of product `id = 'prod_123'`, PostgreSQL evaluates the cryptographically signed JWT token's `auth.uid()` against the target row's `seller_id` column. If the authenticated user ID does not match the row's owner, PostgreSQL rejects the query and affects 0 rows, returning a permission denied error regardless of request body tampering or client-side script manipulation.

---

## 🏗️ A12. System Architecture Diagram

```
+-----------------------------------------------------------------------------------+
|                                  CLIENT LAYER                                     |
|  [ React 19 / Vite SPA / Tailwind CSS ]                                           |
|  +-----------------------------------+   +------------------------------------+  |
|  | Seller Studio (Broadcaster Role)  |   | Customer View (Audience Subscriber)|  |
|  | - Agora Publisher Track (VP8)     |   | - Non-disruptive Product Drawer    |  |
|  | - Mute / Video / Switch Controls  |   | - Realtime Chat & Floating Emoji   |  |
|  +-----------------------------------+   +------------------------------------+  |
+------------------------------------------+----------------------------------------+
                                           |
                                           v
+-----------------------------------------------------------------------------------+
|                                EXPRESS BACKEND SERVER                             |
|  - POST /api/agora-token  ==> Generates RTC tokens using Agora App Certificate     |
|  - GET  /api/health       ==> Environment & Service Status Healthcheck            |
+------------------------------------------+----------------------------------------+
                                           |
                   +-----------------------+-----------------------+
                   |                                               |
                   v                                               v
+------------------------------------+           +----------------------------------+
|           SUPABASE AUTH & DB       |           |            AGORA RTC             |
| - Profiles & Products (RLS Policies)|          | - Broadcaster / Audience Channels|
| - Live Sessions & Storage Buckets  |           | - Low-latency HD Video Broadcast |
| - Supabase Realtime WebSocket Chat |           +----------------------------------+
+------------------------------------+
```

### Architecture Choices Justification:
- **Server-Side Token Generation (`/api/agora-token`)**: Keeps `AGORA_APP_CERTIFICATE` strictly hidden from browser client bundles, satisfying security requirement A10.
- **Explicit Role Separation (`setClientRole('host')` vs `setClientRole('audience')`)**: Customers strictly subscribe to host streams and cannot publish audio/video, fulfilling requirement A5.
- **Non-Disruptive Shopping View**: Product detail drawer opens in a non-blocking glassmorphism modal so customers inspect specs without losing stream audio or video (Requirement A6).

---

## ✍️ PART C — Written Answers

### 1. Which part of this would break first if 500 customers joined the same live? What would you change?
The database read/write bottleneck for real-time chat messages and viewer count heartbeats. If 500 viewers query Supabase simultaneously on every message or update database rows on every ping, database connection pools will exhaust.
- **Mitigation**: Offload transient live chat and viewer counters to a dedicated WebSocket Broadcast channel (e.g. Supabase Realtime Broadcast or Redis Pub/Sub) without persisting every transient reaction to PostgreSQL. Aggregate viewer counts via Redis in memory and batch-flush to PostgreSQL periodically.

### 2. What did you not have time to do, and what would you do next with two more days?
Completed all Core requirements (Part A) and key Bonus features (Part B: real-time viewer count, floating emoji reactions, switching featured product on the fly without interrupting stream). With two extra days:
1. Implement server-side Agora HLS cloud recording for archived replay streams.
2. Integrate native African Mobile Money payment webhooks (M-Pesa / MTN MoMo).
3. Implement offline PWA push notification triggers when a followed seller goes live.

### 3. Where did you use a library or an AI assistant to do something you would not have been able to write yourself, and what did you learn about it afterwards?
I leveraged `agora-token` for constructing privilege expiration timestamps and cryptographic token generation server-side. I learned how Agora enforces token privilege levels (`RtcRole.PUBLISHER` vs `RtcRole.SUBSCRIBER`) and privilege expiration timestamps to guarantee stream security and host/audience isolation.

---

## 👥 Demo Evaluation Accounts

- **Demo Seller**: `seller@reneo.live` (Pre-loaded with handwoven Kente bags, shea butter, beaded necklaces, and active stream)
- **Demo Customer**: `customer@reneo.live` (Pre-configured for audience watching, real-time chat, and live cart)
