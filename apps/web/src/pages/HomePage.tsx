import { Link } from 'react-router-dom'
import { useQuery } from '@apollo/client'
import { PRODUCTS } from '../graphql/operations'
import { ProductCard, type ProductTeaser } from '../components/ProductCard'
import { useStore } from '../store'

export function HomePage() {
  const store = useStore()
  const { data } = useQuery(PRODUCTS, { variables: { featured: true } })
  const items = (data?.products?.items ?? []) as ProductTeaser[]

  return (
    <main className="page">
      <section className="hero">
        <div>
          <p className="muted">Boutique storefront</p>
          <h1>{store.storeName}</h1>
          <p className="lede">{store.tagline || 'Sarees, blouses, and occasion wear — photographed, priced, and ready to ship.'}</p>
          <p>
            <Link className="btn" to="/shop">
              Browse the floor
            </Link>
          </p>
        </div>
        <div className="hero-panel">
          <div className="muted">This season</div>
          <h2>Upload pieces. Sell from the same desk.</h2>
          <p>One boutique, one shop — brand it with your name, logo, and gold (or any accent) in Admin.</p>
        </div>
      </section>
      <h2>Featured</h2>
      <div className="grid">
        {items.map((product) => (
          <ProductCard key={product.slug} product={product} />
        ))}
      </div>
    </main>
  )
}
