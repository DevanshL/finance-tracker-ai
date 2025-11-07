import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import './App.css';

// Pages
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Transactions from './pages/Transactions';

console.log('✅ App.jsx loaded');

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    console.log('🔍 Token check:', !!token);
    setIsLoggedIn(!!token);
    setIsLoading(false);
  }, []);

  if (isLoading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
        fontSize: '18px'
      }}>
        Loading...
      </div>
    );
  }

  return (
    <Router>
      <Toaster position="top-right" />
      
      <Routes>
        {/* Login */}
        <Route 
          path="/login" 
          element={isLoggedIn ? <Navigate to="/dashboard" replace /> : <Login />} 
        />
        
        {/* Register */}
        <Route 
          path="/register" 
          element={isLoggedIn ? <Navigate to="/dashboard" replace /> : <Register />} 
        />

        {/* Dashboard - Protected */}
        <Route 
          path="/dashboard" 
          element={isLoggedIn ? <Dashboard /> : <Navigate to="/login" replace />}
        />
        
        {/* Transactions - Protected */}
        <Route 
          path="/transactions" 
          element={isLoggedIn ? <Transactions /> : <Navigate to="/login" replace />}
        />

        {/* Root */}
        <Route 
          path="/" 
          element={isLoggedIn ? <Navigate to="/dashboard" replace /> : <Navigate to="/login" replace />} 
        />

        {/* 404 */}
        <Route 
          path="*" 
          element={<div style={{ padding: '20px' }}>404 - Page Not Found</div>} 
        />
      </Routes>
    </Router>
  );
}

export default App;