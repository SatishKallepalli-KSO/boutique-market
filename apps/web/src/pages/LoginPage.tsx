import { FormEvent, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useMutation } from '@apollo/client'
import { LOGIN, REGISTER } from '../graphql/operations'
import { useAuth } from '../auth'

export function LoginPage() {
  const [params] = useSearchParams()
  const next = params.get('next') || '/'
  const navigate = useNavigate()
  const { setToken } = useAuth()
  const [mode, setMode] = useState<'login' | 'register'>('login')
  const [login] = useMutation(LOGIN)
  const [register] = useMutation(REGISTER)
  const [error, setError] = useState('')

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
    <main className="page">
      <h1>{mode === 'login' ? 'Sign in' : 'Create account'}</h1>
      <div className="tabs">
        <button className={`chip ${mode === 'login' ? 'on' : ''}`} type="button" onClick={() => setMode('login')}>
          Sign in
        </button>
        <button className={`chip ${mode === 'register' ? 'on' : ''}`} type="button" onClick={() => setMode('register')}>
          Register
        </button>
      </div>
      <form className="form" onSubmit={(e) => void onSubmit(e)}>
        {mode === 'register' ? (
          <label>
            Name
            <input name="name" required />
          </label>
        ) : null}
        <label>
          Email
          <input name="email" type="email" required />
        </label>
        <label>
          Password
          <input name="password" type="password" required minLength={8} />
        </label>
        {error ? <p className="error">{error}</p> : null}
        <button className="btn" type="submit">
          Continue
        </button>
      </form>
    </main>
  )
}
