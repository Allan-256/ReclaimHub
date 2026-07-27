const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Item = require('../models/Item');
const Claim = require('../models/Claim');
const Notification = require('../models/Notification');
const { protect, admin } = require('../middleware/auth');

// Dashboard stats
router.get('/stats', protect, admin, async (req, res) => {
  try {
    const totalUsers = await User.countDocuments({ role: 'student' });
    const totalItems = await Item.countDocuments();
    const lostItems = await Item.countDocuments({ status: 'lost' });
    const foundItems = await Item.countDocuments({ status: 'found' });
    const claimedItems = await Item.countDocuments({ status: 'claimed' });
    const pendingClaims = await Claim.countDocuments({ status: 'pending' });
    const totalClaims = await Claim.countDocuments();

    res.json({
      success: true,
      stats: {
        totalUsers,
        totalItems,
        lostItems,
        foundItems,
        claimedItems,
        pendingClaims,
        totalClaims,
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get all users (Admin only)
router.get('/users', protect, admin, async (req, res) => {
  try {
    const users = await User.find().select('-password').sort({ createdAt: -1 });
    res.json({ success: true, users });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get all claims (Admin only)
router.get('/claims', protect, admin, async (req, res) => {
  try {
    const claims = await Claim.find()
      .populate('item', 'title description itemId status')
      .populate('claimant', 'name email studentId phone')
      .sort({ createdAt: -1 });

    res.json({ success: true, claims });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get notifications (Admin)
router.get('/notifications', protect, admin, async (req, res) => {
  try {
    const notifications = await Notification.find()
      .sort({ createdAt: -1 })
      .limit(50);

    res.json({ success: true, notifications });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Mark notification as read
router.put('/notifications/:id/read', protect, admin, async (req, res) => {
  try {
    const notification = await Notification.findByIdAndUpdate(
      req.params.id,
      { read: true },
      { new: true }
    );

    if (!notification) {
      return res.status(404).json({ message: 'Notification not found' });
    }

    res.json({ success: true, notification });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get unread count (Admin)
router.get('/notifications/unread-count', protect, admin, async (req, res) => {
  try {
    const count = await Notification.countDocuments({ read: false });
    res.json({ success: true, count });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
