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
}

export default function AdminPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
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
  const router = useRouter();

  const checkAdminAuth = async (username: string, password: string) => {
    try {
      const res = await fetch('/api/admin/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });

      if (res.ok) {
        setIsAuthenticated(true);
        setError('');
        loadUsers();
        
        // Trigger session update in Header component
        window.dispatchEvent(new Event('sessionUpdated'));
        
        // Also check session immediately after a short delay to ensure cookie is set
        setTimeout(() => {
          window.dispatchEvent(new Event('sessionUpdated'));
        }, 500);
      } else {
        const data = await res.json();
        setError(data.error || 'Invalid credentials');
      }
    } catch (error) {
      setError('Authentication failed');
    }
  };

  const loadUsers = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/admin/users');
      if (res.ok) {
        const data = await res.json();
        setUsers(data.users);
      } else {
        setError('Failed to load users');
      }
    } catch (error) {
      setError('Failed to load users');
    } finally {
      setLoading(false);
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
            style={{
              width: '100%',
              padding: '0.75rem',
              background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
              border: 'none',
              borderRadius: '8px',
              color: 'white',
              fontWeight: '600',
              cursor: 'pointer',
            }}
          >
            Authenticate
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
                    <td style={{ padding: '1rem', color: 'rgba(255, 255, 255, 0.7)', fontSize: '0.9rem' }}>
                      {new Date(user.createdAt).toLocaleDateString()}
                    </td>
                    <td style={{ padding: '1rem', textAlign: 'center', color: 'rgba(255, 255, 255, 0.9)' }}>
                      {user.analysisCount || 0}
                    </td>
                    <td style={{ padding: '1rem' }}>
                      <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center', flexWrap: 'wrap' }}>
                        <button
                          onClick={() => toggleAdminStatus(user.id, user.isAdmin || false, user.email || '')}
                          disabled={actionLoading}
                          style={{
                            padding: '0.5rem 1rem',
                            background: user.isAdmin ? 'rgba(245, 158, 11, 0.3)' : 'rgba(139, 92, 246, 0.3)',
                            border: user.isAdmin ? '1px solid rgba(245, 158, 11, 0.5)' : '1px solid rgba(139, 92, 246, 0.5)',
                            borderRadius: '6px',
                            color: 'white',
                            fontSize: '0.85rem',
                            cursor: actionLoading ? 'not-allowed' : 'pointer',
                            opacity: actionLoading ? 0.6 : 1,
                          }}
                        >
                          {user.isAdmin ? 'Remove Admin' : 'Make Admin'}
                        </button>
                        <button
                          onClick={() => setSelectedUser(user)}
                          disabled={actionLoading}
                          style={{
                            padding: '0.5rem 1rem',
                            background: 'rgba(99, 102, 241, 0.3)',
                            border: '1px solid rgba(99, 102, 241, 0.5)',
                            borderRadius: '6px',
                            color: 'white',
                            fontSize: '0.85rem',
                            cursor: actionLoading ? 'not-allowed' : 'pointer',
                            opacity: actionLoading ? 0.6 : 1,
                          }}
                        >
                          Reset Pass
                        </button>
                        <button
                          onClick={() => resetAnalysisTrial(user.id, user.email || '')}
                          disabled={actionLoading}
                          style={{
                            padding: '0.5rem 1rem',
                            background: 'rgba(40, 167, 69, 0.3)',
                            border: '1px solid rgba(40, 167, 69, 0.5)',
                            borderRadius: '6px',
                            color: 'white',
                            fontSize: '0.85rem',
                            cursor: actionLoading ? 'not-allowed' : 'pointer',
                            opacity: actionLoading ? 0.6 : 1,
                          }}
                        >
                          Reset Trial
                        </button>
                        <button
                          onClick={() => deleteUser(user.id)}
                          disabled={actionLoading}
                          style={{
                            padding: '0.5rem 1rem',
                            background: 'rgba(220, 53, 69, 0.3)',
                            border: '1px solid rgba(220, 53, 69, 0.5)',
                            borderRadius: '6px',
                            color: 'white',
                            fontSize: '0.85rem',
                            cursor: actionLoading ? 'not-allowed' : 'pointer',
                            opacity: actionLoading ? 0.6 : 1,
                          }}
                        >
                          Delete
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
      </div>
    </div>
  );
}

