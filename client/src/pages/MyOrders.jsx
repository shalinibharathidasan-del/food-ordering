import { useEffect, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { api, formatDateTime, rupees } from '../api'
import OrderTracker from '../components/OrderTracker'

// Customer's orders with live status (refreshes every 15 seconds)
function MyOrders() {
  const location = useLocation()
  const [orders, setOrders] = useState(null)
  const [message, setMessage] = useState({ text: location.state?.message || '', type: 'success' })

  const load = () => api('/orders/my').then(setOrders).catch((err) => setMessage({ text: err.message, type: 'danger' }))

  useEffect(() => {
    load()
    const timer = setInterval(load, 15000)
    return () => clearInterval(timer)
  }, [])

  const cancel = async (order) => {
    if (!window.confirm(`Cancel order #${order.id}?`)) return
    try {
      const res = await api(`/orders/${order.id}/cancel`, { method: 'PATCH' })
      setMessage({ text: res.message, type: 'success' })
      load()
    } catch (err) {
      setMessage({ text: err.message, type: 'danger' })
    }
  }

  if (!orders) return <div className="spinner-border text-danger"></div>

  return (
    <>
      <h2 className="mb-3">My Orders</h2>
      {message.text && <div className={`alert alert-${message.type}`}>{message.text}</div>}
      {orders.length === 0 && <p className="text-muted">No orders yet. <Link to="/">Order something tasty</Link></p>}

      {orders.map((o) => (
        <div className="card mb-3" key={o.id}>
          <div className="card-body">
            <div className="d-flex justify-content-between flex-wrap gap-2">
              <div>
                <h5 className="mb-0">Order #{o.id}</h5>
                <small className="text-muted">{formatDateTime(o.created_at)} · {o.address}</small>
              </div>
              <b className="fs-5">{rupees(o.total)}</b>
            </div>
            <p className="small mt-2 mb-3">{o.items.map((i) => `${i.name} × ${i.quantity}`).join(', ')}</p>
            <OrderTracker status={o.status} />
            {o.status === 'Placed' && (
              <button className="btn btn-sm btn-outline-danger mt-3" onClick={() => cancel(o)}>Cancel order</button>
            )}
          </div>
        </div>
      ))}
    </>
  )
}

export default MyOrders
