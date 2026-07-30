const mongoose = require('mongoose');

const ItemSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  category: {
    type: String,
    enum: ['Electronics', 'Books', 'Clothing', 'Accessories', 'Documents', 'Other'],
    default: 'Other',
  },
  location: {
    type: String,
    required: true,
  },
  dateLost: {
    type: Date,
  },
  dateFound: {
    type: Date,
  },
  status: {
    type: String,
    enum: ['lost', 'found', 'claimed'],
    default: 'lost',
  },
  imageData: {
    type: String,
    default: '',
  },
  imageUrl: {
    type: String,
    default: '',
  },
  itemId: {
    type: String,
    unique: true,
  },
  reportedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  serialNumber: {
    type: String,
    default: '',
  },
  make: {
    type: String,
    default: '',
  },
  model: {
    type: String,
    default: '',
  },
  type: {
    type: String,
    default: '',
  },
  resolution: {
    type: String,
    default: '',
  },
  color: {
    type: String,
    default: '',
  },
  imeiNumber: {
    type: String,
    default: '',
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Generate item ID before saving
ItemSchema.pre('save', function(next) {
  if (!this.itemId) {
    this.itemId = 'RCH-' + Math.floor(Math.random() * 900000 + 100000);
  }
  next();
});

module.exports = mongoose.model('Item', ItemSchema);
