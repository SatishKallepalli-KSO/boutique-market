export const typeDefs = `#graphql
  enum Category { SAREE BLOUSE LEHENGA KURTA DUPATTA ACCESSORY }
  enum OrderStatus { PENDING_PAYMENT PAID FULFILLING SHIPPED DELIVERED CANCELLED }
  enum PaymentMethod { PHONEPE CARD }
  enum PaymentState { PENDING COMPLETED FAILED }
  enum UserRole { CUSTOMER ADMIN }

  type ProductImage { id: ID! url: String! alt: String! }
  type Product {
    id: ID!
    slug: String!
    title: String!
    description: String!
    category: Category!
    priceInPaise: Int!
    compareAtPaise: Int
    images: [ProductImage!]!
    fabric: String!
    color: String!
    sizes: [String!]!
    stock: Int!
    featured: Boolean!
    createdAt: String!
  }
  type ProductConnection { items: [Product!]! total: Int! page: Int! pageSize: Int! }

  type User { id: ID! email: String! name: String! role: UserRole! }
  type AuthPayload { token: String! user: User! }

  type CartItem {
    id: ID!
    productId: ID!
    title: String!
    priceInPaise: Int!
    quantity: Int!
    size: String
    imageUrl: String!
  }
  type Cart { id: ID! items: [CartItem!]! subtotalPaise: Int! }

  type ShippingAddress {
    name: String!
    phone: String!
    line1: String!
    city: String!
    state: String!
    pin: String!
  }
  type PaymentInfo {
    method: PaymentMethod!
    provider: String!
    merchantOrderId: String!
    state: PaymentState!
  }
  type Order {
    id: ID!
    items: [CartItem!]!
    shipping: ShippingAddress!
    subtotalPaise: Int!
    status: OrderStatus!
    payment: PaymentInfo!
    createdAt: String!
  }
  type CheckoutPayload { order: Order! redirectUrl: String! }

  type Store {
    storeName: String!
    tagline: String!
    ownerName: String!
    phone: String!
    whatsapp: String!
    email: String!
    addressLine: String!
    city: String!
    state: String!
    pin: String!
    logoUrl: String!
    accentColor: String!
    currency: String!
  }

  input RegisterInput { email: String! name: String! password: String! }
  input LoginInput { email: String! password: String! }
  input ShippingInput {
    name: String!
    phone: String!
    line1: String!
    city: String!
    state: String!
    pin: String!
  }
  input CheckoutInput { method: PaymentMethod! shipping: ShippingInput! }
  input ProductImageInput { url: String! alt: String }
  input ProductInput {
    title: String
    description: String
    category: Category
    priceInPaise: Int
    compareAtPaise: Int
    images: [ProductImageInput!]
    fabric: String
    color: String
    sizes: [String!]
    stock: Int
    featured: Boolean
    slug: String
  }
  input StoreInput {
    storeName: String
    tagline: String
    ownerName: String
    phone: String
    whatsapp: String
    email: String
    addressLine: String
    city: String
    state: String
    pin: String
    logoUrl: String
    accentColor: String
    currency: String
  }

  type Query {
    store: Store!
    products(category: Category, search: String, featured: Boolean, page: Int, pageSize: Int): ProductConnection!
    product(id: ID, slug: String): Product
    me: User
    myCart: Cart!
    myOrders: [Order!]!
    order(id: ID!): Order
    adminOrders: [Order!]!
  }

  type Mutation {
    register(input: RegisterInput!): AuthPayload!
    login(input: LoginInput!): AuthPayload!
    addToCart(productId: ID!, quantity: Int!, size: String): Cart!
    updateCartItem(itemId: ID!, quantity: Int!): Cart!
    removeCartItem(itemId: ID!): Cart!
    checkout(input: CheckoutInput!): CheckoutPayload!
    confirmPayment(merchantOrderId: String!): Order!
    createProduct(input: ProductInput!): Product!
    updateProduct(id: ID!, input: ProductInput!): Product!
    deleteProduct(id: ID!): Boolean!
    updateStore(input: StoreInput!): Store!
    updateOrderStatus(id: ID!, status: OrderStatus!): Order!
  }
`
