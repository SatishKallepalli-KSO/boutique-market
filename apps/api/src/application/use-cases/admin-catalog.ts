import { z } from 'zod'
import { CATEGORIES } from '@boutique-market/shared'
import { ForbiddenError, NotFoundError } from '../../domain/errors.js'
import { slugify } from '../../domain/entities/product.js'
import type { User } from '../../domain/entities/user.js'
import type { ProductRepository } from '../../domain/repositories/product-repository.js'

const productSchema = z.object({
  title: z.string().min(2).max(120),
  description: z.string().max(4000).default(''),
  category: z.enum(CATEGORIES),
  priceInPaise: z.number().int().min(100),
  compareAtPaise: z.number().int().min(100).nullable().optional(),
  images: z
    .array(z.object({ url: z.string().min(1), alt: z.string().default('') }))
    .default([]),
  fabric: z.string().max(80).default(''),
  color: z.string().max(40).default(''),
  sizes: z.array(z.string().min(1)).default([]),
  stock: z.number().int().min(0).default(0),
  featured: z.boolean().default(false),
  slug: z.string().min(2).max(80).optional(),
})

function requireAdmin(user: User | null) {
  if (!user || user.role !== 'ADMIN') {
    throw new ForbiddenError('Admin access required')
  }
}

export class AdminCatalogUseCases {
  constructor(private readonly products: ProductRepository) {}

  async create(user: User | null, input: unknown) {
    requireAdmin(user)
    const data = productSchema.parse(input)
    const slug = data.slug ?? `${slugify(data.title)}-${crypto.randomUUID().slice(0, 6)}`
    return this.products.create({
      ...data,
      slug,
      compareAtPaise: data.compareAtPaise ?? null,
      images: data.images.map((image) => ({ ...image, id: crypto.randomUUID() })),
    })
  }

  async update(user: User | null, id: string, input: unknown) {
    requireAdmin(user)
    const existing = await this.products.findById(id)
    if (!existing) throw new NotFoundError('Product')
    const data = productSchema.partial().parse(input)
    return this.products.update(id, {
      ...data,
      images: data.images
        ? data.images.map((image) => ({ ...image, id: crypto.randomUUID() }))
        : existing.images,
    })
  }

  async remove(user: User | null, id: string) {
    requireAdmin(user)
    return this.products.remove(id)
  }
}
