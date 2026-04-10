-- Chopra Footwear Industries Database Schema + Seed Data
-- Run this file to set up the database

CREATE DATABASE IF NOT EXISTS chopra_industries;
USE chopra_industries;

-- Users table
CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(150) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  role ENUM('user','admin') DEFAULT 'user',
  phone VARCHAR(20),
  address TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Categories table
CREATE TABLE IF NOT EXISTS categories (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  slug VARCHAR(100) NOT NULL UNIQUE,
  description TEXT,
  image_url VARCHAR(500)
);

-- Products table
CREATE TABLE IF NOT EXISTS products (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(200) NOT NULL,
  description TEXT,
  price DECIMAL(10,2) NOT NULL,
  discount_price DECIMAL(10,2),
  category_id INT,
  brand VARCHAR(100),
  stock_qty INT DEFAULT 0,
  is_featured BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL
);

-- Product images table
CREATE TABLE IF NOT EXISTS product_images (
  id INT AUTO_INCREMENT PRIMARY KEY,
  product_id INT NOT NULL,
  image_url VARCHAR(500) NOT NULL,
  is_primary BOOLEAN DEFAULT FALSE,
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
);

-- Product sizes table
CREATE TABLE IF NOT EXISTS product_sizes (
  id INT AUTO_INCREMENT PRIMARY KEY,
  product_id INT NOT NULL,
  size VARCHAR(10) NOT NULL,
  stock_qty INT DEFAULT 0,
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
);

