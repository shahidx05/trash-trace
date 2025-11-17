import { useContext } from 'react';
// --- FIXED --- Re-adding .jsx
import AuthContext from '../context/AuthContext.jsx'; 

/*
  This is a custom hook.
  It is the standard way to access the AuthContext values in any component.
*/
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};