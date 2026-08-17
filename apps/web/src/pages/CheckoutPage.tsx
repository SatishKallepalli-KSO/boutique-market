import { FormEvent, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useMutation, useQuery } from '@apollo/client'
import { CHECKOUT, ME } from '../graphql/operations'
import { formatINR } from '../lib/money'

export function CheckoutPage() {
  const navigate = useNavigate()
  const { data } = useQuery(ME)
  const [checkout, { loading }] = useMutation(CHECKOUT)
  const [method, setMethod] = useState<'PHONEPE' | 'CARD'>('PHONEPE')
  const [error, setError] = useState('')

  if (!data?.me) {
    return (
      <main className="page">
        <p>
          <Link to="/login?next=/checkout">Sign in</Link> to checkout.
        </p>
      </main>
    )
  }

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const form = new FormData(event.currentTarget)
    setError('')
    try {
      const result = await checkout({
        variables: {
          input: {
            method,
            shipping: {
              name: String(form.get('name')),
              phone: String(form.get('phone')),
              line1: String(form.get('line1')),
              city: String(form.get('city')),
              state: String(form.get('state')),
              pin: String(form.get('pin')),
            },
          },
        },
      })
      const url = result.data?.checkout?.redirectUrl
      if (url) window.location.assign(url)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Checkout failed')
    }
  }

  return (
    <main className="page">
      <h1>Checkout</h1>
      <p className="muted">Pay {formatINR(data.myCart?.subtotalPaise ?? 0)} with PhonePe or card.</p>
      <form className="form wide" onSubmit={(e) => void onSubmit(e)}>
        <label>
          Full name
          <input name="name" required defaultValue={data.me.name} />
        </label>
        <label>
          Phone
          <input name="phone" required placeholder="9908185597" />
        </label>
        <label>
          Address
          <input name="line1" required />
        </label>
        <label>
          City
          <input name="city" required />
        </label>
        <label>
          State
          <input name="state" required defaultValue="Telangana" />
        </label>
        <label>
          PIN
          <input name="pin" required />
        </label>
        <div className="filters">
          <button type="button" className={`chip ${method === 'PHONEPE' ? 'on' : ''}`} onClick={() => setMethod('PHONEPE')}>
            PhonePe / UPI
          </button>
          <button type="button" className={`chip ${method === 'CARD' ? 'on' : ''}`} onClick={() => setMethod('CARD')}>
            Card
          </button>
        </div>
        {error ? <p className="error">{error}</p> : null}
        <button className="btn" disabled={loading} type="submit">
          Continue to pay
        </button>
      </form>
      <p>
        <button className="btn ghost" type="button" onClick={() => navigate('/cart')}>
          Back to bag
        </button>
      </p>
    </main>
  )
}
