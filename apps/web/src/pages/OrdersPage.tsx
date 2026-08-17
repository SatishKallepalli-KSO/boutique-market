import { Link } from 'react-router-dom'
import { useQuery } from '@apollo/client'
import { MY_ORDERS } from '../graphql/operations'
import { formatINR } from '../lib/money'

export function OrdersPage() {
  const { data } = useQuery(MY_ORDERS)
  const orders = data?.myOrders ?? []

  return (
    <main className="page">
      <header className="section-head">
        <p className="eyebrow">Client care</p>
        <h1>Orders</h1>
      </header>
      {orders.length === 0 ? (
        <div className="empty">
          <p>No orders yet.</p>
          <Link className="btn" to="/shop">
            Begin with the floor
          </Link>
        </div>
      ) : (
        <div className="order-list">
          {orders.map((order: { id: string; status: string; subtotalPaise: number; createdAt: string }) => (
            <Link className="order-row" key={order.id} to={`/order/${order.id}`}>
              <div>
                <strong>No. {order.id.slice(-8)}</strong>
                <p className="muted">{new Date(order.createdAt).toLocaleString('en-IN')}</p>
              </div>
              <span className={`status ${order.status.toLowerCase()}`}>{order.status.replace('_', ' ')}</span>
              <span className="price">{formatINR(order.subtotalPaise)}</span>
            </Link>
          ))}
        </div>
      )}
    </main>
  )
}
