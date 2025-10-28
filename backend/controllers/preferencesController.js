const User = require('../models/User');

// @desc    Get user preferences
// @route   GET /api/preferences
// @access  Private
exports.getPreferences = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id).select('preferences');

    res.status(200).json({
      success: true,
      data: user.preferences || {
        currency: 'USD',
        dateFormat: 'MM/DD/YYYY',
        theme: 'light',
        notifications: {
          email: true,
          budgetAlerts: true,
          goalReminders: true,
          weeklyReport: false
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update user preferences
// @route   PUT /api/preferences
// @access  Private
exports.updatePreferences = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);

    user.preferences = {
      ...user.preferences,
      ...req.body
    };

    await user.save();

    res.status(200).json({
      success: true,
      message: 'Preferences updated successfully',
      data: user.preferences
    });
  } catch (error) {
    next(error);
  }
};