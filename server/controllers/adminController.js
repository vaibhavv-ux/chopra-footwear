const db = require('../config/db');

exports.getDashboard = async (req, res) => {
  try {
    // Total stats
    const [userCount] = await db.query("SELECT COUNT(*) as count FROM users WHERE role = 'user'");
    const [orderCount] = await db.query('SELECT COUNT(*) as count FROM orders');
    const [revenue] = await db.query("SELECT COALESCE(SUM(total_amount), 0) as total FROM orders WHERE status != 'cancelled'");
    const [productCount] = await db.query('SELECT COUNT(*) as count FROM products');

    // Last 7 days revenue
    const [dailySales] = await db.query(`
      SELECT DATE(created_at) as date, SUM(total_amount) as revenue, COUNT(*) as orders
      FROM orders
      WHERE created_at >= date('now', '-7 days') AND status != 'cancelled'
      GROUP BY DATE(created_at)
      ORDER BY date
    `);

    // Orders by category
    const [categoryStats] = await db.query(`
      SELECT c.name, COUNT(oi.id) as order_count, SUM(oi.price_at_purchase * oi.quantity) as revenue
      FROM order_items oi
      JOIN products p ON oi.product_id = p.id
      JOIN categories c ON p.category_id = c.id
      JOIN orders o ON oi.order_id = o.id
      WHERE o.status != 'cancelled'
      GROUP BY c.id, c.name
    `);

    // Recent orders
    const [recentOrders] = await db.query(`
      SELECT o.*, u.name as user_name
      FROM orders o
      JOIN users u ON o.user_id = u.id
      ORDER BY o.created_at DESC
      LIMIT 5
    `);

    // Order status breakdown
    const [statusBreakdown] = await db.query(`
      SELECT status, COUNT(*) as count
      FROM orders
      GROUP BY status
    `);

    res.json({
      stats: {
        users: userCount[0].count,
        orders: orderCount[0].count,
        revenue: revenue[0].total,
        products: productCount[0].count
      },
      dailySales,
      categoryStats,
      recentOrders,
      statusBreakdown
    });
  } catch (error) {
    console.error('Dashboard error:', error);
    res.status(500).json({ message: 'Server error fetching dashboard.' });
  }
};

exports.getUsers = async (req, res) => {
  try {
    const [users] = await db.query(`
      SELECT id, name, email, role, phone, created_at,
        (SELECT COUNT(*) FROM orders o WHERE o.user_id = users.id) as order_count
      FROM users
      ORDER BY created_at DESC
    `);
    res.json({ users });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ message: 'Server error fetching users.' });
  }
};

exports.updateUserRole = async (req, res) => {
  try {
    const { id } = req.params;
    const { role } = req.body;

    if (!['user', 'admin'].includes(role)) {
      return res.status(400).json({ message: 'Invalid role.' });
    }

    await db.query('UPDATE users SET role = ? WHERE id = ?', [role, id]);
    res.json({ message: 'User role updated' });
  } catch (error) {
    console.error('Update user role error:', error);
    res.status(500).json({ message: 'Server error updating user role.' });
  }
};

exports.updateProfile = async (req, res) => {
  try {
    const { name, email, phone, address } = req.body;
    
    // Check email uniqueness if changed
    if (email !== req.user.email) {
      const [existing] = await db.query('SELECT id FROM users WHERE email = ? AND id != ?', [email, req.user.id]);
      if (existing.length > 0) {
        return res.status(400).json({ message: 'Email already in use.' });
      }
    }

    await db.query(
      'UPDATE users SET name = ?, email = ?, phone = ?, address = ? WHERE id = ?',
      [name, email, phone || null, address || null, req.user.id]
    );

    res.json({ message: 'Profile updated', user: { ...req.user, name, email, phone, address } });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ message: 'Server error updating profile.' });
  }
};

exports.getInventory = async (req, res) => {
  try {
    const [products] = await db.query(`
      SELECT p.id, p.name, p.brand, p.stock_qty,
        (SELECT '[' || group_concat(json_object('size', ps.size, 'stock_qty', ps.stock_qty)) || ']'
         FROM product_sizes ps WHERE ps.product_id = p.id) as sizes
      FROM products p
      ORDER BY p.name
    `);
    res.json({ products });
  } catch (error) {
    console.error('Get inventory error:', error);
    res.status(500).json({ message: 'Server error fetching inventory.' });
  }
};

exports.addRecentlyViewed = async (req, res) => {
  try {
    const { product_id } = req.body;
    
    // Delete old entry if exists
    await db.query('DELETE FROM recently_viewed WHERE user_id = ? AND product_id = ?', [req.user.id, product_id]);
    
    // Add new entry
    await db.query('INSERT INTO recently_viewed (user_id, product_id) VALUES (?, ?)', [req.user.id, product_id]);
    
    // Keep only last 6
    await db.query(`
      DELETE FROM recently_viewed WHERE user_id = ? AND id NOT IN (
        SELECT id FROM recently_viewed WHERE user_id = ? ORDER BY viewed_at DESC LIMIT 6
      )
    `, [req.user.id, req.user.id]);

    res.json({ message: 'Recently viewed updated' });
  } catch (error) {
    console.error('Add recently viewed error:', error);
    res.status(500).json({ message: 'Server error.' });
  }
};

exports.getRecentlyViewed = async (req, res) => {
  try {
    const [items] = await db.query(`
      SELECT rv.*, p.name, p.price, p.discount_price,
        (SELECT pi.image_url FROM product_images pi WHERE pi.product_id = p.id AND pi.is_primary = 1 LIMIT 1) as image
      FROM recently_viewed rv
      JOIN products p ON rv.product_id = p.id
      WHERE rv.user_id = ?
      ORDER BY rv.viewed_at DESC
      LIMIT 6
    `, [req.user.id]);
    res.json({ items });
  } catch (error) {
    console.error('Get recently viewed error:', error);
    res.status(500).json({ message: 'Server error.' });
  }
};
