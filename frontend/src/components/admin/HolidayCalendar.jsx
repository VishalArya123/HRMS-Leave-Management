import React from 'react';
import { holidays } from '../../data/mockData';
import { motion } from 'framer-motion';
import { Calendar } from 'lucide-react';

const HolidayCalendar = () => (
  <motion.div
    className="rounded-lg shadow-lg bg-white p-6"
    whileHover={{ y: -2, boxShadow: '0 8px 32px rgba(16, 185, 129, 0.10)' }}
  >
    <h3 className="flex items-center gap-2 font-bold text-green-800 mb-3 text-lg">
      <Calendar className="h-4 w-4" /> Holidays 2025
    </h3>
    <ul>
      {holidays.map(h => (
        <li key={h.date} className="mb-2">
          <span className="font-semibold">{h.name}</span>
          <span className="ml-2 text-xs text-gray-500">({h.date})</span>
          <span className={`ml-2 text-xs ${
            h.type === 'national' ? 'text-blue-400' : 'text-yellow-500'
          }`}>
            {h.type}
          </span>
        </li>
      ))}
    </ul>
  </motion.div>
);

export default HolidayCalendar;
