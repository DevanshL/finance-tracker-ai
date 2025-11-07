import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { motion } from 'framer-motion';
import useTransactionStore from '../../store/transactionStore';

function SpendingChart() {
  const { summary } = useTransactionStore();

  const data = [
    { 
      name: 'Income', 
      value: summary?.summary?.totalIncome || 0,
      color: '#22c55e' 
    },
    { 
      name: 'Expenses', 
      value: summary?.summary?.totalExpenses || 0,
      color: '#ef4444' 
    },
  ];

  const hasData = data.some(item => item.value > 0);

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white dark:bg-gray-800 p-3 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700">
          <p className="font-medium text-gray-900 dark:text-white">
            {payload[0].name}
          </p>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {new Intl.NumberFormat('en-US', {
              style: 'currency',
              currency: 'USD',
            }).format(payload[0].value)}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: 0.2 }}
      className="card h-full"
    >
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          Income vs Expenses
        </h3>
        <span className="text-xs text-gray-500 dark:text-gray-400">
          This Month
        </span>
      </div>

      {hasData ? (
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
              outerRadius={100}
              fill="#8884d8"
              dataKey="value"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      ) : (
        <div className="flex items-center justify-center h-[300px]">
          <div className="text-center">
            <div className="text-6xl mb-4">📊</div>
            <p className="text-gray-500 dark:text-gray-400">
              No transactions yet
            </p>
            <p className="text-sm text-gray-400 dark:text-gray-500">
              Add transactions to see your spending chart
            </p>
          </div>
        </div>
      )}
    </motion.div>
  );
}

export default SpendingChart;