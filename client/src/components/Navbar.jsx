import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useCart } from '../context/CartContext'

function Navbar() {
  const { user, isAdmin, logout } = useAuth()
  const { count } = useCart()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  return (
    <nav className="navbar navbar-expand-md navbar-dark bg-spice sticky-top">
      <div className="container">
        <NavLink className="navbar-brand fw-bold" to="/">🌶️ Spice Garden</NavLink>
        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#nav"
          aria-controls="nav"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon"></span>
        </button>
        <div className="collapse navbar-collapse" id="nav">
          <ul className="navbar-nav me-auto">
            {isAdmin ? (
              <>
                <li className="nav-item"><NavLink className="nav-link" to="/admin/orders">Orders</NavLink></li>
                <li className="nav-item"><NavLink className="nav-link" to="/admin/menu">Menu Items</NavLink></li>
              </>
            ) : (
              <>
                <li className="nav-item"><NavLink className="nav-link" to="/" end>Menu</NavLink></li>
                {user && <li className="nav-item"><NavLink className="nav-link" to="/orders">My Orders</NavLink></li>}
              </>
            )}
          </ul>
          <div className="d-flex align-items-center gap-2">
            {!isAdmin && (
              <NavLink to="/cart" className="btn btn-warning btn-sm position-relative">
                🛒 Cart
                {count > 0 && <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger">{count}</span>}
              </NavLink>
            )}
            {user ? (
              <>
                <span className="text-light small ms-2">{user.name}</span>
                <button className="btn btn-outline-light btn-sm" onClick={handleLogout}>Logout</button>
              </>
            ) : (
              <>
                <NavLink className="btn btn-outline-light btn-sm ms-2" to="/login">Login</NavLink>
                <NavLink className="btn btn-light btn-sm" to="/register">Sign up</NavLink>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}

export default Navbar
