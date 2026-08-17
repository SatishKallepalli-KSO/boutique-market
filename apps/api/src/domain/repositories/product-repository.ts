import type { Category } from '@boutique-market/shared'
import type { Product } from '../entities/product.js'

export type ProductFilter = {
  category?: Category
  search?: string
  featured?: boolean
}

export interface ProductRepository {
  list(filter: ProductFilter, page: number, pageSize: number): Promise<{ items: Product[]; total: number }>
  findById(id: string): Promise<Product | null>
  findBySlug(slug: string): Promise<Product | null>
  create(product: Omit<Product, 'id' | 'createdAt'>): Promise<Product>
  update(id: string, patch: Partial<Product>): Promise<Product>
  remove(id: string): Promise<boolean>
}
