import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth.jsx'; // .jsx extension
// --- FIXED ---
import { FaSpinner } from 'react-icons/fa6'; // Using 'fa6'

const LoadingScreen = () => (
  <div className="flex items-center justify-center min-h-screen">
    {/* --- FIXED --- */}
    <FaSpinner className="animate-spin text-green-600 text-4xl" />
  </div>
);

const WorkerRoute = () => {
  const auth = useAuth();

  // 1. Loading state check
  if (auth.loading) {
    return <LoadingScreen />;
  }

  // 2. Check for logged in worker
  if (auth.isLoggedIn && auth.user?.role === 'Worker') {
    return <Outlet />; // Render the worker page
  }
  
  // 3. Redirect to login
  return <Navigate to="/login" replace />;
};

export default WorkerRoute;