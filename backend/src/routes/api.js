import { Router } from 'express';
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import { getAll, getById, findOne, findBy, insert, update } from '../db.js';

const router = Router();
const JWT_SECRET = process.env.JWT_SECRET || 'rakhtsetu-secret-key-2026';

function authMiddleware(req, res, next) {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) return res.status(401).json({ error: 'No token provided' });
  try {
    req.user = jwt.verify(header.split(' ')[1], JWT_SECRET);
    next();
  } catch { return res.status(401).json({ error: 'Invalid token' }); }
}

const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

// Blood data summary
router.get('/blood-data', (req, res) => {
  const hospitals = getAll('hospitals');
  const summary = BLOOD_GROUPS.map(bg => {
    let totalUnits = 0, availableCount = 0, totalHospitals = 0;
    for (const h of hospitals) {
      const inv = h.bloodInventory || {};
      if (inv[bg]) {
        totalUnits += inv[bg].units || 0;
        if (inv[bg].status === 'available') availableCount++;
        totalHospitals++;
      }
    }
    let status = 'low';
    if (totalUnits > 30) status = 'good';
    else if (totalUnits > 10) status = 'medium';
    return { group: bg, units: totalUnits, status, hospitals: totalHospitals, availableAt: availableCount };
  });
  res.json(summary);
});

// Hospitals
router.get('/hospitals', (req, res) => {
  const hospitals = getAll('hospitals').map(h => ({
    ...h,
    distance: (Math.random() * 15 + 0.5).toFixed(1)
  }));
  res.json(hospitals);
});

// Donors
router.get('/donors', authMiddleware, (req, res) => {
  const donors = getAll('users').filter(u => u.role === 'donor').map(d => ({
    id: d.id, fullName: d.fullName, bloodGroup: d.bloodGroup,
    isAvailable: d.isAvailable, totalDonations: d.totalDonations,
    badges: d.badges || [],
    distance: (Math.random() * 10 + 0.3).toFixed(1)
  }));
  res.json(donors);
});

// Profile
router.get('/profile', authMiddleware, (req, res) => {
  const user = getById('users', req.user.id);
  if (!user) return res.status(404).json({ error: 'User not found' });
  const { password, ...safe } = user;
  safe.donations = getAll('donations').filter(d => d.donorId === user.id).sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 10);
  safe.alerts = getAll('alerts').filter(a => a.userId === user.id).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 20);
  safe.activeSos = findBy('sosAlerts', s => s.userId === user.id && s.status !== 'resolved').sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))[0] || null;
  res.json(safe);
});

// Update profile
router.put('/profile', authMiddleware, (req, res) => {
  const allowed = ['fullName', 'phone', 'bloodGroup', 'age', 'weight', 'healthConditions'];
  const updates = {};
  for (const key of allowed) {
    if (req.body[key] !== undefined) updates[key] = req.body[key];
  }
  if (Object.keys(updates).length === 0) return res.status(400).json({ error: 'No fields to update' });

  const user = update('users', req.user.id, updates);
  if (!user) return res.status(404).json({ error: 'User not found' });
  const { password, ...safe } = user;
  res.json(safe);
});

// Toggle availability
router.post('/toggle-availability', authMiddleware, (req, res) => {
  const user = getById('users', req.user.id);
  if (!user) return res.status(404).json({ error: 'User not found' });
  const newStatus = user.isAvailable ? 0 : 1;
  update('users', req.user.id, { isAvailable: newStatus });
  res.json({ isAvailable: !!newStatus });
});

// SOS Alert
router.post('/sos', authMiddleware, (req, res) => {
  const { bloodGroup, lat, lng } = req.body;
  const user = getById('users', req.user.id);
  if (!user) return res.status(404).json({ error: 'User not found' });

  const bg = bloodGroup || user.bloodGroup || 'O+';
  const sosId = `sos-${uuidv4().slice(0, 8)}`;

  const sos = {
    id: sosId, userId: req.user.id, bloodGroup: bg,
    lat: lat || 28.6, lng: lng || 77.2,
    status: 'active', donorsNotified: 0, hospitalResponding: null,
    createdAt: new Date().toISOString()
  };
  insert('sosAlerts', sos);

  const matchingDonors = getAll('users').filter(u => u.role === 'donor' && u.isAvailable && u.bloodGroup === bg);
  for (const donor of matchingDonors) {
    insert('alerts', {
      id: `alert-${uuidv4().slice(0, 8)}`, userId: donor.id, type: 'emergency',
      title: '🚨 Emergency Blood Needed!',
      description: `${user.fullName} needs ${bg} blood urgently near you. Please respond.`,
      isRead: 0, relatedId: sosId,
      createdAt: new Date().toISOString()
    });
  }

  const hospitals = getAll('hospitals');
  const nearest = hospitals[Math.floor(Math.random() * hospitals.length)];
  if (nearest) {
    update('sosAlerts', sosId, {
      donorsNotified: matchingDonors.length,
      hospitalResponding: nearest.name,
      status: 'responding'
    });
  }

  insert('alerts', {
    id: `alert-${uuidv4().slice(0, 8)}`, userId: req.user.id, type: 'emergency',
    title: 'SOS Alert Sent',
    description: `${matchingDonors.length} donors notified. ${nearest?.name || 'Searching for hospital'} is responding.`,
    isRead: 0, relatedId: sosId,
    createdAt: new Date().toISOString()
  });

  const saved = getById('sosAlerts', sosId);
  res.status(201).json(saved);
});

