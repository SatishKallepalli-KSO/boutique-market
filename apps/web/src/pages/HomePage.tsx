import { Link } from 'react-router-dom'
import { useQuery } from '@apollo/client'
import { PRODUCTS } from '../graphql/operations'
import { ProductCard, type ProductTeaser } from '../components/ProductCard'
import { useStore } from '../store'

const featuredCollections = [
  {
    to: '/shop?category=SAREE',
    image: '/sections/saree.jpg',
    kicker: 'The drape',
    title: 'Sarees',
    body: 'Banarasi, Kanjeevaram, and light georgettes — finished for the occasion.',
    large: true,
  },
  {
    to: '/shop?category=LEHENGA',
    image: '/sections/lehenga.jpg',
    kicker: 'After dark',
    title: 'Lehengas',
    body: 'Festive sets and bridal consultations, photographed on the floor.',
    large: true,
  },
]

const smallCollections = [
  { to: '/shop?category=BLOUSE', image: '/sections/blouse.jpg', title: 'Blouses', body: 'Ready-to-wear and maggam.' },
  { to: '/shop?category=KURTA', image: '/sections/kurta.jpg', title: 'Kurtas', body: 'Cotton and linen, every day.' },
  { to: '/shop?category=DUPATTA', image: '/demo/dupatta-gold.jpg', title: 'Dupattas', body: 'Tissue and organza finish.' },
  { to: '/shop?category=ACCESSORY', image: '/demo/accessory-gold.jpg', title: 'Jewellery', body: 'Temple jhumkas and extras.' },
]

export function HomePage() {
  const store = useStore()
  const { data } = useQuery(PRODUCTS, { variables: { featured: true } })
  const items = (data?.products?.items ?? []) as ProductTeaser[]

  return (
    <main>
      <section className="hero" style={{ backgroundImage: 'url(/sections/hero.jpg)' }}>
        <div className="hero-veil" />
        <div className="hero-copy">
          <p className="eyebrow light">New season · atelier edit</p>
          <h1>
            {store.storeName}
            <em> — draped, fitted, sent.</em>
          </h1>
          <p className="lede">
            {store.tagline || 'Sarees, blouses, and occasion wear, photographed in-house and ready to ship.'}
          </p>
          <div className="hero-actions">
            <Link className="btn" to="/shop">
              Shop the collection
            </Link>
            <Link className="btn ghost light" to="/shop?category=LEHENGA">
              Bridal &amp; festive
            </Link>
          </div>
        </div>
      </section>

      <section className="trust">
        <p>
          <strong>Hand-finished</strong>
          Stitched and checked in atelier
        </p>
        <p>
          <strong>True colour</strong>
          Shot on the boutique floor
        </p>
        <p>
          <strong>Secure pay</strong>
          PhonePe, UPI, and cards
        </p>
        <p>
          <strong>Easy exchange</strong>
          7 days on unused pieces
        </p>
      </section>

      <div className="page">
        <header className="section-head">
          <p className="eyebrow">Collections</p>
          <h2>Shop the house</h2>
          <p className="muted">Six rooms. One boutique. Every piece can go in the bag and out the door.</p>
        </header>

        <div className="edit-grid">
          {featuredCollections.map((item) => (
            <Link key={item.to} className="edit large" to={item.to}>
              <img src={item.image} alt="" />
              <span>
                <p className="eyebrow light">{item.kicker}</p>
                <strong>{item.title}</strong>
                <em>{item.body}</em>
              </span>
            </Link>
          ))}
        </div>
        <div className="edit-row">
          {smallCollections.map((item) => (
            <Link key={item.to} className="edit" to={item.to}>
              <img src={item.image} alt="" />
              <span>
                <strong>{item.title}</strong>
                <em>{item.body}</em>
              </span>
            </Link>
          ))}
        </div>

        <header className="section-head">
          <p className="eyebrow">New in</p>
          <h2>Featured pieces</h2>
          <Link className="text-link" to="/shop">
            View all
          </Link>
        </header>
        <div className="grid">
          {items.map((product) => (
            <ProductCard key={product.slug} product={product} />
          ))}
        </div>
      </div>

      <section className="editorial">
        <div className="editorial-photo">
          <img src="/demo/lehenga-bridal.jpg" alt="Bridal lehenga" />
        </div>
        <div className="editorial-copy">
          <p className="eyebrow">Lookbook</p>
          <h2>The bridal atelier</h2>
          <p>
            Consultations, measurements, and a calm timeline for wedding week. Choose a lehenga from the floor, or start
            from a blouse and build the rest.
          </p>
          <Link className="btn" to="/shop?category=LEHENGA">
            Enter the bridal room
          </Link>
        </div>
      </section>

      <div className="page">
        <header className="section-head">
          <p className="eyebrow">The floor</p>
          <h2>From the maison</h2>
        </header>
        <div className="lookbook">
          <figure>
            <img src="/sections/storefront.png" alt="Storefront" />
            <figcaption>The storefront</figcaption>
          </figure>
          <figure>
            <img src="/demo/blouse-navy.jpg" alt="Stitch desk" />
            <figcaption>Stitch desk</figcaption>
          </figure>
          <figure>
            <img src="/demo/gallery-bridal.jpg" alt="Bridal looks" />
            <figcaption>Bridal looks</figcaption>
          </figure>
          <figure>
            <img src="/demo/blouse-cream.jpg" alt="Fitting" />
            <figcaption>Fitting</figcaption>
          </figure>
        </div>
      </div>
    </main>
  )
}
