import React from 'react';
import { CalendarDays, Home, CheckCircle, Briefcase, Settings, Users } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { Link, useLocation } from 'react-router-dom';

const routes = [
  { path: "/dashboard", label: "Dashboard", icon: Home, roles: null },
  { path: "/apply-leave", label: "Apply Leave", icon: CalendarDays, roles: ['employee', 'manager', 'admin'] },
  { path: "/my-leaves", label: "My Leaves", icon: Briefcase, roles: ['employee', 'manager', 'admin'] },
  { path: "/approvals", label: "Approvals", icon: CheckCircle, roles: ['manager', 'admin'] },
  { path: "/admin", label: "Admin Panel", icon: Settings, roles: ['admin'] }
];

const Sidebar = ({ isOpen, onClose }) => {
  const { user } = useAuth();
  const { pathname } = useLocation();

  return (
    <aside className={`bg-white border-r transition-all duration-300 z-30 h-full w-64 fixed inset-y-0 left-0
      ${isOpen ? 'translate-x-0' : '-translate-x-full'} lg:static lg:translate-x-0`}>
      <div className="flex flex-col h-full">
        <div className="p-6 flex items-center">
          <img src="/src/assets/logo.png" alt="TensorGo" className="h-8 w-8 mr-2" />
          <span className="text-xl font-bold text-blue-700">HRMS</span>
        </div>
        <nav className="flex-1 space-y-1 px-2 pt-2">
          {routes
            .filter(route => !route.roles || route.roles.includes(user.role))
            .map(route => (
              <Link
                key={route.path}
                to={route.path}
                className={`flex items-center gap-3 px-4 py-2 rounded-lg mt-1 text-base font-medium
                  ${pathname === route.path
                    ? 'bg-blue-500 text-white'
                    : 'text-gray-700 hover:bg-blue-100 hover:text-blue-600'}
                `}
                onClick={onClose}
              >
                <route.icon className="h-5 w-5" />
                {route.label}
              </Link>
          ))}
        </nav>
        <div className="p-4 bg-blue-50 text-center text-xs text-blue-700">
          TensorGo HRMS © 2025
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
