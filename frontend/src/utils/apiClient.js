// Enhanced API client with better error handling
const API_BASE_URL = 'https://hrms-leave-management.onrender.com';

class APIClient {
  constructor() {
    this.token = localStorage.getItem('auth_token');
  }

  setToken(token) {
    this.token = token;
    localStorage.setItem('auth_token', token);
  }

  clearToken() {
    this.token = null;
    localStorage.removeItem('auth_token');
  }

  async request(endpoint, options = {}) {
    const url = `${API_BASE_URL}${endpoint}`;
    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...(this.token && { Authorization: `Bearer ${this.token}` }),
        ...options.headers,
      },
      ...options,
    };

    if (config.body && typeof config.body === 'object') {
      config.body = JSON.stringify(config.body);
    }

    try {
      console.log(`🌐 API Request: ${config.method || 'GET'} ${url}`);
      const response = await fetch(url, config);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      console.log(`✅ API Response: ${endpoint}`, data);
      return data;
    } catch (error) {
      console.error(`❌ API Error: ${endpoint}`, error);

      // Check if it's a network/CORS error
      if (error.message.includes('Failed to fetch') || error.name === 'TypeError') {
        console.error('🔗 Network/CORS Error - Backend might be down or CORS not configured');
        throw new Error('Unable to connect to server. Please check if the backend is running and CORS is configured.');
      }

      throw error;
    }
  }

  // Test server connectivity
  async testConnection() {
    try {
      const response = await fetch(`${API_BASE_URL}/health`);
      return response.ok;
    } catch (error) {
      console.error('❌ Backend connection test failed:', error);
      return false;
    }
  }

  // Auth methods
  async login(email, password) {
    // Test connection first
    const isConnected = await this.testConnection();
    if (!isConnected) {
      throw new Error('Backend server is not accessible. Please ensure the server is running on http://localhost:3001');
    }

    const response = await this.request('/auth/login', {
      method: 'POST',
      body: { email, password },
    });

    if (response.token) {
      this.setToken(response.token);
    }

    return response;
  }

  async logout() {
    this.clearToken();
  }

  // Employee methods
  async getEmployees() {
    return this.request('/employees');
  }

  async getEmployeeById(id) {
    return this.request(`/employees/${id}`);
  }

  // Leave methods
  async getMyLeaves() {
    return this.request('/leaves');
  }

  async getPendingApprovals() {
    return this.request('/leaves/approvals');
  }

  async submitLeaveRequest(requestData) {
    return this.request('/leaves', {
      method: 'POST',
      body: requestData,
    });
  }

  async approveLeave(requestId, comments = '') {
    return this.request(`/leaves/${requestId}/decision`, {
      method: 'POST',
      body: { action: 'approve', comments },
    });
  }

  async rejectLeave(requestId, rejectionReason, comments = '') {
    return this.request(`/leaves/${requestId}/decision`, {
      method: 'POST',
      body: { action: 'reject', comments, rejectionReason },
    });
  }

  async cancelLeave(requestId) {
    return this.request(`/leaves/${requestId}/cancel`, {
      method: 'POST',
    });
  }

  // Other methods
  async getHolidays() {
    return this.request('/holidays');
  }

  async getLOPAnalytics() {
    return this.request('/analytics/lop');
  }

  async getLeaveTypes() {
    // For now, return static data since it's not changing often
    return [
      { id: 'sick', name: 'Sick Leave', code: 'SL', color: '#ef4444', maxDays: 12, carryForward: false, documentation: true, description: 'For medical emergencies' },
      { id: 'casual', name: 'Casual Leave', code: 'CL', color: '#3b82f6', maxDays: 12, carryForward: true, documentation: false, description: 'Personal work/family' },
      { id: 'vacation', name: 'Vacation Leave', code: 'VL', color: '#10b981', maxDays: 18, carryForward: true, documentation: false, description: 'Planned holidays' },
      { id: 'academic', name: 'Academic Leave', code: 'AL', color: '#8b5cf6', maxDays: 5, carryForward: false, documentation: true, description: 'Education/skill' },
      { id: 'wfh', name: 'Work From Home', code: 'WFH', color: '#f59e0b', maxDays: 24, carryForward: false, documentation: false, description: 'Remote work' },
      { id: 'compoff', name: 'Comp Off', code: 'CO', color: '#06b6d4', maxDays: 12, carryForward: false, documentation: false, description: 'For overtime' }
    ];
  }
  
  // Admin Employee Management
  async getAdminEmployees() {
    return this.request('/admin/employees');
  }

  async addEmployee(employeeData) {
    return this.request('/admin/employees', {
      method: 'POST',
      body: employeeData,
    });
  }

  async updateEmployee(employeeId, employeeData) {
    return this.request(`/admin/employees/${employeeId}`, {
      method: 'PUT',
      body: employeeData,
    });
  }

  async deleteEmployee(employeeId) {
    return this.request(`/admin/employees/${employeeId}`, {
      method: 'DELETE',
    });
  }

  // Admin Holiday Management
  async getAdminHolidays() {
    return this.request('/admin/holidays');
  }

  async addHoliday(holidayData) {
    return this.request('/admin/holidays', {
      method: 'POST',
      body: holidayData,
    });
  }

  async deleteHoliday(holidayDate) {
    return this.request(`/admin/holidays/${holidayDate}`, {
      method: 'DELETE',
    });
  }

  // Admin Leave Quota Management
  async getLeaveBalances() {
    return this.request('/admin/leave-balances');
  }

  async updateLeaveQuota(quotaData) {
    return this.request('/admin/leave-balances', {
      method: 'PUT',
      body: quotaData,
    });
  }

  // Admin Analytics
  async getAdminAnalytics() {
    return this.request('/admin/analytics');
  }
}

export default new APIClient();
