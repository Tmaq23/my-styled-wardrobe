'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface User {
  id: string;
  name: string | null;
  email: string | null;
  createdAt: string;
  emailVerified: string | null;
  analysisCount?: number;
  lastActivity?: string;
  isAdmin?: boolean;
  subscription?: {
    tier: string;
    stripeSubscriptionId?: string;
    activeUntil?: string;
  } | null;
}

interface Verification {
  id: string;
  userId: string;
  bodyShape: string;
  colorPalette: string;
  amount: number;
  currency: string;
  paymentStatus: string;
  status: string;
  createdAt: string;
  verifiedAt?: string;
  user: {
    id: string;
    email: string | null;
    name: string | null;
  };
}

interface CustomShopRequest {
  id: string;
  userId: string;
  userEmail: string;
  userName: string;
  bodyShape: string;
  colorPalette: string;
  occasion: string;
  budget: string;
  preferences?: string;
  retailers: string[];
  amount: number;
  currency: string;
  paymentStatus: string;
  status: string;
  stripeSessionId?: string;
  stripePaymentIntentId?: string;
  deliveryEmail?: string;
  estimatedDelivery?: string;
  createdAt: string;
  completedAt?: string;
  user: {
    id: string;
    email: string | null;
    name: string | null;
  };
}

export default function AdminPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [verifications, setVerifications] = useState<Verification[]>([]);
  const [customShopRequests, setCustomShopRequests] = useState<CustomShopRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [verificationsLoading, setVerificationsLoading] = useState(false);
  const [customShopsLoading, setCustomShopsLoading] = useState(false);
  const [adminUsername, setAdminUsername] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [newPassword, setNewPassword] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newUserName, setNewUserName] = useState('');
  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserPassword, setNewUserPassword] = useState('');
  const [newUserIsAdmin, setNewUserIsAdmin] = useState(false);
  const [selectedCustomShopRequest, setSelectedCustomShopRequest] = useState<CustomShopRequest | null>(null);
  const [showCustomShopModal, setShowCustomShopModal] = useState(false);
  const router = useRouter();

  const loadUsers = async () => {
    try {
      setLoading(true);
      setError(''); // Clear any previous errors
      console.log('Loading users...');
      const res = await fetch('/api/admin/users', {
        credentials: 'include', // Important: include cookies
      });
      console.log('Users API response status:', res.status);
      if (res.ok) {
        const data = await res.json();
        console.log('Users loaded:', data.users?.length || 0);
        setUsers(data.users);
      } else {
        const errorText = await res.text();
        console.error('Failed to load users:', res.status, errorText);
        setError(`Failed to load users: ${res.status}`);
      }
    } catch (error) {
      console.error('Failed to load users exception:', error);
      setError('Failed to load users: Network error');
    } finally {
      setLoading(false);
    }
  };

  const loadVerifications = async () => {
    try {
      setVerificationsLoading(true);
      console.log('Loading verifications...');
      const res = await fetch('/api/verification/list?admin=true', {
        credentials: 'include', // Important: include cookies
      });
      console.log('Verifications API response status:', res.status);
      if (res.ok) {
        const data = await res.json();
        console.log('Verifications loaded:', data.verifications?.length || 0);
        setVerifications(data.verifications || []);
      } else {
        const errorText = await res.text();
        console.error('Failed to load verifications:', res.status, errorText);
      }
    } catch (error) {
      console.error('Failed to load verifications:', error);
    } finally {
      setVerificationsLoading(false);
    }
  };

  const loadCustomShopRequests = async () => {
    try {
      setCustomShopsLoading(true);
      console.log('🛍️ Loading custom shop requests...');
      const res = await fetch('/api/custom-shop/list', {
        credentials: 'include',
      });
      console.log('🛍️ Custom shop requests API response status:', res.status);
      if (res.ok) {
        const data = await res.json();
        console.log('🛍️ Custom shop requests loaded:', data.customShopRequests?.length || 0);
        console.log('🛍️ Custom shop requests data:', data);
        setCustomShopRequests(data.customShopRequests || []);
      } else {
        const errorText = await res.text();
        console.error('❌ Failed to load custom shop requests:', res.status, errorText);
        setCustomShopRequests([]); // Set to empty array on error
      }
    } catch (error) {
      console.error('❌ Failed to load custom shop requests exception:', error);
      setCustomShopRequests([]); // Set to empty array on error
    } finally {
      setCustomShopsLoading(false);
    }
  };

  const deleteVerification = async (verificationId: string, userEmail: string | null) => {
    if (!confirm(`Are you sure you want to delete this verification for ${userEmail}?\n\nThis action cannot be undone.`)) {
      return;
    }

    try {
      setActionLoading(true);
      const res = await fetch(`/api/verification/delete?id=${verificationId}`, {
        method: 'DELETE',
      });

      const data = await res.json();

      if (res.ok) {
        setSuccessMessage('Verification deleted successfully');
        loadVerifications(); // Reload the list
        setTimeout(() => setSuccessMessage(''), 3000);
      } else {
        setError(data.error || 'Failed to delete verification');
        setTimeout(() => setError(''), 3000);
      }
    } catch (error) {
      setError('Failed to delete verification');
      setTimeout(() => setError(''), 3000);
    } finally {
      setActionLoading(false);
    }
  };

  const deleteCustomShopRequest = async (requestId: string, userEmail: string | null) => {
    if (!confirm(`Are you sure you want to delete this custom shop request for ${userEmail}?\n\nThis action cannot be undone.`)) {
      return;
    }

    try {
      setActionLoading(true);
      const res = await fetch(`/api/custom-shop/delete?id=${requestId}`, {
        method: 'DELETE',
      });

      const data = await res.json();

      if (res.ok) {
        setSuccessMessage('Custom shop request deleted successfully');
        loadCustomShopRequests(); // Reload the list
        setTimeout(() => setSuccessMessage(''), 3000);
      } else {
        setError(data.error || 'Failed to delete custom shop request');
        setTimeout(() => setError(''), 3000);
      }
    } catch (error) {
      setError('Failed to delete custom shop request');
      setTimeout(() => setError(''), 3000);
    } finally {
      setActionLoading(false);
    }
  };

  const updateCustomShopStatus = async (requestId: string, newStatus: string, estimatedDelivery?: string) => {
    try {
      setActionLoading(true);
      const res = await fetch('/api/custom-shop/update-status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          requestId, 
          status: newStatus,
          estimatedDelivery 
        }),
        credentials: 'include',
      });

      const data = await res.json();

      if (res.ok) {
        setSuccessMessage(`Status updated to ${newStatus.replace('_', ' ')}`);
        loadCustomShopRequests(); // Reload the list
        
        // Update the selected request in the modal
        if (selectedCustomShopRequest && selectedCustomShopRequest.id === requestId) {
          setSelectedCustomShopRequest({
            ...selectedCustomShopRequest,
            status: newStatus,
            completedAt: newStatus === 'completed' ? new Date().toISOString() : selectedCustomShopRequest.completedAt,
            estimatedDelivery: estimatedDelivery || selectedCustomShopRequest.estimatedDelivery,
          });
        }
        
        setTimeout(() => setSuccessMessage(''), 3000);
      } else {
        setError(data.error || 'Failed to update status');
        setTimeout(() => setError(''), 3000);
      }
    } catch (error) {
      setError('Failed to update status');
      setTimeout(() => setError(''), 3000);
    } finally {
      setActionLoading(false);
    }
  };

  // Check for existing admin session on mount
  useEffect(() => {
    const checkExistingSession = async () => {
      try {
        console.log('Checking existing admin session...');
        const res = await fetch('/api/admin/check-session', {
          credentials: 'include', // Important: include cookies
        });
        console.log('Session check response status:', res.status);
        if (res.ok) {
          const data = await res.json();
          console.log('Session check data:', data);
          if (data.authenticated) {
            console.log('Admin session exists, authenticating...');
            setIsAuthenticated(true);
            loadUsers();
            loadVerifications();
            loadCustomShopRequests();
          } else {
            console.log('No admin session found');
          }
        }
      } catch (error) {
        console.error('Session check failed:', error);
      } finally {
        setLoading(false);
      }
    };
    
    checkExistingSession();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const checkAdminAuth = async (username: string, password: string) => {
    if (!username || !password) {
      setError('Please enter both username and password');
      return;
    }

    try {
      setError('');
      setActionLoading(true);
      console.log('Attempting admin login for:', username);
      
      const res = await fetch('/api/admin/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
        credentials: 'include', // Important: include cookies
      });

      console.log('Admin login response status:', res.status);
      console.log('Admin login response ok:', res.ok);
      
      let data;
      try {
        data = await res.json();
        console.log('Admin login response data:', data);
      } catch (parseError) {
        console.error('Failed to parse response:', parseError);
        setError('Failed to parse server response');
        setActionLoading(false);
        return;
      }

      if (res.ok && data.success) {
        console.log('Admin login successful');
        setIsAuthenticated(true);
        setError('');
        setActionLoading(false);
        loadUsers();
        loadVerifications(); // Load verification purchases
        loadCustomShopRequests(); // Load custom shop requests
        
        // Trigger session update in Header component
        window.dispatchEvent(new Event('sessionUpdated'));
        
        // Also check session immediately after a short delay to ensure cookie is set
        setTimeout(() => {
          window.dispatchEvent(new Event('sessionUpdated'));
        }, 500);
      } else {
        const errorMsg = data?.error || 'Invalid credentials';
        const errorType = data?.errorType || '';
        
        console.error('Admin login failed:', {
          error: errorMsg,
          errorType,
          fullResponse: data,
        });
        
        // Show user-friendly error message
        let displayError = errorMsg;
        
        // Don't show technical details to users
        if (errorType === 'DatabaseError') {
          displayError = 'Database connection issue. Please check your Supabase database is active and try again.';
        }
        
        setError(displayError);
        setActionLoading(false);
      }
    } catch (error) {
      console.error('Admin login error:', error);
      setError('Authentication failed. Please try again.');
      setActionLoading(false);
    }
  };

  const resetPassword = async (userId: string, newPassword: string) => {
    try {
      setActionLoading(true);
      const res = await fetch('/api/admin/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, newPassword }),
      });

      if (res.ok) {
        setSuccessMessage('Password reset successfully');
        setNewPassword('');
        setSelectedUser(null);
        setTimeout(() => setSuccessMessage(''), 3000);
      } else {
        setError('Failed to reset password');
      }
    } catch (error) {
      setError('Failed to reset password');
    } finally {
      setActionLoading(false);
    }
  };

  const resetAnalysisTrial = async (userId: string, email: string) => {
    try {
      setActionLoading(true);
      const res = await fetch('/api/admin/reset-trial', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, email }),
      });

      if (res.ok) {
        setSuccessMessage('AI analysis trial reset successfully');
        loadUsers(); // Reload to see updated count
        setTimeout(() => setSuccessMessage(''), 3000);
      } else {
        setError('Failed to reset trial');
      }
    } catch (error) {
      setError('Failed to reset trial');
    } finally {
      setActionLoading(false);
    }
  };

  const deleteUser = async (userId: string) => {
    if (!confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
      return;
    }

    try {
      setActionLoading(true);
      const res = await fetch('/api/admin/delete-user', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId }),
      });

      if (res.ok) {
        setSuccessMessage('User deleted successfully');
        loadUsers(); // Reload users list
        setTimeout(() => setSuccessMessage(''), 3000);
      } else {
        setError('Failed to delete user');
      }
    } catch (error) {
      setError('Failed to delete user');
    } finally {
      setActionLoading(false);
    }
  };

  const createUser = async () => {
    if (!newUserName || !newUserEmail || !newUserPassword) {
      setError('All fields are required');
      return;
    }

    try {
      setActionLoading(true);
      setError('');
      const res = await fetch('/api/admin/create-user', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          name: newUserName, 
          email: newUserEmail, 
          password: newUserPassword,
          isAdmin: newUserIsAdmin
        }),
      });

      const data = await res.json();

      if (res.ok) {
        setSuccessMessage(`${newUserIsAdmin ? 'Admin' : 'User'} created successfully: ${newUserEmail}`);
        setShowCreateModal(false);
        setNewUserName('');
        setNewUserEmail('');
        setNewUserPassword('');
        setNewUserIsAdmin(false);
        loadUsers(); // Reload users list
        setTimeout(() => setSuccessMessage(''), 3000);
      } else {
        setError(data.error || 'Failed to create user');
      }
    } catch (error) {
      setError('Failed to create user');
    } finally {
      setActionLoading(false);
    }
  };

  const toggleAdminStatus = async (userId: string, currentStatus: boolean, email: string) => {
    if (!confirm(`Are you sure you want to ${currentStatus ? 'remove' : 'grant'} admin privileges for ${email}?`)) {
      return;
    }

    try {
      setActionLoading(true);
      const res = await fetch('/api/admin/toggle-admin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, isAdmin: !currentStatus }),
      });

      if (res.ok) {
        setSuccessMessage(`Admin status updated for ${email}`);
        loadUsers();
        setTimeout(() => setSuccessMessage(''), 3000);
      } else {
        setError('Failed to update admin status');
      }
    } catch (error) {
      setError('Failed to update admin status');
    } finally {
      setActionLoading(false);
    }
  };

  const toggleSubscriptionStatus = async (userId: string, isCurrentlySubscriber: boolean, email: string) => {
    if (!confirm(`Are you sure you want to ${isCurrentlySubscriber ? 'cancel subscription for' : 'activate subscription for'} ${email}?`)) {
      return;
    }

    try {
      setActionLoading(true);
      const res = await fetch('/api/admin/toggle-subscription', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ userId, subscribe: !isCurrentlySubscriber }),
      });

      if (res.ok) {
        setSuccessMessage(`Subscription status updated for ${email}`);
        loadUsers();
        setTimeout(() => setSuccessMessage(''), 3000);
      } else {
        setError('Failed to update subscription status');
      }
    } catch (error) {
      setError('Failed to update subscription status');
    } finally {
      setActionLoading(false);
    }
  };

  const filteredUsers = users.filter(user => 
    user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (!isAuthenticated) {
    return (
      <div className="home-page compact-home" style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{
          maxWidth: '400px',
          width: '100%',
          padding: '2rem',
          background: 'rgba(255, 255, 255, 0.1)',
          backdropFilter: 'blur(10px)',
          borderRadius: '12px',
          border: '1px solid rgba(255, 255, 255, 0.2)',
        }}>
          <h1 style={{ textAlign: 'center', marginBottom: '1.5rem', color: 'white' }}>Admin Access</h1>
          {error && (
            <div style={{
              padding: '1rem',
              background: 'rgba(220, 53, 69, 0.2)',
              border: '1px solid rgba(220, 53, 69, 0.5)',
              borderRadius: '8px',
              color: '#ff6b6b',
              marginBottom: '1rem',
            }}>
              {error}
            </div>
          )}
          <input
            type="text"
            placeholder="Username (admin or email)"
            value={adminUsername}
            onChange={(e) => setAdminUsername(e.target.value)}
            style={{
              width: '100%',
              padding: '0.75rem',
              background: 'rgba(255, 255, 255, 0.1)',
              border: '1px solid rgba(255, 255, 255, 0.3)',
              borderRadius: '8px',
              color: 'white',
              marginBottom: '1rem',
            }}
          />
          <input
            type="password"
            placeholder="Enter password"
            value={adminPassword}
            onChange={(e) => setAdminPassword(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && checkAdminAuth(adminUsername, adminPassword)}
            style={{
              width: '100%',
              padding: '0.75rem',
              background: 'rgba(255, 255, 255, 0.1)',
              border: '1px solid rgba(255, 255, 255, 0.3)',
              borderRadius: '8px',
              color: 'white',
              marginBottom: '1rem',
            }}
          />
          <button
            onClick={() => checkAdminAuth(adminUsername, adminPassword)}
            disabled={actionLoading}
            style={{
              width: '100%',
              padding: '0.75rem',
              background: actionLoading 
                ? 'rgba(99, 102, 241, 0.5)' 
                : 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
              border: 'none',
              borderRadius: '8px',
              color: 'white',
              fontWeight: '600',
              cursor: actionLoading ? 'not-allowed' : 'pointer',
              opacity: actionLoading ? 0.6 : 1,
            }}
          >
            {actionLoading ? 'Authenticating...' : 'Authenticate'}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="home-page compact-home" style={{ minHeight: '100vh', paddingTop: '120px', paddingLeft: '2rem', paddingRight: '2rem', paddingBottom: '2rem' }}>
      <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
          <h1 style={{ color: 'white', margin: 0, fontSize: '2rem', fontWeight: '700' }}>Admin Dashboard</h1>
          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
            <button
              onClick={() => router.push('/admin/verifications')}
              style={{
                padding: '0.75rem 1.5rem',
                background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                fontSize: '1rem',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'transform 0.2s'
              }}
              onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
              onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
            >
              👗 Stylist Verifications
            </button>
            <button
              onClick={() => router.push('/admin/blog/create')}
              style={{
                padding: '0.75rem 1.5rem',
                background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                fontSize: '1rem',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'transform 0.2s'
              }}
              onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
              onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
            >
              ✍️ Create Blog Post
            </button>
            <button
              onClick={() => setShowCreateModal(true)}
              style={{
                padding: '0.75rem 1.5rem',
                background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                border: 'none',
                borderRadius: '8px',
                color: 'white',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.3s',
                boxShadow: '0 4px 15px rgba(16, 185, 129, 0.3)',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 6px 20px rgba(16, 185, 129, 0.4)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 4px 15px rgba(16, 185, 129, 0.3)';
              }}
            >
              + Create User
            </button>
            <button
              onClick={() => router.push('/')}
              style={{
                padding: '0.75rem 1.5rem',
                background: 'rgba(255, 255, 255, 0.1)',
                border: '1px solid rgba(255, 255, 255, 0.3)',
                borderRadius: '8px',
                color: 'white',
                cursor: 'pointer',
                transition: 'all 0.3s',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.2)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)';
              }}
            >
              Back to Home
            </button>
          </div>
        </div>

        {successMessage && (
          <div style={{
            padding: '1rem',
            background: 'rgba(40, 167, 69, 0.2)',
            border: '1px solid rgba(40, 167, 69, 0.5)',
            borderRadius: '8px',
            color: '#51cf66',
            marginBottom: '1rem',
          }}>
            {successMessage}
          </div>
        )}

        {error && (
          <div style={{
            padding: '1rem',
            background: 'rgba(220, 53, 69, 0.2)',
            border: '1px solid rgba(220, 53, 69, 0.5)',
            borderRadius: '8px',
            color: '#ff6b6b',
            marginBottom: '1rem',
          }}>
            {error}
          </div>
        )}

        {/* Verification Purchases Section */}
        <div style={{
          background: 'rgba(255, 255, 255, 0.1)',
          backdropFilter: 'blur(10px)',
          borderRadius: '12px',
          border: '1px solid rgba(255, 255, 255, 0.2)',
          padding: '1.5rem',
          marginBottom: '2rem',
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h2 style={{ color: 'white', margin: 0, fontSize: '1.5rem', fontWeight: '600' }}>
              💳 Verification Purchases
            </h2>
            <button
              onClick={loadVerifications}
              disabled={verificationsLoading}
              style={{
                padding: '0.5rem 1rem',
                background: 'rgba(59, 130, 246, 0.2)',
                border: '1px solid rgba(59, 130, 246, 0.5)',
                borderRadius: '6px',
                color: '#60a5fa',
                cursor: verificationsLoading ? 'wait' : 'pointer',
                opacity: verificationsLoading ? 0.6 : 1,
              }}
            >
              {verificationsLoading ? '🔄 Refreshing...' : '🔄 Refresh'}
            </button>
          </div>

          {verificationsLoading && verifications.length === 0 ? (
            <div style={{ color: 'rgba(255, 255, 255, 0.7)', textAlign: 'center', padding: '2rem' }}>
              Loading verification purchases...
            </div>
          ) : verifications.length === 0 ? (
            <div style={{ color: 'rgba(255, 255, 255, 0.5)', textAlign: 'center', padding: '2rem' }}>
              No verification purchases yet
            </div>
          ) : (
            <>
              {/* Summary Stats */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
                <div style={{ background: 'rgba(59, 130, 246, 0.2)', padding: '1rem', borderRadius: '8px', border: '1px solid rgba(59, 130, 246, 0.3)' }}>
                  <div style={{ fontSize: '1.5rem', fontWeight: '700', color: '#60a5fa' }}>
                    {verifications.length}
                  </div>
                  <div style={{ fontSize: '0.875rem', color: 'rgba(255, 255, 255, 0.7)' }}>Total Purchases</div>
                </div>
                <div style={{ background: 'rgba(245, 158, 11, 0.2)', padding: '1rem', borderRadius: '8px', border: '1px solid rgba(245, 158, 11, 0.3)' }}>
                  <div style={{ fontSize: '1.5rem', fontWeight: '700', color: '#fbbf24' }}>
                    {verifications.filter(v => v.status === 'pending').length}
                  </div>
                  <div style={{ fontSize: '0.875rem', color: 'rgba(255, 255, 255, 0.7)' }}>Pending</div>
                </div>
                <div style={{ background: 'rgba(139, 92, 246, 0.2)', padding: '1rem', borderRadius: '8px', border: '1px solid rgba(139, 92, 246, 0.3)' }}>
                  <div style={{ fontSize: '1.5rem', fontWeight: '700', color: '#a78bfa' }}>
                    {verifications.filter(v => v.status === 'in_review').length}
                  </div>
                  <div style={{ fontSize: '0.875rem', color: 'rgba(255, 255, 255, 0.7)' }}>In Review</div>
                </div>
                <div style={{ background: 'rgba(16, 185, 129, 0.2)', padding: '1rem', borderRadius: '8px', border: '1px solid rgba(16, 185, 129, 0.3)' }}>
                  <div style={{ fontSize: '1.5rem', fontWeight: '700', color: '#34d399' }}>
                    {verifications.filter(v => v.status === 'verified').length}
                  </div>
                  <div style={{ fontSize: '0.875rem', color: 'rgba(255, 255, 255, 0.7)' }}>Verified</div>
                </div>
              </div>

              {/* Verification List Table */}
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.2)' }}>
                      <th style={{ padding: '0.75rem', textAlign: 'left', color: 'rgba(255, 255, 255, 0.8)', fontWeight: '600' }}>User</th>
                      <th style={{ padding: '0.75rem', textAlign: 'left', color: 'rgba(255, 255, 255, 0.8)', fontWeight: '600' }}>Analysis</th>
                      <th style={{ padding: '0.75rem', textAlign: 'left', color: 'rgba(255, 255, 255, 0.8)', fontWeight: '600' }}>Amount</th>
                      <th style={{ padding: '0.75rem', textAlign: 'center', color: 'rgba(255, 255, 255, 0.8)', fontWeight: '600' }}>Payment</th>
                      <th style={{ padding: '0.75rem', textAlign: 'center', color: 'rgba(255, 255, 255, 0.8)', fontWeight: '600' }}>Status</th>
                      <th style={{ padding: '0.75rem', textAlign: 'left', color: 'rgba(255, 255, 255, 0.8)', fontWeight: '600' }}>Date</th>
                      <th style={{ padding: '0.75rem', textAlign: 'center', color: 'rgba(255, 255, 255, 0.8)', fontWeight: '600' }}>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {verifications.map((verification) => {
                      const paymentStatusColors = {
                        pending: { bg: 'rgba(251, 191, 36, 0.2)', border: 'rgba(251, 191, 36, 0.5)', text: '#fbbf24' },
                        paid: { bg: 'rgba(34, 197, 94, 0.2)', border: 'rgba(34, 197, 94, 0.5)', text: '#22c55e' },
                        failed: { bg: 'rgba(239, 68, 68, 0.2)', border: 'rgba(239, 68, 68, 0.5)', text: '#ef4444' },
                      };
                      const statusColors = {
                        pending: { bg: 'rgba(251, 191, 36, 0.2)', border: 'rgba(251, 191, 36, 0.5)', text: '#fbbf24' },
                        in_review: { bg: 'rgba(139, 92, 246, 0.2)', border: 'rgba(139, 92, 246, 0.5)', text: '#a78bfa' },
                        verified: { bg: 'rgba(16, 185, 129, 0.2)', border: 'rgba(16, 185, 129, 0.5)', text: '#10b981' },
                        rejected: { bg: 'rgba(239, 68, 68, 0.2)', border: 'rgba(239, 68, 68, 0.5)', text: '#ef4444' },
                      };
                      
                      const paymentColor = paymentStatusColors[verification.paymentStatus as keyof typeof paymentStatusColors] || paymentStatusColors.pending;
                      const statusColor = statusColors[verification.status as keyof typeof statusColors] || statusColors.pending;
                      
                      return (
                        <tr key={verification.id} style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.1)' }}>
                          <td style={{ padding: '1rem' }}>
                            <div style={{ color: 'white', fontWeight: '500' }}>
                              {verification.user.name || 'Unnamed User'}
                            </div>
                            <div style={{ fontSize: '0.875rem', color: 'rgba(255, 255, 255, 0.6)' }}>
                              {verification.user.email}
                            </div>
                          </td>
                          <td style={{ padding: '1rem' }}>
                            <div style={{ fontSize: '0.875rem', color: 'rgba(255, 255, 255, 0.9)' }}>
                              <strong>Shape:</strong> {verification.bodyShape}
                            </div>
                            <div style={{ fontSize: '0.875rem', color: 'rgba(255, 255, 255, 0.9)' }}>
                              <strong>Palette:</strong> {verification.colorPalette}
                            </div>
                          </td>
                          <td style={{ padding: '1rem', color: 'rgba(255, 255, 255, 0.9)' }}>
                            £{verification.amount.toFixed(2)}
                          </td>
                          <td style={{ padding: '1rem', textAlign: 'center' }}>
                            <span style={{
                              padding: '0.25rem 0.75rem',
                              borderRadius: '12px',
                              fontSize: '0.75rem',
                              fontWeight: '600',
                              background: paymentColor.bg,
                              border: `1px solid ${paymentColor.border}`,
                              color: paymentColor.text,
                              textTransform: 'capitalize',
                            }}>
                              {verification.paymentStatus}
                            </span>
                          </td>
                          <td style={{ padding: '1rem', textAlign: 'center' }}>
                            <span style={{
                              padding: '0.25rem 0.75rem',
                              borderRadius: '12px',
                              fontSize: '0.75rem',
                              fontWeight: '600',
                              background: statusColor.bg,
                              border: `1px solid ${statusColor.border}`,
                              color: statusColor.text,
                              textTransform: 'capitalize',
                            }}>
                              {verification.status.replace('_', ' ')}
                            </span>
                          </td>
                          <td style={{ padding: '1rem', color: 'rgba(255, 255, 255, 0.7)', fontSize: '0.875rem' }}>
                            {new Date(verification.createdAt).toLocaleDateString()}
                          </td>
                          <td style={{ padding: '1rem', textAlign: 'center' }}>
                            <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center' }}>
                              <button
                                onClick={() => router.push('/admin/verifications')}
                                style={{
                                  padding: '0.5rem 1rem',
                                  background: 'rgba(59, 130, 246, 0.2)',
                                  border: '1px solid rgba(59, 130, 246, 0.5)',
                                  borderRadius: '6px',
                                  color: '#60a5fa',
                                  cursor: 'pointer',
                                  fontSize: '0.875rem',
                                }}
                              >
                                {verification.status === 'pending' || verification.status === 'in_review' ? 'Review' : 'View'}
                              </button>
                              <button
                                onClick={() => deleteVerification(verification.id, verification.user.email)}
                                disabled={actionLoading}
                                style={{
                                  padding: '0.5rem 1rem',
                                  background: 'rgba(239, 68, 68, 0.2)',
                                  border: '1px solid rgba(239, 68, 68, 0.5)',
                                  borderRadius: '6px',
                                  color: '#ef4444',
                                  cursor: actionLoading ? 'not-allowed' : 'pointer',
                                  fontSize: '0.875rem',
                                  opacity: actionLoading ? 0.5 : 1,
                                }}
                              >
                                Delete
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </div>

        {/* Custom Shop Requests Section */}
        <div style={{
          background: 'rgba(255, 255, 255, 0.1)',
          backdropFilter: 'blur(10px)',
          borderRadius: '12px',
          border: '1px solid rgba(255, 255, 255, 0.2)',
          padding: '1.5rem',
          marginBottom: '2rem',
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h2 style={{ color: 'white', margin: 0, fontSize: '1.5rem', fontWeight: '600' }}>
              🛍️ Custom Shop Requests
            </h2>
            <button
              onClick={loadCustomShopRequests}
              disabled={customShopsLoading}
              style={{
                padding: '0.5rem 1rem',
                background: 'rgba(59, 130, 246, 0.2)',
                border: '1px solid rgba(59, 130, 246, 0.5)',
                borderRadius: '6px',
                color: '#60a5fa',
                cursor: customShopsLoading ? 'wait' : 'pointer',
                opacity: customShopsLoading ? 0.6 : 1,
              }}
            >
              {customShopsLoading ? '🔄 Refreshing...' : '🔄 Refresh'}
            </button>
          </div>

          {customShopsLoading && customShopRequests.length === 0 ? (
            <div style={{ color: 'rgba(255, 255, 255, 0.7)', textAlign: 'center', padding: '2rem' }}>
              Loading custom shop requests...
            </div>
          ) : customShopRequests.length === 0 ? (
            <div style={{ color: 'rgba(255, 255, 255, 0.5)', textAlign: 'center', padding: '2rem' }}>
              No custom shop requests yet
            </div>
          ) : (
            <>
              {/* Summary Stats */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
                <div style={{ background: 'rgba(59, 130, 246, 0.2)', padding: '1rem', borderRadius: '8px', border: '1px solid rgba(59, 130, 246, 0.3)' }}>
                  <div style={{ fontSize: '1.5rem', fontWeight: '700', color: '#60a5fa' }}>
                    {customShopRequests.length}
                  </div>
                  <div style={{ fontSize: '0.875rem', color: 'rgba(255, 255, 255, 0.7)' }}>Total Requests</div>
                </div>
                <div style={{ background: 'rgba(245, 158, 11, 0.2)', padding: '1rem', borderRadius: '8px', border: '1px solid rgba(245, 158, 11, 0.3)' }}>
                  <div style={{ fontSize: '1.5rem', fontWeight: '700', color: '#fbbf24' }}>
                    {customShopRequests.filter(r => r.status === 'pending').length}
                  </div>
                  <div style={{ fontSize: '0.875rem', color: 'rgba(255, 255, 255, 0.7)' }}>Pending</div>
                </div>
                <div style={{ background: 'rgba(139, 92, 246, 0.2)', padding: '1rem', borderRadius: '8px', border: '1px solid rgba(139, 92, 246, 0.3)' }}>
                  <div style={{ fontSize: '1.5rem', fontWeight: '700', color: '#a78bfa' }}>
                    {customShopRequests.filter(r => r.status === 'in_progress').length}
                  </div>
                  <div style={{ fontSize: '0.875rem', color: 'rgba(255, 255, 255, 0.7)' }}>In Progress</div>
                </div>
                <div style={{ background: 'rgba(16, 185, 129, 0.2)', padding: '1rem', borderRadius: '8px', border: '1px solid rgba(16, 185, 129, 0.3)' }}>
                  <div style={{ fontSize: '1.5rem', fontWeight: '700', color: '#34d399' }}>
                    {customShopRequests.filter(r => r.status === 'completed').length}
                  </div>
                  <div style={{ fontSize: '0.875rem', color: 'rgba(255, 255, 255, 0.7)' }}>Completed</div>
                </div>
              </div>

              {/* Custom Shop Requests Table */}
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.2)' }}>
                      <th style={{ padding: '0.75rem', textAlign: 'left', color: 'rgba(255, 255, 255, 0.8)', fontWeight: '600' }}>User</th>
                      <th style={{ padding: '0.75rem', textAlign: 'left', color: 'rgba(255, 255, 255, 0.8)', fontWeight: '600' }}>Details</th>
                      <th style={{ padding: '0.75rem', textAlign: 'left', color: 'rgba(255, 255, 255, 0.8)', fontWeight: '600' }}>Amount</th>
                      <th style={{ padding: '0.75rem', textAlign: 'center', color: 'rgba(255, 255, 255, 0.8)', fontWeight: '600' }}>Payment</th>
                      <th style={{ padding: '0.75rem', textAlign: 'center', color: 'rgba(255, 255, 255, 0.8)', fontWeight: '600' }}>Status</th>
                      <th style={{ padding: '0.75rem', textAlign: 'left', color: 'rgba(255, 255, 255, 0.8)', fontWeight: '600' }}>Date</th>
                      <th style={{ padding: '0.75rem', textAlign: 'center', color: 'rgba(255, 255, 255, 0.8)', fontWeight: '600' }}>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {customShopRequests.map((request) => {
                      const paymentStatusColors = {
                        pending: { bg: 'rgba(251, 191, 36, 0.2)', border: 'rgba(251, 191, 36, 0.5)', text: '#fbbf24' },
                        paid: { bg: 'rgba(34, 197, 94, 0.2)', border: 'rgba(34, 197, 94, 0.5)', text: '#22c55e' },
                        failed: { bg: 'rgba(239, 68, 68, 0.2)', border: 'rgba(239, 68, 68, 0.5)', text: '#ef4444' },
                      };
                      const statusColors = {
                        pending: { bg: 'rgba(251, 191, 36, 0.2)', border: 'rgba(251, 191, 36, 0.5)', text: '#fbbf24' },
                        in_progress: { bg: 'rgba(139, 92, 246, 0.2)', border: 'rgba(139, 92, 246, 0.5)', text: '#a78bfa' },
                        completed: { bg: 'rgba(16, 185, 129, 0.2)', border: 'rgba(16, 185, 129, 0.5)', text: '#10b981' },
                        cancelled: { bg: 'rgba(239, 68, 68, 0.2)', border: 'rgba(239, 68, 68, 0.5)', text: '#ef4444' },
                      };
                      
                      const paymentColor = paymentStatusColors[request.paymentStatus as keyof typeof paymentStatusColors] || paymentStatusColors.pending;
                      const statusColor = statusColors[request.status as keyof typeof statusColors] || statusColors.pending;
                      
                      return (
                        <tr key={request.id} style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.1)' }}>
                          <td style={{ padding: '1rem' }}>
                            <div style={{ color: 'white', fontWeight: '500' }}>
                              {request.user.name || 'Unnamed User'}
                            </div>
                            <div style={{ fontSize: '0.875rem', color: 'rgba(255, 255, 255, 0.6)' }}>
                              {request.user.email}
                            </div>
                          </td>
                          <td style={{ padding: '1rem' }}>
                            <div style={{ fontSize: '0.875rem', color: 'rgba(255, 255, 255, 0.9)' }}>
                              <strong>Occasion:</strong> {request.occasion}
                            </div>
                            <div style={{ fontSize: '0.875rem', color: 'rgba(255, 255, 255, 0.9)' }}>
                              <strong>Budget:</strong> {request.budget}
                            </div>
                            <div style={{ fontSize: '0.875rem', color: 'rgba(255, 255, 255, 0.7)' }}>
                              {request.bodyShape} • {request.colorPalette}
                            </div>
                          </td>
                          <td style={{ padding: '1rem', color: 'rgba(255, 255, 255, 0.9)', fontWeight: '600' }}>
                            £{request.amount.toFixed(2)}
                          </td>
                          <td style={{ padding: '1rem', textAlign: 'center' }}>
                            <span style={{
                              padding: '0.25rem 0.75rem',
                              borderRadius: '12px',
                              fontSize: '0.75rem',
                              fontWeight: '600',
                              background: paymentColor.bg,
                              border: `1px solid ${paymentColor.border}`,
                              color: paymentColor.text,
                              textTransform: 'capitalize',
                            }}>
                              {request.paymentStatus}
                            </span>
                          </td>
                          <td style={{ padding: '1rem', textAlign: 'center' }}>
                            <span style={{
                              padding: '0.25rem 0.75rem',
                              borderRadius: '12px',
                              fontSize: '0.75rem',
                              fontWeight: '600',
                              background: statusColor.bg,
                              border: `1px solid ${statusColor.border}`,
                              color: statusColor.text,
                              textTransform: 'capitalize',
                            }}>
                              {request.status.replace('_', ' ')}
                            </span>
                          </td>
                          <td style={{ padding: '1rem', color: 'rgba(255, 255, 255, 0.7)', fontSize: '0.875rem' }}>
                            {new Date(request.createdAt).toLocaleDateString()}
                          </td>
                          <td style={{ padding: '1rem', textAlign: 'center' }}>
                            <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center' }}>
                              <button
                                onClick={() => {
                                  setSelectedCustomShopRequest(request);
                                  setShowCustomShopModal(true);
                                }}
                                style={{
                                  padding: '0.5rem 1rem',
                                  background: 'rgba(59, 130, 246, 0.2)',
                                  border: '1px solid rgba(59, 130, 246, 0.5)',
                                  borderRadius: '6px',
                                  color: '#60a5fa',
                                  cursor: 'pointer',
                                  fontSize: '0.875rem',
                                }}
                              >
                                View
                              </button>
                              <button
                                onClick={() => deleteCustomShopRequest(request.id, request.user.email)}
                                disabled={actionLoading}
                                style={{
                                  padding: '0.5rem 1rem',
                                  background: 'rgba(239, 68, 68, 0.2)',
                                  border: '1px solid rgba(239, 68, 68, 0.5)',
                                  borderRadius: '6px',
                                  color: '#ef4444',
                                  cursor: actionLoading ? 'not-allowed' : 'pointer',
                                  fontSize: '0.875rem',
                                  opacity: actionLoading ? 0.5 : 1,
                                }}
                              >
                                Delete
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </div>

        {/* User Management Section */}
        <div style={{
          background: 'rgba(255, 255, 255, 0.1)',
          backdropFilter: 'blur(10px)',
          borderRadius: '12px',
          border: '1px solid rgba(255, 255, 255, 0.2)',
          padding: '1.5rem',
          marginBottom: '2rem',
        }}>
          <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
            <input
              type="text"
              placeholder="Search users by email or name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                flex: 1,
                padding: '0.75rem',
                background: 'rgba(255, 255, 255, 0.1)',
                border: '1px solid rgba(255, 255, 255, 0.3)',
                borderRadius: '8px',
                color: 'white',
              }}
            />
            <button
              onClick={loadUsers}
              disabled={loading}
              style={{
                padding: '0.75rem 1.5rem',
                background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
                border: 'none',
                borderRadius: '8px',
                color: 'white',
                fontWeight: '600',
                cursor: loading ? 'not-allowed' : 'pointer',
                opacity: loading ? 0.6 : 1,
              }}
            >
              {loading ? 'Loading...' : 'Refresh'}
            </button>
          </div>

          <div style={{ color: 'rgba(255, 255, 255, 0.7)', fontSize: '0.9rem' }}>
            Total Users: {users.length} | Showing: {filteredUsers.length}
          </div>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', color: 'white', padding: '3rem' }}>
            Loading users...
          </div>
        ) : (
          <div style={{ 
            background: 'rgba(255, 255, 255, 0.1)',
            backdropFilter: 'blur(10px)',
            borderRadius: '12px',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            overflow: 'hidden',
          }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: 'rgba(0, 0, 0, 0.2)' }}>
                  <th style={{ padding: '1rem', textAlign: 'left', color: 'white', fontWeight: '600' }}>Name</th>
                  <th style={{ padding: '1rem', textAlign: 'left', color: 'white', fontWeight: '600' }}>Email</th>
                  <th style={{ padding: '1rem', textAlign: 'center', color: 'white', fontWeight: '600' }}>Role</th>
                  <th style={{ padding: '1rem', textAlign: 'center', color: 'white', fontWeight: '600' }}>Subscription</th>
                  <th style={{ padding: '1rem', textAlign: 'left', color: 'white', fontWeight: '600' }}>Created</th>
                  <th style={{ padding: '1rem', textAlign: 'center', color: 'white', fontWeight: '600' }}>AI Analyses</th>
                  <th style={{ padding: '1rem', textAlign: 'center', color: 'white', fontWeight: '600' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((user) => (
                  <tr key={user.id} style={{ borderTop: '1px solid rgba(255, 255, 255, 0.1)' }}>
                    <td style={{ padding: '1rem', color: 'rgba(255, 255, 255, 0.9)' }}>{user.name || 'N/A'}</td>
                    <td style={{ padding: '1rem', color: 'rgba(255, 255, 255, 0.9)' }}>{user.email}</td>
                    <td style={{ padding: '1rem', textAlign: 'center' }}>
                      {user.isAdmin ? (
                        <span style={{ 
                          padding: '0.25rem 0.75rem', 
                          background: 'rgba(139, 92, 246, 0.3)', 
                          border: '1px solid rgba(139, 92, 246, 0.5)',
                          borderRadius: '12px',
                          color: '#a78bfa',
                          fontSize: '0.85rem',
                          fontWeight: '600'
                        }}>
                          Admin
                        </span>
                      ) : (
                        <span style={{ 
                          padding: '0.25rem 0.75rem', 
                          background: 'rgba(148, 163, 184, 0.2)', 
                          border: '1px solid rgba(148, 163, 184, 0.3)',
                          borderRadius: '12px',
                          color: 'rgba(255, 255, 255, 0.6)',
                          fontSize: '0.85rem'
                        }}>
                          User
                        </span>
                      )}
                    </td>
                    <td style={{ padding: '1rem', textAlign: 'center' }}>
                      {user.subscription?.tier === 'premium' && user.subscription?.stripeSubscriptionId ? (
                        <span style={{ 
                          padding: '0.25rem 0.75rem', 
                          background: 'rgba(16, 185, 129, 0.3)', 
                          border: '1px solid rgba(16, 185, 129, 0.5)',
                          borderRadius: '12px',
                          color: '#10b981',
                          fontSize: '0.85rem',
                          fontWeight: '600'
                        }}>
                          ✅ Subscriber
                        </span>
                      ) : (
                        <span style={{ 
                          padding: '0.25rem 0.75rem', 
                          background: 'rgba(148, 163, 184, 0.2)', 
                          border: '1px solid rgba(148, 163, 184, 0.3)',
                          borderRadius: '12px',
                          color: 'rgba(255, 255, 255, 0.6)',
                          fontSize: '0.85rem'
                        }}>
                          Free
                        </span>
                      )}
                    </td>
                    <td style={{ padding: '1rem', color: 'rgba(255, 255, 255, 0.7)', fontSize: '0.9rem' }}>
                      {new Date(user.createdAt).toLocaleDateString()}
                    </td>
                    <td style={{ padding: '1rem', textAlign: 'center', color: 'rgba(255, 255, 255, 0.9)' }}>
                      {user.analysisCount || 0}
                    </td>
                    <td style={{ padding: '0.75rem' }}>
                      <div style={{ 
                        display: 'grid', 
                        gridTemplateColumns: 'repeat(2, 1fr)',
                        gap: '0.4rem',
                        maxWidth: '280px',
                      }}>
                        <button
                          onClick={() => toggleAdminStatus(user.id, user.isAdmin || false, user.email || '')}
                          disabled={actionLoading}
                          style={{
                            padding: '0.4rem 0.6rem',
                            background: user.isAdmin ? 'rgba(245, 158, 11, 0.3)' : 'rgba(139, 92, 246, 0.3)',
                            border: user.isAdmin ? '1px solid rgba(245, 158, 11, 0.5)' : '1px solid rgba(139, 92, 246, 0.5)',
                            borderRadius: '6px',
                            color: 'white',
                            fontSize: '0.75rem',
                            cursor: actionLoading ? 'not-allowed' : 'pointer',
                            opacity: actionLoading ? 0.6 : 1,
                            whiteSpace: 'nowrap',
                          }}
                        >
                          {user.isAdmin ? '🔓 Admin' : '🔒 Admin'}
                        </button>
                        <button
                          onClick={() => toggleSubscriptionStatus(
                            user.id, 
                            user.subscription?.tier === 'premium' && !!user.subscription?.stripeSubscriptionId,
                            user.email || ''
                          )}
                          disabled={actionLoading}
                          style={{
                            padding: '0.4rem 0.6rem',
                            background: (user.subscription?.tier === 'premium' && user.subscription?.stripeSubscriptionId) ? 'rgba(239, 68, 68, 0.3)' : 'rgba(16, 185, 129, 0.3)',
                            border: (user.subscription?.tier === 'premium' && user.subscription?.stripeSubscriptionId) ? '1px solid rgba(239, 68, 68, 0.5)' : '1px solid rgba(16, 185, 129, 0.5)',
                            borderRadius: '6px',
                            color: 'white',
                            fontSize: '0.75rem',
                            cursor: actionLoading ? 'not-allowed' : 'pointer',
                            opacity: actionLoading ? 0.6 : 1,
                            whiteSpace: 'nowrap',
                          }}
                        >
                          {(user.subscription?.tier === 'premium' && user.subscription?.stripeSubscriptionId) ? '❌ Sub' : '✅ Sub'}
                        </button>
                        <button
                          onClick={() => setSelectedUser(user)}
                          disabled={actionLoading}
                          style={{
                            padding: '0.4rem 0.6rem',
                            background: 'rgba(99, 102, 241, 0.3)',
                            border: '1px solid rgba(99, 102, 241, 0.5)',
                            borderRadius: '6px',
                            color: 'white',
                            fontSize: '0.75rem',
                            cursor: actionLoading ? 'not-allowed' : 'pointer',
                            opacity: actionLoading ? 0.6 : 1,
                            whiteSpace: 'nowrap',
                          }}
                        >
                          🔑 Pass
                        </button>
                        <button
                          onClick={() => resetAnalysisTrial(user.id, user.email || '')}
                          disabled={actionLoading}
                          style={{
                            padding: '0.4rem 0.6rem',
                            background: 'rgba(40, 167, 69, 0.3)',
                            border: '1px solid rgba(40, 167, 69, 0.5)',
                            borderRadius: '6px',
                            color: 'white',
                            fontSize: '0.75rem',
                            cursor: actionLoading ? 'not-allowed' : 'pointer',
                            opacity: actionLoading ? 0.6 : 1,
                            whiteSpace: 'nowrap',
                          }}
                        >
                          🔄 Trial
                        </button>
                        <button
                          onClick={() => deleteUser(user.id)}
                          disabled={actionLoading}
                          style={{
                            padding: '0.4rem 0.6rem',
                            background: 'rgba(220, 53, 69, 0.3)',
                            border: '1px solid rgba(220, 53, 69, 0.5)',
                            borderRadius: '6px',
                            color: 'white',
                            fontSize: '0.75rem',
                            cursor: actionLoading ? 'not-allowed' : 'pointer',
                            opacity: actionLoading ? 0.6 : 1,
                            whiteSpace: 'nowrap',
                            gridColumn: 'span 2',
                          }}
                        >
                          🗑️ Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filteredUsers.length === 0 && (
              <div style={{ padding: '3rem', textAlign: 'center', color: 'rgba(255, 255, 255, 0.6)' }}>
                No users found
              </div>
            )}
          </div>
        )}

        {selectedUser && (
          <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0, 0, 0, 0.7)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
          }}>
            <div style={{
              background: 'linear-gradient(135deg, rgba(30, 30, 60, 0.95) 0%, rgba(50, 50, 80, 0.95) 100%)',
              backdropFilter: 'blur(20px)',
              borderRadius: '12px',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              padding: '2rem',
              maxWidth: '400px',
              width: '90%',
            }}>
              <h3 style={{ color: 'white', marginBottom: '1.5rem' }}>
                Reset Password for {selectedUser.email}
              </h3>
              <input
                type="password"
                placeholder="Enter new password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  background: 'rgba(255, 255, 255, 0.1)',
                  border: '1px solid rgba(255, 255, 255, 0.3)',
                  borderRadius: '8px',
                  color: 'white',
                  marginBottom: '1rem',
                }}
              />
              <div style={{ display: 'flex', gap: '0.75rem' }}>
                <button
                  onClick={() => resetPassword(selectedUser.id, newPassword)}
                  disabled={actionLoading || !newPassword}
                  style={{
                    flex: 1,
                    padding: '0.75rem',
                    background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
                    border: 'none',
                    borderRadius: '8px',
                    color: 'white',
                    fontWeight: '600',
                    cursor: (actionLoading || !newPassword) ? 'not-allowed' : 'pointer',
                    opacity: (actionLoading || !newPassword) ? 0.6 : 1,
                  }}
                >
                  {actionLoading ? 'Resetting...' : 'Reset Password'}
                </button>
                <button
                  onClick={() => {
                    setSelectedUser(null);
                    setNewPassword('');
                  }}
                  disabled={actionLoading}
                  style={{
                    padding: '0.75rem 1.5rem',
                    background: 'rgba(255, 255, 255, 0.1)',
                    border: '1px solid rgba(255, 255, 255, 0.3)',
                    borderRadius: '8px',
                    color: 'white',
                    cursor: actionLoading ? 'not-allowed' : 'pointer',
                    opacity: actionLoading ? 0.6 : 1,
                  }}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {showCreateModal && (
          <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0, 0, 0, 0.7)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
          }}>
            <div style={{
              background: 'linear-gradient(135deg, rgba(30, 30, 60, 0.95) 0%, rgba(50, 50, 80, 0.95) 100%)',
              backdropFilter: 'blur(20px)',
              borderRadius: '12px',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              padding: '2rem',
              maxWidth: '450px',
              width: '90%',
            }}>
              <h3 style={{ color: 'white', marginBottom: '1.5rem', fontSize: '1.5rem', fontWeight: '700' }}>
                Create New User
              </h3>
              
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', color: 'rgba(255, 255, 255, 0.8)', marginBottom: '0.5rem', fontSize: '0.9rem' }}>
                  Full Name
                </label>
                <input
                  type="text"
                  placeholder="Enter full name"
                  value={newUserName}
                  onChange={(e) => setNewUserName(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    background: 'rgba(255, 255, 255, 0.1)',
                    border: '1px solid rgba(255, 255, 255, 0.3)',
                    borderRadius: '8px',
                    color: 'white',
                    fontSize: '1rem',
                  }}
                />
              </div>

              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', color: 'rgba(255, 255, 255, 0.8)', marginBottom: '0.5rem', fontSize: '0.9rem' }}>
                  Email Address
                </label>
                <input
                  type="email"
                  placeholder="Enter email address"
                  value={newUserEmail}
                  onChange={(e) => setNewUserEmail(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    background: 'rgba(255, 255, 255, 0.1)',
                    border: '1px solid rgba(255, 255, 255, 0.3)',
                    borderRadius: '8px',
                    color: 'white',
                    fontSize: '1rem',
                  }}
                />
              </div>

              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', color: 'rgba(255, 255, 255, 0.8)', marginBottom: '0.5rem', fontSize: '0.9rem' }}>
                  Password
                </label>
                <input
                  type="password"
                  placeholder="Enter password"
                  value={newUserPassword}
                  onChange={(e) => setNewUserPassword(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    background: 'rgba(255, 255, 255, 0.1)',
                    border: '1px solid rgba(255, 255, 255, 0.3)',
                    borderRadius: '8px',
                    color: 'white',
                    fontSize: '1rem',
                  }}
                />
              </div>

              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '0.75rem', 
                  color: 'rgba(255, 255, 255, 0.9)', 
                  cursor: 'pointer',
                  padding: '0.75rem',
                  background: 'rgba(139, 92, 246, 0.1)',
                  border: '1px solid rgba(139, 92, 246, 0.3)',
                  borderRadius: '8px',
                  transition: 'all 0.3s'
                }}>
                  <input
                    type="checkbox"
                    checked={newUserIsAdmin}
                    onChange={(e) => setNewUserIsAdmin(e.target.checked)}
                    style={{
                      width: '18px',
                      height: '18px',
                      cursor: 'pointer',
                    }}
                  />
                  <span style={{ fontSize: '0.95rem', fontWeight: '500' }}>
                    Grant Admin Privileges
                  </span>
                  <span style={{ 
                    marginLeft: 'auto',
                    padding: '0.25rem 0.75rem',
                    background: newUserIsAdmin ? 'rgba(139, 92, 246, 0.3)' : 'rgba(148, 163, 184, 0.2)',
                    border: newUserIsAdmin ? '1px solid rgba(139, 92, 246, 0.5)' : '1px solid rgba(148, 163, 184, 0.3)',
                    borderRadius: '12px',
                    fontSize: '0.75rem',
                    color: newUserIsAdmin ? '#a78bfa' : 'rgba(255, 255, 255, 0.6)',
                    fontWeight: '600'
                  }}>
                    {newUserIsAdmin ? 'Admin' : 'User'}
                  </span>
                </label>
              </div>

              <div style={{ display: 'flex', gap: '0.75rem' }}>
                <button
                  onClick={createUser}
                  disabled={actionLoading || !newUserName || !newUserEmail || !newUserPassword}
                  style={{
                    flex: 1,
                    padding: '0.875rem',
                    background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                    border: 'none',
                    borderRadius: '8px',
                    color: 'white',
                    fontWeight: '600',
                    fontSize: '1rem',
                    cursor: (actionLoading || !newUserName || !newUserEmail || !newUserPassword) ? 'not-allowed' : 'pointer',
                    opacity: (actionLoading || !newUserName || !newUserEmail || !newUserPassword) ? 0.6 : 1,
                    transition: 'all 0.3s',
                  }}
                >
                  {actionLoading ? 'Creating...' : 'Create User'}
                </button>
                <button
                  onClick={() => {
                    setShowCreateModal(false);
                    setNewUserName('');
                    setNewUserEmail('');
                    setNewUserPassword('');
                    setError('');
                  }}
                  disabled={actionLoading}
                  style={{
                    padding: '0.875rem 1.5rem',
                    background: 'rgba(255, 255, 255, 0.1)',
                    border: '1px solid rgba(255, 255, 255, 0.3)',
                    borderRadius: '8px',
                    color: 'white',
                    fontWeight: '600',
                    cursor: actionLoading ? 'not-allowed' : 'pointer',
                    opacity: actionLoading ? 0.6 : 1,
                    transition: 'all 0.3s',
                  }}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Custom Shop Request Details Modal */}
        {showCustomShopModal && selectedCustomShopRequest && (
          <div 
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: 'rgba(0, 0, 0, 0.8)',
              backdropFilter: 'blur(5px)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 1000,
              padding: '2rem',
            }}
            onClick={() => setShowCustomShopModal(false)}
          >
            <div 
              style={{
                background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.95) 0%, rgba(30, 41, 59, 0.95) 100%)',
                backdropFilter: 'blur(20px)',
                borderRadius: '16px',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                padding: '2rem',
                maxWidth: '800px',
                width: '100%',
                maxHeight: '90vh',
                overflowY: 'auto',
                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
              }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <h2 style={{ color: 'white', margin: 0, fontSize: '1.75rem', fontWeight: '700' }}>
                  🛍️ Custom Shop Request Details
                </h2>
                <button
                  onClick={() => setShowCustomShopModal(false)}
                  style={{
                    background: 'rgba(239, 68, 68, 0.2)',
                    border: '1px solid rgba(239, 68, 68, 0.5)',
                    borderRadius: '8px',
                    color: '#ef4444',
                    cursor: 'pointer',
                    padding: '0.5rem 1rem',
                    fontWeight: '600',
                  }}
                >
                  Close
                </button>
              </div>

              {/* Customer Info */}
              <div style={{
                background: 'rgba(59, 130, 246, 0.1)',
                border: '1px solid rgba(59, 130, 246, 0.3)',
                borderRadius: '12px',
                padding: '1.5rem',
                marginBottom: '1.5rem',
              }}>
                <h3 style={{ color: '#60a5fa', margin: '0 0 1rem 0', fontSize: '1.25rem', fontWeight: '600' }}>
                  Customer Information
                </h3>
                <div style={{ display: 'grid', gap: '0.75rem' }}>
                  <div>
                    <span style={{ color: 'rgba(255, 255, 255, 0.6)', fontSize: '0.875rem' }}>Name:</span>
                    <div style={{ color: 'white', fontWeight: '500' }}>{selectedCustomShopRequest.userName}</div>
                  </div>
                  <div>
                    <span style={{ color: 'rgba(255, 255, 255, 0.6)', fontSize: '0.875rem' }}>Email:</span>
                    <div style={{ color: 'white', fontWeight: '500' }}>{selectedCustomShopRequest.userEmail}</div>
                  </div>
                  <div>
                    <span style={{ color: 'rgba(255, 255, 255, 0.6)', fontSize: '0.875rem' }}>Request Date:</span>
                    <div style={{ color: 'white', fontWeight: '500' }}>
                      {new Date(selectedCustomShopRequest.createdAt).toLocaleString()}
                    </div>
                  </div>
                </div>
              </div>

              {/* Styling Details */}
              <div style={{
                background: 'rgba(139, 92, 246, 0.1)',
                border: '1px solid rgba(139, 92, 246, 0.3)',
                borderRadius: '12px',
                padding: '1.5rem',
                marginBottom: '1.5rem',
              }}>
                <h3 style={{ color: '#a78bfa', margin: '0 0 1rem 0', fontSize: '1.25rem', fontWeight: '600' }}>
                  Styling Details
                </h3>
                <div style={{ display: 'grid', gap: '1rem' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                    <div>
                      <span style={{ color: 'rgba(255, 255, 255, 0.6)', fontSize: '0.875rem' }}>Body Shape:</span>
                      <div style={{ color: 'white', fontWeight: '500', textTransform: 'capitalize' }}>
                        {selectedCustomShopRequest.bodyShape}
                      </div>
                    </div>
                    <div>
                      <span style={{ color: 'rgba(255, 255, 255, 0.6)', fontSize: '0.875rem' }}>Color Palette:</span>
                      <div style={{ color: 'white', fontWeight: '500', textTransform: 'capitalize' }}>
                        {selectedCustomShopRequest.colorPalette}
                      </div>
                    </div>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                    <div>
                      <span style={{ color: 'rgba(255, 255, 255, 0.6)', fontSize: '0.875rem' }}>Occasion:</span>
                      <div style={{ color: 'white', fontWeight: '500', textTransform: 'capitalize' }}>
                        {selectedCustomShopRequest.occasion}
                      </div>
                    </div>
                    <div>
                      <span style={{ color: 'rgba(255, 255, 255, 0.6)', fontSize: '0.875rem' }}>Budget:</span>
                      <div style={{ color: 'white', fontWeight: '500' }}>
                        {selectedCustomShopRequest.budget}
                      </div>
                    </div>
                  </div>
                  {selectedCustomShopRequest.preferences && (
                    <div>
                      <span style={{ color: 'rgba(255, 255, 255, 0.6)', fontSize: '0.875rem' }}>Style Preferences:</span>
                      <div style={{ 
                        color: 'white', 
                        marginTop: '0.5rem', 
                        padding: '1rem',
                        background: 'rgba(0, 0, 0, 0.2)',
                        borderRadius: '8px',
                        whiteSpace: 'pre-wrap',
                      }}>
                        {selectedCustomShopRequest.preferences}
                      </div>
                    </div>
                  )}
                  {selectedCustomShopRequest.retailers && selectedCustomShopRequest.retailers.length > 0 && (
                    <div>
                      <span style={{ color: 'rgba(255, 255, 255, 0.6)', fontSize: '0.875rem' }}>Preferred Retailers:</span>
                      <div style={{ 
                        display: 'flex', 
                        flexWrap: 'wrap', 
                        gap: '0.5rem', 
                        marginTop: '0.5rem' 
                      }}>
                        {selectedCustomShopRequest.retailers.map((retailer, idx) => (
                          <span 
                            key={idx}
                            style={{
                              padding: '0.375rem 0.75rem',
                              background: 'rgba(139, 92, 246, 0.2)',
                              border: '1px solid rgba(139, 92, 246, 0.4)',
                              borderRadius: '6px',
                              color: '#a78bfa',
                              fontSize: '0.875rem',
                              fontWeight: '500',
                            }}
                          >
                            {retailer}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Payment & Status */}
              <div style={{
                background: 'rgba(34, 197, 94, 0.1)',
                border: '1px solid rgba(34, 197, 94, 0.3)',
                borderRadius: '12px',
                padding: '1.5rem',
                marginBottom: '1.5rem',
              }}>
                <h3 style={{ color: '#22c55e', margin: '0 0 1rem 0', fontSize: '1.25rem', fontWeight: '600' }}>
                  Payment & Status
                </h3>
                <div style={{ display: 'grid', gap: '0.75rem' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                    <div>
                      <span style={{ color: 'rgba(255, 255, 255, 0.6)', fontSize: '0.875rem' }}>Amount:</span>
                      <div style={{ color: 'white', fontWeight: '600', fontSize: '1.25rem' }}>
                        £{selectedCustomShopRequest.amount.toFixed(2)}
                      </div>
                    </div>
                    <div>
                      <span style={{ color: 'rgba(255, 255, 255, 0.6)', fontSize: '0.875rem' }}>Payment Status:</span>
                      <div>
                        <span style={{
                          padding: '0.375rem 0.875rem',
                          borderRadius: '12px',
                          fontSize: '0.875rem',
                          fontWeight: '600',
                          background: selectedCustomShopRequest.paymentStatus === 'paid' 
                            ? 'rgba(34, 197, 94, 0.2)' 
                            : 'rgba(251, 191, 36, 0.2)',
                          border: selectedCustomShopRequest.paymentStatus === 'paid'
                            ? '1px solid rgba(34, 197, 94, 0.5)'
                            : '1px solid rgba(251, 191, 36, 0.5)',
                          color: selectedCustomShopRequest.paymentStatus === 'paid' 
                            ? '#22c55e' 
                            : '#fbbf24',
                          textTransform: 'capitalize',
                        }}>
                          {selectedCustomShopRequest.paymentStatus}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                    <div>
                      <span style={{ color: 'rgba(255, 255, 255, 0.6)', fontSize: '0.875rem' }}>Service Status:</span>
                      <div>
                        <span style={{
                          padding: '0.375rem 0.875rem',
                          borderRadius: '12px',
                          fontSize: '0.875rem',
                          fontWeight: '600',
                          background: selectedCustomShopRequest.status === 'completed'
                            ? 'rgba(16, 185, 129, 0.2)'
                            : selectedCustomShopRequest.status === 'in_progress'
                            ? 'rgba(139, 92, 246, 0.2)'
                            : 'rgba(251, 191, 36, 0.2)',
                          border: selectedCustomShopRequest.status === 'completed'
                            ? '1px solid rgba(16, 185, 129, 0.5)'
                            : selectedCustomShopRequest.status === 'in_progress'
                            ? '1px solid rgba(139, 92, 246, 0.5)'
                            : '1px solid rgba(251, 191, 36, 0.5)',
                          color: selectedCustomShopRequest.status === 'completed'
                            ? '#10b981'
                            : selectedCustomShopRequest.status === 'in_progress'
                            ? '#a78bfa'
                            : '#fbbf24',
                          textTransform: 'capitalize',
                        }}>
                          {selectedCustomShopRequest.status.replace('_', ' ')}
                        </span>
                      </div>
                    </div>
                    {selectedCustomShopRequest.estimatedDelivery && (
                      <div>
                        <span style={{ color: 'rgba(255, 255, 255, 0.6)', fontSize: '0.875rem' }}>Estimated Delivery:</span>
                        <div style={{ color: 'white', fontWeight: '500' }}>
                          {selectedCustomShopRequest.estimatedDelivery}
                        </div>
                      </div>
                    )}
                  </div>
                  {selectedCustomShopRequest.stripePaymentIntentId && (
                    <div>
                      <span style={{ color: 'rgba(255, 255, 255, 0.6)', fontSize: '0.875rem' }}>Stripe Payment ID:</span>
                      <div style={{ 
                        color: 'rgba(255, 255, 255, 0.8)', 
                        fontSize: '0.875rem',
                        fontFamily: 'monospace',
                        marginTop: '0.25rem',
                      }}>
                        {selectedCustomShopRequest.stripePaymentIntentId}
                      </div>
                    </div>
                  )}
                  {selectedCustomShopRequest.completedAt && (
                    <div>
                      <span style={{ color: 'rgba(255, 255, 255, 0.6)', fontSize: '0.875rem' }}>Completed On:</span>
                      <div style={{ color: 'white', fontWeight: '500' }}>
                        {new Date(selectedCustomShopRequest.completedAt).toLocaleString()}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Status Change Buttons */}
              <div style={{
                background: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '12px',
                padding: '1.5rem',
                marginBottom: '1.5rem',
              }}>
                <h3 style={{ color: 'white', margin: '0 0 1rem 0', fontSize: '1.25rem', fontWeight: '600' }}>
                  Update Status
                </h3>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem' }}>
                  {selectedCustomShopRequest.status === 'pending' && (
                    <button
                      onClick={() => updateCustomShopStatus(selectedCustomShopRequest.id, 'in_progress', '2-3 business days')}
                      disabled={actionLoading}
                      style={{
                        padding: '0.75rem 1.5rem',
                        background: 'rgba(139, 92, 246, 0.2)',
                        border: '1px solid rgba(139, 92, 246, 0.5)',
                        borderRadius: '8px',
                        color: '#a78bfa',
                        cursor: actionLoading ? 'not-allowed' : 'pointer',
                        fontSize: '0.875rem',
                        fontWeight: '600',
                        opacity: actionLoading ? 0.5 : 1,
                      }}
                    >
                      ▶️ Start Working on Request
                    </button>
                  )}
                  {selectedCustomShopRequest.status === 'in_progress' && (
                    <button
                      onClick={() => updateCustomShopStatus(selectedCustomShopRequest.id, 'completed')}
                      disabled={actionLoading}
                      style={{
                        padding: '0.75rem 1.5rem',
                        background: 'rgba(16, 185, 129, 0.2)',
                        border: '1px solid rgba(16, 185, 129, 0.5)',
                        borderRadius: '8px',
                        color: '#10b981',
                        cursor: actionLoading ? 'not-allowed' : 'pointer',
                        fontSize: '0.875rem',
                        fontWeight: '600',
                        opacity: actionLoading ? 0.5 : 1,
                      }}
                    >
                      ✅ Mark as Completed
                    </button>
                  )}
                  {selectedCustomShopRequest.status !== 'completed' && selectedCustomShopRequest.status !== 'cancelled' && (
                    <button
                      onClick={() => {
                        if (confirm('Are you sure you want to cancel this request?')) {
                          updateCustomShopStatus(selectedCustomShopRequest.id, 'cancelled');
                        }
                      }}
                      disabled={actionLoading}
                      style={{
                        padding: '0.75rem 1.5rem',
                        background: 'rgba(245, 158, 11, 0.2)',
                        border: '1px solid rgba(245, 158, 11, 0.5)',
                        borderRadius: '8px',
                        color: '#f59e0b',
                        cursor: actionLoading ? 'not-allowed' : 'pointer',
                        fontSize: '0.875rem',
                        fontWeight: '600',
                        opacity: actionLoading ? 0.5 : 1,
                      }}
                    >
                      ❌ Cancel Request
                    </button>
                  )}
                  {selectedCustomShopRequest.status === 'completed' && (
                    <div style={{ 
                      padding: '0.75rem 1.5rem',
                      background: 'rgba(16, 185, 129, 0.2)',
                      border: '1px solid rgba(16, 185, 129, 0.5)',
                      borderRadius: '8px',
                      color: '#10b981',
                      fontSize: '0.875rem',
                      fontWeight: '600',
                    }}>
                      ✅ This request has been completed
                    </div>
                  )}
                  {selectedCustomShopRequest.status === 'cancelled' && (
                    <div style={{ 
                      padding: '0.75rem 1.5rem',
                      background: 'rgba(239, 68, 68, 0.2)',
                      border: '1px solid rgba(239, 68, 68, 0.5)',
                      borderRadius: '8px',
                      color: '#ef4444',
                      fontSize: '0.875rem',
                      fontWeight: '600',
                    }}>
                      ❌ This request has been cancelled
                    </div>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
                <button
                  onClick={() => {
                    setShowCustomShopModal(false);
                    deleteCustomShopRequest(selectedCustomShopRequest.id, selectedCustomShopRequest.user.email);
                  }}
                  disabled={actionLoading}
                  style={{
                    padding: '0.75rem 1.5rem',
                    background: 'rgba(239, 68, 68, 0.2)',
                    border: '1px solid rgba(239, 68, 68, 0.5)',
                    borderRadius: '8px',
                    color: '#ef4444',
                    cursor: actionLoading ? 'not-allowed' : 'pointer',
                    fontSize: '0.875rem',
                    fontWeight: '600',
                    opacity: actionLoading ? 0.5 : 1,
                  }}
                >
                  Delete Request
                </button>
                <button
                  onClick={() => setShowCustomShopModal(false)}
                  style={{
                    padding: '0.75rem 1.5rem',
                    background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
                    border: 'none',
                    borderRadius: '8px',
                    color: 'white',
                    cursor: 'pointer',
                    fontSize: '0.875rem',
                    fontWeight: '600',
                  }}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

