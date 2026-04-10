const { MongoClient } = require('mongodb');

// MongoDB connection
const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/chopra-footwear';
const client = new MongoClient(uri, {
  maxPoolSize: 10,
  minPoolSize: 2,
  maxIdleTimeMS: 30000,
  serverSelectionTimeoutMS: 10000, // Timeout after 10s instead of 30s
  socketTimeoutMS: 45000,
  connectTimeoutMS: 10000,
});

let db;

async function connectDB() {
  try {
    if (db) {
      console.log('✅ MongoDB already connected');
      return db;
    }

    console.log('🔄 Connecting to MongoDB...');
    await client.connect();
    db = client.db('chopra-footwear');
    console.log('✅ MongoDB connected successfully');
    return db;
  } catch (error) {
    console.error('❌ MongoDB connection error:', error.message);
    console.error('Connection URI exists:', !!process.env.MONGODB_URI);
    throw new Error(`Database connection failed: ${error.message}`);
  }
}

// Get database instance
const getDB = () => {
  if (!db) {
    throw new Error('Database not connected. Call connectDB() first.');
  }
  return db;
};

module.exports = {
  connectDB,
  getDB,
  client
};
    };
  }
};

console.log('✅ SQLite database connected at:', dbPath);

module.exports = db;
module.exports.sqlite = sqlite;
