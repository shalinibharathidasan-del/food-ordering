import { CATEGORY_ICONS, rupees } from '../api'
import { useCart } from '../context/CartContext'

// Veg / non-veg mark used on menus in India
export const VegMark = ({ veg }) => <span className={`veg-mark ${veg ? 'veg' : 'nonveg'}`} title={veg ? 'Veg' : 'Non-veg'}></span>

// Reusable menu card. Props: food
function FoodCard({ food }) {
  const { add, setQuantity, quantityOf } = useCart()
  const qty = quantityOf(food.id)

  return (
    <div className="card h-100 food-card">
      <div className="food-icon">{CATEGORY_ICONS[food.category]}</div>
      <div className="card-body d-flex flex-column">
        <div className="d-flex align-items-center gap-2 mb-1">
          <VegMark veg={food.is_veg} />
          <h6 className="mb-0">{food.name}</h6>
        </div>
        <p className="small text-muted mb-2">{food.description}</p>
        <div className="d-flex justify-content-between align-items-center mt-auto">
          <b>{rupees(food.price)}</b>
          {qty === 0 ? (
            <button className="btn btn-sm btn-outline-danger fw-semibold" onClick={() => add(food)}>ADD</button>
          ) : (
            <div className="btn-group btn-group-sm" role="group" aria-label={`Quantity of ${food.name}`}>
              <button className="btn btn-danger" onClick={() => setQuantity(food.id, qty - 1)}>−</button>
              <span className="btn btn-danger disabled fw-semibold">{qty}</span>
              <button className="btn btn-danger" onClick={() => setQuantity(food.id, qty + 1)}>+</button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default FoodCard
