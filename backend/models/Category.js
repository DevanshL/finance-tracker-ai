const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Category name is required'],
    trim: true,
    maxlength: [50, 'Category name cannot exceed 50 characters']
  },
  type: {
    type: String,
    required: [true, 'Category type is required'],
    enum: ['income', 'expense'],
    lowercase: true
  },
  icon: {
    type: String,
    default: '💰'
  },
  color: {
    type: String,
    default: '#6b7280'
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  isDefault: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Indexes
categorySchema.index({ userId: 1, name: 1 });
categorySchema.index({ type: 1 });
categorySchema.index({ isDefault: 1 });

// Compound index to ensure unique category names per user
categorySchema.index(
  { name: 1, userId: 1, type: 1 },
  { unique: true }
);

module.exports = mongoose.models.Category || mongoose.model('Category', categorySchema);
