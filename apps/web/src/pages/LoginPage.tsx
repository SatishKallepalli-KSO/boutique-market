import { FormEvent, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useMutation } from '@apollo/client'
import { LOGIN, REGISTER } from '../graphql/operations'
import { useAuth } from '../auth'
import { useStore } from '../store'

const DEMO = {
  customer: { email: 'customer@example.com', password: 'ChangeMe!shop' },
  admin: { email: 'admin@example.com', password: 'ChangeMe!admin' },
}

export function LoginPage() {
  const store = useStore()
  const [params] = useSearchParams()
  const next = params.get('next') || '/'
  const navigate = useNavigate()
  const { setToken } = useAuth()
  const [mode, setMode] = useState<'login' | 'register'>('login')
  const [login] = useMutation(LOGIN)
  const [register] = useMutation(REGISTER)
  const [error, setError] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const form = new FormData(event.currentTarget)
    setError('')
    try {
      const input = {
        email: String(form.get('email')),
        password: String(form.get('password')),
        ...(mode === 'register' ? { name: String(form.get('name')) } : {}),
      }
      const result = mode === 'login' ? await login({ variables: { input } }) : await register({ variables: { input } })
      const token = result.data?.login?.token ?? result.data?.register?.token
      setToken(token)
      navigate(next)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not sign in')
    }
  }

  return (
    <main className="auth-page">
      <div className="auth-photo" style={{ backgroundImage: 'url(/sections/hero.jpg)' }}>
        <div>
          <p className="eyebrow light">Client account</p>
          <h1>{store.storeName}</h1>
        </div>
      </div>
      <div className="auth-panel">
        <div className="tabs">
          <button className={`chip ${mode === 'login' ? 'on' : ''}`} type="button" onClick={() => setMode('login')}>
            Sign in
          </button>
          <button className={`chip ${mode === 'register' ? 'on' : ''}`} type="button" onClick={() => setMode('register')}>
            Create account
          </button>
        </div>
        <h2>{mode === 'login' ? 'Welcome back' : 'Join the house'}</h2>
        {mode === 'login' ? (
          <p className="muted tiny">
            Demo shopper{' '}
            <button
              className="text-btn"
              type="button"
              onClick={() => {
                setEmail(DEMO.customer.email)
                setPassword(DEMO.customer.password)
              }}
            >
              {DEMO.customer.email}
            </button>
            {' · '}
            admin{' '}
            <button
              className="text-btn"
              type="button"
              onClick={() => {
                setEmail(DEMO.admin.email)
                setPassword(DEMO.admin.password)
              }}
            >
              {DEMO.admin.email}
            </button>
          </p>
        ) : null}
        <form className="form" onSubmit={(e) => void onSubmit(e)}>
          {mode === 'register' ? (
            <label>
              Name
              <input name="name" required />
            </label>
          ) : null}
          <label>
            Email
            <input name="email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
          </label>
          <label>
            Password
            <input
              name="password"
              type="password"
              required
              minLength={8}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </label>
          {error ? <p className="error">{error}</p> : null}
          <button className="btn full" type="submit">
            Continue
          </button>
        </form>
      </div>
    </main>
  )
}
