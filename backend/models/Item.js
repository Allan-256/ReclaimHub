const mongoose = require('mongoose');

const ItemSchema = new mongoose.Schema({
  itemId: {
    type: String,
    unique: true,
  },
  title: {
    type: String,
    required: [true, 'Please provide a title'],
    trim: true,
  },
  description: {
    type: String,
    required: [true, 'Please provide a description'],
  },
  category: {
    type: String,
    required: true,
    enum: ['Electronics', 'Books', 'Clothing', 'Accessories', 'Documents', 'Other'],
  },
  location: {
    type: String,
    required: [true, 'Please provide a location'],
  },
  dateFound: {
    type: Date,
    required: true,
    default: Date.now,
  },
  status: {
    type: String,
    enum: ['lost', 'found', 'claimed'],
    default: 'lost',
  },
  image: {
    type: String,
  },
  reportedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  claimedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

// Auto-generate item ID before saving
ItemSchema.pre('save', function(next) {
  if (!this.itemId) {
    this.itemId = `RCH-${Date.now().toString().slice(-6)}`;
  }
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('Item', ItemSchema);
