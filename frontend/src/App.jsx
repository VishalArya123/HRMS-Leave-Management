import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import Layout from './components/common/Layout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard.jsx'; 
import ApplyLeave from './pages/ApplyLeave';
import MyLeaves from './pages/MyLeaves';
import Approvals from './pages/Approvals';
import Admin from './pages/AdminPanel';
import LoadingSpinner from './components/common/LoadingSpinner';

function App() {
  const { user, loading } = useAuth();

  if (loading) {
    return <LoadingSpinner />;
  }

  if (!user) {
    return <Login />;
  }

  return (
    <Layout>
      <div className="watermark">TENSORGO</div>
      <Routes>
        <Route path="/" element={<Navigate to="/dashboard" />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/apply-leave" element={<ApplyLeave />} />
        <Route path="/my-leaves" element={<MyLeaves />} />
        {(user.role === 'manager' || user.role === 'admin') && (
          <Route path="/approvals" element={<Approvals />} />
        )}
        {user.role === 'admin' && (
          <Route path="/admin" element={<Admin />} />
        )}
        <Route path="*" element={<Navigate to="/dashboard" />} />
      </Routes>
    </Layout>
  );
}

export default App;