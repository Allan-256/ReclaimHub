import React, { useState, useEffect } from 'react';
import { Moon, Sun, Package, Home, BarChart3, Settings, LogOut, User, Mail, Phone, Lock, Save, Plus, X, AlertCircle, Eye, CheckCircle } from 'lucide-react';
import Charts from './components/Charts';

function StudentDashboard({ user, onLogout }) {
  const [items, setItems] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [showReportForm, setShowReportForm] = useState(false);
  const [reportMessage, setReportMessage] = useState('');
  const [claimMessage, setClaimMessage] = useState('');
  const [showClaimModal, setShowClaimModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [selectedImage, setSelectedImage] = useState(null);
  
  const [profile, setProfile] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
  });
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [profileMessage, setProfileMessage] = useState('');
  const [passwordMessage, setPasswordMessage] = useState('');
  const [saving, setSaving] = useState(false);

  const [reportData, setReportData] = useState({
    title: '',
    description: '',
    category: 'Electronics',
    location: '',
    dateLost: new Date().toISOString().split('T')[0],
    serialNumber: '',
    make: '',
    model: '',
    type: '',
    resolution: '',
    color: '',
    imeiNumber: '',
    image: null,
    imageData: '',
  });
  const [imagePreview, setImagePreview] = useState(null);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch('/api/items');
      if (!response.ok) {
        throw new Error('Failed to fetch items');
      }
      const data = await response.json();
      setItems(data.items || []);
      
      const statsResponse = await fetch('/api/stats');
      if (statsResponse.ok) {
        const statsData = await statsResponse.json();
        setStats(statsData.stats || {});
      }
    } catch (err) {
      console.error('Error loading data:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setReportData({ ...reportData, image: file });
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
        const base64 = reader.result.split(',')[1];
        setReportData(prev => ({ ...prev, imageData: base64 }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleReportLost = async (e) => {
    e.preventDefault();
    setSaving(true);
    setReportMessage('');

    try {
      const token = localStorage.getItem('token');
      
      const submitData = {
        title: reportData.title,
        description: reportData.description,
        category: reportData.category,
        location: reportData.location,
        dateLost: reportData.dateLost,
        serialNumber: reportData.serialNumber || '',
        make: reportData.make || '',
        model: reportData.model || '',
        type: reportData.type || '',
        resolution: reportData.resolution || '',
        color: reportData.color || '',
        imeiNumber: reportData.imeiNumber || '',
        status: 'lost',
        imageData: reportData.imageData || '',
      };

      const response = await fetch('/api/items', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(submitData),
      });

      const data = await response.json();
      if (response.ok) {
        setReportMessage('✅ Lost item reported successfully!');
        setShowReportForm(false);
        setReportData({
          title: '',
          description: '',
          category: 'Electronics',
          location: '',
          dateLost: new Date().toISOString().split('T')[0],
          serialNumber: '',
          make: '',
          model: '',
          type: '',
          resolution: '',
          color: '',
          imeiNumber: '',
          image: null,
          imageData: '',
        });
        setImagePreview(null);
        loadData();
        setTimeout(() => setReportMessage(''), 3000);
      } else {
        setReportMessage('❌ ' + (data.message || 'Failed to report item'));
      }
    } catch (err) {
      setReportMessage('❌ Error reporting item');
    } finally {
      setSaving(false);
    }
  };

  const handleClaimSubmit = async () => {
    if (!claimMessage.trim()) {
      alert('Please provide a reason for claiming this item');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/claims/${selectedItem._id}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ message: claimMessage }),
      });

      const data = await response.json();
      if (response.ok) {
        alert('✅ Claim submitted successfully!');
        setShowClaimModal(false);
        setSelectedItem(null);
        setClaimMessage('');
        loadData();
      } else {
        alert('❌ ' + (data.message || 'Failed to submit claim'));
      }
    } catch (err) {
      alert('❌ Error submitting claim');
    }
  };

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setSaving(true);
    setProfileMessage('');

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/users/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(profile),
      });

      const data = await response.json();
      if (response.ok) {
        setProfileMessage('✅ Profile updated successfully!');
        setTimeout(() => setProfileMessage(''), 3000);
      } else {
        setProfileMessage('❌ ' + (data.message || 'Failed to update profile'));
      }
    } catch (err) {
      setProfileMessage('❌ Error updating profile');
    } finally {
      setSaving(false);
    }
  };

  const handlePasswordUpdate = async (e) => {
    e.preventDefault();
    setSaving(true);
    setPasswordMessage('');

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setPasswordMessage('❌ New passwords do not match');
      setSaving(false);
      return;
    }

    if (passwordData.newPassword.length < 6) {
      setPasswordMessage('❌ Password must be at least 6 characters');
      setSaving(false);
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/users/password', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          currentPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword,
        }),
      });

      const data = await response.json();
      if (response.ok) {
        setPasswordMessage('✅ Password updated successfully!');
        setPasswordData({
          currentPassword: '',
          newPassword: '',
          confirmPassword: '',
        });
        setTimeout(() => setPasswordMessage(''), 3000);
      } else {
        setPasswordMessage('❌ ' + (data.message || 'Failed to update password'));
      }
    } catch (err) {
      setPasswordMessage('❌ Error updating password');
    } finally {
      setSaving(false);
    }
  };

  const theme = {
    background: isDarkMode ? '#0a0e27' : '#f0f2f5',
    cardBg: isDarkMode ? 'rgba(255,255,255,0.06)' : 'rgba(255,255,255,0.9)',
    textColor: isDarkMode ? 'white' : '#1a1a2e',
    textSecondary: isDarkMode ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.6)',
    borderColor: isDarkMode ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)',
    sidebarBg: isDarkMode ? 'rgba(255,255,255,0.04)' : 'rgba(255,255,255,0.7)',
    inputBg: isDarkMode ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.8)',
    inputText: isDarkMode ? 'white' : '#1a1a2e',
    accentColor: '#4fc3f7',
    claimedBg: isDarkMode ? 'rgba(81,207,102,0.15)' : 'rgba(81,207,102,0.1)',
    claimedBorder: '#51cf66',
  };

  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        minHeight: '100vh',
        background: theme.background,
        color: theme.textColor,
        fontSize: '24px'
      }}>
        Loading...
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ 
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center', 
        alignItems: 'center', 
        minHeight: '100vh',
        background: theme.background,
        color: theme.textColor,
        padding: '20px'
      }}>
        <h1>Error Loading Dashboard</h1>
        <p>{error}</p>
        <button 
          onClick={() => window.location.reload()}
          style={{
            padding: '10px 20px',
            borderRadius: '8px',
            border: 'none',
            background: '#1a237e',
            color: 'white',
            fontSize: '16px',
            cursor: 'pointer',
            marginTop: '20px'
          }}
        >
          Retry
        </button>
      </div>
    );
  }

  const StatCard = ({ title, value, color }) => (
    <div style={{
      padding: '16px 20px',
      background: theme.cardBg,
      borderRadius: '12px',
      border: '1px solid ' + theme.borderColor,
      transition: 'all 0.3s ease',
      cursor: 'pointer',
    }}
    onMouseEnter={(e) => {
      e.target.style.transform = 'translateY(-2px)';
      e.target.style.boxShadow = '0 8px 25px rgba(0,0,0,0.1)';
    }}
    onMouseLeave={(e) => {
      e.target.style.transform = 'translateY(0)';
      e.target.style.boxShadow = 'none';
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <div style={{ fontSize: '28px', fontWeight: '700', color: theme.textColor }}>{value || 0}</div>
          <div style={{ fontSize: '14px', color: theme.textSecondary }}>{title}</div>
        </div>
        <div style={{
          width: '40px',
          height: '40px',
          borderRadius: '10px',
          background: color + '20',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}>
          <span style={{ fontSize: '18px' }}>📊</span>
        </div>
      </div>
      <div style={{ marginTop: '8px', fontSize: '13px', color: theme.accentColor }}>
        Show all items →
      </div>
    </div>
  );

  const lostItems = items.filter(item => item.status === 'lost');
  const foundItems = items.filter(item => item.status === 'found');
  const claimedItems = items.filter(item => item.status === 'claimed');

  const getImageSrc = (item) => {
    if (item.imageData) {
      return `data:image/jpeg;base64,${item.imageData}`;
    }
    return null;
  };

  const isItemClaimed = (item) => {
    return item.status === 'claimed';
  };

  return (
    <div style={{
      display: 'flex',
      minHeight: '100vh',
      background: theme.background,
      transition: 'background 0.3s ease',
    }}>
      {selectedImage && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.9)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999,
          cursor: 'pointer',
        }}
        onClick={() => setSelectedImage(null)}>
          <img 
            src={selectedImage} 
            alt="Full size" 
            style={{ 
              maxWidth: '90%', 
              maxHeight: '90%', 
              objectFit: 'contain',
              borderRadius: '8px'
            }} 
          />
          <button
            onClick={() => setSelectedImage(null)}
            style={{
              position: 'absolute',
              top: '20px',
              right: '20px',
              padding: '10px 20px',
              borderRadius: '8px',
              border: 'none',
              background: 'rgba(255,255,255,0.2)',
              color: 'white',
              fontSize: '16px',
              cursor: 'pointer',
            }}
          >
            ✕ Close
          </button>
        </div>
      )}

      {/* Sidebar */}
      <div style={{
        width: '240px',
        minHeight: '100vh',
        background: theme.sidebarBg,
        borderRight: '1px solid ' + theme.borderColor,
        padding: '24px 16px',
        position: 'fixed',
        top: 0,
        left: 0,
        bottom: 0,
        overflowY: 'auto',
        zIndex: 100,
      }}>
        <div style={{ marginBottom: '32px' }}>
          <h2 style={{ color: theme.textColor, fontSize: '20px', margin: 0, fontWeight: '700' }}>
            ReclaimHub
          </h2>
          <p style={{ color: theme.textSecondary, fontSize: '12px', margin: '4px 0 0' }}>
            Student Dashboard
          </p>
        </div>

        <div style={{ marginBottom: '24px' }}>
          <div style={{ 
            padding: '8px 12px', 
            borderRadius: '8px', 
            background: 'rgba(79, 195, 247, 0.15)',
            border: '1px solid rgba(79, 195, 247, 0.2)',
          }}>
            <div style={{ fontSize: '13px', color: theme.textSecondary }}>Search items...</div>
          </div>
        </div>

        <div style={{ marginBottom: '24px' }}>
          <div style={{ 
            padding: '10px 12px', 
            borderRadius: '8px', 
            background: activeTab === 'dashboard' ? 'rgba(79, 195, 247, 0.15)' : 'transparent',
            color: activeTab === 'dashboard' ? theme.accentColor : theme.textSecondary,
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            cursor: 'pointer',
            transition: 'all 0.3s',
            fontWeight: activeTab === 'dashboard' ? '600' : '400',
          }}
          onClick={() => setActiveTab('dashboard')}>
            <Home size={18} /> Dashboard
          </div>
          <div style={{ 
            padding: '10px 12px', 
            borderRadius: '8px', 
            background: activeTab === 'items' ? 'rgba(79, 195, 247, 0.15)' : 'transparent',
            color: activeTab === 'items' ? theme.accentColor : theme.textSecondary,
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            cursor: 'pointer',
            transition: 'all 0.3s',
            fontWeight: activeTab === 'items' ? '600' : '400',
          }}
          onClick={() => setActiveTab('items')}>
            <Package size={18} /> Items
          </div>
          <div style={{ 
            padding: '10px 12px', 
            borderRadius: '8px', 
            background: activeTab === 'reports' ? 'rgba(79, 195, 247, 0.15)' : 'transparent',
            color: activeTab === 'reports' ? theme.accentColor : theme.textSecondary,
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            cursor: 'pointer',
            transition: 'all 0.3s',
            fontWeight: activeTab === 'reports' ? '600' : '400',
          }}
          onClick={() => setActiveTab('reports')}>
            <BarChart3 size={18} /> Reports
          </div>
          <div style={{ 
            padding: '10px 12px', 
            borderRadius: '8px', 
            background: activeTab === 'settings' ? 'rgba(79, 195, 247, 0.15)' : 'transparent',
            color: activeTab === 'settings' ? theme.accentColor : theme.textSecondary,
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            cursor: 'pointer',
            transition: 'all 0.3s',
            fontWeight: activeTab === 'settings' ? '600' : '400',
          }}
          onClick={() => setActiveTab('settings')}>
            <Settings size={18} /> Settings
          </div>
        </div>

        <div style={{ borderTop: '1px solid ' + theme.borderColor, paddingTop: '16px', marginTop: 'auto' }}>
          <div style={{
            padding: '10px 12px',
            borderRadius: '8px',
            color: theme.textSecondary,
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            cursor: 'pointer',
            transition: 'all 0.3s',
          }}
          onClick={onLogout}>
            <LogOut size={18} /> Logout
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div style={{
        marginLeft: '240px',
        flex: 1,
        padding: '24px 32px',
      }}>
        {/* Header */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '24px',
        }}>
          <div>
            <h1 style={{ color: theme.textColor, margin: 0, fontSize: '24px', fontWeight: '700' }}>
              {activeTab === 'settings' ? 'Settings' : activeTab === 'reports' ? 'Reports & Analytics' : 'Dashboard'}
            </h1>
            <p style={{ color: theme.textSecondary, margin: '4px 0 0' }}>
              {activeTab === 'settings' ? 'Manage your account settings' : 
               activeTab === 'reports' ? 'Visualize your item data' :
               `Welcome back, ${user?.name} 👋`}
            </p>
          </div>
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
            <button
              onClick={() => setIsDarkMode(!isDarkMode)}
              style={{
                padding: '8px',
                borderRadius: '8px',
                border: '1px solid ' + theme.borderColor,
                background: theme.cardBg,
                color: theme.textColor,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              {isDarkMode ? <Sun size={18} /> : <Moon size={18} />}
            </button>
          </div>
        </div>

        {/* Dashboard Content */}
        {activeTab === 'dashboard' && (
          <div>
            <button
              onClick={() => setShowReportForm(!showReportForm)}
              style={{
                padding: '10px 20px',
                borderRadius: '8px',
                border: 'none',
                background: 'linear-gradient(135deg, #dc3545, #c82333)',
                color: 'white',
                fontWeight: '600',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                marginBottom: '20px',
                transition: 'all 0.3s',
              }}
              onMouseEnter={(e) => {
                e.target.style.transform = 'translateY(-2px)';
                e.target.style.boxShadow = '0 8px 25px rgba(220,53,69,0.3)';
              }}
              onMouseLeave={(e) => {
                e.target.style.transform = 'translateY(0)';
                e.target.style.boxShadow = 'none';
              }}
            >
              {showReportForm ? <X size={18} /> : <Plus size={18} />}
              {showReportForm ? 'Close Report Form' : 'Report Lost Item'}
            </button>

            {showReportForm && (
              <div style={{
                padding: '24px',
                background: theme.cardBg,
                borderRadius: '12px',
                border: '1px solid ' + theme.borderColor,
                marginBottom: '24px',
              }}>
                <h3 style={{ color: theme.textColor, margin: '0 0 16px 0' }}>
                  <AlertCircle size={18} style={{ display: 'inline', marginRight: '8px' }} />
                  Report Lost Item
                </h3>

                {reportMessage && (
                  <div style={{
                    padding: '10px 16px',
                    borderRadius: '8px',
                    marginBottom: '16px',
                    background: reportMessage.includes('✅') ? 'rgba(40,167,69,0.15)' : 'rgba(220,53,69,0.15)',
                    color: reportMessage.includes('✅') ? '#28a745' : '#dc3545',
                    border: '1px solid ' + (reportMessage.includes('✅') ? 'rgba(40,167,69,0.2)' : 'rgba(220,53,69,0.2)'),
                  }}>
                    {reportMessage}
                  </div>
                )}

                <form onSubmit={handleReportLost}>
                  <div className="grid-2">
                    <div className="form-group">
                      <label style={{ color: theme.textColor, display: 'block', marginBottom: '6px', fontSize: '14px', fontWeight: '500' }}>
                        Item Title *
                      </label>
                      <input
                        type="text"
                        required
                        value={reportData.title}
                        onChange={(e) => setReportData({...reportData, title: e.target.value})}
                        placeholder="e.g., Black Laptop"
                        style={{
                          width: '100%',
                          padding: '10px 14px',
                          borderRadius: '8px',
                          border: '1px solid ' + theme.borderColor,
                          background: theme.inputBg,
                          color: theme.inputText,
                          fontSize: '14px',
                          outline: 'none',
                          boxSizing: 'border-box',
                        }}
                      />
                    </div>
                    <div className="form-group">
                      <label style={{ color: theme.textColor, display: 'block', marginBottom: '6px', fontSize: '14px', fontWeight: '500' }}>
                        Category *
                      </label>
                      <select
                        value={reportData.category}
                        onChange={(e) => setReportData({...reportData, category: e.target.value})}
                        style={{
                          width: '100%',
                          padding: '10px 14px',
                          borderRadius: '8px',
                          border: '1px solid ' + theme.borderColor,
                          background: theme.inputBg,
                          color: theme.inputText,
                          fontSize: '14px',
                          outline: 'none',
                          boxSizing: 'border-box',
                        }}
                      >
                        <option>Electronics</option>
                        <option>Books</option>
                        <option>Clothing</option>
                        <option>Accessories</option>
                        <option>Documents</option>
                        <option>Other</option>
                      </select>
                    </div>
                    <div style={{ gridColumn: '1 / -1' }}>
                      <div className="form-group">
                        <label style={{ color: theme.textColor, display: 'block', marginBottom: '6px', fontSize: '14px', fontWeight: '500' }}>
                          Description *
                        </label>
                        <textarea
                          required
                          value={reportData.description}
                          onChange={(e) => setReportData({...reportData, description: e.target.value})}
                          placeholder="Describe the item in detail..."
                          style={{
                            width: '100%',
                            padding: '10px 14px',
                            borderRadius: '8px',
                            border: '1px solid ' + theme.borderColor,
                            background: theme.inputBg,
                            color: theme.inputText,
                            fontSize: '14px',
                            minHeight: '80px',
                            outline: 'none',
                            boxSizing: 'border-box',
                            fontFamily: 'inherit',
                          }}
                        />
                      </div>
                    </div>
                    <div className="form-group">
                      <label style={{ color: theme.textColor, display: 'block', marginBottom: '6px', fontSize: '14px', fontWeight: '500' }}>
                        Location Lost *
                      </label>
                      <input
                        type="text"
                        required
                        value={reportData.location}
                        onChange={(e) => setReportData({...reportData, location: e.target.value})}
                        placeholder="e.g., Library 2nd Floor"
                        style={{
                          width: '100%',
                          padding: '10px 14px',
                          borderRadius: '8px',
                          border: '1px solid ' + theme.borderColor,
                          background: theme.inputBg,
                          color: theme.inputText,
                          fontSize: '14px',
                          outline: 'none',
                          boxSizing: 'border-box',
                        }}
                      />
                    </div>
                    <div className="form-group">
                      <label style={{ color: theme.textColor, display: 'block', marginBottom: '6px', fontSize: '14px', fontWeight: '500' }}>
                        Date Lost *
                      </label>
                      <input
                        type="date"
                        required
                        value={reportData.dateLost}
                        onChange={(e) => setReportData({...reportData, dateLost: e.target.value})}
                        style={{
                          width: '100%',
                          padding: '10px 14px',
                          borderRadius: '8px',
                          border: '1px solid ' + theme.borderColor,
                          background: theme.inputBg,
                          color: theme.inputText,
                          fontSize: '14px',
                          outline: 'none',
                          boxSizing: 'border-box',
                        }}
                      />
                    </div>

                    {reportData.category === 'Electronics' && (
                      <>
                        <div className="form-group">
                          <label style={{ color: theme.textColor, display: 'block', marginBottom: '6px', fontSize: '14px', fontWeight: '500' }}>
                            Serial Number
                          </label>
                          <input
                            type="text"
                            value={reportData.serialNumber}
                            onChange={(e) => setReportData({...reportData, serialNumber: e.target.value})}
                            placeholder="Enter serial number"
                            style={{
                              width: '100%',
                              padding: '10px 14px',
                              borderRadius: '8px',
                              border: '1px solid ' + theme.borderColor,
                              background: theme.inputBg,
                              color: theme.inputText,
                              fontSize: '14px',
                              outline: 'none',
                              boxSizing: 'border-box',
                            }}
                          />
                        </div>
                        <div className="form-group">
                          <label style={{ color: theme.textColor, display: 'block', marginBottom: '6px', fontSize: '14px', fontWeight: '500' }}>
                            Make/Brand
                          </label>
                          <input
                            type="text"
                            value={reportData.make}
                            onChange={(e) => setReportData({...reportData, make: e.target.value})}
                            placeholder="e.g., Nikon, Dell"
                            style={{
                              width: '100%',
                              padding: '10px 14px',
                              borderRadius: '8px',
                              border: '1px solid ' + theme.borderColor,
                              background: theme.inputBg,
                              color: theme.inputText,
                              fontSize: '14px',
                              outline: 'none',
                              boxSizing: 'border-box',
                            }}
                          />
                        </div>
                        <div className="form-group">
                          <label style={{ color: theme.textColor, display: 'block', marginBottom: '6px', fontSize: '14px', fontWeight: '500' }}>
                            Model
                          </label>
                          <input
                            type="text"
                            value={reportData.model}
                            onChange={(e) => setReportData({...reportData, model: e.target.value})}
                            placeholder="e.g., D850, XPS 15"
                            style={{
                              width: '100%',
                              padding: '10px 14px',
                              borderRadius: '8px',
                              border: '1px solid ' + theme.borderColor,
                              background: theme.inputBg,
                              color: theme.inputText,
                              fontSize: '14px',
                              outline: 'none',
                              boxSizing: 'border-box',
                            }}
                          />
                        </div>
                        <div className="form-group">
                          <label style={{ color: theme.textColor, display: 'block', marginBottom: '6px', fontSize: '14px', fontWeight: '500' }}>
                            Type
                          </label>
                          <input
                            type="text"
                            value={reportData.type}
                            onChange={(e) => setReportData({...reportData, type: e.target.value})}
                            placeholder="e.g., Digital/SLR, Laptop"
                            style={{
                              width: '100%',
                              padding: '10px 14px',
                              borderRadius: '8px',
                              border: '1px solid ' + theme.borderColor,
                              background: theme.inputBg,
                              color: theme.inputText,
                              fontSize: '14px',
                              outline: 'none',
                              boxSizing: 'border-box',
                            }}
                          />
                        </div>
                        <div className="form-group">
                          <label style={{ color: theme.textColor, display: 'block', marginBottom: '6px', fontSize: '14px', fontWeight: '500' }}>
                            Resolution/Details
                          </label>
                          <input
                            type="text"
                            value={reportData.resolution}
                            onChange={(e) => setReportData({...reportData, resolution: e.target.value})}
                            placeholder="e.g., 10.1 MP"
                            style={{
                              width: '100%',
                              padding: '10px 14px',
                              borderRadius: '8px',
                              border: '1px solid ' + theme.borderColor,
                              background: theme.inputBg,
                              color: theme.inputText,
                              fontSize: '14px',
                              outline: 'none',
                              boxSizing: 'border-box',
                            }}
                          />
                        </div>
                        <div className="form-group">
                          <label style={{ color: theme.textColor, display: 'block', marginBottom: '6px', fontSize: '14px', fontWeight: '500' }}>
                            Color
                          </label>
                          <input
                            type="text"
                            value={reportData.color}
                            onChange={(e) => setReportData({...reportData, color: e.target.value})}
                            placeholder="e.g., Silver, Black"
                            style={{
                              width: '100%',
                              padding: '10px 14px',
                              borderRadius: '8px',
                              border: '1px solid ' + theme.borderColor,
                              background: theme.inputBg,
                              color: theme.inputText,
                              fontSize: '14px',
                              outline: 'none',
                              boxSizing: 'border-box',
                            }}
                          />
                        </div>
                        <div className="form-group">
                          <label style={{ color: theme.textColor, display: 'block', marginBottom: '6px', fontSize: '14px', fontWeight: '500' }}>
                            IMEI Number
                          </label>
                          <input
                            type="text"
                            value={reportData.imeiNumber}
                            onChange={(e) => setReportData({...reportData, imeiNumber: e.target.value})}
                            placeholder="Enter IMEI number"
                            style={{
                              width: '100%',
                              padding: '10px 14px',
                              borderRadius: '8px',
                              border: '1px solid ' + theme.borderColor,
                              background: theme.inputBg,
                              color: theme.inputText,
                              fontSize: '14px',
                              outline: 'none',
                              boxSizing: 'border-box',
                            }}
                          />
                        </div>
                      </>
                    )}

                    <div className="form-group">
                      <label style={{ color: theme.textColor, display: 'block', marginBottom: '6px', fontSize: '14px', fontWeight: '500' }}>
                        Upload Image
                      </label>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleFileChange}
                        style={{
                          width: '100%',
                          padding: '10px 14px',
                          borderRadius: '8px',
                          border: '1px solid ' + theme.borderColor,
                          background: theme.inputBg,
                          color: theme.inputText,
                          fontSize: '14px',
                          outline: 'none',
                          boxSizing: 'border-box',
                        }}
                      />
                      {imagePreview && (
                        <div style={{ marginTop: '10px' }}>
                          <img src={imagePreview} alt="Preview" style={{ maxWidth: '200px', maxHeight: '200px', borderRadius: '8px' }} />
                        </div>
                      )}
                    </div>
                    <div style={{ gridColumn: '1 / -1' }}>
                      <button type="submit" disabled={saving} style={{
                        width: '100%',
                        padding: '12px',
                        borderRadius: '8px',
                        border: 'none',
                        background: 'linear-gradient(135deg, #dc3545, #c82333)',
                        color: 'white',
                        fontSize: '16px',
                        fontWeight: '600',
                        cursor: saving ? 'not-allowed' : 'pointer',
                        opacity: saving ? 0.7 : 1,
                        transition: 'all 0.3s',
                      }}
                      onMouseEnter={(e) => {
                        if (!saving) {
                          e.target.style.transform = 'scale(1.02)';
                          e.target.style.boxShadow = '0 8px 25px rgba(220,53,69,0.3)';
                        }
                      }}
                      onMouseLeave={(e) => {
                        e.target.style.transform = 'scale(1)';
                        e.target.style.boxShadow = 'none';
                      }}>
                        {saving ? 'Submitting...' : 'Report Lost Item'}
                      </button>
                    </div>
                  </div>
                </form>
              </div>
            )}

            {/* Stats Grid */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              gap: '16px',
              marginBottom: '24px',
            }}>
              <StatCard title="Reported Lost" value={lostItems.length} color="#ff6b6b" />
              <StatCard title="Found Items" value={foundItems.length} color="#51cf66" />
              <StatCard title="Claimed Items" value={claimedItems.length} color="#ffd93d" />
            </div>

            {/* Recently Lost Items */}
            <div style={{
              padding: '20px',
              background: theme.cardBg,
              borderRadius: '12px',
              border: '1px solid ' + theme.borderColor,
              marginBottom: '16px',
            }}>
              <h3 style={{ color: theme.textColor, margin: '0 0 16px 0', fontSize: '18px' }}>Recently Lost Items</h3>
              {lostItems.length === 0 ? (
                <p style={{ color: theme.textSecondary }}>No lost items reported yet.</p>
              ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '16px' }}>
                  {lostItems.slice(0, 6).map((item) => {
                    const imageSrc = getImageSrc(item);
                    return (
                      <div key={item._id} style={{
                        background: 'rgba(255,255,255,0.03)',
                        borderRadius: '12px',
                        border: '1px solid ' + theme.borderColor,
                        overflow: 'hidden',
                        transition: 'all 0.3s ease',
                      }}
                      onMouseEnter={(e) => {
                        e.target.style.transform = 'translateY(-4px)';
                        e.target.style.boxShadow = '0 12px 40px rgba(0,0,0,0.2)';
                      }}
                      onMouseLeave={(e) => {
                        e.target.style.transform = 'translateY(0)';
                        e.target.style.boxShadow = 'none';
                      }}>
                        {imageSrc ? (
                          <div 
                            style={{
                              height: '180px',
                              background: `url(${imageSrc}) center/cover`,
                              cursor: 'pointer',
                              position: 'relative',
                            }}
                            onClick={() => setSelectedImage(imageSrc)}
                          >
                            <div style={{
                              position: 'absolute',
                              top: '10px',
                              right: '10px',
                              padding: '4px 12px',
                              borderRadius: '12px',
                              background: 'rgba(255,107,107,0.9)',
                              color: 'white',
                              fontSize: '11px',
                              fontWeight: '600',
                            }}>
                              LOST
                            </div>
                            <div style={{
                              position: 'absolute',
                              bottom: '10px',
                              right: '10px',
                              padding: '4px 10px',
                              borderRadius: '12px',
                              background: 'rgba(0,0,0,0.6)',
                              color: 'white',
                              fontSize: '11px',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '4px',
                            }}>
                              <Eye size={14} /> View
                            </div>
                          </div>
                        ) : (
                          <div style={{
                            height: '180px',
                            background: 'rgba(255,255,255,0.05)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: theme.textSecondary,
                            fontSize: '14px',
                          }}>
                            No Image Available
                          </div>
                        )}
                        <div style={{ padding: '16px' }}>
                          <h4 style={{ color: theme.textColor, margin: '0 0 4px 0', fontSize: '16px' }}>{item.title}</h4>
                          <p style={{ color: theme.textSecondary, fontSize: '13px', margin: '4px 0' }}>
                            {item.description?.substring(0, 100)}{item.description?.length > 100 ? '...' : ''}
                          </p>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '8px' }}>
                            <span style={{ fontSize: '12px', color: theme.textSecondary }}>
                              📍 {item.location}
                            </span>
                            <span style={{ fontSize: '12px', color: theme.textSecondary }}>
                              {new Date(item.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                          {item.make && (
                            <div style={{ fontSize: '12px', color: theme.textSecondary, marginTop: '4px' }}>
                              {item.make} {item.model}
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Recently Found Items */}
            <div style={{
              padding: '20px',
              background: theme.cardBg,
              borderRadius: '12px',
              border: '1px solid ' + theme.borderColor,
            }}>
              <h3 style={{ color: theme.textColor, margin: '0 0 16px 0', fontSize: '18px' }}>Recently Found Items</h3>
              {foundItems.length === 0 ? (
                <p style={{ color: theme.textSecondary }}>No found items available.</p>
              ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '16px' }}>
                  {foundItems.slice(0, 6).map((item) => {
                    const claimed = isItemClaimed(item);
                    const imageSrc = getImageSrc(item);
                    return (
                      <div key={item._id} style={{
                        background: claimed ? theme.claimedBg : 'rgba(255,255,255,0.03)',
                        borderRadius: '12px',
                        border: claimed ? '2px solid ' + theme.claimedBorder : '1px solid ' + theme.borderColor,
                        overflow: 'hidden',
                        transition: 'all 0.3s ease',
                      }}
                      onMouseEnter={(e) => {
                        e.target.style.transform = 'translateY(-4px)';
                        e.target.style.boxShadow = '0 12px 40px rgba(0,0,0,0.2)';
                      }}
                      onMouseLeave={(e) => {
                        e.target.style.transform = 'translateY(0)';
                        e.target.style.boxShadow = 'none';
                      }}>
                        {imageSrc ? (
                          <div 
                            style={{
                              height: '180px',
                              background: `url(${imageSrc}) center/cover`,
                              cursor: 'pointer',
                              position: 'relative',
                            }}
                            onClick={() => setSelectedImage(imageSrc)}
                          >
                            <div style={{
                              position: 'absolute',
                              top: '10px',
                              right: '10px',
                              padding: '4px 12px',
                              borderRadius: '12px',
                              background: claimed ? 'rgba(81,207,102,0.9)' : 'rgba(81,207,102,0.9)',
                              color: 'white',
                              fontSize: '11px',
                              fontWeight: '600',
                            }}>
                              {claimed ? 'CLAIMED ✓' : 'FOUND'}
                            </div>
                            {claimed && (
                              <div style={{
                                position: 'absolute',
                                top: '10px',
                                left: '10px',
                                padding: '4px 12px',
                                borderRadius: '12px',
                                background: 'rgba(81,207,102,0.9)',
                                color: 'white',
                                fontSize: '11px',
                                fontWeight: '600',
                              }}>
                                <CheckCircle size={14} style={{ display: 'inline', marginRight: '4px' }} />
                                Claimed
                              </div>
                            )}
                            <div style={{
                              position: 'absolute',
                              bottom: '10px',
                              right: '10px',
                              padding: '4px 10px',
                              borderRadius: '12px',
                              background: 'rgba(0,0,0,0.6)',
                              color: 'white',
                              fontSize: '11px',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '4px',
                            }}>
                              <Eye size={14} /> View
                            </div>
                          </div>
                        ) : (
                          <div style={{
                            height: '180px',
                            background: 'rgba(255,255,255,0.05)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: theme.textSecondary,
                            fontSize: '14px',
                          }}>
                            No Image Available
                          </div>
                        )}
                        <div style={{ padding: '16px' }}>
                          <h4 style={{ color: theme.textColor, margin: '0 0 4px 0', fontSize: '16px' }}>{item.title}</h4>
                          <p style={{ color: theme.textSecondary, fontSize: '13px', margin: '4px 0' }}>
                            {item.description?.substring(0, 100)}{item.description?.length > 100 ? '...' : ''}
                          </p>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '8px' }}>
                            <span style={{ fontSize: '12px', color: theme.textSecondary }}>
                              📍 {item.location}
                            </span>
                            <span style={{ fontSize: '12px', color: theme.textSecondary }}>
                              {new Date(item.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                          {item.make && (
                            <div style={{ fontSize: '12px', color: theme.textSecondary, marginTop: '4px' }}>
                              {item.make} {item.model}
                            </div>
                          )}
                          {claimed ? (
                            <button
                              style={{
                                width: '100%',
                                padding: '8px',
                                borderRadius: '6px',
                                border: '2px solid #51cf66',
                                background: 'transparent',
                                color: '#51cf66',
                                fontSize: '14px',
                                cursor: 'not-allowed',
                                marginTop: '10px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '8px',
                              }}
                            >
                              <CheckCircle size={16} /> Already Claimed
                            </button>
                          ) : (
                            <button
                              onClick={() => {
                                setSelectedItem(item);
                                setShowClaimModal(true);
                                setClaimMessage('');
                              }}
                              style={{
                                width: '100%',
                                padding: '8px',
                                borderRadius: '6px',
                                border: 'none',
                                background: 'linear-gradient(135deg, #1a237e, #283593)',
                                color: 'white',
                                fontSize: '14px',
                                cursor: 'pointer',
                                transition: 'all 0.3s',
                                marginTop: '10px',
                              }}
                              onMouseEnter={(e) => {
                                e.target.style.transform = 'scale(1.02)';
                                e.target.style.boxShadow = '0 4px 15px rgba(26,35,126,0.3)';
                              }}
                              onMouseLeave={(e) => {
                                e.target.style.transform = 'scale(1)';
                                e.target.style.boxShadow = 'none';
                              }}
                            >
                              Claim This Item
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Items Tab */}
        {activeTab === 'items' && (
          <div style={{
            padding: '20px',
            background: theme.cardBg,
            borderRadius: '12px',
            border: '1px solid ' + theme.borderColor,
          }}>
            <h3 style={{ color: theme.textColor, margin: '0 0 16px 0' }}>All Items ({items.length})</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '16px' }}>
              {items.length === 0 ? (
                <p style={{ color: theme.textSecondary }}>No items found.</p>
              ) : (
                items.map((item) => {
                  const claimed = isItemClaimed(item);
                  const imageSrc = getImageSrc(item);
                  return (
                    <div key={item._id} style={{
                      background: claimed ? theme.claimedBg : 'rgba(255,255,255,0.03)',
                      borderRadius: '12px',
                      border: claimed ? '2px solid ' + theme.claimedBorder : '1px solid ' + theme.borderColor,
                      overflow: 'hidden',
                      transition: 'all 0.3s ease',
                    }}
                    onMouseEnter={(e) => {
                      e.target.style.transform = 'translateY(-4px)';
                      e.target.style.boxShadow = '0 12px 40px rgba(0,0,0,0.2)';
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.transform = 'translateY(0)';
                      e.target.style.boxShadow = 'none';
                    }}>
                      {imageSrc ? (
                        <div 
                          style={{
                            height: '180px',
                            background: `url(${imageSrc}) center/cover`,
                            cursor: 'pointer',
                            position: 'relative',
                          }}
                          onClick={() => setSelectedImage(imageSrc)}
                        >
                          <div style={{
                            position: 'absolute',
                            top: '10px',
                            right: '10px',
                            padding: '4px 12px',
                            borderRadius: '12px',
                            background: item.status === 'lost' ? 'rgba(255,107,107,0.9)' : 
                                       item.status === 'found' ? 'rgba(81,207,102,0.9)' : 
                                       'rgba(81,207,102,0.9)',
                            color: 'white',
                            fontSize: '11px',
                            fontWeight: '600',
                          }}>
                            {item.status.toUpperCase()}
                            {claimed && ' ✓'}
                          </div>
                          {claimed && (
                            <div style={{
                              position: 'absolute',
                              top: '10px',
                              left: '10px',
                              padding: '4px 12px',
                              borderRadius: '12px',
                              background: 'rgba(81,207,102,0.9)',
                              color: 'white',
                              fontSize: '11px',
                              fontWeight: '600',
                            }}>
                              <CheckCircle size={14} style={{ display: 'inline', marginRight: '4px' }} />
                              Claimed
                            </div>
                          )}
                          <div style={{
                            position: 'absolute',
                            bottom: '10px',
                            right: '10px',
                            padding: '4px 10px',
                            borderRadius: '12px',
                            background: 'rgba(0,0,0,0.6)',
                            color: 'white',
                            fontSize: '11px',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px',
                          }}>
                            <Eye size={14} /> View
                          </div>
                        </div>
                      ) : (
                        <div style={{
                          height: '180px',
                          background: 'rgba(255,255,255,0.05)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: theme.textSecondary,
                          fontSize: '14px',
                        }}>
                          No Image Available
                        </div>
                      )}
                      <div style={{ padding: '16px' }}>
                        <h4 style={{ color: theme.textColor, margin: '0 0 4px 0', fontSize: '16px' }}>{item.title}</h4>
                        <p style={{ color: theme.textSecondary, fontSize: '13px', margin: '4px 0' }}>
                          {item.description?.substring(0, 100)}{item.description?.length > 100 ? '...' : ''}
                        </p>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '8px' }}>
                          <span style={{ fontSize: '12px', color: theme.textSecondary }}>
                            📍 {item.location}
                          </span>
                          <span style={{ fontSize: '12px', color: theme.textSecondary }}>
                            🆔 {item.itemId}
                          </span>
                        </div>
                        <div style={{ display: 'flex', gap: '8px', marginTop: '8px', flexWrap: 'wrap' }}>
                          <span style={{
                            padding: '2px 10px',
                            borderRadius: '12px',
                            fontSize: '11px',
                            fontWeight: '600',
                            background: item.status === 'lost' ? '#ff6b6b20' : 
                                       item.status === 'found' ? '#51cf6620' : '#51cf6620',
                            color: item.status === 'lost' ? '#ff6b6b' : 
                                  item.status === 'found' ? '#51cf66' : '#51cf66',
                            border: '1px solid ' + (item.status === 'lost' ? '#ff6b6b40' : 
                                  item.status === 'found' ? '#51cf6640' : '#51cf6640'),
                          }}>
                            {item.status.toUpperCase()}
                            {claimed && ' ✓'}
                          </span>
                          {item.category && (
                            <span style={{
                              padding: '2px 10px',
                              borderRadius: '12px',
                              fontSize: '11px',
                              fontWeight: '600',
                              background: 'rgba(79,195,247,0.2)',
                              color: '#4fc3f7',
                              border: '1px solid rgba(79,195,247,0.4)',
                            }}>
                              {item.category}
                            </span>
                          )}
                        </div>
                        {claimed && (
                          <div style={{
                            marginTop: '8px',
                            padding: '6px 10px',
                            borderRadius: '6px',
                            background: 'rgba(81,207,102,0.15)',
                            color: '#51cf66',
                            fontSize: '12px',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px',
                          }}>
                            <CheckCircle size={14} /> This item has been claimed
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}

        {/* Reports Tab */}
        {activeTab === 'reports' && (
          <div>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              gap: '16px',
              marginBottom: '24px',
            }}>
              <div style={{
                padding: '16px 20px',
                background: theme.cardBg,
                borderRadius: '12px',
                border: '1px solid ' + theme.borderColor,
              }}>
                <div style={{ fontSize: '28px', fontWeight: '700', color: theme.textColor }}>{items.length}</div>
                <div style={{ fontSize: '14px', color: theme.textSecondary }}>Total Items</div>
              </div>
              <div style={{
                padding: '16px 20px',
                background: theme.cardBg,
                borderRadius: '12px',
                border: '1px solid ' + theme.borderColor,
              }}>
                <div style={{ fontSize: '28px', fontWeight: '700', color: '#ff6b6b' }}>{lostItems.length}</div>
                <div style={{ fontSize: '14px', color: theme.textSecondary }}>Lost Items</div>
              </div>
              <div style={{
                padding: '16px 20px',
                background: theme.cardBg,
                borderRadius: '12px',
                border: '1px solid ' + theme.borderColor,
              }}>
                <div style={{ fontSize: '28px', fontWeight: '700', color: '#51cf66' }}>{foundItems.length}</div>
                <div style={{ fontSize: '14px', color: theme.textSecondary }}>Found Items</div>
              </div>
            </div>

            <Charts items={items} isDarkMode={isDarkMode} />
          </div>
        )}

        {/* Settings Tab */}
        {activeTab === 'settings' && (
          <div>
            <div style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '24px',
            }}>
              <div style={{
                padding: '24px',
                background: theme.cardBg,
                borderRadius: '12px',
                border: '1px solid ' + theme.borderColor,
              }}>
                <h3 style={{ color: theme.textColor, margin: '0 0 20px 0', fontSize: '18px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <User size={20} /> Profile Information
                </h3>

                {profileMessage && (
                  <div style={{
                    padding: '10px 16px',
                    borderRadius: '8px',
                    marginBottom: '16px',
                    background: profileMessage.includes('✅') ? 'rgba(40,167,69,0.15)' : 'rgba(220,53,69,0.15)',
                    color: profileMessage.includes('✅') ? '#28a745' : '#dc3545',
                    border: '1px solid ' + (profileMessage.includes('✅') ? 'rgba(40,167,69,0.2)' : 'rgba(220,53,69,0.2)'),
                  }}>
                    {profileMessage}
                  </div>
                )}

                <form onSubmit={handleProfileUpdate}>
                  <div className="form-group" style={{ marginBottom: '16px' }}>
                    <label style={{ color: theme.textColor, display: 'block', marginBottom: '6px', fontSize: '14px', fontWeight: '500' }}>
                      <User size={16} style={{ display: 'inline', marginRight: '6px' }} /> Full Name
                    </label>
                    <input
                      type="text"
                      value={profile.name}
                      onChange={(e) => setProfile({...profile, name: e.target.value})}
                      required
                      style={{
                        width: '100%',
                        padding: '10px 14px',
                        borderRadius: '8px',
                        border: '1px solid ' + theme.borderColor,
                        background: theme.inputBg,
                        color: theme.inputText,
                        fontSize: '14px',
                        outline: 'none',
                        boxSizing: 'border-box',
                      }}
                    />
                  </div>

                  <div className="form-group" style={{ marginBottom: '16px' }}>
                    <label style={{ color: theme.textColor, display: 'block', marginBottom: '6px', fontSize: '14px', fontWeight: '500' }}>
                      <Mail size={16} style={{ display: 'inline', marginRight: '6px' }} /> Email Address
                    </label>
                    <input
                      type="email"
                      value={profile.email}
                      onChange={(e) => setProfile({...profile, email: e.target.value})}
                      required
                      style={{
                        width: '100%',
                        padding: '10px 14px',
                        borderRadius: '8px',
                        border: '1px solid ' + theme.borderColor,
                        background: theme.inputBg,
                        color: theme.inputText,
                        fontSize: '14px',
                        outline: 'none',
                        boxSizing: 'border-box',
                      }}
                    />
                  </div>

                  <div className="form-group" style={{ marginBottom: '16px' }}>
                    <label style={{ color: theme.textColor, display: 'block', marginBottom: '6px', fontSize: '14px', fontWeight: '500' }}>
                      <Phone size={16} style={{ display: 'inline', marginRight: '6px' }} /> Phone Number
                    </label>
                    <input
                      type="tel"
                      value={profile.phone}
                      onChange={(e) => setProfile({...profile, phone: e.target.value})}
                      placeholder="Enter phone number"
                      style={{
                        width: '100%',
                        padding: '10px 14px',
                        borderRadius: '8px',
                        border: '1px solid ' + theme.borderColor,
                        background: theme.inputBg,
                        color: theme.inputText,
                        fontSize: '14px',
                        outline: 'none',
                        boxSizing: 'border-box',
                      }}
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={saving}
                    style={{
                      width: '100%',
                      padding: '12px',
                      borderRadius: '8px',
                      border: 'none',
                      background: 'linear-gradient(135deg, #1a237e, #283593)',
                      color: 'white',
                      fontSize: '16px',
                      fontWeight: '600',
                      cursor: saving ? 'not-allowed' : 'pointer',
                      opacity: saving ? 0.7 : 1,
                      transition: 'all 0.3s',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px',
                    }}
                    onMouseEnter={(e) => {
                      if (!saving) {
                        e.target.style.transform = 'scale(1.02)';
                        e.target.style.boxShadow = '0 8px 25px rgba(26,35,126,0.3)';
                      }
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.transform = 'scale(1)';
                      e.target.style.boxShadow = 'none';
                    }}
                  >
                    <Save size={18} /> {saving ? 'Saving...' : 'Update Profile'}
                  </button>
                </form>
              </div>

              <div style={{
                padding: '24px',
                background: theme.cardBg,
                borderRadius: '12px',
                border: '1px solid ' + theme.borderColor,
              }}>
                <h3 style={{ color: theme.textColor, margin: '0 0 20px 0', fontSize: '18px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <Lock size={20} /> Change Password
                </h3>

                {passwordMessage && (
                  <div style={{
                    padding: '10px 16px',
                    borderRadius: '8px',
                    marginBottom: '16px',
                    background: passwordMessage.includes('✅') ? 'rgba(40,167,69,0.15)' : 'rgba(220,53,69,0.15)',
                    color: passwordMessage.includes('✅') ? '#28a745' : '#dc3545',
                    border: '1px solid ' + (passwordMessage.includes('✅') ? 'rgba(40,167,69,0.2)' : 'rgba(220,53,69,0.2)'),
                  }}>
                    {passwordMessage}
                  </div>
                )}

                <form onSubmit={handlePasswordUpdate}>
                  <div className="form-group" style={{ marginBottom: '16px' }}>
                    <label style={{ color: theme.textColor, display: 'block', marginBottom: '6px', fontSize: '14px', fontWeight: '500' }}>
                      Current Password *
                    </label>
                    <input
                      type="password"
                      value={passwordData.currentPassword}
                      onChange={(e) => setPasswordData({...passwordData, currentPassword: e.target.value})}
                      required
                      placeholder="Enter current password"
                      style={{
                        width: '100%',
                        padding: '10px 14px',
                        borderRadius: '8px',
                        border: '1px solid ' + theme.borderColor,
                        background: theme.inputBg,
                        color: theme.inputText,
                        fontSize: '14px',
                        outline: 'none',
                        boxSizing: 'border-box',
                      }}
                    />
                  </div>

                  <div className="form-group" style={{ marginBottom: '16px' }}>
                    <label style={{ color: theme.textColor, display: 'block', marginBottom: '6px', fontSize: '14px', fontWeight: '500' }}>
                      New Password *
                    </label>
                    <input
                      type="password"
                      value={passwordData.newPassword}
                      onChange={(e) => setPasswordData({...passwordData, newPassword: e.target.value})}
                      required
                      placeholder="Enter new password (min 6 characters)"
                      style={{
                        width: '100%',
                        padding: '10px 14px',
                        borderRadius: '8px',
                        border: '1px solid ' + theme.borderColor,
                        background: theme.inputBg,
                        color: theme.inputText,
                        fontSize: '14px',
                        outline: 'none',
                        boxSizing: 'border-box',
                      }}
                    />
                  </div>

                  <div className="form-group" style={{ marginBottom: '20px' }}>
                    <label style={{ color: theme.textColor, display: 'block', marginBottom: '6px', fontSize: '14px', fontWeight: '500' }}>
                      Confirm New Password *
                    </label>
                    <input
                      type="password"
                      value={passwordData.confirmPassword}
                      onChange={(e) => setPasswordData({...passwordData, confirmPassword: e.target.value})}
                      required
                      placeholder="Confirm new password"
                      style={{
                        width: '100%',
                        padding: '10px 14px',
                        borderRadius: '8px',
                        border: '1px solid ' + theme.borderColor,
                        background: theme.inputBg,
                        color: theme.inputText,
                        fontSize: '14px',
                        outline: 'none',
                        boxSizing: 'border-box',
                      }}
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={saving}
                    style={{
                      width: '100%',
                      padding: '12px',
                      borderRadius: '8px',
                      border: 'none',
                      background: 'linear-gradient(135deg, #dc3545, #c82333)',
                      color: 'white',
                      fontSize: '16px',
                      fontWeight: '600',
                      cursor: saving ? 'not-allowed' : 'pointer',
                      opacity: saving ? 0.7 : 1,
                      transition: 'all 0.3s',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px',
                    }}
                    onMouseEnter={(e) => {
                      if (!saving) {
                        e.target.style.transform = 'scale(1.02)';
                        e.target.style.boxShadow = '0 8px 25px rgba(220,53,69,0.3)';
                      }
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.transform = 'scale(1)';
                      e.target.style.boxShadow = 'none';
                    }}
                  >
                    <Lock size={18} /> {saving ? 'Updating...' : 'Change Password'}
                  </button>
                </form>
              </div>
            </div>
          </div>
        )}

        {/* Claim Modal */}
        {showClaimModal && selectedItem && (
          <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0,0,0,0.6)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            backdropFilter: 'blur(4px)',
          }}>
            <div style={{
              background: theme.cardBg,
              borderRadius: '16px',
              padding: '30px',
              maxWidth: '500px',
              width: '90%',
              border: '1px solid ' + theme.borderColor,
            }}>
              <h3 style={{ color: theme.textColor, marginTop: 0 }}>Claim Item</h3>
              {selectedItem.imageData && (
                <img 
                  src={`data:image/jpeg;base64,${selectedItem.imageData}`} 
                  alt={selectedItem.title} 
                  style={{ 
                    width: '100%', 
                    maxHeight: '200px', 
                    objectFit: 'cover', 
                    borderRadius: '8px',
                    marginBottom: '12px'
                  }} 
                />
              )}
              <p style={{ color: theme.textSecondary }}>
                <strong>Item:</strong> {selectedItem.title} ({selectedItem.itemId})
              </p>
              <p style={{ color: theme.textSecondary }}>
                <strong>Location:</strong> {selectedItem.location}
              </p>
              <p style={{ color: theme.textSecondary }}>
                <strong>Description:</strong> {selectedItem.description}
              </p>
              <div className="form-group">
                <label style={{ color: theme.textColor, display: 'block', marginBottom: '6px', fontSize: '14px', fontWeight: '500' }}>
                  Reason for Claim *
                </label>
                <textarea
                  value={claimMessage}
                  onChange={(e) => setClaimMessage(e.target.value)}
                  placeholder="Explain why this item belongs to you..."
                  style={{
                    width: '100%',
                    padding: '12px',
                    borderRadius: '8px',
                    border: '1px solid ' + theme.borderColor,
                    background: theme.inputBg,
                    color: theme.inputText,
                    minHeight: '100px',
                    fontSize: '14px',
                    boxSizing: 'border-box',
                    fontFamily: 'inherit',
                  }}
                  required
                />
              </div>
              <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
                <button
                  onClick={handleClaimSubmit}
                  style={{
                    flex: 1,
                    padding: '12px',
                    borderRadius: '8px',
                    border: 'none',
                    background: 'linear-gradient(135deg, #1a237e, #283593)',
                    color: 'white',
                    fontWeight: '600',
                    cursor: 'pointer',
                    transition: 'all 0.3s',
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.transform = 'scale(1.05)';
                    e.target.style.boxShadow = '0 8px 25px rgba(26,35,126,0.3)';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.transform = 'scale(1)';
                    e.target.style.boxShadow = 'none';
                  }}
                >
                  Submit Claim
                </button>
                <button
                  onClick={() => {
                    setShowClaimModal(false);
                    setSelectedItem(null);
                    setClaimMessage('');
                  }}
                  style={{
                    flex: 1,
                    padding: '12px',
                    borderRadius: '8px',
                    border: '1px solid ' + theme.borderColor,
                    background: 'transparent',
                    color: theme.textSecondary,
                    fontWeight: '600',
                    cursor: 'pointer',
                    transition: 'all 0.3s',
                  }}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      <style>
        {`
          .grid-2 {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 16px;
          }
          .form-group {
            margin-bottom: 16px;
          }
          .form-group label {
            display: block;
            margin-bottom: 6px;
            font-weight: 500;
            font-size: 14px;
          }
          @media (max-width: 768px) {
            .grid-2 {
              grid-template-columns: 1fr;
            }
            div[style*="margin-left: 240px"] {
              margin-left: 0 !important;
              padding: 16px !important;
            }
            div[style*="width: 240px"] {
              display: none !important;
            }
          }
        `}
      </style>
    </div>
  );
}

export default StudentDashboard;
