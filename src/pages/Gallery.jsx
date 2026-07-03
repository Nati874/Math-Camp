import React, { useState, useEffect } from 'react';

export default function Gallery() {
  const [selectedYear, setSelectedYear] = useState(2023);
  const [images, setImages] = useState([]);
  const [checking, setChecking] = useState(false);

  // Generate selectable years from 2011 to 2025
  const years = Array.from({ length: 2025 - 2011 + 1 }, (_, i) => 2011 + i);

  // Scroll reveal observer for Gallery page content
  useEffect(() => {
    // Give elements a tiny frame to render before starting observer
    const timer = setTimeout(() => {
      const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('reveal-visible');
          }
        });
      }, { threshold: 0.1 });

      const elements = document.querySelectorAll('#gallery .reveal-hidden');
      elements.forEach(el => observer.observe(el));

      return () => {
        elements.forEach(el => observer.unobserve(el));
      };
    }, 150);

    return () => clearTimeout(timer);
  }, [images, checking, selectedYear]);

  // Asset presence prober
  useEffect(() => {
    let active = true;
    const probeImages = async () => {
      setChecking(true);
      setImages([]);
      
      const foundImages = [];
      const testUrl = encodeURI(`/Web Images/math camp pics/${selectedYear}/photo1.jpg`);
      
      try {
        let res = await fetch(testUrl, { method: 'HEAD' });
        
        if (!res.ok && (res.status === 405 || res.status === 404)) {
          res = await fetch(testUrl, { method: 'GET' });
        }
        
        // Read Content-Type header to distinguish image responses from SPA fallback index.html pages
        const contentType = res.headers.get('content-type') || '';
        
        if (res.ok && !contentType.includes('text/html')) {
          // File exists on server and is a real asset
          for (let i = 1; i <= 8; i++) {
            foundImages.push(encodeURI(`/Web Images/math camp pics/${selectedYear}/photo${i}.jpg`));
          }
        }
      } catch (err) {
        console.warn("Probe request failed for year " + selectedYear, err);
      }
      
      if (active) {
        setImages(foundImages);
        setChecking(false);
      }
    };

    probeImages();
    return () => {
      active = false;
    };
  }, [selectedYear]);

  return (
    <div className="tab-content" id="gallery" style={{ display: 'block' }}>
      <div id="sideTitle" className="reveal-hidden">
        <h2>Gallery</h2>
        <hr className="section-divider" />
      </div>

      {/* Selectable year buttons */}
      <div className="gallery-years-filter reveal-hidden">
        {years.map(year => (
          <button 
            key={year} 
            className={selectedYear === year ? 'active' : ''} 
            onClick={() => setSelectedYear(year)}
          >
            {year}
          </button>
        ))}
      </div>

      <div className="gallery-year">
        <h3 className="reveal-hidden">{selectedYear} Session Photos</h3>
        
        {checking ? (
          <div style={{ padding: '60px', color: 'var(--text-muted)' }}>Probing gallery files...</div>
        ) : images.length > 0 ? (
          <div className="gallery-grid">
            {images.map((src, idx) => (
              <img 
                key={idx} 
                src={src} 
                alt={`Math Camp ${selectedYear} Photo ${idx + 1}`} 
                className="reveal-hidden" 
              />
            ))}
          </div>
        ) : (
          <div className="no-pictures-view reveal-hidden">
            <p>No pictures available.</p>
          </div>
        )}
      </div>
    </div>
  );
}
