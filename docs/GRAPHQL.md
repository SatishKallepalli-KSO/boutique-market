# GraphQL

Endpoint: `POST /graphql` (Apollo Server on Express).

In development, Vite proxies `/graphql` from port 5177 → 4000.

## Public

```graphql
query {
  store { storeName tagline accentColor logoUrl city }
  products(category: SAREE) { total items { slug title priceInPaise } }
  product(slug: "banarasi-silk-saree-gold") { title stock sizes }
}
```

`store` is how the React app brands itself. Never hardcode a boutique name in the UI.

## Auth

`register` / `login` return a JWT. Send `Authorization: Bearer <token>`.

```graphql
mutation {
  login(input: { email: "admin@example.com", password: "ChangeMe!admin" }) {
    token
    user { role }
  }
}
```

## Cart and checkout

```graphql
mutation {
  addToCart(productId: "…", quantity: 1, size: "36") { subtotalPaise }
  checkout(input: {
    method: PHONEPE
    shipping: { name: "Asha", phone: "9908185597", line1: "LIG-140", city: "Hyderabad", state: "TS", pin: "500072" }
  }) { redirectUrl order { id } }
  confirmPayment(merchantOrderId: "BM…") { status }
}
```

## Admin

Requires `role: ADMIN`.

- `createProduct` / `updateProduct` / `deleteProduct`  
- `updateStore` — white-label branding  
- `adminOrders` / `updateOrderStatus`  
- Image upload is REST: `POST /api/uploads` (multipart `file`), then pass `url` into `createProduct`.

## Errors

Domain errors become GraphQL errors with `extensions.code` (`UNAUTHORIZED`, `OUT_OF_STOCK`, `EMPTY_CART`, …).
