import React, { createContext, useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
// --- FIXED ---
// Import 'api' (the default) and 'getMe' (the named export) from the correct .js file
import api, { getMe } from '../services/api.js'; 

// Create the context
const AuthContext = createContext(null);

// --- Export hook function ---
export const useAuth = () => {
  return useContext(AuthContext);
};
// --------------------------------------------

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // On app load, check token and fetch fresh user data
  useEffect(() => {
    const fetchUserOnLoad = async () => {
      const storedToken = localStorage.getItem('token');
      
      if (storedToken) {
        try {
          // 1. Set token for the api interceptor to use
          setToken(storedToken); 
          
          // --- THIS IS THE FIX ---
          // Call your new, safe "/api/auth/me" endpoint
          // using the function from api.js
          const response = await getMe();
          
          // 3. Set the FRESH user from the database
          setUser(response.data); 
          
        } catch (error) {
          // Token is invalid or expired
          console.error("Auth fetch failed, logging out", error);
          logout(); // Run the logout process
        }
      }
      setLoading(false); // Done checking
    };

    fetchUserOnLoad();
  }, []); // Runs once on app load

  // Login function
  const login = async (email, password) => {
    try {
      const response = await api.post('/auth/login', {
        email,
        password,
      });

      const { token, user } = response.data;
      
      setToken(token);
      setUser(user); // Set the user from the login response
      localStorage.setItem('token', token);
      
      // No longer need to store user in localStorage
      // We will fetch it fresh on every reload
      localStorage.removeItem('user'); 

      if (user.role === 'Admin') {
        navigate('/admin/dashboard');
      } else if (user.role === 'Worker') {
        navigate('/worker/dashboard');
      }
      return true;
    } catch (error) {
      console.error("Login failed:", error);
      return error.response?.data?.message || "Login failed. Please try again.";
    }
  };

  // Logout function
  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/');
  };

  const value = {
    user,
    token,
    login,
    logout,
    isLoggedIn: !!user,
    loading,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export default AuthContext;