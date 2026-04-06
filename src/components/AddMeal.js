import React, { useState, useEffect } from 'react';
import api from '../services/api';

function AddMeal({ groupId, onMealAdded }) {
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [mealType, setMealType] = useState('lunch');
  const [payerId, setPayerId] = useState('');
  const [totalAmount, setTotalAmount] = useState('');
  const [splitType, setSplitType] = useState('equal');
  const [selectedMembers, setSelectedMembers] = useState([]);
  const [customAmounts, setCustomAmounts] = useState({});
  const [loading, setLoading] = useState(false);
  const [groupMembers, setGroupMembers] = useState([]);
  const [loadingMembers, setLoadingMembers] = useState(true);

  // Fetch group members when component mounts or groupId changes
  useEffect(() => {
    if (groupId) {
      loadGroupMembers();
    }
  }, [groupId]);

  const loadGroupMembers = async () => {
    setLoadingMembers(true);
    try {
      const members = await api.getGroupMembers(groupId);
      setGroupMembers(members);
    } catch (error) {
      console.error('Error loading group members:', error);
      alert('Error loading group members');
    } finally {
      setLoadingMembers(false);
    }
  };

  const handleMemberToggle = (member) => {
    const memberId = member.user_id;
    if (selectedMembers.includes(memberId)) {
      setSelectedMembers(selectedMembers.filter(id => id !== memberId));
      const newCustomAmounts = { ...customAmounts };
      delete newCustomAmounts[memberId];
      setCustomAmounts(newCustomAmounts);
    } else {
      setSelectedMembers([...selectedMembers, memberId]);
      if (splitType === 'custom') {
        setCustomAmounts({ ...customAmounts, [memberId]: 0 });
      }
    }
  };

  const handleCustomAmountChange = (memberId, amount) => {
    setCustomAmounts({ ...customAmounts, [memberId]: parseFloat(amount) || 0 });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!payerId || !totalAmount || selectedMembers.length === 0) {
      alert('Please fill all fields and select at least one member');
      return;
    }

    setLoading(true);
    
    let participants = [];
    if (splitType === 'equal') {
      participants = selectedMembers;
    } else {
      // Validate custom amounts sum to total
      const totalCustom = Object.values(customAmounts).reduce((sum, val) => sum + val, 0);
      if (Math.abs(totalCustom - parseFloat(totalAmount)) > 0.01) {
        alert(`Custom amounts sum to ${totalCustom}, but total is ${totalAmount}. Please adjust.`);
        setLoading(false);
        return;
      }
      participants = selectedMembers.map(memberId => ({
        friend_id: memberId,
        amount: customAmounts[memberId]
      }));
    }

    const mealData = {
      date,
      meal_type: mealType,
      payer_id: parseInt(payerId),
      total_amount: parseFloat(totalAmount),
      split_type: splitType,
      participants,
      group_id: groupId
    };

    try {
      await api.addMeal(mealData);
      alert('Meal added successfully!');
      // Reset form
      setPayerId('');
      setTotalAmount('');
      setSelectedMembers([]);
      setCustomAmounts({});
      onMealAdded();
    } catch (error) {
      console.error('Error adding meal:', error);
      alert(error.response?.data?.error || 'Error adding meal');
    } finally {
      setLoading(false);
    }
  };

  if (loadingMembers) {
    return <div className="card">Loading group members...</div>;
  }

  if (groupMembers.length === 0) {
    return (
      <div className="card">
        <h2>Add New Meal</h2>
        <p>No members in this group. Please add members first.</p>
      </div>
    );
  }

  return (
    <div>
      <h2>Add New Meal</h2>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Date:</label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            required
          />
        </div>

        <div className="form-group">
          <label>Meal Type:</label>
          <select value={mealType} onChange={(e) => setMealType(e.target.value)}>
            <option value="breakfast">Breakfast</option>
            <option value="lunch">Lunch</option>
          </select>
        </div>

        <div className="form-group">
          <label>Who paid?</label>
          <select value={payerId} onChange={(e) => setPayerId(e.target.value)} required>
            <option value="">Select person</option>
            {groupMembers.map(member => (
              <option key={member.user_id} value={member.user_id}>
                {member.member_name}
              </option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label>Total Amount ($):</label>
          <input
            type="number"
            step="0.01"
            value={totalAmount}
            onChange={(e) => setTotalAmount(e.target.value)}
            required
          />
        </div>

        <div className="form-group">
          <label>Split Type:</label>
          <select value={splitType} onChange={(e) => setSplitType(e.target.value)}>
            <option value="equal">Equal Split</option>
            <option value="custom">Custom Split</option>
          </select>
        </div>

        <div className="form-group">
          <label>Who ate together?</label>
          <div className="member-checkboxes">
            {groupMembers.map(member => (
              <div key={member.user_id} className="member-checkbox" style={{
                padding: '8px',
                margin: '5px 0',
                background: '#f8f9fa',
                borderRadius: '6px'
              }}>
                <label>
                  <input
                    type="checkbox"
                    checked={selectedMembers.includes(member.user_id)}
                    onChange={() => handleMemberToggle(member)}
                  />
                  {member.member_name}
                </label>
                {splitType === 'custom' && selectedMembers.includes(member.user_id) && (
                  <input
                    type="number"
                    step="0.01"
                    placeholder="Amount"
                    value={customAmounts[member.user_id] || ''}
                    onChange={(e) => handleCustomAmountChange(member.user_id, e.target.value)}
                    style={{ marginLeft: '10px', width: '100px' }}
                  />
                )}
              </div>
            ))}
          </div>
        </div>

        <button type="submit" disabled={loading}>
          {loading ? 'Adding...' : 'Add Meal'}
        </button>
      </form>
    </div>
  );
}

export default AddMeal;