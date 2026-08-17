# Free deploy — Render + MongoDB Atlas

Same shape as previous projects: **one Docker web service on Render Free**, database on a free cloud tier (Atlas instead of Neon).

## 1. Atlas

Create an M0 cluster. Put the SRV URI in `MONGODB_URI`.

## 2. GitHub

Push this repo. Render Blueprint (`render.yaml`) names the service `boutique-market`.

## 3. Render

- Runtime: Docker (from `Dockerfile`)  
- Health check: `/healthz`  
- Plan: Free (Oregon, or your usual region)  
- Env vars (dashboard, do not commit):

| Key | Example |
|-----|---------|
| `MONGODB_URI` | `mongodb+srv://…` |
| `JWT_SECRET` | long random string |
| `ADMIN_EMAIL` | your email |
| `ADMIN_PASSWORD` | 8+ chars |
| `APP_URL` | `https://boutique-market.onrender.com` |
| `SEED_DEMO` | `1` for the sample catalog |
| `STORE_NAME` | optional override |

PhonePe keys are optional. Without them, sandbox checkout still works on the live URL.

## 4. Custom domain

Same Cloudflare / Render custom-domain dance as `ruhitrends.com` / muralitransport: add the domain on the service, CNAME the host to `*.onrender.com`, set `APP_URL` to https.

## Local Docker

```bash
docker compose up --build
# http://localhost:4000
```
