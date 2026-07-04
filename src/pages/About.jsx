import React, { useEffect } from 'react';
import { 
  Target, 
  Compass, 
  MapPin, 
  GraduationCap, 
  School, 
  DollarSign, 
  Users, 
  Award, 
  Sparkles, 
  ArrowRight 
} from 'lucide-react';

export default function About() {
  // Intersection Observer for scroll animations
  useEffect(() => {
    const timer = setTimeout(() => {
      const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('reveal-visible');
            observer.unobserve(entry.target);
          }
        });
      }, { threshold: 0.1 });

      const elements = document.querySelectorAll('.about-reveal');
      elements.forEach(el => observer.observe(el));

      return () => observer.disconnect();
    }, 100);

    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="tab-content" id="about-page">
      {/* Page Header */}
      <div id="sideTitle">
        <h2>About BDU Math Camp</h2>
        <hr className="section-divider" />
      </div>

      {/* Intro section */}
      <div className="about-hero about-reveal reveal-hidden-about">
        <div className="about-hero-img">
          <img src="/Web Images/math camp pics/2023/photo2.jpg" alt="Peda Campus STEM Center" />
        </div>
        <div className="about-hero-text">
          <p>
            The Bahir Dar University Mathematics Summer Camp is a highly selective outreach initiative designed to cultivate logical reasoning, mathematical enthusiasm, and algorithmic thinking among Ethiopia's top-tier high school students.
          </p>
          <p>
            Established as a residential scholarship program, BDU Math Camp gathers the brightest minds to live, study, and research cooperatively at the university's historic Peda Campus.
          </p>
        </div>
      </div>

      {/* Mission & Vision Section */}
      <div className="about-split-grid">
        {/* Mission Card */}
        <div className="about-card about-reveal reveal-hidden-about">
          <div className="about-card-header">
            <Target className="icon-glow" size={32} />
            <h3>Our Mission</h3>
          </div>
          <p>
            To inspire and challenge high-achieving students by introducing them to rigorous university-level abstract algebra, number theory, and programming paradigms. We strive to build analytical problem solvers who will lead tomorrow's scientific and digital transformations in Ethiopia.
          </p>
        </div>

        {/* Vision Card */}
        <div className="about-card about-reveal reveal-hidden-about">
          <div className="about-card-header">
            <Compass className="icon-glow" size={32} />
            <h3>Our Vision</h3>
          </div>
          <p>
            To serve as a national incubator for scientific talent and research cooperation, bridging the gap between high school curiosity, academic depth, and next-generation mathematical modeling and engineering solutions.
          </p>
        </div>
      </div>

      {/* Impact Statistics */}
      <div className="about-reveal reveal-hidden-about">
        <h3 className="about-section-heading">Outreach Impact</h3>
        <div className="about-stats-grid">
          <div className="stat-card">
            <h4>500+</h4>
            <p>Camp Alumnae</p>
          </div>
          <div className="stat-card">
            <h4>100%</h4>
            <p>Boarding Scholarships</p>
          </div>
          <div className="stat-card">
            <h4>20+</h4>
            <p>Ethiopian Zones Reached</p>
          </div>
          <div className="stat-card">
            <h4>15+</h4>
            <p>Years of STEM Outreach</p>
          </div>
        </div>
      </div>

      {/* Fast Facts Checklist */}
      <div className="about-reveal reveal-hidden-about">
        <h3 className="about-section-heading">Quick Facts</h3>
        <ul id="info" className="about-info-list">
          <li className="about-reveal reveal-hidden-about">
            <MapPin size={22} /> 
            <div>
              <strong>Location:</strong>
              <p>Bahir Dar University, Peda Campus STEM Center.</p>
            </div>
          </li>
          <li className="about-reveal reveal-hidden-about">
            <GraduationCap size={22} /> 
            <div>
              <strong>Target Group:</strong>
              <p>Ethiopian high school students with exceptional mathematics and physics rankings.</p>
            </div>
          </li>
          <li className="about-reveal reveal-hidden-about">
            <School size={22} /> 
            <div>
              <strong>Duration:</strong>
              <p>Four intensive weeks of residential courses, workshops, and cooperative research projects.</p>
            </div>
          </li>
          <li className="about-reveal reveal-hidden-about">
            <DollarSign size={22} /> 
            <div>
              <strong>Scholarship Program:</strong>
              <p>All accepted campers receive a full boarding scholarship covering accommodation, meals, and books.</p>
            </div>
          </li>
          <li className="about-reveal reveal-hidden-about">
            <Users size={22} /> 
            <div>
              <strong>Core Features:</strong>
              <p>Abstract algebra, competitive algorithms, astronomical observation, and mentor seminars.</p>
            </div>
          </li>
        </ul>
      </div>

      {/* Helpful Links */}
      <div className="about-reveal reveal-hidden-about" style={{ marginBottom: '40px' }}>
        <h3 className="about-section-heading">Helpful Links</h3>
        <ul id="external-links" className="about-links-list">
          <li>
            <a href="https://bdu.edu.et/" target="_blank" rel="noreferrer">
              Bahir Dar University Portal <ArrowRight size={14} />
            </a>
          </li>
          <li>
            <a href="https://bdu.edu.et/content/stem-center" target="_blank" rel="noreferrer">
              BDU STEM Outreach Programs <ArrowRight size={14} />
            </a>
          </li>
        </ul>
      </div>
    </div>
  );
}
