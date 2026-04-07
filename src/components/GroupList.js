import React, { useState, useEffect } from 'react';
import api from '../services/api';

function GroupList({ onSelectGroup, selectedGroupId }) {
  const [groups, setGroups] = useState([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newGroupName, setNewGroupName] = useState('');
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true); // New state for initial load

  useEffect(() => {
    loadGroups();
  }, []);

  const loadGroups = async () => {
    setInitialLoading(true);
    try {
      const data = await api.getGroups();
      setGroups(data);
    } catch (error) {
      console.error('Error loading groups:', error);
    } finally {
      setInitialLoading(false);
    }
  };

  const createGroup = async () => {
    if (!newGroupName.trim()) {
      alert('Please enter a group name');
      return;
    }
    
    setLoading(true);
    try {
      await api.createGroup(newGroupName);
      setNewGroupName('');
      setShowCreateModal(false);
      await loadGroups();
    } catch (error) {
      alert(error.response?.data?.error || 'Error creating group');
    } finally {
      setLoading(false);
    }
  };

  const deleteGroup = async (groupId, groupName) => {
    if (window.confirm(`Delete group "${groupName}"? This will delete all meals and settlements in this group.`)) {
      try {
        await api.deleteGroup(groupId);
        await loadGroups();
        if (selectedGroupId === groupId) {
          onSelectGroup(null);
        }
      } catch (error) {
        alert('Error deleting group');
      }
    }
  };

  // Show loading spinner while fetching groups
  if (initialLoading) {
    return (
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '10px' }}>
          <h2>My Groups</h2>
          <button onClick={() => setShowCreateModal(true)} style={{ background: '#10b981' }}>
            + New Group
          </button>
        </div>
        <div className="card text-center">
          <div className="loading-spinner">
            <div className="spinner"></div>
            <p>Loading your groups...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '10px' }}>
        <h2>My Groups</h2>
        <button onClick={() => setShowCreateModal(true)} style={{ background: '#10b981' }}>
          + New Group
        </button>
      </div>

      {groups.length === 0 ? (
        <div className="card text-center">
          <p>No groups yet. Create your first group or wait to be invited!</p>
        </div>
      ) : (
        <div className="group-list">
          {groups.map(group => (
            <div 
              key={group.id} 
              className={`group-card ${selectedGroupId === group.id ? 'active' : ''}`}
              onClick={() => onSelectGroup(group.id)}
            >
              <div className="group-info">
                <div>
                  <span className="group-name">{group.name}</span>
                  <span style={{ fontSize: '0.8em', color: '#666', marginLeft: '10px' }}>
                    {group.member_count} members
                  </span>
                </div>
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
                  <span className={`group-badge ${group.is_owner ? 'badge-owner' : 'badge-invited'}`}>
                    {group.is_owner ? 'Owner' : 'Member'}
                  </span>
                  {group.is_owner && (
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteGroup(group.id, group.name);
                      }}
                      style={{ background: '#ef4444', padding: '5px 10px', fontSize: '0.8rem' }}
                    >
                      Delete
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {showCreateModal && (
        <div className="modal">
          <div className="modal-content">
            <h3 style={{ marginBottom: '20px' }}>Create New Group</h3>
            <input
              type="text"
              placeholder="Group name (e.g., Roommates, Trip to Bali)"
              value={newGroupName}
              onChange={(e) => setNewGroupName(e.target.value)}
              style={{ width: '100%', marginBottom: '20px' }}
              onKeyPress={(e) => e.key === 'Enter' && createGroup()}
            />
            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
              <button onClick={createGroup} disabled={loading} style={{ flex: 1 }}>
                {loading ? 'Creating...' : 'Create'}
              </button>
              <button onClick={() => setShowCreateModal(false)} style={{ background: '#6c757d', flex: 1 }}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default GroupList;