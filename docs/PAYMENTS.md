# Payments

Checkout never talks to PhonePe from the browser. The browser calls GraphQL `checkout`; the **application** calls a `PaymentGateway` port.

## Adapters

| Adapter | When | What the customer sees |
|---------|------|------------------------|
| `PhonePeGateway` | `PHONEPE_CLIENT_ID` + `PHONEPE_CLIENT_SECRET` set | Official PhonePe Standard Checkout (UPI, PhonePe, cards) |
| `SandboxGateway` | credentials missing (default) | In-app `/pay/sandbox` — simulate PhonePe or a card form |

Orders become `PAID` only after `confirmPayment` → `gateway.getStatus()` returns `COMPLETED`. The redirect is not trusted alone.

## Sandbox card

- Any 16-digit number succeeds except one ending in `0002` (forced failure).  
- Completing sandbox calls `POST /api/pay/sandbox/complete`, then the return page runs `confirmPayment`.

## PhonePe go-live

1. Create a merchant on [PhonePe Business](https://developer.phonepe.com/).  
2. Set `PHONEPE_CLIENT_ID`, `PHONEPE_CLIENT_SECRET`, `PHONEPE_CLIENT_VERSION`, `PHONEPE_ENV=SANDBOX` then `PRODUCTION`.  
3. Amount is already paise.  
4. `APP_URL` must be the public HTTPS origin so redirect URLs work.

## Port to implement next

`PaymentGateway.createCheckout` + `getStatus`. A Razorpay or Stripe adapter is a new file, not a rewrite of checkout.
