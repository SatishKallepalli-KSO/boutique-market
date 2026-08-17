import { DEFAULT_STORE, type StoreSettings } from '@boutique-market/shared'
import { emptyCart, type Cart } from '../../domain/entities/cart.js'
import type { Order } from '../../domain/entities/order.js'
import type { Product } from '../../domain/entities/product.js'
import type { Store } from '../../domain/entities/store.js'
import type { User } from '../../domain/entities/user.js'
import type { CartRepository } from '../../domain/repositories/cart-repository.js'
import type { OrderRepository } from '../../domain/repositories/order-repository.js'
import type { ProductFilter, ProductRepository } from '../../domain/repositories/product-repository.js'
import type { StoreRepository } from '../../domain/repositories/store-repository.js'
import type { UserRepository } from '../../domain/repositories/user-repository.js'
import type { ImageStore, StoredImage } from '../../application/ports/image-store.js'

export class MemoryUsers implements UserRepository {
  private items = new Map<string, User>()
  async findById(id: string) {
    return this.items.get(id) ?? null
  }
  async findByEmail(email: string) {
    return [...this.items.values()].find((u) => u.email === email) ?? null
  }
  async create(user: Omit<User, 'id' | 'createdAt'>) {
    const created: User = { ...user, id: crypto.randomUUID(), createdAt: new Date() }
    this.items.set(created.id, created)
    return created
  }
}

export class MemoryProducts implements ProductRepository {
  items = new Map<string, Product>()
  async list(filter: ProductFilter, page: number, pageSize: number) {
    let rows = [...this.items.values()]
    if (filter.category) rows = rows.filter((p) => p.category === filter.category)
    if (filter.featured != null) rows = rows.filter((p) => p.featured === filter.featured)
    if (filter.search) rows = rows.filter((p) => p.title.toLowerCase().includes(filter.search!.toLowerCase()))
    const start = (page - 1) * pageSize
    return { items: rows.slice(start, start + pageSize), total: rows.length }
  }
  async findById(id: string) {
    return this.items.get(id) ?? null
  }
  async findBySlug(slug: string) {
    return [...this.items.values()].find((p) => p.slug === slug) ?? null
  }
  async create(product: Omit<Product, 'id' | 'createdAt'>) {
    const created: Product = { ...product, id: crypto.randomUUID(), createdAt: new Date() }
    this.items.set(created.id, created)
    return created
  }
  async update(id: string, patch: Partial<Product>) {
    const current = this.items.get(id)
    if (!current) throw new Error('missing')
    const next = { ...current, ...patch }
    this.items.set(id, next)
    return next
  }
  async remove(id: string) {
    return this.items.delete(id)
  }
}

export class MemoryCarts implements CartRepository {
  private items = new Map<string, Cart>()
  async findByUserId(userId: string) {
    return this.items.get(userId) ?? null
  }
  async save(cart: Cart) {
    this.items.set(cart.userId, cart)
    return cart
  }
  async clear(userId: string) {
    this.items.set(userId, emptyCart(userId))
  }
}

export class MemoryOrders implements OrderRepository {
  items: Order[] = []
  async create(order: Omit<Order, 'id' | 'createdAt'>) {
    const created: Order = { ...order, id: crypto.randomUUID(), createdAt: new Date() }
    this.items.push(created)
    return created
  }
  async findById(id: string) {
    return this.items.find((o) => o.id === id) ?? null
  }
  async findByMerchantOrderId(merchantOrderId: string) {
    return this.items.find((o) => o.payment.merchantOrderId === merchantOrderId) ?? null
  }
  async findByUserId(userId: string) {
    return this.items.filter((o) => o.userId === userId)
  }
  async listAll() {
    return this.items
  }
  async save(order: Order) {
    this.items = this.items.map((o) => (o.id === order.id ? order : o))
    return order
  }
}

export class MemoryStore implements StoreRepository {
  private value: Store = { id: 'default', ...DEFAULT_STORE, updatedAt: new Date() }
  async get() {
    return this.value
  }
  async save(settings: StoreSettings) {
    this.value = { ...this.value, ...settings, updatedAt: new Date() }
    return this.value
  }
}

export class MemoryImageStore implements ImageStore {
  private files = new Map<string, { buffer: Buffer; contentType: string }>()
  async save(buffer: Buffer, contentType: string, _filename: string): Promise<StoredImage> {
    const id = crypto.randomUUID()
    this.files.set(id, { buffer, contentType })
    return { id, url: `/api/media/${id}`, contentType }
  }
  async get(id: string) {
    return this.files.get(id) ?? null
  }
}
