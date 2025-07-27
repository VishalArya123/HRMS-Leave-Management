// Storage utility for memory management and future backend integration

class StorageManager {
    constructor() {
      this.prefix = 'hrms_';
      this.version = '1.0';
    }
  
    // Set data in localStorage with expiration
    set(key, value, expirationHours = 24) {
      const item = {
        value: value,
        timestamp: Date.now(),
        expiration: expirationHours * 60 * 60 * 1000,
        version: this.version
      };
      localStorage.setItem(this.prefix + key, JSON.stringify(item));
    }
  
    // Get data from localStorage
    get(key) {
      try {
        const item = localStorage.getItem(this.prefix + key);
        if (!item) return null;
  
        const parsed = JSON.parse(item);
        
        // Check if expired
        if (Date.now() - parsed.timestamp > parsed.expiration) {
          this.remove(key);
          return null;
        }
  
        return parsed.value;
      } catch (error) {
        console.error('Storage get error:', error);
        return null;
      }
    }
  
    // Remove data from localStorage
    remove(key) {
      localStorage.removeItem(this.prefix + key);
    }
  
    // Clear all HRMS data
    clear() {
      const keys = Object.keys(localStorage);
      keys.forEach(key => {
        if (key.startsWith(this.prefix)) {
          localStorage.removeItem(key);
        }
      });
    }
  
    // Session storage methods
    setSession(key, value) {
      sessionStorage.setItem(this.prefix + key, JSON.stringify(value));
    }
  
    getSession(key) {
      try {
        const item = sessionStorage.getItem(this.prefix + key);
        return item ? JSON.parse(item) : null;
      } catch (error) {
        console.error('Session storage get error:', error);
        return null;
      }
    }
  
    removeSession(key) {
      sessionStorage.removeItem(this.prefix + key);
    }
  
    // Memory cache for frequently accessed data
    cache = new Map();
  
    setCache(key, value, ttlMs = 300000) { // 5 minutes default TTL
      this.cache.set(key, {
        value,
        expiry: Date.now() + ttlMs
      });
    }
  
    getCache(key) {
      const item = this.cache.get(key);
      if (!item) return null;
      
      if (Date.now() > item.expiry) {
        this.cache.delete(key);
        return null;
      }
      
      return item.value;
    }
  
    clearCache() {
      this.cache.clear();
    }
  
    // Future backend integration helpers
    async syncWithBackend(key, data) {
      // Placeholder for backend sync
      // Will be implemented when backend is ready
      console.log('Sync with backend:', key, data);
      return Promise.resolve(data);
    }
  
    async fetchFromBackend(endpoint) {
      // Placeholder for backend fetching
      // Will be implemented when backend is ready
      console.log('Fetch from backend:', endpoint);
      return Promise.resolve(null);
    }
  }
  
  export const storage = new StorageManager();
  
  // Helper functions for common operations
  export const userStorage = {
    setCurrentUser: (user) => storage.setSession('current_user', user),
    getCurrentUser: () => storage.getSession('current_user'),
    clearCurrentUser: () => storage.removeSession('current_user'),
  };
  
  export const leaveStorage = {
    setLeaveRequests: (requests) => storage.set('leave_requests', requests, 1), // 1 hour
    getLeaveRequests: () => storage.get('leave_requests'),
    
    setLeaveBalances: (balances) => storage.set('leave_balances', balances, 6), // 6 hours
    getLeaveBalances: () => storage.get('leave_balances'),
    
    cacheLeaveTypes: (types) => storage.setCache('leave_types', types),
    getCachedLeaveTypes: () => storage.getCache('leave_types'),
  };
  
  export const configStorage = {
    setHolidays: (holidays) => storage.set('holidays', holidays, 168), // 1 week
    getHolidays: () => storage.get('holidays'),
    
    setLeaveRules: (rules) => storage.set('leave_rules', rules, 24), // 24 hours
    getLeaveRules: () => storage.get('leave_rules'),
  };
  