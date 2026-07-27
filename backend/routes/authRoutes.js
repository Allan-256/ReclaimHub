const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { protect } = require('../middleware/auth');

// Student Registration
router.post('/register', async (req, res) => {
  try {
    const { name, email, studentId, password, phone } = req.body;

    // Validate email domain - must end with @students.cavendish.ac.ug
    if (!email.endsWith('@students.cavendish.ac.ug')) {
      return res.status(400).json({ 
        message: 'Please use a @students.cavendish.ac.ug email address' 
      });
    }

    // Check existing user
    const userExists = await User.findOne({ $or: [{ email }, { studentId }] });
    if (userExists) {
      return res.status(400).json({ 
        message: 'User with this email or student ID already exists' 
      });
    }

    // Create user
    const user = await User.create({
      name,
      email,
      studentId,
      password,
      phone,
      role: 'student',
    });

    // Generate token
    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '30d' }
    );

    res.status(201).json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        studentId: user.studentId,
        role: user.role,
        phone: user.phone,
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '30d' }
    );

    res.json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        studentId: user.studentId,
        role: user.role,
        phone: user.phone,
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get current user
router.get('/me', protect, async (req, res) => {
  res.json({
    success: true,
    user: req.user,
  });
});

module.exports = router;
