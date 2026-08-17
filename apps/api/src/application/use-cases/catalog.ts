import type { Category } from '@boutique-market/shared'
import { isCategory } from '@boutique-market/shared'
import { NotFoundError } from '../../domain/errors.js'
import type { ProductRepository } from '../../domain/repositories/product-repository.js'

export class CatalogUseCases {
  constructor(private readonly products: ProductRepository) {}

  list(args: { category?: string | null; search?: string | null; featured?: boolean | null; page?: number | null; pageSize?: number | null }) {
    const category = args.category && isCategory(args.category) ? (args.category as Category) : undefined
    return this.products.list(
      {
        category,
        search: args.search ?? undefined,
        featured: args.featured ?? undefined,
      },
      args.page ?? 1,
      Math.min(args.pageSize ?? 24, 60),
    )
  }

  async get(id?: string | null, slug?: string | null) {
    const product = id ? await this.products.findById(id) : slug ? await this.products.findBySlug(slug) : null
    if (!product) throw new NotFoundError('Product')
    return product
  }
}
