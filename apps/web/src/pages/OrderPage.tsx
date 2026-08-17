import { useParams } from 'react-router-dom'
import { useQuery } from '@apollo/client'
import { ORDER } from '../graphql/operations'
import { formatINR } from '../lib/money'

export function OrderPage() {
  const { id } = useParams()
  const { data } = useQuery(ORDER, { variables: { id } })
  const order = data?.order
  if (!order) return <main className="page">Looking up your order…</main>

  return (
    <main className="page">
      <h1>Order {order.id.slice(-8)}</h1>
      <p>
        Status · <strong>{order.status}</strong> · {order.payment.method} · {order.payment.state}
      </p>
      <ul>
        {order.items.map((item: { title: string; quantity: number; priceInPaise: number }, index: number) => (
          <li key={index}>
            {item.title} × {item.quantity} — {formatINR(item.priceInPaise * item.quantity)}
          </li>
        ))}
      </ul>
      <p>Total {formatINR(order.subtotalPaise)}</p>
      <p className="muted">
        Ship to {order.shipping.name}, {order.shipping.line1}, {order.shipping.city} {order.shipping.pin}
      </p>
    </main>
  )
}
