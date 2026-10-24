// Orders: place, view and cancel (customer), view all and update status (admin)
const express = require('express')
const pool = require('../db')
const { requireRole } = require('../middleware/auth')

const router = express.Router()
const STATUSES = ['Placed', 'Preparing', 'Out for delivery', 'Delivered', 'Cancelled']

// Loads orders with their items in two queries
async function withItems(orders) {
  if (orders.length === 0) return []
  const [items] = await pool.query('SELECT * FROM order_items WHERE order_id IN (?)', [orders.map((o) => o.id)])
  return orders.map((o) => ({
    ...o,
    total: Number(o.total),
    items: items.filter((i) => i.order_id === o.id).map((i) => ({ ...i, price: Number(i.price) })),
  }))
}

// POST /api/orders  { items: [{ id, quantity }], address }
// Prices come from the database, never from the browser
router.post('/', requireRole('customer'), async (req, res) => {
  const { items, address } = req.body
  if (!Array.isArray(items) || items.length === 0) return res.status(400).json({ error: 'Your cart is empty' })
  if (!address?.trim() || address.trim().length < 10) return res.status(400).json({ error: 'Enter a full delivery address' })
  if (items.some((i) => !Number.isInteger(Number(i.quantity)) || i.quantity < 1 || i.quantity > 20)) {
    return res.status(400).json({ error: 'Quantity must be between 1 and 20' })
  }

  const [foods] = await pool.query('SELECT * FROM food_items WHERE id IN (?) AND is_available = TRUE', [items.map((i) => i.id)])
  if (foods.length !== new Set(items.map((i) => i.id)).size) {
    return res.status(400).json({ error: 'Some items in your cart are no longer available' })
  }

  const lines = items.map((i) => {
    const food = foods.find((f) => f.id === Number(i.id))
    return { food, quantity: Number(i.quantity) }
  })
  const total = lines.reduce((sum, l) => sum + Number(l.food.price) * l.quantity, 0)

  // Order and its items are saved together or not at all
  const conn = await pool.getConnection()
  try {
    await conn.beginTransaction()
    const [result] = await conn.execute('INSERT INTO orders (customer_id, total, address) VALUES (?, ?, ?)', [
      req.user.id,
      total,
      address.trim(),
    ])
    await conn.query('INSERT INTO order_items (order_id, food_item_id, name, price, quantity) VALUES ?', [
      lines.map((l) => [result.insertId, l.food.id, l.food.name, l.food.price, l.quantity]),
    ])
    await conn.commit()
    res.status(201).json({ id: result.insertId, total, message: `Order #${result.insertId} placed` })
  } catch (err) {
    await conn.rollback()
    throw err
  } finally {
    conn.release()
  }
})

// GET /api/orders/my
router.get('/my', requireRole('customer'), async (req, res) => {
  const [orders] = await pool.execute('SELECT * FROM orders WHERE customer_id = ? ORDER BY created_at DESC, id DESC', [req.user.id])
  res.json(await withItems(orders))
})

// PATCH /api/orders/:id/cancel  (customer, only while still "Placed")
router.patch('/:id/cancel', requireRole('customer'), async (req, res) => {
  const [[order]] = await pool.execute('SELECT * FROM orders WHERE id = ? AND customer_id = ?', [req.params.id, req.user.id])
  if (!order) return res.status(404).json({ error: 'Order not found' })
  if (order.status !== 'Placed') return res.status(400).json({ error: 'The restaurant has already started this order' })
  await pool.execute("UPDATE orders SET status = 'Cancelled' WHERE id = ?", [order.id])
  res.json({ message: `Order #${order.id} cancelled` })
})

// GET /api/orders?status=Placed  (admin: all orders with customer details)
router.get('/', requireRole('admin'), async (req, res) => {
  const { status = '' } = req.query
  let sql = `SELECT o.*, u.name AS customer_name, u.phone AS customer_phone
             FROM orders o JOIN users u ON u.id = o.customer_id`
  const params = []
  if (status) {
    sql += ' WHERE o.status = ?'
    params.push(status)
  }
  const [orders] = await pool.execute(sql + ' ORDER BY o.created_at DESC, o.id DESC', params)
  res.json(await withItems(orders))
})

// PATCH /api/orders/:id/status  { status }  (admin)
router.patch('/:id/status', requireRole('admin'), async (req, res) => {
  const { status } = req.body
  if (!STATUSES.includes(status)) return res.status(400).json({ error: `Status must be one of: ${STATUSES.join(', ')}` })
  const [result] = await pool.execute('UPDATE orders SET status = ? WHERE id = ?', [status, req.params.id])
  if (!result.affectedRows) return res.status(404).json({ error: 'Order not found' })
  res.json({ message: `Order #${req.params.id} is now ${status}` })
})

module.exports = router
