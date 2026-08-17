export const CATEGORIES = [
  'SAREE',
  'BLOUSE',
  'LEHENGA',
  'KURTA',
  'DUPATTA',
  'ACCESSORY',
] as const

export type Category = (typeof CATEGORIES)[number]

export const CATEGORY_LABELS: Record<Category, string> = {
  SAREE: 'Sarees',
  BLOUSE: 'Blouses',
  LEHENGA: 'Lehengas',
  KURTA: 'Kurtas',
  DUPATTA: 'Dupattas',
  ACCESSORY: 'Accessories',
}

export function isCategory(value: string): value is Category {
  return (CATEGORIES as readonly string[]).includes(value)
}
