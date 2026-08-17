import { describe, expect, it } from 'vitest'
import { AdminCatalogUseCases } from '../src/application/use-cases/admin-catalog.js'
import { CatalogUseCases } from '../src/application/use-cases/catalog.js'
import { MemoryProducts, MemoryUsers } from './fakes.js'
import { AuthUseCases } from '../src/application/use-cases/auth.js'
import { FakeTokens } from './fakes.js'

describe('catalog', () => {
  it('lists products by category and fetches by slug', async () => {
    const products = new MemoryProducts()
    const catalog = new CatalogUseCases(products)
    await products.create({
      slug: 'silk-saree',
      title: 'Silk saree',
      description: '',
      category: 'SAREE',
      priceInPaise: 500000,
      compareAtPaise: null,
      images: [],
      fabric: '',
      color: '',
      sizes: [],
      stock: 1,
      featured: true,
    })
    const listed = await catalog.list({ category: 'SAREE' })
    expect(listed.total).toBe(1)
    const found = await catalog.get(null, 'silk-saree')
    expect(found.title).toBe('Silk saree')
  })

  it('blocks customers from creating products', async () => {
    const users = new MemoryUsers()
    const auth = new AuthUseCases(users, new FakeTokens())
    const { user } = await auth.register({ email: 'c@test.com', name: 'Customer', password: 'password1' })
    const admin = new AdminCatalogUseCases(new MemoryProducts())
    await expect(
      admin.create(user, {
        title: 'Nope',
        category: 'SAREE',
        priceInPaise: 100000,
      }),
    ).rejects.toMatchObject({ code: 'FORBIDDEN' })
  })
})
