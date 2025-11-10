import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function Dashboard() {
  const navigate = useNavigate();
  const [user] = useState(() => {
    const userData = localStorage.getItem('user');
    return userData ? JSON.parse(userData) : null;
  });

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f3f4f6' }}>
      {/* Navbar */}
      <nav style={{
        backgroundColor: 'white',
        padding: '15px 20px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <h1 style={{ fontSize: '24px', fontWeight: 'bold', color: '#3b82f6' }}>
          💰 Finance Tracker AI
        </h1>
        <button
          onClick={handleLogout}
          style={{
            padding: '10px 20px',
            backgroundColor: '#ef4444',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontWeight: 'bold'
          }}
        >
          Logout
        </button>
      </nav>

      {/* Main Content */}
      <div style={{ padding: '40px 20px' }}>
        <div style={{
          maxWidth: '1200px',
          margin: '0 auto',
          backgroundColor: 'white',
          padding: '40px',
          borderRadius: '8px',
          boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
        }}>
          <h2 style={{ fontSize: '32px', marginBottom: '20px' }}>
            Welcome Back, {user?.name || 'User'}! 👋
          </h2>
          <p style={{ fontSize: '16px', color: '#666', marginBottom: '10px' }}>
            Email: {user?.email}
          </p>

          {/* Quick Actions */}
          <div style={{
            marginTop: '40px',
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '20px'
          }}>
            <div
              onClick={() => navigate('/transactions')}
              style={{
                padding: '20px',
                backgroundColor: '#f0f9ff',
                border: '1px solid #bfdbfe',
                borderRadius: '8px',
                cursor: 'pointer',
                transition: 'all 0.3s'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.1)';
                e.currentTarget.style.transform = 'translateY(-2px)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.boxShadow = 'none';
                e.currentTarget.style.transform = 'none';
              }}
            >
              <div style={{ fontSize: '32px', marginBottom: '10px' }}>💳</div>
              <h3 style={{ fontWeight: 'bold', marginBottom: '5px' }}>View Transactions</h3>
              <p style={{ fontSize: '14px', color: '#666' }}>See all your transactions</p>
            </div>

            <div style={{
              padding: '20px',
              backgroundColor: '#f0fdf4',
              border: '1px solid #bbf7d0',
              borderRadius: '8px',
              cursor: 'pointer'
            }}>
              <div style={{ fontSize: '32px', marginBottom: '10px' }}>📊</div>
              <h3 style={{ fontWeight: 'bold', marginBottom: '5px' }}>Analytics</h3>
              <p style={{ fontSize: '14px', color: '#666' }}>View your spending patterns</p>
            </div>

            <div style={{
              padding: '20px',
              backgroundColor: '#fefce8',
              border: '1px solid #fef08a',
              borderRadius: '8px',
              cursor: 'pointer'
            }}>
              <div style={{ fontSize: '32px', marginBottom: '10px' }}>🎯</div>
              <h3 style={{ fontWeight: 'bold', marginBottom: '5px' }}>Budget</h3>
              <p style={{ fontSize: '14px', color: '#666' }}>Set and track budgets</p>
            </div>
          </div>

          {/* Stats */}
          <div style={{
            marginTop: '40px',
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '20px'
          }}>
            <div style={{
              padding: '20px',
              backgroundColor: '#f8f9fa',
              borderRadius: '8px',
              border: '1px solid #dee2e6'
            }}>
              <p style={{ color: '#666', marginBottom: '10px' }}>Total Balance</p>
              <p style={{ fontSize: '28px', fontWeight: 'bold', color: '#3b82f6' }}>$0.00</p>
            </div>
            <div style={{
              padding: '20px',
              backgroundColor: '#f8f9fa',
              borderRadius: '8px',
              border: '1px solid #dee2e6'
            }}>
              <p style={{ color: '#666', marginBottom: '10px' }}>This Month Income</p>
              <p style={{ fontSize: '28px', fontWeight: 'bold', color: '#10b981' }}>$0.00</p>
            </div>
            <div style={{
              padding: '20px',
              backgroundColor: '#f8f9fa',
              borderRadius: '8px',
              border: '1px solid #dee2e6'
            }}>
              <p style={{ color: '#666', marginBottom: '10px' }}>This Month Expenses</p>
              <p style={{ fontSize: '28px', fontWeight: 'bold', color: '#ef4444' }}>$0.00</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}