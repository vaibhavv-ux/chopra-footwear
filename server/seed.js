const bcrypt = require('bcryptjs');
const mysql = require('mysql2/promise');
require('dotenv').config();

async function seed() {
  const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    multipleStatements: true,
  });

  try {
    // Generate admin password hash
    const adminHash = await bcrypt.hash('Admin@123', 12);
    
    // Check if admin already exists
    const [existing] = await pool.query('SELECT id FROM users WHERE email = ?', ['admin@chopra.com']);
    
    if (existing.length === 0) {
      await pool.query(
        'INSERT INTO users (name, email, password_hash, role, phone, address) VALUES (?, ?, ?, ?, ?, ?)',
        ['Admin Chopra', 'admin@chopra.com', adminHash, 'admin', '9876543210', '123 Admin Street, New Delhi, India']
      );
      console.log('✅ Admin user created (admin@chopra.com / Admin@123)');
    } else {
      // Update the hash in case it was wrong from SQL import
      await pool.query('UPDATE users SET password_hash = ? WHERE email = ?', [adminHash, 'admin@chopra.com']);
      console.log('✅ Admin user password updated');
    }

    console.log('✅ Seed complete!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Seed error:', error.message);
    process.exit(1);
  }
}

seed();
