import React, { useState, useEffect } from 'react';
import api from '../services/api';

function MealHistory({ groupId, refreshTrigger, onDelete }) {
  const [meals, setMeals] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (groupId) {
      loadMeals();
    }
  }, [refreshTrigger, groupId]);

  const loadMeals = async () => {
    setLoading(true);
    try {
      const data = await api.getMeals(groupId);
      setMeals(data);
    } catch (error) {
      console.error('Error loading meals:', error);
    } finally {
      setLoading(false);
    }
  };

  const deleteMeal = async (id) => {
    if (window.confirm('Are you sure you want to delete this meal?')) {
      try {
        await api.deleteMeal(id);
        alert('Meal deleted');
        onDelete();
        loadMeals();
      } catch (error) {
        console.error('Error deleting meal:', error);
        alert('Error deleting meal');
      }
    }
  };

  if (loading) {
    return <div>Loading meal history...</div>;
  }

  if (!groupId) {
    return <div className="card">Please select a group to view meal history</div>;
  }

  return (
    <div>
      <h2>Meal History</h2>
      
      {meals.length === 0 ? (
        <p>No meals recorded yet. Add your first meal!</p>
      ) : (
        meals.map(meal => (
          <div key={meal.id} className="card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
              <div>
                <h3>{meal.meal_type === 'breakfast' ? '🍳 Breakfast' : '🍱 Lunch'} - {meal.date}</h3>
                <p>Paid by: <strong>{meal.payer_name}</strong></p>
                <p>Total: <strong className="balance-positive">${parseFloat(meal.total_amount).toFixed(2)}</strong></p>
                <p>Participants: {meal.participant_names || 'None'}</p>
                {meal.shares && (
                  <details>
                    <summary style={{ cursor: 'pointer', marginTop: '10px' }}>View shares</summary>
                    <div style={{ marginTop: '10px', paddingLeft: '20px' }}>
                      {meal.participant_names && meal.participant_names.split(',').map((name, idx) => {
                        const shares = meal.shares ? meal.shares.split(',') : [];
                        return (
                          <p key={idx}>{name}: ${parseFloat(shares[idx] || 0).toFixed(2)}</p>
                        );
                      })}
                    </div>
                  </details>
                )}
              </div>
              <button 
                onClick={() => deleteMeal(meal.id)}
                style={{ background: '#ef4444', padding: '5px 10px' }}
              >
                Delete
              </button>
            </div>
          </div>
        ))
      )}
    </div>
  );
}

export default MealHistory;