const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// MongoDB connection with caching for serverless
let cachedDb = null;

async function connectToDatabase() {
  // Return cached connection if available
  if (cachedDb && mongoose.connection.readyState === 1) {
    return cachedDb;
  }

  // If already connecting, wait for it
  if (mongoose.connection.readyState === 2) {
    await new Promise((resolve) => {
      mongoose.connection.once('connected', resolve);
      mongoose.connection.once('error', resolve);
    });
    if (mongoose.connection.readyState === 1) {
      cachedDb = mongoose.connection;
      return cachedDb;
    }
  }

  try {
    const mongoUri = process.env.MONGO_URI;
    
    if (!mongoUri) {
      console.error('MONGO_URI environment variable is not set');
      return null;
    }

    // Connect to MongoDB
    await mongoose.connect(mongoUri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    });

    cachedDb = mongoose.connection;
    console.log('✅ MongoDB connected');
    return cachedDb;
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    // Don't throw in production, just log
    return null;
  }
}

// Connect to database on module load
connectToDatabase();

// API Routes
const movieRoutes = require('../routes/movies');
const omdbRoutes = require('../routes/omdb');

// Middleware to ensure database connection for movie routes
const ensureDbConnection = async (req, res, next) => {
  if (mongoose.connection.readyState !== 1) {
    await connectToDatabase();
  }
  next();
};

app.use('/api/movies', ensureDbConnection, movieRoutes);
app.use('/api/omdb', omdbRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    message: 'Movie Database API is running'
  });
});

// Serve static files from public directory
app.use(express.static(path.join(__dirname, '../public')));

// Serve the main page
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../public', 'index.html'));
});

// Serve other HTML pages
app.get('/search.html', (req, res) => {
  res.sendFile(path.join(__dirname, '../public', 'search.html'));
});

// Handle 404 for API routes
app.use('/api/*', (req, res) => {
  res.status(404).json({ error: 'API route not found' });
});

// Catch-all for frontend routes - serves index.html for client-side routing
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../public', 'index.html'));
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

// Export for Vercel serverless
module.exports = app;

