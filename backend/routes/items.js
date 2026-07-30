const express = require('express');
const router = express.Router();
const Item = require('../models/Item');

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

// Get all items
router.get('/', async (req, res) => {
  try {
    const items = await Item.find().populate('reportedBy', 'name email studentId');
    res.json({ items });
  } catch (error) {
    console.error('Get items error:', error);
    res.status(500).json({ message: 'Server error: ' + error.message });
  }
});

// Create item with Base64 image
router.post('/', auth, async (req, res) => {
  try {
    const { 
      title, description, category, location, status,
      serialNumber, make, model, type, resolution, color, imeiNumber,
      dateFound, dateLost, imageData 
    } = req.body;

    // Validate required fields
    if (!title || !description || !location) {
      return res.status(400).json({ 
        message: 'Missing required fields: title, description, location are required' 
      });
    }

    const itemData = {
      title,
      description,
      category: category || 'Other',
      location,
      status: status || 'lost',
      reportedBy: req.userId,
      serialNumber: serialNumber || '',
      make: make || '',
      model: model || '',
      type: type || '',
      resolution: resolution || '',
      color: color || '',
      imeiNumber: imeiNumber || '',
    };

    if (dateFound) {
      itemData.dateFound = new Date(dateFound);
    }
    if (dateLost) {
      itemData.dateLost = new Date(dateLost);
    }

    // Store Base64 image directly in MongoDB
    if (imageData && imageData.length > 0) {
      itemData.imageData = imageData;
      itemData.imageUrl = `data:image/jpeg;base64,${imageData}`;
    }

    const item = new Item(itemData);
    await item.save();
    
    res.status(201).json({ item });
  } catch (error) {
    console.error('Create item error:', error);
    res.status(500).json({ message: 'Server error: ' + error.message });
  }
});

// Update item
router.put('/:id', auth, async (req, res) => {
  try {
    if (req.userRole !== 'admin') {
      return res.status(403).json({ message: 'Not authorized. Admin only.' });
    }

    const item = await Item.findById(req.params.id);
    if (!item) {
      return res.status(404).json({ message: 'Item not found' });
    }

    const { title, description, category, location, status } = req.body;
    
    item.title = title || item.title;
    item.description = description || item.description;
    item.category = category || item.category;
    item.location = location || item.location;
    item.status = status || item.status;
    
    await item.save();
    res.json({ message: 'Item updated successfully', item });
  } catch (error) {
    console.error('Update item error:', error);
    res.status(500).json({ message: 'Server error: ' + error.message });
  }
});

// Delete item
router.delete('/:id', auth, async (req, res) => {
  try {
    if (req.userRole !== 'admin') {
      return res.status(403).json({ message: 'Not authorized. Admin only.' });
    }

    const item = await Item.findById(req.params.id);
    if (!item) {
      return res.status(404).json({ message: 'Item not found' });
    }

    await item.deleteOne();
    res.json({ message: 'Item deleted successfully' });
  } catch (error) {
    console.error('Delete item error:', error);
    res.status(500).json({ message: 'Server error: ' + error.message });
  }
});

module.exports = router;
