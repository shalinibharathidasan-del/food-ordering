import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { api, CATEGORIES, CATEGORY_ICONS, rupees } from '../api'
import { useCart } from '../context/CartContext'
import FoodCard from '../components/FoodCard'

// Food listing with search, category filter, veg-only toggle and sorting
function Menu() {
  const { count, total } = useCart()
  const [foods, setFoods] = useState([])
  const [filters, setFilters] = useState({ search: '', category: '', veg: false, sort: '' })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const update = (changes) => setFilters({ ...filters, ...changes })

  useEffect(() => {
    const timer = setTimeout(() => {
      const params = new URLSearchParams({ ...filters, veg: filters.veg ? 'true' : '' })
      api(`/foods?${params}`)
        .then(setFoods)
        .catch((err) => setError(err.message))
        .finally(() => setLoading(false))
    }, 250)
    return () => clearTimeout(timer)
  }, [filters])

  return (
    <>
      <div className="hero p-4 p-md-5 mb-4 rounded-3 text-white">
        <h1 className="fw-bold">Hungry? Order from Spice Garden</h1>
        <p className="lead mb-0">Freshly cooked Indian food, delivered hot.</p>
      </div>

      <div className="row g-2 mb-3">
        <div className="col-md-6">
          <input className="form-control" placeholder="Search dishes..." value={filters.search} onChange={(e) => update({ search: e.target.value })} />
        </div>
        <div className="col-6 col-md-3">
          <select className="form-select" value={filters.sort} onChange={(e) => update({ sort: e.target.value })} aria-label="Sort">
            <option value="">Sort: Recommended</option>
            <option value="price_asc">Price: low to high</option>
            <option value="price_desc">Price: high to low</option>
            <option value="name">Name</option>
          </select>
        </div>
        <div className="col-6 col-md-3 d-flex align-items-center">
          <div className="form-check form-switch">
            <input className="form-check-input" type="checkbox" id="veg" checked={filters.veg} onChange={(e) => update({ veg: e.target.checked })} />
            <label className="form-check-label" htmlFor="veg">Veg only</label>
          </div>
        </div>
      </div>

      <div className="d-flex flex-wrap gap-2 mb-4">
        {['', ...CATEGORIES].map((c) => (
          <button key={c || 'all'} className={`btn btn-sm rounded-pill ${filters.category === c ? 'btn-danger' : 'btn-outline-danger'}`} onClick={() => update({ category: c })}>
            {c ? `${CATEGORY_ICONS[c]} ${c}` : 'All'}
          </button>
        ))}
      </div>

      {error && <div className="alert alert-danger">{error}</div>}
      {loading ? (
        <div className="text-center py-5"><div className="spinner-border text-danger"></div></div>
      ) : foods.length === 0 ? (
        <p className="text-muted">No dishes match your search.</p>
      ) : (
        <div className="row g-3">
          {foods.map((f) => (
            <div className="col-sm-6 col-lg-4 col-xl-3" key={f.id}>
              <FoodCard food={f} />
            </div>
          ))}
        </div>
      )}

      {count > 0 && (
        <Link to="/cart" className="cart-bar">
          <span>{count} item{count > 1 ? 's' : ''} | {rupees(total)}</span>
          <span className="fw-bold">View cart →</span>
        </Link>
      )}
    </>
  )
}

export default Menu
