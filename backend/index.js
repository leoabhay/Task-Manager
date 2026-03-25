require('dotenv').config();
const express  = require('express');
const cors     = require('cors');
const mongoose = require('mongoose');
const helmet   = require('helmet');
const morgan   = require('morgan');
const path     = require('path');
const boardRoutes  = require('./routes/boards');
const cardRoutes   = require('./routes/cards');
const columnRoutes = require('./routes/columns');

const app = express();

// Security and Logging
app.use(helmet({ contentSecurityPolicy: false })); // CSP off for simplicity in MERN
app.use(morgan('dev'));
const allowedOrigins = [
  'http://localhost:3000',
  'http://localhost:5173',
  process.env.CLIENT_ORIGIN
].filter(Boolean).map(url => url.replace(/\/$/, ""));

app.use(cors({
  origin: function (origin, callback) {
    if (!origin) return callback(null, true);
    // Remove trailing slash from origin for reliable matching
    const normalizedOrigin = origin.replace(/\/$/, "");
    if (allowedOrigins.includes(normalizedOrigin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));
app.use(express.json());

// API Routes
app.use('/api/boards',  boardRoutes);
app.use('/api/cards',   cardRoutes);
app.use('/api/columns', columnRoutes);
app.get('/health', (_req, res) => res.json({ status: 'ok', environment: process.env.NODE_ENV }));

// Health check
app.get('/', (_req, res) => res.json({ status: 'ok', environment: process.env.NODE_ENV }));

// Static Serving (Production)
if (process.env.NODE_ENV === 'production') {
  const buildPath = path.join(__dirname, '../frontend/build');
  const fs = require('fs');
  if (fs.existsSync(buildPath)) {
    app.use(express.static(buildPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(buildPath, 'index.html'));
    });
  } else {
    // API-only mode fallback
    app.get('*', (req, res) => {
      if (req.path.startsWith('/api/')) {
        res.status(404).json({ message: 'API Route not found' });
      } else {
        res.json({ message: 'API is running. Connect your frontend to see this app.' });
      }
    });
  }
} else {
  // Default fallback for development
  app.use((_req, res) => res.status(404).json({ message: 'Route not found' }));
}

// Error Handler
app.use((err, _req, res, _next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Internal server error' });
});

const PORT        = process.env.PORT        || 5000;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/kanban';

// Database Connection
mongoose.connect(MONGODB_URI)
  .then(() => console.log('MongoDB connected successfully'))
  .catch(err => {
    console.error('MongoDB connection error:', err.message);
  });

// Start Server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});