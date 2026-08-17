import type { Category } from '@boutique-market/shared'
import { DomainError } from '../errors.js'

export type ProductImage = {
  id: string
  url: string
  alt: string
}

export type Product = {
  id: string
  slug: string
  title: string
  description: string
  category: Category
  priceInPaise: number
  compareAtPaise: number | null
  images: ProductImage[]
  fabric: string
  color: string
  sizes: string[]
  stock: number
  featured: boolean
  createdAt: Date
}

export function assertCanFulfill(product: Product, quantity: number): void {
  if (quantity < 1) {
    throw new DomainError('Quantity must be at least 1', 'INVALID_QUANTITY')
  }
  if (product.stock < quantity) {
    throw new DomainError(`${product.title} is out of stock`, 'OUT_OF_STOCK')
  }
}

export function decrementStock(product: Product, quantity: number): Product {
  assertCanFulfill(product, quantity)
  return { ...product, stock: product.stock - quantity }
}

export function slugify(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 60)
}
