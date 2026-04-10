const db = require('../config/db');

exports.placeOrder = async (req, res) => {
  try {
    const { payment_method = 'cod', address, coupon_code } = req.body;
    const userId = req.user.id;

    // Get cart items
    const [cartItems] = await db.query(`
      SELECT c.*, p.price, p.discount_price, p.name, p.stock_qty
      FROM cart c
      JOIN products p ON c.product_id = p.id
      WHERE c.user_id = ?
    `, [userId]);

    if (cartItems.length === 0) {
      return res.status(400).json({ message: 'Cart is empty.' });
    }

    // Calculate total
    let total = 0;
    for (const item of cartItems) {
      const price = item.discount_price || item.price;
      total += price * item.quantity;
    }

    // Apply coupon if provided
    let discount = 0;
    if (coupon_code) {
      const [coupons] = await db.query(
        'SELECT * FROM coupons WHERE code = ? AND (expiry_date IS NULL OR expiry_date >= date(\'now\')) AND (max_uses = 0 OR used_count < max_uses)',
        [coupon_code]
      );
      if (coupons.length > 0) {
        const coupon = coupons[0];
        if (total >= coupon.min_order) {
          if (coupon.discount_type === 'percent') {
            discount = (total * coupon.value) / 100;
          } else {
            discount = coupon.value;
          }
          await db.query('UPDATE coupons SET used_count = used_count + 1 WHERE id = ?', [coupon.id]);
        }
      }
    }

    total = Math.max(total - discount, 0);

    const addressSnapshot = typeof address === 'string' ? address : JSON.stringify(address);

    // Create order
    const [orderResult] = await db.query(
      'INSERT INTO orders (user_id, total_amount, payment_method, payment_status, address_snapshot) VALUES (?, ?, ?, ?, ?)',
      [userId, total, payment_method, payment_method === 'cod' ? 'unpaid' : 'paid', addressSnapshot]
    );

    const orderId = orderResult.insertId;

    // Create order items
    for (const item of cartItems) {
      const price = item.discount_price || item.price;
      await db.query(
        'INSERT INTO order_items (order_id, product_id, size, quantity, price_at_purchase) VALUES (?, ?, ?, ?, ?)',
        [orderId, item.product_id, item.size, item.quantity, price]
      );

      // Decrease stock
      await db.query('UPDATE products SET stock_qty = stock_qty - ? WHERE id = ?', [item.quantity, item.product_id]);
      if (item.size) {
        await db.query('UPDATE product_sizes SET stock_qty = stock_qty - ? WHERE product_id = ? AND size = ?',
          [item.quantity, item.product_id, item.size]);
      }
    }

    // Clear cart
    await db.query('DELETE FROM cart WHERE user_id = ?', [userId]);

    res.status(201).json({ message: 'Order placed successfully', orderId, total });
  } catch (error) {
    console.error('Place order error:', error);
    res.status(500).json({ message: 'Server error placing order.' });
  }
};

exports.getMyOrders = async (req, res) => {
  try {
    const [orders] = await db.query(`
      SELECT o.*, 
        (SELECT COUNT(*) FROM order_items oi WHERE oi.order_id = o.id) as item_count
      FROM orders o
      WHERE o.user_id = ?
      ORDER BY o.created_at DESC
    `, [req.user.id]);
    res.json({ orders });
  } catch (error) {
    console.error('Get my orders error:', error);
    res.status(500).json({ message: 'Server error fetching orders.' });
  }
};

exports.getOrder = async (req, res) => {
  try {
    const { id } = req.params;
    const [orders] = await db.query('SELECT * FROM orders WHERE id = ?', [id]);
    if (orders.length === 0) {
      return res.status(404).json({ message: 'Order not found.' });
    }

    const order = orders[0];

    // Check ownership (non-admin)
    if (req.user.role !== 'admin' && order.user_id !== req.user.id) {
      return res.status(403).json({ message: 'Access denied.' });
    }

    const [items] = await db.query(`
      SELECT oi.*, p.name, p.brand,
        (SELECT pi.image_url FROM product_images pi WHERE pi.product_id = p.id AND pi.is_primary = 1 LIMIT 1) as image
      FROM order_items oi
      JOIN products p ON oi.product_id = p.id
      WHERE oi.order_id = ?
    `, [id]);

    res.json({ order: { ...order, items } });
  } catch (error) {
    console.error('Get order error:', error);
    res.status(500).json({ message: 'Server error fetching order.' });
  }
};

exports.getAllOrders = async (req, res) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);

    let where = '1=1';
    let params = [];
    if (status) {
      where += ' AND o.status = ?';
      params.push(status);
    }

    const [countRows] = await db.query(`SELECT COUNT(*) as total FROM orders o WHERE ${where}`, params);

    const [orders] = await db.query(`
      SELECT o.*, u.name as user_name, u.email as user_email,
        (SELECT COUNT(*) FROM order_items oi WHERE oi.order_id = o.id) as item_count
      FROM orders o
      JOIN users u ON o.user_id = u.id
      WHERE ${where}
      ORDER BY o.created_at DESC
      LIMIT ? OFFSET ?
    `, [...params, parseInt(limit), offset]);

    res.json({
      orders,
      pagination: { page: parseInt(page), limit: parseInt(limit), total: countRows[0].total, pages: Math.ceil(countRows[0].total / parseInt(limit)) }
    });
  } catch (error) {
    console.error('Get all orders error:', error);
    res.status(500).json({ message: 'Server error fetching orders.' });
  }
};

exports.updateOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const validStatuses = ['pending', 'confirmed', 'shipped', 'delivered', 'cancelled'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: 'Invalid status.' });
    }

    await db.query('UPDATE orders SET status = ? WHERE id = ?', [status, id]);

    if (status === 'delivered') {
      await db.query("UPDATE orders SET payment_status = 'paid' WHERE id = ?", [id]);
    }

    res.json({ message: 'Order status updated' });
  } catch (error) {
    console.error('Update order status error:', error);
    res.status(500).json({ message: 'Server error updating order status.' });
  }
};
