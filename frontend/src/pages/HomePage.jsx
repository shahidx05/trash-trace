import React from 'react';
import Navbar from '../components/layout/Navbar.jsx'; // --- FIXED: Added .jsx
import Footer from '../components/layout/Footer.jsx'; // --- FIXED: Added .jsx
import Hero from '../components/home/Hero.jsx'; // --- FIXED: Added .jsx
import ReportMap from '../components/map/ReportMap.jsx'; // --- FIXED: Added .jsx
import { useAuth } from '../hooks/useAuth.jsx'; // --- FIXED: Added .jsx

function HomePage() {
  const auth = useAuth(); // Auth context ka istemaal

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar /> {/* Navbar, auth state ke saath */}
      <main className="flex-grow">
        <Hero /> {/* Hero section (Search/Submit buttons) */}
        <ReportMap /> {/* Live Map */}
      </main>
      {/* Footer component yahan add kar sakte hain */}
      <Footer />

    </div>
  );
}

export default HomePage;