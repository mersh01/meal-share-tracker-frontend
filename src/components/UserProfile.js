import React, { useState, useEffect } from 'react';
import api from '../services/api';

function UserProfile({ user, onUpdate }) {
  const [phone, setPhone] = useState(user?.phone || '');
  const [accountNumber, setAccountNumber] = useState(user?.account_number || '');
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleUpdate = async () => {
    setLoading(true);
    setMessage('');
    try {
      const response = await api.updateProfile(phone, accountNumber);
      localStorage.setItem('user', JSON.stringify(response.user));
      onUpdate(response.user);
      setMessage('Profile updated successfully!');
      setEditing(false);
    } catch (error) {
      setMessage(error.message || 'Error updating profile');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card">
      <h3>Profile Information</h3>
      <div className="form-group">
        <label>Name:</label>
        <p className="user-info">{user?.name}</p>
      </div>
      <div className="form-group">
        <label>Email:</label>
        <p className="user-info">{user?.email}</p>
      </div>
      {editing ? (
        <>
          <div className="form-group">
            <label>Phone Number:</label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="Enter phone number"
            />
          </div>
          <div className="form-group">
            <label>Account Number:</label>
            <input
              type="text"
              value={accountNumber}
              onChange={(e) => setAccountNumber(e.target.value)}
              placeholder="Enter account number"
            />
          </div>
          <div style={{ display: 'flex', gap: '10px' }}>
            <button onClick={handleUpdate} disabled={loading}>
              {loading ? 'Saving...' : 'Save'}
            </button>
            <button onClick={() => setEditing(false)} style={{ background: '#6c757d' }}>
              Cancel
            </button>
          </div>
        </>
      ) : (
        <>
          <div className="form-group">
            <label>Phone Number:</label>
            <p className="user-info">{user?.phone || 'Not provided'}</p>
          </div>
          <div className="form-group">
            <label>Account Number:</label>
            <p className="user-info">{user?.account_number || 'Not provided'}</p>
          </div>
          <button onClick={() => setEditing(true)}>Edit Profile</button>
        </>
      )}
      {message && (
        <div className={message.includes('success') ? 'success-message' : 'error-message'} style={{ marginTop: '10px' }}>
          {message}
        </div>
      )}
    </div>
  );
}

export default UserProfile;