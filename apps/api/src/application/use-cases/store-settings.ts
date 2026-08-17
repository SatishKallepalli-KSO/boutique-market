import { z } from 'zod'
import { ForbiddenError } from '../../domain/errors.js'
import type { User } from '../../domain/entities/user.js'
import type { StoreRepository } from '../../domain/repositories/store-repository.js'

const storeSchema = z.object({
  storeName: z.string().min(2).max(80),
  tagline: z.string().max(160).default(''),
  ownerName: z.string().max(80).default(''),
  phone: z.string().max(20).default(''),
  whatsapp: z.string().max(20).default(''),
  email: z.string().max(120).default(''),
  addressLine: z.string().max(200).default(''),
  city: z.string().max(80).default(''),
  state: z.string().max(80).default(''),
  pin: z.string().max(12).default(''),
  logoUrl: z.string().max(500).default(''),
  accentColor: z.string().regex(/^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/).default('#c4a35a'),
  currency: z.string().min(3).max(3).default('INR'),
})

export class StoreSettingsUseCases {
  constructor(private readonly stores: StoreRepository) {}

  get() {
    return this.stores.get()
  }

  async update(user: User | null, input: unknown) {
    if (!user || user.role !== 'ADMIN') {
      throw new ForbiddenError('Admin access required')
    }
    const current = await this.stores.get()
    const data = storeSchema.partial().parse(input)
    return this.stores.save({ ...current, ...data })
  }
}
