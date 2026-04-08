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
  const [selectedGroupName, setSelectedGroupName] = useState('');
  const [activeTab, setActiveTab] = useState('add');
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [friends, setFriends] = useState([]);
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

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
    setSelectedGroupName('');
    setIsMobileMenuOpen(false);
  };

  const refreshData = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  const handleSelectGroup = (groupId, groupName) => {
    setSelectedGroupId(groupId);
    setSelectedGroupName(groupName || '');
    setActiveTab('add');
    setIsMobileMenuOpen(false);
  };

  const handleBackToGroups = () => {
    setSelectedGroupId(null);
    setSelectedGroupName('');
    setActiveTab('add');
  };

  const tabs = [
    { id: 'add', label: 'Add Meal', icon: '➕' },
    { id: 'balance', label: 'Balances', icon: '💰' },
    { id: 'history', label: 'Meal History', icon: '📜' },
    { id: 'settlements', label: 'Settlements', icon: '✅' },
    { id: 'members', label: 'Members', icon: '👥' }
  ];

  if (!isAuthenticated) {
    return <Login onLogin={handleLogin} />;
  }

  return (
    <div className="app">
      {/* Mobile Menu Overlay */}
      // In App.js, update the mobile menu section inside the return statement:

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
      
      {/* Add Navigation Tabs for Mobile */}
      {selectedGroupId && (
        <div className="mobile-nav-section">
          <div className="mobile-nav-title">Navigation</div>
          {tabs.map(tab => (
            <button
              key={tab.id}
              className={`mobile-nav-item ${activeTab === tab.id ? 'active' : ''}`}
              onClick={() => {
                setActiveTab(tab.id);
                setIsMobileMenuOpen(false);
              }}
            >
              <span className="mobile-nav-icon">{tab.icon}</span>
                  <span className="mobile-nav-label">{tab.label}</span>
            </button>
          ))}
        </div>
      )}
      
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

      {/* Header */}
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
            <button className="change-password-btn" onClick={() => setShowChangePassword(true)} title="Change Password">
              🔒
            </button>
            <button className="logout-btn" onClick={handleLogout} title="Logout">
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
        <div className="dashboard-layout">
          {/* Sidebar */}
          <aside className={`sidebar ${isSidebarCollapsed ? 'collapsed' : ''}`}>
            <div className="sidebar-header">
              <button 
                className="sidebar-toggle" 
                onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
                title={isSidebarCollapsed ? 'Expand' : 'Collapse'}
              >
                {isSidebarCollapsed ? '→' : '←'}
              </button>
              {!isSidebarCollapsed && (
                <div className="sidebar-group-info">
                  <div className="sidebar-group-icon">👥</div>
                  <div className="sidebar-group-name">{selectedGroupName}</div>
                </div>
              )}
              {isSidebarCollapsed && (
                <div className="sidebar-group-icon-small">👥</div>
              )}
            </div>
            
            <nav className="sidebar-nav">
              {tabs.map(tab => (
                <button
                  key={tab.id}
                  className={`sidebar-nav-item ${activeTab === tab.id ? 'active' : ''}`}
                  onClick={() => setActiveTab(tab.id)}
                  title={isSidebarCollapsed ? tab.label : ''}
                >
                  <span className="nav-icon">{tab.icon}</span>
                  {!isSidebarCollapsed && <span className="nav-label">{tab.label}</span>}
                </button>
              ))}
            </nav>

            {!isSidebarCollapsed && (
              <div className="sidebar-footer">
                <button 
                  className="back-to-groups-btn"
                  onClick={handleBackToGroups}
                >
                  ← Back to Groups
                </button>
              </div>
            )}
            {isSidebarCollapsed && (
              <div className="sidebar-footer-collapsed">
                <button 
                  className="back-to-groups-icon"
                  onClick={handleBackToGroups}
                  title="Back to Groups"
                >
                  ←
                </button>
              </div>
            )}
          </aside>

          {/* Main Content */}
          <main className="main-content">
            <div className="mobile-group-header">
              <button 
                className="back-button-mobile"
                onClick={handleBackToGroups}
              >
                ← Back
              </button>
              <span className="mobile-group-name">{selectedGroupName}</span>
            </div>

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
          </main>
        </div>
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