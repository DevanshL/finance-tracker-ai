// Test Setup and Configuration
const mongoose = require('mongoose');
require('dotenv').config({ path: '.env.test' });

// Connect to test database before tests
before(async () => {
  try {
    await mongoose.connect(process.env.MONGODB_TEST_URI || process.env.MONGODB_URI);
    console.log('Connected to test database');
  } catch (error) {
    console.error('Test database connection error:', error);
    process.exit(1);
  }
});

// Clean up after tests
after(async () => {
  await mongoose.connection.close();
  console.log('Test database connection closed');
});
