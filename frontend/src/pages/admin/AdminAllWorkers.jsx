import React, { useState, useEffect } from 'react';
// --- FIXED ---
// Your API file is 'api.js'
import { getAdminAllWorkers } from '../../services/api.js';
import toast from 'react-hot-toast';

// --- FIXED --- 
// Using 'fa6' (Font Awesome 6) and modern equivalents
import { 
  FaSpinner, 
  FaCircleUser, // Replaced FaUserCircle
  FaEnvelope, 
  FaCity, 
  FaListUl // Replaced FaListAlt
} from "react-icons/fa6";

import { Link } from 'react-router-dom';

// --- NEW LOADING COMPONENT (Fixed) ---
const LoadingComponent = () => (
  <div className="flex flex-col items-center justify-center min-h-[calc(100vh-200px)] p-12">
    <FaSpinner className="animate-spin text-green-600 text-5xl" />
    <p className="mt-4 text-gray-600 text-lg">Loading Workers...</p>
  </div>
);

function AdminAllWorkers() {
  const [workers, setWorkers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadWorkers = async () => {
      try {
        setLoading(true);
        const response = await getAdminAllWorkers();
        setWorkers(response.data);
      } catch (error) {
        toast.error("Failed to load workers.");
      } finally {
        setLoading(false);
      }
    };
    loadWorkers();
  }, []);

  if (loading) return <LoadingComponent />;

  return (
    <div className="bg-white p-6 rounded-lg shadow-lg">
      <div className="flex flex-col sm:flex-row justify-between items-center mb-4 gap-4">
        <h2 className="text-2xl font-bold text-gray-800">Manage Workers ({workers.length})</h2>
        <Link 
          to="/admin/create-worker" 
          className="px-4 py-2 bg-green-700 text-white text-sm font-medium rounded-md hover:bg-green-600 w-full sm:w-auto text-center"
        >
          + Create New Worker
        </Link>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">City</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Pending Tasks</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {workers.map(worker => (
              <tr key={worker._id}>
                <td className="px-4 py-4 text-sm font-medium text-gray-900">{worker.name}</td>
                <td className="px-4 py-4 text-sm text-gray-700">{worker.email}</td>
                <td className="px-4 py-4 text-sm text-gray-700">{worker.city}</td>
                <td className="px-4 py-4 text-sm font-bold text-gray-900 text-center">{worker.pendingTaskCount}</td>
                <td className="px-4 py-4 text-sm">
                  {worker.isActive ? (
                    <span className="px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                      Active
                    </span>
                  ) : (
                    <span className="px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800">
                      Inactive
                    </span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default AdminAllWorkers;