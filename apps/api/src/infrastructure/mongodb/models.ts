import mongoose, { Schema } from 'mongoose'

const userSchema = new Schema(
  {
    email: { type: String, required: true, unique: true, lowercase: true },
    name: { type: String, required: true },
    passwordHash: { type: String, required: true },
    role: { type: String, enum: ['CUSTOMER', 'ADMIN'], default: 'CUSTOMER' },
  },
  { timestamps: { createdAt: true, updatedAt: false } },
)

const productSchema = new Schema(
  {
    slug: { type: String, required: true, unique: true },
    title: { type: String, required: true },
    description: { type: String, default: '' },
    category: { type: String, required: true },
    priceInPaise: { type: Number, required: true },
    compareAtPaise: { type: Number, default: null },
    images: [{ id: String, url: String, alt: String }],
    fabric: { type: String, default: '' },
    color: { type: String, default: '' },
    sizes: [String],
    stock: { type: Number, default: 0 },
    featured: { type: Boolean, default: false },
  },
  { timestamps: { createdAt: true, updatedAt: false } },
)

productSchema.index({ title: 'text', description: 'text' })

const cartSchema = new Schema(
  {
    userId: { type: String, required: true, unique: true },
    items: [
      {
        id: String,
        productId: String,
        title: String,
        priceInPaise: Number,
        quantity: Number,
        size: String,
        imageUrl: String,
      },
    ],
  },
  { timestamps: true },
)

const orderSchema = new Schema(
  {
    userId: { type: String, required: true, index: true },
    items: [
      {
        id: String,
        productId: String,
        title: String,
        priceInPaise: Number,
        quantity: Number,
        size: String,
        imageUrl: String,
      },
    ],
    shipping: {
      name: String,
      phone: String,
      line1: String,
      city: String,
      state: String,
      pin: String,
    },
    subtotalPaise: Number,
    status: { type: String, default: 'PENDING_PAYMENT' },
    payment: {
      method: String,
      provider: String,
      merchantOrderId: { type: String, unique: true },
      state: String,
    },
  },
  { timestamps: { createdAt: true, updatedAt: false } },
)

const storeSchema = new Schema(
  {
    key: { type: String, unique: true, default: 'default' },
    storeName: String,
    tagline: String,
    ownerName: String,
    phone: String,
    whatsapp: String,
    email: String,
    addressLine: String,
    city: String,
    state: String,
    pin: String,
    logoUrl: String,
    accentColor: String,
    currency: { type: String, default: 'INR' },
  },
  { timestamps: true },
)

const mediaSchema = new Schema({
  contentType: String,
  filename: String,
  data: Buffer,
})

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function named(name: string, schema: Schema): any {
  return mongoose.models[name] ?? mongoose.model(name, schema)
}

export const UserModel = named('User', userSchema)
export const ProductModel = named('Product', productSchema)
export const CartModel = named('Cart', cartSchema)
export const OrderModel = named('Order', orderSchema)
export const StoreModel = named('Store', storeSchema)
export const MediaModel = named('Media', mediaSchema)
