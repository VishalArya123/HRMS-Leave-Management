import React from 'react';
import LeaveRules from '../components/admin/LeaveRules';
import HolidayCalendar from '../components/admin/HolidayCalendar';
import QuotaManagement from '../components/admin/QuotaManagement';
import { Settings } from 'lucide-react';

const Admin = () => (
  <div>
    <h2 className="text-2xl mb-4 font-bold text-blue-700 flex items-center gap-2">
      <Settings className="h-6 w-6" /> Admin Panel
    </h2>
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <LeaveRules />
      <HolidayCalendar />
      <QuotaManagement />
    </div>
  </div>
);

export default Admin;
