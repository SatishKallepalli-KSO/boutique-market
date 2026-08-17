import { useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { useMutation, useQuery } from '@apollo/client'
import { CATEGORY_LABELS, type Category } from '@boutique-market/shared'
import { ADD_TO_CART, PRODUCT } from '../graphql/operations'
import { formatINR } from '../lib/money'
import { useAuth } from '../auth'

export function ProductPage() {
  const { slug } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const { data, loading } = useQuery(PRODUCT, { variables: { slug } })
  const [add, { loading: adding }] = useMutation(ADD_TO_CART, { refetchQueries: ['Me'] })
  const product = data?.product
  const [size, setSize] = useState<string>('')
  const [active, setActive] = useState(0)
  const [error, setError] = useState('')
  const [added, setAdded] = useState(false)

  if (loading) return <main className="page muted">Arranging the piece…</main>
  if (!product) return <main className="page">This piece has left the floor.</main>

  const chosen = size || product.sizes[0] || undefined
  const photos = product.images as { url: string; alt: string }[]
  const current = photos[active] ?? photos[0]
  const sale = Boolean(product.compareAtPaise && product.compareAtPaise > product.priceInPaise)
  const category = product.category as Category

  async function onAdd() {
    if (!user) {
      navigate(`/login?next=/product/${slug}`)
      return
    }
    setError('')
    try {
      await add({ variables: { productId: product.id, quantity: 1, size: chosen } })
      setAdded(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not add to bag')
    }
  }

  return (
    <main className="page product">
      <div className="pdp-gallery">
        <div className="pdp-stage">
          {current ? <img src={current.url} alt={current.alt || product.title} /> : null}
        </div>
        {photos.length > 1 ? (
          <div className="thumbs">
            {photos.map((photo, index) => (
              <button
                key={photo.url}
                type="button"
                className={index === active ? 'on' : ''}
                onClick={() => setActive(index)}
              >
                <img src={photo.url} alt="" />
              </button>
            ))}
          </div>
        ) : null}
      </div>

      <aside className="pdp-buy">
        <p className="eyebrow">
          <Link to={`/shop?category=${category}`}>{CATEGORY_LABELS[category]}</Link>
        </p>
        <h1>{product.title}</h1>
        <p className="price lg">
          {formatINR(product.priceInPaise)}
          {sale ? <span className="compare">{formatINR(product.compareAtPaise)}</span> : null}
        </p>
        <p className="lede tight">{product.description}</p>
        <ul className="meta">
          {product.fabric ? (
            <li>
              <span>Fabric</span>
              {product.fabric}
            </li>
          ) : null}
          {product.color ? (
            <li>
              <span>Colour</span>
              {product.color}
            </li>
          ) : null}
          <li>
            <span>Availability</span>
            {product.stock < 1 ? 'Sold out' : product.stock <= 4 ? `Only ${product.stock} left` : 'Ready to ship'}
          </li>
        </ul>
        {product.sizes.length ? (
          <div className="size-block">
            <p className="eyebrow">Size</p>
            <div className="size-pills">
              {product.sizes.map((value: string) => (
                <button
                  key={value}
                  type="button"
                  className={chosen === value ? 'on' : ''}
                  onClick={() => setSize(value)}
                >
                  {value}
                </button>
              ))}
            </div>
          </div>
        ) : null}
        {error ? <p className="error">{error}</p> : null}
        <div className="pdp-actions">
          <button className="btn full" type="button" disabled={adding || product.stock < 1} onClick={() => void onAdd()}>
            {product.stock < 1 ? 'Sold out' : adding ? 'Adding…' : added ? 'Added to bag' : 'Add to bag'}
          </button>
          {added ? (
            <Link className="btn ghost full" to="/cart">
              View bag
            </Link>
          ) : null}
        </div>
        <details open>
          <summary>Shipping &amp; returns</summary>
          <p>Dispatched in 3–5 days. Complimentary shipping above ₹2,999. Unused pieces may be exchanged within 7 days.</p>
        </details>
        <details>
          <summary>Authenticity</summary>
          <p>Photographed in-house. Colour and weave may vary slightly — that is the nature of atelier work.</p>
        </details>
      </aside>
    </main>
  )
}
