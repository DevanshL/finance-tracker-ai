import { motion } from 'framer-motion';

function StatsCard({ title, value, icon: Icon, color, trend, trendUp, isCount }) {
  const colorClasses = {
    green: 'from-green-500 to-emerald-600',
    red: 'from-red-500 to-rose-600',
    blue: 'from-blue-500 to-indigo-600',
    purple: 'from-purple-500 to-pink-600',
  };

  const formatValue = (val) => {
    if (isCount) return val.toLocaleString();
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(val);
  };

  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      className="card-hover relative overflow-hidden"
    >
      {/* Background Gradient */}
      <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${colorClasses[color]} opacity-10 rounded-full -mr-16 -mt-16`} />
      
      <div className="relative">
        {/* Icon */}
        <div className={`w-12 h-12 bg-gradient-to-br ${colorClasses[color]} rounded-lg flex items-center justify-center mb-4 shadow-lg`}>
          <Icon className="h-6 w-6 text-white" />
        </div>

        {/* Title */}
        <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
          {title}
        </p>

        {/* Value */}
        <p className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          {formatValue(value)}
        </p>

        {/* Trend */}
        {trend && (
          <div className="flex items-center gap-1">
            <span className={`text-xs font-medium ${trendUp ? 'text-green-600' : 'text-red-600'}`}>
              {trend}
            </span>
            <span className="text-xs text-gray-500 dark:text-gray-400">
              vs last month
            </span>
          </div>
        )}
      </div>
    </motion.div>
  );
}

export default StatsCard;