import { motion } from 'framer-motion';

export function Pagination({ currentPage, totalPages, onPageChange, isLoading }) {
  if (totalPages <= 1) return null;

  const handlePrevious = () => {
    if (currentPage > 1) onPageChange(currentPage - 1);
  };

  const handleNext = () => {
    if (currentPage < totalPages) onPageChange(currentPage + 1);
  };

  // Generate page numbers to display
  const getPageNumbers = () => {
    const pages = [];
    const maxVisible = 5;

    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      if (currentPage <= 3) {
        for (let i = 1; i <= maxVisible; i++) {
          pages.push(i);
        }
        pages.push('...');
        pages.push(totalPages);
      } else if (currentPage >= totalPages - 2) {
        pages.push(1);
        pages.push('...');
        for (let i = totalPages - maxVisible + 1; i <= totalPages; i++) {
          pages.push(i);
        }
      } else {
        pages.push(1);
        pages.push('...');
        for (let i = currentPage - 1; i <= currentPage + 1; i++) {
          pages.push(i);
        }
        pages.push('...');
        pages.push(totalPages);
      }
    }

    return pages;
  };

  const pages = getPageNumbers();

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex items-center justify-center gap-2 mt-8"
    >
      <button
        onClick={handlePrevious}
        disabled={currentPage === 1 || isLoading}
        className="px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition"
      >
        ← Previous
      </button>

      <div className="flex items-center gap-1">
        {pages.map((page, idx) => (
          page === '...' ? (
            <span key={idx} className="px-2 py-1 text-gray-500 dark:text-gray-400">
              ...
            </span>
          ) : (
            <motion.button
              key={idx}
              onClick={() => onPageChange(page)}
              disabled={isLoading}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className={`
                px-3 py-2 rounded-lg font-medium transition
                ${
                  currentPage === page
                    ? 'bg-primary-600 text-white'
                    : 'border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                }
                disabled:opacity-50 disabled:cursor-not-allowed
              `}
            >
              {page}
            </motion.button>
          )
        ))}
      </div>

      <button
        onClick={handleNext}
        disabled={currentPage === totalPages || isLoading}
        className="px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition"
      >
        Next →
      </button>

      <div className="ml-4 text-sm text-gray-600 dark:text-gray-400">
        Page {currentPage} of {totalPages}
      </div>
    </motion.div>
  );
}

export default Pagination;