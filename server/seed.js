import db from './db.js';
import bcrypt from 'bcryptjs';

console.log("Initializing database tables...");

db.transaction(() => {
  // Create campers table
  db.prepare(`
    CREATE TABLE IF NOT EXISTS campers (
      camper_id INTEGER PRIMARY KEY AUTOINCREMENT,
      first_name TEXT NOT NULL,
      last_name TEXT NOT NULL,
      birth_date TEXT NOT NULL,
      dietary_restrictions TEXT,
      medical_notes TEXT
    )
  `).run();

  // Create guardians table
  db.prepare(`
    CREATE TABLE IF NOT EXISTS guardians (
      guardian_id INTEGER PRIMARY KEY AUTOINCREMENT,
      first_name TEXT NOT NULL,
      last_name TEXT NOT NULL,
      email TEXT NOT NULL UNIQUE,
      phone TEXT NOT NULL
    )
  `).run();

  // Create camper_guardians join table
  db.prepare(`
    CREATE TABLE IF NOT EXISTS camper_guardians (
      camper_id INTEGER,
      guardian_id INTEGER,
      relationship TEXT NOT NULL,
      PRIMARY KEY (camper_id, guardian_id),
      FOREIGN KEY (camper_id) REFERENCES campers(camper_id) ON DELETE CASCADE,
      FOREIGN KEY (guardian_id) REFERENCES guardians(guardian_id) ON DELETE CASCADE
    )
  `).run();

  // Create sessions table
  db.prepare(`
    CREATE TABLE IF NOT EXISTS sessions (
      session_id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      start_date TEXT NOT NULL,
      end_date TEXT NOT NULL,
      capacity INTEGER NOT NULL,
      price REAL NOT NULL
    )
  `).run();

  // Create registrations table
  db.prepare(`
    CREATE TABLE IF NOT EXISTS registrations (
      registration_id INTEGER PRIMARY KEY AUTOINCREMENT,
      camper_id INTEGER,
      session_id INTEGER,
      registration_date TEXT NOT NULL,
      payment_status TEXT NOT NULL,
      FOREIGN KEY (camper_id) REFERENCES campers(camper_id) ON DELETE CASCADE,
      FOREIGN KEY (session_id) REFERENCES sessions(session_id) ON DELETE CASCADE
    )
  `).run();

  // Create referrers table
  db.prepare(`
    CREATE TABLE IF NOT EXISTS referrers (
      referrer_id INTEGER PRIMARY KEY AUTOINCREMENT,
      first_name TEXT NOT NULL,
      last_name TEXT NOT NULL,
      email TEXT NOT NULL UNIQUE,
      password_hash TEXT NOT NULL,
      institution TEXT NOT NULL,
      referrer_type TEXT NOT NULL,
      max_referrals INTEGER NOT NULL
    )
  `).run();

  // Create referrals table
  db.prepare(`
    CREATE TABLE IF NOT EXISTS referrals (
      referral_id INTEGER PRIMARY KEY AUTOINCREMENT,
      referrer_id INTEGER,
      camper_email TEXT NOT NULL,
      token_code TEXT NOT NULL UNIQUE,
      status TEXT NOT NULL DEFAULT 'Unused',
      created_at TEXT NOT NULL,
      FOREIGN KEY (referrer_id) REFERENCES referrers(referrer_id) ON DELETE CASCADE
    )
  `).run();
})();

console.log("Tables created successfully. Seeding initial records...");

// Insert initial camp sessions
const sessionCount = db.prepare("SELECT count(*) as count FROM sessions").get().count;
if (sessionCount === 0) {
  const insertSession = db.prepare("INSERT INTO sessions (title, start_date, end_date, capacity, price) VALUES (?, ?, ?, ?, ?)");
  insertSession.run("Advanced Algebra & Logic", "2026-07-06", "2026-07-17", 20, 150.0);
  insertSession.run("Number Theory & Cryptography", "2026-07-20", "2026-07-31", 20, 150.0);
  insertSession.run("Combinatorics & Coding", "2026-08-03", "2026-08-14", 15, 180.0);
  console.log("Mock sessions seeded.");
}

// Insert admin and referrer accounts
const referrerCount = db.prepare("SELECT count(*) as count FROM referrers").get().count;
if (referrerCount === 0) {
  const adminHash = bcrypt.hashSync("adminpassword", 10);
  const teacherHash = bcrypt.hashSync("teacherpassword", 10);

  const insertReferrer = db.prepare(`
    INSERT INTO referrers (first_name, last_name, email, password_hash, institution, referrer_type, max_referrals)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `);

  // Seed Admin Account
  insertReferrer.run("Camp", "Director", "admin@mathcamp.org", adminHash, "BDU Science College", "Admin", 0);

  // Seed Default Teacher Account
  insertReferrer.run("Solomon", "Kassa", "teacher@school.edu", teacherHash, "Bahir Dar Academy", "Teacher", 10);

  console.log("Admin and Teacher accounts seeded.");
}

// Seed default testing token if referrals is empty
const referralCount = db.prepare("SELECT count(*) as count FROM referrals").get().count;
if (referralCount === 0) {
  const teacherId = db.prepare("SELECT referrer_id FROM referrers WHERE email = ?").get("teacher@school.edu").referrer_id;
  
  db.prepare(`
    INSERT INTO referrals (referrer_id, camper_email, token_code, status, created_at)
    VALUES (?, ?, ?, ?, ?)
  `).run(teacherId, "camper@test.com", "TESTTOKEN123", "Unused", new Date().toISOString().split('T')[0]);

  console.log("Demo testing token TESTTOKEN123 seeded.");
}

console.log("Database initialized successfully!");
db.close();
