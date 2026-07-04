import React, { useEffect } from 'react';

export default function History() {
  // Scroll reveal observer for timeline milestones
  useEffect(() => {
    const timer = setTimeout(() => {
      const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('reveal-visible');
            observer.unobserve(entry.target);
          }
        });
      }, { threshold: 0.15 });

      const elements = document.querySelectorAll('.timeline-item');
      elements.forEach(el => observer.observe(el));

      return () => observer.disconnect();
    }, 150);

    return () => clearTimeout(timer);
  }, []);

  const milestones = [
    {
      year: "2011",
      title: "Camp Conception",
      description: "Founded as a collaborative outreach initiative by the Bahir Dar University Mathematics Department to nurture exceptional high school talents from local zones.",
      image: "/Web Images/math camp pics/camp0.jpg"
    },
    {
      year: "2014",
      title: "Regional Expansion",
      description: "Introduced regional boarding scholarships, drawing talented students from across remote regional zones of Ethiopia to stay at the Peda campus.",
      image: "/Web Images/math camp pics/camp1.jpg"
    },
    {
      year: "2018",
      title: "Physics & CS Integration",
      description: "Bridged theoretical mathematics with modern computation by adding Python algorithm workshops and experimental physics modules.",
      image: "/Web Images/math camp pics/algorithm1.jpg"
    },
    {
      year: "2021",
      title: "International Partnerships",
      description: "Partnered with the International Science Program (ISP) to host visiting lecturers, global STEM experts, and international camp facilitators.",
      image: "/Web Images/math camp pics/2023/photo3.jpg"
    },
    {
      year: "2024",
      title: "Portal Seeding & Infrastructure",
      description: "Upgraded selection systems by launching secure counselor referral tokens, registration trackers, and admin quota management panels.",
      image: "/Web Images/math camp pics/2023/photo5.jpg"
    },
    {
      year: "2026",
      title: "Computational Research & Beyond",
      description: "Expanded outreach to cover advanced algebra seminars, peer-reviewed computational challenges, and digital camp database management.",
      image: "/Web Images/math camp pics/2023/photo7.jpg"
    }
  ];

  return (
    <div className="tab-content" id="history-page">
      <div id="sideTitle">
        <h2>Camp History</h2>
        <hr className="section-divider" />
      </div>

      <p className="history-intro">
        Explore the historical milestones of the Bahir Dar University Mathematics Summer Camp from its early outreach days to a fully integrated mathematical research community.
      </p>

      <div className="timeline-container">
        {/* Central connecting vertical line */}
        <div className="timeline-line" />

        {milestones.map((item, index) => {
          const isEven = index % 2 === 0;
          return (
            <div 
              key={index} 
              className={`timeline-item ${isEven ? 'item-left' : 'item-right'} reveal-hidden-timeline`}
            >
              {/* Central Glowing Dot */}
              <div className="timeline-dot" />

              {/* Year marker */}
              <div className="timeline-year">{item.year}</div>

              {/* Content panel */}
              <div className="timeline-content">
                <h3>{item.title}</h3>
                <p>{item.description}</p>
              </div>

              {/* Image panel */}
              <div className="timeline-image-container">
                <img src={item.image} alt={item.title} />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
