const Category = require('../models/Category');
const { DEFAULT_CATEGORIES } = require('../config/constants');

/**
 * Seed default categories into database
 */
const seedDefaultCategories = async () => {
  try {
    // Check if default categories already exist
    const existingCategories = await Category.countDocuments({ isDefault: true });
    
    if (existingCategories > 0) {
      console.log('✅ Default categories already exist');
      return;
    }

    const categories = [];

    // Add income categories
    DEFAULT_CATEGORIES.INCOME.forEach(cat => {
      categories.push({
        name: cat.name,
        type: 'income',
        icon: cat.icon,
        color: cat.color,
        userId: null,
        isDefault: true
      });
    });

    // Add expense categories
    DEFAULT_CATEGORIES.EXPENSE.forEach(cat => {
      categories.push({
        name: cat.name,
        type: 'expense',
        icon: cat.icon,
        color: cat.color,
        userId: null,
        isDefault: true
      });
    });

    // Insert all categories
    await Category.insertMany(categories);
    console.log(`✅ Successfully seeded ${categories.length} default categories`);
    
  } catch (error) {
    console.error('❌ Error seeding categories:', error.message);
  }
};

/**
 * Get categories for a user (default + user-created)
 */
const getUserCategories = async (userId, type = null) => {
  try {
    const query = {
      $or: [
        { userId: null, isDefault: true }, // Default categories
        { userId: userId } // User's custom categories
      ]
    };

    if (type) {
      query.type = type;
    }

    const categories = await Category.find(query).sort({ name: 1 });
    return categories;
  } catch (error) {
    throw new Error('Error fetching categories');
  }
};

module.exports = {
  seedDefaultCategories,
  getUserCategories
};
