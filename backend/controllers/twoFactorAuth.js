const speakeasy = require('speakeasy');
const QRCode = require('qrcode');
const User = require('../models/User');

// ==============================================
// TWO-FACTOR AUTHENTICATION
// ==============================================

// @desc    Generate 2FA secret
// @route   POST /api/auth/2fa/setup
// @access  Private
exports.setup2FA = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);

    // Generate secret
    const secret = speakeasy.generateSecret({
      name: `FinanceTracker (${user.email})`,
      issuer: 'Finance Tracker AI'
    });

    // Store temporary secret (not confirmed yet)
    user.twoFactorAuth = {
      enabled: false,
      secret: secret.base32,
      tempSecret: secret.base32
    };

    await user.save();

    // Generate QR code
    const qrCodeUrl = await QRCode.toDataURL(secret.otpauth_url);

    res.status(200).json({
      success: true,
      message: '2FA setup initiated. Scan QR code with authenticator app',
      data: {
        secret: secret.base32,
        qrCode: qrCodeUrl,
        manualEntry: secret.base32
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Verify and enable 2FA
// @route   POST /api/auth/2fa/verify
// @access  Private
exports.verify2FA = async (req, res, next) => {
  try {
    const { token } = req.body;

    if (!token) {
      return res.status(400).json({
        success: false,
        message: 'Verification token is required'
      });
    }

    const user = await User.findById(req.user._id);

    if (!user.twoFactorAuth || !user.twoFactorAuth.tempSecret) {
      return res.status(400).json({
        success: false,
        message: '2FA setup not initiated. Please setup 2FA first'
      });
    }

    // Verify token
    const verified = speakeasy.totp.verify({
      secret: user.twoFactorAuth.tempSecret,
      encoding: 'base32',
      token: token,
      window: 2 // Allow 2 time steps before/after
    });

    if (!verified) {
      return res.status(400).json({
        success: false,
        message: 'Invalid verification token'
      });
    }

    // Enable 2FA
    user.twoFactorAuth = {
      enabled: true,
      secret: user.twoFactorAuth.tempSecret,
      tempSecret: undefined
    };

    // Generate backup codes
    const backupCodes = generateBackupCodes(8);
    user.twoFactorAuth.backupCodes = backupCodes.map(code => ({
      code,
      used: false
    }));

    await user.save();

    res.status(200).json({
      success: true,
      message: '2FA enabled successfully',
      backupCodes: backupCodes
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Disable 2FA
// @route   POST /api/auth/2fa/disable
// @access  Private
exports.disable2FA = async (req, res, next) => {
  try {
    const { password } = req.body;

    if (!password) {
      return res.status(400).json({
        success: false,
        message: 'Password is required to disable 2FA'
      });
    }

    const user = await User.findById(req.user._id).select('+password');

    // Verify password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid password'
      });
    }

    // Disable 2FA
    user.twoFactorAuth = {
      enabled: false,
      secret: undefined,
      backupCodes: []
    };

    await user.save();

    res.status(200).json({
      success: true,
      message: '2FA disabled successfully'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Verify 2FA token during login
// @route   POST /api/auth/2fa/validate
// @access  Public (requires valid JWT from initial login)
exports.validate2FAToken = async (req, res, next) => {
  try {
    const { token, userId, useBackupCode } = req.body;

    if (!token || !userId) {
      return res.status(400).json({
        success: false,
        message: 'Token and user ID are required'
      });
    }

    const user = await User.findById(userId).select('+twoFactorAuth');

    if (!user || !user.twoFactorAuth.enabled) {
      return res.status(400).json({
        success: false,
        message: '2FA is not enabled for this account'
      });
    }

    let verified = false;

    if (useBackupCode) {
      // Verify backup code
      const backupCode = user.twoFactorAuth.backupCodes.find(
        bc => bc.code === token && !bc.used
      );

      if (backupCode) {
        backupCode.used = true;
        await user.save();
        verified = true;
      }
    } else {
      // Verify TOTP token
      verified = speakeasy.totp.verify({
        secret: user.twoFactorAuth.secret,
        encoding: 'base32',
        token: token,
        window: 2
      });
    }

    if (!verified) {
      return res.status(401).json({
        success: false,
        message: 'Invalid authentication token'
      });
    }

    // Generate new JWT token (full access)
    const jwtToken = user.generateToken();

    res.status(200).json({
      success: true,
      message: '2FA verification successful',
      token: jwtToken
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get 2FA status
// @route   GET /api/auth/2fa/status
// @access  Private
exports.get2FAStatus = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);

    res.status(200).json({
      success: true,
      data: {
        enabled: user.twoFactorAuth?.enabled || false,
        backupCodesAvailable: user.twoFactorAuth?.backupCodes?.filter(bc => !bc.used).length || 0
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Regenerate backup codes
// @route   POST /api/auth/2fa/backup-codes/regenerate
// @access  Private
exports.regenerateBackupCodes = async (req, res, next) => {
  try {
    const { password } = req.body;

    if (!password) {
      return res.status(400).json({
        success: false,
        message: 'Password is required'
      });
    }

    const user = await User.findById(req.user._id).select('+password');

    // Verify password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid password'
      });
    }

    if (!user.twoFactorAuth?.enabled) {
      return res.status(400).json({
        success: false,
        message: '2FA is not enabled'
      });
    }

    // Generate new backup codes
    const backupCodes = generateBackupCodes(8);
    user.twoFactorAuth.backupCodes = backupCodes.map(code => ({
      code,
      used: false
    }));

    await user.save();

    res.status(200).json({
      success: true,
      message: 'Backup codes regenerated',
      backupCodes: backupCodes
    });
  } catch (error) {
    next(error);
  }
};

// ==============================================
// HELPER FUNCTIONS
// ==============================================

/**
 * Generate random backup codes
 */
function generateBackupCodes(count = 8) {
  const codes = [];
  
  for (let i = 0; i < count; i++) {
    const code = Math.random().toString(36).substring(2, 10).toUpperCase();
    codes.push(code);
  }
  
  return codes;
}

/**
 * Middleware to check if 2FA is required
 */
exports.require2FA = async (req, res, next) => {
  try {
    if (!req.user) {
      return next();
    }

    const user = await User.findById(req.user._id);

    if (user.twoFactorAuth?.enabled && !req.user.twoFactorVerified) {
      return res.status(403).json({
        success: false,
        message: '2FA verification required',
        require2FA: true
      });
    }

    next();
  } catch (error) {
    next(error);
  }
};

// ==============================================
// UPDATE USER MODEL
// ==============================================

/**
 * Add these fields to User model schema:
 * 
 * twoFactorAuth: {
 *   enabled: { type: Boolean, default: false },
 *   secret: { type: String },
 *   tempSecret: { type: String },
 *   backupCodes: [{
 *     code: String,
 *     used: { type: Boolean, default: false }
 *   }]
 * }
 */