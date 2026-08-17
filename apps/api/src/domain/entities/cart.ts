import { DomainError } from '../errors.js'

export type CartItem = {
  id: string
  productId: string
  title: string
  priceInPaise: number
  quantity: number
  size: string | null
  imageUrl: string
}

export type Cart = {
  id: string
  userId: string
  items: CartItem[]
  updatedAt: Date
}

export function emptyCart(userId: string): Cart {
  return {
    id: `cart-${userId}`,
    userId,
    items: [],
    updatedAt: new Date(),
  }
}

export function cartSubtotal(cart: Cart): number {
  return cart.items.reduce((sum, item) => sum + item.priceInPaise * item.quantity, 0)
}

export function upsertItem(cart: Cart, incoming: Omit<CartItem, 'id'> & { id?: string }): Cart {
  if (incoming.quantity < 1) {
    throw new DomainError('Quantity must be at least 1', 'INVALID_QUANTITY')
  }
  const match = cart.items.find(
    (item) => item.productId === incoming.productId && item.size === incoming.size,
  )
  const items = match
    ? cart.items.map((item) =>
        item.id === match.id ? { ...item, quantity: item.quantity + incoming.quantity } : item,
      )
    : [...cart.items, { ...incoming, id: incoming.id ?? crypto.randomUUID() }]
  return { ...cart, items, updatedAt: new Date() }
}

export function setItemQuantity(cart: Cart, itemId: string, quantity: number): Cart {
  if (quantity < 1) {
    return { ...cart, items: cart.items.filter((item) => item.id !== itemId), updatedAt: new Date() }
  }
  return {
    ...cart,
    items: cart.items.map((item) => (item.id === itemId ? { ...item, quantity } : item)),
    updatedAt: new Date(),
  }
}
