import { ORDER_STEPS } from '../api'

// Step-by-step order status. Props: status
function OrderTracker({ status }) {
  if (status === 'Cancelled') return <div className="text-danger fw-semibold">✕ Order cancelled</div>
  const current = ORDER_STEPS.indexOf(status)

  return (
    <div className="tracker">
      {ORDER_STEPS.map((step, i) => (
        <div key={step} className={`tracker-step ${i <= current ? 'done' : ''} ${i === current ? 'current' : ''}`}>
          <div className="tracker-dot">{i < current ? '✓' : i + 1}</div>
          <div className="tracker-label">{step}</div>
        </div>
      ))}
    </div>
  )
}

export default OrderTracker
