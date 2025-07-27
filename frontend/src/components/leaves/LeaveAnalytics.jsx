import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import { motion } from 'framer-motion';
import { TrendingUp } from 'lucide-react';

const LeaveAnalytics = ({ data }) => {
  const monthlyData = [
    { month: 'Jan', sick: 2, casual: 3, vacation: 1 },
    { month: 'Feb', sick: 1, casual: 2, vacation: 2 },
    { month: 'Mar', sick: 3, casual: 1, vacation: 3 },
    { month: 'Apr', sick: 1, casual: 4, vacation: 2 },
    { month: 'May', sick: 2, casual: 2, vacation: 4 },
    { month: 'Jun', sick: 1, casual: 3, vacation: 2 },
    { month: 'Jul', sick: 2, casual: 1, vacation: 3 }
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-xl shadow-lg p-6"
    >
      <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
        <TrendingUp className="h-5 w-5 text-blue-600" />
        Leave Usage Analytics
      </h3>
      
      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={monthlyData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="sick" fill="#ef4444" name="Sick Leave" />
            <Bar dataKey="casual" fill="#3b82f6" name="Casual Leave" />
            <Bar dataKey="vacation" fill="#10b981" name="Vacation Leave" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </motion.div>
  );
};

export default LeaveAnalytics;
