import { useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { useMutation, useQuery } from '@apollo/client'
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
  const [error, setError] = useState('')

  if (loading) return <main className="page">Loading…</main>
  if (!product) return <main className="page">This piece is no longer on the floor.</main>

  const chosen = size || product.sizes[0] || undefined

  async function onAdd() {
    if (!user) {
      navigate(`/login?next=/product/${slug}`)
      return
    }
    setError('')
    try {
      await add({ variables: { productId: product.id, quantity: 1, size: chosen } })
      navigate('/cart')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not add to bag')
    }
  }

  return (
    <main className="page product">
      <div className="card-media">
        {product.images[0] ? <img src={product.images[0].url} alt={product.title} /> : null}
      </div>
      <div>
        <p className="muted">{product.category}</p>
        <h1>{product.title}</h1>
        <p className="price">
          {formatINR(product.priceInPaise)}
          {product.compareAtPaise ? <span className="compare">{formatINR(product.compareAtPaise)}</span> : null}
        </p>
        <p>{product.description}</p>
        {product.fabric ? <p className="muted">Fabric · {product.fabric}</p> : null}
        {product.sizes.length ? (
          <label>
            Size
            <select value={chosen} onChange={(e) => setSize(e.target.value)}>
              {product.sizes.map((value: string) => (
                <option key={value}>{value}</option>
              ))}
            </select>
          </label>
        ) : null}
        {error ? <p className="error">{error}</p> : null}
        <p>
          <button className="btn" type="button" disabled={adding || product.stock < 1} onClick={() => void onAdd()}>
            {product.stock < 1 ? 'Sold out' : 'Add to bag'}
          </button>
        </p>
        <p>
          <Link to="/shop">Back to shop</Link>
        </p>
      </div>
    </main>
  )
}
