# Firee Marketplace — Security Notes

## Security Headers (next.config.js)
- **X-Frame-Options: DENY** — prevents clickjacking
- **X-Content-Type-Options: nosniff** — prevents MIME sniffing
- **Strict-Transport-Security** — forces HTTPS (2 years + preload)
- **Referrer-Policy: strict-origin-when-cross-origin**
- **Permissions-Policy** — blocks camera, microphone, geolocation
- **Content-Security-Policy** — whitelists only required domains

## API Protection
- `/api/notify` — requires Supabase auth + rate limited (5/min per user)

## File Upload Validation (lib/supabase/products.ts)
- **Thumbnails**: JPEG, PNG, WebP, GIF, SVG only. Max 5MB.
- **Product files**: Max 50MB. Blocked extensions: exe, bat, cmd, sh, msi, dll, com, scr, pif, vbs, js, jar.

## Download Protection
- Product files stored in **private** Supabase Storage bucket.
- Downloads use **signed URLs** (1-hour expiry).
- Download requires verified `buyer_id + product_id + status=completed` in orders table.

## Required Supabase RLS Policies

### Table: `products`
- SELECT: public (anyone can browse)
- INSERT: `auth.uid() = seller_id`
- UPDATE: `auth.uid() = seller_id`
- DELETE: `auth.uid() = seller_id`

### Table: `orders`
- SELECT: `auth.uid() = buyer_id OR auth.uid() = seller_id`
- INSERT: `auth.uid() = buyer_id`
- UPDATE: none (orders are immutable)
- DELETE: none

### Table: `reviews`
- SELECT: public
- INSERT: `auth.uid() = buyer_id`
- UPDATE: `auth.uid() = buyer_id`
- DELETE: `auth.uid() = buyer_id`

### Table: `wishlists`
- SELECT: `auth.uid() = user_id`
- INSERT: `auth.uid() = user_id`
- DELETE: `auth.uid() = user_id`

### Table: `profiles`
- SELECT: public
- UPDATE: `auth.uid() = id`

### Storage: `thumbnails` bucket
- Public read
- Upload: authenticated users only, path must start with `auth.uid()/`

### Storage: `products` bucket
- **Private** — no public read
- Upload: authenticated users only, path must start with `auth.uid()/`
- Download: via signed URL only (generated server-side after purchase verification)

## Environment Variables
- `DEPLOYER_PRIVATE_KEY` — server-only (no NEXT_PUBLIC_ prefix)
- `RESEND_API_KEY` — server-only (no NEXT_PUBLIC_ prefix)
- `.env.local` — in .gitignore, never committed
