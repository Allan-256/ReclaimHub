import React, { useState, useEffect } from 'react';
import { getItems, createItem, getMyClaims, createClaim } from './api';
import ImageModal from './ImageModal';

function StudentDashboard({ user, onLogout }) {
  const [items, setItems] = useState([]);
  const [myClaims, setMyClaims] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'Electronics',
    location: '',
    dateFound: new Date().toISOString().split('T')[0],
    status: 'lost',
    image: null,
  });
  const [message, setMessage] = useState('');
  const [imagePreview, setImagePreview] = useState(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const itemsRes = await getItems();
      setItems(itemsRes.data.items || []);
      
      const claimsRes = await getMyClaims();
      setMyClaims(claimsRes.data.claims || []);
    } catch (error) {
      console.error('Error loading data:', error);
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
    data.append('status', 'lost');
    if (formData.image) {
      data.append('image', formData.image);
    }

    try {
      await createItem(data);
      setMessage('✅ Item reported successfully!');
      setShowForm(false);
      setFormData({
        title: '',
        description: '',
        category: 'Electronics',
        location: '',
        dateFound: new Date().toISOString().split('T')[0],
        status: 'lost',
        image: null,
      });
      setImagePreview(null);
      loadData();
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      setMessage('❌ Error reporting item: ' + (error.response?.data?.message || error.message));
    }
  };

  const handleClaim = async (itemId) => {
    const message = prompt('Why do you want to claim this item?');
    if (!message) return;

    try {
      await createClaim(itemId, message);
      setMessage('✅ Claim submitted! Waiting for admin response.');
      loadData();
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      setMessage('❌ Error claiming item: ' + (error.response?.data?.message || error.message));
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
      {/* Image Modal */}
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
              <h1 style={{ color: 'white', margin: 0, fontSize: '24px', textShadow: '0 2px 10px rgba(0,0,0,0.2)' }}>🏠 ReclaimHub</h1>
              <p style={{ color: 'rgba(255,255,255,0.8)', margin: 0, fontSize: '14px' }}>
                Welcome, {user?.name}
              </p>
            </div>
          </div>
          <div>
            <button
              className="btn btn-success"
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
              {showForm ? '✕ Close' : '➕ Report Lost Item'}
            </button>
            <button
              className="btn btn-danger"
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
            <h3 style={{ color: 'white', marginTop: 0, textShadow: '0 2px 10px rgba(0,0,0,0.2)' }}>📝 Report Lost Item</h3>
            <form onSubmit={handleSubmit}>
              <div className="grid-2">
                <div className="form-group">
                  <label style={{ color: 'rgba(255,255,255,0.9)' }}>Title *</label>
                  <input
                    type="text"
                    required
                    value={formData.title}
                    onChange={(e) => setFormData({...formData, title: e.target.value})}
                    placeholder="e.g., Black Laptop"
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
                  <label style={{ color: 'rgba(255,255,255,0.9)' }}>Date Lost *</label>
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
                    ✅ Report Lost Item
                  </button>
                </div>
              </div>
            </form>
          </div>
        )}

        {/* Stats */}
        <div className="grid-3" style={{ marginBottom: '24px' }}>
          <div style={{
            textAlign: 'center',
            padding: '20px',
            background: 'rgba(255,255,255,0.08)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            borderRadius: '16px',
            border: '1px solid rgba(255,255,255,0.1)',
          }}>
            <h2 style={{ color: '#ff6b6b', margin: 0, fontSize: '32px' }}>{items.filter(i => i.status === 'lost').length}</h2>
            <p style={{ color: 'rgba(255,255,255,0.8)', margin: 0 }}>Lost Items</p>
          </div>
          <div style={{
            textAlign: 'center',
            padding: '20px',
            background: 'rgba(255,255,255,0.08)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            borderRadius: '16px',
            border: '1px solid rgba(255,255,255,0.1)',
          }}>
            <h2 style={{ color: '#51cf66', margin: 0, fontSize: '32px' }}>{items.filter(i => i.status === 'found').length}</h2>
            <p style={{ color: 'rgba(255,255,255,0.8)', margin: 0 }}>Found Items</p>
          </div>
          <div style={{
            textAlign: 'center',
            padding: '20px',
            background: 'rgba(255,255,255,0.08)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            borderRadius: '16px',
            border: '1px solid rgba(255,255,255,0.1)',
          }}>
            <h2 style={{ color: '#ffd93d', margin: 0, fontSize: '32px' }}>{items.filter(i => i.status === 'claimed').length}</h2>
            <p style={{ color: 'rgba(255,255,255,0.8)', margin: 0 }}>Claimed Items</p>
          </div>
        </div>

        {/* Items List */}
        <div style={{
          padding: '24px',
          background: 'rgba(255,255,255,0.08)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          borderRadius: '16px',
          border: '1px solid rgba(255,255,255,0.1)',
          marginBottom: '24px',
        }}>
          <h3 style={{ color: 'white', marginTop: 0, textShadow: '0 2px 10px rgba(0,0,0,0.2)' }}>📋 Available Items</h3>
          {items.length === 0 ? (
            <p style={{ color: 'rgba(255,255,255,0.7)' }}>No items reported yet.</p>
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
                      📍 {item.location}
                    </p>
                    <p style={{ margin: '4px 0', fontSize: '14px', color: 'rgba(255,255,255,0.6)' }}>
                      🆔 Item ID: {item.itemId}
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
                <div>
                  {item.status === 'found' && user?.role === 'student' && (
                    <button
                      style={{
                        padding: '8px 20px',
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
                      onClick={() => handleClaim(item._id)}
                    >
                      Claim
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>

        {/* My Claims */}
        <div style={{
          padding: '24px',
          background: 'rgba(255,255,255,0.08)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          borderRadius: '16px',
          border: '1px solid rgba(255,255,255,0.1)',
        }}>
          <h3 style={{ color: 'white', marginTop: 0, textShadow: '0 2px 10px rgba(0,0,0,0.2)' }}>📋 My Claims</h3>
          {myClaims.length === 0 ? (
            <p style={{ color: 'rgba(255,255,255,0.7)' }}>You haven't claimed any items yet.</p>
          ) : (
            myClaims.map(claim => (
              <div key={claim._id} style={{
                padding: '12px 16px',
                marginBottom: '8px',
                background: 'rgba(255,255,255,0.06)',
                borderRadius: '10px',
                border: '1px solid rgba(255,255,255,0.06)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}>
                <div>
                  <strong style={{ color: 'white' }}>{claim.item?.title}</strong>
                  <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.6)', margin: '4px 0 0' }}>
                    {claim.message}
                  </p>
                  {claim.adminResponse && (
                    <p style={{ fontSize: '14px', color: '#ffd93d', margin: '4px 0 0' }}>
                      <strong>Admin Response:</strong> {claim.adminResponse}
                    </p>
                  )}
                </div>
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
            ))
          )}
        </div>
      </div>
    </div>
  );
}

export default StudentDashboard;
