const Database = require('better-sqlite3');
const path = require('path');
const db = new Database(path.join(__dirname, 'chopra.db'));
console.log(JSON.stringify(db.prepare('SELECT * FROM categories').all(), null, 2));
db.close();
