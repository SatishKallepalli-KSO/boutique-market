import type {
  CheckoutSession,
  CreateCheckoutInput,
  PaymentGateway,
  PaymentStatus,
} from '../../application/ports/payment-gateway.js'
import { config } from '../../config.js'
import { SandboxGateway } from './sandbox-gateway.js'

export class PhonePeGateway implements PaymentGateway {
  readonly provider = 'PHONEPE' as const

  async createCheckout(input: CreateCheckoutInput): Promise<CheckoutSession> {
    const { StandardCheckoutClient, Env, StandardCheckoutPayRequest } = await import(
      '@phonepe-pg/pg-sdk-node'
    )
    const client = StandardCheckoutClient.getInstance(
      config.phonepe.clientId,
      config.phonepe.clientSecret,
      config.phonepe.clientVersion,
      config.phonepe.env === 'PRODUCTION' ? Env.PRODUCTION : Env.SANDBOX,
    )
    const request = StandardCheckoutPayRequest.builder()
      .merchantOrderId(input.merchantOrderId)
      .amount(input.amountPaise)
      .redirectUrl(input.redirectUrl)
      .build()
    const response = await client.pay(request)
    return {
      merchantOrderId: input.merchantOrderId,
      provider: 'PHONEPE',
      redirectUrl: response.redirectUrl,
    }
  }

  async getStatus(merchantOrderId: string): Promise<PaymentStatus> {
    const { StandardCheckoutClient, Env } = await import('@phonepe-pg/pg-sdk-node')
    const client = StandardCheckoutClient.getInstance(
      config.phonepe.clientId,
      config.phonepe.clientSecret,
      config.phonepe.clientVersion,
      config.phonepe.env === 'PRODUCTION' ? Env.PRODUCTION : Env.SANDBOX,
    )
    const response = await client.getOrderStatus(merchantOrderId)
    const raw = String(response.state ?? '').toUpperCase()
    const state =
      raw === 'COMPLETED' || raw === 'SUCCESS'
        ? 'COMPLETED'
        : raw.includes('FAIL')
          ? 'FAILED'
          : 'PENDING'
    return { merchantOrderId, state }
  }
}

export function createPaymentGateway(): PaymentGateway {
  return config.usePhonePe ? new PhonePeGateway() : new SandboxGateway()
}
