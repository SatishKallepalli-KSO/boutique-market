import { AuthUseCases } from './application/use-cases/auth.js'
import { CatalogUseCases } from './application/use-cases/catalog.js'
import { CartUseCases } from './application/use-cases/cart.js'
import { CheckoutUseCases } from './application/use-cases/checkout.js'
import { AdminCatalogUseCases } from './application/use-cases/admin-catalog.js'
import { StoreSettingsUseCases } from './application/use-cases/store-settings.js'
import { JwtTokenService } from './infrastructure/auth/jwt-token-service.js'
import { createPaymentGateway } from './infrastructure/payment/phonepe-gateway.js'
import { MongoImageStore } from './infrastructure/storage/mongo-image-store.js'
import {
  MongoCartRepository,
  MongoOrderRepository,
  MongoProductRepository,
  MongoStoreRepository,
  MongoUserRepository,
} from './infrastructure/mongodb/repositories.js'
import {
  MemoryCarts,
  MemoryImageStore,
  MemoryOrders,
  MemoryProducts,
  MemoryStore,
  MemoryUsers,
} from './infrastructure/memory/repositories.js'
import { config } from './config.js'
import type { Services } from './infrastructure/graphql/context.js'

let cached: ReturnType<typeof createGraph> | null = null

function createGraph() {
  const users = config.useMemoryDb ? new MemoryUsers() : new MongoUserRepository()
  const products = config.useMemoryDb ? new MemoryProducts() : new MongoProductRepository()
  const carts = config.useMemoryDb ? new MemoryCarts() : new MongoCartRepository()
  const orders = config.useMemoryDb ? new MemoryOrders() : new MongoOrderRepository()
  const stores = config.useMemoryDb ? new MemoryStore() : new MongoStoreRepository()
  const tokens = new JwtTokenService()
  const payments = createPaymentGateway()
  const images = config.useMemoryDb ? new MemoryImageStore() : new MongoImageStore()

  const services: Services = {
    users,
    tokens,
    auth: new AuthUseCases(users, tokens),
    catalog: new CatalogUseCases(products),
    cart: new CartUseCases(carts, products),
    checkout: new CheckoutUseCases(carts, orders, products, payments),
    adminCatalog: new AdminCatalogUseCases(products),
    store: new StoreSettingsUseCases(stores),
  }

  return { services, images, products, stores, auth: services.auth }
}

export function compose() {
  cached ??= createGraph()
  return cached
}
