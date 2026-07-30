const express = require('express');
const router = express.Router();
const Claim = require('../models/Claim');
const Item = require('../models/Item');

// Middleware to verify token
const auth = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ message: 'No token provided' });
    }
    const jwt = require('jsonwebtoken');
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    req.userId = decoded.id;
    req.userRole = decoded.role;
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Invalid token' });
  }
};

// Get all claims (Admin only)
router.get('/', auth, async (req, res) => {
  try {
    if (req.userRole !== 'admin') {
      return res.status(403).json({ message: 'Not authorized. Admin only.' });
    }
    const claims = await Claim.find()
      .populate('claimant', 'name email studentId')
      .populate('item', 'title itemId description location');
    res.json({ claims });
  } catch (error) {
    console.error('Get claims error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get my claims (Student)
router.get('/my-claims', auth, async (req, res) => {
  try {
    const claims = await Claim.find({ claimant: req.userId })
      .populate('item', 'title itemId description location');
    res.json({ claims });
  } catch (error) {
    console.error('Get my claims error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create claim (Student)
router.post('/:itemId', auth, async (req, res) => {
  try {
    const { message } = req.body;
    const item = await Item.findById(req.params.itemId);
    
    if (!item) {
      return res.status(404).json({ message: 'Item not found' });
    }

    // Check if item is already claimed
    if (item.status === 'claimed') {
      return res.status(400).json({ message: 'This item has already been claimed' });
    }

    const claim = new Claim({
      item: item._id,
      claimant: req.userId,
      message,
      status: 'pending'
    });

    await claim.save();
    res.status(201).json({ claim });
  } catch (error) {
    console.error('Create claim error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Approve claim (Admin only)
router.put('/:id/approve', auth, async (req, res) => {
  try {
    if (req.userRole !== 'admin') {
      return res.status(403).json({ message: 'Not authorized. Admin only.' });
    }

    const { response } = req.body;
    const claim = await Claim.findById(req.params.id);
    
    if (!claim) {
      return res.status(404).json({ message: 'Claim not found' });
    }

    claim.status = 'approved';
    claim.adminResponse = response;
    await claim.save();

    // Update item status
    await Item.findByIdAndUpdate(claim.item, { status: 'claimed' });

    res.json({ claim });
  } catch (error) {
    console.error('Approve claim error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Reject claim (Admin only)
router.put('/:id/reject', auth, async (req, res) => {
  try {
    if (req.userRole !== 'admin') {
      return res.status(403).json({ message: 'Not authorized. Admin only.' });
    }

    const { response } = req.body;
    const claim = await Claim.findById(req.params.id);
    
    if (!claim) {
      return res.status(404).json({ message: 'Claim not found' });
    }

    claim.status = 'rejected';
    claim.adminResponse = response;
    await claim.save();

    res.json({ claim });
  } catch (error) {
    console.error('Reject claim error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Send reply to claimant (Admin only)
router.put('/:id/reply', auth, async (req, res) => {
  try {
    if (req.userRole !== 'admin') {
      return res.status(403).json({ message: 'Not authorized. Admin only.' });
    }

    const { reply } = req.body;
    const claim = await Claim.findById(req.params.id)
      .populate('claimant', 'name email')
      .populate('item', 'title');
    
    if (!claim) {
      return res.status(404).json({ message: 'Claim not found' });
    }

    claim.adminResponse = reply;
    await claim.save();

    res.json({ 
      message: 'Reply sent successfully',
      claim 
    });
  } catch (error) {
    console.error('Send reply error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
