import { FormEvent, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useMutation, useQuery } from '@apollo/client'
import { CHECKOUT, ME } from '../graphql/operations'
import { formatINR } from '../lib/money'
import type { CartItem } from '../auth'

export function CheckoutPage() {
  const navigate = useNavigate()
  const { data } = useQuery(ME)
  const [checkout, { loading }] = useMutation(CHECKOUT)
  const [method, setMethod] = useState<'PHONEPE' | 'CARD'>('PHONEPE')
  const [error, setError] = useState('')
  const items = (data?.myCart?.items ?? []) as CartItem[]
  const subtotal = data?.myCart?.subtotalPaise ?? 0

  if (!data?.me) {
    return (
      <main className="page">
        <p>
          <Link className="btn" to="/login?next=/checkout">
            Sign in to checkout
          </Link>
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
    <main className="page bag-layout">
      <div>
        <p className="eyebrow">Checkout</p>
        <h1>Delivery &amp; payment</h1>
        <form className="form wide" onSubmit={(e) => void onSubmit(e)}>
          <div className="form-grid">
            <label>
              Full name
              <input name="name" required defaultValue={data.me.name} />
            </label>
            <label>
              Phone
              <input name="phone" required placeholder="9908185597" defaultValue="9908185597" />
            </label>
          </div>
          <label>
            Address
            <input name="line1" required defaultValue="Plot LIG-140, KPHB 7th Phase" />
          </label>
          <div className="form-grid three">
            <label>
              City
              <input name="city" required defaultValue="Hyderabad" />
            </label>
            <label>
              State
              <input name="state" required defaultValue="Telangana" />
            </label>
            <label>
              PIN
              <input name="pin" required defaultValue="500072" />
            </label>
          </div>
          <p className="eyebrow">Pay with</p>
          <div className="pay-methods">
            <button type="button" className={method === 'PHONEPE' ? 'on' : ''} onClick={() => setMethod('PHONEPE')}>
              <strong>PhonePe / UPI</strong>
              <span>Pay in the PhonePe checkout</span>
            </button>
            <button type="button" className={method === 'CARD' ? 'on' : ''} onClick={() => setMethod('CARD')}>
              <strong>Card</strong>
              <span>Visa, Mastercard, RuPay</span>
            </button>
          </div>
          {error ? <p className="error">{error}</p> : null}
          <button className="btn full" disabled={loading} type="submit">
            {loading ? 'Opening payment…' : `Pay ${formatINR(subtotal)}`}
          </button>
          <button className="text-btn" type="button" onClick={() => navigate('/cart')}>
            Return to bag
          </button>
        </form>
      </div>
      <aside className="summary">
        <p className="eyebrow">Your pieces</p>
        {items.map((item) => (
          <div key={item.id} className="summary-item">
            {item.imageUrl ? <img src={item.imageUrl} alt="" /> : null}
            <div>
              <p>{item.title}</p>
              <p className="muted">
                {item.size} · × {item.quantity}
              </p>
            </div>
            <span>{formatINR(item.priceInPaise * item.quantity)}</span>
          </div>
        ))}
        <p className="row total">
          <span>Total</span>
          <strong>{formatINR(subtotal)}</strong>
        </p>
      </aside>
    </main>
  )
}
