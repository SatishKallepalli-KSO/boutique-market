import type { OrderStatus, PaymentMethod, PaymentState } from '@boutique-market/shared'
import { DomainError } from '../errors.js'
import type { CartItem } from './cart.js'

export type ShippingAddress = {
  name: string
  phone: string
  line1: string
  city: string
  state: string
  pin: string
}

export type PaymentInfo = {
  method: PaymentMethod
  provider: 'PHONEPE' | 'SANDBOX'
  merchantOrderId: string
  state: PaymentState
}

export type Order = {
  id: string
  userId: string
  items: CartItem[]
  shipping: ShippingAddress
  subtotalPaise: number
  status: OrderStatus
  payment: PaymentInfo
  createdAt: Date
}

export function markPaid(order: Order): Order {
  if (order.status !== 'PENDING_PAYMENT') {
    throw new DomainError('Order is not awaiting payment', 'INVALID_ORDER_STATE')
  }
  return {
    ...order,
    status: 'PAID',
    payment: { ...order.payment, state: 'COMPLETED' },
  }
}

export function markPaymentFailed(order: Order): Order {
  return {
    ...order,
    payment: { ...order.payment, state: 'FAILED' },
  }
}
