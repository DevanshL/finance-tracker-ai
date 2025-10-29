const WebSocket = require('ws');
const jwt = require('jsonwebtoken');

class WebSocketService {
  constructor() {
    this.wss = null;
    this.clients = new Map(); // userId -> WebSocket connection
  }

  /**
   * Initialize WebSocket server
   */
  initialize(server) {
    this.wss = new WebSocket.Server({ 
      server,
      path: '/ws'
    });

    this.wss.on('connection', (ws, req) => {
      this.handleConnection(ws, req);
    });

    console.log('✅ WebSocket server initialized');
  }

  /**
   * Handle new WebSocket connection
   */
  handleConnection(ws, req) {
    const token = this.extractToken(req);

    if (!token) {
      ws.close(1008, 'Authentication required');
      return;
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const userId = decoded.id;

      // Store connection
      this.clients.set(userId, ws);

      // Send welcome message
      this.sendToUser(userId, {
        type: 'connected',
        message: 'WebSocket connection established',
        timestamp: new Date()
      });

      // Handle messages from client
      ws.on('message', (message) => {
        this.handleMessage(userId, message);
      });

      // Handle disconnection
      ws.on('close', () => {
        this.clients.delete(userId);
        console.log(`WebSocket disconnected: ${userId}`);
      });

      // Handle errors
      ws.on('error', (error) => {
        console.error('WebSocket error:', error);
        this.clients.delete(userId);
      });

      console.log(`WebSocket connected: ${userId}`);
    } catch (error) {
      ws.close(1008, 'Invalid token');
    }
  }

  /**
   * Extract JWT token from request
   */
  extractToken(req) {
    const url = new URL(req.url, `http://${req.headers.host}`);
    const token = url.searchParams.get('token');
    
    if (token) return token;

    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      return authHeader.substring(7);
    }

    return null;
  }

  /**
   * Handle incoming message from client
   */
  handleMessage(userId, message) {
    try {
      const data = JSON.parse(message);
      
      switch (data.type) {
        case 'ping':
          this.sendToUser(userId, { type: 'pong', timestamp: new Date() });
          break;
        case 'subscribe':
          // Handle channel subscription
          break;
        default:
          console.log('Unknown message type:', data.type);
      }
    } catch (error) {
      console.error('Error handling message:', error);
    }
  }

  /**
   * Send message to specific user
   */
  sendToUser(userId, data) {
    const ws = this.clients.get(userId.toString());
    if (ws && ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify(data));
      return true;
    }
    return false;
  }

  /**
   * Broadcast to all connected users
   */
  broadcast(data) {
    this.clients.forEach((ws) => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify(data));
      }
    });
  }

  /**
   * Notify user about new transaction
   */
  notifyTransaction(userId, transaction, action = 'created') {
    this.sendToUser(userId, {
      type: 'transaction',
      action,
      data: transaction,
      timestamp: new Date()
    });
  }

  /**
   * Notify user about budget update
   */
  notifyBudget(userId, budget, action = 'updated') {
    this.sendToUser(userId, {
      type: 'budget',
      action,
      data: budget,
      timestamp: new Date()
    });
  }

  /**
   * Notify user about goal update
   */
  notifyGoal(userId, goal, action = 'updated') {
    this.sendToUser(userId, {
      type: 'goal',
      action,
      data: goal,
      timestamp: new Date()
    });
  }

  /**
   * Notify user about new notification
   */
  notifyNotification(userId, notification) {
    this.sendToUser(userId, {
      type: 'notification',
      action: 'new',
      data: notification,
      timestamp: new Date()
    });
  }

  /**
   * Notify about budget alert
   */
  notifyBudgetAlert(userId, alert) {
    this.sendToUser(userId, {
      type: 'alert',
      category: 'budget',
      data: alert,
      timestamp: new Date()
    });
  }

  /**
   * Notify about goal milestone
   */
  notifyGoalMilestone(userId, milestone) {
    this.sendToUser(userId, {
      type: 'alert',
      category: 'goal',
      data: milestone,
      timestamp: new Date()
    });
  }

  /**
   * Send dashboard update
   */
  notifyDashboardUpdate(userId, dashboardData) {
    this.sendToUser(userId, {
      type: 'dashboard_update',
      data: dashboardData,
      timestamp: new Date()
    });
  }

  /**
   * Get connected users count
   */
  getConnectedUsersCount() {
    return this.clients.size;
  }

  /**
   * Check if user is connected
   */
  isUserConnected(userId) {
    return this.clients.has(userId.toString());
  }

  /**
   * Close connection for specific user
   */
  disconnectUser(userId) {
    const ws = this.clients.get(userId.toString());
    if (ws) {
      ws.close(1000, 'Disconnected by server');
      this.clients.delete(userId.toString());
    }
  }

  /**
   * Close all connections
   */
  closeAll() {
    this.clients.forEach((ws) => {
      ws.close(1000, 'Server shutting down');
    });
    this.clients.clear();
  }
}

// Export singleton instance
module.exports = new WebSocketService();