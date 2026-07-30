import React, { useState, useEffect, useCallback } from 'react';
import { Moon, Sun, Package, Home, BarChart3, Settings, LogOut, Users, FileText, AlertCircle, CheckCircle, Award, Clock, TrendingUp, TrendingDown, Search, Edit, Trash2, X, Save, Plus, Send, MessageCircle, Eye } from 'lucide-react';
import Charts from './components/Charts';

function AdminDashboard({ user, onLogout }) {
  const [items, setItems] = useState([]);
  const [claims, setClaims] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [message, setMessage] = useState('');
  const [usersLoading, setUsersLoading] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  
  const [showPostForm, setShowPostForm] = useState(false);
  const [postType, setPostType] = useState('found');
  const [postData, setPostData] = useState({
    title: '',
    description: '',
    category: 'Electronics',
    location: '',
    dateFound: new Date().toISOString().split('T')[0],
    serialNumber: '',
    make: '',
    model: '',
    type: '',
    resolution: '',
    color: '',
    imeiNumber: '',
  });
  const [postImage, setPostImage] = useState(null);
  const [postImageData, setPostImageData] = useState('');
  const [imagePreview, setImagePreview] = useState(null);
  const [posting, setPosting] = useState(false);

  const [showReplyModal, setShowReplyModal] = useState(false);
  const [selectedClaim, setSelectedClaim] = useState(null);
  const [replyMessage, setReplyMessage] = useState('');
  const [replyAction, setReplyAction] = useState('approve');
  const [sendingReply, setSendingReply] = useState(false);

  const [showEditModal, setShowEditModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [editFormData, setEditFormData] = useState({
    title: '',
    description: '',
    category: 'Electronics',
    location: '',
    status: 'lost',
  });
  const [saving, setSaving] = useState(false);

  const [adminStats, setAdminStats] = useState({
    totalItems: 0,
    lostItems: 0,
    foundItems: 0,
    claimedItems: 0,
    totalUsers: 0,
    pendingClaims: 0,
    totalClaims: 0
  });

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const token = localStorage.getItem('token');
      
      const itemsResponse = await fetch('/api/items');
      const itemsData = await itemsResponse.json();
      setItems(itemsData.items || []);
      
      const statsResponse = await fetch('/api/stats');
      if (statsResponse.ok) {
        const statsData = await statsResponse.json();
        setAdminStats(statsData.stats || {});
      }
      
      const claimsResponse = await fetch('/api/claims', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (claimsResponse.ok) {
        const claimsData = await claimsResponse.json();
        setClaims(claimsData.claims || []);
      }
      
      await loadUsers();
      
    } catch (err) {
      console.error('Error loading data:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const loadUsers = useCallback(async () => {
    try {
      setUsersLoading(true);
      const token = localStorage.getItem('token');
      
      const response = await fetch('/api/users', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        setUsers(data.users || []);
        setAdminStats(prev => ({ ...prev, totalUsers: data.users?.length || 0 }));
      }
    } catch (err) {
      console.error('Error loading users:', err);
    } finally {
      setUsersLoading(false);
    }
  }, []);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setPostImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
        const base64 = reader.result.split(',')[1];
        setPostImageData(base64);
      };
      reader.readAsDataURL(file);
    }
  };

  const handlePostItem = async (e) => {
    e.preventDefault();
    setPosting(true);
    setMessage('');

    try {
      const token = localStorage.getItem('token');
      
      const submitData = {
        title: postData.title,
        description: postData.description,
        category: postData.category,
        location: postData.location,
        status: postType,
        serialNumber: postData.serialNumber || '',
        make: postData.make || '',
        model: postData.model || '',
        type: postData.type || '',
        resolution: postData.resolution || '',
        color: postData.color || '',
        imeiNumber: postData.imeiNumber || '',
        imageData: postImageData || '',
      };

      if (postType === 'found') {
        submitData.dateFound = postData.dateFound;
      }

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
        setMessage(`✅ ${postType === 'found' ? 'Found' : 'Lost'} item posted successfully!`);
        setShowPostForm(false);
        setPostData({
          title: '',
          description: '',
          category: 'Electronics',
          location: '',
          dateFound: new Date().toISOString().split('T')[0],
          serialNumber: '',
          make: '',
          model: '',
          type: '',
          resolution: '',
          color: '',
          imeiNumber: '',
        });
        setPostImage(null);
        setPostImageData('');
        setImagePreview(null);
        loadData();
        setTimeout(() => setMessage(''), 3000);
      } else {
        setMessage('❌ ' + (data.message || 'Failed to post item'));
        setTimeout(() => setMessage(''), 3000);
      }
    } catch (err) {
      setMessage('❌ Error posting item');
      setTimeout(() => setMessage(''), 3000);
    } finally {
      setPosting(false);
    }
  };

  const handleDeleteItem = async (itemId) => {
    if (!window.confirm('Are you sure you want to delete this item? This action cannot be undone.')) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/items/${itemId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        setMessage('✅ Item deleted successfully!');
        loadData();
        setTimeout(() => setMessage(''), 3000);
      } else {
        const data = await response.json();
        setMessage('❌ ' + (data.message || 'Failed to delete item'));
        setTimeout(() => setMessage(''), 3000);
      }
    } catch (err) {
      setMessage('❌ Error deleting item');
      setTimeout(() => setMessage(''), 3000);
    }
  };

  const handleEditClick = (item) => {
    setEditingItem(item);
    setEditFormData({
      title: item.title || '',
      description: item.description || '',
      category: item.category || 'Electronics',
      location: item.location || '',
      status: item.status || 'lost',
    });
    setShowEditModal(true);
  };

  const handleSaveEdit = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/items/${editingItem._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(editFormData),
      });

      if (response.ok) {
        setMessage('✅ Item updated successfully!');
        setShowEditModal(false);
        loadData();
        setTimeout(() => setMessage(''), 3000);
      } else {
        const data = await response.json();
        setMessage('❌ ' + (data.message || 'Failed to update item'));
        setTimeout(() => setMessage(''), 3000);
      }
    } catch (err) {
      setMessage('❌ Error updating item');
      setTimeout(() => setMessage(''), 3000);
    } finally {
      setSaving(false);
    }
  };

  const handleClaimAction = async (action) => {
    if (!replyMessage.trim()) {
      setMessage('❌ Please enter a response message');
      return;
    }

    setSendingReply(true);

    try {
      const token = localStorage.getItem('token');
      const endpoint = action === 'approve' ? 'approve' : 'reject';
      
      const response = await fetch(`/api/claims/${selectedClaim._id}/${endpoint}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ response: replyMessage }),
      });

      if (response.ok) {
        setMessage(`✅ Claim ${action === 'approve' ? 'approved' : 'rejected'} and response sent!`);
        setShowReplyModal(false);
        setSelectedClaim(null);
        setReplyMessage('');
        loadData();
        setTimeout(() => setMessage(''), 3000);
      } else {
        const data = await response.json();
        setMessage('❌ ' + (data.message || 'Failed to process claim'));
        setTimeout(() => setMessage(''), 3000);
      }
    } catch (err) {
      setMessage('❌ Error processing claim');
      setTimeout(() => setMessage(''), 3000);
    } finally {
      setSendingReply(false);
    }
  };

  const openReplyModal = (claim, action) => {
    setSelectedClaim(claim);
    setReplyAction(action);
    setReplyMessage('');
    setShowReplyModal(true);
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

  const getImageSrc = (item) => {
    if (item.imageData) {
      return `data:image/jpeg;base64,${item.imageData}`;
    }
    return null;
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
        Loading Admin Dashboard...
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

  const StatCard = ({ icon: Icon, title, value, color, trend }) => (
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
          <Icon size={20} color={color} />
        </div>
      </div>
      {trend && (
        <div style={{ marginTop: '8px', fontSize: '13px', color: trend > 0 ? '#51cf66' : '#ff6b6b', display: 'flex', alignItems: 'center', gap: '4px' }}>
          {trend > 0 ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
          {Math.abs(trend)}% from last month
        </div>
      )}
    </div>
  );

  const lostItems = items.filter(item => item.status === 'lost');
  const foundItems = items.filter(item => item.status === 'found');
  const pendingClaims = claims.filter(claim => claim.status === 'pending');

  if (selectedImage) {
    return (
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
    );
  }

  return (
    <div style={{
      display: 'flex',
      minHeight: '100vh',
      background: theme.background,
      transition: 'background 0.3s ease',
    }}>
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
            👑 ReclaimHub
          </h2>
          <p style={{ color: theme.textSecondary, fontSize: '12px', margin: '4px 0 0' }}>
            Admin Dashboard
          </p>
        </div>

        <div style={{ marginBottom: '24px' }}>
          <div style={{ 
            padding: '8px 12px', 
            borderRadius: '8px', 
            background: 'rgba(79, 195, 247, 0.15)',
            border: '1px solid rgba(79, 195, 247, 0.2)',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <Search size={16} style={{ color: theme.textSecondary }} />
            <input
              type="text"
              placeholder="Search..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                background: 'transparent',
                border: 'none',
                color: theme.textColor,
                fontSize: '13px',
                outline: 'none',
                width: '100%',
              }}
            />
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
            background: activeTab === 'claims' ? 'rgba(79, 195, 247, 0.15)' : 'transparent',
            color: activeTab === 'claims' ? theme.accentColor : theme.textSecondary,
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            cursor: 'pointer',
            transition: 'all 0.3s',
            fontWeight: activeTab === 'claims' ? '600' : '400',
          }}
          onClick={() => setActiveTab('claims')}>
            <FileText size={18} /> Claims
            {pendingClaims.length > 0 && (
              <span style={{
                background: '#dc3545',
                color: 'white',
                borderRadius: '50%',
                padding: '1px 8px',
                fontSize: '11px',
                marginLeft: 'auto'
              }}>
                {pendingClaims.length}
              </span>
            )}
          </div>
          <div style={{ 
            padding: '10px 12px', 
            borderRadius: '8px', 
            background: activeTab === 'users' ? 'rgba(79, 195, 247, 0.15)' : 'transparent',
            color: activeTab === 'users' ? theme.accentColor : theme.textSecondary,
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            cursor: 'pointer',
            transition: 'all 0.3s',
            fontWeight: activeTab === 'users' ? '600' : '400',
          }}
          onClick={() => setActiveTab('users')}>
            <Users size={18} /> Users
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
              {activeTab === 'dashboard' ? 'Dashboard' :
               activeTab === 'items' ? 'Items Management' :
               activeTab === 'claims' ? 'Claims Management' :
               activeTab === 'users' ? 'User Management' :
               activeTab === 'reports' ? 'Reports & Analytics' :
               'Settings'}
            </h1>
            <p style={{ color: theme.textSecondary, margin: '4px 0 0' }}>
              Welcome back, {user?.name} 👋
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
            <button
              onClick={() => setShowPostForm(!showPostForm)}
              style={{
                padding: '10px 20px',
                borderRadius: '8px',
                border: 'none',
                background: 'linear-gradient(135deg, #00b894, #00cec9)',
                color: 'white',
                fontWeight: '600',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                transition: 'all 0.3s',
              }}
              onMouseEnter={(e) => {
                e.target.style.transform = 'translateY(-2px)';
                e.target.style.boxShadow = '0 8px 25px rgba(0,184,148,0.3)';
              }}
              onMouseLeave={(e) => {
                e.target.style.transform = 'translateY(0)';
                e.target.style.boxShadow = 'none';
              }}
            >
              <Plus size={18} /> Post Item
            </button>
          </div>
        </div>

        {message && (
          <div style={{
            padding: '10px 16px',
            borderRadius: '8px',
            marginBottom: '16px',
            background: message.includes('✅') ? 'rgba(40,167,69,0.15)' : 'rgba(220,53,69,0.15)',
            color: message.includes('✅') ? '#28a745' : '#dc3545',
            border: '1px solid ' + (message.includes('✅') ? 'rgba(40,167,69,0.2)' : 'rgba(220,53,69,0.2)'),
          }}>
            {message}
          </div>
        )}

        {/* Post Item Form - shortened for brevity */}
        {showPostForm && (
          <div style={{
            padding: '24px',
            background: theme.cardBg,
            borderRadius: '12px',
            border: '1px solid ' + theme.borderColor,
            marginBottom: '24px',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ color: theme.textColor, margin: 0 }}>📝 Post New Item</h3>
              <button
                onClick={() => setShowPostForm(false)}
                style={{
                  padding: '4px',
                  borderRadius: '50%',
                  border: 'none',
                  background: 'transparent',
                  color: theme.textSecondary,
                  cursor: 'pointer',
                }}
              >
                <X size={20} />
              </button>
            </div>

            <div style={{ display: 'flex', gap: '12px', marginBottom: '16px' }}>
              <button
                onClick={() => setPostType('found')}
                style={{
                  padding: '8px 20px',
                  borderRadius: '8px',
                  border: postType === 'found' ? '2px solid #51cf66' : '1px solid ' + theme.borderColor,
                  background: postType === 'found' ? 'rgba(81,207,102,0.15)' : 'transparent',
                  color: postType === 'found' ? '#51cf66' : theme.textSecondary,
                  cursor: 'pointer',
                  fontWeight: postType === 'found' ? '600' : '400',
                }}
              >
                ✅ Found Item
              </button>
              <button
                onClick={() => setPostType('lost')}
                style={{
                  padding: '8px 20px',
                  borderRadius: '8px',
                  border: postType === 'lost' ? '2px solid #ff6b6b' : '1px solid ' + theme.borderColor,
                  background: postType === 'lost' ? 'rgba(255,107,107,0.15)' : 'transparent',
                  color: postType === 'lost' ? '#ff6b6b' : theme.textSecondary,
                  cursor: 'pointer',
                  fontWeight: postType === 'lost' ? '600' : '400',
                }}
              >
                ❌ Lost Item
              </button>
            </div>

            <form onSubmit={handlePostItem}>
              <div className="grid-2">
                <div className="form-group">
                  <label style={{ color: theme.textColor, display: 'block', marginBottom: '6px', fontSize: '14px', fontWeight: '500' }}>
                    Item Title *
                  </label>
                  <input
                    type="text"
                    required
                    value={postData.title}
                    onChange={(e) => setPostData({...postData, title: e.target.value})}
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
                    value={postData.category}
                    onChange={(e) => setPostData({...postData, category: e.target.value})}
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
                      value={postData.description}
                      onChange={(e) => setPostData({...postData, description: e.target.value})}
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
                    Location *
                  </label>
                  <input
                    type="text"
                    required
                    value={postData.location}
                    onChange={(e) => setPostData({...postData, location: e.target.value})}
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
                {postType === 'found' && (
                  <div className="form-group">
                    <label style={{ color: theme.textColor, display: 'block', marginBottom: '6px', fontSize: '14px', fontWeight: '500' }}>
                      Date Found *
                    </label>
                    <input
                      type="date"
                      required
                      value={postData.dateFound}
                      onChange={(e) => setPostData({...postData, dateFound: e.target.value})}
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
                  <button type="submit" disabled={posting} style={{
                    width: '100%',
                    padding: '12px',
                    borderRadius: '8px',
                    border: 'none',
                    background: postType === 'found' 
                      ? 'linear-gradient(135deg, #00b894, #00cec9)' 
                      : 'linear-gradient(135deg, #dc3545, #c82333)',
                    color: 'white',
                    fontSize: '16px',
                    fontWeight: '600',
                    cursor: posting ? 'not-allowed' : 'pointer',
                    opacity: posting ? 0.7 : 1,
                    transition: 'all 0.3s',
                  }}
                  onMouseEnter={(e) => {
                    if (!posting) {
                      e.target.style.transform = 'scale(1.02)';
                      e.target.style.boxShadow = '0 8px 25px rgba(0,184,148,0.3)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.transform = 'scale(1)';
                    e.target.style.boxShadow = 'none';
                  }}>
                    {posting ? 'Posting...' : `Post ${postType === 'found' ? 'Found' : 'Lost'} Item`}
                  </button>
                </div>
              </div>
            </form>
          </div>
        )}

        {/* Reply/Approval Modal */}
        {showReplyModal && selectedClaim && (
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
              maxWidth: '550px',
              width: '90%',
              border: '1px solid ' + theme.borderColor,
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h3 style={{ color: theme.textColor, margin: 0 }}>
                  <MessageCircle size={18} style={{ display: 'inline', marginRight: '8px' }} />
                  {replyAction === 'approve' ? '✅ Approve Claim' : '❌ Reject Claim'}
                </h3>
                <button
                  onClick={() => {
                    setShowReplyModal(false);
                    setSelectedClaim(null);
                    setReplyMessage('');
                  }}
                  style={{
                    padding: '4px',
                    borderRadius: '50%',
                    border: 'none',
                    background: 'transparent',
                    color: theme.textSecondary,
                    cursor: 'pointer',
                  }}
                >
                  <X size={20} />
                </button>
              </div>

              <div style={{ marginBottom: '16px' }}>
                <p style={{ color: theme.textColor }}>
                  <strong>Item:</strong> {selectedClaim.item?.title}
                </p>
                <p style={{ color: theme.textSecondary }}>
                  <strong>Claimant:</strong> {selectedClaim.claimant?.name} ({selectedClaim.claimant?.email})
                </p>
                <p style={{ color: theme.textSecondary }}>
                  <strong>Student ID:</strong> {selectedClaim.claimant?.studentId}
                </p>
                <div style={{
                  padding: '12px',
                  background: 'rgba(255,255,255,0.05)',
                  borderRadius: '8px',
                  marginTop: '8px'
                }}>
                  <p style={{ color: theme.textSecondary, margin: 0 }}>
                    <strong>Claim Message:</strong>
                  </p>
                  <p style={{ color: theme.textColor, margin: '4px 0 0' }}>
                    {selectedClaim.message}
                  </p>
                </div>
              </div>

              <div className="form-group" style={{ marginBottom: '16px' }}>
                <label style={{ color: theme.textColor, display: 'block', marginBottom: '6px', fontSize: '14px', fontWeight: '500' }}>
                  Response to Claimant *
                </label>
                <textarea
                  value={replyMessage}
                  onChange={(e) => setReplyMessage(e.target.value)}
                  placeholder={`Type your response to ${selectedClaim.claimant?.name}...`}
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

              <div style={{ display: 'flex', gap: '10px' }}>
                <button
                  onClick={() => handleClaimAction(replyAction)}
                  disabled={sendingReply}
                  style={{
                    flex: 1,
                    padding: '12px',
                    borderRadius: '8px',
                    border: 'none',
                    background: replyAction === 'approve' 
                      ? 'linear-gradient(135deg, #00b894, #00cec9)' 
                      : 'linear-gradient(135deg, #dc3545, #c82333)',
                    color: 'white',
                    fontSize: '16px',
                    fontWeight: '600',
                    cursor: sendingReply ? 'not-allowed' : 'pointer',
                    opacity: sendingReply ? 0.7 : 1,
                    transition: 'all 0.3s',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                  }}
                  onMouseEnter={(e) => {
                    if (!sendingReply) {
                      e.target.style.transform = 'scale(1.02)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.transform = 'scale(1)';
                  }}
                >
                  <Send size={18} /> 
                  {sendingReply ? 'Processing...' : replyAction === 'approve' ? 'Approve & Respond' : 'Reject & Respond'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowReplyModal(false);
                    setSelectedClaim(null);
                    setReplyMessage('');
                  }}
                  style={{
                    padding: '12px 24px',
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

        {/* Edit Modal */}
        {showEditModal && editingItem && (
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
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h3 style={{ color: theme.textColor, margin: 0 }}>Edit Item</h3>
                <button
                  onClick={() => setShowEditModal(false)}
                  style={{
                    padding: '4px',
                    borderRadius: '50%',
                    border: 'none',
                    background: 'transparent',
                    color: theme.textSecondary,
                    cursor: 'pointer',
                  }}
                >
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleSaveEdit}>
                <div className="form-group" style={{ marginBottom: '16px' }}>
                  <label style={{ color: theme.textColor, display: 'block', marginBottom: '6px', fontSize: '14px', fontWeight: '500' }}>
                    Title *
                  </label>
                  <input
                    type="text"
                    required
                    value={editFormData.title}
                    onChange={(e) => setEditFormData({...editFormData, title: e.target.value})}
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
                    Description *
                  </label>
                  <textarea
                    required
                    value={editFormData.description}
                    onChange={(e) => setEditFormData({...editFormData, description: e.target.value})}
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

                <div className="form-group" style={{ marginBottom: '16px' }}>
                  <label style={{ color: theme.textColor, display: 'block', marginBottom: '6px', fontSize: '14px', fontWeight: '500' }}>
                    Category
                  </label>
                  <select
                    value={editFormData.category}
                    onChange={(e) => setEditFormData({...editFormData, category: e.target.value})}
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

                <div className="form-group" style={{ marginBottom: '16px' }}>
                  <label style={{ color: theme.textColor, display: 'block', marginBottom: '6px', fontSize: '14px', fontWeight: '500' }}>
                    Location
                  </label>
                  <input
                    type="text"
                    value={editFormData.location}
                    onChange={(e) => setEditFormData({...editFormData, location: e.target.value})}
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
                    Status
                  </label>
                  <select
                    value={editFormData.status}
                    onChange={(e) => setEditFormData({...editFormData, status: e.target.value})}
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
                    <option value="lost">Lost</option>
                    <option value="found">Found</option>
                    <option value="claimed">Claimed</option>
                  </select>
                </div>

                <div style={{ display: 'flex', gap: '10px' }}>
                  <button
                    type="submit"
                    disabled={saving}
                    style={{
                      flex: 1,
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
                  >
                    <Save size={18} /> {saving ? 'Saving...' : 'Save Changes'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowEditModal(false)}
                    style={{
                      padding: '12px 24px',
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
              </form>
            </div>
          </div>
        )}

        {/* Dashboard Tab */}
        {activeTab === 'dashboard' && (
          <div>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(4, 1fr)',
              gap: '16px',
              marginBottom: '24px',
            }}>
              <StatCard icon={Package} title="Total Items" value={adminStats.totalItems} color="#4fc3f7" trend={12} />
              <StatCard icon={AlertCircle} title="Lost Items" value={adminStats.lostItems} color="#ff6b6b" trend={-5} />
              <StatCard icon={CheckCircle} title="Found Items" value={adminStats.foundItems} color="#51cf66" trend={8} />
              <StatCard icon={Award} title="Claimed Items" value={adminStats.claimedItems} color="#ffd93d" trend={3} />
              <StatCard icon={Users} title="Total Users" value={users.length} color="#a29bfe" />
              <StatCard icon={Clock} title="Pending Claims" value={pendingClaims.length} color="#ff9800" trend={-2} />
              <StatCard icon={FileText} title="Total Claims" value={adminStats.totalClaims} color="#fd79a8" trend={15} />
              <StatCard icon={Package} title="Active Items" value={(adminStats.foundItems || 0) + (adminStats.lostItems || 0)} color="#00b894" />
            </div>

            <div style={{
              padding: '20px',
              background: theme.cardBg,
              borderRadius: '12px',
              border: '1px solid ' + theme.borderColor,
              marginBottom: '24px',
            }}>
              <h3 style={{ color: theme.textColor, margin: '0 0 16px 0' }}>⚡ Quick Actions</h3>
              <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                <button
                  onClick={() => setActiveTab('claims')}
                  style={{
                    padding: '10px 20px',
                    borderRadius: '8px',
                    border: 'none',
                    background: 'linear-gradient(135deg, #ff9800, #f57c00)',
                    color: 'white',
                    fontWeight: '600',
                    cursor: 'pointer',
                    transition: 'all 0.3s',
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.transform = 'translateY(-2px)';
                    e.target.style.boxShadow = '0 8px 25px rgba(255,152,0,0.3)';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.transform = 'translateY(0)';
                    e.target.style.boxShadow = 'none';
                  }}
                >
                  Review Pending Claims ({pendingClaims.length})
                </button>
                <button
                  onClick={() => setShowPostForm(true)}
                  style={{
                    padding: '10px 20px',
                    borderRadius: '8px',
                    border: 'none',
                    background: 'linear-gradient(135deg, #00b894, #00cec9)',
                    color: 'white',
                    fontWeight: '600',
                    cursor: 'pointer',
                    transition: 'all 0.3s',
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.transform = 'translateY(-2px)';
                    e.target.style.boxShadow = '0 8px 25px rgba(0,184,148,0.3)';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.transform = 'translateY(0)';
                    e.target.style.boxShadow = 'none';
                  }}
                >
                  <Plus size={16} style={{ display: 'inline', marginRight: '6px' }} />
                  Post New Item
                </button>
                <button
                  onClick={() => setActiveTab('items')}
                  style={{
                    padding: '10px 20px',
                    borderRadius: '8px',
                    border: 'none',
                    background: 'linear-gradient(135deg, #1a237e, #283593)',
                    color: 'white',
                    fontWeight: '600',
                    cursor: 'pointer',
                    transition: 'all 0.3s',
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.transform = 'translateY(-2px)';
                    e.target.style.boxShadow = '0 8px 25px rgba(26,35,126,0.3)';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.transform = 'translateY(0)';
                    e.target.style.boxShadow = 'none';
                  }}
                >
                  Manage Items
                </button>
                <button
                  onClick={() => setActiveTab('users')}
                  style={{
                    padding: '10px 20px',
                    borderRadius: '8px',
                    border: 'none',
                    background: 'linear-gradient(135deg, #6c5ce7, #a29bfe)',
                    color: 'white',
                    fontWeight: '600',
                    cursor: 'pointer',
                    transition: 'all 0.3s',
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.transform = 'translateY(-2px)';
                    e.target.style.boxShadow = '0 8px 25px rgba(108,92,231,0.3)';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.transform = 'translateY(0)';
                    e.target.style.boxShadow = 'none';
                  }}
                >
                  View Users
                </button>
              </div>
            </div>

            <div style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '16px',
            }}>
              <div style={{
                padding: '20px',
                background: theme.cardBg,
                borderRadius: '12px',
                border: '1px solid ' + theme.borderColor,
              }}>
                <h3 style={{ color: theme.textColor, margin: '0 0 16px 0' }}>Recently Lost Items</h3>
                {lostItems.slice(0, 3).map((item) => (
                  <div key={item._id} style={{
                    padding: '10px',
                    background: 'rgba(255,255,255,0.03)',
                    borderRadius: '8px',
                    marginBottom: '8px',
                    border: '1px solid ' + theme.borderColor,
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: theme.textColor, fontWeight: '500' }}>{item.title}</span>
                      <span style={{ color: '#ff6b6b', fontSize: '12px' }}>LOST</span>
                    </div>
                    <div style={{ fontSize: '12px', color: theme.textSecondary }}>
                      {item.location} • {new Date(item.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                ))}
                {lostItems.length === 0 && (
                  <p style={{ color: theme.textSecondary }}>No lost items</p>
                )}
              </div>

              <div style={{
                padding: '20px',
                background: theme.cardBg,
                borderRadius: '12px',
                border: '1px solid ' + theme.borderColor,
              }}>
                <h3 style={{ color: theme.textColor, margin: '0 0 16px 0' }}>Recent Claims</h3>
                {claims.slice(0, 3).map((claim) => (
                  <div key={claim._id} style={{
                    padding: '10px',
                    background: 'rgba(255,255,255,0.03)',
                    borderRadius: '8px',
                    marginBottom: '8px',
                    border: '1px solid ' + theme.borderColor,
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: theme.textColor, fontWeight: '500' }}>{claim.item?.title || 'Unknown'}</span>
                      <span style={{ 
                        color: claim.status === 'pending' ? '#ff9800' : claim.status === 'approved' ? '#51cf66' : '#ff6b6b',
                        fontSize: '12px'
                      }}>
                        {claim.status.toUpperCase()}
                      </span>
                    </div>
                    <div style={{ fontSize: '12px', color: theme.textSecondary }}>
                      {claim.claimant?.name} • {new Date(claim.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                ))}
                {claims.length === 0 && (
                  <p style={{ color: theme.textSecondary }}>No claims</p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Items Tab - Grid View with Images */}
        {activeTab === 'items' && (
          <div style={{
            padding: '20px',
            background: theme.cardBg,
            borderRadius: '12px',
            border: '1px solid ' + theme.borderColor,
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ color: theme.textColor, margin: 0 }}>All Items ({items.length})</h3>
              <button
                onClick={loadData}
                style={{
                  padding: '6px 16px',
                  borderRadius: '6px',
                  border: '1px solid ' + theme.borderColor,
                  background: 'transparent',
                  color: theme.textColor,
                  cursor: 'pointer',
                  fontSize: '13px',
                }}
              >
                🔄 Refresh
              </button>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '16px' }}>
              {items.length === 0 ? (
                <p style={{ color: theme.textSecondary }}>No items found.</p>
              ) : (
                items.map((item) => {
                  const isClaimed = item.status === 'claimed';
                  const imageSrc = getImageSrc(item);
                  return (
                    <div key={item._id} style={{
                      background: isClaimed ? theme.claimedBg : 'rgba(255,255,255,0.03)',
                      borderRadius: '12px',
                      border: isClaimed ? '2px solid ' + theme.claimedBorder : '1px solid ' + theme.borderColor,
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
                            height: '200px',
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
                            {isClaimed && ' ✓'}
                          </div>
                          {isClaimed && (
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
                          height: '200px',
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
                            {isClaimed && ' ✓'}
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
                          <span style={{ fontSize: '11px', color: theme.textSecondary, marginLeft: 'auto' }}>
                            {new Date(item.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                        <div style={{ display: 'flex', gap: '8px', marginTop: '12px' }}>
                          <button
                            onClick={() => handleEditClick(item)}
                            style={{
                              flex: 1,
                              padding: '6px',
                              borderRadius: '6px',
                              border: 'none',
                              background: 'rgba(26,35,126,0.3)',
                              color: theme.textColor,
                              cursor: 'pointer',
                              fontSize: '12px',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              gap: '4px',
                              transition: 'all 0.3s',
                            }}
                            onMouseEnter={(e) => {
                              e.target.style.background = 'rgba(26,35,126,0.5)';
                            }}
                            onMouseLeave={(e) => {
                              e.target.style.background = 'rgba(26,35,126,0.3)';
                            }}
                          >
                            <Edit size={14} /> Edit
                          </button>
                          <button
                            onClick={() => handleDeleteItem(item._id)}
                            style={{
                              flex: 1,
                              padding: '6px',
                              borderRadius: '6px',
                              border: 'none',
                              background: 'rgba(220,53,69,0.3)',
                              color: '#dc3545',
                              cursor: 'pointer',
                              fontSize: '12px',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              gap: '4px',
                              transition: 'all 0.3s',
                            }}
                            onMouseEnter={(e) => {
                              e.target.style.background = 'rgba(220,53,69,0.5)';
                            }}
                            onMouseLeave={(e) => {
                              e.target.style.background = 'rgba(220,53,69,0.3)';
                            }}
                          >
                            <Trash2 size={14} /> Delete
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}

        {/* Claims Tab */}
        {activeTab === 'claims' && (
          <div style={{
            padding: '20px',
            background: theme.cardBg,
            borderRadius: '12px',
            border: '1px solid ' + theme.borderColor,
          }}>
            <h3 style={{ color: theme.textColor, margin: '0 0 16px 0' }}>
              All Claims ({claims.length})
              {pendingClaims.length > 0 && (
                <span style={{
                  background: '#ff9800',
                  color: 'white',
                  borderRadius: '50%',
                  padding: '2px 14px',
                  marginLeft: '10px',
                  fontSize: '14px',
                }}>
                  {pendingClaims.length} pending
                </span>
              )}
            </h3>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid ' + theme.borderColor }}>
                    <th style={{ textAlign: 'left', color: theme.textSecondary, padding: '10px' }}>Item</th>
                    <th style={{ textAlign: 'left', color: theme.textSecondary, padding: '10px' }}>Claimant</th>
                    <th style={{ textAlign: 'left', color: theme.textSecondary, padding: '10px' }}>Message</th>
                    <th style={{ textAlign: 'left', color: theme.textSecondary, padding: '10px' }}>Status</th>
                    <th style={{ textAlign: 'left', color: theme.textSecondary, padding: '10px' }}>Date</th>
                    <th style={{ textAlign: 'left', color: theme.textSecondary, padding: '10px' }}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {claims.length === 0 ? (
                    <tr>
                      <td colSpan="6" style={{ padding: '20px', textAlign: 'center', color: theme.textSecondary }}>
                        No claims found.
                      </td>
                    </tr>
                  ) : (
                    claims.map((claim, index) => (
                      <tr key={claim._id} style={{ borderBottom: index < claims.length - 1 ? '1px solid ' + theme.borderColor : 'none' }}>
                        <td style={{ padding: '10px', color: theme.textColor }}>{claim.item?.title || 'Unknown'}</td>
                        <td style={{ padding: '10px', color: theme.textColor }}>{claim.claimant?.name || 'Unknown'}</td>
                        <td style={{ padding: '10px', color: theme.textSecondary }}>{claim.message?.substring(0, 50) || ''}...</td>
                        <td style={{ padding: '10px' }}>
                          <span style={{
                            display: 'inline-block',
                            padding: '2px 10px',
                            borderRadius: '12px',
                            fontSize: '11px',
                            fontWeight: '600',
                            background: claim.status === 'pending' ? '#ff980020' : claim.status === 'approved' ? '#51cf6620' : '#ff6b6b20',
                            color: claim.status === 'pending' ? '#ff9800' : claim.status === 'approved' ? '#51cf66' : '#ff6b6b',
                            border: '1px solid ' + (claim.status === 'pending' ? '#ff980040' : claim.status === 'approved' ? '#51cf6640' : '#ff6b6b40'),
                          }}>
                            {claim.status.toUpperCase()}
                          </span>
                          {claim.adminResponse && (
                            <div style={{
                              fontSize: '12px',
                              color: '#ffd93d',
                              marginTop: '4px',
                              padding: '4px 8px',
                              background: 'rgba(255,217,61,0.1)',
                              borderRadius: '4px',
                              border: '1px solid rgba(255,217,61,0.2)'
                            }}>
                              Reply: {claim.adminResponse.substring(0, 30)}...
                            </div>
                          )}
                        </td>
                        <td style={{ padding: '10px', color: theme.textSecondary }}>{new Date(claim.createdAt).toLocaleDateString()}</td>
                        <td style={{ padding: '10px' }}>
                          {claim.status === 'pending' && (
                            <div style={{ display: 'flex', gap: '6px', flexDirection: 'column' }}>
                              <button
                                onClick={() => openReplyModal(claim, 'approve')}
                                style={{
                                  padding: '6px 14px',
                                  borderRadius: '6px',
                                  border: 'none',
                                  background: 'linear-gradient(135deg, #00b894, #00cec9)',
                                  color: 'white',
                                  cursor: 'pointer',
                                  fontSize: '13px',
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: '6px',
                                  transition: 'all 0.3s',
                                }}
                                onMouseEnter={(e) => {
                                  e.target.style.transform = 'scale(1.05)';
                                }}
                                onMouseLeave={(e) => {
                                  e.target.style.transform = 'scale(1)';
                                }}
                              >
                                <CheckCircle size={14} /> Approve
                              </button>
                              <button
                                onClick={() => openReplyModal(claim, 'reject')}
                                style={{
                                  padding: '6px 14px',
                                  borderRadius: '6px',
                                  border: 'none',
                                  background: 'linear-gradient(135deg, #dc3545, #c82333)',
                                  color: 'white',
                                  cursor: 'pointer',
                                  fontSize: '13px',
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: '6px',
                                  transition: 'all 0.3s',
                                }}
                                onMouseEnter={(e) => {
                                  e.target.style.transform = 'scale(1.05)';
                                }}
                                onMouseLeave={(e) => {
                                  e.target.style.transform = 'scale(1)';
                                }}
                              >
                                <X size={14} /> Reject
                              </button>
                            </div>
                          )}
                          {claim.status === 'approved' && (
                            <span style={{ color: '#51cf66', fontSize: '13px', fontWeight: '600' }}>
                              ✅ Approved
                            </span>
                          )}
                          {claim.status === 'rejected' && (
                            <span style={{ color: '#ff6b6b', fontSize: '13px', fontWeight: '600' }}>
                              ❌ Rejected
                            </span>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Users Tab */}
        {activeTab === 'users' && (
          <div style={{
            padding: '20px',
            background: theme.cardBg,
            borderRadius: '12px',
            border: '1px solid ' + theme.borderColor,
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ color: theme.textColor, margin: 0 }}>Registered Users ({users.length})</h3>
              <button
                onClick={loadUsers}
                style={{
                  padding: '6px 16px',
                  borderRadius: '6px',
                  border: '1px solid ' + theme.borderColor,
                  background: 'transparent',
                  color: theme.textColor,
                  cursor: 'pointer',
                  fontSize: '13px',
                }}
              >
                🔄 Refresh
              </button>
            </div>
            {usersLoading && <p style={{ color: theme.textSecondary }}>Loading users...</p>}
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid ' + theme.borderColor }}>
                    <th style={{ textAlign: 'left', color: theme.textSecondary, padding: '10px' }}>Name</th>
                    <th style={{ textAlign: 'left', color: theme.textSecondary, padding: '10px' }}>Email</th>
                    <th style={{ textAlign: 'left', color: theme.textSecondary, padding: '10px' }}>Student ID</th>
                    <th style={{ textAlign: 'left', color: theme.textSecondary, padding: '10px' }}>Role</th>
                    <th style={{ textAlign: 'left', color: theme.textSecondary, padding: '10px' }}>Joined</th>
                  </tr>
                </thead>
                <tbody>
                  {users.length === 0 ? (
                    <tr>
                      <td colSpan="5" style={{ padding: '20px', textAlign: 'center', color: theme.textSecondary }}>
                        {usersLoading ? 'Loading...' : 'No users found.'}
                      </td>
                    </tr>
                  ) : (
                    users.map((u, index) => (
                      <tr key={u._id} style={{ borderBottom: index < users.length - 1 ? '1px solid ' + theme.borderColor : 'none' }}>
                        <td style={{ padding: '10px', color: theme.textColor }}>{u.name}</td>
                        <td style={{ padding: '10px', color: theme.textSecondary }}>{u.email}</td>
                        <td style={{ padding: '10px', color: theme.textSecondary }}>{u.studentId}</td>
                        <td style={{ padding: '10px' }}>
                          <span style={{
                            display: 'inline-block',
                            padding: '2px 10px',
                            borderRadius: '12px',
                            fontSize: '11px',
                            fontWeight: '600',
                            background: u.role === 'admin' ? '#1a237e20' : '#51cf6620',
                            color: u.role === 'admin' ? '#1a237e' : '#51cf66',
                            border: '1px solid ' + (u.role === 'admin' ? '#1a237e40' : '#51cf6640'),
                          }}>
                            {u.role.toUpperCase()}
                          </span>
                        </td>
                        <td style={{ padding: '10px', color: theme.textSecondary }}>{new Date(u.createdAt).toLocaleDateString()}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
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
                <h3 style={{ color: theme.textColor, margin: '0 0 20px 0' }}>Admin Settings</h3>
                <p style={{ color: theme.textSecondary }}>System settings and configuration options will appear here.</p>
              </div>
              <div style={{
                padding: '24px',
                background: theme.cardBg,
                borderRadius: '12px',
                border: '1px solid ' + theme.borderColor,
              }}>
                <h3 style={{ color: theme.textColor, margin: '0 0 20px 0' }}>System Info</h3>
                <div style={{ color: theme.textSecondary }}>
                  <p><strong>Total Items:</strong> {items.length}</p>
                  <p><strong>Total Users:</strong> {users.length}</p>
                  <p><strong>Total Claims:</strong> {claims.length}</p>
                  <p><strong>Pending Claims:</strong> {pendingClaims.length}</p>
                </div>
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

export default AdminDashboard;
