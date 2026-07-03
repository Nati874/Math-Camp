import React from 'react';
import { 
  Home as HomeIcon, 
  Users, 
  GraduationCap, 
  Presentation, 
  Menu, 
  X, 
  School, 
  Handshake, 
  Phone, 
  DollarSign 
} from 'lucide-react';

export default function Navbar({ 
  currentPage, 
  setCurrentPage, 
  isScrolled, 
  isNavOpen, 
  setIsNavOpen, 
  setModalType 
}) {
  const showStickySolid = currentPage !== 'home' || isScrolled;

  const navigateTab = (page) => {
    if (window.location.pathname !== '/') {
      window.history.pushState({}, '', '/');
      window.dispatchEvent(new Event('popstate'));
    }
    setCurrentPage(page);
    setIsNavOpen(false);
    window.scrollTo({ top: 0, behavior: 'instant' });
  };

  return (
    <div id="main-nav-wrapper" className={showStickySolid ? 'scrolled' : ''}>
      <ul id="navBar">
        <li className="mobile-visible">
          <button 
            onClick={() => navigateTab('home')} 
            className={currentPage === 'home' ? 'tab-link active' : 'tab-link'}
          >
            <HomeIcon size={16} />Home
          </button>
        </li>
        <li>
          <button 
            onClick={() => navigateTab('team')} 
            className={currentPage === 'team' ? 'tab-link active' : 'tab-link'}
          >
            <Users size={16} />Our Team
          </button>
        </li>
        <li>
          <button 
            onClick={() => navigateTab('gallery')} 
            className={currentPage === 'gallery' ? 'tab-link active' : 'tab-link'}
          >
            <GraduationCap size={16} />Our Students
          </button>
        </li>
        <li>
          <button 
            onClick={() => navigateTab('sessions')} 
            className={currentPage === 'sessions' ? 'tab-link active' : 'tab-link'}
          >
            <Presentation size={16} />Sessions
          </button>
        </li>
        <li className="mobile-visible">
          {!isNavOpen ? (
            <button id="more" onClick={() => setIsNavOpen(true)}>
              <Menu size={16} />More
            </button>
          ) : (
            <button id="less" onClick={() => setIsNavOpen(false)}>
              <X size={16} />Less
            </button>
          )}
        </li>
      </ul>

      {/* Dropdown Navigation Panel */}
      <div id="hid-nav-container" className={isNavOpen ? 'open' : ''}>
        {/* Desktop view dropdown options */}
        <ul id="hid-navBar">
          <li>
            <button 
              className={currentPage === 'about' ? 'tab-link2 active' : 'tab-link2'}
              onClick={() => navigateTab('about')}
            >
              <School size={16} />More on Math Camp
            </button>
          </li>
          <li>
            <button className="tab-link2" onClick={() => { setModalType('support'); setIsNavOpen(false); }}>
              <Handshake size={16} />Support
            </button>
          </li>
          <li>
            <button 
              className={currentPage === 'contact' ? 'tab-link2 active' : 'tab-link2'}
              onClick={() => navigateTab('contact')}
            >
              <Phone size={16} />Contact
            </button>
          </li>
          <li>
            <button className="tab-link2" onClick={() => { setModalType('invest'); setIsNavOpen(false); }}>
              <DollarSign size={16} />Invest With Us
            </button>
          </li>
        </ul>

        {/* Mobile view dropdown options */}
        <ul id="extended-nav-bar">
          <li>
            <button onClick={() => navigateTab('team')} className={currentPage === 'team' ? 'active' : ''}>
              <Users size={16} />Our Team
            </button>
          </li>
          <li>
            <button onClick={() => navigateTab('gallery')} className={currentPage === 'gallery' ? 'active' : ''}>
              <GraduationCap size={16} />Our Students
            </button>
          </li>
          <li>
            <button onClick={() => navigateTab('sessions')} className={currentPage === 'sessions' ? 'active' : ''}>
              <Presentation size={16} />Sessions
            </button>
          </li>
          <li>
            <button onClick={() => navigateTab('about')} className={currentPage === 'about' ? 'active' : ''}>
              <School size={16} />More on Math Camp
            </button>
          </li>
          <li>
            <button onClick={() => { setModalType('support'); setIsNavOpen(false); }}>
              <Handshake size={16} />Support
            </button>
          </li>
          <li>
            <button onClick={() => navigateTab('contact')} className={currentPage === 'contact' ? 'active' : ''}>
              <Phone size={16} />Contact
            </button>
          </li>
          <li>
            <button onClick={() => { setModalType('invest'); setIsNavOpen(false); }}>
              <DollarSign size={16} />Invest With Us
            </button>
          </li>
        </ul>
      </div>
    </div>
  );
}
