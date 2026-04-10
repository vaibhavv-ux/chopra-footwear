const Database = require('better-sqlite3');
const fs = require('fs');
const path = require('path');

const db = new Database('chopra.db');

console.log('📦 Starting data export...');

try {
    const data = {
        categories: db.prepare('SELECT * FROM categories').all(),
        products: db.prepare('SELECT * FROM products').all(),
        product_images: db.prepare('SELECT * FROM product_images').all(),
        product_sizes: db.prepare('SELECT * FROM product_sizes').all(),
        coupons: db.prepare('SELECT * FROM coupons').all(),
        users: db.prepare("SELECT name, email, password_hash, role, phone, address FROM users WHERE role = 'admin'").all()
    };

    fs.writeFileSync('data_snapshot.json', JSON.stringify(data, null, 2));

    console.log('✅ Success! Your 9 products and other data have been saved to data_snapshot.json');
    console.log('🚀 Next Step: Commit this file to GitHub and deploy to Render.');

} catch (error) {
    console.error('❌ Export failed:', error.message);
} finally {
    db.close();
}
