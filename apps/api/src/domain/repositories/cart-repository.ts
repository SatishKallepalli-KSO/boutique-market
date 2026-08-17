import type { Cart } from '../entities/cart.js'

export interface CartRepository {
  findByUserId(userId: string): Promise<Cart | null>
  save(cart: Cart): Promise<Cart>
  clear(userId: string): Promise<void>
}
