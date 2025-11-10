import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import useAuthStore from '../store/authStore';
import toast from 'react-hot-toast';

export default function Navbar() {
  const navigate = useNavigate();
  const { user, logout, isLoading } = useAuthStore();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    try {
      setIsLoggingOut(true);
      console.log('🚪 Starting logout process...');
      await logout();
      setTimeout(() => {
        console.log('🔄 Redirecting to login...');
        navigate('/login', { replace: true });
      }, 300);
    } catch (error) {
      console.error('❌ Logout failed:', error);
      toast.error('Logout failed, please try again');
      setIsLoggingOut(false);
    }
  };

  if (!user) {
    return null;
  }

  return (
    <nav style={{
      backgroundColor: 'white',
      padding: '15px 20px',
      boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      position: 'sticky',
      top: 0,
      zIndex: 100
    }}>
      <h1 style={{ 
        fontSize: '24px', 
        fontWeight: 'bold', 
        color: '#3b82f6',
        margin: 0,
        cursor: 'pointer'
      }}
      onClick={() => navigate('/dashboard')}>
        💰 Finance Tracker AI
      </h1>

      <div style={{ display: 'flex', gap: '30px', alignItems: 'center' }}>
        <a href="/dashboard" style={{
          textDecoration: 'none',
          color: '#666',
          fontWeight: '500',
          cursor: 'pointer',
          transition: 'color 0.3s'
        }}
        onMouseEnter={(e) => e.currentTarget.style.color = '#3b82f6'}
        onMouseLeave={(e) => e.currentTarget.style.color = '#666'}>
          Dashboard
        </a>
        <a href="/transactions" style={{
          textDecoration: 'none',
          color: '#666',
          fontWeight: '500',
          cursor: 'pointer',
          transition: 'color 0.3s'
        }}
        onMouseEnter={(e) => e.currentTarget.style.color = '#3b82f6'}
        onMouseLeave={(e) => e.currentTarget.style.color = '#666'}>
          Transactions
        </a>
      </div>

      <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
        <div style={{ textAlign: 'right', marginRight: '10px' }}>
          <div style={{ fontSize: '14px', fontWeight: '600', color: '#333' }}>
            {user?.name || user?.email?.split('@')[0] || 'User'}
          </div>
          <div style={{ fontSize: '12px', color: '#999' }}>
            {user?.email}
          </div>
        </div>

        <button
          onClick={handleLogout}
          disabled={isLoggingOut || isLoading}
          style={{
            padding: '10px 20px',
            backgroundColor: isLoggingOut ? '#fca5a5' : '#ef4444',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: isLoggingOut ? 'not-allowed' : 'pointer',
            fontWeight: 'bold',
            fontSize: '14px',
            transition: 'background-color 0.3s',
            opacity: isLoggingOut ? 0.7 : 1
          }}
          onMouseEnter={(e) => {
            if (!isLoggingOut) e.currentTarget.style.backgroundColor = '#dc2626';
          }}
          onMouseLeave={(e) => {
            if (!isLoggingOut) e.currentTarget.style.backgroundColor = '#ef4444';
          }}>
          {isLoggingOut ? '🔄 Logging out...' : '👋 Logout'}
        </button>
      </div>
    </nav>
  );
}