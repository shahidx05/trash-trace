import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import Button from '../common/Button.jsx'; // --- FIXED: Added .jsx extension

// --- FIXED: Consolidated icons to FA6 equivalents ---
import {
  FaCircleCheck,       // Replaced FaCheckCircle
  FaCircleXmark,      // Replaced FaTimesCircle
  FaTriangleExclamation, // Replaced FaExclamationTriangle
  FaLocationDot,      // Replaced FaMapMarkerAlt
  FaListCheck,        // Replaced FaTasks
  FaCheck,
  FaClock
} from "react-icons/fa6"; 

// --- Worker Report Card ---
export const ReportCard = ({ report, index }) => {
  const getSeverityClass = (severity) => {
    switch (severity) {
      case 'High': return 'border-red-500 bg-red-50';
      case 'Medium': return 'border-yellow-500 bg-yellow-50';
      default: return 'border-gray-300 bg-white';
    }
  };

  const getStatusIcon = (status) => {
    if (status === 'Completed') {
      return <FaCircleCheck className="text-green-500" />; // Using FaCircleCheck
    }
    if (status === 'Declined') {
      return <FaCircleXmark className="text-red-500" />; // Using FaCircleXmark
    }
    return null;
  };

  return (
    <motion.div
      key={report._id}
      className={`rounded-lg shadow-md overflow-hidden border-l-4 ${getSeverityClass(report.severity)}`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
    >
      <div className="flex flex-col md:flex-row">
        <img src={report.imageUrl_before} alt="Report" className="w-full h-48 md:w-48 object-cover" />
        <div className="p-4 flex-grow">
          <div className="flex justify-between items-start">
            <span className={`px-2 py-0.5 text-xs font-semibold rounded-full ${
              report.severity === 'High' ? 'bg-red-100 text-red-800' :
              report.severity === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
              'bg-gray-100 text-gray-800'
            }`}>
              <FaTriangleExclamation className="inline mr-1" /> {/* Using FaTriangleExclamation */}
              {report.severity}
            </span>
            <span className="text-xs text-gray-500">
              {new Date(report.createdAt).toLocaleDateString()}
            </span>
          </div>
          <p className="text-lg font-semibold text-gray-800 my-2">{report.description || 'No description'}</p>
          <p className="text-sm text-gray-600 flex items-center">
            <FaLocationDot className="mr-2 text-gray-400" /> {/* Using FaLocationDot */}
            {report.address || 'Address not found'}
          </p>
          <p className="text-sm text-gray-600">City: {report.city}</p>
        </div>

        <div className="p-4 flex-shrink-0 flex items-center justify-center bg-gray-50 md:bg-transparent">
          {report.status === 'Assigned' ? (
            <Link to={`/worker/update/${report._id}`} className="w-full">
              <Button
                variant="primary"
                size="md"
                className="w-full md:w-auto shadow"
              >
                Update Status
              </Button>
            </Link>
          ) : (
            <div className="flex flex-col items-center text-sm font-medium">
              {getStatusIcon(report.status)}
              <span className="mt-1">{report.status}</span>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};

// --- Stat Card Component ---
export const StatCard = ({ title, value, icon, color }) => (
  <div className="bg-white p-4 rounded-lg shadow-md flex items-center"> 
    <div className={`p-3 rounded-full ${color} text-white mr-4`}>
      {/* Note: Icons passed here (FaTasks, FaCheck, FaClock) must be Fa6 equivalents 
           (FaListCheck, FaCheck, FaClock) in the parent component (WorkerDashboard.jsx). 
           We will assume the parent is updated to pass the correct FA6 icons. 
      */}
      {icon} 
    </div>
    <div>
      <p className="text-sm font-medium text-gray-500">{title}</p>
      <p className="text-2xl font-bold text-gray-900">{value}</p>
    </div>
  </div>
);