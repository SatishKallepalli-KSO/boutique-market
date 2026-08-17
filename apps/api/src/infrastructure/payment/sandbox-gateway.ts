import type {
  CheckoutSession,
  CreateCheckoutInput,
  PaymentGateway,
  PaymentStatus,
} from '../../application/ports/payment-gateway.js'
import { config } from '../../config.js'

const results = new Map<string, PaymentStatus>()

export function recordSandboxPayment(merchantOrderId: string, state: PaymentStatus['state']) {
  results.set(merchantOrderId, { merchantOrderId, state })
}

export class SandboxGateway implements PaymentGateway {
  readonly provider = 'SANDBOX' as const

  async createCheckout(input: CreateCheckoutInput): Promise<CheckoutSession> {
    results.set(input.merchantOrderId, { merchantOrderId: input.merchantOrderId, state: 'PENDING' })
    const params = new URLSearchParams({
      merchantOrderId: input.merchantOrderId,
      method: input.method,
      amount: String(input.amountPaise),
      redirect: input.redirectUrl,
    })
    return {
      merchantOrderId: input.merchantOrderId,
      provider: 'SANDBOX',
      redirectUrl: `${config.appUrl}/pay/sandbox?${params.toString()}`,
    }
  }

  async getStatus(merchantOrderId: string): Promise<PaymentStatus> {
    return results.get(merchantOrderId) ?? { merchantOrderId, state: 'PENDING' }
  }
}
