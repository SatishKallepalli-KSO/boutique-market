import type { Request } from 'express'
import type { User } from '../../domain/entities/user.js'
import type { AuthUseCases } from '../../application/use-cases/auth.js'
import type { CatalogUseCases } from '../../application/use-cases/catalog.js'
import type { CartUseCases } from '../../application/use-cases/cart.js'
import type { CheckoutUseCases } from '../../application/use-cases/checkout.js'
import type { AdminCatalogUseCases } from '../../application/use-cases/admin-catalog.js'
import type { StoreSettingsUseCases } from '../../application/use-cases/store-settings.js'
import type { UserRepository } from '../../domain/repositories/user-repository.js'
import type { TokenService } from '../../application/ports/token-service.js'

export type AppContext = {
  user: User | null
  auth: AuthUseCases
  catalog: CatalogUseCases
  cart: CartUseCases
  checkout: CheckoutUseCases
  adminCatalog: AdminCatalogUseCases
  store: StoreSettingsUseCases
}

export type Services = Omit<AppContext, 'user'> & {
  users: UserRepository
  tokens: TokenService
}

export async function buildContext(req: Request, services: Services): Promise<AppContext> {
  const header = req.headers.authorization
  const token = header?.startsWith('Bearer ') ? header.slice(7) : null
  let user: User | null = null
  if (token) {
    try {
      const payload = services.tokens.verify(token)
      user = await services.users.findById(payload.sub)
    } catch {
      user = null
    }
  }
  return {
    user,
    auth: services.auth,
    catalog: services.catalog,
    cart: services.cart,
    checkout: services.checkout,
    adminCatalog: services.adminCatalog,
    store: services.store,
  }
}
