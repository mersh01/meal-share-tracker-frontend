import React, { useState, useEffect } from 'react';
import api from '../services/api';

function GroupMembers({ groupId, onMemberChange }) {
  const [members, setMembers] = useState([]);
  const [inviteEmail, setInviteEmail] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (groupId) {
      loadMembers();
    }
  }, [groupId]);

  const loadMembers = async () => {
    try {
      const data = await api.getGroupMembers(groupId);
      setMembers(data);
    } catch (error) {
      console.error('Error loading members:', error);
    }
  };

  const addMember = async () => {
    if (!inviteEmail.trim()) {
      alert('Please enter an email address');
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

  return (
    <div>
      <h2>Group Members</h2>
      
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
      
      <div className="member-list">
        <h3>Current Members ({members.length})</h3>
        {members.length === 0 ? (
          <div className="card text-center">
            <p>No members yet. Invite someone to join!</p>
          </div>
        ) : (
          members.map(member => (
            <div key={member.id} className="member-card">
              <div className="member-info">
                <div className="member-name">{member.member_name}</div>
                <div className="member-email">{member.email}</div>
              </div>
              <button 
                onClick={() => removeMember(member.user_id, member.member_name)}
                className="remove-btn"
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

export default GroupMembers;