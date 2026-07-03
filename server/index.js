import express from 'express';
import cors from 'cors';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import db from './db.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dbPath = path.resolve(__dirname, '../camp.db');

const app = express();
const PORT = 3001; // Backend API server runs on port 3001

app.use(cors());
app.use(express.json());

// Helper transaction executor
const executeTx = (fn) => {
  const transaction = db.transaction(fn);
  return transaction();
};

/* ==========================================
   PUBLIC REGISTRATION ROUTES
   ========================================== */

// Validate a referral token code
app.get('/api/referrals/validate', (req, res) => {
  const { token } = req.query;
  if (!token) {
    return res.status(400).json({ error: 'Token parameter is required' });
  }

  try {
    const referral = db.prepare(`
      SELECT r.*, ref.first_name as ref_first, ref.last_name as ref_last, ref.institution
      FROM referrals r
      JOIN referrers ref ON r.referrer_id = ref.referrer_id
      WHERE r.token_code = ?
    `).get(token);

    if (!referral) {
      return res.status(404).json({ error: 'Referral token not found' });
    }

    if (referral.status !== 'Unused') {
      return res.status(400).json({ error: `This referral link has already been ${referral.status.toLowerCase()}` });
    }

    // Return validator info
    res.json({
      token_code: referral.token_code,
      camper_email: referral.camper_email,
      referrer_name: `${referral.ref_first} ${referral.ref_last}`,
      institution: referral.institution
    });
  } catch (err) {
    res.status(500).json({ error: 'Database query failure' });
  }
});

