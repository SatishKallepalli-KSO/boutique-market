import type { StoreSettings } from '@boutique-market/shared'

export type Store = StoreSettings & { id: string; updatedAt: Date }
