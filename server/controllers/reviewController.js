const db = require('../config/db');

exports.getReviews = async (req, res) => {
  try {
    const { productId } = req.params;
    const [reviews] = await db.query(`
      SELECT r.*, u.name as user_name
      FROM reviews r
      JOIN users u ON r.user_id = u.id
      WHERE r.product_id = ?
      ORDER BY r.created_at DESC
    `, [productId]);

    const [stats] = await db.query(`
      SELECT ROUND(AVG(rating), 1) as avg_rating, COUNT(*) as total_reviews
      FROM reviews WHERE product_id = ?
    `, [productId]);

    res.json({ reviews, stats: stats[0] });
  } catch (error) {
    console.error('Get reviews error:', error);
    res.status(500).json({ message: 'Server error fetching reviews.' });
  }
};

exports.createReview = async (req, res) => {
  try {
    const { productId } = req.params;
    const { rating, comment } = req.body;

    // Check if already reviewed
    const [existing] = await db.query(
      'SELECT id FROM reviews WHERE user_id = ? AND product_id = ?',
      [req.user.id, productId]
    );
    if (existing.length > 0) {
      return res.status(400).json({ message: 'You have already reviewed this product.' });
    }

    await db.query(
      'INSERT INTO reviews (user_id, product_id, rating, comment) VALUES (?, ?, ?, ?)',
      [req.user.id, productId, rating, comment || null]
    );

    res.status(201).json({ message: 'Review submitted' });
  } catch (error) {
    console.error('Create review error:', error);
    res.status(500).json({ message: 'Server error creating review.' });
  }
};
