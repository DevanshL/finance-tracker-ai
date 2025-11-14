// Transaction Controller Unit Tests
const { expect } = require('chai');
const sinon = require('sinon');
const Transaction = require('../../models/Transaction');

describe('Transaction Model', () => {
  describe('Validation', () => {
    it('should require userId, type, amount, and category', () => {
      const transaction = new Transaction({});
      const error = transaction.validateSync();
      
      expect(error.errors.userId).to.exist;
      expect(error.errors.type).to.exist;
      expect(error.errors.amount).to.exist;
      expect(error.errors.category).to.exist;
    });

    it('should only accept valid transaction types', () => {
      const transaction = new Transaction({
        type: 'invalid',
        amount: 100
      });
      const error = transaction.validateSync();
      
      expect(error.errors.type).to.exist;
    });

    it('should require positive amount', () => {
      const transaction = new Transaction({
        amount: -50
      });
      const error = transaction.validateSync();
      
      expect(error.errors.amount).to.exist;
    });
  });

  describe('Methods', () => {
    it('should calculate if transaction is this month', () => {
      const transaction = new Transaction({
        date: new Date(),
        type: 'expense',
        amount: 100,
        category: 'Food'
      });
      
      expect(transaction.isThisMonth()).to.be.true;
    });
  });
});
