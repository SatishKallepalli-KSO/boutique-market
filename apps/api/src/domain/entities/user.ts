import type { UserRole } from '@boutique-market/shared'

export type User = {
  id: string
  email: string
  name: string
  passwordHash: string
  role: UserRole
  createdAt: Date
}

export function isAdmin(user: User): boolean {
  return user.role === 'ADMIN'
}
