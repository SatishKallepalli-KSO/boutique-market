import { Link } from 'react-router-dom'
import { formatINR } from '../lib/money'

export type ProductTeaser = {
  slug: string
  title: string
  priceInPaise: number
  compareAtPaise?: number | null
  images: { url: string; alt: string }[]
}

export function ProductCard({ product }: { product: ProductTeaser }) {
  const image = product.images[0]
  return (
    <Link className="card" to={`/product/${product.slug}`}>
      <div className="card-media">
        {image ? <img src={image.url} alt={image.alt || product.title} /> : null}
      </div>
      <div className="card-body">
        <div>{product.title}</div>
        <div className="price">
          {formatINR(product.priceInPaise)}
          {product.compareAtPaise ? <span className="compare">{formatINR(product.compareAtPaise)}</span> : null}
        </div>
      </div>
    </Link>
  )
}
