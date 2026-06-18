import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import { findOne, insert, update } from '../db.js';

const router = Router();
const JWT_SECRET = process.env.JWT_SECRET || 'rakhtsetu-secret-key-2026';
const OTP_STORE = new Map();

function sanitizeUser(user) {
  if (!user) return null;
  const { password, ...safe } = user;
  return safe;
}

function generateToken(user) {
  return jwt.sign({ id: user.id, email: user.email, role: user.role, fullName: user.fullName }, JWT_SECRET, { expiresIn: '7d' });
}

// Login
router.post('/login', (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ error: 'Email and password required' });

  const user = findOne('users', u => u.email === email);
  if (!user) return res.status(401).json({ error: 'Invalid credentials' });
  if (!bcrypt.compareSync(password, user.password)) return res.status(401).json({ error: 'Invalid credentials' });

  res.json({ token: generateToken(user), user: sanitizeUser(user) });
});

// Signup
router.post('/signup', (req, res) => {
  const { fullName, email, phone, password, role, bloodGroup, age, weight, healthConditions } = req.body;
  if (!fullName || !email || !password) return res.status(400).json({ error: 'Full name, email, and password required' });

  if (findOne('users', u => u.email === email)) return res.status(409).json({ error: 'Email already registered' });

  const user = {
    id: `user-${uuidv4().slice(0, 8)}`,
    fullName,
    email,
    phone: phone || null,
    password: bcrypt.hashSync(password, 10),
    role: role || 'receiver',
    bloodGroup: bloodGroup || null,
    age: age || null,
    weight: weight || null,
    healthConditions: healthConditions || null,
    isAvailable: 0,
    isVerified: 0,
    totalDonations: 0,
    livesSaved: 0,
    nextEligibleDate: null,
    badges: role === 'donor' ? ['Verified'] : [],
    createdAt: new Date().toISOString()
  };

  insert('users', user);
  res.status(201).json({ token: generateToken(user), user: sanitizeUser(user) });
});

// Google Login
router.post('/google', (req, res) => {
  const { email, fullName } = req.body;
  if (!email) return res.status(400).json({ error: 'Email required' });

  let user = findOne('users', u => u.email === email);
  if (!user) {
    user = {
      id: `user-${uuidv4().slice(0, 8)}`,
      fullName: fullName || email.split('@')[0],
      email,
      phone: null,
      password: bcrypt.hashSync(uuidv4(), 10),
      role: 'receiver',
      bloodGroup: null,
      age: null,
      weight: null,
      healthConditions: null,
      isAvailable: 0,
      isVerified: 0,
      totalDonations: 0,
      livesSaved: 0,
      nextEligibleDate: null,
      badges: [],
      createdAt: new Date().toISOString()
    };
    insert('users', user);
  }
  res.json({ token: generateToken(user), user: sanitizeUser(user) });
});

// Send OTP
router.post('/send-otp', (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ error: 'Email required' });
  const otp = String(Math.floor(100000 + Math.random() * 900000));
  OTP_STORE.set(email, { otp, expires: Date.now() + 300000 });
  console.log(`📧 OTP for ${email}: ${otp}`);
  res.json({ message: 'OTP sent successfully', otp });
});

// Verify OTP
router.post('/verify-otp', (req, res) => {
  const { email, otp } = req.body;
  if (!email || !otp) return res.status(400).json({ error: 'Email and OTP required' });
  const stored = OTP_STORE.get(email);
  if (!stored) return res.status(400).json({ error: 'No OTP sent' });
  if (Date.now() > stored.expires) { OTP_STORE.delete(email); return res.status(400).json({ error: 'OTP expired' }); }
  if (stored.otp !== otp) return res.status(400).json({ error: 'Invalid OTP' });
  OTP_STORE.delete(email);
  if (findOne('users', u => u.email === email)) update('users', findOne('users', u => u.email === email).id, { isVerified: 1 });
  res.json({ message: 'Verified successfully' });
});

// Emergency Quick Access
router.post('/quick-access', (req, res) => {
  const user = {
    id: `guest-${uuidv4().slice(0, 8)}`,
    fullName: 'Guest User',
    email: `guest-${uuidv4().slice(0, 6)}@rakhtsetu.com`,
    phone: null,
    password: bcrypt.hashSync('guest', 10),
    role: 'receiver',
    bloodGroup: null,
    age: null,
    weight: null,
    healthConditions: null,
    isAvailable: 0,
    isVerified: 0,
    totalDonations: 0,
    livesSaved: 0,
    nextEligibleDate: null,
    badges: [],
    createdAt: new Date().toISOString()
  };
  insert('users', user);
  res.json({ token: generateToken(user), user: sanitizeUser(user), sosToken: true });
});

export default router;
