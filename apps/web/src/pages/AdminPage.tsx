import { FormEvent, useState } from 'react'
import { useMutation, useQuery } from '@apollo/client'
import { CATEGORIES, CATEGORY_LABELS, type Category } from '@boutique-market/shared'
import { ADMIN_ORDERS, CREATE_PRODUCT, PRODUCTS, UPDATE_ORDER_STATUS, UPDATE_STORE } from '../graphql/operations'
import { useAuth } from '../auth'
import { useStore } from '../store'
import { formatINR } from '../lib/money'

type Tab = 'store' | 'products' | 'orders'

export function AdminPage() {
  const { user } = useAuth()
  const store = useStore()
  const [tab, setTab] = useState<Tab>('store')
  const [updateStore] = useMutation(UPDATE_STORE, { refetchQueries: ['Store'] })
  const [createProduct] = useMutation(CREATE_PRODUCT, { refetchQueries: ['Products'] })
  const [updateStatus] = useMutation(UPDATE_ORDER_STATUS, { refetchQueries: ['AdminOrders'] })
  const { data: productData } = useQuery(PRODUCTS)
  const { data: orderData } = useQuery(ADMIN_ORDERS, { skip: user?.role !== 'ADMIN' })
  const [message, setMessage] = useState('')

  if (user?.role !== 'ADMIN') {
    return (
      <main className="page">
        <h1>Admin</h1>
        <p>Sign in with the store admin account to brand this boutique and upload pieces.</p>
      </main>
    )
  }

  async function onStore(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const form = new FormData(event.currentTarget)
    const input = Object.fromEntries(
      [...form.entries()].map(([key, value]) => [key, String(value)]),
    )
    await updateStore({ variables: { input } })
    setMessage('Store branding saved. The storefront updates immediately.')
  }

  async function onProduct(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const form = new FormData(event.currentTarget)
    const file = form.get('file') as File | null
    let imageUrl = String(form.get('imageUrl') || '')
    if (file && file.size > 0) {
      const body = new FormData()
      body.append('file', file)
      const res = await fetch('/api/uploads', {
        method: 'POST',
        headers: { authorization: `Bearer ${localStorage.getItem('bm_token') ?? ''}` },
        body,
      })
      const stored = await res.json()
      imageUrl = stored.url
    }
    await createProduct({
      variables: {
        input: {
          title: String(form.get('title')),
          description: String(form.get('description')),
          category: String(form.get('category')) as Category,
          priceInPaise: Math.round(Number(form.get('price')) * 100),
          fabric: String(form.get('fabric')),
          color: String(form.get('color')),
          sizes: String(form.get('sizes') || '')
            .split(',')
            .map((s) => s.trim())
            .filter(Boolean),
          stock: Number(form.get('stock') || 0),
          featured: form.get('featured') === 'on',
          images: imageUrl ? [{ url: imageUrl, alt: String(form.get('title')) }] : [],
        },
      },
    })
    event.currentTarget.reset()
    setMessage('Piece added to the floor.')
  }

  return (
    <main className="page">
      <h1>Admin desk</h1>
      <div className="tabs">
        {(['store', 'products', 'orders'] as Tab[]).map((value) => (
          <button key={value} className={`chip ${tab === value ? 'on' : ''}`} type="button" onClick={() => setTab(value)}>
            {value}
          </button>
        ))}
      </div>
      {message ? <p>{message}</p> : null}

      {tab === 'store' ? (
        <form className="form wide" onSubmit={(e) => void onStore(e)}>
          <label>
            Store name
            <input name="storeName" defaultValue={store.storeName} required />
          </label>
          <label>
            Tagline
            <input name="tagline" defaultValue={store.tagline} />
          </label>
          <label>
            Owner
            <input name="ownerName" defaultValue={store.ownerName} />
          </label>
          <label>
            Phone
            <input name="phone" defaultValue={store.phone} />
          </label>
          <label>
            WhatsApp
            <input name="whatsapp" defaultValue={store.whatsapp} />
          </label>
          <label>
            Email
            <input name="email" defaultValue={store.email} />
          </label>
          <label>
            Address
            <input name="addressLine" defaultValue={store.addressLine} />
          </label>
          <label>
            City
            <input name="city" defaultValue={store.city} />
          </label>
          <label>
            State
            <input name="state" defaultValue={store.state} />
          </label>
          <label>
            PIN
            <input name="pin" defaultValue={store.pin} />
          </label>
          <label>
            Logo URL
            <input name="logoUrl" defaultValue={store.logoUrl} />
          </label>
          <label>
            Accent color
            <input name="accentColor" defaultValue={store.accentColor} />
          </label>
          <button className="btn" type="submit">
            Save branding
          </button>
        </form>
      ) : null}

      {tab === 'products' ? (
        <>
          <form className="form wide" onSubmit={(e) => void onProduct(e)}>
            <label>
              Title
              <input name="title" required />
            </label>
            <label>
              Description
              <textarea name="description" rows={3} />
            </label>
            <label>
              Category
              <select name="category">
                {CATEGORIES.map((value) => (
                  <option key={value} value={value}>
                    {CATEGORY_LABELS[value]}
                  </option>
                ))}
              </select>
            </label>
            <label>
              Price (₹)
              <input name="price" type="number" min={1} required />
            </label>
            <label>
              Fabric
              <input name="fabric" />
            </label>
            <label>
              Color
              <input name="color" />
            </label>
            <label>
              Sizes (comma separated)
              <input name="sizes" placeholder="32, 34, 36" />
            </label>
            <label>
              Stock
              <input name="stock" type="number" min={0} defaultValue={1} />
            </label>
            <label>
              Image file
              <input name="file" type="file" accept="image/*" />
            </label>
            <label>
              or image URL
              <input name="imageUrl" />
            </label>
            <label>
              <input name="featured" type="checkbox" /> Featured on home
            </label>
            <button className="btn" type="submit">
              Upload piece
            </button>
          </form>
          <h2>On the floor</h2>
          <table className="table">
            <tbody>
              {(productData?.products?.items ?? []).map(
                (p: { id: string; title: string; priceInPaise: number; stock: number }) => (
                  <tr key={p.id}>
                    <td>{p.title}</td>
                    <td>{formatINR(p.priceInPaise)}</td>
                    <td>{p.stock} in stock</td>
                  </tr>
                ),
              )}
            </tbody>
          </table>
        </>
      ) : null}

      {tab === 'orders' ? (
        <table className="table">
          <tbody>
            {(orderData?.adminOrders ?? []).map(
              (order: { id: string; status: string; subtotalPaise: number; shipping: { name: string } }) => (
                <tr key={order.id}>
                  <td>
                    {order.id.slice(-8)}
                    <div className="muted">{order.shipping.name}</div>
                  </td>
                  <td>{formatINR(order.subtotalPaise)}</td>
                  <td>
                    <select
                      value={order.status}
                      onChange={(e) =>
                        void updateStatus({ variables: { id: order.id, status: e.target.value } })
                      }
                    >
                      {['PENDING_PAYMENT', 'PAID', 'FULFILLING', 'SHIPPED', 'DELIVERED', 'CANCELLED'].map((s) => (
                        <option key={s}>{s}</option>
                      ))}
                    </select>
                  </td>
                </tr>
              ),
            )}
          </tbody>
        </table>
      ) : null}
    </main>
  )
}
