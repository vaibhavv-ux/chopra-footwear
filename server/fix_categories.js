const Database = require('better-sqlite3');
const path = require('path');

const db = new Database(path.join(__dirname, 'chopra.db'));

try {
  // 1. Ensure 'Summer Vibe' (singular) for ID 1
  db.prepare("UPDATE categories SET name = 'Summer Vibe', slug = 'summer-vibe' WHERE id = 1").run();
  console.log("✅ Set category 1 to 'Summer Vibe'");

  // 2. Ensure 'Casuals' for ID 2 (already named Casuals but checking slug)
  db.prepare("UPDATE categories SET name = 'Casuals', slug = 'casuals' WHERE id = 2").run();
  console.log("✅ Set category 2 to 'Casuals'");

  // 3. Move products from Category 4 (Formal) to Category 2 (Casuals)
  db.prepare("UPDATE products SET category_id = 2 WHERE category_id = 4").run();
  console.log("✅ Moved products from category 4 to category 2");

  // 4. Delete Category 4
  db.prepare("DELETE FROM categories WHERE id = 4").run();
  console.log("✅ Deleted category 4 (Formal)");

  // 5. Final check
  const cats = db.prepare('SELECT * FROM categories').all();
  console.log('Final Categories:', cats);

} catch (err) {
  console.error("❌ Error during DB migration:", err);
} finally {
  db.close();
  console.log('Done!');
}
