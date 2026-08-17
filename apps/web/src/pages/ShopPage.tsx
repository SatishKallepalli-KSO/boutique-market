import { useSearchParams } from 'react-router-dom'
import { useQuery } from '@apollo/client'
import { CATEGORIES, CATEGORY_LABELS, isCategory, type Category } from '@boutique-market/shared'
import { PRODUCTS } from '../graphql/operations'
import { ProductCard, type ProductTeaser } from '../components/ProductCard'

const sectionPhotos: Partial<Record<Category, string>> = {
  SAREE: '/sections/saree.jpg',
  BLOUSE: '/sections/blouse.jpg',
  LEHENGA: '/sections/lehenga.jpg',
  KURTA: '/sections/kurta.jpg',
  DUPATTA: '/demo/dupatta-gold.jpg',
  ACCESSORY: '/demo/accessory-gold.jpg',
}

const copy: Partial<Record<Category, string>> = {
  SAREE: 'Silks with weight, georgettes with air. Draped and ready.',
  BLOUSE: 'Boat necks, maggam, and studio finishes in your size.',
  LEHENGA: 'Festive sets and bridal silhouettes from the atelier.',
  KURTA: 'Linen and cotton for temple mornings and workdays.',
  DUPATTA: 'Tissue and organza to complete a plain kurta or blouse.',
  ACCESSORY: 'Temple jewellery and festive extras, photographed in gold light.',
}

export function ShopPage() {
  const [params, setParams] = useSearchParams()
  const raw = params.get('category') ?? ''
  const category = isCategory(raw) ? raw : undefined
  const { data, loading } = useQuery(PRODUCTS, { variables: { category } })
  const items = (data?.products?.items ?? []) as ProductTeaser[]
  const hero = category ? sectionPhotos[category] : '/sections/hero.jpg'

  function setCategory(value?: Category) {
    const next = new URLSearchParams(params)
    if (value) next.set('category', value)
    else next.delete('category')
    setParams(next, { replace: true })
  }

  return (
    <main>
      <section className="section-hero" style={{ backgroundImage: `url(${hero})` }}>
        <div className="hero-veil" />
        <div className="section-hero-copy">
          <p className="eyebrow light">The collection</p>
          <h1>{category ? CATEGORY_LABELS[category] : 'All pieces'}</h1>
          <p>{category ? copy[category] : 'Every room of the house, on one floor.'}</p>
        </div>
      </section>
      <div className="page">
        <div className="catalog-bar">
          <p className="muted">{loading ? 'Arranging…' : `${items.length} pieces`}</p>
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
        </div>
        {!loading && items.length === 0 ? <p className="muted">This room is being dressed.</p> : null}
        <div className="grid">
          {items.map((product) => (
            <ProductCard key={product.slug} product={product} />
          ))}
        </div>
      </div>
    </main>
  )
}
