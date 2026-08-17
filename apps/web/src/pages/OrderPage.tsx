import { Link, useParams } from 'react-router-dom'
import { useQuery } from '@apollo/client'
import { ORDER } from '../graphql/operations'
import { formatINR } from '../lib/money'

export function OrderPage() {
  const { id } = useParams()
  const { data } = useQuery(ORDER, { variables: { id } })
  const order = data?.order
  if (!order) return <main className="page muted">Looking up your order…</main>

  return (
    <main className="page bag-layout">
      <div>
        <p className="eyebrow">Order {order.id.slice(-8)}</p>
        <h1>{order.status === 'PAID' ? 'Confirmed' : order.status.replace('_', ' ')}</h1>
        <p className="muted">
          {order.payment.method} · {order.payment.state}
        </p>
        <div className="bag-list">
          {order.items.map(
            (
              item: { title: string; quantity: number; priceInPaise: number; size?: string; imageUrl?: string },
              index: number,
            ) => (
              <article key={index} className="bag-row">
                {item.imageUrl ? <img src={item.imageUrl} alt="" /> : null}
                <div>
                  <h2>{item.title}</h2>
                  <p className="muted">
                    {item.size} · × {item.quantity}
                  </p>
                </div>
                <p className="price">{formatINR(item.priceInPaise * item.quantity)}</p>
              </article>
            ),
          )}
        </div>
      </div>
      <aside className="summary">
        <p className="eyebrow">Delivery</p>
        <p>
          {order.shipping.name}
          <br />
          {order.shipping.line1}
          <br />
          {order.shipping.city} {order.shipping.pin}
        </p>
        <p className="row total">
          <span>Total</span>
          <strong>{formatINR(order.subtotalPaise)}</strong>
        </p>
        <Link className="btn ghost full" to="/shop">
          Continue shopping
        </Link>
      </aside>
    </main>
  )
}
