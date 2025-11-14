// Budget Controller Unit Tests
const { expect } = require('chai');
const Budget = require('../../models/Budget');

describe('Budget Model', () => {
  describe('Validation', () => {
    it('should require userId, name, amount, and period', () => {
      const budget = new Budget({});
      const error = budget.validateSync();
      
      expect(error.errors.userId).to.exist;
      expect(error.errors.name).to.exist;
      expect(error.errors.amount).to.exist;
      expect(error.errors.period).to.exist;
    });

    it('should only accept valid periods', () => {
      const budget = new Budget({
        period: 'invalid'
      });
      const error = budget.validateSync();
      
      expect(error.errors.period).to.exist;
    });
  });
});
