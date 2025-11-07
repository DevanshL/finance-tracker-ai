import { motion } from 'framer-motion';
import { formatDateShort } from '../../utils/formatDate';
import { formatCurrency, getAmountColor, getAmountSign } from '../../utils/formatCurrency';

export function TransactionCard({
  transaction,
  onEdit,
  onDelete,
  isLoading = false,
}) {
  const isIncome = transaction.type === 'income';
  const categoryName = transaction.category?.name || 'Unknown';

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.02 }}
      className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 space-y-3"
    >
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h3 className="font-semibold text-gray-900 dark:text-white">
            {transaction.description}
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {categoryName}
          </p>
        </div>
        <span className={`text-lg font-bold ${getAmountColor(isIncome ? transaction.amount : -transaction.amount)}`}>
          {getAmountSign(isIncome ? transaction.amount : -transaction.amount)}
          {formatCurrency(transaction.amount)}
        </span>
      </div>

      {/* Details */}
      <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400">
        <span>{formatDateShort(transaction.date)}</span>
        <span className={`px-2 py-1 rounded text-xs font-medium ${
          isIncome
            ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300'
            : 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300'
        }`}>
          {isIncome ? 'Income' : 'Expense'}
        </span>
      </div>

      {/* Notes */}
      {transaction.notes && (
        <p className="text-sm text-gray-600 dark:text-gray-400 border-t border-gray-200 dark:border-gray-700 pt-2">
          {transaction.notes}
        </p>
      )}

      {/* Actions */}
      <div className="flex gap-2 pt-2 border-t border-gray-200 dark:border-gray-700">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => onEdit(transaction)}
          disabled={isLoading}
          className="flex-1 px-3 py-1 text-sm font-medium text-primary-600 dark:text-primary-400 border border-primary-300 dark:border-primary-600 rounded-lg hover:bg-primary-50 dark:hover:bg-primary-900/20 disabled:opacity-50 transition"
        >
          Edit
        </motion.button>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => onDelete(transaction._id)}
          disabled={isLoading}
          className="flex-1 px-3 py-1 text-sm font-medium text-red-600 dark:text-red-400 border border-red-300 dark:border-red-600 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 disabled:opacity-50 transition"
        >
          Delete
        </motion.button>
      </div>
    </motion.div>
  );
}

export default TransactionCard;