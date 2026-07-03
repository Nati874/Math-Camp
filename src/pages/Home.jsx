import React, { useState, useEffect, useRef } from 'react';
import { 
  Calculator, 
  BookOpen, 
  Users, 
  ChevronRight, 
  ChevronLeft, 
  ArrowRight 
} from 'lucide-react';

export default function Home({ setCurrentPage }) {
  const [typedText, setTypedText] = useState('');
  const [currentSlide, setCurrentSlide] = useState(0);
  const [useTransition, setUseTransition] = useState(true);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [cardsPerPage, setCardsPerPage] = useState(3);
  const sliderRef = useRef(null);

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

      const elements = document.querySelectorAll('#home .reveal-hidden');
      elements.forEach(el => observer.observe(el));

      return () => {
        elements.forEach(el => observer.unobserve(el));
      };
    }, 150);

    return () => clearTimeout(timer);
  }, []);

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
      <div id="header">
        <div className="hero-overlay">
          <h3 className="welcome-label">Welcome</h3>
          <div className="welcome-divider-home"></div>
          <h1 className="hero-title">Bahir Dar University Math Camp</h1>
          <p className="hero-subtitle">
            Nurturing: <span id="typed-text">{typedText}</span><span className="cursor">|</span>
          </p>
        </div>
        <div className="scroll-down-indicator">
          <span>Scroll Down</span>
          <ChevronRight size={16} className="bouncing" style={{ transform: 'rotate(90deg)' }} />
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
      </div>
    </>
  );
}
