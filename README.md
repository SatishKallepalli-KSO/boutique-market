# Boutique Market

White-label e-commerce for a **single boutique**. One deployed instance is one store. The boutique name, logo, contact details, and accent color are **data** — edited in Admin or set via env — not hardcoded in the product.

**Stack:** React 19 · TypeScript · Node.js · Apollo GraphQL · MongoDB  
**Payments:** PhonePe Payment Gateway when credentials exist; otherwise a built-in sandbox (PhonePe + card) so local and Render work without merchant KYC.

Ruhi's Boutique appears only as **demo seed catalog**, so you can click through a real floor on first boot.

## Documentation

| Doc | Why read it |
|-----|-------------|
| [docs/LEARNING.md](docs/LEARNING.md) | Path to get strong at this stack, mapped to this repo |
| [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) | Clean architecture, layers, request flow |
| [docs/GRAPHQL.md](docs/GRAPHQL.md) | Schema, operations, auth on the context |
| [docs/PAYMENTS.md](docs/PAYMENTS.md) | PhonePe + sandbox card/UPI |
| [docs/DATABASE.md](docs/DATABASE.md) | MongoDB Atlas (same role Neon played on earlier projects) |
| [docs/DEPLOY-FREE.md](docs/DEPLOY-FREE.md) | Render Free Docker + Atlas |
| [docs/SECURITY.md](docs/SECURITY.md) | JWT, uploads, money as paise |

## Quick start

```bash
cp .env.example .env
docker compose up -d mongo
npm install
npm run dev
```

- Storefront: http://localhost:5177  
- GraphQL: http://localhost:4000/graphql  
- Admin (after seed): `admin@example.com` / `ChangeMe!admin`

Upload sarees or blouses from **Admin → products**, add to bag, checkout, pay with PhonePe or card.

## Brand a different boutique

1. Sign in as admin → **Admin → store**  
2. Change store name, tagline, phone, address, logo URL, accent hex  
3. Or set `STORE_NAME`, `STORE_TAGLINE`, `STORE_ACCENT` in the environment before first boot  

The React UI reads branding from the GraphQL `store` query only.

## Deploy

Same pattern as previous projects: one Render Docker web service + a free MongoDB Atlas cluster. See [docs/DEPLOY-FREE.md](docs/DEPLOY-FREE.md).

**Render:** https://boutique-market-k7m7.onrender.com  
**Dashboard:** https://dashboard.render.com/web/srv-da19cevqj5pc73cid58g  
**GitHub:** https://github.com/SatishKallepalli-KSO/boutique-market

Paste `MONGODB_URI` (Atlas M0) in the Render dashboard — same role Neon played on earlier sites — then the shop will stay up.
