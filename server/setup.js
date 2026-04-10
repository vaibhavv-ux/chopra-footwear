const { connectDB, getDB } = require('./config/db');
const bcrypt = require('bcryptjs');

async function setup() {
  console.log('🔧 Setting up MongoDB database...');

  try {
    await connectDB();
    const db = getDB();

    // Create collections (MongoDB creates them automatically when first used)
    console.log('✅ MongoDB collections ready');

    // Check if already seeded
    const userCount = await db.collection('users').countDocuments();
    if (userCount > 0) {
      console.log('✅ Database already seeded, skipping...');
      return;
    }

    // Seed admin user
    const adminHash = await bcrypt.hash('Admin@123', 12);
    await db.collection('users').insertOne({
      name: 'Admin Chopra',
      email: 'admin@chopra.com',
      password_hash: adminHash,
      role: 'admin',
      phone: '9876543210',
      address: '123 Admin Street, New Delhi, India',
      created_at: new Date()
    });
    console.log('✅ Admin user created (admin@chopra.com / Admin@123)');

    // Seed categories
    const categories = [
      { name: 'Sneakers', slug: 'sneakers', description: 'Trendy and comfortable sneakers for everyday wear.', image_url: 'https://picsum.photos/seed/sneakers/600/400' },
      { name: 'Formal', slug: 'formal', description: 'Elegant formal footwear for professional occasions.', image_url: 'https://picsum.photos/seed/formal/600/400' },
      { name: 'Sports', slug: 'sports', description: 'High-performance sports footwear for athletes.', image_url: 'https://picsum.photos/seed/sports/600/400' }
    ];

    for (const category of categories) {
      await db.collection('categories').insertOne({
        ...category,
        created_at: new Date()
      });
    }
    console.log('✅ Categories seeded');

    // Get category IDs
    const sneakersCat = await db.collection('categories').findOne({ slug: 'sneakers' });
    const formalCat = await db.collection('categories').findOne({ slug: 'formal' });
    const sportsCat = await db.collection('categories').findOne({ slug: 'sports' });

    // Seed products
    const products = [
      { name: 'Urban Stride Classic', description: 'Premium urban sneakers with cushioned insole and breathable mesh upper. Perfect for daily commutes.', price: 3499, discount_price: 2799, category_id: sneakersCat._id, brand: 'Chopra Originals', stock_qty: 50, is_featured: 1, primary_image: 'https://picsum.photos/seed/shoe1a/800/800' },
      { name: 'Metro Runner Pro', description: 'Lightweight running-inspired sneakers with responsive cushioning and sleek silhouette.', price: 4299, discount_price: 3599, category_id: sneakersCat._id, brand: 'Chopra Sport', stock_qty: 35, is_featured: 1, primary_image: 'https://picsum.photos/seed/shoe2a/800/800' },
      { name: 'Canvas Wave', description: 'Classic canvas sneakers with a contemporary twist. Reinforced toe cap and padded collar.', price: 1999, discount_price: 1499, category_id: sneakersCat._id, brand: 'Chopra Basics', stock_qty: 80, is_featured: 0, primary_image: 'https://picsum.photos/seed/shoe3a/800/800' },
      { name: 'Retro Bounce', description: 'Vintage-inspired sneakers with modern comfort technology. Chunky sole with premium suede.', price: 5499, discount_price: 4499, category_id: sneakersCat._id, brand: 'Chopra Premium', stock_qty: 25, is_featured: 1, primary_image: 'https://picsum.photos/seed/shoe4a/800/800' },
      { name: 'Oxford Elite', description: 'Handcrafted oxford shoes in genuine leather with Goodyear welt construction.', price: 7999, discount_price: 6999, category_id: formalCat._id, brand: 'Chopra Luxe', stock_qty: 20, is_featured: 1, primary_image: 'https://picsum.photos/seed/shoe5a/800/800' },
      { name: 'Derby Gentleman', description: 'Classic derby shoes with burnished leather finish. Blake-stitched sole.', price: 6499, discount_price: 5499, category_id: formalCat._id, brand: 'Chopra Luxe', stock_qty: 30, is_featured: 0, primary_image: 'https://picsum.photos/seed/shoe6a/800/800' },
      { name: 'Monk Strap Prestige', description: 'Double monk strap shoes in hand-polished leather. Sophisticated choice.', price: 8499, discount_price: null, category_id: formalCat._id, brand: 'Chopra Luxe', stock_qty: 15, is_featured: 1, primary_image: 'https://picsum.photos/seed/shoe7a/800/800' },
      { name: 'Loafer Comfort', description: 'Penny loafers in soft napa leather with memory foam insole.', price: 4999, discount_price: 3999, category_id: formalCat._id, brand: 'Chopra Premium', stock_qty: 40, is_featured: 0, primary_image: 'https://picsum.photos/seed/shoe8a/800/800' },
      { name: 'Sprint Max 360', description: 'Professional running shoes with responsive energy-return midsole.', price: 5999, discount_price: 4999, category_id: sportsCat._id, brand: 'Chopra Sport', stock_qty: 45, is_featured: 1, primary_image: 'https://picsum.photos/seed/shoe9a/800/800' },
      { name: 'Trail Blazer X', description: 'Rugged trail running shoes with aggressive grip pattern. Waterproof membrane.', price: 6999, discount_price: 5999, category_id: sportsCat._id, brand: 'Chopra Sport', stock_qty: 28, is_featured: 0, primary_image: 'https://picsum.photos/seed/shoe10a/800/800' },
      { name: 'Gym Force Pro', description: 'Versatile training shoes with flat stable sole for weightlifting and cross-training.', price: 4499, discount_price: 3499, category_id: sportsCat._id, brand: 'Chopra Sport', stock_qty: 55, is_featured: 1, primary_image: 'https://picsum.photos/seed/shoe11a/800/800' },
      { name: 'Basketball Dunk Elite', description: 'High-top basketball shoes with ankle support and impact-absorbing heel unit.', price: 7499, discount_price: 6499, category_id: sportsCat._id, brand: 'Chopra Sport', stock_qty: 22, is_featured: 0, primary_image: 'https://picsum.photos/seed/shoe12a/800/800' }
    ];

    for (const product of products) {
      await db.collection('products').insertOne({
        ...product,
        created_at: new Date()
      });
    }
    console.log('✅ Products seeded');

    // Seed welcome coupon
    await db.collection('coupons').insertOne({
      code: 'WELCOME20',
      discount_type: 'percent',
      value: 20,
      min_order: 799,
      max_uses: 0,
      used_count: 0,
      expiry_date: null,
      created_at: new Date()
    });
    console.log('✅ Coupons seeded');

    console.log('✅ Database setup complete!');

  } catch (error) {
    console.error('❌ Setup error:', error);
    throw error;
  }
}

