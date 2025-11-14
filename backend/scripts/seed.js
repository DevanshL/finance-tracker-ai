// Database seeding script for development
const mongoose = require('mongoose');
const User = require('../models/User');
const Category = require('../models/Category');
const Transaction = require('../models/Transaction');
const Budget = require('../models/Budget');
const Goal = require('../models/Goal');
require('dotenv').config();

const seedData = async () => {
  try {
    // Connect to database
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Clear existing data
    console.log('Clearing existing data...');
    await User.deleteMany({});
    await Category.deleteMany({});
    await Transaction.deleteMany({});
    await Budget.deleteMany({});
    await Goal.deleteMany({});

    // Create test user
    console.log('Creating test user...');
    const user = await User.create({
      name: 'Test User',
      email: 'test@example.com',
      password: 'Test123!@#'
    });

    // Create default categories
    console.log('Creating categories...');
    const categories = await Category.insertMany([
      { name: 'Food & Dining', type: 'expense', icon: '🍔', color: '#FF6B6B' },
      { name: 'Transportation', type: 'expense', icon: '🚗', color: '#4ECDC4' },
      { name: 'Shopping', type: 'expense', icon: '🛍️', color: '#45B7D1' },
      { name: 'Entertainment', type: 'expense', icon: '🎬', color: '#FFA07A' },
      { name: 'Bills & Utilities', type: 'expense', icon: '💡', color: '#98D8C8' },
      { name: 'Healthcare', type: 'expense', icon: '🏥', color: '#F7B731' },
      { name: 'Education', type: 'expense', icon: '📚', color: '#5F27CD' },
      { name: 'Salary', type: 'income', icon: '💰', color: '#26DE81' },
      { name: 'Freelance', type: 'income', icon: '💼', color: '#20BF6B' },
      { name: 'Investment', type: 'income', icon: '📈', color: '#2ECC71' }
    ]);

    // Create sample transactions
    console.log('Creating transactions...');
    const now = new Date();
    const transactions = [];
    
    for (let i = 0; i < 30; i++) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);
      
      transactions.push({
        userId: user._id,
        type: i % 3 === 0 ? 'income' : 'expense',
        amount: Math.floor(Math.random() * 500) + 10,
        category: i % 3 === 0 ? 'Salary' : ['Food & Dining', 'Transportation', 'Shopping'][i % 3],
        description: `Sample transaction ${i + 1}`,
        date: date,
        paymentMethod: ['Cash', 'Credit Card', 'Debit Card'][i % 3]
      });
    }
    
    await Transaction.insertMany(transactions);

    // Create sample budgets
    console.log('Creating budgets...');
    await Budget.insertMany([
      {
        userId: user._id,
        name: 'Monthly Food Budget',
        category: 'Food & Dining',
        amount: 500,
        period: 'monthly',
        startDate: new Date(now.getFullYear(), now.getMonth(), 1),
        endDate: new Date(now.getFullYear(), now.getMonth() + 1, 0)
      },
      {
        userId: user._id,
        name: 'Transportation Budget',
        category: 'Transportation',
        amount: 200,
        period: 'monthly',
        startDate: new Date(now.getFullYear(), now.getMonth(), 1),
        endDate: new Date(now.getFullYear(), now.getMonth() + 1, 0)
      }
    ]);

    // Create sample goals
    console.log('Creating goals...');
    await Goal.insertMany([
      {
        userId: user._id,
        name: 'Emergency Fund',
        description: 'Save for emergencies',
        targetAmount: 10000,
        currentAmount: 2500,
        deadline: new Date(now.getFullYear() + 1, 11, 31),
        status: 'active'
      },
      {
        userId: user._id,
        name: 'Vacation Fund',
        description: 'Save for summer vacation',
        targetAmount: 3000,
        currentAmount: 800,
        deadline: new Date(now.getFullYear(), 6, 1),
        status: 'active'
      }
    ]);

    console.log('\n✓ Database seeded successfully!');
    console.log('\nTest account:');
    console.log('  Email: test@example.com');
    console.log('  Password: Test123!@#');
    
    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
};

seedData();
