import type { Store } from '../entities/store.js'
import type { StoreSettings } from '@boutique-market/shared'

export interface StoreRepository {
  get(): Promise<Store>
  save(settings: StoreSettings): Promise<Store>
}
