const express = require('express');
const router = express.Router();
const Item = require('../models/Item');
const User = require('../models/User');

// Get stats
router.get('/', async (req, res) => {
  try {
    const [totalItems, lostItems, foundItems, claimedItems, totalUsers] = await Promise.all([
      Item.countDocuments(),
      Item.countDocuments({ status: 'lost' }),
      Item.countDocuments({ status: 'found' }),
      Item.countDocuments({ status: 'claimed' }),
      User.countDocuments(),
    ]);

    res.json({
      stats: {
        totalItems,
        lostItems,
        foundItems,
        claimedItems,
        totalUsers,
        pendingClaims: 0,
        totalClaims: 0
      }
    });
  } catch (error) {
    console.error('Get stats error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
