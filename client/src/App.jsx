import { Routes, Route, Navigate } from 'react-router-dom'
import Navbar from './components/Navbar'
import ProtectedRoute from './components/ProtectedRoute'
import { useAuth } from './context/AuthContext'
import Menu from './pages/Menu'
import Cart from './pages/Cart'
import Login from './pages/Login'
import Register from './pages/Register'
import MyOrders from './pages/MyOrders'
import MenuItems from './pages/admin/MenuItems'
import Orders from './pages/admin/Orders'

// Customers (and visitors) see the menu; restaurant staff go to the orders screen
function Home() {
  const { isAdmin } = useAuth()
  return isAdmin ? <Navigate to="/admin/orders" replace /> : <Menu />
}

function App() {
  return (
    <>
      <Navbar />
      <main className="container py-4">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/orders" element={<ProtectedRoute roles={['customer']}><MyOrders /></ProtectedRoute>} />
          <Route path="/admin/orders" element={<ProtectedRoute roles={['admin']}><Orders /></ProtectedRoute>} />
          <Route path="/admin/menu" element={<ProtectedRoute roles={['admin']}><MenuItems /></ProtectedRoute>} />
          <Route path="*" element={<h3>Page not found</h3>} />
        </Routes>
      </main>
    </>
  )
}

export default App
