import React, { useState, useEffect } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
import { motion } from 'framer-motion';
import { dataManager } from '../../utils/dataManager';
import { useAuth } from '../../context/AuthContext';
import { AlertTriangle, Info, DollarSign } from 'lucide-react';

const LeaveBalanceChart = ({ balances, leaveTypes }) => {
  const { user } = useAuth();
  const [lopAnalytics, setLopAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadLOPAnalytics();
  }, [user.id]);

  const loadLOPAnalytics = async () => {
    try {
      const analytics = await dataManager.getLOPAnalytics(user.id);
      setLopAnalytics(analytics);
    } catch (error) {
      console.error('Failed to load LOP analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!balances || balances.length === 0) {
    return (
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="bg-white rounded-xl shadow-lg p-6"
      >
        <h3 className="text-xl font-bold text-gray-900 mb-6">Leave Balance Overview</h3>
        <div className="flex items-center justify-center h-64 text-gray-500">
          <p>No leave balance data available</p>
        </div>
      </motion.div>
    );
  }

  const chartData = balances.map(balance => {
    const leaveType = leaveTypes.find(type => type.id === balance.leaveType);
    const available = balance.allocated - balance.used - balance.pending;
    
    return {
      name: leaveType?.name || balance.leaveType,
      used: balance.used,
      available: Math.max(0, available),
      pending: balance.pending,
      allocated: balance.allocated,
      color: leaveType?.color || '#6b7280'
    };
  });

  const pieData = chartData.map(item => ({
    name: item.name,
    value: item.used,
    color: item.color
  }));

  const renderCustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0];
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-semibold">{data.payload.name}</p>
          <p className="text-red-500">Used: {data.payload.used}</p>
          <p className="text-green-500">Available: {data.payload.available}</p>
          <p className="text-yellow-500">Pending: {data.payload.pending}</p>
          <p className="text-blue-500">Total: {data.payload.allocated}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
      className="bg-white rounded-xl shadow-lg p-6"
    >
      <h3 className="text-xl font-bold text-gray-900 mb-6">Leave Balance Overview</h3>
      
      <div className="grid md:grid-cols-2 gap-6">
        {/* Pie Chart */}
        <div className="h-80">
          <h4 className="text-sm font-medium text-gray-600 mb-2">Leave Usage Distribution</h4>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={pieData}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={80}
                fill="#8884d8"
                label={({ name, value }) => `${name}: ${value}`}
              >
                {pieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Bar Chart */}
        <div className="h-80">
          <h4 className="text-sm font-medium text-gray-600 mb-2">Leave Balance Details</h4>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" angle={-45} textAnchor="end" height={60} />
              <YAxis />
              <Tooltip content={renderCustomTooltip} />
              <Bar dataKey="used" fill="#ef4444" name="Used" />
              <Bar dataKey="available" fill="#10b981" name="Available" />
              <Bar dataKey="pending" fill="#f59e0b" name="Pending" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
        {chartData.map((item, index) => (
          <motion.div 
            key={index}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            className="p-4 bg-gray-50 rounded-lg border"
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center space-x-3">
                <div 
                  className="w-4 h-4 rounded-full"
                  style={{ backgroundColor: item.color }}
                />
                <span className="font-medium text-sm">{item.name}</span>
              </div>
            </div>
            <div className="space-y-1 text-xs">
              <div className="flex justify-between">
                <span className="text-gray-600">Allocated:</span>
                <span className="font-semibold">{item.allocated}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-red-600">Used:</span>
                <span className="font-semibold">{item.used}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-green-600">Available:</span>
                <span className="font-semibold">{item.available}</span>
              </div>
              {item.pending > 0 && (
                <div className="flex justify-between">
                  <span className="text-yellow-600">Pending:</span>
                  <span className="font-semibold">{item.pending}</span>
                </div>
              )}
            </div>
          </motion.div>
        ))}
      </div>

      {/* LOP Analytics Section */}
      {!loading && lopAnalytics && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mt-8 p-6 bg-gradient-to-r from-red-50 to-orange-50 rounded-xl border border-red-200"
        >
          <div className="flex items-center gap-2 mb-4">
            <DollarSign className="h-6 w-6 text-red-600" />
            <h4 className="text-lg font-bold text-red-800">Loss of Pay (LOP) Analytics</h4>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
            <div className="text-center p-3 bg-white rounded-lg border border-red-200">
              <p className="text-2xl font-bold text-red-600">{lopAnalytics.totalLOPDays}</p>
              <p className="text-sm text-gray-600">LOP Days Used</p>
            </div>
            <div className="text-center p-3 bg-white rounded-lg border border-orange-200">
              <p className="text-2xl font-bold text-orange-600">{lopAnalytics.remainingLOPDays}</p>
              <p className="text-sm text-gray-600">LOP Days Remaining</p>
            </div>
            <div className="text-center p-3 bg-white rounded-lg border border-blue-200">
              <p className="text-2xl font-bold text-blue-600">{lopAnalytics.maxLOPPerYear}</p>
              <p className="text-sm text-gray-600">Annual LOP Limit</p>
            </div>
            <div className="text-center p-3 bg-white rounded-lg border border-green-200">
              <p className="text-2xl font-bold text-green-600">{lopAnalytics.lopUtilizationPercent}%</p>
              <p className="text-sm text-gray-600">LOP Utilization</p>
            </div>
          </div>

          {/* Important Notes */}
          <div className="bg-white rounded-lg p-4 border border-red-200">
            <div className="flex items-start gap-2 mb-3">
              <Info className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
              <h5 className="font-semibold text-gray-800">Important Notes about LOP:</h5>
            </div>
            <ul className="space-y-2 text-sm text-gray-700 ml-7">
              <li className="flex items-start gap-2">
                <AlertTriangle className="h-4 w-4 text-orange-500 mt-0.5 flex-shrink-0" />
                <span><strong>LOP Calculation:</strong> Any leave beyond your available balance is treated as Loss of Pay (LOP)</span>
              </li>
              <li className="flex items-start gap-2">
                <AlertTriangle className="h-4 w-4 text-red-500 mt-0.5 flex-shrink-0" />
                <span><strong>Annual LOP Limit:</strong> Maximum {lopAnalytics.maxLOPPerYear} LOP days allowed per year</span>
              </li>
              <li className="flex items-start gap-2">
                <AlertTriangle className="h-4 w-4 text-blue-500 mt-0.5 flex-shrink-0" />
                <span><strong>Salary Impact:</strong> LOP days will be deducted from your monthly salary</span>
              </li>
              <li className="flex items-start gap-2">
                <AlertTriangle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                <span><strong>Cancellation:</strong> You can cancel pending leave requests before the start date</span>
              </li>
            </ul>
          </div>

          {/* LOP Breakdown by Leave Type */}
          {Object.keys(lopAnalytics.lopBreakdown).length > 0 && (
            <div className="mt-4 bg-white rounded-lg p-4 border border-red-200">
              <h5 className="font-semibold text-gray-800 mb-2">LOP Breakdown by Leave Type:</h5>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                {Object.entries(lopAnalytics.lopBreakdown).map(([leaveType, days]) => {
                  const typeInfo = leaveTypes.find(lt => lt.id === leaveType);
                  return (
                    <div key={leaveType} className="text-center p-2 bg-gray-50 rounded">
                      <div 
                        className="w-3 h-3 rounded-full mx-auto mb-1"
                        style={{ backgroundColor: typeInfo?.color || '#6b7280' }}
                      />
                      <p className="text-xs font-medium">{typeInfo?.name || leaveType}</p>
                      <p className="text-sm font-bold text-red-600">{days} days</p>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </motion.div>
      )}
    </motion.div>
  );
};

export default LeaveBalanceChart;
