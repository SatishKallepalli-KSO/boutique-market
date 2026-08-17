import { NotFoundError, UnauthorizedError } from '../../domain/errors.js'
import { emptyCart, setItemQuantity, upsertItem } from '../../domain/entities/cart.js'
import { assertCanFulfill } from '../../domain/entities/product.js'
import type { CartRepository } from '../../domain/repositories/cart-repository.js'
import type { ProductRepository } from '../../domain/repositories/product-repository.js'
import type { User } from '../../domain/entities/user.js'

export class CartUseCases {
  constructor(
    private readonly carts: CartRepository,
    private readonly products: ProductRepository,
  ) {}

  async getMine(user: User | null) {
    if (!user) throw new UnauthorizedError()
    return (await this.carts.findByUserId(user.id)) ?? emptyCart(user.id)
  }

  async add(user: User | null, productId: string, quantity: number, size?: string | null) {
    if (!user) throw new UnauthorizedError()
    const product = await this.products.findById(productId)
    if (!product) throw new NotFoundError('Product')
    assertCanFulfill(product, quantity)
    if (product.sizes.length && size && !product.sizes.includes(size)) {
      throw new NotFoundError('Size')
    }
    const cart = (await this.carts.findByUserId(user.id)) ?? emptyCart(user.id)
    return this.carts.save(
      upsertItem(cart, {
        productId: product.id,
        title: product.title,
        priceInPaise: product.priceInPaise,
        quantity,
        size: size ?? product.sizes[0] ?? null,
        imageUrl: product.images[0]?.url ?? '',
      }),
    )
  }

  async updateItem(user: User | null, itemId: string, quantity: number) {
    if (!user) throw new UnauthorizedError()
    const cart = (await this.carts.findByUserId(user.id)) ?? emptyCart(user.id)
    return this.carts.save(setItemQuantity(cart, itemId, quantity))
  }

  async removeItem(user: User | null, itemId: string) {
    return this.updateItem(user, itemId, 0)
  }
}
