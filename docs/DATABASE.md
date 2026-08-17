# Database

MongoDB is the system of record. Locally: Docker Compose. Production: **MongoDB Atlas M0 free** — same role Neon Postgres played on earlier Render projects.

## Local

```bash
docker compose up -d mongo
# MONGODB_URI=mongodb://127.0.0.1:27017/boutique_market
```

## Atlas (production)

1. Create a free M0 cluster.  
2. Database user + password.  
3. Network access: allow Render outbound (or `0.0.0.0/0` on a throwaway demo).  
4. Connection string → Render env `MONGODB_URI` (SRV URI).

## Collections

| Collection | Notes |
|------------|--------|
| `stores` | Singleton `key: default` — white-label branding |
| `users` | Unique email, `CUSTOMER` \| `ADMIN` |
| `products` | Slug unique, text index on title/description |
| `carts` | One per userId |
| `orders` | Unique `payment.merchantOrderId` |
| `media` | Uploaded images as BSON binary |

## Seed

On boot, `seedIfNeeded()`:

- Ensures the admin user from `ADMIN_EMAIL` / `ADMIN_PASSWORD`  
- Writes store settings (demo Ruhi branding only if `SEED_DEMO=1` and the store is still the default)  
- Inserts sample sarees/blouses if the catalog is empty and `SEED_DEMO=1`
