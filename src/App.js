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
  const [activeTab, setActiveTab] = useState('add');
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [friends, setFriends] = useState([]);
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

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
    setIsMobileMenuOpen(false);
  };

  const refreshData = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  const handleSelectGroup = (groupId) => {
    setSelectedGroupId(groupId);
    setActiveTab('add');
    setIsMobileMenuOpen(false);
  };

  if (!isAuthenticated) {
    return <Login onLogin={handleLogin} />;
  }

  return (
    <div className="app">
      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div className="mobile-menu-overlay" onClick={() => setIsMobileMenuOpen(false)}>
          <div className="mobile-menu" onClick={(e) => e.stopPropagation()}>
            <div className="mobile-menu-header">
              <h3>Menu</h3>
              <button className="close-menu" onClick={() => setIsMobileMenuOpen(false)}>✕</button>
            </div>
            <div className="mobile-menu-user">
              <div className="mobile-user-avatar">👤</div>
              <div className="mobile-user-info">
                <div className="mobile-user-name">{user?.name}</div>
                <div className="mobile-user-email">{user?.email}</div>
              </div>
            </div>
            <div className="mobile-menu-items">
              <button onClick={() => {
                setShowChangePassword(true);
                setIsMobileMenuOpen(false);
              }} className="mobile-menu-item">
                🔒 Change Password
              </button>
              <button onClick={handleLogout} className="mobile-menu-item logout">
                🚪 Logout
              </button>
            </div>
          </div>
        </div>
      )}

      <header className="header">
        <div className="header-top">
          <button className="mobile-menu-btn" onClick={() => setIsMobileMenuOpen(true)}>
            ☰
          </button>
          <div className="header-title">
            <h1>🍽️ Meal Share Tracker</h1>
            <p>Track meals with friends, split bills easily</p>
          </div>
          <div className="header-actions">
            <button className="change-password-btn" onClick={() => setShowChangePassword(true)}>
              🔒
            </button>
            <button className="logout-btn" onClick={handleLogout}>
              🚪
            </button>
          </div>
        </div>
        <div className="user-greeting">
          Welcome, {user?.name}!
        </div>
      </header>

      {!selectedGroupId ? (
        <div className="content">
          <GroupList onSelectGroup={handleSelectGroup} selectedGroupId={selectedGroupId} />
        </div>
      ) : (
        <>
          <div className="group-header">
            <button onClick={() => {
              setSelectedGroupId(null);
              setActiveTab('add');
            }} className="back-button">
              ← Back to Groups
            </button>
            <span className="group-header-text">Current Group: Group #{selectedGroupId}</span>
          </div>

          <div className="tabs">
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
            <button className={activeTab === 'members' ? 'tab active' : 'tab'} onClick={() => setActiveTab('members')}>
              👥 Members
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
            console.log('Password changed successfully');
          }}
        />
      )}
    </div>
  );
}

export default App;