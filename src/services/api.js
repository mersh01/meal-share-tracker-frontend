const API_BASE_URL = 'https://meal-share-backend.vercel.app/api';

const getToken = () => localStorage.getItem('token');

const api = {
  // Auth
  login: async (email, password) => {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    if (!response.ok) throw await response.json();
    return response.json();
  },
  
  register: async (email, password, name) => {
    const response = await fetch(`${API_BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, name })
    });
    if (!response.ok) throw await response.json();
    return response.json();
  },
  
  // Groups
  getGroups: async () => {
    const response = await fetch(`${API_BASE_URL}/groups`, {
      headers: { 'Authorization': `Bearer ${getToken()}` }
    });
    if (!response.ok) throw new Error('Failed to fetch groups');
    return response.json();
  },

  createGroup: async (name) => {
    const response = await fetch(`${API_BASE_URL}/groups`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${getToken()}`
      },
      body: JSON.stringify({ name })
    });
    if (!response.ok) throw await response.json();
    return response.json();
  },

  deleteGroup: async (groupId) => {
    const response = await fetch(`${API_BASE_URL}/groups/${groupId}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${getToken()}` }
    });
    if (!response.ok) throw new Error('Failed to delete group');
    return response.json();
  },

  getGroupMembers: async (groupId) => {
    const response = await fetch(`${API_BASE_URL}/groups/${groupId}/members`, {
      headers: { 'Authorization': `Bearer ${getToken()}` }
    });
    if (!response.ok) throw new Error('Failed to fetch members');
    return response.json();
  },

  addGroupMember: async (groupId, email) => {
    const response = await fetch(`${API_BASE_URL}/groups/${groupId}/members`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${getToken()}`
      },
      body: JSON.stringify({ email })
    });
    if (!response.ok) throw await response.json();
    return response.json();
  },

  removeGroupMember: async (groupId, memberId) => {
    const response = await fetch(`${API_BASE_URL}/groups/${groupId}/members/${memberId}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${getToken()}` }
    });
    if (!response.ok) throw new Error('Failed to remove member');
    return response.json();
  },

  // Meals
  addMeal: async (mealData) => {
    const response = await fetch(`${API_BASE_URL}/meals`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${getToken()}`
      },
      body: JSON.stringify(mealData)
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to add meal');
    }
    return response.json();
  },
  
  getMeals: async (groupId) => {
    const url = groupId ? `${API_BASE_URL}/meals?groupId=${groupId}` : `${API_BASE_URL}/meals`;
    const response = await fetch(url, {
      headers: { 'Authorization': `Bearer ${getToken()}` }
    });
    if (!response.ok) throw new Error('Failed to fetch meals');
    return response.json();
  },
  
  deleteMeal: async (id) => {
    const response = await fetch(`${API_BASE_URL}/meals/${id}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${getToken()}` }
    });
    if (!response.ok) throw new Error('Failed to delete meal');
    return response.json();
  },

  // Balances
  getBalances: async (groupId) => {
    const response = await fetch(`${API_BASE_URL}/balances?groupId=${groupId}`, {
      headers: { 'Authorization': `Bearer ${getToken()}` }
    });
    if (!response.ok) throw new Error('Failed to fetch balances');
    return response.json();
  },
  
  // Settlements
  addSettlement: async (settlementData) => {
    const response = await fetch(`${API_BASE_URL}/settlements`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${getToken()}`
      },
      body: JSON.stringify(settlementData)
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to add settlement');
    }
    return response.json();
  },
  
  getSettlements: async (groupId) => {
    const url = groupId ? `${API_BASE_URL}/settlements?groupId=${groupId}` : `${API_BASE_URL}/settlements`;
    const response = await fetch(url, {
      headers: { 'Authorization': `Bearer ${getToken()}` }
    });
    if (!response.ok) throw new Error('Failed to fetch settlements');
    return response.json();
  },
  
  confirmSettlement: async (id) => {
    const response = await fetch(`${API_BASE_URL}/settlements/${id}/confirm`, {
      method: 'PUT',
      headers: { 'Authorization': `Bearer ${getToken()}` }
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to confirm settlement');
    }
    return response.json();
  }
};

export default api;