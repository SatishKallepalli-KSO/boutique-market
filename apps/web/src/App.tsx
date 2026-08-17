import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { Layout } from './components/Layout'
import { HomePage } from './pages/HomePage'
import { ShopPage } from './pages/ShopPage'
import { ProductPage } from './pages/ProductPage'
import { CartPage } from './pages/CartPage'
import { CheckoutPage } from './pages/CheckoutPage'
import { LoginPage } from './pages/LoginPage'
import { OrdersPage } from './pages/OrdersPage'
import { OrderPage } from './pages/OrderPage'
import { AdminPage } from './pages/AdminPage'
import { PaySandboxPage } from './pages/PaySandboxPage'
import { PayReturnPage } from './pages/PayReturnPage'
import { DocsPage } from './pages/DocsPage'

export function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/shop" element={<ShopPage />} />
          <Route path="/product/:slug" element={<ProductPage />} />
          <Route path="/cart" element={<CartPage />} />
          <Route path="/checkout" element={<CheckoutPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/orders" element={<OrdersPage />} />
          <Route path="/order/:id" element={<OrderPage />} />
          <Route path="/admin" element={<AdminPage />} />
          <Route path="/docs" element={<DocsPage />} />
          <Route path="/pay/sandbox" element={<PaySandboxPage />} />
          <Route path="/pay/return" element={<PayReturnPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}
