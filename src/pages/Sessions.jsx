import React, { useEffect } from 'react';
import { Calculator, Compass, Brain, Layers, TrendingUp, BookOpen } from 'lucide-react';

export default function Sessions() {
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

      const elements = document.querySelectorAll('#camp-details .reveal-hidden');
      elements.forEach(el => observer.observe(el));

      return () => {
        elements.forEach(el => observer.unobserve(el));
      };
    }, 150);

    return () => clearTimeout(timer);
  }, []);
  const programs = [
    { title: "Algebra", icon: <Calculator size={18} />, text: "Dive deep into algebraic concepts, patterns, and mathematical systems.", img: "/Web Images/pc-opened.jpg" },
    { title: "Geometry", icon: <Compass size={18} />, text: "Explore shapes, dimensions, theorems, and structural visual reasoning.", img: "/Web Images/math camp pics/2023/photo8.jpg" },
    { title: "Combinatorics & Logic", icon: <Brain size={18} />, text: "Engage with counting principles, permutations, and mathematical proofs.", img: "/Web Images/math camp pics/algorithm1.jpg" },
    { title: "Number Theory", icon: <Layers size={18} />, text: "Investigate prime numbers, modular arithmetic, and cryptography secrets.", img: "/Web Images/math camp pics/physics0.jpg" },
    { title: "CS & Coding Outreach", icon: <TrendingUp size={18} />, text: "Translate math equations into functional algorithms, Python programs, and games.", img: "/Web Images/math camp pics/2023/photo7.jpg" }
  ];

  return (
    <div className="tab-content" id="camp-details" style={{ display: 'block' }}>
      <div id="sideTitle">
        <h2>Our Curriculum</h2>
        <hr className="section-divider" />
      </div>
      <p style={{ maxWidth: '700px', margin: '0 auto 40px', color: 'var(--text-muted)' }}>
        Our camp offers a variety of programs designed to challenge and excite students of all skill levels. Participants will engage in hands-on activities, collaborative problem-solving, and individual projects.
      </p>
      <div id="camp-programs">
        {programs.map((prog, idx) => (
          <div key={idx} className="program reveal-hidden">
            <img src={prog.img} alt={prog.title} />
            <div>
              <h3>{prog.icon} {prog.title}</h3>
              <p>{prog.text}</p>
              <button className="peakbtn" onClick={() => window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' })}>
                <BookOpen size={14} /> Sneak Peak
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
