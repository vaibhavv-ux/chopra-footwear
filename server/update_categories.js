const Database = require('better-sqlite3');
const path = require('path');

const db = new Database(path.join(__dirname, 'chopra.db'));

try {
  // 1. Rename 'Sneakers' to 'Summer Vibe'
  db.prepare("UPDATE categories SET name = 'Summer Vibe', slug = 'summer-vibe' WHERE slug = 'sneakers'").run();
  console.log("✅ Renamed 'Sneakers' to 'Summer Vibe'");

  // 2. Rename 'Formal' to 'Casuals'
  db.prepare("UPDATE categories SET name = 'Casuals', slug = 'casuals' WHERE slug = 'formal'").run();
  console.log("✅ Renamed 'Formal' to 'Casuals'");

  // 3. Delete 'Sports' category
  // First, set category_id to NULL for products in 'Sports'
  const sportsCat = db.prepare("SELECT id FROM categories WHERE slug = 'sports'").get();
  if (sportsCat) {
    db.prepare("UPDATE products SET category_id = NULL WHERE category_id = ?").run(sportsCat.id);
    db.prepare("DELETE FROM categories WHERE id = ?").run(sportsCat.id);
    console.log("✅ Deleted 'Sports' category");
  } else {
    console.log("ℹ️ 'Sports' category not found or already deleted");
  }

} catch (err) {
  console.error("❌ Error during DB migration:", err);
} finally {
  db.close();
  console.log('Done!');
}