// Get SOS
router.get('/sos/:id', authMiddleware, (req, res) => {
  const sos = getById('sosAlerts', req.params.id);
  if (!sos) return res.status(404).json({ error: 'SOS not found' });
  res.json(sos);
});

// SOS history
router.get('/sos-history', authMiddleware, (req, res) => {
  const alerts = findBy('sosAlerts', s => s.userId === req.user.id).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  res.json(alerts);
});

// Request blood
router.post('/request-blood', authMiddleware, (req, res) => {
  const { bloodGroup, units, hospitalId, urgency } = req.body;
  if (!bloodGroup) return res.status(400).json({ error: 'Blood group required' });

  let hospital = null;
  if (hospitalId) {
    hospital = getById('hospitals', hospitalId);
  } else {
    const hospitals = getAll('hospitals');
    for (const h of hospitals) {
      const inv = h.bloodInventory || {};
      if (inv[bloodGroup] && inv[bloodGroup].units > 0) { hospital = h; break; }
    }
    if (!hospital && hospitals.length > 0) hospital = hospitals[0];
  }

  const request = {
    id: `req-${uuidv4().slice(0, 8)}`,
    userId: req.user.id, bloodGroup, units: units || 1,
    hospitalId: hospital?.id || null, hospitalName: hospital?.name || null, hospitalAddress: hospital?.address || null,
    status: hospital ? 'matched' : 'pending', urgency: urgency || 'normal',
    createdAt: new Date().toISOString()
  };
  insert('bloodRequests', request);

  insert('alerts', {
    id: `alert-${uuidv4().slice(0, 8)}`, userId: req.user.id,
    type: hospital ? 'match' : 'info',
    title: hospital ? 'Blood Match Found!' : 'Request Submitted',
    description: hospital ? `${bloodGroup} available at ${hospital.name}. Proceed to collect.` : `Searching for ${bloodGroup} donors near you.`,
    isRead: 0, relatedId: request.id,
    createdAt: new Date().toISOString()
  });

  res.status(201).json(request);
});

// My requests
router.get('/my-requests', authMiddleware, (req, res) => {
  const requests = findBy('bloodRequests', r => r.userId === req.user.id).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  res.json(requests);
});

// Alerts
router.get('/alerts', authMiddleware, (req, res) => {
  const alerts = findBy('alerts', a => a.userId === req.user.id).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 50);
  res.json(alerts);
});

// Mark alert read
router.post('/alerts/:id/read', authMiddleware, (req, res) => {
  const alert = getById('alerts', req.params.id);
  if (!alert || alert.userId !== req.user.id) return res.status(404).json({ error: 'Alert not found' });
  update('alerts', req.params.id, { isRead: 1 });
  res.json({ success: true });
});

// Update inventory
router.put('/inventory', authMiddleware, (req, res) => {
  const { bloodGroup, units } = req.body;
  if (!bloodGroup || units === undefined) return res.status(400).json({ error: 'Blood group and units required' });
  const hospitals = getAll('hospitals');
  if (hospitals.length === 0) return res.status(404).json({ error: 'No hospitals found' });
  const hospital = hospitals[0];
  const inv = { ...(hospital.bloodInventory || {}) };
  if (!inv[bloodGroup]) inv[bloodGroup] = { units: 0, status: 'available' };
  inv[bloodGroup].units = Math.max(0, (inv[bloodGroup].units || 0) + units);
  inv[bloodGroup].status = inv[bloodGroup].units > 0 ? 'available' : 'low';
  update('hospitals', hospital.id, { bloodInventory: inv });
  res.json({ success: true, inventory: inv[bloodGroup] });
});

// Donations
router.get('/donations', authMiddleware, (req, res) => {
  const donations = getAll('donations').filter(d => d.donorId === req.user.id).sort((a, b) => new Date(b.date) - new Date(a.date));
  res.json(donations);
});

export { router as default, authMiddleware };
