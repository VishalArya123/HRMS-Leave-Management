import React, { createContext, useContext, useState, useEffect } from 'react';
import apiClient from '../utils/apiClient';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is already logged in
    const token = localStorage.getItem('auth_token');
    const userData = localStorage.getItem('user_data');
    
    if (token && userData) {
      try {
        const parsedUser = JSON.parse(userData);
        setUser(parsedUser);
        apiClient.setToken(token);
      } catch (error) {
        console.error('Error parsing stored user data:', error);
        localStorage.removeItem('auth_token');
        localStorage.removeItem('user_data');
      }
    }
    
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    try {
      console.log('🔐 Attempting login with:', email);
      const response = await apiClient.login(email, password);
      
      if (response.user && response.token) {
        setUser(response.user);
        localStorage.setItem('user_data', JSON.stringify(response.user));
        console.log('✅ Login successful:', response.user);
        return { success: true, user: response.user };
      } else {
        throw new Error('Invalid response format');
      }
    } catch (error) {
      console.error('❌ Login failed:', error);
      
      // Fallback to localStorage for development
      console.log('🔄 Trying localStorage fallback...');
      const employees = [
        { id: 'TSG0091', name: 'Suraj', email: 'suraj@tensor.com', personalEmail: '22311a66d3@aiml.sreenidhi.edu.in', password: 'password123', role: 'employee', department: 'Engineering', manager: 'TSG0092' },
        { id: 'TSG0092', name: 'Srinivas', email: 'srinivas@tensor.com', personalEmail: '22311a66e3@aiml.sreenidhi.edu.in', password: 'password123', role: 'manager', department: 'Engineering', manager: 'TSG0019' },
        { id: 'TSG0093', name: 'Vinay', email: 'vinay@tensor.com', personalEmail: '22311a66d9@aiml.sreenidhi.edu.in', password: 'password123', role: 'employee', department: 'Marketing', manager: 'TSG0094' },
        { id: 'TSG0094', name: 'Vishal', email: 'vishal@tensor.com', personalEmail: '22311a6690@aiml.sreenidhi.edu.in', password: 'password123', role: 'manager', department: 'Marketing', manager: 'TSG0019' },
        { id: 'TSG0019', name: 'Teja', email: 'teja@tensor.com', personalEmail: 'vishalaryadacha@gmail.com', password: 'password123', role: 'admin', department: 'HR', manager: null }
      ];

      const user = employees.find(emp => 
        (emp.email === email || emp.personalEmail === email) && emp.password === password
      );

      if (user) {
        const userData = {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          department: user.department,
          manager: user.manager
        };
        setUser(userData);
        localStorage.setItem('user_data', JSON.stringify(userData));
        localStorage.setItem('auth_token', 'fallback_token_' + user.id);
        console.log('✅ Fallback login successful:', userData);
        return { success: true, user: userData };
      }

      return { success: false, error: error.message };
    }
  };

  const logout = () => {
    setUser(null);
    apiClient.logout();
    localStorage.removeItem('user_data');
    console.log('🚪 User logged out');
  };

  const value = {
    user,
    login,
    logout,
    loading
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
