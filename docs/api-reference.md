# API reference

The living guide is in the app: **[/docs](https://boutique-market-k7m7.onrender.com/docs)** (local: http://localhost:5177/docs).

Machine-readable contract: [`openapi/openapi.yaml`](../openapi/openapi.yaml) — served at `/openapi.yaml`.

Import that file into Postman or any OpenAPI viewer.

## Surface

| Method | Path | Role |
|--------|------|------|
| GET | `/healthz` | Liveness |
| GET | `/openapi.yaml` | This spec |
| POST | `/graphql` | Catalog, auth, cart, checkout, admin |
| POST | `/api/uploads` | Admin image (multipart `file`) |
| GET | `/api/media/:id` | Public image bytes |
| POST | `/api/pay/sandbox/complete` | Sandbox payment result |

GraphQL operations, examples, error codes, and schemas live in the OpenAPI file under `POST /graphql` and `components.schemas`.
