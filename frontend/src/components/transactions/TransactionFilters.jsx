import { useState } from 'react';
import { motion } from 'framer-motion';

export function TransactionFilters({ categories, onFilter, isLoading }) {
  const [filters, setFilters] = useState({
    type: 'all',
    category: 'all',
    minAmount: '',
    maxAmount: '',
    search: '',
  });

  const [isOpen, setIsOpen] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    const updated = { ...filters, [name]: value };
    setFilters(updated);
    onFilter(updated);
  };

  const handleReset = () => {
    const reset = {
      type: 'all',
      category: 'all',
      minAmount: '',
      maxAmount: '',
      search: '',
    };
    setFilters(reset);
    onFilter(reset);
  };

  const hasActiveFilters = 
    filters.type !== 'all' || 
    filters.category !== 'all' || 
    filters.minAmount || 
    filters.maxAmount || 
    filters.search;

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white dark:bg-gray-900 rounded-lg shadow p-4 space-y-4"
    >
      {/* Search */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Search
        </label>
        <input
          type="text"
          name="search"
          value={filters.search}
          onChange={handleChange}
          disabled={isLoading}
          placeholder="Search transactions..."
          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 dark:bg-gray-800 dark:text-white disabled:opacity-50"
        />
      </div>

      {/* Toggle button for mobile */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="md:hidden w-full px-4 py-2 bg-gray-200 dark:bg-gray-700 rounded-lg font-medium text-gray-700 dark:text-gray-300"
      >
        {isOpen ? 'Hide Filters' : 'Show Filters'}
      </button>

      {/* Filters Grid */}
      <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 ${!isOpen && 'hidden md:grid'}`}>
        {/* Type Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Type
          </label>
          <select
            name="type"
            value={filters.type}
            onChange={handleChange}
            disabled={isLoading}
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 dark:bg-gray-800 dark:text-white disabled:opacity-50"
          >
            <option value="all">All Types</option>
            <option value="income">Income</option>
            <option value="expense">Expense</option>
          </select>
        </div>

        {/* Category Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Category
          </label>
          <select
            name="category"
            value={filters.category}
            onChange={handleChange}
            disabled={isLoading}
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 dark:bg-gray-800 dark:text-white disabled:opacity-50"
          >
            <option value="all">All Categories</option>
            {categories.map((cat) => (
              <option key={cat._id} value={cat._id}>
                {cat.name}
              </option>
            ))}
          </select>
        </div>

        {/* Min Amount */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Min Amount
          </label>
          <input
            type="number"
            name="minAmount"
            value={filters.minAmount}
            onChange={handleChange}
            disabled={isLoading}
            placeholder="0"
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 dark:bg-gray-800 dark:text-white disabled:opacity-50"
          />
        </div>

        {/* Max Amount */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Max Amount
          </label>
          <input
            type="number"
            name="maxAmount"
            value={filters.maxAmount}
            onChange={handleChange}
            disabled={isLoading}
            placeholder="0"
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 dark:bg-gray-800 dark:text-white disabled:opacity-50"
          />
        </div>
      </div>

      {/* Reset Button */}
      {hasActiveFilters && (
        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          onClick={handleReset}
          disabled={isLoading}
          className="w-full px-4 py-2 bg-gray-300 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-lg font-medium hover:bg-gray-400 dark:hover:bg-gray-600 transition disabled:opacity-50"
        >
          Reset Filters
        </motion.button>
      )}
    </motion.div>
  );
}

export default TransactionFilters;