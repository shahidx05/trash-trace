import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
// --- FIXED 1 --- Added .js
import { getWorkerReports } from '../../services/api.js'; 
import toast from 'react-hot-toast';
// --- FIXED 2 ---
import { useAuth } from '../../hooks/useAuth.jsx';
import { motion } from 'framer-motion';

// --- FIXED 3 --- 
// Consolidating all icons to FA6 equivalents
import {
  FaSpinner,
  FaCircleUser, // Replaced FaUserCircle (used in header)
  FaList,
  FaListCheck, // Replaced FaTasks
  FaCheck,
  FaClock
} from "react-icons/fa6";

// --- FIXED 4 & 5 --- 
// Added .jsx extension for internal component paths
import { ReportCard, StatCard } from '../../components/worker/WorkerDashboardCards.jsx';
import Navbar from '../../components/layout/Navbar.jsx';

// --- Loading Component for Dashboard ---
const LoadingComponent = () => (
  <div className="flex flex-col items-center justify-center min-h-[calc(100vh-200px)] mt-16">
    <FaSpinner className="animate-spin text-green-600 text-5xl" />
    <p className="mt-4 text-gray-600 text-lg">Loading your tasks...</p>
  </div>
);


function WorkerDashboard() {
  const [reports, setReports] = useState([]); // Will hold the reports array
  const [stats, setStats] = useState(null); // Will hold the stats object
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('pending');
  const auth = useAuth();

  useEffect(() => {
    const fetchAllReports = async () => {
      try {
        setLoading(true);
        const response = await getWorkerReports(); 
        
        setReports(response.data.reports); // Set reports state
        setStats(response.data.stats);     // Set stats state

      } catch (error) {
        console.error("Failed to fetch reports:", error);
        toast.error("Could not load your tasks.");
      } finally {
        setLoading(false);
      }
    };

    fetchAllReports();
  }, []); // Runs once on component mount

  // Filter the full list into two separate lists.
  const pendingReports = useMemo(() => 
    reports.filter(report => report.status === 'Assigned'),
    [reports]
  );

  const historyReports = useMemo(() => 
    reports.filter(report => report.status === 'Completed' || report.status === 'Declined'),
    [reports]
  );

  // Helper to render a list or an empty message
  const renderReportList = (reports, emptyMessage) => {
    if (reports.length === 0) {
      return (
        <motion.div 
          className="text-center p-8 bg-white rounded-lg shadow"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <FaList className="h-12 w-12 text-gray-400 mx-auto" />
          <h2 className="mt-4 text-xl font-semibold text-gray-800">{emptyMessage.title}</h2>
          <p className="mt-2 text-gray-600">{emptyMessage.subtitle}</p>
        </motion.div>
      );
    }
    return (
      <div className="space-y-4">
        {/* Using the external ReportCard component */}
        {reports.map((report, index) => (
          <ReportCard key={report._id} report={report} index={index} />
        ))}
      </div>
    );
  };

  if (loading) return <LoadingComponent />;

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />

      <main className="max-w-4xl mx-auto p-4">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-900">
            Welcome, {auth.user?.name}
          </h1>
          <Link to="/worker/profile" className="text-sm font-medium text-green-700 hover:text-green-600">
            {/* Using FaCircleUser (FA6) */}
            <FaCircleUser className="inline mr-1" />
            My Profile
          </Link>
        </div>

        {/* --- STATS OVERVIEW --- */}
        {stats && (
          <motion.div 
            className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            {/* Icons passed to StatCard are now FA6: FaListCheck, FaCheck, FaClock */}
            <StatCard title="Pending Tasks" value={stats.assigned} icon={<FaListCheck />} color="bg-yellow-500" />
            <StatCard title="Completed" value={stats.completed} icon={<FaCheck />} color="bg-green-500" />
            <StatCard title="Total Jobs" value={stats.total} icon={<FaClock />} color="bg-blue-500" />
          </motion.div>
        )}

        {/* --- TABS --- */}
        <div className="flex mb-4 border-b border-gray-200 bg-white rounded-t-lg shadow-sm">
          <button
            onClick={() => setActiveTab('pending')}
            className={`flex-1 py-3 text-center font-medium ${
              activeTab === 'pending'
                ? 'border-b-2 border-green-600 text-green-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Pending Tasks {stats ? `(${stats.assigned})` : ''}
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`flex-1 py-3 text-center font-medium ${
              activeTab === 'history'
                ? 'border-b-2 border-green-600 text-green-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            History {stats ? `(${stats.completed + stats.declined})` : ''}
          </button>
        </div>

        {/* --- TAB CONTENT --- */}
        {!loading && (
          <div>
            {activeTab === 'pending' && renderReportList(pendingReports, {
              title: "No Pending Tasks",
              subtitle: "You are all caught up! New tasks will appear here."
            })}
            
            {activeTab === 'history' && renderReportList(historyReports, {
              title: "No Task History",
              subtitle: "Your completed or declined tasks will appear here."
            })}
          </div>
        )}
      </main>
    </div>
  );
}

export default WorkerDashboard;