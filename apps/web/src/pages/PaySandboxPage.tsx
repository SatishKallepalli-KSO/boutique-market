import { FormEvent, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { formatINR } from '../lib/money'
import { useStore } from '../store'

export function PaySandboxPage() {
  const store = useStore()
  const [params] = useSearchParams()
  const merchantOrderId = params.get('merchantOrderId') ?? ''
  const method = params.get('method') ?? 'PHONEPE'
  const amount = Number(params.get('amount') ?? 0)
  const redirect = params.get('redirect') ?? '/pay/return'
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  async function complete(state: 'COMPLETED' | 'FAILED') {
    setBusy(true)
    setError('')
    try {
      const res = await fetch('/api/pay/sandbox/complete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ merchantOrderId, state }),
      })
      if (!res.ok) throw new Error('Payment sandbox failed')
      window.location.assign(redirect)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Payment failed')
      setBusy(false)
    }
  }

  async function onCard(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const form = new FormData(event.currentTarget)
    const number = String(form.get('number')).replace(/\s/g, '')
    await complete(number.endsWith('0002') ? 'FAILED' : 'COMPLETED')
  }

  return (
    <main className="page pay-wrap">
      <div className="pay-box">
        <p className="eyebrow">{store.storeName} · secure pay</p>
        <h1>{formatINR(amount)}</h1>
        <p className="muted tiny">Reference {merchantOrderId}</p>
        {method === 'CARD' ? (
          <form className="form" onSubmit={(e) => void onCard(e)}>
            <img className="pay-photo" src="/demo/accessory-gold.jpg" alt="" />
            <label>
              Card number
              <input name="number" required placeholder="4111 1111 1111 1111" defaultValue="4111111111111111" />
            </label>
            <div className="form-grid">
              <label>
                Expiry
                <input name="exp" required placeholder="12/28" defaultValue="12/28" />
              </label>
              <label>
                CVV
                <input name="cvv" required placeholder="123" defaultValue="123" />
              </label>
            </div>
            <p className="muted tiny">Card ending 0002 declines. Any other number succeeds.</p>
            {error ? <p className="error">{error}</p> : null}
            <button className="btn full" disabled={busy} type="submit">
              Pay by card
            </button>
          </form>
        ) : (
          <>
            <img className="pay-photo" src="/brand/mark.png" alt="" />
            <p>Complete payment in the PhonePe sandbox to confirm this order.</p>
            {error ? <p className="error">{error}</p> : null}
            <button className="btn accent full" disabled={busy} type="button" onClick={() => void complete('COMPLETED')}>
              Pay with PhonePe
            </button>
            <button className="text-btn" disabled={busy} type="button" onClick={() => void complete('FAILED')}>
              Simulate a decline
            </button>
          </>
        )}
      </div>
    </main>
  )
}
