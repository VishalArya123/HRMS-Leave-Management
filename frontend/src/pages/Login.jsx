import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, Lock, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { notifications } from '../data/mockData';
import LoadingSpinner from '../components/common/LoadingSpinner';
import toast from 'react-hot-toast';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  
  const [currentNotification, setCurrentNotification] = useState(0);

  // Rotate notifications every 5 seconds
  React.useEffect(() => {
    const interval = setInterval(() => {
      setCurrentNotification((prev) => (prev + 1) % notifications.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    const result = await login(email, password);
    
    if (result.success) {
      toast.success('Login successful!');
    } else {
      toast.error(result.error || 'Login failed');
    }
    
    setIsLoading(false);
  };

  const quickLoginOptions = [
    { name: 'Suraj (Employee)', email: 'suraj@tensor.com', role: 'Employee' },
    { name: 'Teja (Admin)', email: 'teja@tensor.com', role: 'Admin' },
    { name: 'Srinivas (Manager)', email: 'srinivas@tensor.com', role: 'Manager' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center p-4">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
      
      {/* Watermark Logo */}
      <div className="watermark-logo">
        <img src="https://imgs.search.brave.com/5juC3Ktu-Qo_leLX94SZ9odgBE3CnPNGJ4z4JnWwJTk/rs:fit:500:0:1:0/g:ce/aHR0cHM6Ly9tYXJr/ZXRwbGFjZS5pbnRl/bC5jb20vZmlsZS1h/c3NldC9hNVEzYjAw/MDAwMGh5QTJFQUlf/YTVTM2IwMDAwMDA1/NHlCRUFR" alt="TensorGo" className="w-full h-full object-contain" />
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="w-full max-w-md relative z-10"
      >
        {/* Scrolling Notification */}
        <div className="mb-6 bg-gradient-to-r from-green-400 to-blue-500 rounded-lg p-3 overflow-hidden relative">
          <motion.div
            key={currentNotification}
            initial={{ x: '100%' }}
            animate={{ x: '-100%' }}
            transition={{ duration: 15, ease: 'linear' }}
            className="text-white font-medium whitespace-nowrap"
          >
            {notifications[currentNotification].message}
          </motion.div>
        </div>

        {/* Login Card */}
        <motion.div 
          initial={{ scale: 0.95 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="bg-white rounded-2xl shadow-xl p-8 backdrop-blur-sm bg-opacity-95"
        >
          {/* Logo and Header */}
          <div className="text-center mb-8">
            <div className="w-20 h-20 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <span className="text-white font-bold text-2xl">TG</span>
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">HRMS Portal</h1>
            <p className="text-gray-600">Leave Management System</p>
          </div>

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  placeholder="Enter your email"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  placeholder="Enter your password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 text-white py-3 rounded-lg font-semibold hover:from-blue-600 hover:to-indigo-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
            >
              {isLoading ? <LoadingSpinner size="sm" /> : 'Sign In'}
            </motion.button>
          </form>

          {/* Quick Login Options */}
          <div className="mt-8 pt-6 border-t border-gray-200">
            <p className="text-sm text-gray-600 text-center mb-4">Quick Login (Demo)</p>
            <div className="space-y-2">
              {quickLoginOptions.map((option) => (
                <button
                  key={option.email}
                  onClick={() => {
                    setEmail(option.email);
                    setPassword('password123');
                  }}
                  className="w-full text-left px-4 py-2 text-sm bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <span className="font-medium">{option.name}</span>
                  <span className="text-gray-500 ml-2">({option.role})</span>
                </button>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Footer */}
        <div className="text-center mt-8 text-gray-500 text-sm">
          <p>© 2025 TensorGo. All rights reserved.</p>
        </div>
      </motion.div>
    </div>
  );
};

export default Login;
