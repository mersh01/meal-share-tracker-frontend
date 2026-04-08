import React, { useState, useEffect } from 'react';
import api from '../services/api';

function MealHistory({ groupId, refreshTrigger, onDelete }) {
  const [meals, setMeals] = useState([]);
  const [loading, setLoading] = useState(true);
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
      loadMeals();
    }
  }, [refreshTrigger, groupId]);

  const loadMeals = async () => {
    setLoading(true);
    try {
      const data = await api.getMeals(groupId);
      // Ensure meals are sorted by date (newest first) and then by id
      const sortedMeals = [...data].sort((a, b) => {
        const dateA = new Date(a.date);
        const dateB = new Date(b.date);
        if (dateA.getTime() !== dateB.getTime()) {
          return dateB.getTime() - dateA.getTime();
        }
        return b.id - a.id;
      });
      setMeals(sortedMeals);
    } catch (error) {
      console.error('Error loading meals:', error);
    } finally {
      setLoading(false);
    }
  };

  const deleteMeal = async (id) => {
    if (window.confirm('Are you sure you want to delete this meal? This will remove all associated expenses and cannot be undone.')) {
      try {
        await api.deleteMeal(id);
        alert('Meal deleted successfully!');
        onDelete();
        loadMeals();
      } catch (error) {
        console.error('Error deleting meal:', error);
        alert(error.response?.data?.error || 'Error deleting meal');
      }
    }
  };

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  if (loading) {
    return (
      <div className="text-center">
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Loading meal history...</p>
        </div>
      </div>
    );
  }

  if (!groupId) {
    return <div className="card">Please select a group to view meal history</div>;
  }

  return (
    <div>
      <h2>Meal History</h2>
      <p style={{ fontSize: '0.9em', color: '#666', marginBottom: '20px' }}>
        Showing {meals.length} meal{meals.length !== 1 ? 's' : ''}
      </p>
      
      {meals.length === 0 ? (
        <div className="card text-center">
          <p>No meals recorded yet. Add your first meal!</p>
        </div>
      ) : (
        <div className="meals-list">
          {meals.map(meal => {
            const isCreator = currentUser?.id === meal.creator_id;
            
            return (
              <div key={meal.id} className="meal-card">
                <div className="meal-header">
                  <div className="meal-title">
                    <span className="meal-icon">
                      {meal.meal_type === 'breakfast' ? '🍳' : '🍱'}
                    </span>
                    <span className="meal-type">
                      {meal.meal_type === 'breakfast' ? 'Breakfast' : 'Lunch'}
                    </span>
                  </div>
                  <div className="meal-date">{formatDate(meal.date)}</div>
                </div>
                
                <div className="meal-details">
                  <div className="meal-detail-row">
                    <span className="detail-label">Paid by:</span>
                    <span className="detail-value">{meal.payer_name}</span>
                  </div>
                  <div className="meal-detail-row">
                    <span className="detail-label">Total:</span>
                    <span className="detail-value balance-positive">
                      ${parseFloat(meal.total_amount).toFixed(2)}
                    </span>
                  </div>
                  <div className="meal-detail-row">
                    <span className="detail-label">Participants:</span>
                    <span className="detail-value">{meal.participant_names || 'None'}</span>
                  </div>
                  
                  {meal.shares && (
                    <details className="meal-shares">
                      <summary>View shares</summary>
                      <div className="shares-list">
                        {meal.participant_names && meal.participant_names.split(',').map((name, idx) => {
                          const shares = meal.shares ? meal.shares.split(',') : [];
                          return (
                            <div key={idx} className="share-item">
                              <span>{name}:</span>
                              <span className="balance-positive">
                                ${parseFloat(shares[idx] || 0).toFixed(2)}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </details>
                  )}
                  
                  {meal.creator_name && (
                    <div className="meal-creator">
                      Added by: {meal.creator_name}
                    </div>
                  )}
                </div>
                
                {isCreator && (
                  <div className="meal-actions">
                    <button 
                      onClick={() => deleteMeal(meal.id)}
                      className="delete-meal-btn"
                    >
                      Delete
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default MealHistory;