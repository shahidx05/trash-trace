import React, { useState, useEffect } from 'react';
// --- FIXED ---
// Your API file is named 'api.js'
import { getAdminAllReports, adminUpdateReport, getAdminAllWorkers } from '../../services/api.js';
import toast from 'react-hot-toast';
// --- FIXED ---
// Using fa6 for consistency, as it's the modern standard
import { FaSpinner, FaFilter } from 'react-icons/fa6';

// --- NEW LOADING COMPONENT ---
const LoadingComponent = () => (
  <div className="flex flex-col items-center justify-center min-h-[calc(100vh-200px)] p-12">
    <FaSpinner className="animate-spin text-green-600 text-5xl" />
    <p className="mt-4 text-gray-600 text-lg">Loading Reports...</p>
  </div>
);

function AdminAllReports() {
  const [reports, setReports] = useState([]);
  const [workers, setWorkers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('All'); // 'All', 'Pending', 'Assigned', etc.

  // Fetch reports and workers
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const [reportsRes, workersRes] = await Promise.all([
          getAdminAllReports(),
          getAdminAllWorkers()
        ]);
        setReports(reportsRes.data);
        setWorkers(workersRes.data);
      } catch (error) {
        toast.error("Failed to load data.");
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);
  
  // Filtered reports logic
  const filteredReports = reports.filter(report => {
    if (filter === 'All') return true;
    return report.status === filter;
  });

  // Manual assignment handling
  const handleAssignWorker = async (reportId, workerId) => {
    if (!workerId) return toast.error("Please select a worker.");
    
    const loadingToast = toast.loading("Assigning worker...");
    try {
      const updateData = {
        workerId: workerId,
        status: "Assigned"
      };
      // /api/admin/report/status/:id call karein
      const response = await adminUpdateReport(reportId, updateData);
      
      // Local state update karein
      // Ensure the full populated report is returned from the backend
      const updatedReport = response.data.report;
      
      // Repopulate worker info if backend doesn't send it
      if (!updatedReport.assignedWorker.name) {
         const assignedWorker = workers.find(w => w._id === updatedReport.assignedWorker);
         updatedReport.assignedWorker = assignedWorker;
      }

      setReports(reports.map(r => r._id === reportId ? updatedReport : r));
      toast.dismiss(loadingToast);
      toast.success("Worker assigned!");
    } catch (error) {
      toast.dismiss(loadingToast);
      toast.error(error.response?.data?.message || "Failed to assign worker.");
    }
  };

  if (loading) return <LoadingComponent />;

  return (
    <div className="bg-white p-6 rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold text-gray-800 mb-4">All Reports ({filteredReports.length})</h2>
      
      {/* Filter Buttons */}
      <div className="flex flex-wrap gap-2 mb-4">
        {['All', 'Pending', 'Assigned', 'Completed', 'Declined'].map(status => (
          <button
            key={status}
            onClick={() => setFilter(status)}
            // --- FIXED ---
            className={`px-4 py-2 rounded-md text-sm font-medium ${
              filter === status ? 'bg-green-700 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            {status}
          </button>
        ))}
      </div>

      {/* Reports Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Report</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">City</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Assigned To</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Action</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredReports.map(report => (
              <tr key={report._id}>
                <td className="px-4 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <img src={report.imageUrl_before} alt="Report" className="w-16 h-16 object-cover rounded-md" />
                    <div className="ml-4">
                      <div className="text-sm font-medium text-gray-900">{report.description ? report.description.substring(0, 30) : 'No Description'}...</div>
                      <div className="text-sm text-gray-500">{new Date(report.createdAt).toLocaleDateString()}</div>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-4 text-sm text-gray-700">{report.city}</td>
                <td className="px-4 py-4">
                  <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                    report.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' :
                    report.status === 'Assigned' ? 'bg-blue-100 text-blue-800' :
                    report.status === 'Completed' ? 'bg-green-100 text-green-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {report.status}
                  </span>
                </td>
                <td className="px-4 py-4 text-sm text-gray-700">
                  {report.assignedWorker ? report.assignedWorker.name : 'N/A'}
                </td>
                <td className="px-4 py-4 text-sm">
                  {report.status === 'Pending' && (
                    <select 
                      onChange={(e) => handleAssignWorker(report._id, e.target.value)}
                      className="text-xs border-gray-300 rounded-md"
                      defaultValue=""
                    >
                      <option value="" disabled>Assign...</option>
                      {/* Only show workers in the same city as the report */}
                      {workers.filter(w => w.city.toLowerCase() === report.city.toLowerCase()).map(worker => (
                        <option key={worker._id} value={worker._id}>
                          {worker.name} ({worker.pendingTaskCount} tasks)
                        </option>
                      ))}
                    </select>
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

export default AdminAllReports;