import React from 'react';

export default function InfoModal({ modalType, setModalType }) {
  if (!modalType) return null;

  return (
    <div id="info-modal" className="modal-overlay active" onClick={() => setModalType(null)}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={() => setModalType(null)}>&times;</button>
        
        {modalType === 'support' ? (
          <>
            <h2>Support BDU Math Camp</h2>
            <p>Your support helps us provide scholarships, study materials, and high-quality tutoring for talented high school students from across the country.</p>
            <p><strong>Ways to Support:</strong></p>
            <ul>
              <li>Volunteer as a student mentor or facilitator.</li>
              <li>Donate textbooks, calculators, or coding kits.</li>
              <li>Financial contributions directly to STEM outreach programs.</li>
            </ul>
            <div class="modal-details">
              Bank: Commercial Bank of Ethiopia<br />
              Account Name: BDU STEM Center / Math Camp Outreach<br />
              Account No: 1000192837465<br />
              Contact: support.stem@bdu.edu.et
            </div>
          </>
        ) : (
          <>
            <h2>Partner & Invest with Us</h2>
            <p>Sponsoring BDU Math Camp connects your organization with the brightest young minds in the region. Invest in the future of sciences and technology.</p>
            <p><strong>Corporate Sponsorship tiers include:</strong></p>
            <ul>
              <li>Logo placement on outreach materials and shirts.</li>
              <li>Naming rights for computer science or robotics sessions.</li>
              <li>Opportunities to recruit top-tier high school graduates for tech internships.</li>
            </ul>
            <div class="modal-details">
              BDU STEM Office: Peda Campus, Room 102<br />
              Director Email: director.stem@bdu.edu.et<br />
              Phone: +251-953-256-171
            </div>
          </>
        )}
      </div>
    </div>
  );
}
