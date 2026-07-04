import React, { useState, useEffect, useRef } from 'react';
import { 
  Calculator, 
  BookOpen, 
  Users, 
  ChevronRight, 
  ChevronLeft, 
  ChevronDown,
  ArrowRight 
} from 'lucide-react';

export default function Home({ setCurrentPage }) {
  const [typedText, setTypedText] = useState('');
  const [currentSlide, setCurrentSlide] = useState(0);
  const [useTransition, setUseTransition] = useState(true);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [cardsPerPage, setCardsPerPage] = useState(3);
  const sliderRef = useRef(null);
  const canvasRef = useRef(null);

  // Hero canvas particle network animation
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    
    let animationFrameId;
    let particles = [];
    const particleCount = window.innerWidth < 768 ? 42 : 90;
    const connectionDistance = 110;
    const mouseConnectionDistance = 160;
    
    let mouse = { x: null, y: null, radius: 165 };

    const resizeCanvas = () => {
      const rect = canvas.parentElement.getBoundingClientRect();
      canvas.width = rect.width;
      canvas.height = rect.height;
    };
    
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    class Particle {
      constructor() {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.vx = (Math.random() - 0.5) * 0.8;
        this.vy = (Math.random() - 0.5) * 0.8;
        this.radius = Math.random() * 2 + 1.2;
      }
      
      update() {
        this.x += this.vx;
        this.y += this.vy;

        if (this.x < 0) {
          this.x = 0;
          this.vx *= -1;
        } else if (this.x > canvas.width) {
          this.x = canvas.width;
          this.vx *= -1;
        }

        if (this.y < 0) {
          this.y = 0;
          this.vy *= -1;
        } else if (this.y > canvas.height) {
          this.y = canvas.height;
          this.vy *= -1;
        }

        // Gentle physical push away when mouse is near
        if (mouse.x !== null && mouse.y !== null) {
          const dx = this.x - mouse.x;
          const dy = this.y - mouse.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < mouse.radius) {
            const force = (mouse.radius - dist) / mouse.radius;
            this.x += (dx / dist) * force * 1.5;
            this.y += (dy / dist) * force * 1.5;
          }
        }
      }

      draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(255, 255, 255, 0.45)';
        ctx.fill();
      }
    }

    for (let i = 0; i < particleCount; i++) {
      particles.push(new Particle());
    }

    const handleMouseMove = (e) => {
      const rect = canvas.getBoundingClientRect();
      mouse.x = e.clientX - rect.left;
      mouse.y = e.clientY - rect.top;
    };

    const handleMouseLeave = () => {
      mouse.x = null;
      mouse.y = null;
    };

    const parent = canvas.parentElement;
    parent.addEventListener('mousemove', handleMouseMove);
    parent.addEventListener('mouseleave', handleMouseLeave);

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      for (let i = 0; i < particles.length; i++) {
        const p1 = particles[i];
        p1.update();
        p1.draw();

        for (let j = i + 1; j < particles.length; j++) {
          const p2 = particles[j];
          const dx = p1.x - p2.x;
          const dy = p1.y - p2.y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < connectionDistance) {
            const alpha = ((connectionDistance - dist) / connectionDistance) * 0.18;
            ctx.beginPath();
            ctx.moveTo(p1.x, p1.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.strokeStyle = `rgba(255, 255, 255, ${alpha})`;
            ctx.lineWidth = 0.7;
            ctx.stroke();
          }
        }

        if (mouse.x !== null && mouse.y !== null) {
          const dx = p1.x - mouse.x;
          const dy = p1.y - mouse.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < mouseConnectionDistance) {
            const alpha = ((mouseConnectionDistance - dist) / mouseConnectionDistance) * 0.3;
            ctx.beginPath();
            ctx.moveTo(p1.x, p1.y);
            ctx.lineTo(mouse.x, mouse.y);
            ctx.strokeStyle = `rgba(255, 255, 255, ${alpha})`;
            ctx.lineWidth = 0.9;
            ctx.stroke();
          }
        }
      }

      animationFrameId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', resizeCanvas);
      parent.removeEventListener('mousemove', handleMouseMove);
      parent.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, []);


  // Monitor screen dimensions for responsive slider count
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth <= 768) {
        setCardsPerPage(1);
      } else if (window.innerWidth <= 1024) {
        setCardsPerPage(2);
      } else {
        setCardsPerPage(3);
      }
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Scroll reveal observer — queries entire document so preview sections are included
  useEffect(() => {
    const timer = setTimeout(() => {
      const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('reveal-visible');
            observer.unobserve(entry.target); // stop watching once revealed
          }
        });
      }, { threshold: 0.08 });

      // Select all hidden elements inside the home page (not scoped to #home
      // so that preview sections at the bottom are also observed)
      const elements = document.querySelectorAll('.reveal-hidden:not(.reveal-visible)');
      elements.forEach(el => observer.observe(el));

      return () => observer.disconnect();
    }, 100);

    return () => clearTimeout(timer);
  }, [cardsPerPage]); // re-run if slider count changes (new elements rendered)

  // Typewriter effect
  useEffect(() => {
    const words = ["Knowledge", "Inspiration", "Future"];
    let wordIndex = 0;
    let charIndex = 0;
    let isDeleting = false;
    let timer;

    const type = () => {
      const currentWord = words[wordIndex];
      if (isDeleting) {
        setTypedText(currentWord.substring(0, charIndex - 1));
        charIndex--;
      } else {
        setTypedText(currentWord.substring(0, charIndex + 1));
        charIndex++;
      }

      let speed = isDeleting ? 80 : 120;

      if (!isDeleting && charIndex === currentWord.length) {
        speed = 1500;
        isDeleting = true;
      } else if (isDeleting && charIndex === 0) {
        isDeleting = false;
        wordIndex = (wordIndex + 1) % words.length;
        speed = 500;
      }

      timer = setTimeout(type, speed);
    };

    timer = setTimeout(type, 500);
    return () => clearTimeout(timer);
  }, []);

  // Auto-scrolling carousel timer
  useEffect(() => {
    const interval = setInterval(() => {
      if (!isTransitioning) {
        setUseTransition(true);
        setIsTransitioning(true);
        setCurrentSlide(prev => prev + 1);
      }
    }, 3000);
    return () => clearInterval(interval);
  }, [isTransitioning]);

  // Card slider items data
  const originalCards = [
    { id: '1', img: '/Web Images/math camp pics/2023/photo6.jpg', text: 'Mathematics is a language for everyone. Discover the diverse group of students who have joined our camp and gone on to excel globally.', title: 'Math Camp Student Group' },
    { id: '2', img: '/Web Images/math camp pics/2023/photo8.jpg', text: 'Explore our global alumni network. Many of our past participants have gone on to attend top-tier international universities like Harvard, MIT, and more.', title: 'Students in Classroom' },
    { id: '3', img: '/Web Images/math camp pics/facilitator2.jpg', text: 'We believe that students are the leaders of tomorrow. Meet the outstanding student facilitators who return each year to mentor and guide new cohorts.', title: 'Student Facilitator Profile' },
    { id: '4', img: '/Web Images/students learning.jpg', text: 'Collaborative learning environment. Our students engage in interactive workshops and group projects that build coordination alongside mathematics.', title: 'Collaborative Study' },
    { id: '5', img: '/Web Images/elegant class.jpg', text: 'Empowering female leadership in STEM. We are proud of our initiatives that support and encourage young women to pursue advanced studies and lead in sciences.', title: 'STEM Workshops' },
  ];

  const totalCount = originalCards.length;
  const sliderCards = [
    originalCards[totalCount - 3],
    originalCards[totalCount - 2],
    originalCards[totalCount - 1],
    ...originalCards,
    originalCards[0],
    originalCards[1],
    originalCards[2]
  ];

  const handleSlideNext = () => {
    if (isTransitioning) return;
    setUseTransition(true);
    setIsTransitioning(true);
    setCurrentSlide(prev => prev + 1);
  };

  const handleSlidePrev = () => {
    if (isTransitioning) return;
    setUseTransition(true);
    setIsTransitioning(true);
    setCurrentSlide(prev => prev - 1);
  };

  const handleTransitionEnd = () => {
    setIsTransitioning(false);
    if (currentSlide >= totalCount) {
      setUseTransition(false);
      setCurrentSlide(0);
    } else if (currentSlide < 0) {
      setUseTransition(false);
      setCurrentSlide(totalCount - 1);
    }
  };

  const navigateTab = (page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'instant' });
  };

  return (
    <>
      <div id="header" style={{ position: 'relative' }}>
        <div className="hero-bg-overlay" />
        <canvas ref={canvasRef} className="hero-particles" style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none', zIndex: 2 }} />
        <div className="hero-overlay" style={{ position: 'relative', zIndex: 3 }}>
          <h3 className="welcome-label">Welcome</h3>
          <div className="welcome-divider-home"></div>
          <h1 className="hero-title">Bahir Dar University Math Camp</h1>
          <p className="hero-subtitle">
            Nurturing: <span id="typed-text">{typedText}</span><span className="cursor">|</span>
          </p>
        </div>
        <div className="scroll-down-indicator">
          <span>Scroll Down</span>
          <ChevronDown size={16} className="bouncing" />
        </div>
      </div>

      <div className="tab-content" id="home">
        <div id="sideTitle">
          <h2>Overview</h2>
          <hr className="section-divider" />
        </div>

        <div id="span1" className="reveal-hidden">
          <img src="/Web Images/math camp pics/2023/photo5.jpg" alt="Mentorship Session" />
          <p>
            BDU Math Camp provides a creative, intensive, and supportive mathematical environment for top-tier high school students across Ethiopia. 
            Our mission is to foster logical reasoning, problem-solving abilities, and mathematical enthusiasm through cooperative research-level exploration.
          </p>
        </div>

        <div className="highlights">
          <div className="highlight reveal-hidden">
            <Calculator size={32} />
            <h3>Advanced Algebra & Logic</h3>
            <hr />
            <p>Delve deep into abstract structures, matrices, and algebraic formulas that form the foundation of computer models.</p>
            <button onClick={() => navigateTab('sessions')}>
              See Curriculum <ChevronRight size={14} />
            </button>
          </div>
          <div className="highlight reveal-hidden">
            <BookOpen size={32} />
            <h3>STEM & Programming</h3>
            <hr />
            <p>Bridge pure science ideas with digital programs by writing algorithms, Python scripts, and numerical iterations.</p>
            <button onClick={() => navigateTab('sessions')}>
              See Curriculum <ChevronRight size={14} />
            </button>
          </div>
          <div className="highlight reveal-hidden">
            <Users size={32} />
            <h3>Outreach Mentoring</h3>
            <hr />
            <p>Learn alongside highly distinguished instructors, local BDU staff, and returning international alumni facilitators.</p>
            <button onClick={() => navigateTab('team')}>
              Meet Instructors <ChevronRight size={14} />
            </button>
          </div>
        </div>

        <div className="testimony1 reveal-hidden">
          <p>
            "Participating in the BDU Math Camp redefined how I view the world. It showed me that mathematics is not just about solving equations, but a canvas for creativity, analytical depth, and critical reasoning."
          </p>
          <hr className="testimony-divider" />
          <h3><i>Math Camp Alumnus & Facilitator</i></h3>
        </div>

        <div id="studentHeading">
          <h2>Empowering Our Students</h2>
        </div>

        {/* Infinite Loop Slider */}
        <div className="slider-wrapper">
          <button className="slider-btn prev-btn" onClick={handleSlidePrev} aria-label="Previous Slide">
            <ChevronLeft size={16} />
          </button>
          <div className="slider-container">
            <div 
              id="studentsContainer" 
              ref={sliderRef}
              onTransitionEnd={handleTransitionEnd}
              style={{
                transform: `translateX(-${(currentSlide + 3) * (100 / cardsPerPage)}%)`,
                transition: useTransition ? 'transform 0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94)' : 'none'
              }}
            >
              {sliderCards.map((card, idx) => (
                <div key={`${card.id}-${idx}`} className="students reveal-hidden">
                  <img src={card.img} alt={card.title} />
                  <p>{card.text}</p>
                  <button onClick={() => navigateTab('gallery')}>
                    See more <ArrowRight size={14} />
                  </button>
                </div>
              ))}
            </div>
          </div>
          <button className="slider-btn next-btn" onClick={handleSlideNext} aria-label="Next Slide">
            <ChevronRight size={16} />
          </button>
        </div>

        {/* ── GALLERY SNEAK PEEK ── */}
        <div className="preview-section reveal-hidden">
          <div className="preview-section-header">
            <h2>Gallery</h2>
            <button onClick={() => navigateTab('gallery')}>
              View all photos <ArrowRight size={14} />
            </button>
          </div>
          <div className="gallery-preview-grid">
            <img src="/Web Images/math camp pics/2023/photo1.jpg" alt="Camp memory 1" onClick={() => navigateTab('gallery')} />
            <img src="/Web Images/math camp pics/2023/photo3.jpg" alt="Camp memory 2" onClick={() => navigateTab('gallery')} />
            <img src="/Web Images/math camp pics/2023/photo5.jpg" alt="Camp memory 3" onClick={() => navigateTab('gallery')} />
            <img src="/Web Images/math camp pics/2023/photo7.jpg" alt="Camp memory 4" onClick={() => navigateTab('gallery')} />
            <img src="/Web Images/math camp pics/2023/photo8.jpg" alt="Camp memory 5" onClick={() => navigateTab('gallery')} />
          </div>
        </div>

        {/* ── TEAM SNEAK PEEK ── */}
        <div className="preview-section reveal-hidden">
          <div className="preview-section-header">
            <h2>Meet Our Team</h2>
            <button onClick={() => navigateTab('team')}>
              View full team <ArrowRight size={14} />
            </button>
          </div>
          <div className="team-preview-strip">
            {[
              { name: "Dr. Getachew Mehabie", role: "Head of Mathematics", img: "/Web Images/default-avatar.svg" },
              { name: "Solomon Haile", role: "Lead Physics Instructor", img: "/Web Images/default-avatar.svg" },
              { name: "Abebe Kebede", role: "Senior Facilitator", img: "/Web Images/default-avatar.svg" },
            ].map((member, idx) => (
              <div key={idx} className="team-preview-card" onClick={() => navigateTab('team')} style={{ cursor: 'pointer' }}>
                <img src={member.img} alt={member.name} />
                <h4>{member.name}</h4>
                <p>{member.role}</p>
              </div>
            ))}
          </div>
        </div>

        {/* ── SESSIONS SNEAK PEEK ── */}
        <div className="preview-section reveal-hidden" style={{ marginBottom: '80px' }}>
          <div className="preview-section-header">
            <h2>Our Sessions</h2>
            <button onClick={() => navigateTab('sessions')}>
              See full curriculum <ArrowRight size={14} />
            </button>
          </div>
          <div className="sessions-preview-strip">
            {[
              { title: "Advanced Algebra & Logic", desc: "Dive deep into algebraic structures, matrices, and proofs that power modern computation.", img: "/Web Images/math camp pics/algorithm0.jpg" },
              { title: "Number Theory & Cryptography", desc: "Explore prime numbers, modular arithmetic, and the secrets behind modern encryption.", img: "/Web Images/math camp pics/physics0.jpg" },
              { title: "CS & Coding Outreach", desc: "Translate mathematical ideas into real algorithms and Python programs.", img: "/Web Images/math camp pics/algorithm1.jpg" },
            ].map((session, idx) => (
              <div key={idx} className="session-preview-card" onClick={() => navigateTab('sessions')}>
                <img src={session.img} alt={session.title} />
                <div className="session-preview-card-body">
                  <h4>{session.title}</h4>
                  <p>{session.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </>
  );
}
