const backupService = require('../services/backupService');

// @desc    Create backup
// @route   POST /api/backup/create
// @access  Private
exports.createBackup = async (req, res, next) => {
  try {
    const backup = await backupService.createBackup(req.user._id);

    res.status(200).json({
      success: true,
      message: 'Backup created successfully',
      data: backup
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Download backup as JSON
// @route   GET /api/backup/download
// @access  Private
exports.downloadBackup = async (req, res, next) => {
  try {
    const backupJSON = await backupService.exportBackupJSON(req.user._id);

    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', `attachment; filename=finance-backup-${Date.now()}.json`);
    res.status(200).send(backupJSON);
  } catch (error) {
    next(error);
  }
};

// @desc    Restore from backup
// @route   POST /api/backup/restore
// @access  Private
exports.restoreBackup = async (req, res, next) => {
  try {
    const { backupData, clearExisting = false } = req.body;

    if (!backupData) {
      return res.status(400).json({
        success: false,
        message: 'Backup data is required'
      });
    }

    // Validate backup
    const validation = backupService.validateBackup(backupData);
    if (!validation.isValid) {
      return res.status(400).json({
        success: false,
        message: 'Invalid backup format',
        errors: validation.errors
      });
    }

    // Clear existing data if requested
    if (clearExisting) {
      await backupService.clearUserData(req.user._id);
    }

    // Restore backup
    const results = await backupService.restoreBackup(req.user._id, backupData);

    res.status(200).json({
      success: true,
      message: 'Backup restored successfully',
      data: results
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Validate backup file
// @route   POST /api/backup/validate
// @access  Private
exports.validateBackup = async (req, res, next) => {
  try {
    const { backupData } = req.body;

    if (!backupData) {
      return res.status(400).json({
        success: false,
        message: 'Backup data is required'
      });
    }

    const validation = backupService.validateBackup(backupData);

    res.status(200).json({
      success: true,
      data: validation
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Clear all user data
// @route   DELETE /api/backup/clear
// @access  Private
exports.clearData = async (req, res, next) => {
  try {
    const { confirm } = req.body;

    if (confirm !== 'DELETE_ALL_DATA') {
      return res.status(400).json({
        success: false,
        message: 'Confirmation required. Send { "confirm": "DELETE_ALL_DATA" }'
      });
    }

    const results = await backupService.clearUserData(req.user._id);

    res.status(200).json({
      success: true,
      message: 'All data cleared successfully',
      data: results
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get backup history
// @route   GET /api/backup/history
// @access  Private
exports.getBackupHistory = async (req, res, next) => {
  try {
    const history = await backupService.getBackupHistory(req.user._id);

    res.status(200).json({
      success: true,
      count: history.length,
      data: history
    });
  } catch (error) {
    next(error);
  }
};