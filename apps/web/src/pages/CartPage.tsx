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
      <main className="page">
        <h1>Bag</h1>
        <p>
          <Link to="/login?next=/cart">Sign in</Link> to keep your bag across devices.
        </p>
      </main>
    )
  }

  return (
    <main className="page">
      <h1>Bag</h1>
      {items.length === 0 ? (
        <p>
          Empty for now. <Link to="/shop">Browse the floor</Link>
        </p>
      ) : (
        <>
          <table className="table">
            <tbody>
              {items.map((item) => (
                <tr key={item.id}>
                  <td>
                    <strong>{item.title}</strong>
                    <div className="muted">{item.size}</div>
                  </td>
                  <td>
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
                  </td>
                  <td>{formatINR(item.priceInPaise * item.quantity)}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <p className="row">
            <span>Subtotal</span>
            <strong>{formatINR(subtotal)}</strong>
          </p>
          <Link className="btn" to="/checkout">
            Checkout
          </Link>
        </>
      )}
    </main>
  )
}
