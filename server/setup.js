const db = require('./config/db');
const fs = require('fs');
const path = require('path');
const { uploadsPath } = require('./config/storage');

async function setup() {
  console.log('🔧 Initializing database and synchronizing data...');

  try {
    // 1. Ensure tables exist (especially important for first run on Render persistent disk)
    console.log('🔄 Ensuring tables exist...');
    const tables = [
      `CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        email TEXT NOT NULL UNIQUE,
        password_hash TEXT NOT NULL,
        role TEXT DEFAULT 'user',
        phone TEXT,
        address TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )`,
      `CREATE TABLE IF NOT EXISTS categories (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        slug TEXT NOT NULL UNIQUE,
        description TEXT,
        image_url TEXT
      )`,
      `CREATE TABLE IF NOT EXISTS products (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        description TEXT,
        price REAL NOT NULL,
        discount_price REAL,
        category_id INTEGER,
        brand TEXT,
        stock_qty INTEGER DEFAULT 0,
        is_featured INTEGER DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL
      )`,
      `CREATE TABLE IF NOT EXISTS product_images (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        product_id INTEGER NOT NULL,
        image_url TEXT NOT NULL,
        is_primary INTEGER DEFAULT 0,
        FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
      )`,
      `CREATE TABLE IF NOT EXISTS product_sizes (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        product_id INTEGER NOT NULL,
        size TEXT NOT NULL,
        stock_qty INTEGER DEFAULT 0,
        FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
      )`,
      `CREATE TABLE IF NOT EXISTS coupons (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        code TEXT NOT NULL UNIQUE,
        discount_type TEXT NOT NULL,
        value REAL NOT NULL,
        min_order REAL DEFAULT 0,
        max_uses INTEGER DEFAULT 0,
        used_count INTEGER DEFAULT 0,
        expiry_date TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )`
    ];

    for (const sql of tables) {
      await db.query(sql);
    }
    console.log('✅ Tables verified.');

    // 2. Sync Images (Copy from project folder to persistent storage on Render)
    const localUploads = path.join(__dirname, 'uploads');
    if (fs.existsSync(localUploads) && localUploads !== uploadsPath) {
        console.log('🔄 Syncing local images to persistent storage...');
        const files = fs.readdirSync(localUploads);
        for (const file of files) {
            const src = path.join(localUploads, file);
            const dest = path.join(uploadsPath, file);
            if (!fs.existsSync(dest)) {
                fs.copyFileSync(src, dest);
            }
        }
        console.log(`✅ Synced ${files.length} images.`);
    }

    // 3. Check if we already have data
    const [rows] = await db.query('SELECT COUNT(*) as c FROM users');
    if (rows && rows[0] && rows[0].c > 0) {
      console.log(`✅ Database already contains ${rows[0].c} users. Skipping data import.`);
      return;
    }

    // 3. Import from snapshot if it exists
    const snapshotPath = path.join(__dirname, 'data_snapshot.json');
    if (fs.existsSync(snapshotPath)) {
        console.log('🔄 Found data_snapshot.json. Importing your work...');
        const data = JSON.parse(fs.readFileSync(snapshotPath, 'utf8'));

        // Import Categories
        for (const cat of data.categories) {
            await db.query(
                'INSERT OR IGNORE INTO categories (id, name, slug, description, image_url) VALUES (?, ?, ?, ?, ?)',
                [cat.id, cat.name, cat.slug, cat.description, cat.image_url]
            );
        }

        // Import Products
        for (const p of data.products) {
            await db.query(
                'INSERT OR IGNORE INTO products (id, name, description, price, discount_price, category_id, brand, stock_qty, is_featured, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
                [p.id, p.name, p.description, p.price, p.discount_price, p.category_id, p.brand, p.stock_qty, p.is_featured, p.created_at]
            );
        }

        // Import Images
        for (const img of data.product_images) {
            await db.query(
                'INSERT OR IGNORE INTO product_images (id, product_id, image_url, is_primary) VALUES (?, ?, ?, ?)',
                [img.id, img.product_id, img.image_url, img.is_primary]
            );
        }

        // Import Sizes
        for (const s of data.product_sizes) {
            await db.query(
                'INSERT OR IGNORE INTO product_sizes (id, product_id, size, stock_qty) VALUES (?, ?, ?, ?)',
                [s.id, s.product_id, s.size, s.stock_qty]
            );
        }

        // Import Coupons
        for (const c of data.coupons) {
            await db.query(
                'INSERT OR IGNORE INTO coupons (id, code, discount_type, value, min_order, max_uses, used_count, expiry_date, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
                [c.id, c.code, c.discount_type, c.value, c.min_order, c.max_uses, c.used_count, c.expiry_date, c.created_at]
            );
        }

        // Import Admin Users
        for (const u of data.users) {
            await db.query(
                'INSERT OR IGNORE INTO users (name, email, password_hash, role, phone, address) VALUES (?, ?, ?, ?, ?, ?)',
                [u.name, u.email, u.password_hash, u.role, u.phone, u.address]
            );
        }

        console.log('🎉 Data successfully imported from snapshot!');
    } else {
        console.log('ℹ️ No data_snapshot.json found. Dashboard will be empty until you add products.');
    }

  } catch (error) {
    console.error('❌ Setup error:', error.message);
  }
}

module.exports = setup;
