import React, { useState, useEffect } from 'react';
import { ShieldCheck, User, ShieldAlert, ArrowLeft, ArrowRight, CheckCircle, Calendar, DollarSign, Users } from 'lucide-react';

export default function Register() {
  const [token, setToken] = useState('');
  const [isValidating, setIsValidating] = useState(true);
  const [validationError, setValidationError] = useState('');
  const [tokenData, setTokenData] = useState(null);
  
  // Registration Form Steps
  const [step, setStep] = useState(1);
  const [sessions, setSessions] = useState([]);
  
  // Form State
  const [formData, setFormData] = useState({
    guardian_first_name: '',
    guardian_last_name: '',
    guardian_email: '',
    guardian_phone: '',
    camper_first_name: '',
    camper_last_name: '',
    camper_birth_date: '',
    camper_dietary: '',
    camper_medical: '',
    relationship: 'Father',
    session_id: ''
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [submitError, setSubmitError] = useState('');

  // Extract token parameter from query string
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const tokenCode = params.get('token');
    
    if (!tokenCode) {
      setValidationError('No referral token was provided in the invitation link.');
      setIsValidating(false);
      return;
    }
    
    setToken(tokenCode);
    
    // Validate token code against backend API
    fetch(`/api/referrals/validate?token=${tokenCode}`)
      .then(res => {
        if (!res.ok) {
          return res.json().then(data => { throw new Error(data.error || 'Token validation failed') });
        }
        return res.json();
      })
      .then(data => {
        setTokenData(data);
        setFormData(prev => ({
          ...prev,
          guardian_email: prev.guardian_email || data.camper_email
        }));
        setIsValidating(false);
      })
      .catch(err => {
        setValidationError(err.message);
        setIsValidating(false);
      });

    // Load available camp sessions
    fetch('/api/admin/sessions')
      .then(res => res.json())
      .then(data => setSessions(data))
      .catch(err => console.warn('Failed to load sessions', err));
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    if (!formData.session_id) {
      setSubmitError('Please select a camp session to register.');
      return;
    }

    setIsSubmitting(true);
    setSubmitError('');

    try {
      const res = await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token_code: token,
          ...formData
        })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to complete registration');
      }

      setIsSuccess(true);
      setIsSubmitting(false);
    } catch (err) {
      setSubmitError(err.message);
      setIsSubmitting(false);
    }
  };

  if (isValidating) {
    return (
      <div className="tab-content" style={{ display: 'block', minHeight: '60vh', textAlign: 'center', paddingTop: '100px' }}>
        <div style={{ color: 'var(--text-muted)', fontSize: '18px' }}>Validating referral invitation token...</div>
      </div>
    );
  }

  if (validationError) {
    return (
      <div className="tab-content" style={{ display: 'block', minHeight: '70vh', paddingTop: '80px' }}>
        <div className="no-pictures-view" style={{ maxWidth: '600px', margin: '0 auto' }}>
          <ShieldAlert size={48} style={{ color: '#E11D48', marginBottom: '20px' }} />
          <h2 style={{ color: 'var(--text-primary)', marginBottom: '12px' }}>Invalid Invitation Link</h2>
          <p style={{ marginBottom: '24px' }}>{validationError}</p>
          <button 
            onClick={() => window.location.href = '/'}
            className="peakbtn"
            style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: 'var(--text-primary)', color: 'var(--bg-primary)' }}
          >
            <ArrowLeft size={16} /> Return to Home
          </button>
        </div>
      </div>
    );
  }

  if (isSuccess) {
    return (
      <div className="tab-content" style={{ display: 'block', minHeight: '70vh', paddingTop: '80px' }}>
        <div className="no-pictures-view" style={{ maxWidth: '600px', margin: '0 auto', border: '1px solid #10B981' }}>
          <CheckCircle size={48} style={{ color: '#10B981', marginBottom: '20px' }} />
          <h2 style={{ color: 'var(--text-primary)', marginBottom: '12px' }}>Registration Complete!</h2>
          <p style={{ marginBottom: '24px' }}>Congratulations! The registration for BDU Math Summer Camp has been processed successfully. We've updated your referral ticket token.</p>
          <button 
            onClick={() => window.location.href = '/'}
            className="peakbtn"
            style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: 'var(--text-primary)', color: 'var(--bg-primary)' }}
          >
            Go to Welcome Page
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="tab-content" style={{ display: 'block', paddingTop: '40px', paddingBottom: '80px' }}>
      <div style={{ maxWidth: '700px', margin: '0 auto' }}>
        <div id="sideTitle">
          <h2>Camper Registration</h2>
          <hr className="section-divider" />
        </div>

        <div style={{ background: 'var(--bg-secondary)', padding: '16px 20px', borderRadius: '12px', border: '1px solid var(--border-color)', marginBottom: '30px', display: 'flex', alignItems: 'center', gap: '12px' }}>
          <ShieldCheck size={24} style={{ color: 'var(--text-primary)' }} />
          <div>
            <div style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Referred by</div>
            <div style={{ fontWeight: '600', fontSize: '15px' }}>{tokenData?.referrer_name} ({tokenData?.institution})</div>
          </div>
        </div>

        {/* Step Indicator */}
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '40px', borderBottom: '1px solid var(--border-color)', paddingBottom: '16px' }}>
          <div style={{ fontWeight: step === 1 ? '700' : '400', color: step === 1 ? 'var(--text-primary)' : 'var(--text-muted)' }}>1. Guardian Information</div>
          <div style={{ fontWeight: step === 2 ? '700' : '400', color: step === 2 ? 'var(--text-primary)' : 'var(--text-muted)' }}>2. Camper Details</div>
          <div style={{ fontWeight: step === 3 ? '700' : '400', color: step === 3 ? 'var(--text-primary)' : 'var(--text-muted)' }}>3. Session Selection</div>
        </div>

        {submitError && (
          <div style={{ background: 'rgba(225, 29, 72, 0.1)', color: '#E11D48', padding: '12px 16px', borderRadius: '8px', border: '1px solid rgba(225, 29, 72, 0.2)', marginBottom: '24px', fontSize: '14px' }}>
            {submitError}
          </div>
        )}

        <form onSubmit={handleRegisterSubmit}>
          {/* STEP 1: GUARDIAN INFO */}
          {step === 1 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div>
                  <h4 style={{ marginBottom: '8px', fontSize: '14px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Guardian First Name</h4>
                  <input type="text" name="guardian_first_name" className="messages" required value={formData.guardian_first_name} onChange={handleInputChange} style={{ width: '100%' }} />
                </div>
                <div>
                  <h4 style={{ marginBottom: '8px', fontSize: '14px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Guardian Last Name</h4>
                  <input type="text" name="guardian_last_name" className="messages" required value={formData.guardian_last_name} onChange={handleInputChange} style={{ width: '100%' }} />
                </div>
              </div>
              
              <div>
                <h4 style={{ marginBottom: '8px', fontSize: '14px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Email Address</h4>
                <input type="email" name="guardian_email" className="messages" required value={formData.guardian_email} onChange={handleInputChange} style={{ width: '100%' }} />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div>
                  <h4 style={{ marginBottom: '8px', fontSize: '14px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Relationship</h4>
                  <select name="relationship" className="messages" required value={formData.relationship} onChange={handleInputChange} style={{ width: '100%', padding: '12px', background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', color: 'var(--text-primary)', borderRadius: '8px' }}>
                    <option value="Father">Father</option>
                    <option value="Mother">Mother</option>
                    <option value="Guardian">Legal Guardian</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div>
                  <h4 style={{ marginBottom: '8px', fontSize: '14px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Phone Number</h4>
                  <input type="tel" name="guardian_phone" className="messages" required value={formData.guardian_phone} onChange={handleInputChange} style={{ width: '100%' }} />
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '20px' }}>
                <button type="button" className="peakbtn" onClick={() => setStep(2)} style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
                  Next Details <ArrowRight size={16} />
                </button>
              </div>
            </div>
          )}

          {/* STEP 2: CAMPER DETAILS */}
          {step === 2 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div>
                  <h4 style={{ marginBottom: '8px', fontSize: '14px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Camper First Name</h4>
                  <input type="text" name="camper_first_name" className="messages" required value={formData.camper_first_name} onChange={handleInputChange} style={{ width: '100%' }} />
                </div>
                <div>
                  <h4 style={{ marginBottom: '8px', fontSize: '14px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Camper Last Name</h4>
                  <input type="text" name="camper_last_name" className="messages" required value={formData.camper_last_name} onChange={handleInputChange} style={{ width: '100%' }} />
                </div>
              </div>

              <div>
                <h4 style={{ marginBottom: '8px', fontSize: '14px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Camper Birth Date</h4>
                <input type="date" name="camper_birth_date" className="messages" required value={formData.camper_birth_date} onChange={handleInputChange} style={{ width: '100%' }} />
              </div>

              <div>
                <h4 style={{ marginBottom: '8px', fontSize: '14px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Dietary Restrictions (Optional)</h4>
                <input type="text" name="camper_dietary" className="messages" placeholder="e.g. Vegetarian, Nut allergies" value={formData.camper_dietary} onChange={handleInputChange} style={{ width: '100%' }} />
              </div>

              <div>
                <h4 style={{ marginBottom: '8px', fontSize: '14px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Medical Notes (Optional)</h4>
                <textarea name="camper_medical" className="messages" placeholder="e.g. Asthma details, medication schedules" value={formData.camper_medical} onChange={handleInputChange} style={{ width: '100%', minHeight: '80px' }}></textarea>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '20px' }}>
                <button type="button" className="peakbtn" onClick={() => setStep(1)} style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: 'transparent', border: '1px solid var(--border-color)', color: 'var(--text-muted)' }}>
                  <ArrowLeft size={16} /> Back
                </button>
                <button type="button" className="peakbtn" onClick={() => setStep(3)} style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
                  Next: Select Session <ArrowRight size={16} />
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: SESSION SELECTION */}
          {step === 3 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <h4 style={{ fontSize: '14px', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '8px' }}>Available Summer Camp Sessions</h4>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {sessions.map(s => (
                  <label 
                    key={s.session_id} 
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '16px',
                      padding: '16px 20px',
                      borderRadius: '12px',
                      border: formData.session_id === String(s.session_id) ? '1px solid var(--text-primary)' : '1px solid var(--border-color)',
                      background: formData.session_id === String(s.session_id) ? 'rgba(255,255,255,0.02)' : 'transparent',
                      cursor: 'pointer',
                      transition: 'all 0.2s'
                    }}
                  >
                    <input 
                      type="radio" 
                      name="session_id" 
                      value={s.session_id} 
                      checked={formData.session_id === String(s.session_id)} 
                      onChange={handleInputChange}
                      style={{ transform: 'scale(1.2)' }}
                    />
                    <div style={{ flexGrow: 1 }}>
                      <div style={{ fontWeight: '600', fontSize: '16px' }}>{s.title}</div>
                      <div style={{ fontSize: '13px', color: 'var(--text-muted)', display: 'flex', gap: '12px', marginTop: '4px' }}>
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}><Calendar size={13} /> {s.start_date} to {s.end_date}</span>
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}><Users size={13} /> Capacity limit: {s.capacity}</span>
                      </div>
                    </div>
                    <div style={{ fontWeight: '700', fontSize: '16px' }}>${s.price}</div>
                  </label>
                ))}
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '30px' }}>
                <button type="button" className="peakbtn" onClick={() => setStep(2)} style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: 'transparent', border: '1px solid var(--border-color)', color: 'var(--text-muted)' }}>
                  <ArrowLeft size={16} /> Back
                </button>
                <button type="submit" className="peakbtn" disabled={isSubmitting} style={{ background: 'var(--text-primary)', color: 'var(--bg-primary)' }}>
                  {isSubmitting ? 'Registering Camper...' : 'Confirm Registration'}
                </button>
              </div>
            </div>
          )}
        </form>
      </div>
    </div>
  );
}
