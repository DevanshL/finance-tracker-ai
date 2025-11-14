// Auth Controller Unit Tests
const { expect } = require('chai');
const sinon = require('sinon');
const User = require('../../models/User');
const authController = require('../../controllers/authController');

describe('Auth Controller', () => {
  describe('register', () => {
    it('should register a new user', async () => {
      const req = {
        body: {
          name: 'Test User',
          email: 'test@example.com',
          password: 'Test123!@#'
        }
      };
      const res = {
        status: sinon.stub().returnsThis(),
        json: sinon.spy()
      };
      const next = sinon.spy();

      // Mock User.findOne
      sinon.stub(User, 'findOne').resolves(null);
      sinon.stub(User, 'create').resolves({
        _id: '123',
        name: 'Test User',
        email: 'test@example.com'
      });

      await authController.register(req, res, next);

      expect(res.status.calledWith(201)).to.be.true;
      expect(res.json.called).to.be.true;

      User.findOne.restore();
      User.create.restore();
    });

    it('should reject duplicate email', async () => {
      const req = {
        body: {
          email: 'existing@example.com',
          password: 'Test123!@#',
          name: 'Test'
        }
      };
      const res = {
        status: sinon.stub().returnsThis(),
        json: sinon.spy()
      };
      const next = sinon.spy();

      sinon.stub(User, 'findOne').resolves({ email: 'existing@example.com' });

      await authController.register(req, res, next);

      expect(res.status.calledWith(400)).to.be.true;

      User.findOne.restore();
    });
  });

  describe('login', () => {
    it('should login with valid credentials', async () => {
      const req = {
        body: {
          email: 'test@example.com',
          password: 'Test123!@#'
        }
      };
      const res = {
        json: sinon.spy()
      };
      const next = sinon.spy();

      const mockUser = {
        _id: '123',
        email: 'test@example.com',
        comparePassword: sinon.stub().resolves(true)
      };

      sinon.stub(User, 'findOne').returns({
        select: sinon.stub().resolves(mockUser)
      });

      await authController.login(req, res, next);

      expect(res.json.called).to.be.true;

      User.findOne.restore();
    });
  });
});
