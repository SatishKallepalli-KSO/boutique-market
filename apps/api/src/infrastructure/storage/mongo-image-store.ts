import type { ImageStore, StoredImage } from '../../application/ports/image-store.js'
import { MediaModel } from '../mongodb/models.js'

export class MongoImageStore implements ImageStore {
  async save(buffer: Buffer, contentType: string, filename: string): Promise<StoredImage> {
    const doc = await MediaModel.create({ contentType, filename, data: buffer })
    const id = doc._id.toString()
    return { id, url: `/api/media/${id}`, contentType }
  }

  async get(id: string) {
    const doc = await MediaModel.findById(id).lean()
    if (!doc?.data) return null
    return { buffer: doc.data as Buffer, contentType: String(doc.contentType ?? 'application/octet-stream') }
  }
}
