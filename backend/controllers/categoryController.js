const Category = require('../models/Category');
const Transaction = require('../models/Transaction');
const { asyncHandler, AppError } = require('../middleware/errorHandler');
const { HTTP_STATUS, SUCCESS_MESSAGES } = require('../config/constants');
const { getUserCategories } = require('../utils/seedCategories');

/**
 * @desc    Get all categories (default + user's custom)
 * @route   GET /api/categories
 * @access  Private
 */
const getCategories = asyncHandler(async (req, res) => {
  const { type } = req.query;

  const categories = await getUserCategories(req.user._id, type);

  res.status(HTTP_STATUS.OK).json({
    success: true,
    count: categories.length,
    data: { categories }
  });
});

/**
 * @desc    Get single category
 * @route   GET /api/categories/:id
 * @access  Private
 */
const getCategory = asyncHandler(async (req, res) => {
  const category = await Category.findById(req.params.id);

  if (!category) {
    throw new AppError('Category not found', HTTP_STATUS.NOT_FOUND);
  }

  // Check if user owns this category (or it's a default)
  if (category.userId && category.userId.toString() !== req.user._id.toString()) {
    throw new AppError('Not authorized to access this category', HTTP_STATUS.FORBIDDEN);
  }

  res.status(HTTP_STATUS.OK).json({
    success: true,
    data: { category }
  });
});

/**
 * @desc    Create custom category
 * @route   POST /api/categories
 * @access  Private
 */
const createCategory = asyncHandler(async (req, res) => {
  const { name, type, icon, color } = req.body;

  // Check if category with same name already exists for user
  const existingCategory = await Category.findOne({
    name: { $regex: new RegExp(`^${name}$`, 'i') },
    userId: req.user._id,
    type
  });

  if (existingCategory) {
    throw new AppError(
      `Category "${name}" already exists for ${type}`,
      HTTP_STATUS.CONFLICT
    );
  }

  const category = await Category.create({
    name,
    type,
    icon: icon || '💰',
    color: color || '#6b7280',
    userId: req.user._id,
    isDefault: false
  });

  res.status(HTTP_STATUS.CREATED).json({
    success: true,
    message: SUCCESS_MESSAGES.CREATED,
    data: { category }
  });
});

/**
 * @desc    Update category
 * @route   PUT /api/categories/:id
 * @access  Private
 */
const updateCategory = asyncHandler(async (req, res) => {
  const category = await Category.findById(req.params.id);

  if (!category) {
    throw new AppError('Category not found', HTTP_STATUS.NOT_FOUND);
  }

  // Can't update default categories
  if (category.isDefault) {
    throw new AppError('Cannot modify default categories', HTTP_STATUS.FORBIDDEN);
  }

  // Check ownership
  if (category.userId.toString() !== req.user._id.toString()) {
    throw new AppError('Not authorized to update this category', HTTP_STATUS.FORBIDDEN);
  }

  // Update fields
  const { name, icon, color } = req.body;

  if (name) category.name = name;
  if (icon) category.icon = icon;
  if (color) category.color = color;

  await category.save();

  res.status(HTTP_STATUS.OK).json({
    success: true,
    message: SUCCESS_MESSAGES.UPDATED,
    data: { category }
  });
});

/**
 * @desc    Delete category
 * @route   DELETE /api/categories/:id
 * @access  Private
 */
const deleteCategory = asyncHandler(async (req, res) => {
  const category = await Category.findById(req.params.id);

  if (!category) {
    throw new AppError('Category not found', HTTP_STATUS.NOT_FOUND);
  }

  // Can't delete default categories
  if (category.isDefault) {
    throw new AppError('Cannot delete default categories', HTTP_STATUS.FORBIDDEN);
  }

  // Check ownership
  if (category.userId.toString() !== req.user._id.toString()) {
    throw new AppError('Not authorized to delete this category', HTTP_STATUS.FORBIDDEN);
  }

  // Check if category is being used in transactions
  const transactionsUsingCategory = await Transaction.countDocuments({
    userId: req.user._id,
    category: category.name
  });

  if (transactionsUsingCategory > 0) {
    throw new AppError(
      `Cannot delete category. It is used in ${transactionsUsingCategory} transaction(s)`,
      HTTP_STATUS.CONFLICT
    );
  }

  await category.deleteOne();

  res.status(HTTP_STATUS.OK).json({
    success: true,
    message: SUCCESS_MESSAGES.DELETED,
    data: null
  });
});

module.exports = {
  getCategories,
  getCategory,
  createCategory,
  updateCategory,
  deleteCategory
};