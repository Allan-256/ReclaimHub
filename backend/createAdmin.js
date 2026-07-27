const mongoose = require('mongoose');
const User = require('./models/User');
require('dotenv').config();

async function createAdmin() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);

    const adminExists = await User.findOne({ email: 'admin@cavendish.ac.ug' });
    if (adminExists) {
      console.log('⚠️ Admin already exists');
      console.log('Email: admin@cavendish.ac.ug');
      process.exit();
    }

    const admin = await User.create({
      name: 'System Admin',
      email: 'admin@cavendish.ac.ug',
      studentId: 'ADMIN001',
      password: 'admin123',
      phone: '0777123456',
      role: 'admin',
    });

    console.log('✅ Admin created successfully!');
    console.log('📧 Email: admin@cavendish.ac.ug');
    console.log('🔑 Password: admin123');
    process.exit();
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

createAdmin();
