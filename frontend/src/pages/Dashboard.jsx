import React, { useState, useEffect } from 'react';
import { dataManager } from '../utils/dataManager';
import { useAuth } from '../context/AuthContext';
import LeaveBalanceChart from '../components/dashboard/LeaveBalanceChart';
import HolidayCalendar from '../components/common/HolidayCalendar';
import QuotaDisplay from '../components/common/QuotaDisplay';
import { Calendar, Bell, Target, Users, Loader } from 'lucide-react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';

const Dashboard = () => {
  const { user } = useAuth();
  const [leaveBalances, setLeaveBalances] = useState([]);
  const [leaveTypes, setLeaveTypes] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [pendingApprovals, setPendingApprovals] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const [balancesData, typesData, notificationsData] = await Promise.all([
        dataManager.getLeaveBalances(user.id),
        dataManager.getLeaveTypes(),
        dataManager.getNotifications()
      ]);

      setLeaveBalances(balancesData);
      setLeaveTypes(typesData);
      setNotifications(notificationsData);

      // Load pending approvals count for managers/admins
      if (user.role === 'manager' || user.role === 'admin') {
        const allRequests = await dataManager.getLeaveRequests();
        const employees = await dataManager.getEmployees();
        
        const managedIds = user.role === 'manager'
          ? employees.filter(e => e.manager === user.id).map(e => e.id)
          : employees.map(e => e.id);

        const pendingCount = allRequests.filter(req => 
          req.status === 'pending' && managedIds.includes(req.employeeId)
        ).length;
        
        setPendingApprovals(pendingCount);
      }

    } catch (error) {
      toast.error('Failed to load dashboard data');
      console.error('Dashboard load error:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader className="h-8 w-8 animate-spin text-blue-600" />
        <span className="ml-2 text-gray-600">Loading dashboard...</span>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl p-6 text-white"
      >
        <h1 className="text-2xl font-bold mb-2">Welcome back, {user.name}! 👋</h1>
        <p className="text-blue-100">Manage your leaves efficiently with our HRMS system.</p>
        
        {/* Latest notification */}
        {notifications.length > 0 && (
          <div className="mt-4 bg-white bg-opacity-20 rounded-lg p-3">
            <p className="text-sm font-medium">Latest Update:</p>
            <p className="text-blue-100">{notifications[0].message}</p>
          </div>
        )}
      </motion.div>

      {/* Main Dashboard Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        <LeaveBalanceChart balances={leaveBalances} leaveTypes={leaveTypes} />
        <HolidayCalendar />
      </div>

      {/* Secondary Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <QuotaDisplay />
        
        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-xl shadow-lg p-6"
        >
          <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Users className="h-5 w-5 text-blue-600" />
            Quick Actions
          </h3>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Link to="/apply-leave">
              <motion.div
                whileHover={{ scale: 1.02 }}
                className="p-4 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg border border-blue-200 cursor-pointer"
              >
                <Calendar className="w-8 h-8 text-blue-500 mb-2" />
                <p className="font-semibold text-blue-800">Apply for Leave</p>
                <span className="text-gray-600 text-sm">Submit a new leave request</span>
              </motion.div>
            </Link>
            
            <Link to="/my-leaves">
              <motion.div
                whileHover={{ scale: 1.02 }}
                className="p-4 bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg border border-green-200 cursor-pointer"
              >
                <Target className="w-8 h-8 text-green-500 mb-2" />
                <p className="font-semibold text-green-800">View My Leaves</p>
                <span className="text-gray-600 text-sm">Check application status</span>
              </motion.div>
            </Link>
            
            {(user.role === 'manager' || user.role === 'admin') && (
              <Link to="/approvals">
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  className="p-4 bg-gradient-to-br from-purple-50 to-violet-50 rounded-lg border border-purple-200 cursor-pointer relative"
                >
                  <Bell className="w-8 h-8 text-purple-500 mb-2" />
                  <p className="font-semibold text-purple-800">Pending Approvals</p>
                  <span className="text-gray-600 text-sm">Review team requests</span>
                  {pendingApprovals > 0 && (
                    <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-6 h-6 flex items-center justify-center">
                      {pendingApprovals}
                    </span>
                  )}
                </motion.div>
              </Link>
            )}
            
            {user.role === 'admin' && (
              <Link to="/admin">
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  className="p-4 bg-gradient-to-br from-orange-50 to-amber-50 rounded-lg border border-orange-200 cursor-pointer"
                >
                  <Users className="w-8 h-8 text-orange-500 mb-2" />
                  <p className="font-semibold text-orange-800">Admin Panel</p>
                  <span className="text-gray-600 text-sm">Manage system settings</span>
                </motion.div>
              </Link>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Dashboard;
