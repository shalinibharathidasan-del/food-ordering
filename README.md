# Spice Garden – Online Food Ordering System

MMCA314D – Web Development Using Full Stack Open — **AAT-II, Question 2**

A prototype where customers browse food items, add them to a cart, place orders and track order status, while restaurant staff add, modify and remove food items and update orders.

**Stack:** React (Vite) · React Router · Bootstrap · Context API · Node.js · Express 5 · MySQL · JWT · bcrypt

## Features

| Requirement | Where |
|---|---|
| Customer registration / login | `/register`, `/login` |
| Food-item listing | `/` – menu cards with veg/non-veg mark, description and price |
| Search and filtering | Search box, category chips, **Veg only** switch, sort by price or name |
| Shopping cart | `CartContext` (saved in the browser); add/+/− on menu cards, floating cart bar, `/cart` page |
| Order placement | `/cart` – delivery address, cash on delivery; the **server** calculates prices and total |
| Order status | `/orders` – step tracker Placed → Preparing → Out for delivery → Delivered (auto refresh); cancel while still *Placed* |
| Restaurant administration | `/admin/orders` – incoming orders, "Mark next status", reject; `/admin/menu` – manage items |
| CRUD operations | Food items: add, list, edit, remove, and mark available/unavailable. Orders: create, read, update status, cancel |
| Database integration | MySQL with 4 tables; order and order items saved in one **transaction** |

## How to run

Needs Node.js 20.6+ and MySQL 8 running.

```bash
# 1. Server
cd server
npm install
cp .env.example .env      # put your MySQL password in .env
npm run init-db           # creates database, tables, demo users and 13 menu items
npm start                 # http://localhost:5004/api

# 2. Client (second terminal)
cd client
npm install
npm run dev               # http://localhost:5177
```

**Demo logins** (created by `npm run init-db`):

| Role | Email | Password |
|---|---|---|
| Customer | ananya@gmail.com | customer123 |
| Restaurant admin | admin@spicegarden.com | admin123 |

## Database design

```
users                     food_items                 orders                        order_items
-----                     ----------                 ------                        -----------
id (PK)                   id (PK)                    id (PK)                       id (PK)
name                      name                       customer_id (FK -> users)     order_id (FK -> orders)
email (unique)            description                total                         food_item_id (FK -> food_items,
phone                     category (Starters, Main   address                                     SET NULL on delete)
password_hash               Course, Biryani,         status (Placed, Preparing,    name     (copied at order time)
role (customer/admin)       Desserts, Beverages)       Out for delivery,           price    (copied at order time)
created_at                price                        Delivered, Cancelled)       quantity
                          is_veg                     created_at, updated_at
                          is_available
                          created_at
```

Name and price are copied into `order_items`, so old orders still show the right amount after the menu changes or an item is removed.

## API

| Method | Endpoint | Who | Purpose |
|---|---|---|---|
| POST | `/api/auth/register` | – | Customer sign up |
| POST | `/api/auth/login` | – | Login, returns JWT |
| GET | `/api/foods?search=&category=&veg=&sort=` | – | Menu with search, filter, sort |
| GET | `/api/foods/:id` | – | One food item |
| POST | `/api/foods` | Admin | Add food item |
| PUT | `/api/foods/:id` | Admin | Modify food item / availability |
| DELETE | `/api/foods/:id` | Admin | Remove food item |
| POST | `/api/orders` | Customer | Place order `{ items: [{ id, quantity }], address }` |
| GET | `/api/orders/my` | Customer | Own orders with items and status |
| PATCH | `/api/orders/:id/cancel` | Customer | Cancel while *Placed* |
| GET | `/api/orders?status=` | Admin | All orders |
| PATCH | `/api/orders/:id/status` | Admin | Update order status |

## Project structure

```
food-ordering/
├── server/
│   ├── index.js  db.js  schema.sql  init-db.js
│   ├── middleware/auth.js          JWT + role check
│   └── routes/  auth.js  foods.js  orders.js
└── client/src/
    ├── main.jsx  App.jsx  api.js  App.css
    ├── context/  AuthContext.jsx  CartContext.jsx
    ├── components/  Navbar  FoodCard (+ VegMark)  OrderTracker  ProtectedRoute
    └── pages/  Menu  Cart  Login  Register  MyOrders
               admin/MenuItems  admin/Orders
```
