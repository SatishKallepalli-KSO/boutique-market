import path from 'node:path'
import { fileURLToPath } from 'node:url'
import dotenv from 'dotenv'

dotenv.config({ path: path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../../.env') })
dotenv.config()

function required(name: string, fallback?: string): string {
  const value = process.env[name] ?? fallback
  if (!value) {
    throw new Error(`Missing required env var ${name}`)
  }
  return value
}

export const config = {
  port: Number(process.env.PORT ?? 4000),
  nodeEnv: process.env.NODE_ENV ?? 'development',
  mongodbUri: process.env.MONGODB_URI ?? '',
  appUrl: (process.env.APP_URL ?? 'http://localhost:5177').replace(/\/$/, ''),
  jwtSecret: required('JWT_SECRET', 'dev-only-change-me-boutique-market'),
  adminEmail: (process.env.ADMIN_EMAIL ?? 'admin@example.com').toLowerCase(),
  adminPassword: required('ADMIN_PASSWORD', 'ChangeMe!admin'),
  seedDemo: (process.env.SEED_DEMO ?? '1') !== '0',
  storeOverrides: {
    storeName: process.env.STORE_NAME,
    tagline: process.env.STORE_TAGLINE,
    ownerName: process.env.STORE_OWNER,
    phone: process.env.STORE_PHONE,
    whatsapp: process.env.STORE_WHATSAPP,
    email: process.env.STORE_EMAIL,
    addressLine: process.env.STORE_ADDRESS,
    accentColor: process.env.STORE_ACCENT,
  },
  phonepe: {
    clientId: process.env.PHONEPE_CLIENT_ID ?? '',
    clientSecret: process.env.PHONEPE_CLIENT_SECRET ?? '',
    clientVersion: Number(process.env.PHONEPE_CLIENT_VERSION ?? 1),
    env: (process.env.PHONEPE_ENV ?? 'SANDBOX') as 'SANDBOX' | 'PRODUCTION',
    callbackUsername: process.env.PHONEPE_CALLBACK_USERNAME ?? '',
    callbackPassword: process.env.PHONEPE_CALLBACK_PASSWORD ?? '',
  },
  get useMemoryDb() {
    return !this.mongodbUri || process.env.USE_MEMORY_DB === '1'
  },
  get isProd() {
    return this.nodeEnv === 'production'
  },
  get usePhonePe() {
    return Boolean(this.phonepe.clientId && this.phonepe.clientSecret)
  },
}
