import React from 'react';
import { Menu, LogOut, User } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const Header = ({ onMenuClick }) => {
  const { user, logout } = useAuth();

  return (
    <header className="flex items-center justify-between bg-white px-6 py-4 shadow-md sticky top-0 z-10">
      <div className="flex items-center space-x-3">
        <button className="lg:hidden p-2 rounded-md hover:bg-gray-100" onClick={onMenuClick}>
          <Menu className="h-6 w-6 text-blue-600" />
        </button>
        <img src="https://imgs.search.brave.com/5juC3Ktu-Qo_leLX94SZ9odgBE3CnPNGJ4z4JnWwJTk/rs:fit:500:0:1:0/g:ce/aHR0cHM6Ly9tYXJr/ZXRwbGFjZS5pbnRl/bC5jb20vZmlsZS1h/c3NldC9hNVEzYjAw/MDAwMGh5QTJFQUlf/YTVTM2IwMDAwMDA1/NHlCRUFR" alt="TensorGo" className="h-8 w-8" />
        <span className="font-extrabold text-blue-700 text-xl">TensorGo HRMS</span>
      </div>
      <div className="flex items-center gap-4">
        <div className="bg-blue-50 px-4 py-2 rounded-lg flex items-center gap-2 text-gray-700">
          <User className="h-4 w-4" />
          <span className="font-medium">{user?.name || 'User'}</span>
          <span className="text-xs text-blue-500">({user?.role})</span>
        </div>
        <button
          onClick={logout}
          className="p-2 hover:bg-blue-100 rounded-lg text-blue-600 transition"
          title="Sign out"
        >
          <LogOut className="h-6 w-6" />
        </button>
      </div>
    </header>
  );
};

export default Header;
