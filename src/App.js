import React, { useState, useEffect } from 'react';
import './App.css';
import Login from './components/Login';
import GroupList from './components/GroupList';
import GroupMembers from './components/GroupMembers';
import FriendList from './components/FriendList';
import AddMeal from './components/AddMeal';
import BalanceView from './components/BalanceView';
import SettlementList from './components/SettlementList';
import MealHistory from './components/MealHistory';
import api from './services/api';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [selectedGroupId, setSelectedGroupId] = useState(null);
  const [activeTab, setActiveTab] = useState('groups');
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [friends, setFriends] = useState([]);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const savedUser = localStorage.getItem('user');
    
    if (token && savedUser) {
      setUser(JSON.parse(savedUser));
      setIsAuthenticated(true);
    }
  }, []);

  const handleLogin = (userData) => {
    setUser(userData);
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setIsAuthenticated(false);
    setUser(null);
    setSelectedGroupId(null);
  };

  const refreshData = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  if (!isAuthenticated) {
    return <Login onLogin={handleLogin} />;
  }

  return (
    <div className="app">
      <header className="header">
        <h1>🍽️ Meal Share Tracker</h1>
        <p>Track meals with friends, split bills easily</p>
        <div style={{ marginTop: '10px' }}>
          <span style={{ marginRight: '15px' }}>Welcome, {user?.name}!</span>
          <button onClick={handleLogout} style={{ background: '#ef4444', padding: '5px 15px' }}>
            Logout
          </button>
        </div>
      </header>

      {!selectedGroupId ? (
        <div className="content">
          <GroupList onSelectGroup={setSelectedGroupId} selectedGroupId={selectedGroupId} />
        </div>
      ) : (
        <>
          <div style={{ padding: '10px 20px', background: '#f0f0f0', marginBottom: '20px', borderRadius: '8px' }}>
            <button onClick={() => setSelectedGroupId(null)} style={{ background: '#6c757d', marginRight: '10px' }}>
              ← Back to Groups
            </button>
            <span style={{ fontWeight: 'bold' }}>Current Group: </span>
            <span>Group #{selectedGroupId}</span>
          </div>

          <div className="tabs">
            <button className={activeTab === 'members' ? 'tab active' : 'tab'} onClick={() => setActiveTab('members')}>
              👥 Members
            </button>
            <button className={activeTab === 'add' ? 'tab active' : 'tab'} onClick={() => setActiveTab('add')}>
              ➕ Add Meal
            </button>
            <button className={activeTab === 'balance' ? 'tab active' : 'tab'} onClick={() => setActiveTab('balance')}>
              💰 Balances
            </button>
            <button className={activeTab === 'history' ? 'tab active' : 'tab'} onClick={() => setActiveTab('history')}>
              📜 Meal History
            </button>
            <button className={activeTab === 'settlements' ? 'tab active' : 'tab'} onClick={() => setActiveTab('settlements')}>
              ✅ Settlements
            </button>
          </div>

          <div className="content">
            {activeTab === 'members' && (
              <GroupMembers groupId={selectedGroupId} onMemberChange={refreshData} />
            )}
            {activeTab === 'add' && (
  <AddMeal 
    groupId={selectedGroupId}
    onMealAdded={refreshData}
  />
)}
            {activeTab === 'balance' && (
              <BalanceView 
                groupId={selectedGroupId}
                refreshTrigger={refreshTrigger} 
                onSettlementMade={refreshData}
              />
            )}
            {activeTab === 'history' && (
              <MealHistory groupId={selectedGroupId} refreshTrigger={refreshTrigger} onDelete={refreshData} />
            )}
            {activeTab === 'settlements' && (
              <SettlementList 
                groupId={selectedGroupId}
                refreshTrigger={refreshTrigger} 
                onConfirm={refreshData}
              />
            )}
          </div>
        </>
      )}
    </div>
  );
}

export default App;