const express = require('express');
const router = express.Router();
const Item = require('../models/Item');
const { protect, admin } = require('../middleware/auth');
const upload = require('../middleware/upload');

// Get all items (Public)
router.get('/', async (req, res) => {
  try {
    const { status, category, search } = req.query;
    let query = {};

    if (status) query.status = status;
    if (category) query.category = category;
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { location: { $regex: search, $options: 'i' } },
        { itemId: { $regex: search, $options: 'i' } },
      ];
    }

    const items = await Item.find(query)
      .populate('reportedBy', 'name email studentId')
      .populate('claimedBy', 'name email studentId')
      .sort({ createdAt: -1 });

    // Add image URL if image exists
    const itemsWithImage = items.map(item => {
      const itemObj = item.toObject();
      if (itemObj.imageData) {
        const base64 = itemObj.imageData.toString('base64');
        itemObj.imageUrl = `data:${itemObj.imageType || 'image/jpeg'};base64,${base64}`;
      }
      delete itemObj.imageData; // Don't send binary data in response
      return itemObj;
    });

    res.json({ success: true, items: itemsWithImage });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get single item (Public)
router.get('/:id', async (req, res) => {
  try {
    const item = await Item.findById(req.params.id)
      .populate('reportedBy', 'name email studentId phone')
      .populate('claimedBy', 'name email studentId phone');

    if (!item) {
      return res.status(404).json({ message: 'Item not found' });
    }

    const itemObj = item.toObject();
    if (itemObj.imageData) {
      const base64 = itemObj.imageData.toString('base64');
      itemObj.imageUrl = `data:${itemObj.imageType || 'image/jpeg'};base64,${base64}`;
    }
    delete itemObj.imageData;

    res.json({ success: true, item: itemObj });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create item with image stored in Atlas
router.post('/', protect, upload.single('image'), async (req, res) => {
  try {
    const itemData = {
      ...req.body,
      reportedBy: req.user._id,
    };

    if (req.file) {
      itemData.imageData = req.file.buffer;
      itemData.imageType = req.file.mimetype;
      itemData.image = req.file.originalname;
    }

    const item = await Item.create(itemData);
    await item.populate('reportedBy', 'name email studentId');
    
    const itemObj = item.toObject();
    if (itemObj.imageData) {
      const base64 = itemObj.imageData.toString('base64');
      itemObj.imageUrl = `data:${itemObj.imageType || 'image/jpeg'};base64,${base64}`;
    }
    delete itemObj.imageData;

    res.status(201).json({ success: true, item: itemObj });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update item (Admin only)
router.put('/:id', protect, admin, upload.single('image'), async (req, res) => {
  try {
    const updateData = { ...req.body };
    
    if (req.file) {
      updateData.imageData = req.file.buffer;
      updateData.imageType = req.file.mimetype;
      updateData.image = req.file.originalname;
    }

    const item = await Item.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    )
    .populate('reportedBy', 'name email studentId')
    .populate('claimedBy', 'name email studentId');

    if (!item) {
      return res.status(404).json({ message: 'Item not found' });
    }

    const itemObj = item.toObject();
    if (itemObj.imageData) {
      const base64 = itemObj.imageData.toString('base64');
      itemObj.imageUrl = `data:${itemObj.imageType || 'image/jpeg'};base64,${base64}`;
    }
    delete itemObj.imageData;

    res.json({ success: true, item: itemObj });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Delete item (Admin only)
router.delete('/:id', protect, admin, async (req, res) => {
  try {
    const item = await Item.findByIdAndDelete(req.params.id);
    if (!item) {
      return res.status(404).json({ message: 'Item not found' });
    }

    res.json({ success: true, message: 'Item deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
