import type { Category, OrderStatus, PaymentMethod, PaymentState, UserRole } from '@boutique-market/shared'
import type { User } from '../../domain/entities/user.js'
import type { Product } from '../../domain/entities/product.js'
import type { Cart } from '../../domain/entities/cart.js'
import type { Order } from '../../domain/entities/order.js'
import type { Store } from '../../domain/entities/store.js'

type Doc = { _id: { toString(): string }; createdAt?: Date; updatedAt?: Date }

export function toUser(doc: Doc & Record<string, unknown>): User {
  return {
    id: doc._id.toString(),
    email: String(doc.email),
    name: String(doc.name),
    passwordHash: String(doc.passwordHash),
    role: doc.role as UserRole,
    createdAt: doc.createdAt ?? new Date(),
  }
}

export function toProduct(doc: Doc & Record<string, unknown>): Product {
  return {
    id: doc._id.toString(),
    slug: String(doc.slug),
    title: String(doc.title),
    description: String(doc.description ?? ''),
    category: doc.category as Category,
    priceInPaise: Number(doc.priceInPaise),
    compareAtPaise: doc.compareAtPaise == null ? null : Number(doc.compareAtPaise),
    images: Array.isArray(doc.images) ? (doc.images as Product['images']) : [],
    fabric: String(doc.fabric ?? ''),
    color: String(doc.color ?? ''),
    sizes: Array.isArray(doc.sizes) ? (doc.sizes as string[]) : [],
    stock: Number(doc.stock ?? 0),
    featured: Boolean(doc.featured),
    createdAt: doc.createdAt ?? new Date(),
  }
}

export function toCart(doc: Doc & Record<string, unknown>): Cart {
  return {
    id: doc._id.toString(),
    userId: String(doc.userId),
    items: Array.isArray(doc.items) ? (doc.items as Cart['items']) : [],
    updatedAt: doc.updatedAt ?? new Date(),
  }
}

export function toOrder(doc: Doc & Record<string, unknown>): Order {
  const payment = (doc.payment ?? {}) as Record<string, string>
  return {
    id: doc._id.toString(),
    userId: String(doc.userId),
    items: Array.isArray(doc.items) ? (doc.items as Order['items']) : [],
    shipping: doc.shipping as Order['shipping'],
    subtotalPaise: Number(doc.subtotalPaise),
    status: doc.status as OrderStatus,
    payment: {
      method: payment.method as PaymentMethod,
      provider: payment.provider as Order['payment']['provider'],
      merchantOrderId: String(payment.merchantOrderId ?? ''),
      state: payment.state as PaymentState,
    },
    createdAt: doc.createdAt ?? new Date(),
  }
}

export function toStore(doc: Doc & Record<string, unknown>): Store {
  return {
    id: doc._id.toString(),
    storeName: String(doc.storeName ?? 'Your Boutique'),
    tagline: String(doc.tagline ?? ''),
    ownerName: String(doc.ownerName ?? ''),
    phone: String(doc.phone ?? ''),
    whatsapp: String(doc.whatsapp ?? ''),
    email: String(doc.email ?? ''),
    addressLine: String(doc.addressLine ?? ''),
    city: String(doc.city ?? ''),
    state: String(doc.state ?? ''),
    pin: String(doc.pin ?? ''),
    logoUrl: String(doc.logoUrl ?? ''),
    accentColor: String(doc.accentColor ?? '#c4a35a'),
    currency: String(doc.currency ?? 'INR'),
    updatedAt: doc.updatedAt ?? new Date(),
  }
}
