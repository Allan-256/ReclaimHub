const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const fs = require('fs');

dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Get absolute path to frontend build
const frontendBuildPath = path.resolve(__dirname, '../frontend/build');
console.log('📁 Frontend build path:', frontendBuildPath);

// Check if index.html exists
const indexPath = path.join(frontendBuildPath, 'index.html');
console.log('📄 Index.html path:', indexPath);
console.log('📄 Index.html exists?', fs.existsSync(indexPath));

// Serve static files from frontend build
app.use(express.static(frontendBuildPath));

// Import routes
const authRoutes = require('./routes/authRoutes');
const itemRoutes = require('./routes/itemRoutes');
const claimRoutes = require('./routes/claimRoutes');
const adminRoutes = require('./routes/adminRoutes');

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/items', itemRoutes);
app.use('/api/claims', claimRoutes);
app.use('/api/admin', adminRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'ReclaimHub API is running' });
});

// All non-API routes go to React app
app.get('*', (req, res) => {
  console.log('📄 Serving index.html for:', req.url);
  res.sendFile(indexPath);
});

// Error handling
app.use((err, req, res, next) => {
  console.error('❌ Error:', err.stack);
  res.status(500).json({ message: 'Something went wrong!', error: err.message });
});

// MongoDB connection
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('✅ MongoDB connected successfully'))
  .catch(err => console.error('❌ MongoDB connection error:', err));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});

module.exports = app;
