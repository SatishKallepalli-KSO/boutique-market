export const ORDER_STATUSES = [
  'PENDING_PAYMENT',
  'PAID',
  'FULFILLING',
  'SHIPPED',
  'DELIVERED',
  'CANCELLED',
] as const

export type OrderStatus = (typeof ORDER_STATUSES)[number]

export const PAYMENT_METHODS = ['PHONEPE', 'CARD'] as const
export type PaymentMethod = (typeof PAYMENT_METHODS)[number]

export const PAYMENT_STATES = ['PENDING', 'COMPLETED', 'FAILED'] as const
export type PaymentState = (typeof PAYMENT_STATES)[number]

export const USER_ROLES = ['CUSTOMER', 'ADMIN'] as const
export type UserRole = (typeof USER_ROLES)[number]
