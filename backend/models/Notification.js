const mongoose = require('mongoose');

const NotificationSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['claim', 'approval', 'rejection', 'auto_delete'],
    required: true,
  },
  message: {
    type: String,
    required: true,
  },
  read: {
    type: Boolean,
    default: false,
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  itemId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Item',
  },
  claimId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Claim',
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Notification', NotificationSchema);
