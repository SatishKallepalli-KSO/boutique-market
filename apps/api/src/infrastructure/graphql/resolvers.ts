import { GraphQLError } from 'graphql'
import { ZodError } from 'zod'
import { DomainError } from '../../domain/errors.js'
import { cartSubtotal } from '../../domain/entities/cart.js'
import type { AppContext } from './context.js'

function wrap<T>(fn: () => Promise<T> | T): Promise<T> {
  return Promise.resolve()
    .then(fn)
    .catch((error: unknown) => {
      if (error instanceof DomainError) {
        throw new GraphQLError(error.message, { extensions: { code: error.code } })
      }
      if (error instanceof ZodError) {
        throw new GraphQLError(error.issues[0]?.message ?? 'Invalid input', {
          extensions: { code: 'BAD_USER_INPUT' },
        })
      }
      throw error
    })
}

function publicUser(user: { id: string; email: string; name: string; role: string }) {
  return { id: user.id, email: user.email, name: user.name, role: user.role }
}

function publicCart(cart: { id: string; items: unknown[] } & { items: Parameters<typeof cartSubtotal>[0]['items'] }) {
  return { id: cart.id, items: cart.items, subtotalPaise: cartSubtotal(cart as never) }
}

function publicProduct(product: { createdAt: Date } & Record<string, unknown>) {
  return { ...product, createdAt: product.createdAt.toISOString() }
}

function publicOrder(order: { createdAt: Date } & Record<string, unknown>) {
  return { ...order, createdAt: order.createdAt.toISOString() }
}

export const resolvers = {
  Query: {
    store: (_: unknown, __: unknown, ctx: AppContext) => wrap(() => ctx.store.get()),
    products: (_: unknown, args: { category?: string; search?: string; featured?: boolean; page?: number; pageSize?: number }, ctx: AppContext) =>
      wrap(async () => {
        const result = await ctx.catalog.list(args)
        return {
          items: result.items.map(publicProduct),
          total: result.total,
          page: args.page ?? 1,
          pageSize: args.pageSize ?? 24,
        }
      }),
    product: (_: unknown, args: { id?: string; slug?: string }, ctx: AppContext) =>
      wrap(async () => publicProduct(await ctx.catalog.get(args.id, args.slug))),
    me: (_: unknown, __: unknown, ctx: AppContext) => (ctx.user ? publicUser(ctx.user) : null),
    myCart: (_: unknown, __: unknown, ctx: AppContext) => wrap(async () => publicCart(await ctx.cart.getMine(ctx.user))),
    myOrders: (_: unknown, __: unknown, ctx: AppContext) =>
      wrap(async () => (await ctx.checkout.myOrders(ctx.user)).map(publicOrder)),
    order: (_: unknown, args: { id: string }, ctx: AppContext) =>
      wrap(async () => publicOrder(await ctx.checkout.getOrder(ctx.user, args.id))),
    adminOrders: (_: unknown, __: unknown, ctx: AppContext) =>
      wrap(async () => (await ctx.checkout.adminOrders(ctx.user)).map(publicOrder)),
  },
  Mutation: {
    register: (_: unknown, args: { input: unknown }, ctx: AppContext) =>
      wrap(async () => {
        const result = await ctx.auth.register(args.input)
        return { token: result.token, user: publicUser(result.user) }
      }),
    login: (_: unknown, args: { input: unknown }, ctx: AppContext) =>
      wrap(async () => {
        const result = await ctx.auth.login(args.input)
        return { token: result.token, user: publicUser(result.user) }
      }),
    addToCart: (_: unknown, args: { productId: string; quantity: number; size?: string }, ctx: AppContext) =>
      wrap(async () => publicCart(await ctx.cart.add(ctx.user, args.productId, args.quantity, args.size))),
    updateCartItem: (_: unknown, args: { itemId: string; quantity: number }, ctx: AppContext) =>
      wrap(async () => publicCart(await ctx.cart.updateItem(ctx.user, args.itemId, args.quantity))),
    removeCartItem: (_: unknown, args: { itemId: string }, ctx: AppContext) =>
      wrap(async () => publicCart(await ctx.cart.removeItem(ctx.user, args.itemId))),
    checkout: (_: unknown, args: { input: unknown }, ctx: AppContext) =>
      wrap(async () => {
        const result = await ctx.checkout.checkout(ctx.user, args.input)
        return { order: publicOrder(result.order), redirectUrl: result.redirectUrl }
      }),
    confirmPayment: (_: unknown, args: { merchantOrderId: string }, ctx: AppContext) =>
      wrap(async () => publicOrder(await ctx.checkout.confirmPayment(args.merchantOrderId))),
    createProduct: (_: unknown, args: { input: unknown }, ctx: AppContext) =>
      wrap(async () => publicProduct(await ctx.adminCatalog.create(ctx.user, args.input))),
    updateProduct: (_: unknown, args: { id: string; input: unknown }, ctx: AppContext) =>
      wrap(async () => publicProduct(await ctx.adminCatalog.update(ctx.user, args.id, args.input))),
    deleteProduct: (_: unknown, args: { id: string }, ctx: AppContext) =>
      wrap(() => ctx.adminCatalog.remove(ctx.user, args.id)),
    updateStore: (_: unknown, args: { input: unknown }, ctx: AppContext) =>
      wrap(() => ctx.store.update(ctx.user, args.input)),
    updateOrderStatus: (_: unknown, args: { id: string; status: 'FULFILLING' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED' }, ctx: AppContext) =>
      wrap(async () => publicOrder(await ctx.checkout.setStatus(ctx.user, args.id, args.status))),
  },
}
