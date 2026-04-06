import React, { useState, useEffect } from 'react';
import api from '../services/api';

function GroupList({ onSelectGroup, selectedGroupId }) {
  const [groups, setGroups] = useState([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newGroupName, setNewGroupName] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadGroups();
  }, []);

  const loadGroups = async () => {
    try {
      const data = await api.getGroups();
      setGroups(data);
    } catch (error) {
      console.error('Error loading groups:', error);
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

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h2>My Groups</h2>
        <button onClick={() => setShowCreateModal(true)} style={{ background: '#10b981' }}>
          + New Group
        </button>
      </div>

      {groups.length === 0 ? (
        <div className="card" style={{ textAlign: 'center' }}>
          <p>No groups yet. Create your first group or wait to be invited!</p>
        </div>
      ) : (
        <div className="group-list">
          {groups.map(group => (
            <div 
              key={group.id} 
              className={`group-item ${selectedGroupId === group.id ? 'active' : ''}`}
              onClick={() => onSelectGroup(group.id)}
              style={{
                padding: '15px',
                margin: '10px 0',
                background: selectedGroupId === group.id ? '#667eea20' : '#f8f9fa',
                borderRadius: '8px',
                cursor: 'pointer',
                border: selectedGroupId === group.id ? '2px solid #667eea' : '1px solid #e0e0e0',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}
            >
              <div>
                <strong>{group.name}</strong>
                <span style={{ fontSize: '0.8em', color: '#666', marginLeft: '10px' }}>
                  {group.member_count} members
                </span>
                {!group.is_owner && (
                  <span style={{ 
                    fontSize: '0.7em', 
                    background: '#f59e0b', 
                    color: 'white', 
                    padding: '2px 6px', 
                    borderRadius: '4px',
                    marginLeft: '10px'
                  }}>
                    Invited
                  </span>
                )}
                {group.is_owner && (
                  <span style={{ 
                    fontSize: '0.7em', 
                    background: '#10b981', 
                    color: 'white', 
                    padding: '2px 6px', 
                    borderRadius: '4px',
                    marginLeft: '10px'
                  }}>
                    Owner
                  </span>
                )}
              </div>
              {group.is_owner && (
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteGroup(group.id, group.name);
                  }}
                  style={{ background: '#ef4444', padding: '5px 10px' }}
                >
                  Delete
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      {showCreateModal && (
        <div className="modal" style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.5)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 1000
        }}>
          <div className="modal-content" style={{
            background: 'white',
            padding: '30px',
            borderRadius: '12px',
            width: '400px'
          }}>
            <h3>Create New Group</h3>
            <input
              type="text"
              placeholder="Group name (e.g., Roommates, Trip to Bali)"
              value={newGroupName}
              onChange={(e) => setNewGroupName(e.target.value)}
              style={{ width: '100%', margin: '15px 0' }}
            />
            <div style={{ display: 'flex', gap: '10px' }}>
              <button onClick={createGroup} disabled={loading}>
                {loading ? 'Creating...' : 'Create'}
              </button>
              <button onClick={() => setShowCreateModal(false)} style={{ background: '#6c757d' }}>
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