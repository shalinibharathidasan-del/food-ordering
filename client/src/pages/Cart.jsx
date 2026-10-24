import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { api, rupees } from '../api'
import { useAuth } from '../context/AuthContext'
import { useCart } from '../context/CartContext'
import { VegMark } from '../components/FoodCard'

const DELIVERY_FEE = 0 // free delivery in this prototype

// Shopping cart and checkout
function Cart() {
  const { user } = useAuth()
  const { items, setQuantity, clear, total } = useCart()
  const navigate = useNavigate()
  const [address, setAddress] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  const placeOrder = async (e) => {
    e.preventDefault()
    setBusy(true)
    setError('')
    try {
      const res = await api('/orders', {
        method: 'POST',
        body: { address, items: items.map((i) => ({ id: i.id, quantity: i.quantity })) },
      })
      clear()
      navigate('/orders', { state: { message: `${res.message}. Total ${rupees(res.total)}` } })
    } catch (err) {
      setError(err.message)
      setBusy(false)
    }
  }

  if (items.length === 0) {
    return (
      <div className="text-center py-5">
        <div style={{ fontSize: 64 }}>🛒</div>
        <h4>Your cart is empty</h4>
        <Link to="/" className="btn btn-danger mt-2">Browse the menu</Link>
      </div>
    )
  }

  return (
    <div className="row g-4">
      <div className="col-lg-7">
        <h2 className="mb-3">Your Cart</h2>
        <div className="card">
          <ul className="list-group list-group-flush">
            {items.map((i) => (
              <li key={i.id} className="list-group-item d-flex align-items-center gap-3">
                <VegMark veg={i.is_veg} />
                <div className="flex-grow-1">
                  <div className="fw-semibold">{i.name}</div>
                  <small className="text-muted">{rupees(i.price)} each</small>
                </div>
                <div className="btn-group btn-group-sm" role="group" aria-label={`Quantity of ${i.name}`}>
                  <button className="btn btn-outline-danger" onClick={() => setQuantity(i.id, i.quantity - 1)}>−</button>
                  <span className="btn btn-outline-danger disabled">{i.quantity}</span>
                  <button className="btn btn-outline-danger" onClick={() => setQuantity(i.id, i.quantity + 1)}>+</button>
                </div>
                <b style={{ width: 70 }} className="text-end">{rupees(i.price * i.quantity)}</b>
              </li>
            ))}
          </ul>
        </div>
        <button className="btn btn-link text-danger px-0 mt-2" onClick={clear}>Clear cart</button>
      </div>

      <div className="col-lg-5">
        <div className="card">
          <div className="card-body">
            <h5>Bill details</h5>
            <div className="d-flex justify-content-between"><span>Item total</span><span>{rupees(total)}</span></div>
            <div className="d-flex justify-content-between text-success"><span>Delivery</span><span>FREE</span></div>
            <hr />
            <div className="d-flex justify-content-between fw-bold fs-5"><span>To pay</span><span>{rupees(total + DELIVERY_FEE)}</span></div>

            {!user ? (
              <Link to="/login" state={{ from: '/cart' }} className="btn btn-danger w-100 mt-3">Login to place order</Link>
            ) : (
              <form onSubmit={placeOrder} className="mt-3">
                {error && <div className="alert alert-danger py-2">{error}</div>}
                <label className="form-label" htmlFor="address">Delivery address</label>
                <textarea id="address" className="form-control mb-3" rows="3" placeholder="House no, street, area, city" value={address} onChange={(e) => setAddress(e.target.value)} required />
                <p className="small text-muted">Payment: Cash on delivery</p>
                <button className="btn btn-danger w-100 btn-lg" disabled={busy}>{busy ? 'Placing order...' : `Place order · ${rupees(total)}`}</button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default Cart
