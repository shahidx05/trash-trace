import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';

// --- Imports FIXED ---
import { createWorker } from '../../services/api.js'; // .js extension
import { FaSpinner, FaUserPlus } from 'react-icons/fa6'; // Using fa6
import Button from '../../components/common/Button.jsx'; // <-- IMPORTED

function AdminCreateWorker() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [city, setCity] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name || !email || !password || !city) {
      return toast.error("All fields are required.");
    }

    setLoading(true);
    const loadingToast = toast.loading("Creating worker...");

    try {
      const workerData = { name, email, password, city };
      // /api/admin/create-worker call karein
      await createWorker(workerData);
      
      toast.dismiss(loadingToast);
      toast.success("Worker created successfully!");
      navigate('/admin/workers'); // Worker list par redirect karein

    } catch (error) {
      setLoading(false);
      toast.dismiss(loadingToast);
      console.error("Create worker error:", error);
      // The backend may return the specific error message
      toast.error(error.response?.data?.message || "Failed to create worker.");
    }
  };

  return (
    <motion.div 
      // We could replace this with <Card> later, but keeping as is for now
      className="bg-white p-6 rounded-lg shadow-lg"
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Create New Worker</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700">Full Name</label>
          <input
            id="name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-4 py-3 mt-1 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-green-600"
            required
          />
        </div>
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email Address</label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-4 py-3 mt-1 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-green-600"
            required
          />
        </div>
        <div>
          <label htmlFor="password" className="block text-sm font-medium text-gray-700">Password</label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-4 py-3 mt-1 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-green-600"
            required
          />
        </div>
        <div>
          <label htmlFor="city" className="block text-sm font-medium text-gray-700">Assigned City</label>
          <input
            id="city"
            type="text"
            value={city}
            onChange={(e) => setCity(e.target.value)}
            className="w-full px-4 py-3 mt-1 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-green-600"
            required
          />
        </div>
        <div>
          {/* Submit Button - REFACTORED */}
          <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
            <Button
              type="submit"
              disabled={loading}
              variant="primary"
              size="lg"
              className="w-full flex justify-center items-center shadow-lg"
            >
              {loading ? (
                <FaSpinner className="animate-spin mr-2" />
              ) : (
                <FaUserPlus className="mr-2" />
              )}
              {loading ? 'Creating...' : 'Create Worker Account'}
            </Button>
          </motion.div>
        </div>
      </form>
    </motion.div>
  );
}

export default AdminCreateWorker;