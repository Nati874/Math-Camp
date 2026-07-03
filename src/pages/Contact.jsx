import React, { useEffect } from 'react';

export default function Contact() {
  // Scroll reveal observer
  useEffect(() => {
    const timer = setTimeout(() => {
      const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('reveal-visible');
          }
        });
      }, { threshold: 0.1 });

      const elements = document.querySelectorAll('#contact .reveal-hidden');
      elements.forEach(el => observer.observe(el));

      return () => {
        elements.forEach(el => observer.unobserve(el));
      };
    }, 150);

    return () => clearTimeout(timer);
  }, []);
  return (
    <div className="tab-content" id="contact" style={{ display: 'block' }}>
      <div id="sideTitle">
        <h2>Contact Us</h2>
        <hr className="section-divider" />
      </div>
      <div id="location">
        <h3>Located in the vibrant city of Bahir Dar, BDU Math Camp offers an inspiring learning environment. Come visit our beautiful Peda Campus and take a tour.</h3>
        <div id="contact-sec">
          <div className="map-container">
            <a href="https://www.google.com/maps/place/Bahir+Dar+University+peda+campus/@11.5739911,37.3955686,16.75z/data=!4m6!3m5!1s0x1644d1eeba23f71f:0x58a47a4fd8182ecd!8m2!3d11.5743818!4d37.398015!16s%2Fm%2F0277v87?entry=ttu&g_ep=EgoyMDI0MDkyNC4wIKXMDSoASAFQAw%3D%3D" target="_blank" rel="noreferrer">
              <img src="/Web Images/map.jpg" alt="Peda Campus Map Location" id="map" />
            </a>
          </div>
          <div className="form-container">
            <form onSubmit={(e) => e.preventDefault()}>
              <div>
                <h4>Full Name</h4>
                <input type="text" className="messages" required />
              </div>
              <div>
                <h4>Email</h4>
                <input type="email" className="messages" required />
              </div>
              <div>
                <h4>Your Message</h4>
                <textarea required className="messages"></textarea>
              </div>
              <div className="submit-container">
                <input type="submit" value="Send Message" />
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
