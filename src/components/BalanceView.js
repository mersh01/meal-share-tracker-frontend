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
  const [copiedField, setCopiedField] = useState(null);

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

  const copyToClipboard = (text, field) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
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
            borderBottom: '1px solid #e0e0e0',
            flexWrap: 'wrap',
            gap: '8px'
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
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
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
                  fontSize: '0.75em',
                  whiteSpace: 'nowrap'
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
              <div style={{ 
                display: 'flex', 
                flexDirection: 'column',
                gap: '12px'
              }}>
                {/* Header with amount and button */}
                <div style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'center',
                  flexWrap: 'wrap',
                  gap: '10px'
                }}>
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
                      margin: 0,
                      minWidth: '120px'
                    }}
                    disabled={processingPayment}
                  >
                    ✓ Mark as Paid
                  </button>
                </div>
                
                {/* Contact Information Section - Mobile Responsive */}
                {(payment.to_phone || payment.to_account || payment.to_email) && (
                  <div style={{ 
                    marginTop: '8px', 
                    padding: '12px', 
                    background: '#f0f0f0', 
                    borderRadius: '8px',
                    fontSize: '0.85em'
                  }}>
                    <div style={{ fontWeight: 'bold', marginBottom: '10px', fontSize: '0.9em' }}>
                      📞 Receiver's Contact Info:
                    </div>
                    <div style={{ 
                      display: 'flex', 
                      flexDirection: 'column',
                      gap: '10px'
                    }}>
                      {payment.to_phone && (
                        <div style={{ 
                          display: 'flex', 
                          alignItems: 'center', 
                          justifyContent: 'space-between',
                          flexWrap: 'wrap',
                          gap: '8px'
                        }}>
                          <span style={{ minWidth: '50px' }}>📱 Phone:</span>
                          <code style={{ 
                            background: 'white', 
                            padding: '4px 8px', 
                            borderRadius: '4px',
                            fontSize: '0.85em',
                            wordBreak: 'break-all',
                            flex: 1,
                            textAlign: 'center'
                          }}>
                            {payment.to_phone}
                          </code>
                          <button
                            type="button"
                            onClick={() => copyToClipboard(payment.to_phone, `phone-${index}`)}
                            style={{ 
                              padding: '4px 12px', 
                              fontSize: '0.75rem', 
                              background: '#667eea',
                              minWidth: '65px'
                            }}
                          >
                            {copiedField === `phone-${index}` ? '✓ Copied!' : 'Copy'}
                          </button>
                        </div>
                      )}
                      {payment.to_account && (
                        <div style={{ 
                          display: 'flex', 
                          alignItems: 'center', 
                          justifyContent: 'space-between',
                          flexWrap: 'wrap',
                          gap: '8px'
                        }}>
                          <span style={{ minWidth: '50px' }}>🏦 Account:</span>
                          <code style={{ 
                            background: 'white', 
                            padding: '4px 8px', 
                            borderRadius: '4px',
                            fontSize: '0.85em',
                            wordBreak: 'break-all',
                            flex: 1,
                            textAlign: 'center'
                          }}>
                            {payment.to_account}
                          </code>
                          <button
                            type="button"
                            onClick={() => copyToClipboard(payment.to_account, `account-${index}`)}
                            style={{ 
                              padding: '4px 12px', 
                              fontSize: '0.75rem', 
                              background: '#667eea',
                              minWidth: '65px'
                            }}
                          >
                            {copiedField === `account-${index}` ? '✓ Copied!' : 'Copy'}
                          </button>
                        </div>
                      )}
                      {payment.to_email && (
                        <div style={{ 
                          display: 'flex', 
                          alignItems: 'center', 
                          justifyContent: 'space-between',
                          flexWrap: 'wrap',
                          gap: '8px'
                        }}>
                          <span style={{ minWidth: '50px' }}>📧 Email:</span>
                          <code style={{ 
                            background: 'white', 
                            padding: '4px 8px', 
                            borderRadius: '4px',
                            fontSize: '0.85em',
                            wordBreak: 'break-all',
                            flex: 1,
                            textAlign: 'center'
                          }}>
                            {payment.to_email}
                          </code>
                          <button
                            type="button"
                            onClick={() => copyToClipboard(payment.to_email, `email-${index}`)}
                            style={{ 
                              padding: '4px 12px', 
                              fontSize: '0.75rem', 
                              background: '#667eea',
                              minWidth: '65px'
                            }}
                          >
                            {copiedField === `email-${index}` ? '✓ Copied!' : 'Copy'}
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                )}
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
          
          {/* Show receiver info in confirmation modal - Mobile Responsive */}
          {(selectedPayment.to_phone || selectedPayment.to_account || selectedPayment.to_email) && (
            <div style={{ 
              marginTop: '15px', 
              padding: '15px', 
              background: '#e8f4f8', 
              borderRadius: '8px',
              border: '1px solid #b8daff'
            }}>
              <div style={{ fontWeight: 'bold', marginBottom: '12px', fontSize: '0.95em' }}>
                📋 Send payment to:
              </div>
              <div style={{ 
                display: 'flex', 
                flexDirection: 'column',
                gap: '8px',
                fontSize: '0.9em'
              }}>
                {selectedPayment.to_phone && (
                  <div style={{ wordBreak: 'break-word' }}>
                    📱 Phone: {selectedPayment.to_phone}
                  </div>
                )}
                {selectedPayment.to_account && (
                  <div style={{ wordBreak: 'break-word' }}>
                    🏦 Account: {selectedPayment.to_account}
                  </div>
                )}
                {selectedPayment.to_email && (
                  <div style={{ wordBreak: 'break-word' }}>
                    📧 Email: {selectedPayment.to_email}
                  </div>
                )}
              </div>
            </div>
          )}
          
          <div className="form-group" style={{ marginTop: '15px' }}>
            <label>Payment Date:</label>
            <input
              type="date"
              value={settlementDate}
              onChange={(e) => setSettlementDate(e.target.value)}
              style={{ width: '100%', maxWidth: '250px' }}
            />
          </div>
          <div style={{ display: 'flex', gap: '10px', marginTop: '15px', flexWrap: 'wrap' }}>
            <button 
              onClick={() => handleSettlePayment(selectedPayment)}
              disabled={processingPayment}
              style={{ background: '#10b981', flex: 1, minWidth: '120px' }}
            >
              {processingPayment ? 'Processing...' : '✓ Confirm Payment'}
            </button>
            <button 
              onClick={() => {
                setShowSettlement(false);
                setSelectedPayment(null);
              }} 
              style={{ background: '#6c757d', flex: 1, minWidth: '100px' }}
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