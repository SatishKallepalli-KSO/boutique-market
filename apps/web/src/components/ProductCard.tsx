import { Link } from 'react-router-dom'
import { CATEGORY_LABELS, type Category } from '@boutique-market/shared'
import { formatINR } from '../lib/money'

export type ProductTeaser = {
  slug: string
  title: string
  category?: Category
  priceInPaise: number
  compareAtPaise?: number | null
  stock?: number
  images: { url: string; alt: string }[]
}

export function ProductCard({ product }: { product: ProductTeaser }) {
  const image = product.images[0]
  const hover = product.images[1]
  const sale = Boolean(product.compareAtPaise && product.compareAtPaise > product.priceInPaise)

  return (
    <Link className="card" to={`/product/${product.slug}`}>
      <div className="card-media">
        {image ? <img src={image.url} alt={image.alt || product.title} /> : null}
        {hover ? <img className="hover-img" src={hover.url} alt="" /> : null}
        {sale ? <span className="badge">The edit</span> : null}
        <span className="card-cta">View piece</span>
      </div>
      <div className="card-body">
        {product.category ? <p className="card-cat">{CATEGORY_LABELS[product.category]}</p> : null}
        <div className="card-title">{product.title}</div>
        <div className="price">
          {formatINR(product.priceInPaise)}
          {sale ? <span className="compare">{formatINR(product.compareAtPaise!)}</span> : null}
        </div>
      </div>
    </Link>
  )
}
