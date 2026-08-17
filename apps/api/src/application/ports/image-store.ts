export type StoredImage = {
  id: string
  url: string
  contentType: string
}

export interface ImageStore {
  save(buffer: Buffer, contentType: string, filename: string): Promise<StoredImage>
  get(id: string): Promise<{ buffer: Buffer; contentType: string } | null>
}
