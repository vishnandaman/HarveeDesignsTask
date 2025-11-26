const mongoose = require('mongoose');
const User = require('../models/User');
require('dotenv').config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/harveedesign';

async function createAdmin() {
  try {
    const email = process.argv[2];

    if (!email) {
      console.error('Error: Please provide an email address');
      console.log('Usage: node scripts/createAdmin.js <email>');
      process.exit(1);
    }

    console.log('Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('Connected to MongoDB');

    const user = await User.findOne({ email: email.toLowerCase() });

    if (!user) {
      console.error(`Error: User with email "${email}" not found`);
      console.log('Please register the user first through the UI');
      process.exit(1);
    }

    if (user.role === 'admin') {
      console.log(`User "${email}" is already an admin`);
      process.exit(0);
    }

    user.role = 'admin';
    await user.save();

    console.log(`Success! User "${email}" is now an admin`);
    console.log(`Email: ${user.email}`);
    console.log(`Name: ${user.name}`);
    console.log(`Role: ${user.role}`);
    console.log('\nPlease logout and login again to refresh your session');

    process.exit(0);
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

createAdmin();

