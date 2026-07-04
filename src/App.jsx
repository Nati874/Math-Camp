import React, { useState, useEffect } from 'react';
import { ArrowRight } from 'lucide-react';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import InfoModal from './components/InfoModal';
import Home from './pages/Home';
import Team from './pages/Team';
import Gallery from './pages/Gallery';
import Sessions from './pages/Sessions';
import About from './pages/About';
import Contact from './pages/Contact';

// New Portal Imports
import Register from './pages/Register';
import ReferrerPortal from './pages/ReferrerPortal';
import AdminPortal from './pages/AdminPortal';
import History from './pages/History';

export default function App() {
  const [screen, setScreen] = useState('welcome'); // 'welcome' or 'app'
  const [currentPage, setCurrentPage] = useState('home'); // 'home', 'team', 'gallery', 'sessions', 'about', 'contact'
  const [currentPath, setCurrentPath] = useState(window.location.pathname);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isNavOpen, setIsNavOpen] = useState(false);
  const [modalType, setModalType] = useState(null); // 'support', 'invest' or null

  // React to browser navigation and popstate updates
  useEffect(() => {
    const handlePopState = () => {
      setCurrentPath(window.location.pathname);
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Update navbar scrolled background state
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 50) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const isCustomRoute = ['/register', '/referrer-portal', '/admin-portal', '/history', '/about'].includes(currentPath);

  // RENDER 1: Custom Portal Routes
  if (isCustomRoute) {
    return (
      <div id="body">
        <Navbar 
          currentPage={currentPath === '/history' ? 'history' : (currentPath === '/about' ? 'about' : currentPath.substring(1))} 
          setCurrentPage={setCurrentPage}
          isScrolled={isScrolled}
          isNavOpen={isNavOpen}
          setIsNavOpen={setIsNavOpen}
          setModalType={setModalType}
        />

        <main style={{ minHeight: 'calc(100vh - 150px)', background: 'var(--bg-primary)', color: 'var(--text-primary)' }}>
          {currentPath === '/register' && <Register />}
          {currentPath === '/referrer-portal' && <ReferrerPortal />}
          {currentPath === '/admin-portal' && <AdminPortal />}
          {currentPath === '/history' && <History />}
          {currentPath === '/about' && <About />}
        </main>

        <Footer 
          setCurrentPage={setCurrentPage}
          setModalType={setModalType}
        />

        <InfoModal 
          modalType={modalType}
          setModalType={setModalType}
        />
      </div>
    );
  }

  // RENDER 2: Landing Welcome Page
  if (screen === 'welcome') {
    return (
      <div className="welcome-screen-wrapper">
        <div id="topper">
          <img src="/Web Images/math camp pics/bdu-logo.png" alt="BDU Logo" />
          <h2>Bahir Dar University</h2>
        </div>
        <div id="central">
          <h2>Mathematics is the language of nature</h2>
          <div className="welcome-divider"></div>
          <h1>BDU Math Camp</h1>
          <button onClick={() => { setScreen('app'); setCurrentPage('home'); }}>
            Explore Camp <ArrowRight size={18} />
          </button>
        </div>
      </div>
    );
  }

  // RENDER 3: Standard Page Tabs
  return (
    <div id="body">
      <Navbar 
        currentPage={currentPage}
        setCurrentPage={setCurrentPage}
        isScrolled={isScrolled}
        isNavOpen={isNavOpen}
        setIsNavOpen={setIsNavOpen}
        setModalType={setModalType}
      />

      <main style={{ minHeight: 'calc(100vh - 72px)' }}>
        {currentPage === 'home' && <Home setCurrentPage={setCurrentPage} />}
        {currentPage === 'team' && <Team />}
        {currentPage === 'gallery' && <Gallery />}
        {currentPage === 'sessions' && <Sessions />}
        {currentPage === 'contact' && <Contact />}
      </main>

      <Footer 
        setCurrentPage={setCurrentPage}
        setModalType={setModalType}
      />

      <InfoModal 
        modalType={modalType}
        setModalType={setModalType}
      />
    </div>
  );
}
