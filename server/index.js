const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const cookieParser = require('cookie-parser');
const path = require('path');
require('dotenv').config();

// Connect to MongoDB and setup database
const { connectDB } = require('./config/db');
const setup = require('./setup');

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
  app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

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
    console.log('🔄 Attempting to connect to MongoDB...');
    await connectDB();
    await setup();
    console.log('✅ Database connected and seeded successfully');

    // Update health check to reflect DB status
    // Note: This is a simple approach - in production you might want to use a more sophisticated health check
  } catch (error) {
    console.error('❌ Database connection failed, but server will continue:', error.message);
    console.log('🔄 Will retry database connection in 30 seconds...');

    // Retry connection after 30 seconds
    setTimeout(connectToDatabase, 30000);
  }
}

startServer();
