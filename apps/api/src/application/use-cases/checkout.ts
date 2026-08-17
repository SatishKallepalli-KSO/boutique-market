import { z } from 'zod'
import { DomainError, NotFoundError, UnauthorizedError } from '../../domain/errors.js'
import { cartSubtotal, emptyCart } from '../../domain/entities/cart.js'
import { markPaid, markPaymentFailed } from '../../domain/entities/order.js'
import { assertCanFulfill, decrementStock } from '../../domain/entities/product.js'
import type { User } from '../../domain/entities/user.js'
import type { CartRepository } from '../../domain/repositories/cart-repository.js'
import type { OrderRepository } from '../../domain/repositories/order-repository.js'
import type { ProductRepository } from '../../domain/repositories/product-repository.js'
import type { PaymentGateway } from '../ports/payment-gateway.js'
import { config } from '../../config.js'

const checkoutSchema = z.object({
  method: z.enum(['PHONEPE', 'CARD']),
  shipping: z.object({
    name: z.string().min(2),
    phone: z.string().min(10).max(16),
    line1: z.string().min(4),
    city: z.string().min(2),
    state: z.string().min(2),
    pin: z.string().min(4).max(10),
  }),
})

export class CheckoutUseCases {
  constructor(
    private readonly carts: CartRepository,
    private readonly orders: OrderRepository,
    private readonly products: ProductRepository,
    private readonly payments: PaymentGateway,
  ) {}

  async checkout(user: User | null, input: unknown) {
    if (!user) throw new UnauthorizedError()
    const data = checkoutSchema.parse(input)
    const cart = (await this.carts.findByUserId(user.id)) ?? emptyCart(user.id)
    if (cart.items.length === 0) {
      throw new DomainError('Your cart is empty', 'EMPTY_CART')
    }

    for (const item of cart.items) {
      const product = await this.products.findById(item.productId)
      if (!product) throw new NotFoundError('Product')
      assertCanFulfill(product, item.quantity)
    }

    const merchantOrderId = `BM${Date.now().toString(36)}${crypto.randomUUID().slice(0, 8)}`.slice(0, 63)
    const subtotalPaise = cartSubtotal(cart)
    const order = await this.orders.create({
      userId: user.id,
      items: cart.items,
      shipping: data.shipping,
      subtotalPaise,
      status: 'PENDING_PAYMENT',
      payment: {
        method: data.method,
        provider: this.payments.provider,
        merchantOrderId,
        state: 'PENDING',
      },
    })

    const session = await this.payments.createCheckout({
      merchantOrderId,
      amountPaise: subtotalPaise,
      method: data.method,
      redirectUrl: `${config.appUrl}/pay/return?merchantOrderId=${encodeURIComponent(merchantOrderId)}`,
    })

    return { order, redirectUrl: session.redirectUrl }
  }

  async confirmPayment(merchantOrderId: string) {
    const order = await this.orders.findByMerchantOrderId(merchantOrderId)
    if (!order) throw new NotFoundError('Order')
    if (order.status === 'PAID') return order

    const status = await this.payments.getStatus(merchantOrderId)
    if (status.state !== 'COMPLETED') {
      await this.orders.save(markPaymentFailed(order))
      throw new DomainError('Payment is not complete yet', 'PAYMENT_PENDING')
    }

    for (const item of order.items) {
      const product = await this.products.findById(item.productId)
      if (!product) continue
      await this.products.update(product.id, decrementStock(product, item.quantity))
    }
    await this.carts.clear(order.userId)
    return this.orders.save(markPaid(order))
  }

  async myOrders(user: User | null) {
    if (!user) throw new UnauthorizedError()
    return this.orders.findByUserId(user.id)
  }

  async getOrder(user: User | null, id: string) {
    if (!user) throw new UnauthorizedError()
    const order = await this.orders.findById(id)
    if (!order) throw new NotFoundError('Order')
    if (order.userId !== user.id && user.role !== 'ADMIN') throw new NotFoundError('Order')
    return order
  }

  async adminOrders(user: User | null) {
    if (!user || user.role !== 'ADMIN') throw new UnauthorizedError()
    return this.orders.listAll()
  }

  async setStatus(user: User | null, id: string, status: 'FULFILLING' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED') {
    if (!user || user.role !== 'ADMIN') throw new UnauthorizedError()
    const order = await this.orders.findById(id)
    if (!order) throw new NotFoundError('Order')
    return this.orders.save({ ...order, status })
  }
}
