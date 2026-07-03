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

export default function App() {
  const [screen, setScreen] = useState('welcome'); // 'welcome' or 'app'
  const [currentPage, setCurrentPage] = useState('home'); // 'home', 'team', 'gallery', 'sessions', 'about', 'contact'
  const [isScrolled, setIsScrolled] = useState(false);
  const [isNavOpen, setIsNavOpen] = useState(false);
  const [modalType, setModalType] = useState(null); // 'support', 'invest' or null

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

  // Welcome Screen Render
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

  // App Layout Coordination
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
        {currentPage === 'about' && <About />}
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
