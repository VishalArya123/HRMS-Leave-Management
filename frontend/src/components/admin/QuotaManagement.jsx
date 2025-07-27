import React from 'react';
import { leaveTypes } from '../../data/mockData';
import { motion } from 'framer-motion';

const QuotaManagement = () => (
  <motion.div
    className="rounded-lg shadow-lg bg-white p-6"
    whileHover={{ y: -2, boxShadow: '0 8px 32px rgba(245, 158, 11, 0.10)' }}
  >
    <h3 className="font-bold text-yellow-700 mb-3 text-lg">Quota Management</h3>
    <table className="min-w-full text-gray-700 text-sm">
      <thead>
        <tr>
          <th className="text-left py-1">Leave Type</th>
          <th className="text-right py-1">Annual Quota</th>
          <th className="text-right py-1">Carry Forward</th>
        </tr>
      </thead>
      <tbody>
        {leaveTypes.map(type => (
          <tr key={type.id}>
            <td className="py-1">{type.name}</td>
            <td className="py-1 text-right">{type.maxDays}</td>
            <td className="py-1 text-right">
              {type.carryForward ? (
                <span className="rounded bg-green-100 px-2 py-0.5 text-green-800">Yes</span>
              ) : (
                <span className="rounded bg-red-100 px-2 py-0.5 text-red-700">No</span>
              )}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  </motion.div>
);

export default QuotaManagement;
