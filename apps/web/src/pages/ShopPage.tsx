import { useState } from 'react'
import { useQuery } from '@apollo/client'
import { CATEGORIES, CATEGORY_LABELS, type Category } from '@boutique-market/shared'
import { PRODUCTS } from '../graphql/operations'
import { ProductCard, type ProductTeaser } from '../components/ProductCard'

export function ShopPage() {
  const [category, setCategory] = useState<Category | undefined>()
  const { data, loading } = useQuery(PRODUCTS, { variables: { category } })
  const items = (data?.products?.items ?? []) as ProductTeaser[]

  return (
    <main className="page">
      <h1>Shop</h1>
      <div className="filters">
        <button className={`chip ${category ? '' : 'on'}`} type="button" onClick={() => setCategory(undefined)}>
          All
        </button>
        {CATEGORIES.map((value) => (
          <button
            key={value}
            className={`chip ${category === value ? 'on' : ''}`}
            type="button"
            onClick={() => setCategory(value)}
          >
            {CATEGORY_LABELS[value]}
          </button>
        ))}
      </div>
      {loading ? <p className="muted">Loading the floor…</p> : null}
      <div className="grid">
        {items.map((product) => (
          <ProductCard key={product.slug} product={product} />
        ))}
      </div>
    </main>
  )
}
