import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { loginUser } from './api';

function Login({ onLogin }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      const email = username.includes('@') ? username : `${username}@students.cavendish.ac.ug`;
      const response = await loginUser(email, password);
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
      
      if (rememberMe) {
        localStorage.setItem('rememberMe', 'true');
      }
      
      setMessage('✅ Login successful!');
      setTimeout(() => {
        if (onLogin) onLogin(response.data.user);
      }, 1000);
    } catch (error) {
      setMessage('❌ ' + (error.response?.data?.message || 'Login failed. Check your credentials.'));
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
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
    }}>
      {/* Dark Overlay */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'rgba(0, 0, 0, 0.3)',
      }} />

      {/* Glass Container */}
      <div style={{
        width: '100%',
        maxWidth: '750px',
        margin: '20px',
        position: 'relative',
        zIndex: 1,
        background: 'rgba(255, 255, 255, 0.12)',
        backdropFilter: 'blur(25px)',
        WebkitBackdropFilter: 'blur(25px)',
        borderRadius: '24px',
        border: '1px solid rgba(255, 255, 255, 0.15)',
        boxShadow: '0 30px 80px rgba(0,0,0,0.3)',
        overflow: 'hidden',
        display: 'flex',
        minHeight: '450px',
      }}>
        
        {/* LEFT SIDE - Logo */}
        <div style={{
          width: '35%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '40px 20px',
          borderRight: '1px solid rgba(255,255,255,0.15)',
        }}>
          <div style={{
            width: '120px',
            height: '120px',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '14px',
            overflow: 'hidden',
            background: 'rgba(255,255,255,0.15)',
            border: '2px solid rgba(255,255,255,0.25)',
            flexShrink: 0,
          }}>
            <img 
              src="/images/logo.jpeg" 
              alt="Cavendish University" 
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                borderRadius: '50%',
              }}
              onError={(e) => {
                e.target.style.display = 'none';
                e.target.parentElement.innerHTML = '<span style="font-size: 40px; font-weight: 800; color: white;">CU</span>';
              }}
            />
          </div>

          <h1 style={{
            fontSize: '22px',
            fontWeight: '700',
            color: 'white',
            margin: 0,
            textAlign: 'center',
            letterSpacing: '2px',
            textShadow: '0 2px 10px rgba(0,0,0,0.2)',
          }}>
            CAVENDISH
          </h1>
          <p style={{
            fontSize: '12px',
            color: 'rgba(255,255,255,0.8)',
            margin: '2px 0 0',
            fontWeight: '400',
            letterSpacing: '3px',
            textShadow: '0 1px 8px rgba(0,0,0,0.15)',
          }}>
            UNIVERSITY UGANDA
          </p>
        </div>

        {/* RIGHT SIDE - Login Form */}
        <div style={{
          width: '65%',
          padding: '40px 40px 35px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
        }}>
          <h2 style={{
            fontSize: '22px',
            fontWeight: '600',
            color: 'white',
            textAlign: 'center',
            margin: '0 0 25px 0',
            letterSpacing: '1px',
            textShadow: '0 1px 8px rgba(0,0,0,0.15)',
          }}>
            Sign in
          </h2>

          {message && (
            <div className={`alert ${message.includes('✅') ? 'alert-success' : 'alert-error'}`} style={{ 
              fontSize: '13px', 
              padding: '8px 12px',
              background: message.includes('✅') ? 'rgba(40,167,69,0.2)' : 'rgba(220,53,69,0.2)',
              color: message.includes('✅') ? '#d4edda' : '#f8d7da',
              border: message.includes('✅') ? '1px solid rgba(40,167,69,0.3)' : '1px solid rgba(220,53,69,0.3)',
              borderRadius: '8px',
              width: '100%',
              marginBottom: '16px',
            }}>
              {message}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: '16px' }}>
              <label style={{
                display: 'block',
                fontSize: '14px',
                fontWeight: '600',
                color: 'rgba(255,255,255,0.9)',
                marginBottom: '4px',
                textShadow: '0 1px 4px rgba(0,0,0,0.1)',
              }}>
                Username
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="190519"
                required
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  borderRadius: '12px',
                  border: '1px solid rgba(255,255,255,0.25)',
                  fontSize: '14px',
                  transition: 'all 0.3s',
                  outline: 'none',
                  boxSizing: 'border-box',
                  background: 'rgba(255,255,255,0.1)',
                  color: 'white',
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = 'rgba(255,255,255,0.6)';
                  e.target.style.background = 'rgba(255,255,255,0.2)';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = 'rgba(255,255,255,0.25)';
                  e.target.style.background = 'rgba(255,255,255,0.1)';
                }}
              />
            </div>

            <div style={{ marginBottom: '20px' }}>
              <label style={{
                display: 'block',
                fontSize: '14px',
                fontWeight: '600',
                color: 'rgba(255,255,255,0.9)',
                marginBottom: '4px',
                textShadow: '0 1px 4px rgba(0,0,0,0.1)',
              }}>
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="********"
                required
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  borderRadius: '12px',
                  border: '1px solid rgba(255,255,255,0.25)',
                  fontSize: '14px',
                  transition: 'all 0.3s',
                  outline: 'none',
                  boxSizing: 'border-box',
                  background: 'rgba(255,255,255,0.1)',
                  color: 'white',
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = 'rgba(255,255,255,0.6)';
                  e.target.style.background = 'rgba(255,255,255,0.2)';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = 'rgba(255,255,255,0.25)';
                  e.target.style.background = 'rgba(255,255,255,0.1)';
                }}
              />
            </div>

            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '24px',
            }}>
              <label style={{
                display: 'flex',
                alignItems: 'center',
                fontSize: '13px',
                color: 'rgba(255,255,255,0.8)',
                cursor: 'pointer',
                textShadow: '0 1px 4px rgba(0,0,0,0.1)',
              }}>
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  style={{
                    marginRight: '8px',
                    accentColor: '#1a237e',
                    width: '16px',
                    height: '16px',
                    cursor: 'pointer',
                  }}
                />
                Remember me
              </label>

              {/* FIXED: Replaced <a> with <button> styled as link */}
              <button
                type="button"
                onClick={() => alert('Password reset functionality coming soon!')}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'rgba(255,255,255,0.8)',
                  textDecoration: 'underline',
                  cursor: 'pointer',
                  fontSize: '13px',
                  fontWeight: '500',
                  textShadow: '0 1px 4px rgba(0,0,0,0.1)',
                  padding: 0,
                  fontFamily: 'inherit',
                }}
                onMouseEnter={(e) => e.target.style.color = 'white'}
                onMouseLeave={(e) => e.target.style.color = 'rgba(255,255,255,0.8)'}
              >
                Forgot Password?
              </button>
            </div>

            <button
              type="submit"
              disabled={loading}
              style={{
                width: '100%',
                padding: '14px',
                background: 'rgba(255,255,255,0.15)',
                color: 'white',
                border: '1px solid rgba(255,255,255,0.25)',
                borderRadius: '12px',
                fontSize: '16px',
                fontWeight: '700',
                cursor: loading ? 'not-allowed' : 'pointer',
                letterSpacing: '2px',
                transition: 'all 0.3s ease',
              }}
              onMouseEnter={(e) => {
                if (!loading) {
                  e.target.style.background = 'rgba(255,255,255,0.25)';
                  e.target.style.transform = 'translateY(-2px)';
                }
              }}
              onMouseLeave={(e) => {
                e.target.style.background = 'rgba(255,255,255,0.15)';
                e.target.style.transform = 'translateY(0)';
              }}
            >
              {loading ? 'LOGGING IN...' : 'LOGIN'}
            </button>
          </form>

          <p style={{
            textAlign: 'center',
            marginTop: '18px',
            fontSize: '13px',
            color: 'rgba(255,255,255,0.8)',
            textShadow: '0 1px 4px rgba(0,0,0,0.1)',
          }}>
            Don't have an account?{' '}
            <Link to="/register" style={{
              color: 'white',
              textDecoration: 'none',
              fontWeight: '600',
              textShadow: '0 1px 8px rgba(0,0,0,0.2)',
            }}>
              Create Account
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Login;
