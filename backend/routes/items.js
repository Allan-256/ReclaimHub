const express = require('express');
const router = express.Router();
const Item = require('../models/Item');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Configure multer for image upload
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = path.join(__dirname, '../uploads');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'item-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: function (req, file, cb) {
    const filetypes = /jpeg|jpg|png|gif/;
    const mimetype = filetypes.test(file.mimetype);
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    if (mimetype && extname) {
      return cb(null, true);
    }
    cb(new Error('Only image files are allowed'));
  }
});

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

// Get single item
router.get('/:id', async (req, res) => {
  try {
    const item = await Item.findById(req.params.id).populate('reportedBy', 'name email studentId');
    if (!item) {
      return res.status(404).json({ message: 'Item not found' });
    }
    res.json({ item });
  } catch (error) {
    console.error('Get item error:', error);
    res.status(500).json({ message: 'Server error: ' + error.message });
  }
});

// Create item with image upload
router.post('/', auth, upload.single('image'), async (req, res) => {
  try {
    console.log('Creating item...');
    console.log('Body:', req.body);
    console.log('File:', req.file);
    
    const itemData = {
      title: req.body.title,
      description: req.body.description,
      category: req.body.category || 'Other',
      location: req.body.location,
      status: req.body.status || 'lost',
      reportedBy: req.userId,
      serialNumber: req.body.serialNumber || '',
      make: req.body.make || '',
      model: req.body.model || '',
      type: req.body.type || '',
      resolution: req.body.resolution || '',
      color: req.body.color || '',
      imeiNumber: req.body.imeiNumber || '',
    };

    if (req.body.dateFound) {
      itemData.dateFound = new Date(req.body.dateFound);
    }
    if (req.body.dateLost) {
      itemData.dateLost = new Date(req.body.dateLost);
    }

    // IMPORTANT: Save the image URL
    if (req.file) {
      itemData.imageUrl = '/uploads/' + req.file.filename;
      console.log('Image URL saved:', itemData.imageUrl);
    } else {
      console.log('No file uploaded');
    }

    const item = new Item(itemData);
    await item.save();
    
    console.log('Item created with imageUrl:', item.imageUrl);
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

    if (item.imageUrl) {
      const imagePath = path.join(__dirname, '..', item.imageUrl);
      if (fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath);
      }
    }

    await item.deleteOne();
    res.json({ message: 'Item deleted successfully' });
  } catch (error) {
    console.error('Delete item error:', error);
    res.status(500).json({ message: 'Server error: ' + error.message });
  }
});

module.exports = router;
