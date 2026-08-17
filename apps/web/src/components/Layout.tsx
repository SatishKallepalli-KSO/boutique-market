import { type FormEvent, useEffect, useState } from 'react'
import { Link, Outlet, useLocation } from 'react-router-dom'
import { CATEGORIES, CATEGORY_LABELS } from '@boutique-market/shared'
import { useAuth } from '../auth'
import { useStore } from '../store'

function BagIcon() {
  return (
    <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true">
      <path
        fill="none"
        stroke="currentColor"
        strokeWidth="1.4"
        d="M6 8.2h12l-.7 11.3H6.7L6 8.2zM9 8.2V6.4A3 3 0 0 1 12 3.4a3 3 0 0 1 3 3v1.8"
      />
    </svg>
  )
}

function MenuIcon({ open }: { open: boolean }) {
  return (
    <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true">
      {open ? (
        <path fill="none" stroke="currentColor" strokeWidth="1.4" d="M6 6l12 12M18 6L6 18" />
      ) : (
        <path fill="none" stroke="currentColor" strokeWidth="1.4" d="M4 7h16M4 12h16M4 17h16" />
      )}
    </svg>
  )
}

export function Layout() {
  const store = useStore()
  const location = useLocation()
  const { user, cartCount, setToken } = useAuth()
  const [menuOpen, setMenuOpen] = useState(false)
  const place = [store.city, store.state].filter(Boolean).join(', ')

  useEffect(() => {
    setMenuOpen(false)
  }, [location.pathname, location.search])

  useEffect(() => {
    document.body.classList.toggle('menu-open', menuOpen)
    return () => document.body.classList.remove('menu-open')
  }, [menuOpen])

  function onNewsletter(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    event.currentTarget.reset()
  }

  const accountLinks = (
    <>
      <Link to="/docs">Docs</Link>
      {user?.role === 'ADMIN' ? <Link to="/admin">Atelier desk</Link> : null}
      {user ? <Link to="/orders">Orders</Link> : null}
      {user ? (
        <button className="text-btn" type="button" onClick={() => setToken(null)}>
          Sign out
        </button>
      ) : (
        <Link to="/login">Account</Link>
      )}
    </>
  )

  return (
    <div className="shell">
      <div className="announce">
        <div className="announce-track">
          <span>Complimentary shipping above ₹2,999</span>
          <span className="dot" />
          <span>Hand-finished in atelier</span>
          <span className="dot" />
          <span>PhonePe &amp; cards</span>
          <span className="dot" />
          <span>7-day easy exchange</span>
        </div>
      </div>

      <header className="header">
        <nav className="nav" aria-label="Primary">
          <button
            className="icon-btn menu-btn"
            type="button"
            aria-expanded={menuOpen}
            aria-controls="mobile-menu"
            aria-label={menuOpen ? 'Close menu' : 'Open menu'}
            onClick={() => setMenuOpen((value) => !value)}
          >
            <MenuIcon open={menuOpen} />
          </button>
          <div className="nav-cats">
            <Link to="/shop">All</Link>
            {CATEGORIES.slice(0, 4).map((category) => (
              <Link key={category} to={`/shop?category=${category}`}>
                {CATEGORY_LABELS[category]}
              </Link>
            ))}
          </div>
          <Link className="brand" to="/">
            {store.logoUrl ? <img src={store.logoUrl} alt="" /> : null}
            <span>
              <span className="brand-kicker">The House of</span>
              <span className="brand-name">{store.storeName}</span>
            </span>
          </Link>
          <div className="nav-tools">
            <span className="nav-tools-desk">
              <Link to="/docs">Docs</Link>
              {accountLinks}
            </span>
            <Link className="bag-link" to="/cart" aria-label={`Bag, ${cartCount} items`}>
              <BagIcon />
              <span className="bag-label">Bag</span>
              {cartCount ? <em>{cartCount}</em> : null}
            </Link>
          </div>
        </nav>
        <div className="cats-scroll" aria-label="Collections">
          <Link to="/shop">All</Link>
          {CATEGORIES.map((category) => (
            <Link key={category} to={`/shop?category=${category}`}>
              {CATEGORY_LABELS[category]}
            </Link>
          ))}
        </div>
      </header>

      {menuOpen ? (
        <div className="drawer-backdrop" onClick={() => setMenuOpen(false)} />
      ) : null}
      <aside className={`drawer ${menuOpen ? 'open' : ''}`} id="mobile-menu">
        <p className="eyebrow">Collections</p>
        <Link to="/shop">All pieces</Link>
        {CATEGORIES.map((category) => (
          <Link key={category} to={`/shop?category=${category}`}>
            {CATEGORY_LABELS[category]}
          </Link>
        ))}
        <p className="eyebrow">Learn</p>
        <Link to="/docs">Study guide</Link>
        <p className="eyebrow">Account</p>
        {accountLinks}
        <Link to="/cart">Bag{cartCount ? ` (${cartCount})` : ''}</Link>
      </aside>

      <Outlet />

      <footer className="footer">
        <div className="footer-grid">
          <div>
            <p className="eyebrow">The maison</p>
            <h2>{store.storeName}</h2>
            <p className="muted">{store.tagline || 'Ethnic wear, made personal.'}</p>
          </div>
          <div>
            <p className="eyebrow">Collections</p>
            <ul className="footer-links">
              {CATEGORIES.map((category) => (
                <li key={category}>
                  <Link to={`/shop?category=${category}`}>{CATEGORY_LABELS[category]}</Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <p className="eyebrow">Client care</p>
            <ul className="footer-links">
              <li>
                <Link to="/docs">Study guide</Link>
              </li>
              <li>
                <Link to="/shop">New in</Link>
              </li>
              <li>
                <Link to="/orders">Order history</Link>
              </li>
              <li>
                <Link to="/cart">Your bag</Link>
              </li>
              <li>Shipping in 3–5 days</li>
              <li>Secure checkout</li>
            </ul>
          </div>
          <div>
            <p className="eyebrow">Visit &amp; notes</p>
            {place ? <p>{place}</p> : null}
            {store.phone ? <p>{store.phone}</p> : null}
            <form className="news" onSubmit={onNewsletter}>
              <label>
                Private list
                <input type="email" required placeholder="Email for first looks" />
              </label>
              <button className="btn ghost" type="submit">
                Join
              </button>
            </form>
          </div>
        </div>
        <div className="footer-base">
          <span>© {new Date().getFullYear()} {store.storeName}</span>
          <span>Boutique Market · white-label atelier commerce</span>
        </div>
      </footer>
    </div>
  )
}
