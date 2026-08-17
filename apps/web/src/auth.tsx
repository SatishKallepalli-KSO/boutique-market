import { createContext, useContext, useMemo, type ReactNode } from 'react'
import { useQuery } from '@apollo/client'
import { ME } from './graphql/operations'

export type AuthUser = { id: string; email: string; name: string; role: 'CUSTOMER' | 'ADMIN' }
export type CartItem = {
  id: string
  productId: string
  title: string
  priceInPaise: number
  quantity: number
  size?: string | null
  imageUrl: string
}

type AuthState = {
  user: AuthUser | null
  cartCount: number
  setToken: (token: string | null) => void
}

const AuthContext = createContext<AuthState>({
  user: null,
  cartCount: 0,
  setToken: () => undefined,
})

export function AuthProvider({ children }: { children: ReactNode }) {
  const { data, refetch } = useQuery(ME)

  const value = useMemo<AuthState>(
    () => ({
      user: data?.me ?? null,
      cartCount: data?.myCart?.items?.reduce((n: number, i: CartItem) => n + i.quantity, 0) ?? 0,
      setToken: (token) => {
        if (token) localStorage.setItem('bm_token', token)
        else localStorage.removeItem('bm_token')
        void refetch()
      },
    }),
    [data, refetch],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  return useContext(AuthContext)
}