-- Orders table
CREATE TABLE IF NOT EXISTS orders (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  total_amount DECIMAL(10,2) NOT NULL,
  status ENUM('pending','confirmed','shipped','delivered','cancelled') DEFAULT 'pending',
  payment_method ENUM('cod','online') DEFAULT 'cod',
  payment_status VARCHAR(50) DEFAULT 'unpaid',
  address_snapshot JSON,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Order items table
CREATE TABLE IF NOT EXISTS order_items (
  id INT AUTO_INCREMENT PRIMARY KEY,
  order_id INT NOT NULL,
  product_id INT NOT NULL,
  size VARCHAR(10),
  quantity INT NOT NULL DEFAULT 1,
  price_at_purchase DECIMAL(10,2) NOT NULL,
  FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
);

-- Cart table
CREATE TABLE IF NOT EXISTS cart (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  product_id INT NOT NULL,
  size VARCHAR(10),
  quantity INT NOT NULL DEFAULT 1,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
);

-- Wishlist table
CREATE TABLE IF NOT EXISTS wishlist (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  product_id INT NOT NULL,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
  UNIQUE KEY unique_wishlist (user_id, product_id)
);

-- Reviews table
CREATE TABLE IF NOT EXISTS reviews (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  product_id INT NOT NULL,
  rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
  UNIQUE KEY unique_review (user_id, product_id)
);

-- Coupons table
CREATE TABLE IF NOT EXISTS coupons (
  id INT AUTO_INCREMENT PRIMARY KEY,
  code VARCHAR(50) NOT NULL UNIQUE,
  discount_type ENUM('percent','flat') NOT NULL,
  value DECIMAL(10,2) NOT NULL,
  min_order DECIMAL(10,2) DEFAULT 0,
  max_uses INT DEFAULT 0,
  used_count INT DEFAULT 0,
  expiry_date DATE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Recently viewed table
CREATE TABLE IF NOT EXISTS recently_viewed (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  product_id INT NOT NULL,
  viewed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
);

-- ========================
-- SEED DATA
-- ========================

-- Admin user (password: Admin@123)
-- bcryptjs hash for Admin@123 with 12 salt rounds
INSERT INTO users (name, email, password_hash, role, phone, address) VALUES
('Admin Chopra', 'admin@chopra.com', '$2a$12$LJ3m4ys3GZxkMiY92foLMOXlNcMSpghN0hnYe/YCJQEd7gEHV0bUa', 'admin', '9876543210', '123 Admin Street, New Delhi, India');

-- Categories
INSERT INTO categories (name, slug, description, image_url) VALUES
('Sneakers', 'sneakers', 'Trendy and comfortable sneakers for everyday wear. From classic designs to modern styles.', 'https://picsum.photos/seed/sneakers/600/400'),
('Formal', 'formal', 'Elegant formal footwear for professional and special occasions. Premium craftsmanship.', 'https://picsum.photos/seed/formal/600/400'),
('Sports', 'sports', 'High-performance sports footwear designed for athletes and fitness enthusiasts.', 'https://picsum.photos/seed/sports/600/400');

-- Products (12+ products across 3 categories)
INSERT INTO products (name, description, price, discount_price, category_id, brand, stock_qty, is_featured) VALUES
-- Sneakers (Category 1)
('Urban Stride Classic', 'Premium urban sneakers with cushioned insole and breathable mesh upper. Perfect for daily commutes and casual outings. Features a durable rubber outsole for all-day comfort.', 3499.00, 2799.00, 1, 'Chopra Originals', 50, TRUE),
('Metro Runner Pro', 'Lightweight running-inspired sneakers with responsive cushioning. Sleek silhouette meets athletic performance for the modern urbanite.', 4299.00, 3599.00, 1, 'Chopra Sport', 35, TRUE),
('Canvas Wave', 'Classic canvas sneakers with a contemporary twist. Reinforced toe cap and padded collar for extra comfort. Available in multiple colorways.', 1999.00, 1499.00, 1, 'Chopra Basics', 80, FALSE),
('Retro Bounce', 'Vintage-inspired sneakers with modern comfort technology. Chunky sole design with premium suede and leather combination upper.', 5499.00, 4499.00, 1, 'Chopra Premium', 25, TRUE),

-- Formal (Category 2)
('Oxford Elite', 'Handcrafted oxford shoes in genuine leather with Goodyear welt construction. The epitome of timeless elegance for the discerning professional.', 7999.00, 6999.00, 2, 'Chopra Luxe', 20, TRUE),
('Derby Gentleman', 'Classic derby shoes with burnished leather finish. Blake-stitched sole for flexibility and comfort during long workdays.', 6499.00, 5499.00, 2, 'Chopra Luxe', 30, FALSE),
('Monk Strap Prestige', 'Double monk strap shoes in hand-polished leather. A sophisticated choice for boardrooms and formal events alike.', 8499.00, NULL, 2, 'Chopra Luxe', 15, TRUE),
('Loafer Comfort', 'Penny loafers in soft napa leather with memory foam insole. Slip-on convenience meets all-day comfort for smart-casual occasions.', 4999.00, 3999.00, 2, 'Chopra Premium', 40, FALSE),

-- Sports (Category 3)
('Sprint Max 360', 'Professional running shoes with responsive energy-return midsole. Engineered mesh upper for maximum breathability during intense workouts.', 5999.00, 4999.00, 3, 'Chopra Sport', 45, TRUE),
('Trail Blazer X', 'Rugged trail running shoes with aggressive grip pattern. Waterproof membrane and reinforced toe guard for off-road adventures.', 6999.00, 5999.00, 3, 'Chopra Sport', 28, FALSE),
('Gym Force Pro', 'Versatile training shoes with flat stable sole for weightlifting and lateral support for cross-training. Multi-sport performance footwear.', 4499.00, 3499.00, 3, 'Chopra Sport', 55, TRUE),
('Basketball Dunk Elite', 'High-top basketball shoes with ankle support and impact-absorbing heel unit. Court-ready performance with street-level style.', 7499.00, 6499.00, 3, 'Chopra Sport', 22, FALSE),
('Aqua Grip Slides', 'Quick-drying sports slides with textured footbed for poolside and post-workout recovery. Lightweight EVA construction.', 1299.00, 999.00, 3, 'Chopra Basics', 100, FALSE),
('Marathon Edge', 'Elite marathon racing shoes with carbon-fiber plate for energy propulsion. Ultralight at just 180g per shoe.', 9999.00, 8499.00, 3, 'Chopra Pro', 18, TRUE);

-- Product Images
INSERT INTO product_images (product_id, image_url, is_primary) VALUES
(1, 'https://picsum.photos/seed/shoe1a/800/800', TRUE),
(1, 'https://picsum.photos/seed/shoe1b/800/800', FALSE),
(1, 'https://picsum.photos/seed/shoe1c/800/800', FALSE),
(2, 'https://picsum.photos/seed/shoe2a/800/800', TRUE),
(2, 'https://picsum.photos/seed/shoe2b/800/800', FALSE),
(2, 'https://picsum.photos/seed/shoe2c/800/800', FALSE),
(3, 'https://picsum.photos/seed/shoe3a/800/800', TRUE),
(3, 'https://picsum.photos/seed/shoe3b/800/800', FALSE),
(4, 'https://picsum.photos/seed/shoe4a/800/800', TRUE),
(4, 'https://picsum.photos/seed/shoe4b/800/800', FALSE),
(4, 'https://picsum.photos/seed/shoe4c/800/800', FALSE),
(5, 'https://picsum.photos/seed/shoe5a/800/800', TRUE),
(5, 'https://picsum.photos/seed/shoe5b/800/800', FALSE),
(6, 'https://picsum.photos/seed/shoe6a/800/800', TRUE),
(6, 'https://picsum.photos/seed/shoe6b/800/800', FALSE),
(7, 'https://picsum.photos/seed/shoe7a/800/800', TRUE),
(7, 'https://picsum.photos/seed/shoe7b/800/800', FALSE),
(8, 'https://picsum.photos/seed/shoe8a/800/800', TRUE),
(8, 'https://picsum.photos/seed/shoe8b/800/800', FALSE),
(9, 'https://picsum.photos/seed/shoe9a/800/800', TRUE),
(9, 'https://picsum.photos/seed/shoe9b/800/800', FALSE),
(9, 'https://picsum.photos/seed/shoe9c/800/800', FALSE),
(10, 'https://picsum.photos/seed/shoe10a/800/800', TRUE),
(10, 'https://picsum.photos/seed/shoe10b/800/800', FALSE),
(11, 'https://picsum.photos/seed/shoe11a/800/800', TRUE),
(11, 'https://picsum.photos/seed/shoe11b/800/800', FALSE),
(12, 'https://picsum.photos/seed/shoe12a/800/800', TRUE),
(12, 'https://picsum.photos/seed/shoe12b/800/800', FALSE),
(13, 'https://picsum.photos/seed/shoe13a/800/800', TRUE),
(13, 'https://picsum.photos/seed/shoe13b/800/800', FALSE),
(14, 'https://picsum.photos/seed/shoe14a/800/800', TRUE),
(14, 'https://picsum.photos/seed/shoe14b/800/800', FALSE),
(14, 'https://picsum.photos/seed/shoe14c/800/800', FALSE);

-- Product Sizes
INSERT INTO product_sizes (product_id, size, stock_qty) VALUES
(1, '6', 8), (1, '7', 12), (1, '8', 15), (1, '9', 10), (1, '10', 5),
(2, '7', 10), (2, '8', 12), (2, '9', 8), (2, '10', 5),
(3, '6', 15), (3, '7', 20), (3, '8', 20), (3, '9', 15), (3, '10', 10),
(4, '7', 5), (4, '8', 8), (4, '9', 7), (4, '10', 5),
(5, '7', 5), (5, '8', 6), (5, '9', 5), (5, '10', 4),
(6, '7', 8), (6, '8', 10), (6, '9', 7), (6, '10', 5),
(7, '7', 3), (7, '8', 5), (7, '9', 4), (7, '10', 3),
(8, '6', 8), (8, '7', 10), (8, '8', 12), (8, '9', 6), (8, '10', 4),
(9, '7', 10), (9, '8', 15), (9, '9', 12), (9, '10', 8),
(10, '7', 6), (10, '8', 8), (10, '9', 8), (10, '10', 6),
(11, '7', 12), (11, '8', 15), (11, '9', 15), (11, '10', 13),
(12, '8', 5), (12, '9', 8), (12, '10', 5), (12, '11', 4),
(13, '6', 20), (13, '7', 25), (13, '8', 25), (13, '9', 20), (13, '10', 10),
(14, '7', 4), (14, '8', 5), (14, '9', 5), (14, '10', 4);

-- Sample Coupons
INSERT INTO coupons (code, discount_type, value, min_order, max_uses, used_count, expiry_date) VALUES
('WELCOME10', 'percent', 10.00, 1000.00, 100, 0, '2027-12-31'),
('FLAT500', 'flat', 500.00, 3000.00, 50, 0, '2027-06-30'),
('CHOPRA20', 'percent', 20.00, 5000.00, 30, 0, '2027-03-31');
