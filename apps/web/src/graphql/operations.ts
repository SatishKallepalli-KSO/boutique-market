import { gql } from '@apollo/client'

export const STORE = gql`
  query Store {
    store {
      storeName
      tagline
      ownerName
      phone
      whatsapp
      email
      addressLine
      city
      state
      pin
      logoUrl
      accentColor
      currency
    }
  }
`

export const PRODUCTS = gql`
  query Products($category: Category, $search: String, $featured: Boolean) {
    products(category: $category, search: $search, featured: $featured) {
      total
      items {
        id
        slug
        title
        category
        priceInPaise
        compareAtPaise
        featured
        stock
        images { url alt }
      }
    }
  }
`

export const PRODUCT = gql`
  query Product($slug: String!) {
    product(slug: $slug) {
      id
      slug
      title
      description
      category
      priceInPaise
      compareAtPaise
      fabric
      color
      sizes
      stock
      images { url alt }
    }
  }
`

export const ME = gql`
  query Me {
    me { id email name role }
    myCart {
      id
      subtotalPaise
      items { id productId title priceInPaise quantity size imageUrl }
    }
  }
`

export const REGISTER = gql`
  mutation Register($input: RegisterInput!) {
    register(input: $input) { token user { id email name role } }
  }
`

export const LOGIN = gql`
  mutation Login($input: LoginInput!) {
    login(input: $input) { token user { id email name role } }
  }
`

export const ADD_TO_CART = gql`
  mutation AddToCart($productId: ID!, $quantity: Int!, $size: String) {
    addToCart(productId: $productId, quantity: $quantity, size: $size) {
      id
      subtotalPaise
      items { id productId title priceInPaise quantity size imageUrl }
    }
  }
`

export const UPDATE_CART = gql`
  mutation UpdateCartItem($itemId: ID!, $quantity: Int!) {
    updateCartItem(itemId: $itemId, quantity: $quantity) {
      id
      subtotalPaise
      items { id productId title priceInPaise quantity size imageUrl }
    }
  }
`

export const CHECKOUT = gql`
  mutation Checkout($input: CheckoutInput!) {
    checkout(input: $input) {
      redirectUrl
      order { id payment { merchantOrderId } }
    }
  }
`

export const CONFIRM = gql`
  mutation ConfirmPayment($merchantOrderId: String!) {
    confirmPayment(merchantOrderId: $merchantOrderId) {
      id
      status
      subtotalPaise
      payment { state method merchantOrderId }
    }
  }
`

export const MY_ORDERS = gql`
  query MyOrders {
    myOrders {
      id
      status
      subtotalPaise
      createdAt
      items { title quantity }
    }
  }
`

export const ORDER = gql`
  query Order($id: ID!) {
    order(id: $id) {
      id
      status
      subtotalPaise
      createdAt
      shipping { name phone line1 city state pin }
      payment { method provider state merchantOrderId }
      items { title quantity size priceInPaise imageUrl }
    }
  }
`

export const ADMIN_ORDERS = gql`
  query AdminOrders {
    adminOrders {
      id
      status
      subtotalPaise
      createdAt
      shipping { name phone }
      payment { method state }
    }
  }
`

export const CREATE_PRODUCT = gql`
  mutation CreateProduct($input: ProductInput!) {
    createProduct(input: $input) { id slug title }
  }
`

export const UPDATE_STORE = gql`
  mutation UpdateStore($input: StoreInput!) {
    updateStore(input: $input) {
      storeName tagline ownerName phone whatsapp email
      addressLine city state pin logoUrl accentColor currency
    }
  }
`

export const UPDATE_ORDER_STATUS = gql`
  mutation UpdateOrderStatus($id: ID!, $status: OrderStatus!) {
    updateOrderStatus(id: $id, status: $status) { id status }
  }
`
