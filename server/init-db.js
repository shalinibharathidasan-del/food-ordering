// Creates the database and tables, then adds demo users and the menu.
// Run once: npm run init-db
const fs = require('fs')
const path = require('path')
const mysql = require('mysql2/promise')
const bcrypt = require('bcryptjs')

const DB_NAME = process.env.DB_NAME || 'food_ordering'

// Demo logins for trying the app locally (also listed in README)
const DEMO_USERS = [
  { name: 'Restaurant Admin', email: 'admin@spicegarden.com', password: 'admin123', role: 'admin' },
  { name: 'Ananya Rao', email: 'ananya@gmail.com', password: 'customer123', role: 'customer', phone: '9876543210' },
]

// [name, description, category, price, is_veg]
const MENU = [
  ['Paneer Tikka', 'Cottage cheese cubes marinated in spices and grilled in a tandoor', 'Starters', 220, true],
  ['Gobi Manchurian', 'Crispy cauliflower tossed in a tangy Indo-Chinese sauce', 'Starters', 160, true],
  ['Chicken 65', 'Spicy deep-fried chicken with curry leaves', 'Starters', 240, false],
  ['Butter Chicken', 'Tandoori chicken in a rich tomato and butter gravy', 'Main Course', 320, false],
  ['Paneer Butter Masala', 'Paneer in a creamy tomato gravy', 'Main Course', 260, true],
  ['Dal Tadka', 'Yellow lentils tempered with garlic and cumin', 'Main Course', 180, true],
  ['Butter Naan', 'Soft tandoor-baked bread with butter', 'Main Course', 45, true],
  ['Hyderabadi Chicken Biryani', 'Dum-cooked basmati rice with chicken and saffron', 'Biryani', 300, false],
  ['Veg Dum Biryani', 'Basmati rice layered with vegetables and spices', 'Biryani', 230, true],
  ['Gulab Jamun', 'Two soft milk dumplings in sugar syrup', 'Desserts', 90, true],
  ['Rasmalai', 'Cottage cheese patties in saffron milk', 'Desserts', 120, true],
  ['Mango Lassi', 'Chilled yoghurt drink with Alphonso mango', 'Beverages', 110, true],
  ['Filter Coffee', 'South Indian filter coffee', 'Beverages', 50, true],
]

async function main() {
  const conn = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    port: Number(process.env.DB_PORT) || 3306,
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    multipleStatements: true,
  })

  await conn.query(`CREATE DATABASE IF NOT EXISTS \`${DB_NAME}\``)
  await conn.changeUser({ database: DB_NAME })
  await conn.query(fs.readFileSync(path.join(__dirname, 'schema.sql'), 'utf8'))
  console.log(`Database "${DB_NAME}" and tables ready`)

  for (const u of DEMO_USERS) {
    const hash = await bcrypt.hash(u.password, 10)
    await conn.execute('INSERT IGNORE INTO users (name, email, phone, password_hash, role) VALUES (?, ?, ?, ?, ?)', [
      u.name, u.email, u.phone || null, hash, u.role,
    ])
  }

  const [[{ count }]] = await conn.query('SELECT COUNT(*) AS count FROM food_items')
  if (count === 0) {
    await conn.query('INSERT INTO food_items (name, description, category, price, is_veg) VALUES ?', [MENU])
    console.log(`${MENU.length} menu items added`)
  }

  console.log('Demo logins: admin@spicegarden.com / admin123, ananya@gmail.com / customer123')
  await conn.end()
}

main().catch((err) => {
  console.error('Setup failed:', err.sqlMessage || err.message)
  process.exit(1)
})
