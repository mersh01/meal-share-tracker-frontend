import React, { useState } from 'react';
import api from '../services/api';

function ProfileSettings({ user, onClose, onProfileUpdate }) {
  const [name, setName] = useState(user?.name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [accountNumber, setAccountNumber] = useState(user?.account_number || '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    
    if (!name.trim()) {
      setError('Name is required');
      return;
    }
    
    setLoading(true);
    
    try {
      const response = await api.updateProfile(name, phone, accountNumber);
      setSuccess('Profile updated successfully!');
      
      // Update local storage
      const updatedUser = { ...user, ...response.user };
      localStorage.setItem('user', JSON.stringify(updatedUser));
      
      setTimeout(() => {
        onProfileUpdate(updatedUser);
        onClose();
      }, 1500);
    } catch (error) {
      setError(error.response?.data?.error || error.message || 'Error updating profile');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <h2 style={{ marginBottom: '20px' }}>Edit Profile</h2>
        
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
            <label>Email (cannot be changed)</label>
            <input
              type="email"
              value={user?.email || ''}
              disabled
              style={{ background: '#f0f0f0', cursor: 'not-allowed' }}
            />
            <small style={{ color: '#666', fontSize: '0.75rem' }}>
              Email cannot be changed as it's your login identifier
            </small>
          </div>
          
          <div className="form-group">
            <label>Full Name *</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              placeholder="Enter your full name"
            />
          </div>
          
          <div className="form-group">
            <label>Phone Number</label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="Enter your phone number"
            />
            <small style={{ color: '#666', fontSize: '0.75rem' }}>
              Optional - Used for payment contact
            </small>
          </div>
          
          <div className="form-group">
            <label>Account Number</label>
            <input
              type="text"
              value={accountNumber}
              onChange={(e) => setAccountNumber(e.target.value)}
              placeholder="Enter your bank account or payment account number"
            />
            <small style={{ color: '#666', fontSize: '0.75rem' }}>
              Optional - Used for receiving payments
            </small>
          </div>
          
          <div style={{ display: 'flex', gap: '10px', marginTop: '20px', flexWrap: 'wrap' }}>
            <button type="submit" disabled={loading}>
              {loading ? 'Saving...' : 'Save Changes'}
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

export default ProfileSettings;