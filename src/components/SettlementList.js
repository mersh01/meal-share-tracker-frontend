import React, { useState, useEffect } from 'react';
import api from '../services/api';

function SettlementList({ groupId, refreshTrigger, onConfirm }) {
  const [settlements, setSettlements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    // Get current user from localStorage
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    setCurrentUser(user);
  }, []);

  useEffect(() => {
    if (groupId) {
      loadSettlements();
    }
  }, [refreshTrigger, groupId]);

  const loadSettlements = async () => {
    setLoading(true);
    try {
      const data = await api.getSettlements(groupId);
      setSettlements(data);
    } catch (error) {
      console.error('Error loading settlements:', error);
    } finally {
      setLoading(false);
    }
  };

  const confirmSettlement = async (id) => {
    if (window.confirm('Confirm that you received this payment?')) {
      try {
        await api.confirmSettlement(id);
        alert('✓ Payment confirmed! The balance has been updated.');
        await loadSettlements();
        onConfirm();
      } catch (error) {
        console.error('Error confirming settlement:', error);
        alert(error.message || 'Error confirming settlement');
      }
    }
  };

  const pendingSettlements = settlements.filter(s => s.confirmed === 0);
  const confirmedSettlements = settlements.filter(s => s.confirmed === 1);

  if (loading) {
    return <div>Loading settlements...</div>;
  }

  if (!groupId) {
    return <div className="card">Please select a group to view settlements</div>;
  }

  return (
    <div>
      <h2>Settlement History</h2>
      
      {pendingSettlements.length > 0 && (
        <div className="card" style={{ background: '#fef3c7' }}>
          <h3>⏳ Pending Confirmations</h3>
          <p style={{ fontSize: '0.9em', color: '#666', marginBottom: '15px' }}>
            {pendingSettlements.some(p => p.to_friend_id === currentUser?.id) 
              ? "💰 Someone has paid you. Click 'Confirm Receipt' after receiving the money."
              : "📤 You have recorded payments waiting for the receiver to confirm."}
          </p>
          {pendingSettlements.map(settlement => {
            const isReceiver = settlement.to_friend_id === currentUser?.id;
            const isPayer = settlement.from_friend_id === currentUser?.id;
            
            return (
              <div key={settlement.id} style={{
                padding: '15px',
                margin: '10px 0',
                background: isReceiver ? '#dbeafe' : '#fffbeb',
                borderRadius: '8px',
                border: isReceiver ? '2px solid #3b82f6' : '1px solid #fde68a'
              }}>
                <p>
                  <strong>{settlement.from_name}</strong> paid <strong>{settlement.to_name}</strong>
                </p>
                <p className="balance-positive">Amount: ${parseFloat(settlement.amount).toFixed(2)}</p>
                <p>Date: {settlement.date}</p>
                {isReceiver ? (
                  <button 
                    onClick={() => confirmSettlement(settlement.id)}
                    style={{ background: '#10b981', marginTop: '10px', padding: '8px 20px' }}
                  >
                    ✓ Confirm Receipt (You received this money)
                  </button>
                ) : isPayer ? (
                  <p style={{ fontSize: '0.8em', color: '#666', marginTop: '10px' }}>
                    ⏳ Waiting for {settlement.to_name} to confirm receipt
                  </p>
                ) : (
                  <p style={{ fontSize: '0.8em', color: '#666', marginTop: '10px' }}>
                    ⏳ Waiting for confirmation between {settlement.from_name} and {settlement.to_name}
                  </p>
                )}
              </div>
            );
          })}
        </div>
      )}

      {confirmedSettlements.length > 0 && (
        <div className="card">
          <h3>✅ Completed Settlements</h3>
          {confirmedSettlements.map(settlement => (
            <div key={settlement.id} style={{
              padding: '12px',
              margin: '8px 0',
              background: '#d1fae5',
              borderRadius: '6px',
              border: '1px solid #a7f3d0'
            }}>
              <p>
                <strong>{settlement.from_name}</strong> paid <strong>{settlement.to_name}</strong>
                <span className="balance-positive"> ${parseFloat(settlement.amount).toFixed(2)}</span>
              </p>
              <p style={{ fontSize: '0.8em', color: '#666' }}>Confirmed on: {settlement.date}</p>
            </div>
          ))}
        </div>
      )}

      {settlements.length === 0 && (
        <p>No settlements recorded yet.</p>
      )}
    </div>
  );
}

export default SettlementList;