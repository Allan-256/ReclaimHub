const express = require('express');
const router = express.Router();

// Get notifications
router.get('/', async (req, res) => {
  try {
    res.json({ notifications: [] });
  } catch (error) {
    console.error('Get notifications error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
