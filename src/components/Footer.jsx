import React from 'react';
import { 
  School, 
  Handshake, 
  Presentation, 
  DollarSign, 
  MessageSquare, 
  Users, 
  Award, 
  Facebook, 
  Send, 
  Youtube,
  Key,
  Shield
} from 'lucide-react';

export default function Footer({ setCurrentPage, setModalType }) {
  const navigateTab = (page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'instant' });
  };

  return (
    <footer>
      <div id="webPages">
        <ul>
          <li>
            <button 
              onClick={() => navigateTab('about')} 
              style={{ background: 'transparent', border: 'none', color: 'inherit', padding: '0', display: 'flex', width: '100%', justifyContent: 'space-between', cursor: 'pointer', fontFamily: 'inherit' }}
            >
              Camp History <School size={14} />
            </button>
          </li>
          <li>
            <button 
              onClick={() => setModalType('support')} 
              style={{ background: 'transparent', border: 'none', color: 'inherit', padding: '0', display: 'flex', width: '100%', justifyContent: 'space-between', cursor: 'pointer', fontFamily: 'inherit' }}
            >
              Sponsors <Handshake size={14} />
            </button>
          </li>
          <li>
            <button 
              onClick={() => navigateTab('sessions')} 
              style={{ background: 'transparent', border: 'none', color: 'inherit', padding: '0', display: 'flex', width: '100%', justifyContent: 'space-between', cursor: 'pointer', fontFamily: 'inherit' }}
            >
              Sessions <Presentation size={14} />
            </button>
          </li>
          <li>
            <button 
              onClick={() => setModalType('invest')} 
              style={{ background: 'transparent', border: 'none', color: 'inherit', padding: '0', display: 'flex', width: '100%', justifyContent: 'space-between', cursor: 'pointer', fontFamily: 'inherit' }}
            >
              Funding <DollarSign size={14} />
            </button>
          </li>
          <li>
            <button 
              onClick={() => navigateTab('home')} 
              style={{ background: 'transparent', border: 'none', color: 'inherit', padding: '0', display: 'flex', width: '100%', justifyContent: 'space-between', cursor: 'pointer', fontFamily: 'inherit' }}
            >
              Testimonials <MessageSquare size={14} />
            </button>
          </li>
          <li>
            <button 
              onClick={() => navigateTab('team')} 
              style={{ background: 'transparent', border: 'none', color: 'inherit', padding: '0', display: 'flex', width: '100%', justifyContent: 'space-between', cursor: 'pointer', fontFamily: 'inherit' }}
            >
              Faculty & Facilitators <Users size={14} />
            </button>
          </li>
          <li>
            <button 
              onClick={() => navigateTab('about')} 
              style={{ background: 'transparent', border: 'none', color: 'inherit', padding: '0', display: 'flex', width: '100%', justifyContent: 'space-between', cursor: 'pointer', fontFamily: 'inherit' }}
            >
              Awards <Award size={14} />
            </button>
          </li>
          <li>
            <button 
              onClick={() => window.location.href = '/referrer-portal'} 
              style={{ background: 'transparent', border: 'none', color: 'inherit', padding: '0', display: 'flex', width: '100%', justifyContent: 'space-between', cursor: 'pointer', fontFamily: 'inherit' }}
            >
              Referrer Portal <Key size={14} />
            </button>
          </li>
          <li>
            <button 
              onClick={() => window.location.href = '/admin-portal'} 
              style={{ background: 'transparent', border: 'none', color: 'inherit', padding: '0', display: 'flex', width: '100%', justifyContent: 'space-between', cursor: 'pointer', fontFamily: 'inherit' }}
            >
              Admin Portal <Shield size={14} />
            </button>
          </li>
        </ul>
      </div>
      <div id="no-web-pages">
        <p>
          BDU Math Camp is an intensive summer program for mathematically talented high school students, led by faculty and researchers from the Bahir Dar University Departments of Mathematics and Physics. Recognized for its excellence, the camp inspires young minds to explore advanced mathematics and its practical applications.
        </p>
        <p className="copyright-text">&copy; 2026 Bahir Dar University Math Camp. All rights reserved.</p>
        <p className="social-prompt" style={{ marginTop: '20px' }}>Follow Us</p>
        <div id="medias">
          <a href="https://www.facebook.com/" target="_blank" rel="noreferrer"><Facebook size={20} /></a>
          <a href="https://telegram.org/" target="_blank" rel="noreferrer"><Send size={20} /></a>
          <a href="https://www.tiktok.com/" target="_blank" rel="noreferrer"><TikTokSubstitute size={20} /></a>
          <a href="https://www.youtube.com/" target="_blank" rel="noreferrer"><Youtube size={20} /></a>
        </div>
        <p className="footer-contact">Contact: +251-953-256-171</p>
      </div>
    </footer>
  );
}

// Simple substitute SVG icon for TikTok
function TikTokSubstitute({ size = 20 }) {
  return (
    <svg 
      width={size} 
      height={size} 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round"
    >
      <path d="M9 18V5l12-2v13" />
      <circle cx="6" cy="18" r="3" />
      <circle cx="18" cy="16" r="3" />
    </svg>
  );
}
