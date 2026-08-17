export type StoreSettings = {
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

export const DEFAULT_STORE: StoreSettings = {
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

/** Demo seed only — never the product name. */
export const DEMO_STORE: StoreSettings = {
  storeName: "Ruhi's Boutique",
  tagline: 'Sarees, blouses, and occasion wear from Kukatpally',
  ownerName: 'Ruhi',
  phone: '+919908185597',
  whatsapp: '919908185597',
  email: 'hello@example.com',
  addressLine: 'Plot No. LIG-140, Opposite Basketball Ground, KPHB 7th Phase',
  city: 'Hyderabad',
  state: 'Telangana',
  pin: '500072',
  logoUrl: '/brand/mark.png',
  accentColor: '#c4a35a',
  currency: 'INR',
}
