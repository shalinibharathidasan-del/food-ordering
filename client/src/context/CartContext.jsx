import { createContext, useContext, useEffect, useState } from 'react'

// Shopping cart shared across the app and saved in the browser
const CartContext = createContext()

function loadCart() {
  try {
    return JSON.parse(localStorage.getItem('cart')) || []
  } catch {
    return []
  }
}

export function CartProvider({ children }) {
  const [items, setItems] = useState(loadCart) // [{ id, name, price, is_veg, quantity }]

  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(items))
  }, [items])

  const add = (food) =>
    setItems((prev) => {
      const found = prev.find((i) => i.id === food.id)
      if (found) return prev.map((i) => (i.id === food.id ? { ...i, quantity: Math.min(i.quantity + 1, 20) } : i))
      return [...prev, { id: food.id, name: food.name, price: food.price, is_veg: food.is_veg, quantity: 1 }]
    })

  // Changing quantity to 0 removes the item
  const setQuantity = (id, quantity) =>
    setItems((prev) => (quantity <= 0 ? prev.filter((i) => i.id !== id) : prev.map((i) => (i.id === id ? { ...i, quantity: Math.min(quantity, 20) } : i))))

  const clear = () => setItems([])

  const count = items.reduce((n, i) => n + i.quantity, 0)
  const total = items.reduce((sum, i) => sum + i.price * i.quantity, 0)
  const quantityOf = (id) => items.find((i) => i.id === id)?.quantity || 0

  return (
    <CartContext.Provider value={{ items, add, setQuantity, clear, count, total, quantityOf }}>
      {children}
    </CartContext.Provider>
  )
}

export const useCart = () => useContext(CartContext)
