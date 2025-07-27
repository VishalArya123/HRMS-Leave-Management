import React from 'react';
import { leaveTypes } from '../../data/mockData';
import { motion } from 'framer-motion';

const LeaveRules = () => (
  <motion.div
    className="rounded-lg shadow-lg bg-white p-6"
    whileHover={{ y: -2, boxShadow: '0 8px 32px rgba(59, 130, 246, 0.10)' }}
  >
    <h3 className="font-bold text-blue-800 mb-3 text-lg">Leave Rules</h3>
    <ul>
      {leaveTypes.map(type => (
        <li key={type.id} className="mb-2">
          <div className="flex justify-between items-center">
            <span>
              <span
                className="inline-block w-3 h-3 rounded-full mr-2 align-middle"
                style={{ background: type.color }}
              />
              {type.name}
            </span>
            <span className="text-xs text-gray-500">
              Max: {type.maxDays} days &nbsp;
              {(type.documentation ? '📝 Doc Req.' : '')}
            </span>
          </div>
        </li>
      ))}
    </ul>
  </motion.div>
);

export default LeaveRules;
