import { useEffect, useState } from 'react'
import { api, formatDateTime, ORDER_STEPS, rupees, STATUS_COLORS } from '../../api'

// Restaurant staff see incoming orders and move them through each status
function Orders() {
  const [orders, setOrders] = useState([])
  const [filter, setFilter] = useState('')
  const [message, setMessage] = useState({ text: '', type: '' })

  const load = () => api(`/orders?status=${encodeURIComponent(filter)}`).then(setOrders).catch((err) => setMessage({ text: err.message, type: 'danger' }))

  useEffect(() => {
    load()
    const timer = setInterval(load, 15000)
    return () => clearInterval(timer)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter])

  const setStatus = async (order, status) => {
    try {
      const res = await api(`/orders/${order.id}/status`, { method: 'PATCH', body: { status } })
      setMessage({ text: res.message, type: 'success' })
      load()
    } catch (err) {
      setMessage({ text: err.message, type: 'danger' })
    }
  }

  return (
    <>
      <div className="d-flex flex-wrap justify-content-between align-items-center gap-2 mb-3">
        <h2 className="mb-0">Orders</h2>
        <select className="form-select w-auto" value={filter} onChange={(e) => setFilter(e.target.value)} aria-label="Filter by status">
          <option value="">All orders</option>
          {[...ORDER_STEPS, 'Cancelled'].map((s) => <option key={s}>{s}</option>)}
        </select>
      </div>
      {message.text && <div className={`alert alert-${message.type}`}>{message.text}</div>}
      {orders.length === 0 && <p className="text-muted">No orders.</p>}

      <div className="row g-3">
        {orders.map((o) => {
          const next = ORDER_STEPS[ORDER_STEPS.indexOf(o.status) + 1]
          return (
            <div className="col-lg-6" key={o.id}>
              <div className="card h-100">
                <div className="card-body">
                  <div className="d-flex justify-content-between">
                    <h5 className="mb-0">#{o.id} · {o.customer_name}</h5>
                    <span className={`badge bg-${STATUS_COLORS[o.status]}`}>{o.status}</span>
                  </div>
                  <small className="text-muted">{formatDateTime(o.created_at)} · {o.customer_phone || 'no phone'}</small>
                  <ul className="small my-2 ps-3">
                    {o.items.map((i) => <li key={i.id}>{i.name} × {i.quantity} — {rupees(i.price * i.quantity)}</li>)}
                  </ul>
                  <div className="small mb-2">📍 {o.address}</div>
                  <div className="d-flex justify-content-between align-items-center">
                    <b>{rupees(o.total)}</b>
                    <div className="d-flex gap-2">
                      {next && <button className="btn btn-sm btn-success" onClick={() => setStatus(o, next)}>Mark {next}</button>}
                      {o.status === 'Placed' && <button className="btn btn-sm btn-outline-danger" onClick={() => setStatus(o, 'Cancelled')}>Reject</button>}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </>
  )
}

export default Orders
