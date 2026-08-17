import type { UserRole } from '@boutique-market/shared'

export type TokenPayload = {
  sub: string
  email: string
  role: UserRole
}

export interface TokenService {
  sign(payload: TokenPayload): string
  verify(token: string): TokenPayload
}
