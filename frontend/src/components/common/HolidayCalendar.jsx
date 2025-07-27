import React from 'react';
import { holidays } from '../../data/mockData';
import { motion } from 'framer-motion';
import { Calendar, Star } from 'lucide-react';

const HolidayCalendar = ({ showAll = false }) => {
  const displayHolidays = showAll ? holidays : holidays.slice(0, 6);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-xl shadow-lg p-6"
    >
      <h3 className="flex items-center gap-2 font-bold text-green-800 mb-4 text-lg">
        <Calendar className="h-5 w-5" />
        Company Holidays 2025
        {!showAll && <span className="text-sm text-gray-500">({holidays.length} total)</span>}
      </h3>
      
      <div className="space-y-3">
        {displayHolidays.map((holiday, index) => (
          <motion.div
            key={holiday.date}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            className="flex items-center justify-between p-3 bg-gradient-to-r from-green-50 to-blue-50 rounded-lg hover:shadow-md transition-shadow"
          >
            <div className="flex items-center gap-3">
              {holiday.type === 'national' ? (
                <Star className="h-5 w-5 text-blue-500" />
              ) : (
                <Calendar className="h-5 w-5 text-green-500" />
              )}
              <div>
                <p className="font-semibold text-gray-900">{holiday.name}</p>
                <p className="text-sm text-gray-600">{holiday.date}</p>
              </div>
            </div>
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
              holiday.type === 'national' 
                ? 'bg-blue-100 text-blue-700' 
                : 'bg-green-100 text-green-700'
            }`}>
              {holiday.type}
            </span>
          </motion.div>
        ))}
      </div>
      
      {!showAll && holidays.length > 6 && (
        <p className="text-center text-sm text-blue-600 mt-4 cursor-pointer hover:underline">
          View all {holidays.length} holidays →
        </p>
      )}
    </motion.div>
  );
};

export default HolidayCalendar;
