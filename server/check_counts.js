const Database = require('better-sqlite3');
const path = require('path');
const db = new Database(path.join(__dirname, 'chopra.db'));

const cats = db.prepare('SELECT * FROM categories').all();
console.log('Categories:', cats);

const counts = db.prepare('SELECT category_id, COUNT(*) as count FROM products GROUP BY category_id').all();
console.log('Product counts per category:', counts);

db.close();
