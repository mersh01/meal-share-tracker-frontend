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
    return <div className="card">Select a group to manage members</div>;
  }

  return (
    <div className="card">
      <h3>Group Members</h3>
      
      <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
        <input
          type="email"
          placeholder="Enter email to invite"
          value={inviteEmail}
          onChange={(e) => setInviteEmail(e.target.value)}
          style={{ flex: 1 }}
        />
        <button onClick={addMember} disabled={loading} style={{ background: '#10b981' }}>
          + Add Member
        </button>
      </div>
      
      <div>
        {members.map(member => (
          <div key={member.id} style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '10px',
            borderBottom: '1px solid #e0e0e0'
          }}>
            <div>
              <strong>{member.member_name}</strong>
              <span style={{ fontSize: '0.8em', color: '#666', marginLeft: '10px' }}>
                {member.email}
              </span>
            </div>
            <button 
              onClick={() => removeMember(member.user_id, member.member_name)}
              style={{ background: '#ef4444', padding: '5px 10px' }}
            >
              Remove
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

export default GroupMembers;