import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './Login';
import Register from './Register';
import StudentDashboard from './StudentDashboard';
import AdminDashboard from './AdminDashboard';
import './index.css';

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const savedUser = localStorage.getItem('user');
    if (token && savedUser) {
      setUser(JSON.parse(savedUser));
    }
    setLoading(false);
  }, []);

  const handleLogin = (userData) => {
    setUser(userData);
  };

  const handleRegister = (userData) => {
    setUser(userData);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  };

  if (loading) {
    return <div style={{ textAlign: 'center', marginTop: '50px' }}>Loading...</div>;
  }

  return (
    <Router>
      <Routes>
        <Route 
          path="/" 
          element={
            user ? (
              user.role === 'admin' ? 
                <AdminDashboard user={user} onLogout={handleLogout} /> : 
                <StudentDashboard user={user} onLogout={handleLogout} />
            ) : (
              <Navigate to="/login" />
            )
          } 
        />
        <Route 
          path="/login" 
          element={
            user ? (
              <Navigate to="/" />
            ) : (
              <Login onLogin={handleLogin} />
            )
          } 
        />
        <Route 
          path="/register" 
          element={
            user ? (
              <Navigate to="/" />
            ) : (
              <Register onRegister={handleRegister} />
            )
          } 
        />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  );
}

export default App;
