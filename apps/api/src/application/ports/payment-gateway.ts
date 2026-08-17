import type { PaymentMethod, PaymentState } from '@boutique-market/shared'

export type CreateCheckoutInput = {
  merchantOrderId: string
  amountPaise: number
  method: PaymentMethod
  redirectUrl: string
}

export type CheckoutSession = {
  merchantOrderId: string
  redirectUrl: string
  provider: 'PHONEPE' | 'SANDBOX'
}

export type PaymentStatus = {
  merchantOrderId: string
  state: PaymentState
}

export interface PaymentGateway {
  readonly provider: 'PHONEPE' | 'SANDBOX'
  createCheckout(input: CreateCheckoutInput): Promise<CheckoutSession>
  getStatus(merchantOrderId: string): Promise<PaymentStatus>
}
