import { DEFAULT_STORE, type StoreSettings } from '@boutique-market/shared'
import { emptyCart, type Cart } from '../../domain/entities/cart.js'
import type { Order } from '../../domain/entities/order.js'
import type { Product } from '../../domain/entities/product.js'
import type { User } from '../../domain/entities/user.js'
import type { CartRepository } from '../../domain/repositories/cart-repository.js'
import type { OrderRepository } from '../../domain/repositories/order-repository.js'
import type { ProductFilter, ProductRepository } from '../../domain/repositories/product-repository.js'
import type { StoreRepository } from '../../domain/repositories/store-repository.js'
import type { UserRepository } from '../../domain/repositories/user-repository.js'
import { CartModel, OrderModel, ProductModel, StoreModel, UserModel } from './models.js'
import { toCart, toOrder, toProduct, toStore, toUser } from './mappers.js'

export class MongoUserRepository implements UserRepository {
  async findById(id: string) {
    const doc = await UserModel.findById(id).lean()
    return doc ? toUser(doc) : null
  }
  async findByEmail(email: string) {
    const doc = await UserModel.findOne({ email: email.toLowerCase() }).lean()
    return doc ? toUser(doc) : null
  }
  async create(user: Omit<User, 'id' | 'createdAt'>) {
    const doc = await UserModel.create(user)
    return toUser(doc.toObject())
  }
}

export class MongoProductRepository implements ProductRepository {
  async list(filter: ProductFilter, page: number, pageSize: number) {
    const query: Record<string, unknown> = {}
    if (filter.category) query.category = filter.category
    if (filter.featured != null) query.featured = filter.featured
    if (filter.search) query.$text = { $search: filter.search }
    const [items, total] = await Promise.all([
      ProductModel.find(query)
        .sort({ createdAt: -1 })
        .skip((page - 1) * pageSize)
        .limit(pageSize)
        .lean(),
      ProductModel.countDocuments(query),
    ])
    return { items: items.map(toProduct), total }
  }
  async findById(id: string) {
    const doc = await ProductModel.findById(id).lean()
    return doc ? toProduct(doc) : null
  }
  async findBySlug(slug: string) {
    const doc = await ProductModel.findOne({ slug }).lean()
    return doc ? toProduct(doc) : null
  }
  async create(product: Omit<Product, 'id' | 'createdAt'>) {
    const doc = await ProductModel.create(product)
    return toProduct(doc.toObject())
  }
  async update(id: string, patch: Partial<Product>) {
    const doc = await ProductModel.findByIdAndUpdate(id, patch, { new: true }).lean()
    if (!doc) throw new Error('Product missing after update')
    return toProduct(doc)
  }
  async remove(id: string) {
    const result = await ProductModel.findByIdAndDelete(id)
    return Boolean(result)
  }
}

export class MongoCartRepository implements CartRepository {
  async findByUserId(userId: string) {
    const doc = await CartModel.findOne({ userId }).lean()
    return doc ? toCart(doc) : null
  }
  async save(cart: Cart) {
    const doc = await CartModel.findOneAndUpdate(
      { userId: cart.userId },
      { userId: cart.userId, items: cart.items },
      { new: true, upsert: true },
    ).lean()
    return doc ? toCart(doc) : emptyCart(cart.userId)
  }
  async clear(userId: string) {
    await CartModel.findOneAndUpdate({ userId }, { items: [] }, { upsert: true })
  }
}

export class MongoOrderRepository implements OrderRepository {
  async create(order: Omit<Order, 'id' | 'createdAt'>) {
    const doc = await OrderModel.create(order)
    return toOrder(doc.toObject())
  }
  async findById(id: string) {
    const doc = await OrderModel.findById(id).lean()
    return doc ? toOrder(doc) : null
  }
  async findByMerchantOrderId(merchantOrderId: string) {
    const doc = await OrderModel.findOne({ 'payment.merchantOrderId': merchantOrderId }).lean()
    return doc ? toOrder(doc) : null
  }
  async findByUserId(userId: string) {
    const docs = await OrderModel.find({ userId }).sort({ createdAt: -1 }).lean()
    return docs.map(toOrder)
  }
  async listAll() {
    const docs = await OrderModel.find().sort({ createdAt: -1 }).lean()
    return docs.map(toOrder)
  }
  async save(order: Order) {
    const doc = await OrderModel.findByIdAndUpdate(
      order.id,
      {
        items: order.items,
        shipping: order.shipping,
        subtotalPaise: order.subtotalPaise,
        status: order.status,
        payment: order.payment,
      },
      { new: true },
    ).lean()
    if (!doc) throw new Error('Order missing after update')
    return toOrder(doc)
  }
}

export class MongoStoreRepository implements StoreRepository {
  async get() {
    const doc = await StoreModel.findOne({ key: 'default' }).lean()
    if (doc) return toStore(doc)
    const created = await StoreModel.create({ key: 'default', ...DEFAULT_STORE })
    return toStore(created.toObject())
  }
  async save(settings: StoreSettings) {
    const doc = await StoreModel.findOneAndUpdate(
      { key: 'default' },
      { key: 'default', ...settings },
      { new: true, upsert: true },
    ).lean()
    if (!doc) throw new Error('Store missing after update')
    return toStore(doc)
  }
}
