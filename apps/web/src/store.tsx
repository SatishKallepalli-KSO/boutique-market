import { createContext, useContext, useEffect, type ReactNode } from 'react'
import { useQuery } from '@apollo/client'
import { STORE } from './graphql/operations'

export type StoreBrand = {
  storeName: string
  tagline: string
  ownerName: string
  phone: string
  whatsapp: string
  email: string
  addressLine: string
  city: string
  state: string
  pin: string
  logoUrl: string
  accentColor: string
  currency: string
}

const fallback: StoreBrand = {
  storeName: 'Your Boutique',
  tagline: 'Ethnic wear, made personal',
  ownerName: '',
  phone: '',
  whatsapp: '',
  email: '',
  addressLine: '',
  city: '',
  state: '',
  pin: '',
  logoUrl: '',
  accentColor: '#c4a35a',
  currency: 'INR',
}

const StoreContext = createContext<StoreBrand>(fallback)

export function StoreProvider({ children }: { children: ReactNode }) {
  const { data } = useQuery(STORE)
  const store: StoreBrand = data?.store ?? fallback

  useEffect(() => {
    document.documentElement.style.setProperty('--accent', store.accentColor)
    document.documentElement.style.setProperty('--accent-deep', store.accentColor)
    document.title = store.storeName
  }, [store.accentColor, store.storeName])

  return <StoreContext.Provider value={store}>{children}</StoreContext.Provider>
}

export function useStore() {
  return useContext(StoreContext)
}
