import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRightIcon } from '@heroicons/react/24/outline';
import { format } from 'date-fns';
import useTransactionStore from '../../store/transactionStore';
import LoadingSpinner from '../common/LoadingSpinner';
import EmptyState from '../common/EmptyState';

function RecentTransactions() {
  const { transactions, isLoading } = useTransactionStore();

  const recentTransactions = transactions.slice(0, 5);

  if (isLoading) {
    return (
      <div className="card h-full">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
          Recent Transactions
        </h3>
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.3 }}
      className="card h-full flex flex-col"
    >
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          Recent Transactions
        </h3>
        <Link
          to="/transactions"
          className="text-sm text-primary-600 hover:text-primary-700 font-medium flex items-center gap-1"
        >
          View All
          <ArrowRightIcon className="h-4 w-4" />
        </Link>
      </div>

      {recentTransactions.length === 0 ? (
        <EmptyState
          icon="💰"
          title="No transactions yet"
          description="Start by adding your first transaction"
          action={
            <Link to="/transactions" className="btn-primary btn-sm">
              Add Transaction
            </Link>
          }
        />
      ) : (
        <div className="space-y-3 flex-1 overflow-y-auto">
          {recentTransactions.map((transaction, index) => (
            <motion.div
              key={transaction._id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
              className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                  transaction.type === 'income' 
                    ? 'bg-green-100 dark:bg-green-900/30' 
                    : 'bg-red-100 dark:bg-red-900/30'
                }`}>
                  <span className="text-lg">
                    {transaction.type === 'income' ? '💵' : '💳'}
                  </span>
                </div>
                <div>
                  <p className="font-medium text-gray-900 dark:text-white text-sm">
                    {transaction.description}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {format(new Date(transaction.date), 'MMM dd, yyyy')}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className={`font-semibold ${
                  transaction.type === 'income' 
                    ? 'text-green-600 dark:text-green-400' 
                    : 'text-red-600 dark:text-red-400'
                }`}>
                  {transaction.type === 'income' ? '+' : '-'}
                  {new Intl.NumberFormat('en-US', {
                    style: 'currency',
                    currency: 'USD',
                  }).format(transaction.amount)}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </motion.div>
  );
}

export default RecentTransactions;