// Submit a camper registration using a token
app.post('/api/register', (req, res) => {
  const { 
    token_code,
    guardian_first_name, guardian_last_name, guardian_email, guardian_phone,
    camper_first_name, camper_last_name, camper_birth_date, camper_dietary, camper_medical,
    relationship,
    session_id
  } = req.body;

  if (!token_code || !guardian_email || !camper_first_name || !session_id) {
    return res.status(400).json({ error: 'Missing required registration details' });
  }

  try {
    // 1. Validate token
    const referral = db.prepare("SELECT * FROM referrals WHERE token_code = ?").get(token_code);
    if (!referral) {
      return res.status(404).json({ error: 'Token not found' });
    }
    if (referral.status !== 'Unused') {
      return res.status(400).json({ error: 'This token has already been used' });
    }

    // 2. Check session capacity
    const session = db.prepare("SELECT * FROM sessions WHERE session_id = ?").get(session_id);
    if (!session) {
      return res.status(404).json({ error: 'Session not found' });
    }

    const regCount = db.prepare("SELECT count(*) as count FROM registrations WHERE session_id = ?").get(session_id).count;
    if (regCount >= session.capacity) {
      return res.status(400).json({ error: 'This session is currently at capacity limit' });
    }

    // 3. Process Transaction
    executeTx(() => {
      // Find or insert guardian
      let guardian = db.prepare("SELECT guardian_id FROM guardians WHERE email = ?").get(guardian_email);
      let guardianId;
      
      if (guardian) {
        guardianId = guardian.guardian_id;
        db.prepare("UPDATE guardians SET first_name = ?, last_name = ?, phone = ? WHERE guardian_id = ?")
          .run(guardian_first_name, guardian_last_name, guardian_phone, guardianId);
      } else {
        const info = db.prepare("INSERT INTO guardians (first_name, last_name, email, phone) VALUES (?, ?, ?, ?)")
          .run(guardian_first_name, guardian_last_name, guardian_email, guardian_phone);
        guardianId = info.lastInsertRowid;
      }

      // Insert Camper
      const camperInfo = db.prepare("INSERT INTO campers (first_name, last_name, birth_date, dietary_restrictions, medical_notes) VALUES (?, ?, ?, ?, ?)")
        .run(camper_first_name, camper_last_name, camper_birth_date, camper_dietary, camper_medical);
      const camperId = camperInfo.lastInsertRowid;

      // Map relationship
      db.prepare("INSERT INTO camper_guardians (camper_id, guardian_id, relationship) VALUES (?, ?, ?)")
        .run(camperId, guardianId, relationship);

      // Create Registration
      db.prepare("INSERT INTO registrations (camper_id, session_id, registration_date, payment_status) VALUES (?, ?, ?, ?)")
        .run(camperId, session_id, new Date().toISOString().split('T')[0], 'Pending');

      // Claim Token
      db.prepare("UPDATE referrals SET status = 'Claimed' WHERE referral_id = ?").run(referral.referral_id);
    });

    res.json({ success: true, message: 'Camper registered successfully!' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to complete registration transaction' });
  }
});


/* ==========================================
   REFERRER PORTAL ROUTES
   ========================================== */

// Referrer/Admin Login
app.post('/api/referrer/login', (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }

  try {
    const user = db.prepare("SELECT * FROM referrers WHERE email = ?").get(email);
    if (!user || !bcrypt.compareSync(password, user.password_hash)) {
      return res.status(401).json({ error: 'Invalid email credentials' });
    }

    res.json({
      referrer_id: user.referrer_id,
      first_name: user.first_name,
      last_name: user.last_name,
      email: user.email,
      referrer_type: user.referrer_type,
      max_referrals: user.max_referrals
    });
  } catch (err) {
    res.status(500).json({ error: 'Login verification failed' });
  }
});

// Referrer dashboard info
app.get('/api/referrer/dashboard', (req, res) => {
  const { referrer_id } = req.query;
  if (!referrer_id) {
    return res.status(400).json({ error: 'referrer_id is required' });
  }

  try {
    const referrer = db.prepare("SELECT * FROM referrers WHERE referrer_id = ?").get(referrer_id);
    if (!referrer) {
      return res.status(404).json({ error: 'Referrer profile not found' });
    }

    const referralsList = db.prepare("SELECT * FROM referrals WHERE referrer_id = ? ORDER BY created_at DESC").all(referrer_id);
    
    res.json({
      referrer,
      referrals: referralsList
    });
  } catch (err) {
    res.status(500).json({ error: 'Dashboard load failure' });
  }
});

// Create new referral token
app.post('/api/referrer/referral', (req, res) => {
  const { referrer_id, camper_email } = req.body;
  if (!referrer_id || !camper_email) {
    return res.status(400).json({ error: 'Missing referrer_id or camper_email' });
  }

  try {
    const referrer = db.prepare("SELECT * FROM referrers WHERE referrer_id = ?").get(referrer_id);
    if (!referrer) {
      return res.status(404).json({ error: 'Referrer profile not found' });
    }

    const existingCount = db.prepare("SELECT count(*) as count FROM referrals WHERE referrer_id = ?").get(referrer_id).count;
    if (existingCount >= referrer.max_referrals) {
      return res.status(400).json({ error: 'Referral slots quota limit reached' });
    }

    // Generate secure random alphanumeric token (12 chars hex)
    const token = crypto.randomBytes(6).toString('hex').toUpperCase();

    db.prepare(`
      INSERT INTO referrals (referrer_id, camper_email, token_code, status, created_at)
      VALUES (?, ?, ?, ?, ?)
    `).run(referrer_id, camper_email, token, 'Unused', new Date().toISOString().split('T')[0]);

    // Simulate sending mail by returning invite registration url
    const registrationUrl = `http://localhost:5173/register?token=${token}`;

    res.json({
      success: true,
      token,
      camper_email,
      registrationUrl,
      message: 'Invitation link generated and simulated successfully!'
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to insert referral record' });
  }
});


/* ==========================================
   ADMIN PORTAL OPERATIONS
   ========================================== */

// Overview analytics metrics
app.get('/api/admin/overview', (req, res) => {
  try {
    const totalRegs = db.prepare("SELECT count(*) as count FROM registrations").get().count;
    const totalUnusedReferrals = db.prepare("SELECT count(*) as count FROM referrals WHERE status = 'Unused'").get().count;
    
    const sessionDetails = db.prepare(`
      SELECT s.*, count(r.registration_id) as filled
      FROM sessions s
      LEFT JOIN registrations r ON s.session_id = r.session_id
      GROUP BY s.session_id
    `).all();

    res.json({
      totalRegs,
      totalUnusedReferrals,
      sessions: sessionDetails
    });
  } catch (err) {
    res.status(500).json({ error: 'Metrics loading failed' });
  }
});

// View all sessions
app.get('/api/admin/sessions', (req, res) => {
  try {
    const list = db.prepare("SELECT * FROM sessions").all();
    res.json(list);
  } catch (err) {
    res.status(500).json({ error: 'Sessions load failed' });
  }
});

// Get session roster list
app.get('/api/admin/sessions/:id/roster', (req, res) => {
  const { id } = req.params;
  try {
    const roster = db.prepare(`
      SELECT c.*, r.registration_date, r.payment_status, g.first_name as g_first, g.last_name as g_last, g.email as g_email, g.phone as g_phone
      FROM campers c
      JOIN registrations r ON c.camper_id = r.camper_id
      JOIN camper_guardians cg ON c.camper_id = cg.camper_id
      JOIN guardians g ON cg.guardian_id = g.guardian_id
      WHERE r.session_id = ?
    `).all(id);
    res.json(roster);
  } catch (err) {
    res.status(500).json({ error: 'Roster load failure' });
  }
});

// Update session capacity limit
app.put('/api/admin/sessions/:id/capacity', (req, res) => {
  const { id } = req.params;
  const { capacity } = req.body;
  
  if (capacity === undefined || capacity < 0) {
    return res.status(400).json({ error: 'Invalid capacity value' });
  }

  try {
    db.prepare("UPDATE sessions SET capacity = ? WHERE session_id = ?").run(capacity, id);
    res.json({ success: true, message: 'Capacity limit updated successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Capacity update failed' });
  }
});

// CRUD: Retrieve all referrers (excluding Admin)
app.get('/api/admin/referrers', (req, res) => {
  try {
    const list = db.prepare("SELECT referrer_id, first_name, last_name, email, institution, referrer_type, max_referrals FROM referrers WHERE referrer_type != 'Admin'").all();
    res.json(list);
  } catch (err) {
    res.status(500).json({ error: 'Referrers retrieve failure' });
  }
});

// CRUD: Create new referrer
app.post('/api/admin/referrers', (req, res) => {
  const { first_name, last_name, email, password, institution, referrer_type, max_referrals } = req.body;
  if (!first_name || !last_name || !email || !password || !max_referrals) {
    return res.status(400).json({ error: 'Missing required referrer details' });
  }

  try {
    const hash = bcrypt.hashSync(password, 10);
    db.prepare(`
      INSERT INTO referrers (first_name, last_name, email, password_hash, institution, referrer_type, max_referrals)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).run(first_name, last_name, email, hash, institution || 'Unknown', referrer_type || 'Teacher', max_referrals);
    
    res.json({ success: true, message: 'Referrer created successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Email already exists or database insertion error' });
  }
});

// CRUD: Update referrer info
app.put('/api/admin/referrers/:id', (req, res) => {
  const { id } = req.params;
  const { first_name, last_name, email, institution, referrer_type, max_referrals, password } = req.body;

  try {
    if (password) {
      const hash = bcrypt.hashSync(password, 10);
      db.prepare(`
        UPDATE referrers 
        SET first_name = ?, last_name = ?, email = ?, password_hash = ?, institution = ?, referrer_type = ?, max_referrals = ?
        WHERE referrer_id = ?
      `).run(first_name, last_name, email, hash, institution, referrer_type, max_referrals, id);
    } else {
      db.prepare(`
        UPDATE referrers 
        SET first_name = ?, last_name = ?, email = ?, institution = ?, referrer_type = ?, max_referrals = ?
        WHERE referrer_id = ?
      `).run(first_name, last_name, email, institution, referrer_type, max_referrals, id);
    }
    res.json({ success: true, message: 'Referrer updated successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update referrer record' });
  }
});

// CRUD: Delete referrer
app.delete('/api/admin/referrers/:id', (req, res) => {
  const { id } = req.params;
  try {
    db.prepare("DELETE FROM referrers WHERE referrer_id = ?").run(id);
    res.json({ success: true, message: 'Referrer deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete referrer' });
  }
});

// Database maintenance tool (Vacuum & size check)
app.post('/api/admin/db/vacuum', (req, res) => {
  try {
    db.prepare('VACUUM').run();
    
    // Read stats from file system
    const stats = fs.statSync(dbPath);
    const sizeInBytes = stats.size;
    const sizeInMB = (sizeInBytes / (1024 * 1024)).toFixed(3);

    res.json({
      success: true,
      sizeBytes: sizeInBytes,
      sizeMB: `${sizeInMB} MB`
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Vacuum operation failed' });
  }
});

app.listen(PORT, () => {
  console.log(`Backend server listening on http://localhost:${PORT}`);
});
