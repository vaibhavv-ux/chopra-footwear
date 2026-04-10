const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const cookieParser = require('cookie-parser');
const path = require('path');
require('dotenv').config();

// Connect to Database and setup
const db = require('./config/db');
const setup = require('./setup');

const { uploadsPath } = require('./config/storage');

async function startServer() {
  const app = express();

  // Middleware
  app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));
  app.use(cors({
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    credentials: true
  }));
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  app.use(cookieParser());

  // Static files
  app.use('/uploads', express.static(uploadsPath));

  // Health check (works even if DB is down)
  app.get('/api/health', (req, res) => {
    res.json({
      status: 'ok',
      message: 'Chopra Footwear Industries API is running',
      database: 'connecting...'
    });
  });

  // Routes
  app.use('/api/auth', require('./routes/auth'));
  app.use('/api/products', require('./routes/products'));
  app.use('/api/categories', require('./routes/categories'));
  app.use('/api/cart', require('./routes/cart'));
  app.use('/api/orders', require('./routes/orders'));
  app.use('/api/wishlist', require('./routes/wishlist'));
  app.use('/api/reviews', require('./routes/reviews'));
  app.use('/api/coupons', require('./routes/coupons'));
  app.use('/api/admin', require('./routes/admin'));

  // Error handler
  app.use((err, req, res, next) => {
    console.error('Unhandled error:', err);
    if (err.type === 'entity.parse.failed') {
      return res.status(400).json({ message: 'Invalid JSON in request body' });
    }
    if (err.message && err.message.includes('Only image files')) {
      return res.status(400).json({ message: err.message });
    }
    res.status(500).json({ message: 'Internal server error' });
  });

  // Serve React frontend in production
  const clientBuildPath = path.join(__dirname, '..', 'client', 'dist');
  app.use(express.static(clientBuildPath));
  app.get('*', (req, res) => {
    res.sendFile(path.join(clientBuildPath, 'index.html'));
  });

  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => {
    console.log(`🚀 Chopra Footwear Industries API running on port ${PORT}`);
  });

  // Connect to database asynchronously (don't block server startup)
  connectToDatabase();
}

async function connectToDatabase() {
  try {
    console.log('🔄 Initializing database...');
    // In SQLite, the connection is already established on require.
    // We just need to run the setup to ensure tables exist.
    await setup();
    console.log('✅ Database ready and listings restored');
  } catch (error) {
    console.error('❌ Database initialization failed:', error.message);
    // Exit if database setup fails critically
    process.exit(1);
  }
}

startServer();
