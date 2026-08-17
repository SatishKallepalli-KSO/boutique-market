import { Link } from 'react-router-dom'
import { useQuery } from '@apollo/client'
import { MY_ORDERS } from '../graphql/operations'
import { formatINR } from '../lib/money'

export function OrdersPage() {
  const { data } = useQuery(MY_ORDERS)
  const orders = data?.myOrders ?? []

  return (
    <main className="page">
      <h1>Orders</h1>
      {orders.length === 0 ? <p className="muted">No orders yet.</p> : null}
      <table className="table">
        <tbody>
          {orders.map((order: { id: string; status: string; subtotalPaise: number; createdAt: string }) => (
            <tr key={order.id}>
              <td>
                <Link to={`/order/${order.id}`}>{order.id.slice(-8)}</Link>
                <div className="muted">{new Date(order.createdAt).toLocaleString('en-IN')}</div>
              </td>
              <td>{order.status}</td>
              <td>{formatINR(order.subtotalPaise)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </main>
  )
}
