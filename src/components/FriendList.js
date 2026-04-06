import React, { useState } from 'react';
import api from '../services/api';

function FriendList({ friends, onFriendChange }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [loading, setLoading] = useState(false);

  const searchUsers = async () => {
    if (searchQuery.length < 2) {
      alert('Please enter at least 2 characters to search');
      return;
    }
    
    setSearching(true);
    try {
      const results = await api.searchUsers(searchQuery);
      setSearchResults(results);
    } catch (error) {
      console.error('Error searching users:', error);
      alert('Error searching for users');
    } finally {
      setSearching(false);
    }
  };

  const addFriend = async (userId, name) => {
    setLoading(true);
    try {
      await api.addFriend(userId, name);
      alert(`${name} added to your friends!`);
      setSearchQuery('');
      setSearchResults([]);
      onFriendChange();
    } catch (error) {
      console.error('Error adding friend:', error);
      alert(error.response?.data?.error || 'Error adding friend');
    } finally {
      setLoading(false);
    }
  };

  const removeFriend = async (friendId, name) => {
    if (window.confirm(`Remove ${name} from your friends?`)) {
      try {
        await api.deleteFriend(friendId);
        onFriendChange();
      } catch (error) {
        console.error('Error removing friend:', error);
        alert('Error removing friend');
      }
    }
  };

  return (
    <div>
      <h2>My Friends</h2>
      
      <div className="card">
        <h3>Add New Friend</h3>
        <p style={{ fontSize: '0.9em', color: '#666', marginBottom: '10px' }}>
          Search by email or name to find registered users
        </p>
        <div style={{ display: 'flex', gap: '10px', marginBottom: '15px' }}>
          <input
            type="text"
            placeholder="Search by email or name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{ flex: 1 }}
            onKeyPress={(e) => e.key === 'Enter' && searchUsers()}
          />
          <button onClick={searchUsers} disabled={searching}>
            {searching ? 'Searching...' : '🔍 Search'}
          </button>
        </div>
        
        {searchResults.length > 0 && (
          <div style={{ marginTop: '15px' }}>
            <h4>Search Results:</h4>
            {searchResults.map(user => (
              <div key={user.id} style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '10px',
                margin: '5px 0',
                background: '#f0f0f0',
                borderRadius: '6px'
              }}>
                <div>
                  <strong>{user.name}</strong>
                  <span style={{ fontSize: '0.8em', color: '#666', marginLeft: '10px' }}>
                    {user.email}
                  </span>
                </div>
                <button 
                  onClick={() => addFriend(user.id, user.name)}
                  disabled={loading}
                  style={{ background: '#10b981', padding: '5px 15px' }}
                >
                  + Add Friend
                </button>
              </div>
            ))}
          </div>
        )}
        
        {searchQuery && searchResults.length === 0 && !searching && (
          <p style={{ color: '#666', marginTop: '10px' }}>
            No users found. Make sure they have registered first.
          </p>
        )}
      </div>

      <div className="friend-list">
        <h3>Your Friends ({friends.length})</h3>
        {friends.length === 0 ? (
          <p>No friends added yet. Search and add friends above!</p>
        ) : (
          friends.map(friend => (
            <div key={friend.id} className="friend-item">
              <div>
                <strong>{friend.name}</strong>
                <span style={{ fontSize: '0.8em', color: '#666', marginLeft: '10px' }}>
                  {friend.email}
                </span>
              </div>
              <button 
                onClick={() => removeFriend(friend.id, friend.name)}
                style={{ background: '#ef4444', padding: '5px 10px' }}
              >
                Remove
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default FriendList;