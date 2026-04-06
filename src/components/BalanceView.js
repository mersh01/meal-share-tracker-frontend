import React, { useState, useEffect } from 'react';
import api from '../services/api';

function BalanceView({ groupId, refreshTrigger, onSettlementMade }) {
  const [balances, setBalances] = useState([]);
  const [suggestedPayments, setSuggestedPayments] = useState([]);
  const [pendingSettlements, setPendingSettlements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showSettlement, setShowSettlement] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [settlementDate, setSettlementDate] = useState(new Date().toISOString().split('T')[0]);
  const [processingPayment, setProcessingPayment] = useState(false);

  useEffect(() => {
    if (groupId) {
      loadBalances();
    }
  }, [refreshTrigger, groupId]);

  const loadBalances = async () => {
    if (!groupId) return;
    
    setLoading(true);
    try {
      const data = await api.getBalances(groupId);
      setBalances(data.balances || []);
      setSuggestedPayments(data.suggestedPayments || []);
      setPendingSettlements(data.pendingSettlements || []);
    } catch (error) {
      console.error('Error loading balances:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSettlePayment = async (payment) => {
    if (processingPayment) {
      alert('Please wait, processing payment...');
      return;
    }

    setProcessingPayment(true);

    try {
      await api.addSettlement({
        from_friend_id: payment.from,
        to_friend_id: payment.to,
        amount: payment.amount,
        date: settlementDate,
        group_id: groupId
      });
      
      alert(`✓ Payment recorded: ${payment.from_name} paid ${payment.to_name} $${payment.amount.toFixed(2)}\n\nWaiting for ${payment.to_name} to confirm receipt.`);
      
      setShowSettlement(false);
      setSelectedPayment(null);
      
      await loadBalances();
      onSettlementMade();
      
    } catch (error) {
      console.error('Error recording settlement:', error);
      alert(error.response?.data?.error || 'Error recording settlement');
    } finally {
      setProcessingPayment(false);
    }
  };

  if (loading) {
    return <div>Loading balances...</div>;
  }

  if (!groupId) {
    return <div className="card">Please select a group to view balances</div>;
  }

  return (
    <div>
      <h2>Current Balances</h2>
      
      <div className="card">
        <h3>Net Balances</h3>
        <p style={{ fontSize: '0.9em', color: '#666', marginBottom: '15px' }}>
          Positive = owed to you | Negative = you owe
        </p>
        {balances.map(person => (
          <div key={person.id} style={{ 
            display: 'flex', 
            justifyContent: 'space-between',
            padding: '10px',
            borderBottom: '1px solid #e0e0e0'
          }}>
            <span><strong>{person.name}</strong></span>
            <span className={
              person.balance > 0 ? 'balance-positive' : 
              person.balance < 0 ? 'balance-negative' : 'balance-neutral'
            }>
              {person.balance > 0 ? (
                <>+${person.balance.toFixed(2)} <span style={{ fontSize: '0.9em' }}>(owed to you)</span></>
              ) : person.balance < 0 ? (
                <>-${Math.abs(person.balance).toFixed(2)} <span style={{ fontSize: '0.9em' }}>(you owe)</span></>
              ) : (
                <>$0 <span style={{ fontSize: '0.9em' }}>(settled)</span></>
              )}
            </span>
          </div>
        ))}
      </div>

      {pendingSettlements.length > 0 && (
        <div className="card" style={{ background: '#fef3c7', borderLeft: '4px solid #f59e0b' }}>
          <h3>⏳ Pending Confirmations</h3>
          <p style={{ fontSize: '0.9em', color: '#666', marginBottom: '15px' }}>
            These payments have been made but are waiting for receiver confirmation
          </p>
          {pendingSettlements.map((pending, index) => (
            <div key={index} style={{
              padding: '12px',
              margin: '8px 0',
              background: '#fffbeb',
              borderRadius: '6px',
              border: '1px solid #fde68a'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <span>
                    <strong>{pending.from_name}</strong> paid <strong>{pending.to_name}</strong>
                  </span>
                  <span className="balance-positive" style={{ marginLeft: '10px' }}>
                    ${pending.amount.toFixed(2)}
                  </span>
                </div>
                <span style={{ 
                  background: '#f59e0b', 
                  color: 'white', 
                  padding: '4px 8px', 
                  borderRadius: '4px',
                  fontSize: '0.8em'
                }}>
                  Awaiting Confirmation
                </span>
              </div>
              <p style={{ fontSize: '0.8em', color: '#666', marginTop: '8px' }}>
                ⚠️ Go to "Settlements" tab to confirm receipt
              </p>
            </div>
          ))}
        </div>
      )}

{suggestedPayments.length > 0 ? (
  <div className="card">
    <h3>💰 Payments You Need to Make</h3>
    <p style={{ fontSize: '0.9em', color: '#666', marginBottom: '15px' }}>
      You owe these amounts. Click "Mark as Paid" after sending the money.
    </p>
    {suggestedPayments.map((payment, index) => (
      <div key={index} style={{
        padding: '15px',
        margin: '10px 0',
        background: '#e8f4f8',
        borderRadius: '8px',
        borderLeft: '4px solid #10b981'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <span style={{ fontSize: '1.1em' }}>
              You owe <strong>{payment.to_name}</strong>
            </span>
            <span className="balance-negative" style={{ marginLeft: '10px', fontSize: '1.2em' }}>
              ${payment.amount.toFixed(2)}
            </span>
          </div>
          <button 
            onClick={() => {
              setSelectedPayment(payment);
              setShowSettlement(true);
            }}
            style={{ 
              background: '#10b981', 
              padding: '8px 16px',
              margin: 0
            }}
            disabled={processingPayment}
          >
            ✓ Mark as Paid
          </button>
        </div>
      </div>
    ))}
  </div>
) : (
  pendingSettlements.length === 0 && (
    <div className="card" style={{ background: '#d1fae5', textAlign: 'center' }}>
      <h3>🎉 You're All Settled Up!</h3>
      <p>You don't owe anyone anything!</p>
    </div>
  )
)}

      {showSettlement && selectedPayment && (
        <div className="card" style={{ background: '#fff3cd', border: '2px solid #ffc107' }}>
          <h3>Confirm Payment</h3>
          <p style={{ fontSize: '1.1em' }}>
            <strong>{selectedPayment.from_name}</strong> is paying <strong>{selectedPayment.to_name}</strong>
          </p>
          <p className="balance-positive" style={{ fontSize: '1.3em' }}>
            Amount: ${selectedPayment.amount.toFixed(2)}
          </p>
          <div className="form-group">
            <label>Payment Date:</label>
            <input
              type="date"
              value={settlementDate}
              onChange={(e) => setSettlementDate(e.target.value)}
              style={{ width: '200px' }}
            />
          </div>
          <div style={{ display: 'flex', gap: '10px', marginTop: '15px' }}>
            <button 
              onClick={() => handleSettlePayment(selectedPayment)}
              disabled={processingPayment}
              style={{ background: '#10b981' }}
            >
              {processingPayment ? 'Processing...' : '✓ Confirm Payment'}
            </button>
            <button 
              onClick={() => {
                setShowSettlement(false);
                setSelectedPayment(null);
              }} 
              style={{ background: '#6c757d' }}
            >
              Cancel
            </button>
          </div>
          <p style={{ fontSize: '0.8em', color: '#666', marginTop: '10px' }}>
            After confirming, {selectedPayment.to_name} will need to confirm receipt in the Settlements tab
          </p>
        </div>
      )}
    </div>
  );
}

export default BalanceView;