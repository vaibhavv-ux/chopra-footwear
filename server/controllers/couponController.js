const db = require('../config/db');

exports.validateCoupon = async (req, res) => {
  try {
    const { code, order_total } = req.body;

    const [coupons] = await db.query(
      'SELECT * FROM coupons WHERE code = ?',
      [code]
    );

    if (coupons.length === 0) {
      return res.status(404).json({ message: 'Invalid coupon code.' });
    }

    const coupon = coupons[0];

    if (coupon.expiry_date && new Date(coupon.expiry_date) < new Date()) {
      return res.status(400).json({ message: 'Coupon has expired.' });
    }

    if (coupon.max_uses > 0 && coupon.used_count >= coupon.max_uses) {
      return res.status(400).json({ message: 'Coupon usage limit reached.' });
    }

    if (order_total < coupon.min_order) {
      return res.status(400).json({ message: `Minimum order of ₹${coupon.min_order} required.` });
    }

    let discount = 0;
    if (coupon.discount_type === 'percent') {
      discount = (order_total * coupon.value) / 100;
    } else {
      discount = coupon.value;
    }

    res.json({
      valid: true,
      coupon: {
        code: coupon.code,
        discount_type: coupon.discount_type,
        value: coupon.value,
        discount
      }
    });
  } catch (error) {
    console.error('Validate coupon error:', error);
    res.status(500).json({ message: 'Server error validating coupon.' });
  }
};

exports.createCoupon = async (req, res) => {
  try {
    const { code, discount_type, value, min_order, max_uses, expiry_date } = req.body;

    const [existing] = await db.query('SELECT id FROM coupons WHERE code = ?', [code]);
    if (existing.length > 0) {
      return res.status(400).json({ message: 'Coupon code already exists.' });
    }

    await db.query(
      'INSERT INTO coupons (code, discount_type, value, min_order, max_uses, expiry_date) VALUES (?, ?, ?, ?, ?, ?)',
      [code, discount_type, value, min_order || 0, max_uses || 0, expiry_date || null]
    );

    res.status(201).json({ message: 'Coupon created' });
  } catch (error) {
    console.error('Create coupon error:', error);
    res.status(500).json({ message: 'Server error creating coupon.' });
  }
};

exports.getCoupons = async (req, res) => {
  try {
    const [coupons] = await db.query('SELECT * FROM coupons ORDER BY created_at DESC');
    res.json({ coupons });
  } catch (error) {
    console.error('Get coupons error:', error);
    res.status(500).json({ message: 'Server error fetching coupons.' });
  }
};

exports.deleteCoupon = async (req, res) => {
  try {
    const { id } = req.params;
    await db.query('DELETE FROM coupons WHERE id = ?', [id]);
    res.json({ message: 'Coupon deleted' });
  } catch (error) {
    console.error('Delete coupon error:', error);
    res.status(500).json({ message: 'Server error deleting coupon.' });
  }
};
