const Database = require('better-sqlite3');
const db = new Database('./chopra.db');

try {
  const products = db.prepare('SELECT id, name, brand, price, stock_qty FROM products WHERE id > 12').all();
  console.log('Custom products found:', products.length);
  products.forEach(p => {
    console.log(`${p.id}: ${p.name} - ${p.brand} - ₹${p.price} - Stock: ${p.stock_qty}`);
  });

  if (products.length === 0) {
    console.log('No custom products found. All products are from seed data.');
  }
} catch (error) {
  console.error('Error:', error.message);
} finally {
  db.close();
}