import React, { useState, useEffect } from 'react';
import { Shield, Key, LogIn, Database, UserPlus, Trash2, Edit2, List, Save, Settings, Users, BookOpen, Heart, RefreshCw } from 'lucide-react';

export default function AdminPortal() {
  const [admin, setAdmin] = useState(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Active panel state: 'overview', 'sessions', 'referrers', 'db'
  const [activePanel, setActivePanel] = useState('overview');

  // Overview Stats
  const [overview, setOverview] = useState(null);
  
  // Sessions & Rosters State
  const [sessions, setSessions] = useState([]);
  const [selectedSessionId, setSelectedSessionId] = useState('');
  const [roster, setRoster] = useState([]);
  const [rosterLoading, setRosterLoading] = useState(false);
  const [newCapacity, setNewCapacity] = useState('');
  const [capacityMessage, setCapacityMessage] = useState('');

  // Referrers CRUD State
  const [referrers, setReferrers] = useState([]);
  const [showReferrerForm, setShowReferrerForm] = useState(false);
  const [editingReferrerId, setEditingReferrerId] = useState(null);
  const [referrerFormData, setReferrerFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    password: '',
    institution: '',
    referrer_type: 'Teacher',
    max_referrals: 10
  });
  const [referrerError, setReferrerError] = useState('');

  // Database Maintenance state
  const [dbSize, setDbSize] = useState('');
  const [isVacuuming, setIsVacuuming] = useState(false);
  const [vacuumSuccess, setVacuumSuccess] = useState('');

  useEffect(() => {
    const storedAdmin = sessionStorage.getItem('admin_session');
    if (storedAdmin) {
      const parsed = JSON.parse(storedAdmin);
      setAdmin(parsed);
      loadAdminData();
    }
  }, []);

  // Fetch admin analytical views
  const loadAdminData = () => {
    fetch('/api/admin/overview')
      .then(res => res.json())
      .then(data => setOverview(data))
      .catch(err => console.warn('Failed to load overview data', err));

    fetch('/api/admin/sessions')
      .then(res => res.json())
      .then(data => setSessions(data))
      .catch(err => console.warn('Failed to load sessions list', err));

    fetch('/api/admin/referrers')
      .then(res => res.json())
      .then(data => setReferrers(data))
      .catch(err => console.warn('Failed to load referrers list', err));

    // Get current DB size stats by running a vacuum report
    fetch('/api/admin/db/vacuum', { method: 'POST' })
      .then(res => res.json())
      .then(data => setDbSize(data.sizeMB))
      .catch(err => console.warn('Failed to fetch DB size stats', err));
  };

  const handleAdminLogin = async (e) => {
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
        throw new Error(data.error || 'Login failed');
      }

      if (data.referrer_type !== 'Admin') {
        throw new Error('This account does not have administrator privileges.');
      }

      sessionStorage.setItem('admin_session', JSON.stringify(data));
      setAdmin(data);
      loadAdminData();
    } catch (err) {
      setLoginError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectSession = (sessionId) => {
    setSelectedSessionId(sessionId);
    if (!sessionId) {
      setRoster([]);
      return;
    }

    setRosterLoading(true);
    setCapacityMessage('');
    
    // Find selected session capacity
    const currentSession = sessions.find(s => String(s.session_id) === String(sessionId));
    setNewCapacity(currentSession ? String(currentSession.capacity) : '');

    fetch(`/api/admin/sessions/${sessionId}/roster`)
      .then(res => res.json())
      .then(data => {
        setRoster(data);
        setRosterLoading(false);
      })
      .catch(err => {
        console.warn(err);
        setRosterLoading(false);
      });
  };

  const handleUpdateCapacity = async (e) => {
    e.preventDefault();
    setCapacityMessage('');

    try {
      const res = await fetch(`/api/admin/sessions/${selectedSessionId}/capacity`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ capacity: parseInt(newCapacity, 10) })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to update capacity limit');

      setCapacityMessage('Capacity updated successfully!');
      
      // Reload sessions & overview stats
      loadAdminData();
    } catch (err) {
      setCapacityMessage('Error: ' + err.message);
    }
  };

  const handleReferrerInputChange = (e) => {
    const { name, value } = e.target;
    setReferrerFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleReferrerSubmit = async (e) => {
    e.preventDefault();
    setReferrerError('');

    const isEdit = editingReferrerId !== null;
    const url = isEdit 
      ? `/api/admin/referrers/${editingReferrerId}` 
      : '/api/admin/referrers';
    const method = isEdit ? 'PUT' : 'POST';

    try {
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(referrerFormData)
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Operation failed');

      // Reset form
      setReferrerFormData({
        first_name: '',
        last_name: '',
        email: '',
        password: '',
        institution: '',
        referrer_type: 'Teacher',
        max_referrals: 10
      });
      setShowReferrerForm(false);
      setEditingReferrerId(null);
      loadAdminData();
    } catch (err) {
      setReferrerError(err.message);
    }
  };

  const handleEditReferrer = (ref) => {
    setEditingReferrerId(ref.referrer_id);
    setReferrerFormData({
      first_name: ref.first_name,
      last_name: ref.last_name,
      email: ref.email,
      password: '', // Leave password blank on edit unless updating
      institution: ref.institution,
      referrer_type: ref.referrer_type,
      max_referrals: ref.max_referrals
    });
    setShowReferrerForm(true);
  };

  const handleDeleteReferrer = async (id) => {
    if (!window.confirm("Are you sure you want to delete this trusted referrer? All associated referral tokens will be deleted.")) return;

    try {
      const res = await fetch(`/api/admin/referrers/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Delete operation failed');
      loadAdminData();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleVacuumDb = async () => {
    setIsVacuuming(true);
    setVacuumSuccess('');
    
    try {
      const res = await fetch('/api/admin/db/vacuum', { method: 'POST' });
      const data = await res.json();
      
      if (!res.ok) throw new Error(data.error || 'Vacuum operation failed');
      
      setDbSize(data.sizeMB);
      setVacuumSuccess(`Database vacuum operation succeeded! Reduced size verified on server disk.`);
    } catch (err) {
      setVacuumSuccess('Error executing vacuum: ' + err.message);
    } finally {
      setIsVacuuming(false);
    }
  };

  const handleLogout = () => {
    sessionStorage.removeItem('admin_session');
    setAdmin(null);
    setOverview(null);
  };

  // ADMIN LOGIN PANEL
  if (!admin) {
    return (
      <div className="tab-content" style={{ display: 'block', paddingTop: '80px', paddingBottom: '100px' }}>
        <div style={{ maxWidth: '420px', margin: '0 auto', background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: '16px', padding: '40px 30px', boxShadow: '0 10px 25px rgba(0,0,0,0.1)' }}>
          <div style={{ textAlign: 'center', marginBottom: '30px' }}>
            <Shield size={38} style={{ color: 'var(--text-primary)', marginBottom: '12px' }} />
            <h2 style={{ fontSize: '22px', fontWeight: '700' }}>Admin Command Center</h2>
            <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '6px' }}>Authenticate to manage sessions & referrers</p>
          </div>

          {loginError && (
            <div style={{ background: 'rgba(225, 29, 72, 0.1)', color: '#E11D48', padding: '10px 14px', borderRadius: '8px', border: '1px solid rgba(225, 29, 72, 0.2)', marginBottom: '20px', fontSize: '13px' }}>
              {loginError}
            </div>
          )}

          <form onSubmit={handleAdminLogin} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div>
              <h4 style={{ marginBottom: '8px', fontSize: '13px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Admin Email</h4>
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

  // ADMIN OPERATIONS COMMAND BOARD
  return (
    <div className="tab-content" style={{ display: 'block', paddingTop: '40px', paddingBottom: '80px' }}>
      <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
        
        {/* Dashboard Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px', borderBottom: '1px solid var(--border-color)', paddingBottom: '20px' }}>
          <div>
            <h2 style={{ fontSize: '24px', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '8px' }}><Shield size={24} /> Admin Command Center</h2>
            <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Camp Director Administrator Module</p>
          </div>
          <div style={{ display: 'flex', gap: '12px' }}>
            <button onClick={handleLogout} className="peakbtn" style={{ background: 'transparent', border: '1px solid var(--border-color)', color: 'var(--text-muted)', fontSize: '13px' }}>Log Out</button>
          </div>
        </div>

        {/* Panel Switch Tabs */}
        <div style={{ display: 'flex', gap: '10px', marginBottom: '30px' }}>
          <button onClick={() => setActivePanel('overview')} className="peakbtn" style={{ background: activePanel === 'overview' ? 'var(--text-primary)' : 'transparent', color: activePanel === 'overview' ? 'var(--bg-primary)' : 'var(--text-muted)', border: '1px solid var(--border-color)' }}>Overview Metrics</button>
          <button onClick={() => setActivePanel('sessions')} className="peakbtn" style={{ background: activePanel === 'sessions' ? 'var(--text-primary)' : 'transparent', color: activePanel === 'sessions' ? 'var(--bg-primary)' : 'var(--text-muted)', border: '1px solid var(--border-color)' }}>Sessions & Roster</button>
          <button onClick={() => setActivePanel('referrers')} className="peakbtn" style={{ background: activePanel === 'referrers' ? 'var(--text-primary)' : 'transparent', color: activePanel === 'referrers' ? 'var(--bg-primary)' : 'var(--text-muted)', border: '1px solid var(--border-color)' }}>Manage Teachers</button>
          <button onClick={() => setActivePanel('db')} className="peakbtn" style={{ background: activePanel === 'db' ? 'var(--text-primary)' : 'transparent', color: activePanel === 'db' ? 'var(--bg-primary)' : 'var(--text-muted)', border: '1px solid var(--border-color)' }}><Database size={15} style={{ marginRight: '6px', display: 'inline' }} /> Maintenance</button>
        </div>

        {/* PANEL 1: OVERVIEW METRICS */}
        {activePanel === 'overview' && (
          <div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '30px' }}>
              <div style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', padding: '24px', borderRadius: '12px' }}>
                <div style={{ fontSize: '13px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Total Registered Campers</div>
                <div style={{ fontSize: '32px', fontWeight: '700', marginTop: '6px' }}>{overview?.totalRegs}</div>
              </div>
              <div style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', padding: '24px', borderRadius: '12px' }}>
                <div style={{ fontSize: '13px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Active Unused Invite Tickets</div>
                <div style={{ fontSize: '32px', fontWeight: '700', marginTop: '6px' }}>{overview?.totalUnusedReferrals}</div>
              </div>
            </div>

            <div style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', padding: '30px 24px', borderRadius: '16px' }}>
              <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '20px' }}>Sessions Utilization & Capacity</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                {overview?.sessions?.map(s => {
                  const percent = Math.min(100, Math.round((s.filled / s.capacity) * 100)) || 0;
                  return (
                    <div key={s.session_id} style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '16px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                        <span style={{ fontWeight: '600' }}>{s.title}</span>
                        <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>{s.filled} / {s.capacity} campers filled</span>
                      </div>
                      <div style={{ width: '100%', height: '8px', background: 'var(--border-color)', borderRadius: '4px', overflow: 'hidden' }}>
                        <div style={{ width: `${percent}%`, height: '100%', background: percent >= 100 ? '#E11D48' : 'var(--text-primary)', transition: 'width 0.3s ease' }}></div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* PANEL 2: SESSIONS & ROSTER */}
        {activePanel === 'sessions' && (
          <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 2fr', gap: '30px' }}>
            {/* Session Selection */}
            <div>
              <div style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', padding: '24px', borderRadius: '16px' }}>
                <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '16px' }}>Select Camp Session</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {sessions.map(s => (
                    <button 
                      key={s.session_id}
                      onClick={() => handleSelectSession(s.session_id)}
                      style={{
                        padding: '12px 16px',
                        borderRadius: '8px',
                        border: '1px solid var(--border-color)',
                        background: String(selectedSessionId) === String(s.session_id) ? 'var(--text-primary)' : 'transparent',
                        color: String(selectedSessionId) === String(s.session_id) ? 'var(--bg-primary)' : 'var(--text-primary)',
                        textAlign: 'left',
                        cursor: 'pointer',
                        fontWeight: '500',
                        fontSize: '13px'
                      }}
                    >
                      {s.title}
                    </button>
                  ))}
                </div>

                {selectedSessionId && (
                  <form onSubmit={handleUpdateCapacity} style={{ borderTop: '1px solid var(--border-color)', marginTop: '24px', paddingTop: '20px' }}>
                    <h4 style={{ fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '10px' }}>Adjust Session Capacity</h4>
                    <div style={{ display: 'flex', gap: '10px' }}>
                      <input 
                        type="number" 
                        required 
                        className="messages" 
                        style={{ padding: '8px 12px', width: '80px' }} 
                        value={newCapacity} 
                        onChange={(e) => setNewCapacity(e.target.value)} 
                      />
                      <button type="submit" className="peakbtn" style={{ padding: '8px 16px', fontSize: '13px' }}>Save Limit</button>
                    </div>
                    {capacityMessage && (
                      <div style={{ fontSize: '12px', color: capacityMessage.includes('Error') ? '#E11D48' : '#10B981', marginTop: '10px' }}>{capacityMessage}</div>
                    )}
                  </form>
                )}
              </div>
            </div>

            {/* Camper Roster display */}
            <div>
              <div style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', padding: '24px', borderRadius: '16px', minHeight: '300px' }}>
                <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '16px' }}>Camper Roster</h3>

                {!selectedSessionId ? (
                  <div style={{ padding: '80px 0', textAlign: 'center', color: 'var(--text-muted)' }}>Please select a camp session from the left column to view registrations.</div>
                ) : rosterLoading ? (
                  <div style={{ padding: '80px 0', textAlign: 'center', color: 'var(--text-muted)' }}>Retrieving registered campers...</div>
                ) : roster.length === 0 ? (
                  <div style={{ padding: '80px 0', textAlign: 'center', color: 'var(--text-muted)' }}>No campers have registered for this session yet.</div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    {roster.map((camper) => (
                      <div key={camper.camper_id} style={{ border: '1px solid var(--border-color)', padding: '16px', borderRadius: '10px', background: 'var(--bg-primary)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-color)', paddingBottom: '8px', marginBottom: '8px' }}>
                          <span style={{ fontWeight: '700', fontSize: '15px' }}>{camper.first_name} {camper.last_name}</span>
                          <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Age/DOB: {camper.birth_date}</span>
                        </div>
                        <div style={{ fontSize: '12px', color: 'var(--text-muted)', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                          <div><strong>Guardian:</strong> {camper.g_first} {camper.g_last}</div>
                          <div><strong>Phone:</strong> {camper.g_phone}</div>
                          <div style={{ gridColumn: 'span 2' }}><strong>Email:</strong> {camper.g_email}</div>
                          {camper.dietary_restrictions && <div style={{ gridColumn: 'span 2' }}><strong>Dietary:</strong> {camper.dietary_restrictions}</div>}
                          {camper.medical_notes && <div style={{ gridColumn: 'span 2' }}><strong>Medical:</strong> {camper.medical_notes}</div>}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* PANEL 3: MANAGE REFERRERS */}
        {activePanel === 'referrers' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h3 style={{ fontSize: '18px', fontWeight: '600' }}>Trusted Educator Referrers</h3>
              <button 
                onClick={() => {
                  setShowReferrerForm(!showReferrerForm);
                  setEditingReferrerId(null);
                  setReferrerFormData({
                    first_name: '',
                    last_name: '',
                    email: '',
                    password: '',
                    institution: '',
                    referrer_type: 'Teacher',
                    max_referrals: 10
                  });
                }} 
                className="peakbtn"
                style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
              >
                <UserPlus size={15} /> Add Trusted Referrer
              </button>
            </div>

            {/* Referrer CRUD Add/Edit Form */}
            {showReferrerForm && (
              <div style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', padding: '24px', borderRadius: '16px', marginBottom: '30px' }}>
                <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '16px' }}>{editingReferrerId ? 'Edit Referrer Details' : 'Add New Trusted Referrer'}</h3>
                
                {referrerError && (
                  <div style={{ background: 'rgba(225, 29, 72, 0.1)', color: '#E11D48', padding: '10px 14px', borderRadius: '8px', border: '1px solid rgba(225, 29, 72, 0.2)', marginBottom: '16px', fontSize: '13px' }}>
                    {referrerError}
                  </div>
                )}

                <form onSubmit={handleReferrerSubmit} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <div>
                    <h4 style={{ marginBottom: '6px', fontSize: '12px' }}>First Name</h4>
                    <input type="text" name="first_name" required className="messages" value={referrerFormData.first_name} onChange={handleReferrerInputChange} style={{ width: '100%' }} />
                  </div>
                  <div>
                    <h4 style={{ marginBottom: '6px', fontSize: '12px' }}>Last Name</h4>
                    <input type="text" name="last_name" required className="messages" value={referrerFormData.last_name} onChange={handleReferrerInputChange} style={{ width: '100%' }} />
                  </div>
                  <div>
                    <h4 style={{ marginBottom: '6px', fontSize: '12px' }}>Email Address</h4>
                    <input type="email" name="email" required className="messages" value={referrerFormData.email} onChange={handleReferrerInputChange} style={{ width: '100%' }} />
                  </div>
                  <div>
                    <h4 style={{ marginBottom: '6px', fontSize: '12px' }}>{editingReferrerId ? 'Password (leave blank to keep current)' : 'Password'}</h4>
                    <input type="password" name="password" required={!editingReferrerId} className="messages" value={referrerFormData.password} onChange={handleReferrerInputChange} style={{ width: '100%' }} />
                  </div>
                  <div>
                    <h4 style={{ marginBottom: '6px', fontSize: '12px' }}>Institution</h4>
                    <input type="text" name="institution" required className="messages" value={referrerFormData.institution} onChange={handleReferrerInputChange} style={{ width: '100%' }} />
                  </div>
                  <div>
                    <h4 style={{ marginBottom: '6px', fontSize: '12px' }}>Referral Token Slots</h4>
                    <input type="number" name="max_referrals" required className="messages" value={referrerFormData.max_referrals} onChange={handleReferrerInputChange} style={{ width: '100%' }} />
                  </div>
                  <div style={{ gridColumn: 'span 2', display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '10px' }}>
                    <button type="button" onClick={() => setShowReferrerForm(false)} className="peakbtn" style={{ background: 'transparent', border: '1px solid var(--border-color)', color: 'var(--text-muted)' }}>Cancel</button>
                    <button type="submit" className="peakbtn" style={{ background: 'var(--text-primary)', color: 'var(--bg-primary)' }}>Save Referrer</button>
                  </div>
                </form>
              </div>
            )}

            {/* Referrer Table list */}
            <div style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', padding: '20px', borderRadius: '16px', overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--border-color)', textAlign: 'left' }}>
                    <th style={{ padding: '12px 8px', color: 'var(--text-muted)', fontWeight: '500' }}>Name</th>
                    <th style={{ padding: '12px 8px', color: 'var(--text-muted)', fontWeight: '500' }}>Email</th>
                    <th style={{ padding: '12px 8px', color: 'var(--text-muted)', fontWeight: '500' }}>Institution</th>
                    <th style={{ padding: '12px 8px', color: 'var(--text-muted)', fontWeight: '500' }}>Max Referral Slots</th>
                    <th style={{ padding: '12px 8px', color: 'var(--text-muted)', fontWeight: '500', textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {referrers.map((r) => (
                    <tr key={r.referrer_id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                      <td style={{ padding: '12px 8px', fontWeight: '600' }}>{r.first_name} {r.last_name}</td>
                      <td style={{ padding: '12px 8px' }}>{r.email}</td>
                      <td style={{ padding: '12px 8px' }}>{r.institution}</td>
                      <td style={{ padding: '12px 8px', fontWeight: '700' }}>{r.max_referrals}</td>
                      <td style={{ padding: '12px 8px', textAlign: 'right' }}>
                        <button onClick={() => handleEditReferrer(r)} style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', marginRight: '16px' }} title="Edit"><Edit2 size={14} /></button>
                        <button onClick={() => handleDeleteReferrer(r.referrer_id)} style={{ background: 'transparent', border: 'none', color: '#E11D48', cursor: 'pointer' }} title="Delete"><Trash2 size={14} /></button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* PANEL 4: DATABASE MAINTENANCE */}
        {activePanel === 'db' && (
          <div style={{ maxWidth: '600px', margin: '0 auto' }}>
            <div style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', padding: '30px 24px', borderRadius: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
                <Database size={24} style={{ color: 'var(--text-primary)' }} />
                <div>
                  <h3 style={{ fontSize: '18px', fontWeight: '600' }}>SQLite Database Maintenance</h3>
                  <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Perform database compression on server file</p>
                </div>
              </div>

              <div style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '16px', marginBottom: '24px' }}>
                <div style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Current File Size on Server Disk</div>
                <div style={{ fontSize: '32px', fontWeight: '700', marginTop: '6px', fontFamily: 'monospace' }}>{dbSize || 'Checking...'}</div>
              </div>

              {vacuumSuccess && (
                <div style={{ background: vacuumSuccess.includes('Error') ? 'rgba(225, 29, 72, 0.1)' : 'rgba(16, 185, 129, 0.08)', color: vacuumSuccess.includes('Error') ? '#E11D48' : '#10B981', padding: '12px 16px', borderRadius: '8px', border: '1px solid rgba(16, 185, 129, 0.15)', marginBottom: '24px', fontSize: '13px' }}>
                  {vacuumSuccess}
                </div>
              )}

              <button 
                onClick={handleVacuumDb} 
                disabled={isVacuuming}
                className="peakbtn"
                style={{ width: '100%', background: 'var(--text-primary)', color: 'var(--bg-primary)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
              >
                <RefreshCw size={16} className={isVacuuming ? 'bouncing' : ''} /> {isVacuuming ? 'Recompressing Database...' : 'Run SQLite VACUUM'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
