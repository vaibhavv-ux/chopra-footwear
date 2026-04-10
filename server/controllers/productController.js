const db = require('../config/db');

exports.getProducts = async (req, res) => {
  try {
    const { category, search, sort, minPrice, maxPrice, size, page = 1, limit = 12 } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);
    
    let where = ['1=1'];
    let params = [];

    if (category) {
      where.push('c.slug = ?');
      params.push(category);
    }
    if (search) {
      where.push('(p.name LIKE ? OR p.description LIKE ? OR p.brand LIKE ?)');
      params.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }
    if (minPrice) {
      where.push('COALESCE(p.discount_price, p.price) >= ?');
      params.push(parseFloat(minPrice));
    }
    if (maxPrice) {
      where.push('COALESCE(p.discount_price, p.price) <= ?');
      params.push(parseFloat(maxPrice));
    }
    if (size) {
      where.push('ps_filter.size = ?');
      params.push(size);
    }

    let orderBy = 'p.created_at DESC';
    switch (sort) {
      case 'price_asc': orderBy = 'COALESCE(p.discount_price, p.price) ASC'; break;
      case 'price_desc': orderBy = 'COALESCE(p.discount_price, p.price) DESC'; break;
      case 'newest': orderBy = 'p.created_at DESC'; break;
      case 'popular': orderBy = 'avg_rating DESC'; break;
    }

    const sizeJoin = size ? 'INNER JOIN product_sizes ps_filter ON p.id = ps_filter.product_id' : '';

    const countQuery = `
      SELECT COUNT(DISTINCT p.id) as total
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      ${sizeJoin}
      WHERE ${where.join(' AND ')}
    `;
    const [countRows] = await db.query(countQuery, params);
    const total = countRows[0].total;

    const query = `
      SELECT p.*, c.name as category_name, c.slug as category_slug,
        (SELECT pi.image_url FROM product_images pi WHERE pi.product_id = p.id AND pi.is_primary = 1 LIMIT 1) as primary_image,
        (SELECT ROUND(AVG(r.rating), 1) FROM reviews r WHERE r.product_id = p.id) as avg_rating,
        (SELECT COUNT(*) FROM reviews r WHERE r.product_id = p.id) as review_count
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      ${sizeJoin}
      WHERE ${where.join(' AND ')}
      GROUP BY p.id
      ORDER BY ${orderBy}
      LIMIT ? OFFSET ?
    `;
    params.push(parseInt(limit), offset);
    const [products] = await db.query(query, params);

    res.json({
      products,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Get products error:', error);
    res.status(500).json({ message: 'Server error fetching products.' });
  }
};

exports.getProduct = async (req, res) => {
  try {
    const { id } = req.params;

    const [products] = await db.query(`
      SELECT p.*, c.name as category_name, c.slug as category_slug,
        (SELECT ROUND(AVG(r.rating), 1) FROM reviews r WHERE r.product_id = p.id) as avg_rating,
        (SELECT COUNT(*) FROM reviews r WHERE r.product_id = p.id) as review_count
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      WHERE p.id = ?
    `, [id]);

    if (products.length === 0) {
      return res.status(404).json({ message: 'Product not found.' });
    }

    const product = products[0];

    const [images] = await db.query('SELECT * FROM product_images WHERE product_id = ? ORDER BY is_primary DESC', [id]);
    const [sizes] = await db.query('SELECT * FROM product_sizes WHERE product_id = ? ORDER BY CAST(size AS INTEGER)', [id]);

    // Related products (same category)
    const [related] = await db.query(`
      SELECT p.*, 
        (SELECT pi.image_url FROM product_images pi WHERE pi.product_id = p.id AND pi.is_primary = 1 LIMIT 1) as primary_image,
        (SELECT ROUND(AVG(r.rating), 1) FROM reviews r WHERE r.product_id = p.id) as avg_rating
      FROM products p
      WHERE p.category_id = ? AND p.id != ?
      ORDER BY RANDOM()
      LIMIT 4
    `, [product.category_id, id]);

    res.json({ product: { ...product, images, sizes }, related });
  } catch (error) {
    console.error('Get product error:', error);
    res.status(500).json({ message: 'Server error fetching product.' });
  }
};

exports.createProduct = async (req, res) => {
  try {
    const { name, description, price, discount_price, category_id, brand, stock_qty, is_featured, sizes } = req.body;

    const [result] = await db.query(
      'INSERT INTO products (name, description, price, discount_price, category_id, brand, stock_qty, is_featured) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [name, description, price, discount_price || null, category_id, brand, stock_qty || 0, is_featured ? 1 : 0]
    );

    const productId = result.insertId;

    // Handle uploaded images
    if (req.files && req.files.length > 0) {
      for (let i = 0; i < req.files.length; i++) {
        const imageUrl = `/uploads/${req.files[i].filename}`;
        await db.query(
          'INSERT INTO product_images (product_id, image_url, is_primary) VALUES (?, ?, ?)',
          [productId, imageUrl, i === 0 ? 1 : 0]
        );
      }
    }

    // Handle sizes
    if (sizes) {
      const parsedSizes = typeof sizes === 'string' ? JSON.parse(sizes) : sizes;
      for (const s of parsedSizes) {
        await db.query(
          'INSERT INTO product_sizes (product_id, size, stock_qty) VALUES (?, ?, ?)',
          [productId, s.size, s.stock_qty || 0]
        );
      }
    }

    res.status(201).json({ message: 'Product created successfully', productId });
  } catch (error) {
    console.error('Create product error:', error);
    res.status(500).json({ message: 'Server error creating product.' });
  }
};

exports.updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, price, discount_price, category_id, brand, stock_qty, is_featured, sizes } = req.body;

    await db.query(
      'UPDATE products SET name=?, description=?, price=?, discount_price=?, category_id=?, brand=?, stock_qty=?, is_featured=? WHERE id=?',
      [name, description, price, discount_price || null, category_id, brand, stock_qty || 0, is_featured ? 1 : 0, id]
    );

    // Handle new uploaded images
    if (req.files && req.files.length > 0) {
      for (let i = 0; i < req.files.length; i++) {
        const imageUrl = `/uploads/${req.files[i].filename}`;
        const [existing] = await db.query('SELECT COUNT(*) as count FROM product_images WHERE product_id = ?', [id]);
        await db.query(
          'INSERT INTO product_images (product_id, image_url, is_primary) VALUES (?, ?, ?)',
          [id, imageUrl, (existing[0].count === 0 && i === 0) ? 1 : 0]
        );
      }
    }

    // Update sizes
    if (sizes) {
      const parsedSizes = typeof sizes === 'string' ? JSON.parse(sizes) : sizes;
      await db.query('DELETE FROM product_sizes WHERE product_id = ?', [id]);
      for (const s of parsedSizes) {
        await db.query(
          'INSERT INTO product_sizes (product_id, size, stock_qty) VALUES (?, ?, ?)',
          [id, s.size, s.stock_qty || 0]
        );
      }
    }

    res.json({ message: 'Product updated successfully' });
  } catch (error) {
    console.error('Update product error:', error);
    res.status(500).json({ message: 'Server error updating product.' });
  }
};

exports.deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const [result] = await db.query('DELETE FROM products WHERE id = ?', [id]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Product not found.' });
    }
    res.json({ message: 'Product deleted successfully' });
  } catch (error) {
    console.error('Delete product error:', error);
    res.status(500).json({ message: 'Server error deleting product.' });
  }
};
