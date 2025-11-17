import React, { useState, useEffect } from 'react';
// --- FIXED ---
// Your API file is 'api.js', not '.jsx'
import { getAdminAllReports, getAdminAllWorkers } from '../../services/api.js';
import { motion } from 'framer-motion';

// --- FIXED --- 
// Using 'fa6' (Font Awesome 6) and modern equivalents
import { 
  FaListUl, // FaListAlt -> FaListUl
  FaUsers, 
  FaCircleCheck, // FaCheckCircle -> FaCircleCheck
  FaHourglassHalf,
  FaSpinner
} from "react-icons/fa6";

// Loading component
const LoadingComponent = () => (
  <div className="flex flex-col items-center justify-center min-h-[calc(100vh-200px)]">
    {/* --- FIXED --- */}
    <FaSpinner className="animate-spin text-green-600 text-5xl" />
    <p className="mt-4 text-gray-600 text-lg">Loading Dashboard...</p>
  </div>
);


// Stat Card Component
// --- FIXED --- 
// Regenerating the full, syntactically correct component
const StatCard = ({ title, value, icon, bgColor, color }) => (
  <motion.div
    className="bg-white p-6 rounded-2xl shadow-lg flex items-center space-x-5"
    initial={{ opacity: 0, y: 30 }}
    animate={{ opacity: 1, y: 0 }}
    whileHover={{ y: -5, shadow: 'xl' }}
  >
    <div className={`flex-shrink-0 p-4 rounded-full ${bgColor} ${color}`}>
      {React.cloneElement(icon, { className: "h-8 w-8" })}
    </div>
    <div className="flex-1 min-w-0">
      <p className="text-sm font-medium text-gray-500 truncate">{title}</p>
      <p className="text-3xl font-bold text-gray-900">{value}</p>
    </div>
  </motion.div>
);

function AdminDashboard() {
  const [stats, setStats] = useState({
    totalReports: 0,
    pendingReports: 0,
    completedReports: 0,
    totalWorkers: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);

        const [reportsRes, workersRes] = await Promise.all([
          getAdminAllReports(),
          getAdminAllWorkers()
        ]);

        const reports = reportsRes.data;
        const workers = workersRes.data;

        setStats({
          totalReports: reports.length,
          pendingReports: reports.filter(r => r.status === 'Pending' || r.status === 'Assigned').length,
          completedReports: reports.filter(r => r.status === 'Completed').length,
          totalWorkers: workers.length,
        });
      } catch (error) {
        console.error("Failed to fetch stats:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) return <LoadingComponent />;

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-800">Overview</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title="Total Reports" 
          value={stats.totalReports} 
          icon={<FaListUl />} 
          color="text-blue-700"
          bgColor="bg-blue-100"
        />
        <StatCard 
          title="Pending Tasks" 
          value={stats.pendingReports} 
          icon={<FaHourglassHalf />} 
          color="text-yellow-700"
          bgColor="bg-yellow-100"
        />
        <StatCard 
          title="Completed Tasks" 
          value={stats.completedReports} 
          icon={<FaCircleCheck />} 
          color="text-green-700"
          bgColor="bg-green-100"
        />
        <StatCard 
          title="Total Workers" 
          value={stats.totalWorkers} 
          icon={<FaUsers />} 
          color="text-indigo-700"
          bgColor="bg-indigo-100"
        />
      </div>
    </div>
  );
}

export default AdminDashboard;