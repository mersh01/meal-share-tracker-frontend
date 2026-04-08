import React, { useState, useEffect } from 'react';
import api from '../services/api';

function GroupMembers({ groupId, onMemberChange }) {
  const [members, setMembers] = useState([]);
  const [inviteEmail, setInviteEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true); // For initial members load
  const [isOwner, setIsOwner] = useState(false);
  const [ownerId, setOwnerId] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    // Get current user from localStorage
    const userStr = localStorage.getItem('user');
    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        setCurrentUser(user);
      } catch (e) {
        console.error('Error parsing user:', e);
      }
    }
  }, []);

  useEffect(() => {
    if (groupId) {
      loadMembers();
    }
  }, [groupId]);

  const loadMembers = async () => {
    setInitialLoading(true);
    try {
      const data = await api.getGroupMembers(groupId);
      setMembers(data.members || []);
      setIsOwner(data.isOwner || false);
      setOwnerId(data.ownerId);
    } catch (error) {
      console.error('Error loading members:', error);
    } finally {
      setInitialLoading(false);
    }
  };

  const addMember = async () => {
    if (!inviteEmail.trim()) {
      alert('Please enter an email address');
      return;
    }
    
    if (!isOwner) {
      alert('Only the group owner can add members');
      return;
    }
    
    setLoading(true);
    try {
      await api.addGroupMember(groupId, inviteEmail);
      setInviteEmail('');
      await loadMembers();
      onMemberChange();
    } catch (error) {
      alert(error.response?.data?.error || 'Error adding member');
    } finally {
      setLoading(false);
    }
  };

  const removeMember = async (memberId, memberName) => {
    if (!isOwner) {
      alert('Only the group owner can remove members');
      return;
    }
    
    if (window.confirm(`Remove ${memberName} from this group?`)) {
      try {
        await api.removeGroupMember(groupId, memberId);
        await loadMembers();
        onMemberChange();
      } catch (error) {
        alert('Error removing member');
      }
    }
  };

  if (!groupId) {
    return <div className="card text-center">Select a group to manage members</div>;
  }

  // Show loading spinner while fetching members
  if (initialLoading) {
    return (
      <div>
        <h2>Group Members</h2>
        <div className="card text-center">
          <div className="loading-spinner">
            <div className="spinner"></div>
            <p>Loading members...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <h2>Group Members</h2>
      
      {!isOwner && (
        <div className="card" style={{ background: '#fef3c7', borderLeft: '4px solid #f59e0b', marginBottom: '20px' }}>
          <p style={{ margin: 0 }}>
            ℹ️ You are a member of this group.
          </p>
        </div>
      )}
      
      {isOwner && (
        <div className="add-member-section">
          <div className="add-member-title">
            <span>👥</span> Add New Member
          </div>
          <div className="add-member-input-group">
            <input
              type="email"
              placeholder="Enter email to invite"
              value={inviteEmail}
              onChange={(e) => setInviteEmail(e.target.value)}
              className="add-member-input"
              onKeyPress={(e) => e.key === 'Enter' && addMember()}
              disabled={loading}
            />
            <button 
              onClick={addMember} 
              disabled={loading} 
              className="add-member-btn"
            >
              {loading ? 'Adding...' : '+ Add Member'}
            </button>
          </div>
        </div>
      )}
      
      <div className="member-list">
        <h3>Current Members ({members.length})</h3>
        {members.length === 0 ? (
          <div className="card text-center">
            <p>No members yet. Invite someone to join!</p>
          </div>
        ) : (
          members.map(member => {
            const isGroupOwner = member.is_owner || member.user_id === ownerId;
            
            return (
              <div key={member.id} className="member-card">
                <div className="member-info">
                  <div className="member-name">
                    {member.member_name}
                    {isGroupOwner && (
                      <span style={{ 
                        fontSize: '0.7em', 
                        background: '#10b981', 
                        color: 'white', 
                        padding: '2px 8px', 
                        borderRadius: '12px',
                        marginLeft: '10px'
                      }}>
                        Owner
                      </span>
                    )}
                  </div>
                  <div className="member-email">{member.email}</div>
                </div>
                {isOwner && !isGroupOwner && (
                  <button 
                    onClick={() => removeMember(member.user_id, member.member_name)}
                    className="remove-btn"
                  >
                    Remove
                  </button>
                )}
                {!isOwner && isGroupOwner && (
                  <span style={{ fontSize: '0.8em', color: '#666' }}>Group Owner</span>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

export default GroupMembers;