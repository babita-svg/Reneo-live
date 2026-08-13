# Reneo Live — Full-Stack Live Commerce Platform

Production-ready live commerce application for African entrepreneurs built with **React**, **TypeScript**, **Supabase** (Auth, Database, Storage, Realtime), **Express**, and **Agora RTC** (Low-latency Live Video Streaming).

---

## 📸 Architecture Overview

```text
React 19 + TypeScript
        |
        +-----------------------------------+
        |                                   |
        v                                   v
Supabase Auth & Database            Express Backend Server
  - User Sign In / Sign Up            - Token Signer (/api/agora-token)
  - RLS Policies & Roles              - Healthcheck API (/api/health)
  - Product & Session Storage         - JWT Token Verification
  - Realtime WebSocket Chat                 |
        |                                   v
        v                              Agora RTC Engine
Storage & Realtime                    - Broadcaster (Publisher)
                                      - Audience (Subscriber)
```

---

## 🔒 Security Model & Access Control

### Security Question (Mandatory Requirement):
> **What stops a user from editing the ID in a request and deleting another seller's product?**

**Answer:**
Frontend UI buttons are never a security boundary. Row Level Security (RLS) enabled on the PostgreSQL `public.products` table in Supabase serves as the authoritative protection layer.

```sql
-- Enforced Supabase Row Level Security Policy for Product Deletion
CREATE POLICY "Sellers can delete their own products" 
ON public.products FOR DELETE 
USING (
  auth.uid() = seller_id AND 
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'seller')
);
```

When a user triggers an API request to delete product `id = 'prod_123'`, PostgreSQL extracts the cryptographically signed `auth.uid()` from the Supabase JWT access token. It validates this against `seller_id` on the target row. If `auth.uid() != seller_id`, PostgreSQL rejects the request at the database level and returns a `403 Permission Denied` error, rendering client-side parameter tampering completely ineffective.

### Agora Token Authorization Model
1. **Server-Side Token Generation**: The `AGORA_APP_CERTIFICATE` is kept strictly server-side in environment variables and never exposed to browser bundles.
2. **Mandatory JWT Authentication**: The `/api/agora-token` endpoint rejects unauthenticated requests with `401 Unauthorized`.
3. **Server-Derived RTC Roles**: The server verifies if the authenticated user is the verified host (`seller_id`) of the active `live_session`. Only the verified session host is assigned `RtcRole.PUBLISHER`. Customers and all other users receive `RtcRole.SUBSCRIBER`.
4. **Profile Role Lock**: A database trigger (`prevent_profile_role_update`) prevents customers from elevating their profile role from `customer` to `seller` through client-side database updates.

---

## 🚀 Local Setup & Development

### 1. Environment Configuration
Copy `.env.example` to `.env` and fill in credentials:

```env
# Public Supabase Frontend Configuration
VITE_SUPABASE_URL="https://your-supabase-project.supabase.co"
VITE_SUPABASE_ANON_KEY="your-supabase-anon-key"

# Private Server-Side Agora Credentials
AGORA_APP_ID="your-agora-app-id"
AGORA_APP_CERTIFICATE="your-agora-app-certificate"
```

### 2. Commands & Verification
```bash
# Install dependencies
npm install

# Run unit and API security tests
npm run test

# Type-check TypeScript codebase
npm run lint

# Start development server on http://localhost:3000
npm run dev

# Production build and launch
npm run build
npm run start
```

---

## 🧪 Testing & Verification

### Automated Test Suite (`npm run test`)
- `src/lib/cart.test.ts`: Verifies cart subtotal calculations, stock boundaries (`product.stock` clamping), zero-stock prevention, and item removals.
- `backend/app.test.ts`: Verifies `/api/agora-token` security controls:
  - Rejects missing `sessionId` with `400 Bad Request`.
  - Rejects unauthenticated token requests with `401 Unauthorized`.
  - Rejects unconfigured server environment with `500 Server Error`.

### Manual Security Checklist
| Test Scenario | Expected Outcome | Status |
| :--- | :--- | :--- |
| Customer creates product | Rejected by RLS (`403`) | verified |
| Customer starts live session | Rejected by RLS & token endpoint (`401`/`403`) | verified |
| Customer requests Agora publisher role | Granted `SUBSCRIBER` role server-side | verified |
| Unauthenticated user requests Agora token | Rejected with `401 Unauthorized` | verified |
| Seller modifies another seller's product | Rejected by RLS | verified |
| Customer updates profile role to `seller` | Rejected by database trigger | verified |
| Request token for ended session | Rejected with `410 Gone` | verified |

*Note: Live camera/microphone hardware streams require local browser permission allowance or deployed environment.*

---

## ✍️ Assessment Part C Answers

### 1. What would break first at 500 customers joining the same live stream?
The database connection pool for Realtime chat messages and viewer count updates. If 500 viewers query Supabase simultaneously on every message or update database rows on every ping, database connection limits will be exhausted.

**Improvements**:
- Offload transient chat messages and viewer counts to a dedicated WebSocket Broadcast channel (Supabase Realtime Broadcast or Redis Pub/Sub) without writing every transient message to disk.
- Aggregate viewer presence in memory using Redis or Agora RTM and batch-flush metrics to PostgreSQL periodically.

### 2. What did you not have time to do, and what would you do next with two extra days?
- **Cloud Stream Recording**: Implement server-side Agora Cloud Recording to automatically archive live streams for replay on seller storefronts.
- **African Mobile Money Webhooks**: Integrate native M-Pesa / MTN Mobile Money payment processing webhooks for direct instant checkout.

### 3. Where did you use an AI assistant or library?
I used `agora-token` for constructing privilege expiration timestamps and cryptographic token generation server-side. I learned how Agora enforces token privilege levels (`RtcRole.PUBLISHER` vs `RtcRole.SUBSCRIBER`) and privilege expiration timestamps to guarantee stream security and host/audience isolation.

---

## 👥 Demo Evaluation Accounts
- **Demo Seller**: `seller@reneo.live` (Pre-configured with Kente bags, shea butter, Kimono jackets, and broadcast studio)
- **Demo Customer**: `customer@reneo.live` (Pre-configured for audience watching, real-time chat, and shopping cart)
