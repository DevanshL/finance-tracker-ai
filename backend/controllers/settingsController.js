const Settings = require('../models/Settings');

// @desc    Get user settings
// @route   GET /api/settings
// @access  Private
exports.getSettings = async (req, res, next) => {
  try {
    let settings = await Settings.findOne({ user: req.user._id });

    // Create default settings if none exist
    if (!settings) {
      settings = await Settings.create({ user: req.user._id });
    }

    res.status(200).json({
      success: true,
      data: settings
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update user settings
// @route   PUT /api/settings
// @access  Private
exports.updateSettings = async (req, res, next) => {
  try {
    let settings = await Settings.findOne({ user: req.user._id });

    if (!settings) {
      // Create new settings with provided data
      settings = await Settings.create({
        user: req.user._id,
        ...req.body
      });
    } else {
      // Update existing settings
      settings = await Settings.findOneAndUpdate(
        { user: req.user._id },
        req.body,
        {
          new: true,
          runValidators: true
        }
      );
    }

    res.status(200).json({
      success: true,
      data: settings
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update display settings
// @route   PATCH /api/settings/display
// @access  Private
exports.updateDisplaySettings = async (req, res, next) => {
  try {
    let settings = await Settings.findOne({ user: req.user._id });

    if (!settings) {
      settings = await Settings.create({ user: req.user._id });
    }

    settings.display = {
      ...settings.display,
      ...req.body
    };

    await settings.save();

    res.status(200).json({
      success: true,
      data: settings.display
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update notification settings
// @route   PATCH /api/settings/notifications
// @access  Private
exports.updateNotificationSettings = async (req, res, next) => {
  try {
    let settings = await Settings.findOne({ user: req.user._id });

    if (!settings) {
      settings = await Settings.create({ user: req.user._id });
    }

    if (req.body.email) {
      settings.notifications.email = {
        ...settings.notifications.email,
        ...req.body.email
      };
    }

    if (req.body.push) {
      settings.notifications.push = {
        ...settings.notifications.push,
        ...req.body.push
      };
    }

    if (req.body.inApp) {
      settings.notifications.inApp = {
        ...settings.notifications.inApp,
        ...req.body.inApp
      };
    }

    await settings.save();

    res.status(200).json({
      success: true,
      data: settings.notifications
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update privacy settings
// @route   PATCH /api/settings/privacy
// @access  Private
exports.updatePrivacySettings = async (req, res, next) => {
  try {
    let settings = await Settings.findOne({ user: req.user._id });

    if (!settings) {
      settings = await Settings.create({ user: req.user._id });
    }

    // Update profileVisibility if provided
    if (req.body.profileVisibility !== undefined) {
      settings.privacy.profileVisibility = req.body.profileVisibility;
    }

    // Handle nested dataSharing object
    if (req.body.dataSharing) {
      settings.privacy.dataSharing = {
        ...settings.privacy.dataSharing.toObject(),
        ...req.body.dataSharing
      };
    }

    // Handle nested twoFactorAuth object
    if (req.body.twoFactorAuth) {
      settings.privacy.twoFactorAuth = {
        ...settings.privacy.twoFactorAuth.toObject(),
        ...req.body.twoFactorAuth
      };
    }

    await settings.save();

    res.status(200).json({
      success: true,
      data: settings.privacy
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update budget settings
// @route   PATCH /api/settings/budgets
// @access  Private
exports.updateBudgetSettings = async (req, res, next) => {
  try {
    let settings = await Settings.findOne({ user: req.user._id });

    if (!settings) {
      settings = await Settings.create({ user: req.user._id });
    }

    settings.budgets = {
      ...settings.budgets,
      ...req.body
    };

    await settings.save();

    res.status(200).json({
      success: true,
      data: settings.budgets
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update goal settings
// @route   PATCH /api/settings/goals
// @access  Private
exports.updateGoalSettings = async (req, res, next) => {
  try {
    let settings = await Settings.findOne({ user: req.user._id });

    if (!settings) {
      settings = await Settings.create({ user: req.user._id });
    }

    settings.goals = {
      ...settings.goals,
      ...req.body
    };

    await settings.save();

    res.status(200).json({
      success: true,
      data: settings.goals
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update AI settings
// @route   PATCH /api/settings/ai
// @access  Private
exports.updateAISettings = async (req, res, next) => {
  try {
    let settings = await Settings.findOne({ user: req.user._id });

    if (!settings) {
      settings = await Settings.create({ user: req.user._id });
    }

    settings.ai = {
      ...settings.ai,
      ...req.body
    };

    await settings.save();

    res.status(200).json({
      success: true,
      data: settings.ai
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update export settings
// @route   PATCH /api/settings/export
// @access  Private
exports.updateExportSettings = async (req, res, next) => {
  try {
    let settings = await Settings.findOne({ user: req.user._id });

    if (!settings) {
      settings = await Settings.create({ user: req.user._id });
    }

    settings.export = {
      ...settings.export,
      ...req.body
    };

    await settings.save();

    res.status(200).json({
      success: true,
      data: settings.export
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update backup settings
// @route   PATCH /api/settings/backup
// @access  Private
exports.updateBackupSettings = async (req, res, next) => {
  try {
    let settings = await Settings.findOne({ user: req.user._id });

    if (!settings) {
      settings = await Settings.create({ user: req.user._id });
    }

    settings.backup = {
      ...settings.backup,
      ...req.body
    };

    await settings.save();

    res.status(200).json({
      success: true,
      data: settings.backup
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Reset settings to default
// @route   POST /api/settings/reset
// @access  Private
exports.resetSettings = async (req, res, next) => {
  try {
    // Delete existing settings
    await Settings.deleteOne({ user: req.user._id });

    // Create new default settings
    const settings = await Settings.create({ user: req.user._id });

    res.status(200).json({
      success: true,
      message: 'Settings reset to default',
      data: settings
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get available options
// @route   GET /api/settings/options
// @access  Private
exports.getAvailableOptions = async (req, res, next) => {
  try {
    res.status(200).json({
      success: true,
      data: {
        currencies: ['USD', 'EUR', 'GBP', 'JPY', 'CAD', 'AUD', 'INR', 'CNY', 'BRL', 'MXN'],
        languages: ['en', 'es', 'fr', 'de', 'it', 'pt', 'ja', 'zh', 'hi', 'ar'],
        dateFormats: ['MM/DD/YYYY', 'DD/MM/YYYY', 'YYYY-MM-DD'],
        numberFormats: ['1,234.56', '1.234,56', '1 234.56'],
        themes: ['light', 'dark', 'auto'],
        budgetPeriods: ['weekly', 'biweekly', 'monthly', 'quarterly', 'yearly'],
        priorities: ['low', 'medium', 'high'],
        frequencies: ['daily', 'weekly', 'monthly', 'quarterly', 'yearly', 'never'],
        exportFormats: ['csv', 'pdf', 'json', 'excel']
      }
    });
  } catch (error) {
    next(error);
  }
};