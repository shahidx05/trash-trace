import React, { useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';

// --- Imports FIXED ---
// FaSignInAlt (FA5) -> FaArrowRightToBracket (FA6)
import { FaRecycle, FaSpinner, FaArrowRightToBracket } from 'react-icons/fa6';

import { useAuth } from '../hooks/useAuth.jsx'; // .jsx extension
import Button from '../components/common/Button.jsx'; // <-- IMPORTED

function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const auth = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      return toast.error("Please enter email and password.");
    }
    
    setIsLoading(true);
    const result = await auth.login(email, password);
    setIsLoading(false);

    if (result === true) {
      // toast.success(`Welcome, ${auth.user?.name}!`); // Navigates already handles this
    } else {
      // Show the error message from the backend
      toast.error(result); 
    }
  };

  // If user is already logged in, redirect them away from the login page
  if (auth.isLoggedIn) {
    if (auth.user?.role === 'Admin') {
      return <Navigate to="/admin/dashboard" replace />;
    }
    if (auth.user?.role === 'Worker') {
      return <Navigate to="/worker/dashboard" replace />;
    }
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 p-4">
      <motion.div 
        // We could replace this with <Card> later, but keeping as is for now
        className="w-full max-w-md p-8 bg-white shadow-2xl rounded-2xl"
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {/* Header */}
        <div className="text-center mb-8">
          <Link to="/">
            {/* Using green-700 color directly as FaRecycle is not in Button component */}
            <FaRecycle className="h-16 w-16 text-green-700 mx-auto animate-pulse" />
          </Link>
          <h1 className="text-3xl font-bold text-gray-900 mt-4">Employee Login</h1>
          <p className="text-gray-600">Access your Admin or Worker panel.</p>
        </div>

        {/* Login Form */}
        <form onSubmit={handleSubmit}>
          <div className="space-y-6">
            {/* Email Input */}
            <div>
              <label 
                htmlFor="email" 
                className="block text-sm font-medium text-gray-700"
              >
                Email Address
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@gmail.com"
                className="w-full px-4 py-3 mt-1 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-green-600"
                required
              />
            </div>

            {/* Password Input */}
            <div>
              <label 
                htmlFor="password" 
                className="block text-sm font-medium text-gray-700"
              >
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
               className="w-full px-4 py-3 mt-1 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-green-600"
                required
              />
            </div>

            {/* Submit Button - REFACTORED */}
            <div>
              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                <Button
                  type="submit"
                  disabled={isLoading}
                  variant="primary" // Uses bg-green-700
                  size="lg" // Uses px-6 py-3 text-lg
                  // Added layout classes that are not handled by the Button component itself
                  className="w-full flex justify-center items-center shadow-lg"
                >
                  {isLoading ? (
                    <FaSpinner className="animate-spin mr-2" />
                  ) : (
                    <FaArrowRightToBracket className="mr-2" />
                  )}
                  {isLoading ? 'Signing In...' : 'Sign In'}
                </Button>
              </motion.div>
            </div>
          </div>
        </form>

        {/* Back to Home Link */}
        <div className="text-center mt-6">
          <Link 
            to="/" 
            className="text-sm font-medium text-green-700 hover:text-green-600"
          >
            ← Back to Home
          </Link>
        </div>
      </motion.div>
    </div>
  );
}

export default LoginPage;