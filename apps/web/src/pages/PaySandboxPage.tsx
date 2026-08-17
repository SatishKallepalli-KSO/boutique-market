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
    <main className="page">
      <div className="pay-box">
        <p className="muted">Sandbox checkout · {store.storeName}</p>
        <h1>{formatINR(amount)}</h1>
        <p className="muted">Order {merchantOrderId}</p>
        {method === 'CARD' ? (
          <form className="form" onSubmit={(e) => void onCard(e)}>
            <label>
              Card number
              <input name="number" required placeholder="4111 1111 1111 1111" />
            </label>
            <label>
              Expiry
              <input name="exp" required placeholder="12/28" />
            </label>
            <label>
              CVV
              <input name="cvv" required placeholder="123" />
            </label>
            <p className="muted">Use any future expiry. Card ending 0002 fails; anything else succeeds.</p>
            {error ? <p className="error">{error}</p> : null}
            <button className="btn" disabled={busy} type="submit">
              Pay by card
            </button>
          </form>
        ) : (
          <>
            <p>This is the PhonePe sandbox. No merchant KYC is configured, so payment is simulated.</p>
            {error ? <p className="error">{error}</p> : null}
            <button className="btn accent" disabled={busy} type="button" onClick={() => void complete('COMPLETED')}>
              Pay with PhonePe
            </button>
            <p>
              <button className="btn ghost" disabled={busy} type="button" onClick={() => void complete('FAILED')}>
                Simulate failure
              </button>
            </p>
          </>
        )}
      </div>
    </main>
  )
}
