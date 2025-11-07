import { motion } from 'framer-motion';
import LoadingSpinner from '../common/LoadingSpinner';
import { EmptyState } from '../common/EmptyState';
import { TransactionTable } from './TransactionTable';
import { TransactionCard } from './TransactionCard';

export function TransactionList({
  transactions,
  categories,
  onEdit,
  onDelete,
  isLoading = false,
  sortBy = 'date',
  sortOrder = 'desc',
  onSort,
}) {
  if (isLoading && transactions.length === 0) {
    return <LoadingSpinner />;
  }

  if (transactions.length === 0) {
    return (
      <EmptyState
        title="No transactions yet"
        description="Start by adding your first transaction"
        icon="💰"
      />
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-4"
    >
      {/* Desktop Table View */}
      <TransactionTable
        transactions={transactions}
        onEdit={onEdit}
        onDelete={onDelete}
        isLoading={isLoading}
        sortBy={sortBy}
        sortOrder={sortOrder}
        onSort={onSort}
      />

      {/* Mobile Card View */}
      <div className="md:hidden space-y-3">
        {transactions.map((transaction) => (
          <TransactionCard
            key={transaction._id}
            transaction={transaction}
            onEdit={onEdit}
            onDelete={onDelete}
            isLoading={isLoading}
          />
        ))}
      </div>
    </motion.div>
  );
}

export default TransactionList;