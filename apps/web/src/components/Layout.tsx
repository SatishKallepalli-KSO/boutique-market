import { Link, Outlet } from 'react-router-dom'
import { useAuth } from '../auth'
import { useStore } from '../store'

export function Layout() {
  const store = useStore()
  const { user, cartCount, setToken } = useAuth()
  const place = [store.city, store.state].filter(Boolean).join(', ')

  return (
    <div className="shell">
      {store.tagline ? <div className="topbar">{store.tagline}</div> : null}
      <nav className="nav">
        <Link className="brand" to="/">
          {store.logoUrl ? <img src={store.logoUrl} alt="" /> : null}
          <span className="brand-name">{store.storeName}</span>
        </Link>
        <div className="nav-links">
          <Link to="/shop">Shop</Link>
          {user ? <Link to="/orders">Orders</Link> : null}
          <Link to="/cart">Bag{cartCount ? ` (${cartCount})` : ''}</Link>
          {user?.role === 'ADMIN' ? <Link to="/admin">Admin</Link> : null}
          {user ? (
            <button className="link" type="button" onClick={() => setToken(null)}>
              Sign out
            </button>
          ) : (
            <Link to="/login">Sign in</Link>
          )}
        </div>
      </nav>
      <Outlet />
      <footer className="footer">
        <strong>{store.storeName}</strong>
        {place ? ` · ${place}` : ''}
        {store.phone ? ` · ${store.phone}` : ''}
        <div className="muted">Powered by Boutique Market — white-label boutique commerce</div>
      </footer>
    </div>
  )
}
