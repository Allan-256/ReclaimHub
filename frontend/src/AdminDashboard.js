import React, { useState, useEffect } from 'react';
import {
  getItems,
  createItem,
  deleteItem,
  getStats,
  getUsers,
  getNotifications,
  markNotificationRead,
  getUnreadCount,
  getAllClaims,
  approveClaim,
  rejectClaim,
} from './api';
import ImageModal from './ImageModal';

function AdminDashboard({ user, onLogout }) {
  const [items, setItems] = useState([]);
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [claims, setClaims] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showForm, setShowForm] = useState(false);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [showResponseModal, setShowResponseModal] = useState(false);
  const [selectedClaim, setSelectedClaim] = useState(null);
  const [responseMessage, setResponseMessage] = useState('');
  const [responseAction, setResponseAction] = useState('');
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'Electronics',
    location: '',
    dateFound: new Date().toISOString().split('T')[0],
    status: 'found',
    image: null,
  });
  const [message, setMessage] = useState('');

  useEffect(() => {
    loadData();
    loadNotifications();
    const interval = setInterval(loadNotifications, 30000);
    return () => clearInterval(interval);
  }, []);

  const loadData = async () => {
    try {
      const [itemsRes, statsRes, usersRes, claimsRes] = await Promise.all([
        getItems(),
        getStats(),
        getUsers(),
        getAllClaims(),
      ]);
      setItems(itemsRes.data.items || []);
      setStats(statsRes.data.stats);
      setUsers(usersRes.data.users || []);
      setClaims(claimsRes.data.claims || []);
    } catch (error) {
      console.error('Error loading data:', error);
    }
  };

  const loadNotifications = async () => {
    try {
      const [notifsRes, countRes] = await Promise.all([
        getNotifications(),
        getUnreadCount(),
      ]);
      setNotifications(notifsRes.data.notifications || []);
      setUnreadCount(countRes.data.count || 0);
    } catch (error) {
      console.error('Error loading notifications:', error);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData({ ...formData, image: file });
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const data = new FormData();
    data.append('title', formData.title);
    data.append('description', formData.description);
    data.append('category', formData.category);
    data.append('location', formData.location);
    data.append('dateFound', formData.dateFound);
    data.append('status', 'found');
    if (formData.image) {
      data.append('image', formData.image);
    }

    try {
      await createItem(data);
      setMessage('✅ Item posted successfully!');
      setShowForm(false);
      setFormData({
        title: '',
        description: '',
        category: 'Electronics',
        location: '',
        dateFound: new Date().toISOString().split('T')[0],
        status: 'found',
        image: null,
      });
      setImagePreview(null);
      loadData();
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      setMessage('❌ Error posting item: ' + (error.response?.data?.message || error.message));
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this item?')) return;
    try {
      await deleteItem(id);
      setMessage('✅ Item deleted!');
      loadData();
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      setMessage('❌ Error deleting item');
    }
  };

  const openResponseModal = (claim, action) => {
    setSelectedClaim(claim);
    setResponseAction(action);
    setResponseMessage('');
    setShowResponseModal(true);
  };

  const handleSendResponse = async () => {
    if (!responseMessage.trim()) {
      setMessage('❌ Please enter a response message');
      return;
    }

    try {
      if (responseAction === 'approve') {
        await approveClaim(selectedClaim._id, responseMessage);
        setMessage('✅ Claim approved and response sent!');
      } else {
        await rejectClaim(selectedClaim._id, responseMessage);
        setMessage('✅ Claim rejected and response sent!');
      }
      setShowResponseModal(false);
      setSelectedClaim(null);
      setResponseMessage('');
      loadData();
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      setMessage('❌ Error processing claim: ' + (error.response?.data?.message || error.message));
    }
  };

  const markAsRead = async (id) => {
    try {
      await markNotificationRead(id);
      loadNotifications();
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'lost': return '#ff6b6b';
      case 'found': return '#51cf66';
      case 'claimed': return '#ffd93d';
      default: return '#666';
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      backgroundImage: `url('/images/background.jpg')`,
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      backgroundRepeat: 'no-repeat',
      backgroundAttachment: 'fixed',
      padding: '20px',
    }}>
      {selectedImage && (
        <ImageModal 
          imageUrl={selectedImage} 
          alt="Item image" 
          onClose={() => setSelectedImage(null)} 
        />
      )}

      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'rgba(0, 0, 0, 0.4)',
        zIndex: 0,
      }} />

      <div style={{ position: 'relative', zIndex: 1, maxWidth: '1200px', margin: '0 auto' }}>
        {/* Header */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '20px 30px',
          background: 'rgba(255,255,255,0.12)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          borderRadius: '16px',
          border: '1px solid rgba(255,255,255,0.15)',
          marginBottom: '24px',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
            <div style={{
              width: '45px',
              height: '45px',
              borderRadius: '50%',
              overflow: 'hidden',
              border: '2px solid rgba(255,255,255,0.3)',
              background: 'rgba(255,255,255,0.1)',
            }}>
              <img 
                src="/images/logo.jpeg" 
                alt="Cavendish" 
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                }}
                onError={(e) => {
                  e.target.style.display = 'none';
                  e.target.parentElement.innerHTML = '<span style="font-size: 20px; font-weight: 800; color: white; display: flex; align-items: center; justify-content: center; height: 100%;">CU</span>';
                }}
              />
            </div>
            <div>
              <h1 style={{ color: 'white', margin: 0, fontSize: '24px', textShadow: '0 2px 10px rgba(0,0,0,0.2)' }}>👑 ReclaimHub Admin</h1>
              <p style={{ color: 'rgba(255,255,255,0.8)', margin: 0, fontSize: '14px' }}>
                Welcome, {user?.name}
              </p>
            </div>
          </div>
          <div>
            <button
              onClick={() => setShowForm(!showForm)}
              style={{
                marginRight: '10px',
                padding: '10px 24px',
                borderRadius: '10px',
                border: '1px solid rgba(255,255,255,0.2)',
                background: 'rgba(40,167,69,0.3)',
                color: 'white',
                fontWeight: '600',
                cursor: 'pointer',
                backdropFilter: 'blur(10px)',
                transition: 'all 0.3s',
              }}
              onMouseEnter={(e) => e.target.style.background = 'rgba(40,167,69,0.5)'}
              onMouseLeave={(e) => e.target.style.background = 'rgba(40,167,69,0.3)'}
            >
              {showForm ? '✕ Close' : '➕ Post Found Item'}
            </button>
            <button
              onClick={onLogout}
              style={{
                padding: '10px 24px',
                borderRadius: '10px',
                border: '1px solid rgba(255,255,255,0.2)',
                background: 'rgba(220,53,69,0.3)',
                color: 'white',
                fontWeight: '600',
                cursor: 'pointer',
                backdropFilter: 'blur(10px)',
                transition: 'all 0.3s',
              }}
              onMouseEnter={(e) => e.target.style.background = 'rgba(220,53,69,0.5)'}
              onMouseLeave={(e) => e.target.style.background = 'rgba(220,53,69,0.3)'}
            >
              🚪 Logout
            </button>
          </div>
        </div>

        {message && (
          <div className={`alert ${message.includes('✅') ? 'alert-success' : 'alert-error'}`} style={{
            padding: '12px 20px',
            borderRadius: '10px',
            marginBottom: '16px',
            background: message.includes('✅') ? 'rgba(40,167,69,0.2)' : 'rgba(220,53,69,0.2)',
            color: message.includes('✅') ? '#d4edda' : '#f8d7da',
            border: message.includes('✅') ? '1px solid rgba(40,167,69,0.3)' : '1px solid rgba(220,53,69,0.3)',
          }}>
            {message}
          </div>
        )}

        {/* Tab Navigation */}
        <div style={{
          display: 'flex',
          gap: '10px',
          marginBottom: '24px',
          flexWrap: 'wrap',
          padding: '12px 20px',
          background: 'rgba(255,255,255,0.08)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          borderRadius: '16px',
          border: '1px solid rgba(255,255,255,0.1)',
        }}>
          {['dashboard', 'items', 'claims', 'users', 'notifications'].map(tab => (
            <button
              key={tab}
              style={{
                padding: '10px 24px',
                borderRadius: '10px',
                border: '1px solid rgba(255,255,255,0.15)',
                background: activeTab === tab ? 'rgba(255,255,255,0.2)' : 'rgba(255,255,255,0.05)',
                color: activeTab === tab ? 'white' : 'rgba(255,255,255,0.7)',
                fontWeight: activeTab === tab ? '700' : '500',
                cursor: 'pointer',
                textTransform: 'capitalize',
                transition: 'all 0.3s',
                fontSize: '14px',
                backdropFilter: 'blur(10px)',
              }}
              onMouseEnter={(e) => {
                if (activeTab !== tab) {
                  e.target.style.background = 'rgba(255,255,255,0.15)';
                  e.target.style.color = 'white';
                }
              }}
              onMouseLeave={(e) => {
                if (activeTab !== tab) {
                  e.target.style.background = 'rgba(255,255,255,0.05)';
                  e.target.style.color = 'rgba(255,255,255,0.7)';
                }
              }}
              onClick={() => setActiveTab(tab)}
            >
              {tab}
              {tab === 'notifications' && unreadCount > 0 && (
                <span style={{
                  background: '#dc3545',
                  color: 'white',
                  borderRadius: '50%',
                  padding: '2px 8px',
                  marginLeft: '6px',
                  fontSize: '11px',
                }}>
                  {unreadCount}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Response Modal */}
        {showResponseModal && selectedClaim && (
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
            backdropFilter: 'blur(5px)',
          }}>
            <div style={{
              background: 'rgba(255,255,255,0.15)',
              backdropFilter: 'blur(25px)',
              WebkitBackdropFilter: 'blur(25px)',
              borderRadius: '16px',
              padding: '30px',
              maxWidth: '500px',
              width: '90%',
              border: '1px solid rgba(255,255,255,0.15)',
            }}>
              <h3 style={{ color: 'white', marginTop: 0 }}>
                {responseAction === 'approve' ? '✅ Approve Claim' : '❌ Reject Claim'}
              </h3>
              <p style={{ color: 'rgba(255,255,255,0.8)' }}>
                <strong>Claimant:</strong> {selectedClaim.claimant?.name} ({selectedClaim.claimant?.studentId})
              </p>
              <p style={{ color: 'rgba(255,255,255,0.8)' }}>
                <strong>Item:</strong> {selectedClaim.item?.title} ({selectedClaim.item?.itemId})
              </p>
              <p style={{ color: 'rgba(255,255,255,0.7)' }}>
                <strong>Claim Message:</strong> {selectedClaim.message}
              </p>
              <div className="form-group">
                <label style={{ color: 'rgba(255,255,255,0.9)' }}>Response Message to Student *</label>
                <textarea
                  value={responseMessage}
                  onChange={(e) => setResponseMessage(e.target.value)}
                  placeholder={`Type your response to ${selectedClaim.claimant?.name}...`}
                  style={{
                    width: '100%',
                    padding: '12px',
                    borderRadius: '10px',
                    border: '1px solid rgba(255,255,255,0.2)',
                    background: 'rgba(255,255,255,0.1)',
                    color: 'white',
                    minHeight: '100px',
                    fontSize: '14px',
                    boxSizing: 'border-box',
                    fontFamily: 'inherit',
                  }}
                  onFocus={(e) => e.target.style.borderColor = 'rgba(255,255,255,0.5)'}
                  onBlur={(e) => e.target.style.borderColor = 'rgba(255,255,255,0.2)'}
                  required
                />
              </div>
              <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
                <button
                  onClick={handleSendResponse}
                  style={{
                    flex: 1,
                    padding: '12px',
                    borderRadius: '10px',
                    border: '1px solid rgba(255,255,255,0.2)',
                    background: 'rgba(26, 35, 126, 0.4)',
                    color: 'white',
                    fontWeight: '600',
                    cursor: 'pointer',
                    transition: 'all 0.3s',
                  }}
                  onMouseEnter={(e) => e.target.style.background = 'rgba(26, 35, 126, 0.6)'}
                  onMouseLeave={(e) => e.target.style.background = 'rgba(26, 35, 126, 0.4)'}
                >
                  Send Response
                </button>
                <button
                  onClick={() => {
                    setShowResponseModal(false);
                    setSelectedClaim(null);
                    setResponseMessage('');
                  }}
                  style={{
                    flex: 1,
                    padding: '12px',
                    borderRadius: '10px',
                    border: '1px solid rgba(255,255,255,0.15)',
                    background: 'rgba(255,255,255,0.05)',
                    color: 'rgba(255,255,255,0.7)',
                    fontWeight: '600',
                    cursor: 'pointer',
                    transition: 'all 0.3s',
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.background = 'rgba(255,255,255,0.15)';
                    e.target.style.color = 'white';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.background = 'rgba(255,255,255,0.05)';
                    e.target.style.color = 'rgba(255,255,255,0.7)';
                  }}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Post Form */}
        {showForm && (
          <div style={{
            padding: '24px',
            background: 'rgba(255,255,255,0.1)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            borderRadius: '16px',
            border: '1px solid rgba(255,255,255,0.15)',
            marginBottom: '24px',
          }}>
            <h3 style={{ color: 'white', marginTop: 0, textShadow: '0 2px 10px rgba(0,0,0,0.2)' }}>📝 Post Found Item</h3>
            <form onSubmit={handleSubmit}>
              <div className="grid-2">
                <div className="form-group">
                  <label style={{ color: 'rgba(255,255,255,0.9)' }}>Title *</label>
                  <input
                    type="text"
                    required
                    value={formData.title}
                    onChange={(e) => setFormData({...formData, title: e.target.value})}
                    placeholder="e.g., Black Laptop Found"
                    style={{
                      width: '100%',
                      padding: '10px 14px',
                      borderRadius: '10px',
                      border: '1px solid rgba(255,255,255,0.2)',
                      background: 'rgba(255,255,255,0.1)',
                      color: 'white',
                      fontSize: '14px',
                      outline: 'none',
                      boxSizing: 'border-box',
                    }}
                  />
                </div>
                <div className="form-group">
                  <label style={{ color: 'rgba(255,255,255,0.9)' }}>Category *</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({...formData, category: e.target.value})}
                    style={{
                      width: '100%',
                      padding: '10px 14px',
                      borderRadius: '10px',
                      border: '1px solid rgba(255,255,255,0.2)',
                      background: 'rgba(255,255,255,0.1)',
                      color: 'white',
                      fontSize: '14px',
                      outline: 'none',
                      boxSizing: 'border-box',
                    }}
                  >
                    <option style={{ background: '#1a237e' }}>Electronics</option>
                    <option style={{ background: '#1a237e' }}>Books</option>
                    <option style={{ background: '#1a237e' }}>Clothing</option>
                    <option style={{ background: '#1a237e' }}>Accessories</option>
                    <option style={{ background: '#1a237e' }}>Documents</option>
                    <option style={{ background: '#1a237e' }}>Other</option>
                  </select>
                </div>
                <div style={{ gridColumn: '1 / -1' }}>
                  <div className="form-group">
                    <label style={{ color: 'rgba(255,255,255,0.9)' }}>Description *</label>
                    <textarea
                      required
                      value={formData.description}
                      onChange={(e) => setFormData({...formData, description: e.target.value})}
                      placeholder="Describe the item in detail..."
                      style={{
                        width: '100%',
                        padding: '10px 14px',
                        borderRadius: '10px',
                        border: '1px solid rgba(255,255,255,0.2)',
                        background: 'rgba(255,255,255,0.1)',
                        color: 'white',
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
                  <label style={{ color: 'rgba(255,255,255,0.9)' }}>Location *</label>
                  <input
                    type="text"
                    required
                    value={formData.location}
                    onChange={(e) => setFormData({...formData, location: e.target.value})}
                    placeholder="e.g., Library 2nd Floor"
                    style={{
                      width: '100%',
                      padding: '10px 14px',
                      borderRadius: '10px',
                      border: '1px solid rgba(255,255,255,0.2)',
                      background: 'rgba(255,255,255,0.1)',
                      color: 'white',
                      fontSize: '14px',
                      outline: 'none',
                      boxSizing: 'border-box',
                    }}
                  />
                </div>
                <div className="form-group">
                  <label style={{ color: 'rgba(255,255,255,0.9)' }}>Date Found *</label>
                  <input
                    type="date"
                    required
                    value={formData.dateFound}
                    onChange={(e) => setFormData({...formData, dateFound: e.target.value})}
                    style={{
                      width: '100%',
                      padding: '10px 14px',
                      borderRadius: '10px',
                      border: '1px solid rgba(255,255,255,0.2)',
                      background: 'rgba(255,255,255,0.1)',
                      color: 'white',
                      fontSize: '14px',
                      outline: 'none',
                      boxSizing: 'border-box',
                    }}
                  />
                </div>
                <div className="form-group">
                  <label style={{ color: 'rgba(255,255,255,0.9)' }}>Upload Image</label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    style={{
                      width: '100%',
                      padding: '10px 14px',
                      borderRadius: '10px',
                      border: '1px solid rgba(255,255,255,0.2)',
                      background: 'rgba(255,255,255,0.1)',
                      color: 'white',
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
                  <button type="submit" style={{
                    width: '100%',
                    padding: '12px',
                    borderRadius: '10px',
                    border: '1px solid rgba(255,255,255,0.2)',
                    background: 'rgba(26, 35, 126, 0.4)',
                    color: 'white',
                    fontSize: '16px',
                    fontWeight: '600',
                    cursor: 'pointer',
                    letterSpacing: '1px',
                    transition: 'all 0.3s',
                  }}
                  onMouseEnter={(e) => e.target.style.background = 'rgba(26, 35, 126, 0.6)'}
                  onMouseLeave={(e) => e.target.style.background = 'rgba(26, 35, 126, 0.4)'}
                  >
                    ✅ Post Found Item
                  </button>
                </div>
              </div>
            </form>
          </div>
        )}

        {/* Dashboard Tab */}
        {activeTab === 'dashboard' && stats && (
          <div>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(4, 1fr)',
              gap: '16px',
              marginBottom: '24px',
            }}>
              <div style={{
                padding: '20px',
                textAlign: 'center',
                background: 'rgba(255,255,255,0.08)',
                backdropFilter: 'blur(20px)',
                WebkitBackdropFilter: 'blur(20px)',
                borderRadius: '16px',
                border: '1px solid rgba(255,255,255,0.1)',
                transition: 'transform 0.3s',
                cursor: 'pointer',
              }}
              onMouseEnter={(e) => e.target.style.transform = 'translateY(-5px)'}
              onMouseLeave={(e) => e.target.style.transform = 'translateY(0)'}>
                <h2 style={{ color: 'white', margin: 0, fontSize: '36px', textShadow: '0 2px 10px rgba(0,0,0,0.2)' }}>{stats.totalItems}</h2>
                <p style={{ color: 'rgba(255,255,255,0.7)', margin: 0, fontSize: '14px' }}>Total Items</p>
              </div>
              <div style={{
                padding: '20px',
                textAlign: 'center',
                background: 'rgba(255,255,255,0.08)',
                backdropFilter: 'blur(20px)',
                WebkitBackdropFilter: 'blur(20px)',
                borderRadius: '16px',
                border: '1px solid rgba(255,255,255,0.1)',
                transition: 'transform 0.3s',
                cursor: 'pointer',
              }}
              onMouseEnter={(e) => e.target.style.transform = 'translateY(-5px)'}
              onMouseLeave={(e) => e.target.style.transform = 'translateY(0)'}>
                <h2 style={{ color: '#ff6b6b', margin: 0, fontSize: '36px', textShadow: '0 2px 10px rgba(0,0,0,0.2)' }}>{stats.lostItems}</h2>
                <p style={{ color: 'rgba(255,255,255,0.7)', margin: 0, fontSize: '14px' }}>Lost</p>
              </div>
              <div style={{
                padding: '20px',
                textAlign: 'center',
                background: 'rgba(255,255,255,0.08)',
                backdropFilter: 'blur(20px)',
                WebkitBackdropFilter: 'blur(20px)',
                borderRadius: '16px',
                border: '1px solid rgba(255,255,255,0.1)',
                transition: 'transform 0.3s',
                cursor: 'pointer',
              }}
              onMouseEnter={(e) => e.target.style.transform = 'translateY(-5px)'}
              onMouseLeave={(e) => e.target.style.transform = 'translateY(0)'}>
                <h2 style={{ color: '#51cf66', margin: 0, fontSize: '36px', textShadow: '0 2px 10px rgba(0,0,0,0.2)' }}>{stats.foundItems}</h2>
                <p style={{ color: 'rgba(255,255,255,0.7)', margin: 0, fontSize: '14px' }}>Found</p>
              </div>
              <div style={{
                padding: '20px',
                textAlign: 'center',
                background: 'rgba(255,255,255,0.08)',
                backdropFilter: 'blur(20px)',
                WebkitBackdropFilter: 'blur(20px)',
                borderRadius: '16px',
                border: '1px solid rgba(255,255,255,0.1)',
                transition: 'transform 0.3s',
                cursor: 'pointer',
              }}
              onMouseEnter={(e) => e.target.style.transform = 'translateY(-5px)'}
              onMouseLeave={(e) => e.target.style.transform = 'translateY(0)'}>
                <h2 style={{ color: '#ffd93d', margin: 0, fontSize: '36px', textShadow: '0 2px 10px rgba(0,0,0,0.2)' }}>{stats.claimedItems}</h2>
                <p style={{ color: 'rgba(255,255,255,0.7)', margin: 0, fontSize: '14px' }}>Claimed</p>
              </div>
            </div>

            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              gap: '16px',
              marginBottom: '24px',
            }}>
              <div style={{
                padding: '20px',
                textAlign: 'center',
                background: 'rgba(255,255,255,0.08)',
                backdropFilter: 'blur(20px)',
                WebkitBackdropFilter: 'blur(20px)',
                borderRadius: '16px',
                border: '1px solid rgba(255,255,255,0.1)',
                transition: 'transform 0.3s',
                cursor: 'pointer',
              }}
              onMouseEnter={(e) => e.target.style.transform = 'translateY(-5px)'}
              onMouseLeave={(e) => e.target.style.transform = 'translateY(0)'}>
                <h2 style={{ color: '#a29bfe', margin: 0, fontSize: '32px', textShadow: '0 2px 10px rgba(0,0,0,0.2)' }}>{stats.totalUsers}</h2>
                <p style={{ color: 'rgba(255,255,255,0.7)', margin: 0, fontSize: '14px' }}>Total Students</p>
              </div>
              <div style={{
                padding: '20px',
                textAlign: 'center',
                background: 'rgba(255,255,255,0.08)',
                backdropFilter: 'blur(20px)',
                WebkitBackdropFilter: 'blur(20px)',
                borderRadius: '16px',
                border: '1px solid rgba(255,255,255,0.1)',
                transition: 'transform 0.3s',
                cursor: 'pointer',
              }}
              onMouseEnter={(e) => e.target.style.transform = 'translateY(-5px)'}
              onMouseLeave={(e) => e.target.style.transform = 'translateY(0)'}>
                <h2 style={{ color: '#ff9800', margin: 0, fontSize: '32px', textShadow: '0 2px 10px rgba(0,0,0,0.2)' }}>{stats.pendingClaims}</h2>
                <p style={{ color: 'rgba(255,255,255,0.7)', margin: 0, fontSize: '14px' }}>Pending Claims</p>
              </div>
              <div style={{
                padding: '20px',
                textAlign: 'center',
                background: 'rgba(255,255,255,0.08)',
                backdropFilter: 'blur(20px)',
                WebkitBackdropFilter: 'blur(20px)',
                borderRadius: '16px',
                border: '1px solid rgba(255,255,255,0.1)',
                transition: 'transform 0.3s',
                cursor: 'pointer',
              }}
              onMouseEnter={(e) => e.target.style.transform = 'translateY(-5px)'}
              onMouseLeave={(e) => e.target.style.transform = 'translateY(0)'}>
                <h2 style={{ color: '#fd79a8', margin: 0, fontSize: '32px', textShadow: '0 2px 10px rgba(0,0,0,0.2)' }}>{stats.totalClaims}</h2>
                <p style={{ color: 'rgba(255,255,255,0.7)', margin: 0, fontSize: '14px' }}>Total Claims</p>
              </div>
            </div>

            <div style={{
              padding: '24px',
              background: 'rgba(255,255,255,0.08)',
              backdropFilter: 'blur(20px)',
              WebkitBackdropFilter: 'blur(20px)',
              borderRadius: '16px',
              border: '1px solid rgba(255,255,255,0.1)',
            }}>
              <h3 style={{ color: 'white', marginTop: 0, textShadow: '0 2px 10px rgba(0,0,0,0.2)' }}>📌 Quick Actions</h3>
              <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                <button
                  onClick={() => setShowForm(true)}
                  style={{
                    padding: '10px 24px',
                    borderRadius: '10px',
                    border: '1px solid rgba(255,255,255,0.2)',
                    background: 'rgba(40,167,69,0.3)',
                    color: 'white',
                    fontWeight: '600',
                    cursor: 'pointer',
                    transition: 'all 0.3s',
                  }}
                  onMouseEnter={(e) => e.target.style.background = 'rgba(40,167,69,0.5)'}
                  onMouseLeave={(e) => e.target.style.background = 'rgba(40,167,69,0.3)'}
                >
                  ➕ Post Found Item
                </button>
                <button
                  onClick={() => setActiveTab('claims')}
                  style={{
                    padding: '10px 24px',
                    borderRadius: '10px',
                    border: '1px solid rgba(255,255,255,0.2)',
                    background: 'rgba(255,152,0,0.3)',
                    color: 'white',
                    fontWeight: '600',
                    cursor: 'pointer',
                    transition: 'all 0.3s',
                  }}
                  onMouseEnter={(e) => e.target.style.background = 'rgba(255,152,0,0.5)'}
                  onMouseLeave={(e) => e.target.style.background = 'rgba(255,152,0,0.3)'}
                >
                  📋 Review Claims ({stats.pendingClaims})
                </button>
                <button
                  onClick={() => setActiveTab('notifications')}
                  style={{
                    padding: '10px 24px',
                    borderRadius: '10px',
                    border: '1px solid rgba(255,255,255,0.2)',
                    background: 'rgba(26, 35, 126, 0.3)',
                    color: 'white',
                    fontWeight: '600',
                    cursor: 'pointer',
                    transition: 'all 0.3s',
                  }}
                  onMouseEnter={(e) => e.target.style.background = 'rgba(26, 35, 126, 0.5)'}
                  onMouseLeave={(e) => e.target.style.background = 'rgba(26, 35, 126, 0.3)'}
                >
                  🔔 Notifications ({unreadCount})
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Items Tab */}
        {activeTab === 'items' && (
          <div style={{
            padding: '24px',
            background: 'rgba(255,255,255,0.08)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            borderRadius: '16px',
            border: '1px solid rgba(255,255,255,0.1)',
          }}>
            <h3 style={{ color: 'white', marginTop: 0, textShadow: '0 2px 10px rgba(0,0,0,0.2)' }}>📋 All Items ({items.length})</h3>
            {items.length === 0 ? (
              <p style={{ color: 'rgba(255,255,255,0.7)' }}>No items posted yet.</p>
            ) : (
              items.map(item => (
                <div key={item._id} style={{
                  padding: '16px',
                  marginBottom: '12px',
                  background: 'rgba(255,255,255,0.06)',
                  borderRadius: '12px',
                  border: '1px solid rgba(255,255,255,0.08)',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}>
                  <div style={{ display: 'flex', gap: '15px', alignItems: 'center', flex: 1 }}>
                    {item.imageUrl ? (
                      <img 
                        src={item.imageUrl} 
                        alt={item.title} 
                        style={{ 
                          width: '80px', 
                          height: '80px', 
                          objectFit: 'cover', 
                          borderRadius: '8px',
                          border: '1px solid rgba(255,255,255,0.1)',
                          cursor: 'pointer',
                          transition: 'transform 0.2s',
                        }}
                        onClick={() => setSelectedImage(item.imageUrl)}
                        onMouseEnter={(e) => e.target.style.transform = 'scale(1.05)'}
                        onMouseLeave={(e) => e.target.style.transform = 'scale(1)'}
                      />
                    ) : (
                      <div style={{ 
                        width: '80px', 
                        height: '80px', 
                        borderRadius: '8px',
                        border: '1px solid rgba(255,255,255,0.1)',
                        background: 'rgba(255,255,255,0.05)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'rgba(255,255,255,0.3)',
                        fontSize: '12px',
                      }}>
                        No Image
                      </div>
                    )}
                    <div>
                      <h4 style={{ color: 'white', margin: '0 0 4px 0' }}>{item.title}</h4>
                      <p style={{ color: 'rgba(255,255,255,0.7)', margin: '4px 0' }}>{item.description}</p>
                      <p style={{ margin: '4px 0', fontSize: '14px', color: 'rgba(255,255,255,0.6)' }}>
                        📍 {item.location} | 🆔 {item.itemId}
                      </p>
                      <span style={{
                        display: 'inline-block',
                        padding: '3px 12px',
                        borderRadius: '12px',
                        fontSize: '12px',
                        fontWeight: '600',
                        background: getStatusColor(item.status),
                        color: item.status === 'claimed' ? '#333' : 'white',
                      }}>
                        {item.status.toUpperCase()}
                      </span>
                      <span style={{ fontSize: '12px', color: 'rgba(255,255,255,0.5)', marginLeft: '10px' }}>
                        Reported by: {item.reportedBy?.name || 'Unknown'}
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={() => handleDelete(item._id)}
                    style={{
                      padding: '8px 16px',
                      borderRadius: '8px',
                      border: '1px solid rgba(255,255,255,0.15)',
                      background: 'rgba(220,53,69,0.3)',
                      color: 'white',
                      cursor: 'pointer',
                      fontWeight: '600',
                      transition: 'all 0.3s',
                    }}
                    onMouseEnter={(e) => e.target.style.background = 'rgba(220,53,69,0.5)'}
                    onMouseLeave={(e) => e.target.style.background = 'rgba(220,53,69,0.3)'}
                  >
                    🗑️ Delete
                  </button>
                </div>
              ))
            )}
          </div>
        )}

        {/* Claims Tab */}
        {activeTab === 'claims' && (
          <div style={{
            padding: '24px',
            background: 'rgba(255,255,255,0.08)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            borderRadius: '16px',
            border: '1px solid rgba(255,255,255,0.1)',
          }}>
            <h3 style={{ color: 'white', marginTop: 0, textShadow: '0 2px 10px rgba(0,0,0,0.2)' }}>📋 Claims ({claims.length})</h3>
            {claims.length === 0 ? (
              <p style={{ color: 'rgba(255,255,255,0.7)' }}>No claims yet.</p>
            ) : (
              claims.map(claim => (
                <div key={claim._id} style={{
                  padding: '16px',
                  marginBottom: '12px',
                  background: 'rgba(255,255,255,0.06)',
                  borderRadius: '12px',
                  border: '1px solid rgba(255,255,255,0.08)',
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                    <div>
                      <h4 style={{ color: 'white', margin: '0 0 4px 0' }}>{claim.item?.title}</h4>
                      <p style={{ margin: '4px 0', color: 'rgba(255,255,255,0.6)', fontSize: '14px' }}>
                        🆔 {claim.item?.itemId}
                      </p>
                      <p style={{ margin: '4px 0', fontSize: '14px', color: 'rgba(255,255,255,0.7)' }}>
                        <strong>Claimant:</strong> {claim.claimant?.name} ({claim.claimant?.studentId})
                      </p>
                      <p style={{ margin: '4px 0', fontSize: '14px', color: 'rgba(255,255,255,0.6)' }}>
                        📝 {claim.message}
                      </p>
                      {claim.adminResponse && (
                        <p style={{ margin: '4px 0', fontSize: '14px', color: '#ffd93d', background: 'rgba(255,217,61,0.1)', padding: '8px', borderRadius: '6px' }}>
                          <strong>Admin Response:</strong> {claim.adminResponse}
                        </p>
                      )}
                      <span style={{
                        display: 'inline-block',
                        padding: '3px 12px',
                        borderRadius: '12px',
                        fontSize: '12px',
                        fontWeight: '600',
                        background: claim.status === 'pending' ? '#ff9800' : claim.status === 'approved' ? '#51cf66' : '#ff6b6b',
                        color: 'white',
                      }}>
                        {claim.status.toUpperCase()}
                      </span>
                    </div>
                    {claim.status === 'pending' && (
                      <div style={{ display: 'flex', gap: '10px', flexDirection: 'column' }}>
                        <button
                          onClick={() => openResponseModal(claim, 'approve')}
                          style={{
                            padding: '8px 16px',
                            borderRadius: '8px',
                            border: '1px solid rgba(255,255,255,0.15)',
                            background: 'rgba(40,167,69,0.3)',
                            color: 'white',
                            cursor: 'pointer',
                            fontWeight: '600',
                            transition: 'all 0.3s',
                          }}
                          onMouseEnter={(e) => e.target.style.background = 'rgba(40,167,69,0.5)'}
                          onMouseLeave={(e) => e.target.style.background = 'rgba(40,167,69,0.3)'}
                        >
                          ✅ Approve & Respond
                        </button>
                        <button
                          onClick={() => openResponseModal(claim, 'reject')}
                          style={{
                            padding: '8px 16px',
                            borderRadius: '8px',
                            border: '1px solid rgba(255,255,255,0.15)',
                            background: 'rgba(220,53,69,0.3)',
                            color: 'white',
                            cursor: 'pointer',
                            fontWeight: '600',
                            transition: 'all 0.3s',
                          }}
                          onMouseEnter={(e) => e.target.style.background = 'rgba(220,53,69,0.5)'}
                          onMouseLeave={(e) => e.target.style.background = 'rgba(220,53,69,0.3)'}
                        >
                          ❌ Reject & Respond
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* Users Tab */}
        {activeTab === 'users' && (
          <div style={{
            padding: '24px',
            background: 'rgba(255,255,255,0.08)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            borderRadius: '16px',
            border: '1px solid rgba(255,255,255,0.1)',
          }}>
            <h3 style={{ color: 'white', marginTop: 0, textShadow: '0 2px 10px rgba(0,0,0,0.2)' }}>👥 Registered Students ({users.length})</h3>
            {users.length === 0 ? (
              <p style={{ color: 'rgba(255,255,255,0.7)' }}>No registered students.</p>
            ) : (
              users.map(u => (
                <div key={u._id} style={{
                  padding: '12px 16px',
                  marginBottom: '8px',
                  background: 'rgba(255,255,255,0.05)',
                  borderRadius: '10px',
                  border: '1px solid rgba(255,255,255,0.06)',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}>
                  <div>
                    <strong style={{ color: 'white' }}>{u.name}</strong>
                    <p style={{ margin: '4px 0', fontSize: '14px', color: 'rgba(255,255,255,0.6)' }}>
                      📧 {u.email} | 🆔 {u.studentId}
                    </p>
                    <p style={{ margin: '4px 0', fontSize: '14px', color: 'rgba(255,255,255,0.5)' }}>
                      📱 {u.phone || 'N/A'}
                    </p>
                  </div>
                  <span style={{
                    display: 'inline-block',
                    padding: '3px 12px',
                    borderRadius: '12px',
                    fontSize: '12px',
                    fontWeight: '600',
                    background: 'rgba(81,207,102,0.3)',
                    color: '#51cf66',
                    border: '1px solid rgba(81,207,102,0.2)',
                  }}>
                    {u.role}
                  </span>
                </div>
              ))
            )}
          </div>
        )}

        {/* Notifications Tab */}
        {activeTab === 'notifications' && (
          <div style={{
            padding: '24px',
            background: 'rgba(255,255,255,0.08)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            borderRadius: '16px',
            border: '1px solid rgba(255,255,255,0.1)',
          }}>
            <h3 style={{ color: 'white', marginTop: 0, textShadow: '0 2px 10px rgba(0,0,0,0.2)' }}>
              🔔 Notifications
              {unreadCount > 0 && (
                <span style={{
                  background: '#dc3545',
                  color: 'white',
                  borderRadius: '50%',
                  padding: '2px 12px',
                  marginLeft: '10px',
                  fontSize: '14px',
                }}>
                  {unreadCount} unread
                </span>
              )}
            </h3>
            {notifications.length === 0 ? (
              <p style={{ color: 'rgba(255,255,255,0.7)' }}>No notifications.</p>
            ) : (
              notifications.map(notif => (
                <div key={notif._id} style={{
                  padding: '12px 16px',
                  marginBottom: '8px',
                  borderRadius: '10px',
                  background: notif.read ? 'rgba(255,255,255,0.03)' : 'rgba(26, 35, 126, 0.2)',
                  borderLeft: notif.read ? '3px solid rgba(255,255,255,0.1)' : '3px solid #1a237e',
                  cursor: 'pointer',
                  transition: 'all 0.3s',
                }} onClick={() => !notif.read && markAsRead(notif._id)}>
                  <p style={{ margin: 0, color: 'white', whiteSpace: 'pre-wrap' }}>{notif.message}</p>
                  <p style={{ margin: '4px 0 0', fontSize: '12px', color: 'rgba(255,255,255,0.4)' }}>
                    {new Date(notif.createdAt).toLocaleString()}
                  </p>
                  {!notif.read && (
                    <span style={{ fontSize: '12px', color: '#1a237e', fontWeight: '600' }}>
                      Click to mark as read
                    </span>
                  )}
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default AdminDashboard;
