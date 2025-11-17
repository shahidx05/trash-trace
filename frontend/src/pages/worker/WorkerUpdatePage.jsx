import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';

// --- Imports FIXED ---
import api from '../../services/api.js'; // --- FIXED: Added .js
import Button from '../../components/common/Button.jsx'; // --- FIXED: Added .jsx
import Card from '../../components/common/Card.jsx'; // --- FIXED: Added .jsx

// --- 4. FIXED: Consolidated icons to FA6 equivalents ---
import { 
  FaSpinner,
  FaCamera,
  FaChevronLeft,
  FaCheck,
  FaXmark // Replaced FaTimes (FA5) with FaXmark (FA6)
} from "react-icons/fa6";


// Loading component (keeping local definition, but could use common/LoadingSpinner)
const LoadingSpinner = () => (
  <div className="flex items-center justify-center h-64">
    <FaSpinner className="animate-spin text-green-600 text-4xl" />
  </div>
);

function WorkerUpdatePage() {
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [status, setStatus] = useState('Completed'); // Default to 'Completed'
  const [workerNotes, setWorkerNotes] = useState('');
  const [image, setImage] = useState(null); // 'After' image
  const [imagePreview, setImagePreview] = useState(null);
  const { reportId } = useParams();
  const navigate = useNavigate();

  // 1. Fetch the report details first
  useEffect(() => {
    const fetchReport = async () => {
      try {
        setLoading(true);
        const response = await api.get(`/reports/track/${reportId}`);
        setReport(response.data);
      } catch (error) {
        console.error("Failed to fetch report:", error);
        toast.error("Could not find the report.");
        navigate('/worker/dashboard');
      } finally {
        setLoading(false);
      }
    };
    fetchReport();
  }, [reportId, navigate]);

  // Handle image selection
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  // 2. Handle the form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Notes required only if declining
    if (status === 'Declined' && !workerNotes.trim()) {
        return toast.error('A reason is required when declining a report.');
    }
    // Photo required only if completing
    if (status === 'Completed' && !image) {
      return toast.error('Please upload an "After" photo for completed tasks.');
    }

    setIsUpdating(true);
    const loadingToast = toast.loading('Updating status...');

    const formData = new FormData();
    formData.append('status', status);
    formData.append('workerNotes', workerNotes);
    
    // Key must be 'image' to match backend Multer middleware
    if (image) {
      formData.append('image', image); 
    }

    try {
      await api.put(`/worker/update/${reportId}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      toast.dismiss(loadingToast);
      toast.success('Report updated successfully!');
      navigate('/worker/dashboard');

    } catch (error) {
      setIsUpdating(false);
      toast.dismiss(loadingToast);
      console.error('Update report error:', error);
      toast.error(error.response?.data?.message || 'Failed to update report.');
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white shadow-md">
        <div className="max-w-4xl mx-auto p-4 flex items-center">
          <Link to="/worker/dashboard" className="text-gray-600 hover:text-green-600">
            <FaChevronLeft className="h-5 w-5" />
          </Link>
          <h1 className="text-xl font-bold text-gray-800 ml-4">
            Update Report Status
          </h1>
        </div>
      </header>

      <main className="max-w-4xl mx-auto p-4">
        {/* Report Details Card - USING <Card> */}
        <Card className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Task Details</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h4 className="text-lg font-semibold text-gray-700 mb-2">Before Photo</h4>
              <img src={report?.imageUrl_before} alt="Before" className="w-full h-auto rounded-lg shadow-md" />
            </div>
            <div className="space-y-3">
              <p><strong>Severity:</strong> {report?.severity}</p>
              <p><strong>Address:</strong> {report?.address || 'N/A'}</p>
              <p><strong>City:</strong> {report?.city}</p>
              <p><strong>Description:</strong> {report?.description || 'N/A'}</p>
            </div>
          </div>
        </Card>

        {/* Update Form Card - USING <Card> */}
        <motion.form
          onSubmit={handleSubmit}
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
        >
            <Card className="space-y-6">
                <h2 className="text-2xl font-bold text-gray-900">Complete Task</h2>
                {/* --- Status --- */}
                <div>
                    <label htmlFor="status" className="block text-sm font-medium text-gray-700">
                    1. Update Status
                    </label>
                    <select
                    id="status"
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                    className="w-full px-4 py-3 mt-1 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-green-600"
                    >
                    <option value="Completed">Completed</option>
                    <option value="Declined">Declined</option>
                    </select>
                </div>

                {/* --- "After" Image Upload (Conditional) --- */}
                {status === 'Completed' && (
                    <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        2. Upload "After" Photo (Required)
                    </label>
                    <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
                        <div className="space-y-1 text-center">
                        {imagePreview ? (
                            <img src={imagePreview} alt="Preview" className="mx-auto h-40 w-auto rounded-md" />
                        ) : (
                            <FaCamera className="mx-auto h-12 w-12 text-gray-400" />
                        )}
                        <div className="flex text-sm text-gray-600">
                            <label
                            htmlFor="file-upload"
                            className="relative cursor-pointer bg-white rounded-md font-medium text-green-700 hover:text-green-600"
                            >
                            <span>Upload a file</span>
                            <input id="file-upload" name="image" type="file" className="sr-only" accept="image/*" onChange={handleImageChange} />
                            </label>
                        </div>
                        </div>
                    </div>
                    </div>
                )}

                {/* --- Worker Notes --- */}
                <div>
                    <label htmlFor="workerNotes" className="block text-sm font-medium text-gray-700">
                    {status === 'Completed' ? '3. Notes (Optional)' : '2. Reason for Declining (Required)'}
                    </label>
                    <textarea
                    id="workerNotes"
                    value={workerNotes}
                    onChange={(e) => setWorkerNotes(e.target.value)}
                    rows={3}
                    placeholder={status === 'Completed' ? "e.g., All trash removed." : "e.g., False report, no trash found."}
                    className="w-full px-4 py-3 mt-1 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-green-600"
                    required={status === 'Declined'}
                    />
                </div>

                {/* --- Submit Button - USING <Button> --- */}
                <div>
                    <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                        <Button
                            type="submit"
                            disabled={isUpdating}
                            variant={status === 'Completed' ? 'primary' : 'danger'} // Dynamic variant!
                            size="lg"
                            className="w-full flex justify-center items-center shadow-lg"
                        >
                            {isUpdating ? (
                            <FaSpinner className="animate-spin mr-2" />
                            ) : (
                            // Use FaXmark for Declined status
                            status === 'Completed' ? <FaCheck className="mr-2" /> : <FaXmark className="mr-2" />
                            )}
                            {isUpdating ? 'Updating...' : `Mark as ${status}`}
                        </Button>
                    </motion.div>
                </div>
            </Card>
        </motion.form>
      </main>
    </div>
  );
}

export default WorkerUpdatePage;