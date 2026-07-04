import React, { useState, useEffect } from 'react';

export default function Team() {
  const [activeFilter, setActiveFilter] = useState('all');

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

      const elements = document.querySelectorAll('#team .reveal-hidden');
      elements.forEach(el => observer.observe(el));

      return () => {
        elements.forEach(el => observer.unobserve(el));
      };
    }, 150);

    return () => clearTimeout(timer);
  }, [activeFilter]);

  const teamMembers = [
    { name: "Dr. Getachew Mehabie", role: "Head of Mathematics Department", bio: "Dr. Getachew is the head of the Department of Mathematics at Bahir Dar University, leading academic and outreach initiatives.", img: "/Web Images/default-avatar.svg", category: "math" },
    { name: "Dr. Seyoum Getahun", role: "Math Camp Coordinator", bio: "Associate Professor of Mathematics with a passion for cultivating young logical minds and advanced problem solving.", img: "/Web Images/default-avatar.svg", category: "math" },
    { name: "Solomon Haile", role: "Lead Physics Instructor", bio: "Senior lecturer in thermodynamics and astrophysics, bringing experimental physics projects to camp sessions.", img: "/Web Images/default-avatar.svg", category: "physics" },
    { name: "Abebe Kebede", role: "Senior Student Facilitator", bio: "Math Camp alumnus and current BDU computer science major, returning to mentor the next generation of campers.", img: "/Web Images/default-avatar.svg", category: "facilitators" },
    { name: "Selamawit Tadesse", role: "Facilitator & Tutor", bio: "Graduate assistant specializing in abstract algebra, providing personalized study guides for camp participants.", img: "/Web Images/default-avatar.svg", category: "facilitators" },
    { name: "Prof. Rebecca Davis", role: "International Advisor", bio: "Distinguished researcher in algebraic geometry, visiting lecturer from the International Science Program.", img: "/Web Images/default-avatar.svg", category: "mentors" },
  ];

  const filteredTeam = activeFilter === 'all' 
    ? teamMembers 
    : teamMembers.filter(m => m.category === activeFilter);

  return (
    <div className="tab-content" id="team" style={{ display: 'block' }}>
      <div id="sideTitle">
        <h2>Meet Our Team</h2>
        <hr className="section-divider" />
      </div>
      <div className="members-option">
        <button className={activeFilter === 'all' ? 'active' : ''} onClick={() => setActiveFilter('all')}>All Staff</button>
        <button className={activeFilter === 'math' ? 'active' : ''} onClick={() => setActiveFilter('math')}>Mathematics Staff</button>
        <button className={activeFilter === 'physics' ? 'active' : ''} onClick={() => setActiveFilter('physics')}>Physics Staff</button>
        <button className={activeFilter === 'facilitators' ? 'active' : ''} onClick={() => setActiveFilter('facilitators')}>Facilitators</button>
        <button className={activeFilter === 'mentors' ? 'active' : ''} onClick={() => setActiveFilter('mentors')}>International Mentors</button>
      </div>
      <div className="members">
        {filteredTeam.map((mem, idx) => (
          <div key={idx} className="member reveal-hidden">
            <img src={mem.img} alt={mem.name} />
            <h3>{mem.name}</h3>
            <p className="role">{mem.role}</p>
            <p className="bio">{mem.bio}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
