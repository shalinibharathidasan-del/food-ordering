// Food items: listing with search and filters (everyone), create / update / delete (admin)
const express = require('express')
const pool = require('../db')
const { requireRole } = require('../middleware/auth')

const router = express.Router()
const admin = requireRole('admin')
const CATEGORIES = ['Starters', 'Main Course', 'Biryani', 'Desserts', 'Beverages']
const SORTS = { price_asc: 'price ASC', price_desc: 'price DESC', name: 'name ASC' }

const toItem = (f) => ({ ...f, price: Number(f.price), is_veg: Boolean(f.is_veg), is_available: Boolean(f.is_available) })

function validate({ name, description, category, price, is_veg, is_available }) {
  if (!name?.trim()) return 'Name is required'
  if (!CATEGORIES.includes(category)) return `Category must be one of: ${CATEGORIES.join(', ')}`
  if (!(Number(price) > 0)) return 'Price must be more than 0'
  return [name.trim(), description?.trim() || null, category, Number(price), Boolean(is_veg), is_available === undefined ? true : Boolean(is_available)]
}

// GET /api/foods?search=paneer&category=Starters&veg=true&sort=price_asc&all=true
// "all=true" (admin screen) also returns items marked unavailable
router.get('/', async (req, res) => {
  const { search = '', category = '', veg = '', sort = '', all = '' } = req.query
  let sql = 'SELECT * FROM food_items WHERE (name LIKE ? OR description LIKE ?)'
  const params = [`%${search}%`, `%${search}%`]
  if (category) {
    sql += ' AND category = ?'
    params.push(category)
  }
  if (veg === 'true') sql += ' AND is_veg = TRUE'
  if (all !== 'true') sql += ' AND is_available = TRUE'
  sql += ` ORDER BY ${SORTS[sort] || 'FIELD(category, ' + CATEGORIES.map(() => '?').join(', ') + '), name'}`
  if (!SORTS[sort]) params.push(...CATEGORIES)

  const [items] = await pool.execute(sql, params)
  res.json(items.map(toItem))
})

// GET /api/foods/:id
router.get('/:id', async (req, res) => {
  const [[item]] = await pool.execute('SELECT * FROM food_items WHERE id = ?', [req.params.id])
  if (!item) return res.status(404).json({ error: 'Food item not found' })
  res.json(toItem(item))
})

// POST /api/foods
router.post('/', admin, async (req, res) => {
  const values = validate(req.body)
  if (typeof values === 'string') return res.status(400).json({ error: values })
  const [result] = await pool.execute(
    'INSERT INTO food_items (name, description, category, price, is_veg, is_available) VALUES (?, ?, ?, ?, ?, ?)',
    values,
  )
  res.status(201).json({ id: result.insertId, message: 'Food item added' })
})

// PUT /api/foods/:id
router.put('/:id', admin, async (req, res) => {
  const values = validate(req.body)
  if (typeof values === 'string') return res.status(400).json({ error: values })
  const [result] = await pool.execute(
    'UPDATE food_items SET name = ?, description = ?, category = ?, price = ?, is_veg = ?, is_available = ? WHERE id = ?',
    [...values, req.params.id],
  )
  if (!result.affectedRows) return res.status(404).json({ error: 'Food item not found' })
  res.json({ message: 'Food item updated' })
})

// DELETE /api/foods/:id  (past orders keep their copied name and price)
router.delete('/:id', admin, async (req, res) => {
  const [result] = await pool.execute('DELETE FROM food_items WHERE id = ?', [req.params.id])
  if (!result.affectedRows) return res.status(404).json({ error: 'Food item not found' })
  res.json({ message: 'Food item removed' })
})

module.exports = router
