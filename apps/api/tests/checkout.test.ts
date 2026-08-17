import { describe, expect, it } from 'vitest'
import { AuthUseCases } from '../src/application/use-cases/auth.js'
import { CartUseCases } from '../src/application/use-cases/cart.js'
import { CheckoutUseCases } from '../src/application/use-cases/checkout.js'
import { StoreSettingsUseCases } from '../src/application/use-cases/store-settings.js'
import { FakeTokens, ImmediatePay, MemoryCarts, MemoryOrders, MemoryProducts, MemoryStore, MemoryUsers } from './fakes.js'

async function setup() {
  const users = new MemoryUsers()
  const products = new MemoryProducts()
  const carts = new MemoryCarts()
  const orders = new MemoryOrders()
  const auth = new AuthUseCases(users, new FakeTokens())
  const { user } = await auth.register({ email: 'buyer@test.com', name: 'Buyer', password: 'password1' })
  const product = await products.create({
    slug: 'test-saree',
    title: 'Test saree',
    description: '',
    category: 'SAREE',
    priceInPaise: 100000,
    compareAtPaise: null,
    images: [],
    fabric: 'Silk',
    color: 'Red',
    sizes: ['Free size'],
    stock: 2,
    featured: false,
  })
  const cart = new CartUseCases(carts, products)
  const checkout = new CheckoutUseCases(carts, orders, products, new ImmediatePay())
  return { user, product, cart, checkout, products }
}

describe('checkout', () => {
  it('creates a paid order, decrements stock, and clears the cart', async () => {
    const { user, product, cart, checkout, products } = await setup()
    await cart.add(user, product.id, 1, 'Free size')
    const { order } = await checkout.checkout(user, {
      method: 'PHONEPE',
      shipping: {
        name: 'Buyer',
        phone: '9908185597',
        line1: 'LIG-140',
        city: 'Hyderabad',
        state: 'Telangana',
        pin: '500072',
      },
    })
    const paid = await checkout.confirmPayment(order.payment.merchantOrderId)
    expect(paid.status).toBe('PAID')
    expect((await products.findById(product.id))?.stock).toBe(1)
    expect((await cart.getMine(user)).items).toHaveLength(0)
  })

  it('rejects checkout when the cart is empty', async () => {
    const { user, checkout } = await setup()
    await expect(
      checkout.checkout(user, {
        method: 'CARD',
        shipping: {
          name: 'Buyer',
          phone: '9908185597',
          line1: 'LIG-140',
          city: 'Hyderabad',
          state: 'Telangana',
          pin: '500072',
        },
      }),
    ).rejects.toMatchObject({ code: 'EMPTY_CART' })
  })
})

describe('store settings', () => {
  it('lets an admin rebrand the store', async () => {
    const users = new MemoryUsers()
    const auth = new AuthUseCases(users, new FakeTokens())
    const admin = await auth.ensureAdmin('admin@test.com', 'password1', 'Admin')
    const store = new StoreSettingsUseCases(new MemoryStore())
    const updated = await store.update(admin, { storeName: 'Meena Silks', accentColor: '#7a1f2b' })
    expect(updated.storeName).toBe('Meena Silks')
    expect(updated.accentColor).toBe('#7a1f2b')
  })
})
