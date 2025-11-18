const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

// Check for required environment variables
if (!process.env.MONGO_URI) {
    console.error("❌ MONGO_URI is missing. Check if .env exists and has the correct variable.");
    process.exit(1);
}

if (!process.env.JWT_SECRET) {
    console.warn("⚠️ JWT_SECRET is missing. Using default secret (not recommended for production)");
}

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// MongoDB connection
mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
    .then(() => console.log("✅ MongoDB connected"))
    .catch((err) => {
        console.error("❌ MongoDB connection error:", err);
        process.exit(1);
    });

// API Routes
const authRoutes = require('./routes/auth');
const movieRoutes = require('./routes/movies');
const omdbRoutes = require('./routes/omdb');

app.use('/api/auth', authRoutes);
app.use('/api/movies', movieRoutes);
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
app.use(express.static(path.join(__dirname, 'public')));

// Serve the main page
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Handle 404 for API routes
app.use('/api/*', (req, res) => {
    res.status(404).json({ error: 'API route not found' });
});

// Catch-all for frontend routes - serves index.html for client-side routing
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error('Unhandled error:', err);
    res.status(500).json({ error: 'Internal server error' });
});

const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
    console.log(`📁 Serving static files from: ${path.join(__dirname, 'public')}`);
    console.log(`🎬 Movie Database API ready!`);
});

module.exports = app;
