const express = require('express');
const router = express.Router();
const Claim = require('../models/Claim');
const Item = require('../models/Item');
const Notification = require('../models/Notification');
const { protect, admin } = require('../middleware/auth');

// Create claim (Student only)
router.post('/', protect, async (req, res) => {
  try {
    const { itemId, message } = req.body;

    const item = await Item.findById(itemId);
    if (!item) {
      return res.status(404).json({ message: 'Item not found' });
    }

    if (item.status === 'claimed') {
      return res.status(400).json({ message: 'Item already claimed' });
    }

    const existingClaim = await Claim.findOne({
      item: itemId,
      claimant: req.user._id,
      status: { $in: ['pending', 'approved'] },
    });

    if (existingClaim) {
      return res.status(400).json({ message: 'You already claimed this item' });
    }

    const claim = await Claim.create({
      item: itemId,
      claimant: req.user._id,
      message,
    });

    await Notification.create({
      type: 'claim',
      message: `New claim from ${req.user.name} (${req.user.studentId}) for item: ${item.title}`,
      userId: req.user._id,
      itemId: item._id,
      claimId: claim._id,
    });

    res.status(201).json({ success: true, claim });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get all claims (Admin only)
router.get('/', protect, admin, async (req, res) => {
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

// Get my claims (Student)
router.get('/my-claims', protect, async (req, res) => {
  try {
    const claims = await Claim.find({ claimant: req.user._id })
      .populate('item', 'title description itemId status location')
      .sort({ createdAt: -1 });

    res.json({ success: true, claims });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Approve claim with response (Admin only)
router.put('/:id/approve', protect, admin, async (req, res) => {
  try {
    const { response } = req.body;
    
    const claim = await Claim.findById(req.params.id)
      .populate('item')
      .populate('claimant', 'name email');

    if (!claim) {
      return res.status(404).json({ message: 'Claim not found' });
    }

    claim.status = 'approved';
    claim.adminResponse = response || 'Your claim has been approved! Please come to the admin office to collect your item.';
    await claim.save();

    const item = await Item.findById(claim.item._id);
    item.status = 'claimed';
    item.claimedBy = claim.claimant._id;
    await item.save();

    await Notification.create({
      type: 'approval',
      message: `✅ Your claim for "${item.title}" has been approved!\n\n📝 Admin Response: ${claim.adminResponse}`,
      userId: claim.claimant._id,
      itemId: item._id,
      claimId: claim._id,
    });

    res.json({ success: true, claim });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Reject claim with response (Admin only)
router.put('/:id/reject', protect, admin, async (req, res) => {
  try {
    const { response } = req.body;
    
    const claim = await Claim.findById(req.params.id)
      .populate('item')
      .populate('claimant', 'name email');

    if (!claim) {
      return res.status(404).json({ message: 'Claim not found' });
    }

    claim.status = 'rejected';
    claim.adminResponse = response || 'Your claim has been rejected. Please contact admin for more information.';
    await claim.save();

    await Notification.create({
      type: 'rejection',
      message: `❌ Your claim for "${claim.item.title}" was rejected.\n\n📝 Admin Response: ${claim.adminResponse}`,
      userId: claim.claimant._id,
      itemId: claim.item._id,
      claimId: claim._id,
    });

    res.json({ success: true, claim });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
