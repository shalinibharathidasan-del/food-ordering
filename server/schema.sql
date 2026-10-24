-- Online Food Ordering System - database schema

CREATE TABLE IF NOT EXISTS users (
  id            INT AUTO_INCREMENT PRIMARY KEY,
  name          VARCHAR(100) NOT NULL,
  email         VARCHAR(100) NOT NULL UNIQUE,
  phone         VARCHAR(15),
  password_hash VARCHAR(100) NOT NULL,
  role          ENUM('customer', 'admin') NOT NULL DEFAULT 'customer',
  created_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS food_items (
  id           INT AUTO_INCREMENT PRIMARY KEY,
  name         VARCHAR(100) NOT NULL,
  description  VARCHAR(255),
  category     ENUM('Starters', 'Main Course', 'Biryani', 'Desserts', 'Beverages') NOT NULL,
  price        DECIMAL(7,2) NOT NULL CHECK (price > 0),
  is_veg       BOOLEAN NOT NULL DEFAULT TRUE,
  is_available BOOLEAN NOT NULL DEFAULT TRUE,
  created_at   TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS orders (
  id          INT AUTO_INCREMENT PRIMARY KEY,
  customer_id INT NOT NULL,
  total       DECIMAL(9,2) NOT NULL,
  address     VARCHAR(255) NOT NULL,
  status      ENUM('Placed', 'Preparing', 'Out for delivery', 'Delivered', 'Cancelled') NOT NULL DEFAULT 'Placed',
  created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (customer_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Name and price are copied at order time so old orders stay correct if the menu changes
CREATE TABLE IF NOT EXISTS order_items (
  id           INT AUTO_INCREMENT PRIMARY KEY,
  order_id     INT NOT NULL,
  food_item_id INT,
  name         VARCHAR(100) NOT NULL,
  price        DECIMAL(7,2) NOT NULL,
  quantity     INT NOT NULL CHECK (quantity > 0),
  FOREIGN KEY (order_id)     REFERENCES orders(id)     ON DELETE CASCADE,
  FOREIGN KEY (food_item_id) REFERENCES food_items(id) ON DELETE SET NULL
);
