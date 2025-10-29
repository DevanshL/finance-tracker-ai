const websocketService = require('../services/websocketService');

// @desc    Get WebSocket connection info
// @route   GET /api/websocket/info
// @access  Private
exports.getConnectionInfo = async (req, res, next) => {
  try {
    const isConnected = websocketService.isUserConnected(req.user._id);
    const connectedUsers = websocketService.getConnectedUsersCount();

    res.status(200).json({
      success: true,
      data: {
        isConnected,
        totalConnections: connectedUsers,
        wsUrl: `${process.env.WS_URL || 'ws://localhost:5000'}/ws`,
        instructions: {
          connect: 'Connect to WebSocket using: ws://localhost:5000/ws?token=YOUR_JWT_TOKEN',
          authenticate: 'Include JWT token in query parameter or Authorization header'
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Send test notification via WebSocket
// @route   POST /api/websocket/test
// @access  Private
exports.sendTestNotification = async (req, res, next) => {
  try {
    const { message = 'Test notification' } = req.body;

    const sent = websocketService.sendToUser(req.user._id, {
      type: 'test',
      message,
      timestamp: new Date()
    });

    if (sent) {
      res.status(200).json({
        success: true,
        message: 'Test notification sent'
      });
    } else {
      res.status(400).json({
        success: false,
        message: 'WebSocket not connected'
      });
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Get WebSocket stats
// @route   GET /api/websocket/stats
// @access  Private
exports.getStats = async (req, res, next) => {
  try {
    const connectedUsers = websocketService.getConnectedUsersCount();
    const userConnected = websocketService.isUserConnected(req.user._id);

    res.status(200).json({
      success: true,
      data: {
        totalConnections: connectedUsers,
        yourConnection: userConnected,
        serverTime: new Date()
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Disconnect user WebSocket
// @route   POST /api/websocket/disconnect
// @access  Private
exports.disconnectUser = async (req, res, next) => {
  try {
    websocketService.disconnectUser(req.user._id);

    res.status(200).json({
      success: true,
      message: 'WebSocket connection closed'
    });
  } catch (error) {
    next(error);
  }
};