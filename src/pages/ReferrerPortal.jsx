import React, { useState, useEffect } from 'react';
import { LogIn, Key, Mail, Send, CheckCircle2, AlertTriangle, Copy, Check } from 'lucide-react';

export default function ReferrerPortal() {
  const [user, setUser] = useState(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Dashboard Stats
  const [dashboardData, setDashboardData] = useState(null);
  const [camperEmail, setCamperEmail] = useState('');
  const [referralSuccess, setReferralSuccess] = useState(null);
  const [referralError, setReferralError] = useState('');
  const [isCopied, setIsCopied] = useState(false);

  // Check sessionStorage for logged in referrer session
  useEffect(() => {
    const storedUser = sessionStorage.getItem('referrer_session');
    if (storedUser) {
      const parsed = JSON.parse(storedUser);
      setUser(parsed);
      loadDashboard(parsed.referrer_id);
    }
  }, []);

  const loadDashboard = (referrerId) => {
    fetch(`/api/referrer/dashboard?referrer_id=${referrerId}`)
      .then(res => res.json())
      .then(data => setDashboardData(data))
      .catch(err => console.warn('Failed to load dashboard data', err));
  };

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setLoginError('');
    setIsLoading(true);

    try {
      const res = await fetch('/api/referrer/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Authentication failed');
      }

      if (data.referrer_type === 'Admin') {
        throw new Error('This portal is for referrers. Please log in through the admin portal.');
      }

      sessionStorage.setItem('referrer_session', JSON.stringify(data));
      setUser(data);
      loadDashboard(data.referrer_id);
    } catch (err) {
      setLoginError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateReferralSubmit = async (e) => {
    e.preventDefault();
    setReferralSuccess(null);
    setReferralError('');

    try {
      const res = await fetch('/api/referrer/referral', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          referrer_id: user.referrer_id,
          camper_email: camperEmail
        })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to submit referral');
      }

      setReferralSuccess(data);
      setCamperEmail('');
      loadDashboard(user.referrer_id);
    } catch (err) {
      setReferralError(err.message);
    }
  };

  const handleCopyLink = () => {
    if (!referralSuccess?.registrationUrl) return;
    navigator.clipboard.writeText(referralSuccess.registrationUrl);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const handleLogout = () => {
    sessionStorage.removeItem('referrer_session');
    setUser(null);
    setDashboardData(null);
    setReferralSuccess(null);
  };

  // LOGIN PAGE
  if (!user) {
    return (
      <div className="tab-content" style={{ display: 'block', paddingTop: '80px', paddingBottom: '100px' }}>
        <div style={{ maxWidth: '420px', margin: '0 auto', background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: '16px', padding: '40px 30px', boxShadow: '0 10px 25px rgba(0,0,0,0.1)' }}>
          <div style={{ textAlign: 'center', marginBottom: '30px' }}>
            <Key size={36} style={{ color: 'var(--text-primary)', marginBottom: '12px' }} />
            <h2 style={{ fontSize: '22px', fontWeight: '700' }}>Referrer Portal</h2>
            <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '6px' }}>Sign in to recommend outstanding students</p>
          </div>

          {loginError && (
            <div style={{ background: 'rgba(225, 29, 72, 0.1)', color: '#E11D48', padding: '10px 14px', borderRadius: '8px', border: '1px solid rgba(225, 29, 72, 0.2)', marginBottom: '20px', fontSize: '13px' }}>
              {loginError}
            </div>
          )}

          <form onSubmit={handleLoginSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div>
              <h4 style={{ marginBottom: '8px', fontSize: '13px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Email Address</h4>
              <input type="email" required className="messages" value={email} onChange={(e) => setEmail(e.target.value)} style={{ width: '100%' }} />
            </div>

            <div>
              <h4 style={{ marginBottom: '8px', fontSize: '13px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Password</h4>
              <input type="password" required className="messages" value={password} onChange={(e) => setPassword(e.target.value)} style={{ width: '100%' }} />
            </div>

            <button type="submit" className="peakbtn" disabled={isLoading} style={{ width: '100%', background: 'var(--text-primary)', color: 'var(--bg-primary)', display: 'inline-flex', justifyContent: 'center', alignItems: 'center', gap: '8px' }}>
              <LogIn size={16} /> {isLoading ? 'Authenticating...' : 'Sign In'}
            </button>
          </form>
        </div>
      </div>
    );
  }

  const referralCount = dashboardData?.referrals?.length || 0;
  const remainingSlots = user.max_referrals - referralCount;

  // REFERRER DASHBOARD
  return (
    <div className="tab-content" style={{ display: 'block', paddingTop: '40px', paddingBottom: '80px' }}>
      <div style={{ maxWidth: '900px', margin: '0 auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
          <div>
            <h2 style={{ fontSize: '24px', fontWeight: '700' }}>Referrer Dashboard</h2>
            <p style={{ fontSize: '14px', color: 'var(--text-muted)' }}>Welcome back, {user.first_name} {user.last_name} ({user.institution})</p>
          </div>
          <button onClick={handleLogout} className="peakbtn" style={{ background: 'transparent', border: '1px solid var(--border-color)', color: 'var(--text-muted)' }}>
            Log Out
          </button>
        </div>

        {/* Info Metrics */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '20px', marginBottom: '40px' }}>
          <div style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', padding: '20px', borderRadius: '12px' }}>
            <div style={{ fontSize: '13px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Max Slot Allocation</div>
            <div style={{ fontSize: '28px', fontWeight: '700', marginTop: '6px', color: 'var(--text-primary)' }}>{user.max_referrals}</div>
          </div>
          <div style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', padding: '20px', borderRadius: '12px' }}>
            <div style={{ fontSize: '13px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Referrals Created</div>
            <div style={{ fontSize: '28px', fontWeight: '700', marginTop: '6px', color: 'var(--text-primary)' }}>{referralCount}</div>
          </div>
          <div style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', padding: '20px', borderRadius: '12px' }}>
            <div style={{ fontSize: '13px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Remaining Slots</div>
            <div style={{ fontSize: '28px', fontWeight: '700', marginTop: '6px', color: remainingSlots <= 0 ? '#E11D48' : '#10B981' }}>{remainingSlots}</div>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.3fr', gap: '30px' }}>
          {/* Submit Referral Block */}
          <div>
            <div style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', padding: '30px 24px', borderRadius: '16px' }}>
              <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '16px' }}>Recommend a Student</h3>
              
              {remainingSlots <= 0 ? (
                <div style={{ background: 'rgba(239, 68, 68, 0.08)', color: '#EF4444', padding: '14px', borderRadius: '8px', fontSize: '13px', display: 'flex', gap: '10px', alignItems: 'flex-start', border: '1px solid rgba(239, 68, 68, 0.15)' }}>
                  <AlertTriangle size={20} style={{ flexShrink: 0 }} />
                  <div>
                    <strong>Quota Reached:</strong> You have used all {user.max_referrals} allocation slots. Please contact the administrator if you need to submit more recommendations.
                  </div>
                </div>
              ) : (
                <form onSubmit={handleCreateReferralSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <div>
                    <h4 style={{ marginBottom: '8px', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Camper's Email Address</h4>
                    <input 
                      type="email" 
                      required 
                      className="messages" 
                      placeholder="e.g. student@school.com" 
                      value={camperEmail} 
                      onChange={(e) => setCamperEmail(e.target.value)} 
                      style={{ width: '100%' }} 
                    />
                  </div>
                  <button type="submit" className="peakbtn" style={{ background: 'var(--text-primary)', color: 'var(--bg-primary)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                    <Send size={15} /> Generate Invite Token
                  </button>
                </form>
              )}

              {referralError && (
                <div style={{ background: 'rgba(225, 29, 72, 0.1)', color: '#E11D48', padding: '10px 14px', borderRadius: '8px', border: '1px solid rgba(225, 29, 72, 0.2)', marginTop: '20px', fontSize: '13px' }}>
                  {referralError}
                </div>
              )}

              {referralSuccess && (
                <div style={{ background: 'rgba(16, 185, 129, 0.08)', color: '#10B981', padding: '16px', borderRadius: '12px', border: '1px solid rgba(16, 185, 129, 0.15)', marginTop: '20px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: '600', fontSize: '14px', marginBottom: '8px' }}>
                    <CheckCircle2 size={16} /> Token Generated!
                  </div>
                  <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '8px' }}>Copy the invitation registration URL below and send it to your recommended student:</div>
                  <div style={{ background: 'var(--bg-primary)', padding: '10px 12px', borderRadius: '6px', fontSize: '11px', wordBreak: 'break-all', display: 'flex', justifyContent: 'space-between', alignItems: 'center', border: '1px solid var(--border-color)', color: 'var(--text-primary)' }}>
                    <span>{referralSuccess.registrationUrl}</span>
                    <button onClick={handleCopyLink} style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: '0 4px', display: 'flex', alignItems: 'center' }}>
                      {isCopied ? <Check size={14} style={{ color: '#10B981' }} /> : <Copy size={14} />}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Past Referrals list */}
          <div>
            <div style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', padding: '24px', borderRadius: '16px' }}>
              <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '16px' }}>Your Recommendations</h3>
              
              {!dashboardData?.referrals || dashboardData.referrals.length === 0 ? (
                <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '14px' }}>No recommendations submitted yet.</div>
              ) : (
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
                    <thead>
                      <tr style={{ borderBottom: '1px solid var(--border-color)', textAlign: 'left' }}>
                        <th style={{ padding: '10px 8px', color: 'var(--text-muted)', fontWeight: '500' }}>Student Email</th>
                        <th style={{ padding: '10px 8px', color: 'var(--text-muted)', fontWeight: '500' }}>Code</th>
                        <th style={{ padding: '10px 8px', color: 'var(--text-muted)', fontWeight: '500' }}>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {dashboardData.referrals.map((r, idx) => (
                        <tr key={idx} style={{ borderBottom: '1px solid var(--border-color)' }}>
                          <td style={{ padding: '10px 8px', fontWeight: '500' }}>{r.camper_email}</td>
                          <td style={{ padding: '10px 8px', fontFamily: 'monospace' }}>{r.token_code}</td>
                          <td style={{ padding: '10px 8px' }}>
                            <span style={{ 
                              display: 'inline-block',
                              padding: '2px 8px', 
                              borderRadius: '12px', 
                              fontSize: '11px',
                              fontWeight: '600',
                              background: r.status === 'Claimed' ? 'rgba(16, 185, 129, 0.1)' : r.status === 'Unused' ? 'rgba(59, 130, 246, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                              color: r.status === 'Claimed' ? '#10B981' : r.status === 'Unused' ? '#3B82F6' : '#EF4444'
                            }}>
                              {r.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
