import { useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { useMutation } from '@apollo/client'
import { CONFIRM } from '../graphql/operations'
import { formatINR } from '../lib/money'

export function PayReturnPage() {
  const [params] = useSearchParams()
  const merchantOrderId = params.get('merchantOrderId') ?? ''
  const [confirm] = useMutation(CONFIRM)
  const [order, setOrder] = useState<{ id: string; status: string; subtotalPaise: number } | null>(null)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!merchantOrderId) return
    confirm({ variables: { merchantOrderId } })
      .then((result) => setOrder(result.data?.confirmPayment ?? null))
      .catch((err: Error) => setError(err.message))
  }, [confirm, merchantOrderId])

  return (
    <main className="page">
      <h1>{order?.status === 'PAID' ? 'Payment received' : 'Confirming payment'}</h1>
      {order ? (
        <p>
          Order <Link to={`/order/${order.id}`}>{order.id.slice(-8)}</Link> · {formatINR(order.subtotalPaise)} · {order.status}
        </p>
      ) : (
        <p className="muted">Talking to the payment gateway…</p>
      )}
      {error ? <p className="error">{error}</p> : null}
      <p>
        <Link to="/orders">View orders</Link>
      </p>
    </main>
  )
}
