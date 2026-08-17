export type DocSection = {
  id: string
  title: string
  body: string
}

export const DOC_SECTIONS: DocSection[] = [
  {
    id: 'start',
    title: 'How to use this guide',
    body: `This page is the study map for Boutique Market — a white-label shop built so you can become fluent in **React, TypeScript, Node.js, GraphQL, and MongoDB**.

Read it top to bottom once. Then drill the code paths named in each section. The shop at \`/\` is the running product; this guide is the why.

**Local:** http://localhost:5177/docs  
**OpenAPI:** [/openapi.yaml](/openapi.yaml) (import into Postman or Stoplight)  
**GraphQL sandbox:** http://localhost:4000/graphql

Demo shopper \`customer@example.com\` / \`ChangeMe!shop\`  
Demo admin \`admin@example.com\` / \`ChangeMe!admin\``,
  },
  {
    id: 'stack',
    title: 'Tech stack',
    body: `| Layer | Choice | Why this, in interviews |
|-------|--------|-------------------------|
| Language | TypeScript (strict-ish, shared types) | One language, browser and server |
| Web | React 19, Vite, React Router | SPA, fast HMR, client routing |
| API | Node 22, Express 4 | HTTP surface, static SPA, uploads |
| GraphQL | Apollo Server 4 + Apollo Client | Typed operations, one round-trip for the bag |
| DB | MongoDB (Mongoose) or in-memory | Document model for products/images; Atlas on Render |
| Auth | JWT + bcrypt | Stateless API, hashed passwords |
| Pay | \`PaymentGateway\` port → PhonePe PG or sandbox | Never couple checkout to a vendor |
| Host | Docker on Render Free | Same pattern as earlier sites (Neon → Atlas) |

**Monorepo**

- \`apps/web\` — storefront
- \`apps/api\` — GraphQL + REST
- \`packages/shared\` — money, categories, store shape (imported by both)

Tip: if you say “we share types so the price cannot be rupees on the client and paise on the server,” that is a senior answer.`,
  },
  {
    id: 'architecture',
    title: 'Clean architecture (main logic)',
    body: `Dependencies point **inward**. Domain does not import Express, Mongoose, or Apollo.

| Layer | Path | Knows about |
|-------|------|-------------|
| Domain | \`apps/api/src/domain\` | Entities, invariants, repository *interfaces* |
| Application | \`apps/api/src/application\` | Use cases + ports (\`PaymentGateway\`, \`TokenService\`, \`ImageStore\`) |
| Infrastructure | \`apps/api/src/infrastructure\` | Mongo, JWT, PhonePe, GraphQL resolvers, Express |
| Composition | \`apps/api/src/composition.ts\` | Wires ports to adapters (cached singleton) |

**Request path (checkout)**

1. React \`checkout\` mutation → \`POST /graphql\`
2. Resolver (thin) → \`CheckoutUseCases.checkout\`
3. Validate cart, stock, shipping (zod)
4. Insert order \`PENDING_PAYMENT\`
5. \`PaymentGateway.createCheckout\` → redirect URL
6. Customer pays (PhonePe or \`/pay/sandbox\`)
7. \`confirmPayment\` → \`gateway.getStatus()\` **must** be \`COMPLETED\`
8. \`markPaid\`, decrement stock, clear cart

Tip: “GraphQL is a delivery mechanism, not the business.” If a rule lives in a resolver, move it to a use case.

Read: \`docs/ARCHITECTURE.md\`, \`checkout.ts\`, \`resolvers.ts\`.`,
  },
  {
    id: 'graphql',
    title: 'GraphQL operations',
    body: `Endpoint: \`POST /graphql\`. Vite proxies it in dev. Send JWT as \`Authorization: Bearer\`.

### Public queries
\`\`\`graphql
query {
  store { storeName tagline logoUrl accentColor city }
  products(category: SAREE, featured: true) {
    total items { slug title priceInPaise images { url } }
  }
  product(slug: "banarasi-silk-saree-gold") { title stock sizes }
}
\`\`\`

\`store\` is how the UI brands itself. Never hardcode a boutique name.

### Auth
\`\`\`graphql
mutation {
  login(input: { email: "customer@example.com", password: "ChangeMe!shop" }) {
    token
    user { id role }
  }
}
\`\`\`

### Bag → pay
\`\`\`graphql
mutation {
  addToCart(productId: "…", quantity: 1, size: "36") { subtotalPaise }
  checkout(input: {
    method: PHONEPE
    shipping: { name: "Asha", phone: "9908185597", line1: "LIG-140", city: "Hyderabad", state: "TS", pin: "500072" }
  }) { redirectUrl order { id payment { merchantOrderId } } }
  confirmPayment(merchantOrderId: "BM…") { status }
}
\`\`\`

### Admin
Requires \`role: ADMIN\`: \`createProduct\`, \`updateProduct\`, \`deleteProduct\`, \`updateStore\`, \`adminOrders\`, \`updateOrderStatus\`.

Errors: \`errors[].extensions.code\` — \`UNAUTHORIZED\`, \`FORBIDDEN\`, \`NOT_FOUND\`, \`OUT_OF_STOCK\`, \`EMPTY_CART\`, \`CONFLICT\`. HTTP status is often still 200 (GraphQL convention).`,
  },
  {
    id: 'rest',
    title: 'REST endpoints & OpenAPI',
    body: `GraphQL is the product API. REST is the awkward stuff GraphQL is bad at (bytes, multipart, probes).

| Method | Path | Auth | What |
|--------|------|------|------|
| GET | \`/healthz\` | no | \`{ ok, service }\` — Render health |
| GET | \`/openapi.yaml\` | no | This spec |
| POST | \`/graphql\` | optional Bearer | All queries/mutations |
| POST | \`/api/uploads\` | admin JWT | Multipart \`file\` → \`{ id, url }\` |
| GET | \`/api/media/:id\` | no | Image bytes |
| POST | \`/api/pay/sandbox/complete\` | no | Record sandbox success/fail |

Download the spec: [openapi.yaml](/openapi.yaml)

Import it in Postman: **Import → File**. You get Health, GraphQL examples, Media, Payments.

Tip: when someone asks “why not REST for the catalog?” — “The bag, user, and store branding load together; GraphQL matches the UI. Uploads stay REST because multipart + GraphQL is extra machinery.”`,
  },
  {
    id: 'auth',
    title: 'Auth & JWT',
    body: `- Passwords hashed with **bcrypt** (cost 12) in \`AuthUseCases\`. Never stored or logged in plain text.
- \`login\` / \`register\` return a JWT from \`JwtTokenService\` (\`sub\`, \`email\`, \`role\`).
- Apollo Client reads \`localStorage.bm_token\` and sets the header (\`apps/web/src/apollo.ts\`).
- GraphQL context (\`context.ts\`) verifies the token and loads the user **once per request**.
- \`myCart\` / \`checkout\` throw \`UNAUTHORIZED\` if there is no user.
- Admin catalog and \`POST /api/uploads\` check \`role === ADMIN\`.

Tip: auth belongs on the **context**, not copied into every resolver. Resolvers ask \`ctx.user\`.`,
  },
  {
    id: 'payments',
    title: 'Payments (PhonePe + card)',
    body: `Checkout **never** talks to PhonePe from the browser.

| Adapter | When | Customer sees |
|---------|------|----------------|
| \`PhonePeGateway\` | \`PHONEPE_CLIENT_ID\` + secret set | Official Standard Checkout (UPI, PhonePe, cards) |
| \`SandboxGateway\` | default | In-app \`/pay/sandbox\` |

**Hard rule:** order becomes \`PAID\` only after \`confirmPayment\` → \`getStatus() === COMPLETED\`. The redirect is not trusted.

Sandbox card: any 16 digits succeed except \`…0002\` (forced fail). That posts \`POST /api/pay/sandbox/complete\`, then \`/pay/return\` runs \`confirmPayment\`.

Amount is already paise. PhonePe wants paise. Shared \`Money\` type keeps that honest.

Drill: draw the sequence from “Continue to pay” to \`PAID\` without looking, then read \`checkout.ts\` and \`docs/PAYMENTS.md\`.

Next adapter (interview story): implement \`PaymentGateway\` for Razorpay. Do not touch resolvers.`,
  },
  {
    id: 'data',
    title: 'MongoDB & money',
    body: `Collections: \`stores\`, \`users\`, \`products\`, \`carts\`, \`orders\`, plus image blobs.

Locally, if Docker/Mongo is down, \`USE_MEMORY_DB=1\` (or empty \`MONGODB_URI\`) uses in-memory adapters so you can still click the shop. Data resets on process restart. Atlas M0 is the Render equivalent of Neon on earlier projects.

**Money:** integer paise in \`packages/shared/src/money.ts\`. \`formatINR\` is display-only in the web app.

**Stock:** \`assertCanFulfill\` at add-to-cart and checkout; decrement only after paid. A good drill is to reserve stock at checkout instead — keep resolvers untouched.

Tip: “We test use cases against in-memory fakes (\`apps/api/tests/fakes.ts\`), not against Mongo.” That is how you test rules, not the driver.`,
  },
  {
    id: 'frontend',
    title: 'React + Apollo',
    body: `| Piece | File | Job |
|-------|------|-----|
| Apollo client | \`apollo.ts\` | HTTP + auth link + cache |
| Store branding | \`store.tsx\` | \`store\` query → CSS \`--accent\`, document title |
| Auth / bag count | \`auth.tsx\` | \`me\` + \`myCart\` |
| Catalog | \`ShopPage\`, \`ProductCard\` | Filters, hover image |
| PDP | \`ProductPage\` | Size pills, add to bag |
| Bag / pay | \`CartPage\`, \`CheckoutPage\` | Summary column, PhonePe or card |

After \`addToCart\`, bag count updates via \`refetchQueries: ['Me']\`. A pro drill is to replace that with a cache \`update\` function.

White-label: components read \`useStore().storeName\`. Seed may use Ruhi’s Boutique as **demo data only**.`,
  },
  {
    id: 'files',
    title: 'File map',
    body: `\`\`\`
apps/api/src/domain/           entities + repository ports
apps/api/src/application/      use cases + PaymentGateway
apps/api/src/infrastructure/   mongo, graphql, http, phonepe, sandbox
apps/api/src/composition.ts    DI root
apps/web/src/pages/            routes
apps/web/src/graphql/          operations.ts (gql documents)
packages/shared/src/           money, catalog, store
openapi/openapi.yaml           OpenAPI 3.1
docs/                          markdown twin of this page
\`\`\``,
  },
  {
    id: 'tips',
    title: 'Interview tips & drills',
    body: `**Sentences worth rehearsing**

- “Checkout does not know PhonePe. It knows a port. Sandbox and PhonePe are adapters.”
- “We mark paid only after a server status check, never because the browser came back.”
- “Money is paise. Float rupees are a production incident.”
- “Resolvers are transport. Use cases are the product.”
- “Branding is a document, so any boutique can deploy this.”

**Drills** (also in \`docs/LEARNING.md\`)

1. Add \`Money.subtract\` that throws if negative + a vitest.
2. Explain aloud why \`markPaid\` does not call Mongoose.
3. Reserve stock at checkout, not only after pay — resolvers untouched.
4. Stub \`RazorpayGateway\` behind \`PAY_PROVIDER\`.
5. Add \`product.related(limit)\` in the catalog use case.
6. Replace \`refetchQueries\` with an Apollo cache update.
7. Add \`changePassword\` (bcrypt in the use case).
8. Add a Mongo index \`{ category: 1, featured: 1, createdAt: -1 }\` and justify it.

**Habits**

Business rules in use cases. Tests against fakes. Thin resolvers. No secrets in git.`,
  },
]
