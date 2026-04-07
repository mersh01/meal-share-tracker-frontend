import React, { useState } from 'react';
import api from '../services/api';

function ChangePassword({ onClose, onPasswordChanged }) {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    
    if (newPassword !== confirmPassword) {
      setError('New password and confirmation do not match');
      return;
    }
    
    if (newPassword.length < 4) {
      setError('New password must be at least 4 characters');
      return;
    }
    
    setLoading(true);
    
    try {
      await api.changePassword(currentPassword, newPassword, confirmPassword);
      setSuccess('Password changed successfully! Please login again.');
      setTimeout(() => {
        onPasswordChanged();
        onClose();
        // Logout after password change
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.reload();
      }, 2000);
    } catch (error) {
      setError(error.response?.data?.error || 'Error changing password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <h2 style={{ marginBottom: '20px' }}>Change Password</h2>
        
        {error && (
          <div className="error-message" style={{ marginBottom: '15px' }}>
            {error}
          </div>
        )}
        
        {success && (
          <div className="success-message" style={{ marginBottom: '15px' }}>
            {success}
          </div>
        )}
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Current Password</label>
            <input
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              required
              autoComplete="current-password"
            />
          </div>
          
          <div className="form-group">
            <label>New Password</label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
              autoComplete="new-password"
            />
            <small style={{ color: '#666', fontSize: '0.8rem' }}>
              Password must be at least 6 characters
            </small>
          </div>
          
          <div className="form-group">
            <label>Confirm New Password</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              autoComplete="new-password"
            />
          </div>
          
          <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
            <button type="submit" disabled={loading}>
              {loading ? 'Changing...' : 'Change Password'}
            </button>
            <button type="button" onClick={onClose} style={{ background: '#6c757d' }}>
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default ChangePassword;