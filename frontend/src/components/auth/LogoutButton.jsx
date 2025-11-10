import { useNavigate } from 'react-router-dom';
import { ArrowRightOnRectangleIcon } from '@heroicons/react/24/outline';
import useAuthStore from '../../store/authStore';

function LogoutButton({ className = '', variant = 'default' }) {
  const navigate = useNavigate();
  const { logout, isLoading } = useAuthStore();

  const handleLogout = async () => {
    try {
      console.log('🚪 Logout button clicked');
      await logout();
      console.log('✅ Logout successful, redirecting...');
      navigate('/login', { replace: true });
    } catch (error) {
      console.error('❌ Logout error:', error);
      // Even if API fails, still redirect to login
      navigate('/login', { replace: true });
    }
  };

  // Different button styles
  const variants = {
    default: 'btn-outline',
    danger: 'bg-red-500 hover:bg-red-600 text-white',
    ghost: 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-dark-800',
    icon: 'p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-dark-800 text-gray-700 dark:text-gray-300'
  };

  if (variant === 'icon') {
    return (
      <button
        onClick={handleLogout}
        disabled={isLoading}
        className={`${variants.icon} ${className} disabled:opacity-50 disabled:cursor-not-allowed`}
        title="Logout"
      >
        {isLoading ? (
          <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
        ) : (
          <ArrowRightOnRectangleIcon className="h-5 w-5" />
        )}
      </button>
    );
  }

  return (
    <button
      onClick={handleLogout}
      disabled={isLoading}
      className={`${variants[variant]} ${className} flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed`}
    >
      {isLoading ? (
        <>
          <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <span>Logging out...</span>
        </>
      ) : (
        <>
          <ArrowRightOnRectangleIcon className="h-5 w-5" />
          <span>Logout</span>
        </>
      )}
    </button>
  );
}

export default LogoutButton;