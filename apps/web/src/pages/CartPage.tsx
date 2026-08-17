import { Link } from 'react-router-dom'
import { useMutation, useQuery } from '@apollo/client'
import { ME, UPDATE_CART } from '../graphql/operations'
import { formatINR } from '../lib/money'
import type { CartItem } from '../auth'

export function CartPage() {
  const { data } = useQuery(ME)
  const [update] = useMutation(UPDATE_CART, { refetchQueries: ['Me'] })
  const items = (data?.myCart?.items ?? []) as CartItem[]
  const subtotal = data?.myCart?.subtotalPaise ?? 0

  if (!data?.me) {
    return (
      <main className="page split-auth">
        <div>
          <p className="eyebrow">Your bag</p>
          <h1>Sign in to keep your pieces</h1>
          <p className="muted">The bag follows your account, so you can finish checkout on any device.</p>
          <p>
            <Link className="btn" to="/login?next=/cart">
              Sign in
            </Link>
          </p>
        </div>
        <img src="/sections/saree.jpg" alt="" />
      </main>
    )
  }

  return (
    <main className="page">
      <header className="section-head">
        <p className="eyebrow">Atelier bag</p>
        <h1>Your selection</h1>
      </header>
      {items.length === 0 ? (
        <div className="empty">
          <p>The bag is empty.</p>
          <Link className="btn" to="/shop">
            Continue shopping
          </Link>
        </div>
      ) : (
        <div className="bag-layout">
          <div className="bag-list">
            {items.map((item) => (
              <article key={item.id} className="bag-row">
                {item.imageUrl ? <img src={item.imageUrl} alt="" /> : <div className="cart-thumb" />}
                <div>
                  <h2>{item.title}</h2>
                  <p className="muted">{item.size}</p>
                  <p className="price">{formatINR(item.priceInPaise * item.quantity)}</p>
                </div>
                <label>
                  Qty
                  <select
                    value={item.quantity}
                    onChange={(e) =>
                      void update({ variables: { itemId: item.id, quantity: Number(e.target.value) } })
                    }
                  >
                    {[0, 1, 2, 3, 4, 5].map((n) => (
                      <option key={n} value={n}>
                        {n === 0 ? 'Remove' : n}
                      </option>
                    ))}
                  </select>
                </label>
              </article>
            ))}
          </div>
          <aside className="summary">
            <p className="eyebrow">Order summary</p>
            <p className="row">
              <span>Subtotal</span>
              <span>{formatINR(subtotal)}</span>
            </p>
            <p className="row">
              <span>Shipping</span>
              <span>Complimentary</span>
            </p>
            <p className="row total">
              <span>Total</span>
              <strong>{formatINR(subtotal)}</strong>
            </p>
            <Link className="btn full" to="/checkout">
              Checkout
            </Link>
            <p className="muted tiny">PhonePe, UPI, and cards. Shipping in 3–5 days.</p>
          </aside>
        </div>
      )}
    </main>
  )
}
