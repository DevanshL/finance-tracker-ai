import { motion } from 'framer-motion';
import { formatDateShort } from '../../utils/formatDate';
import { formatCurrency, getAmountColor } from '../../utils/formatCurrency';

export function TransactionTable({
  transactions,
  onEdit,
  onDelete,
  isLoading = false,
  sortBy = 'date',
  sortOrder = 'desc',
  onSort,
}) {
  const SortIcon = ({ column }) => {
    if (sortBy !== column) {
      return <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 4m4 0l4-4m6 0v12m0 0l4-4m-4 4l-4 4" />
      </svg>;
    }

    if (sortOrder === 'asc') {
      return <svg className="w-4 h-4 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 4m4 0l4-4" />
      </svg>;
    }

    return <svg className="w-4 h-4 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 4v12m0 0l4 4m-4-4l-4 4" />
    </svg>;
  };

  return (
    <div className="hidden md:block overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-gray-200 dark:border-gray-700">
            <th className="text-left px-4 py-3 font-semibold text-gray-700 dark:text-gray-300">
              <button
                onClick={() => onSort('description')}
                className="flex items-center gap-2 hover:text-primary-600 dark:hover:text-primary-400"
              >
                Description
                <SortIcon column="description" />
              </button>
            </th>
            <th className="text-left px-4 py-3 font-semibold text-gray-700 dark:text-gray-300">
              Category
            </th>
            <th className="text-right px-4 py-3 font-semibold text-gray-700 dark:text-gray-300">
              <button
                onClick={() => onSort('amount')}
                className="flex items-center justify-end gap-2 w-full hover:text-primary-600 dark:hover:text-primary-400"
              >
                Amount
                <SortIcon column="amount" />
              </button>
            </th>
            <th className="text-center px-4 py-3 font-semibold text-gray-700 dark:text-gray-300">
              Type
            </th>
            <th className="text-left px-4 py-3 font-semibold text-gray-700 dark:text-gray-300">
              <button
                onClick={() => onSort('date')}
                className="flex items-center gap-2 hover:text-primary-600 dark:hover:text-primary-400"
              >
                Date
                <SortIcon column="date" />
              </button>
            </th>
            <th className="text-right px-4 py-3 font-semibold text-gray-700 dark:text-gray-300">
              Actions
            </th>
          </tr>
        </thead>
        <tbody>
          {transactions.map((transaction, idx) => (
            <motion.tr
              key={transaction._id}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: idx * 0.05 }}
              className="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition"
            >
              <td className="px-4 py-3 text-gray-900 dark:text-white font-medium">
                {transaction.description}
              </td>
              <td className="px-4 py-3 text-gray-600 dark:text-gray-400">
                {transaction.category?.name || '-'}
              </td>
              <td className={`px-4 py-3 text-right font-semibold ${getAmountColor(
                transaction.type === 'income' ? transaction.amount : -transaction.amount
              )}`}>
                {formatCurrency(transaction.amount)}
              </td>
              <td className="px-4 py-3 text-center">
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                  transaction.type === 'income'
                    ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300'
                    : 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300'
                }`}>
                  {transaction.type}
                </span>
              </td>
              <td className="px-4 py-3 text-gray-600 dark:text-gray-400">
                {formatDateShort(transaction.date)}
              </td>
              <td className="px-4 py-3 text-right space-x-2">
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => onEdit(transaction)}
                  disabled={isLoading}
                  className="text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 font-medium disabled:opacity-50 transition"
                >
                  Edit
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => onDelete(transaction._id)}
                  disabled={isLoading}
                  className="text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 font-medium disabled:opacity-50 transition"
                >
                  Delete
                </motion.button>
              </td>
            </motion.tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default TransactionTable;