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
import ChangePassword from './components/ChangePassword';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [selectedGroupId, setSelectedGroupId] = useState(null);
  const [activeTab, setActiveTab] = useState('groups');
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [friends, setFriends] = useState([]);
  const [showChangePassword, setShowChangePassword] = useState(false);

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
        <div style={{ marginTop: '10px', display: 'flex', gap: '10px', justifyContent: 'center', flexWrap: 'wrap' }}>
          <span style={{ marginRight: '5px' }}>Welcome, {user?.name}!</span>
          <button 
            onClick={() => setShowChangePassword(true)} 
            style={{ background: '#10b981', padding: '5px 15px' }}
          >
            🔒 Change Password
          </button>
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
          <div className="group-header">
            <button onClick={() => setSelectedGroupId(null)} className="back-button">
              ← Back to Groups
            </button>
            <span className="group-header-text">Current Group: Group #{selectedGroupId}</span>
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

      {/* Change Password Modal */}
      {showChangePassword && (
        <ChangePassword 
          onClose={() => setShowChangePassword(false)}
          onPasswordChanged={() => {
            // Optional: handle any post-change logic
            console.log('Password changed successfully');
          }}
        />
      )}
    </div>
  );
}

export default App;