module.exports = setup;
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      product_id INTEGER NOT NULL,
      size TEXT NOT NULL,
      stock_qty INTEGER DEFAULT 0,
      FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS orders (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      total_amount REAL NOT NULL,
      status TEXT DEFAULT 'pending' CHECK(status IN ('pending','confirmed','shipped','delivered','cancelled')),
      payment_method TEXT DEFAULT 'cod' CHECK(payment_method IN ('cod','online')),
      payment_status TEXT DEFAULT 'unpaid',
      address_snapshot TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS order_items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      order_id INTEGER NOT NULL,
      product_id INTEGER NOT NULL,
      size TEXT,
      quantity INTEGER NOT NULL DEFAULT 1,
      price_at_purchase REAL NOT NULL,
      FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
      FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS cart (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      product_id INTEGER NOT NULL,
      size TEXT,
      quantity INTEGER NOT NULL DEFAULT 1,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS wishlist (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      product_id INTEGER NOT NULL,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
      UNIQUE(user_id, product_id)
    );

    CREATE TABLE IF NOT EXISTS reviews (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      product_id INTEGER NOT NULL,
      rating INTEGER NOT NULL CHECK(rating >= 1 AND rating <= 5),
      comment TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
      UNIQUE(user_id, product_id)
    );

    CREATE TABLE IF NOT EXISTS coupons (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      code TEXT NOT NULL UNIQUE,
      discount_type TEXT NOT NULL CHECK(discount_type IN ('percent','flat')),
      value REAL NOT NULL,
      min_order REAL DEFAULT 0,
      max_uses INTEGER DEFAULT 0,
      used_count INTEGER DEFAULT 0,
      expiry_date TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS recently_viewed (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      product_id INTEGER NOT NULL,
      viewed_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
    );
  `);

  console.log('✅ Tables created');

  // Check if already seeded
  const userCount = sqlite.prepare('SELECT COUNT(*) as c FROM users').get();
  if (userCount.c > 0) {
    console.log('✅ Database already seeded, skipping...');
    return;
  }

  // Seed admin user
  const adminHash = bcrypt.hashSync('Admin@123', 12);
  sqlite.prepare(
    'INSERT INTO users (name, email, password_hash, role, phone, address) VALUES (?, ?, ?, ?, ?, ?)'
  ).run('Admin Chopra', 'admin@chopra.com', adminHash, 'admin', '9876543210', '123 Admin Street, New Delhi, India');
  console.log('✅ Admin user created (admin@chopra.com / Admin@123)');

  // Seed categories
  const insertCat = sqlite.prepare('INSERT INTO categories (name, slug, description, image_url) VALUES (?, ?, ?, ?)');
  insertCat.run('Sneakers', 'sneakers', 'Trendy and comfortable sneakers for everyday wear.', 'https://picsum.photos/seed/sneakers/600/400');
  insertCat.run('Formal', 'formal', 'Elegant formal footwear for professional occasions.', 'https://picsum.photos/seed/formal/600/400');
  insertCat.run('Sports', 'sports', 'High-performance sports footwear for athletes.', 'https://picsum.photos/seed/sports/600/400');
  console.log('✅ Categories seeded');

  // Seed products
  const insertProd = sqlite.prepare(
    'INSERT INTO products (name, description, price, discount_price, category_id, brand, stock_qty, is_featured) VALUES (?, ?, ?, ?, ?, ?, ?, ?)'
  );

  const products = [
    ['Urban Stride Classic', 'Premium urban sneakers with cushioned insole and breathable mesh upper. Perfect for daily commutes.', 3499, 2799, 1, 'Chopra Originals', 50, 1],
    ['Metro Runner Pro', 'Lightweight running-inspired sneakers with responsive cushioning and sleek silhouette.', 4299, 3599, 1, 'Chopra Sport', 35, 1],
    ['Canvas Wave', 'Classic canvas sneakers with a contemporary twist. Reinforced toe cap and padded collar.', 1999, 1499, 1, 'Chopra Basics', 80, 0],
    ['Retro Bounce', 'Vintage-inspired sneakers with modern comfort technology. Chunky sole with premium suede.', 5499, 4499, 1, 'Chopra Premium', 25, 1],
    ['Oxford Elite', 'Handcrafted oxford shoes in genuine leather with Goodyear welt construction.', 7999, 6999, 2, 'Chopra Luxe', 20, 1],
    ['Derby Gentleman', 'Classic derby shoes with burnished leather finish. Blake-stitched sole.', 6499, 5499, 2, 'Chopra Luxe', 30, 0],
    ['Monk Strap Prestige', 'Double monk strap shoes in hand-polished leather. Sophisticated choice.', 8499, null, 2, 'Chopra Luxe', 15, 1],
    ['Loafer Comfort', 'Penny loafers in soft napa leather with memory foam insole.', 4999, 3999, 2, 'Chopra Premium', 40, 0],
    ['Sprint Max 360', 'Professional running shoes with responsive energy-return midsole.', 5999, 4999, 3, 'Chopra Sport', 45, 1],
    ['Trail Blazer X', 'Rugged trail running shoes with aggressive grip pattern. Waterproof membrane.', 6999, 5999, 3, 'Chopra Sport', 28, 0],
    ['Gym Force Pro', 'Versatile training shoes with flat stable sole for weightlifting and cross-training.', 4499, 3499, 3, 'Chopra Sport', 55, 1],
    ['Basketball Dunk Elite', 'High-top basketball shoes with ankle support and impact-absorbing heel unit.', 7499, 6499, 3, 'Chopra Sport', 22, 0],
    ['Aqua Grip Slides', 'Quick-drying sports slides with textured footbed for poolside recovery.', 1299, 999, 3, 'Chopra Basics', 100, 0],
    ['Marathon Edge', 'Elite marathon racing shoes with carbon-fiber plate. Ultralight at just 180g.', 9999, 8499, 3, 'Chopra Pro', 18, 1],
  ];

  for (const p of products) {
    insertProd.run(...p);
  }
  console.log('✅ 14 products seeded');

  // Seed product images
  const insertImg = sqlite.prepare('INSERT INTO product_images (product_id, image_url, is_primary) VALUES (?, ?, ?)');
  for (let i = 1; i <= 14; i++) {
    insertImg.run(i, `https://picsum.photos/seed/shoe${i}a/800/800`, 1);
    insertImg.run(i, `https://picsum.photos/seed/shoe${i}b/800/800`, 0);
    if (i % 3 === 1) {
      insertImg.run(i, `https://picsum.photos/seed/shoe${i}c/800/800`, 0);
    }
  }
  console.log('✅ Product images seeded');

  // Seed product sizes
  const insertSize = sqlite.prepare('INSERT INTO product_sizes (product_id, size, stock_qty) VALUES (?, ?, ?)');
  const sizes = ['6', '7', '8', '9', '10'];
  for (let i = 1; i <= 14; i++) {
    for (const s of sizes) {
      insertSize.run(i, s, Math.floor(Math.random() * 15) + 3);
    }
  }
  console.log('✅ Product sizes seeded');

  // Seed coupons
  const insertCoupon = sqlite.prepare('INSERT INTO coupons (code, discount_type, value, min_order, max_uses, used_count, expiry_date) VALUES (?, ?, ?, ?, ?, ?, ?)');
  insertCoupon.run('WELCOME10', 'percent', 10, 1000, 100, 0, '2027-12-31');
  insertCoupon.run('FLAT500', 'flat', 500, 3000, 50, 0, '2027-06-30');
  insertCoupon.run('CHOPRA20', 'percent', 20, 5000, 30, 0, '2027-03-31');
  console.log('✅ Coupons seeded');

  console.log('🎉 Database setup complete!');
}

module.exports = setup;
