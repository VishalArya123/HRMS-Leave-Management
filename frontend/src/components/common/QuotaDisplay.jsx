import React from 'react';
import { leaveTypes } from '../../data/mockData';
import { motion } from 'framer-motion';
import { Target, Info } from 'lucide-react';

const QuotaDisplay = () => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-xl shadow-lg p-6"
    >
      <h3 className="flex items-center gap-2 font-bold text-purple-800 mb-4 text-lg">
        <Target className="h-5 w-5" />
        Leave Quotas & Rules
      </h3>
      
      <div className="space-y-4">
        {leaveTypes.map((type, index) => (
          <motion.div
            key={type.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-3">
                <div 
                  className="w-4 h-4 rounded-full"
                  style={{ backgroundColor: type.color }}
                />
                <h4 className="font-semibold text-gray-900">{type.name}</h4>
                <span className="text-xs bg-gray-100 px-2 py-1 rounded-full text-gray-600">
                  {type.code}
                </span>
              </div>
              <span className="font-bold text-lg text-gray-700">
                {type.maxDays} days
              </span>
            </div>
            
            <p className="text-sm text-gray-600 mb-3">{type.description}</p>
            
            <div className="flex gap-4 text-xs">
              <span className={`px-2 py-1 rounded-full ${
                type.carryForward 
                  ? 'bg-green-100 text-green-700' 
                  : 'bg-red-100 text-red-700'
              }`}>
                {type.carryForward ? 'Carry Forward: Yes' : 'Carry Forward: No'}
              </span>
              <span className={`px-2 py-1 rounded-full ${
                type.documentation 
                  ? 'bg-yellow-100 text-yellow-700' 
                  : 'bg-blue-100 text-blue-700'
              }`}>
                {type.documentation ? 'Documentation Required' : 'No Documentation'}
              </span>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="mt-6 p-4 bg-blue-50 rounded-lg">
        <div className="flex items-start gap-2">
          <Info className="h-5 w-5 text-blue-600 mt-0.5" />
          <div className="text-sm text-blue-800">
            <p className="font-semibold mb-1">Important Notes:</p>
            <ul className="space-y-1 text-xs">
              <li>• Leave balances are updated monthly</li>
              <li>• Documentation required leaves need manager approval</li>
              <li>• Carry forward leaves expire at year end</li>
              <li>• Weekend and holiday validations are automatically applied</li>
            </ul>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default QuotaDisplay;
