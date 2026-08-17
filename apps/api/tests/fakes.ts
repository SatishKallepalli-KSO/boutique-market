import type { PaymentGateway, PaymentStatus } from '../src/application/ports/payment-gateway.js'
import type { TokenService } from '../src/application/ports/token-service.js'

export {
  MemoryCarts,
  MemoryOrders,
  MemoryProducts,
  MemoryStore,
  MemoryUsers,
} from '../src/infrastructure/memory/repositories.js'

export class FakeTokens implements TokenService {
  sign(payload: { sub: string; email: string; role: 'CUSTOMER' | 'ADMIN' }) {
    return JSON.stringify(payload)
  }
  verify(token: string) {
    return JSON.parse(token)
  }
}

export class ImmediatePay implements PaymentGateway {
  readonly provider = 'SANDBOX' as const
  private states = new Map<string, PaymentStatus['state']>()
  async createCheckout(input: { merchantOrderId: string }) {
    this.states.set(input.merchantOrderId, 'COMPLETED')
    return { merchantOrderId: input.merchantOrderId, redirectUrl: 'http://pay.test', provider: 'SANDBOX' as const }
  }
  async getStatus(merchantOrderId: string) {
    return { merchantOrderId, state: this.states.get(merchantOrderId) ?? 'PENDING' }
  }
}
