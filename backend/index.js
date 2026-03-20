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
app.use(cors({ origin: process.env.CLIENT_ORIGIN || 'http://localhost:3000' }));
app.use(express.json());

// API Routes
app.use('/api/boards',  boardRoutes);
app.use('/api/cards',   cardRoutes);
app.use('/api/columns', columnRoutes);
app.get('/health', (_req, res) => res.json({ status: 'ok', environment: process.env.NODE_ENV }));

// Static Serving (Production)
if (process.env.NODE_ENV === 'production') {
  const buildPath = path.join(__dirname, '../frontend/build');
  app.use(express.static(buildPath));
  app.get('*', (req, res) => {
    res.sendFile(path.join(buildPath, 'index.html'));
  });
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

mongoose.connect(MONGODB_URI)
  .then(() => {
    console.log('MongoDB connected');
    app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
  })
  .catch(err => { console.error('MongoDB error:', err.message); process.exit(1); });