import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { registerUser } from './api';

function Register({ onRegister }) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    studentId: '',
    password: '',
    confirmPassword: '',
    phone: '',
  });
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    if (formData.password !== formData.confirmPassword) {
      setMessage('❌ Passwords do not match');
      setLoading(false);
      return;
    }

    if (!formData.email.endsWith('@students.cavendish.ac.ug')) {
      setMessage('❌ Please use a @students.cavendish.ac.ug email');
      setLoading(false);
      return;
    }

    if (formData.password.length < 6) {
      setMessage('❌ Password must be at least 6 characters');
      setLoading(false);
      return;
    }

    try {
      const { confirmPassword, ...userData } = formData;
      const response = await registerUser(userData);
      
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
      
      setMessage('✅ Registration successful! Redirecting...');
      
      setTimeout(() => {
        if (onRegister) onRegister(response.data.user);
      }, 1500);
    } catch (error) {
      console.error('Registration error:', error);
      const errorMsg = error.response?.data?.message || 'Registration failed. Please try again.';
      setMessage('❌ ' + errorMsg);
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundImage: `url('/images/background.jpg')`,
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      backgroundRepeat: 'no-repeat',
      padding: '20px',
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      overflowY: 'auto',
    }}>
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'rgba(0, 0, 0, 0.55)',
      }} />

      <div style={{
        background: 'white',
        borderRadius: '20px',
        padding: '45px 40px',
        width: '100%',
        maxWidth: '480px',
        boxShadow: '0 25px 80px rgba(0,0,0,0.5)',
        position: 'relative',
        zIndex: 1,
        margin: '40px 0',
      }}>
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <div style={{
            width: '70px',
            height: '70px',
            background: 'white',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 12px',
            boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
            padding: '8px',
            overflow: 'hidden',
          }}>
            <img 
              src="/images/logo.jpeg" 
              alt="Cavendish University" 
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'contain',
              }}
              onError={(e) => {
                e.target.style.display = 'none';
                e.target.parentElement.innerHTML = '<span style="font-size: 28px; font-weight: 800; color: #1a237e;">CU</span>';
              }}
            />
          </div>
          <h1 style={{
            fontSize: '18px',
            fontWeight: '700',
            color: '#1a237e',
            margin: 0,
            letterSpacing: '1.5px',
          }}>
            CAVENDISH
          </h1>
          <p style={{
            fontSize: '11px',
            color: '#888',
            margin: '2px 0 0',
            fontWeight: '500',
            letterSpacing: '3px',
          }}>
            UNIVERSITY UGANDA
          </p>
        </div>

        <h2 style={{
          fontSize: '18px',
          fontWeight: '600',
          color: '#333',
          textAlign: 'center',
          margin: '0 0 24px 0',
          letterSpacing: '0.5px',
        }}>
          Create Account
        </h2>

        {message && (
          <div className={`alert ${message.includes('✅') ? 'alert-success' : 'alert-error'}`}>
            {message}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '14px' }}>
            <label style={{
              display: 'block',
              fontSize: '13px',
              fontWeight: '600',
              color: '#333',
              marginBottom: '4px',
            }}>
              Full Name *
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="e.g., John Doe"
              required
              style={{
                width: '100%',
                padding: '11px 16px',
                borderRadius: '10px',
                border: '2px solid #e8e8e8',
                fontSize: '14px',
                outline: 'none',
                boxSizing: 'border-box',
                background: '#fafafa',
              }}
              onFocus={(e) => e.target.style.borderColor = '#1a237e'}
              onBlur={(e) => e.target.style.borderColor = '#e8e8e8'}
            />
          </div>

          <div style={{ marginBottom: '14px' }}>
            <label style={{
              display: 'block',
              fontSize: '13px',
              fontWeight: '600',
              color: '#333',
              marginBottom: '4px',
            }}>
              Email * (@students.cavendish.ac.ug)
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="student@students.cavendish.ac.ug"
              required
              style={{
                width: '100%',
                padding: '11px 16px',
                borderRadius: '10px',
                border: '2px solid #e8e8e8',
                fontSize: '14px',
                outline: 'none',
                boxSizing: 'border-box',
                background: '#fafafa',
              }}
              onFocus={(e) => e.target.style.borderColor = '#1a237e'}
              onBlur={(e) => e.target.style.borderColor = '#e8e8e8'}
            />
          </div>

          <div style={{ marginBottom: '14px' }}>
            <label style={{
              display: 'block',
              fontSize: '13px',
              fontWeight: '600',
              color: '#333',
              marginBottom: '4px',
            }}>
              Student ID *
            </label>
            <input
              type="text"
              name="studentId"
              value={formData.studentId}
              onChange={handleChange}
              placeholder="e.g., 190519"
              required
              style={{
                width: '100%',
                padding: '11px 16px',
                borderRadius: '10px',
                border: '2px solid #e8e8e8',
                fontSize: '14px',
                outline: 'none',
                boxSizing: 'border-box',
                background: '#fafafa',
              }}
              onFocus={(e) => e.target.style.borderColor = '#1a237e'}
              onBlur={(e) => e.target.style.borderColor = '#e8e8e8'}
            />
          </div>

          <div style={{ marginBottom: '14px' }}>
            <label style={{
              display: 'block',
              fontSize: '13px',
              fontWeight: '600',
              color: '#333',
              marginBottom: '4px',
            }}>
              Phone Number
            </label>
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              placeholder="e.g., 0777123456"
              style={{
                width: '100%',
                padding: '11px 16px',
                borderRadius: '10px',
                border: '2px solid #e8e8e8',
                fontSize: '14px',
                outline: 'none',
                boxSizing: 'border-box',
                background: '#fafafa',
              }}
              onFocus={(e) => e.target.style.borderColor = '#1a237e'}
              onBlur={(e) => e.target.style.borderColor = '#e8e8e8'}
            />
          </div>

          <div style={{ marginBottom: '14px' }}>
            <label style={{
              display: 'block',
              fontSize: '13px',
              fontWeight: '600',
              color: '#333',
              marginBottom: '4px',
            }}>
              Password * (min 6 characters)
            </label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Enter your password"
              required
              minLength="6"
              style={{
                width: '100%',
                padding: '11px 16px',
                borderRadius: '10px',
                border: '2px solid #e8e8e8',
                fontSize: '14px',
                outline: 'none',
                boxSizing: 'border-box',
                background: '#fafafa',
              }}
              onFocus={(e) => e.target.style.borderColor = '#1a237e'}
              onBlur={(e) => e.target.style.borderColor = '#e8e8e8'}
            />
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label style={{
              display: 'block',
              fontSize: '13px',
              fontWeight: '600',
              color: '#333',
              marginBottom: '4px',
            }}>
              Confirm Password *
            </label>
            <input
              type="password"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              placeholder="Confirm your password"
              required
              style={{
                width: '100%',
                padding: '11px 16px',
                borderRadius: '10px',
                border: '2px solid #e8e8e8',
                fontSize: '14px',
                outline: 'none',
                boxSizing: 'border-box',
                background: '#fafafa',
              }}
              onFocus={(e) => e.target.style.borderColor = '#1a237e'}
              onBlur={(e) => e.target.style.borderColor = '#e8e8e8'}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%',
              padding: '14px',
              background: 'linear-gradient(135deg, #1a237e, #0d47a1)',
              color: 'white',
              border: 'none',
              borderRadius: '10px',
              fontSize: '16px',
              fontWeight: '700',
              cursor: loading ? 'not-allowed' : 'pointer',
              letterSpacing: '2px',
              boxShadow: '0 4px 15px rgba(13, 71, 161, 0.3)',
              transition: 'all 0.3s ease',
            }}
            onMouseEnter={(e) => {
              if (!loading) {
                e.target.style.transform = 'translateY(-2px)';
                e.target.style.boxShadow = '0 6px 25px rgba(13, 71, 161, 0.4)';
              }
            }}
            onMouseLeave={(e) => {
              e.target.style.transform = 'translateY(0)';
              e.target.style.boxShadow = '0 4px 15px rgba(13, 71, 161, 0.3)';
            }}
          >
            {loading ? 'CREATING ACCOUNT...' : 'CREATE ACCOUNT'}
          </button>
        </form>

        <p style={{
          textAlign: 'center',
          marginTop: '20px',
          fontSize: '13px',
          color: '#666',
        }}>
          Already have an account?{' '}
          <Link to="/login" style={{
            color: '#1a237e',
            textDecoration: 'none',
            fontWeight: '600',
          }}>
            Sign In
          </Link>
        </p>
      </div>
    </div>
  );
}

export default Register;
