# Learning path — become a pro on this stack

This repo is a study gym, not a tutorial dump. Work **in this order**. Each step names the files to read, then a drill to do yourself.

## 1. TypeScript that cannot lie

Read `packages/shared/src/money.ts` and `packages/shared/src/catalog.ts`.

**Drill:** Add a `Money.subtract` that throws if the result would be negative. Write a vitest case in `apps/api/tests`.

Why: production commerce bugs are almost always money and stock, not CSS.

## 2. Domain vs infrastructure

Read `apps/api/src/domain/entities/order.ts` then `apps/api/src/infrastructure/mongodb/repositories.ts`.

**Drill:** Explain (aloud) why `markPaid` does not call Mongoose. If you cannot, read `docs/ARCHITECTURE.md` again.

## 3. Use cases are the product

Read `apps/api/src/application/use-cases/checkout.ts`.

**Drill:** Change the rule so stock is reserved at checkout (not only after pay). Keep resolvers untouched.

## 4. Ports and adapters

Read `apps/api/src/application/ports/payment-gateway.ts`, `sandbox-gateway.ts`, `phonepe-gateway.ts`.

**Drill:** Add a `RazorpayGateway` stub that implements the same port. Wire it in `createPaymentGateway()` behind `PAY_PROVIDER=RAZORPAY`.

This is the interview story: “we never couple checkout to a vendor.”

## 5. GraphQL as an API, not a database

Read `apps/api/src/infrastructure/graphql/schema.ts` and `resolvers.ts`.

**Drill:** Add `product.related(limit: Int)` that returns same-category pieces. Implement it in `CatalogUseCases`, not with a Mongo query inside the resolver.

Then read `docs/GRAPHQL.md` and run queries in Apollo Sandbox at `/graphql`.

## 6. Apollo Client cache

Read `apps/web/src/apollo.ts` and `apps/web/src/pages/CartPage.tsx`.

**Drill:** After `addToCart`, the bag count updates because of `refetchQueries: ['Me']`. Replace that with a cache update (`update` function) so you stop refetching the world.

## 7. Auth on the context

Read `apps/api/src/infrastructure/graphql/context.ts` and `apps/web/src/auth.tsx`.

**Drill:** Add a `changePassword` mutation. Hash in the use case with bcrypt. Never log the password.

## 8. MongoDB modeling

Read `docs/DATABASE.md` and `models.ts`.

**Drill:** Add an index you would want in production (e.g. `{ category: 1, featured: 1, createdAt: -1 }`) and justify it.

## 9. Payments without lying to yourself

Read `docs/PAYMENTS.md`. Run a sandbox PhonePe pay and a card pay. Then a failure (card `...0002`).

**Drill:** Write the sequence diagram from “Continue to pay” to `PAID` without looking. Then check the code.

## 10. Deploy like a grown-up

Read `docs/DEPLOY-FREE.md` and `Dockerfile`.

**Drill:** Change a GraphQL field, push, watch Render health (`/healthz`) and confirm Atlas still has store settings.

## Habits that separate juniors from pros

- Business rules in use cases; resolvers stay thin.  
- Money as integers.  
- Payment success only after a **server-side** status check.  
- Branding as data.  
- Tests against in-memory fakes (`apps/api/tests/fakes.ts`) so you test rules, not Mongo.
