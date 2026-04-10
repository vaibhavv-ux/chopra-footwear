const db = require('../config/db');

exports.getCart = async (req, res) => {
  try {
    const [items] = await db.query(`
      SELECT c.*, p.name, p.price, p.discount_price, p.stock_qty,
        (SELECT pi.image_url FROM product_images pi WHERE pi.product_id = p.id AND pi.is_primary = 1 LIMIT 1) as image
      FROM cart c
      JOIN products p ON c.product_id = p.id
      WHERE c.user_id = ?
    `, [req.user.id]);
    res.json({ cart: items });
  } catch (error) {
    console.error('Get cart error:', error);
    res.status(500).json({ message: 'Server error fetching cart.' });
  }
};

exports.addToCart = async (req, res) => {
  try {
    const { product_id, size, quantity = 1 } = req.body;

    // Check if item already in cart
    const [existing] = await db.query(
      'SELECT * FROM cart WHERE user_id = ? AND product_id = ? AND size = ?',
      [req.user.id, product_id, size]
    );

    if (existing.length > 0) {
      await db.query(
        'UPDATE cart SET quantity = quantity + ? WHERE id = ?',
        [quantity, existing[0].id]
      );
    } else {
      await db.query(
        'INSERT INTO cart (user_id, product_id, size, quantity) VALUES (?, ?, ?, ?)',
        [req.user.id, product_id, size, quantity]
      );
    }

    res.json({ message: 'Item added to cart' });
  } catch (error) {
    console.error('Add to cart error:', error);
    res.status(500).json({ message: 'Server error adding to cart.' });
  }
};

exports.updateCartItem = async (req, res) => {
  try {
    const { id } = req.params;
    const { quantity } = req.body;

    if (quantity <= 0) {
      await db.query('DELETE FROM cart WHERE id = ? AND user_id = ?', [id, req.user.id]);
      return res.json({ message: 'Item removed from cart' });
    }

    await db.query(
      'UPDATE cart SET quantity = ? WHERE id = ? AND user_id = ?',
      [quantity, id, req.user.id]
    );
    res.json({ message: 'Cart updated' });
  } catch (error) {
    console.error('Update cart error:', error);
    res.status(500).json({ message: 'Server error updating cart.' });
  }
};

exports.removeCartItem = async (req, res) => {
  try {
    const { id } = req.params;
    await db.query('DELETE FROM cart WHERE id = ? AND user_id = ?', [id, req.user.id]);
    res.json({ message: 'Item removed from cart' });
  } catch (error) {
    console.error('Remove cart item error:', error);
    res.status(500).json({ message: 'Server error removing cart item.' });
  }
};

exports.clearCart = async (req, res) => {
  try {
    await db.query('DELETE FROM cart WHERE user_id = ?', [req.user.id]);
    res.json({ message: 'Cart cleared' });
  } catch (error) {
    console.error('Clear cart error:', error);
    res.status(500).json({ message: 'Server error clearing cart.' });
  }
};

exports.mergeCart = async (req, res) => {
  try {
    const { items } = req.body; // items from localStorage
    if (!items || items.length === 0) return res.json({ message: 'No items to merge' });

    for (const item of items) {
      const [existing] = await db.query(
        'SELECT * FROM cart WHERE user_id = ? AND product_id = ? AND size = ?',
        [req.user.id, item.product_id, item.size]
      );
      if (existing.length === 0) {
        await db.query(
          'INSERT INTO cart (user_id, product_id, size, quantity) VALUES (?, ?, ?, ?)',
          [req.user.id, item.product_id, item.size, item.quantity]
        );
      }
    }
    res.json({ message: 'Cart merged' });
  } catch (error) {
    console.error('Merge cart error:', error);
    res.status(500).json({ message: 'Server error merging cart.' });
  }
};
