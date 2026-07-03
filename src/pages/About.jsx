import React, { useEffect } from 'react';
import { MapPin, GraduationCap, School, DollarSign, Users } from 'lucide-react';

export default function About() {
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

      const elements = document.querySelectorAll('#about .reveal-hidden');
      elements.forEach(el => observer.observe(el));

      return () => {
        elements.forEach(el => observer.unobserve(el));
      };
    }, 150);

    return () => clearTimeout(timer);
  }, []);
  return (
    <div className="tab-content" id="about" style={{ display: 'block' }}>
      <div id="sideTitle">
        <h2>About Math Camp</h2>
        <hr className="section-divider" />
      </div>
      <div id="span1" className="reveal-hidden">
        <img src="/Web Images/math camp pics/2023/photo2.jpg" alt="Peda Campus Classroom" />
        <p>
          The Bahir Dar University Math Camp is an outreach initiative created by the BDU Science College. 
          The camp gathers top performing high school students from across regional districts to introduce them to advanced mathematics, analytical reasoning, and algorithms that aren't typically covered in regular school syllabi.
        </p>
      </div>
      <ul id="info">
        <li className="reveal-hidden"><MapPin size={20} /> <strong>Location:</strong> Bahir Dar University, Peda Campus STEM Center.</li>
        <li className="reveal-hidden"><GraduationCap size={20} /> <strong>Target Audience:</strong> High school students with outstanding academic records.</li>
        <li className="reveal-hidden"><School size={20} /> <strong>Duration:</strong> Four intensive weeks during the summer break.</li>
        <li className="reveal-hidden"><DollarSign size={20} /> <strong>Cost:</strong> Free of charge for accepted scholarship participants (includes boarding).</li>
        <li className="reveal-hidden"><Users size={20} /> <strong>Key Features:</strong> Peer mentoring, computer science workshops, guest science lectures.</li>
      </ul>

      <h3 className="about-links-title">Helpful Links</h3>
      <ul id="external-links">
        <li className="reveal-hidden"><a href="https://bdu.edu.et/" target="_blank" rel="noreferrer">Bahir Dar University Official Portal</a></li>
        <li className="reveal-hidden"><a href="https://bdu.edu.et/content/stem-center" target="_blank" rel="noreferrer">BDU STEM Outreach Programs</a></li>
      </ul>
    </div>
  );
}
