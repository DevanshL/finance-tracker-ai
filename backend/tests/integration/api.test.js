// API Integration Tests
const request = require('supertest');
const { expect } = require('chai');
const app = require('../../server');
const User = require('../../models/User');
const Transaction = require('../../models/Transaction');

describe('API Integration Tests', () => {
  let authToken;
  let userId;

  before(async () => {
    // Setup: Create test user
    const user = await User.create({
      name: 'Test User',
      email: 'integration@test.com',
      password: 'Test123!@#'
    });
    userId = user._id;
    
    // Login to get token
    const res = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'integration@test.com',
        password: 'Test123!@#'
      });
    
    authToken = res.body.data.token;
  });

  after(async () => {
    // Cleanup
    await User.deleteMany({ email: 'integration@test.com' });
    await Transaction.deleteMany({ userId });
  });

  describe('Auth Flow', () => {
    it('should register a new user', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          name: 'New User',
          email: 'new@test.com',
          password: 'Test123!@#'
        });
      
      expect(res.status).to.equal(201);
      expect(res.body.success).to.be.true;
      expect(res.body.data.token).to.exist;
      
      // Cleanup
      await User.deleteMany({ email: 'new@test.com' });
    });

    it('should login existing user', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'integration@test.com',
          password: 'Test123!@#'
        });
      
      expect(res.status).to.equal(200);
      expect(res.body.success).to.be.true;
    });
  });

  describe('Transaction CRUD', () => {
    it('should create a transaction', async () => {
      const res = await request(app)
        .post('/api/transactions')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          type: 'expense',
          amount: 50.00,
          category: 'Food',
          description: 'Test transaction'
        });
      
      expect(res.status).to.equal(201);
      expect(res.body.success).to.be.true;
    });

    it('should get all transactions', async () => {
      const res = await request(app)
        .get('/api/transactions')
        .set('Authorization', `Bearer ${authToken}`);
      
      expect(res.status).to.equal(200);
      expect(res.body.data.transactions).to.be.an('array');
    });

    it('should require authentication', async () => {
      const res = await request(app)
        .get('/api/transactions');
      
      expect(res.status).to.equal(401);
    });
  });
});
