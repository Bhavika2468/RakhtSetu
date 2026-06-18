import { v4 as uuidv4 } from 'uuid';
import bcrypt from 'bcryptjs';
import { initDB, insert, getAll } from './db.js';

const hospitalsData = [
  { name: 'AIIMS Delhi', address: 'Ansari Nagar, New Delhi', lat: 28.5672, lng: 77.2100, phone: '+91-11-26588500' },
  { name: 'Apollo Hospitals', address: 'Indraprastha, New Delhi', lat: 28.6068, lng: 77.2709, phone: '+91-11-26925858' },
  { name: 'Fortis Escorts', address: 'Okhla Road, New Delhi', lat: 28.5406, lng: 77.2805, phone: '+91-11-47135000' },
  { name: 'Max Saket', address: 'Saket, New Delhi', lat: 28.5297, lng: 77.2200, phone: '+91-11-26515050' },
  { name: 'Medanta Medicity', address: 'Gurugram', lat: 28.4615, lng: 77.0778, phone: '+91-124-4141414' },
  { name: 'Sir Ganga Ram', address: 'Rajinder Nagar, New Delhi', lat: 28.6405, lng: 77.1825, phone: '+91-11-42252000' },
  { name: 'BLK Hospital', address: 'Pusa Road, New Delhi', lat: 28.6430, lng: 77.1730, phone: '+91-11-30403040' },
  { name: 'Safdarjung Hospital', address: 'Safdarjung, New Delhi', lat: 28.5650, lng: 77.2000, phone: '+91-11-26165060' },
];

const bloodGroups = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
const donorNames = ['Arjun Sharma', 'Priya Patel', 'Rahul Verma', 'Sneha Reddy', 'Vikram Singh', 'Ananya Gupta', 'Rohit Joshi', 'Kavita Nair', 'Amit Khanna', 'Deepa Menon'];

function randomInt(min, max) { return Math.floor(Math.random() * (max - min + 1)) + min; }
function pick(arr) { return arr[randomInt(0, arr.length - 1)]; }

export function seedDatabase() {
  initDB();
  const existing = getAll('hospitals');
  if (existing.length > 0) {
    console.log('✅ Database already seeded, skipping');
    return;
  }

  const password = bcrypt.hashSync('password123', 10);

  // Seed hospitals
  for (const h of hospitalsData) {
    const inventory = {};
    for (const bg of bloodGroups) {
      inventory[bg] = { units: randomInt(0, 50), status: Math.random() > 0.3 ? 'available' : 'low' };
    }
    insert('hospitals', { id: `hosp-${uuidv4().slice(0, 8)}`, ...h, bloodInventory: inventory });
  }

  // Seed donor users
  for (let i = 0; i < donorNames.length; i++) {
    const name = donorNames[i];
    const email = name.toLowerCase().replace(' ', '.') + '@example.com';
    const bg = pick(bloodGroups);
    const donations = randomInt(1, 15);
    insert('users', {
      id: `user-${uuidv4().slice(0, 8)}`,
      fullName: name,
      email,
      phone: `+91-9${String(randomInt(100000000, 999999999))}`,
      password,
      role: 'donor',
      bloodGroup: bg,
      age: randomInt(21, 55),
      weight: Math.round((55 + Math.random() * 30) * 10) / 10,
      healthConditions: Math.random() > 0.7 ? 'None' : pick(['Mild allergy', 'None', 'None', 'None']),
      isAvailable: Math.random() > 0.3 ? 1 : 0,
      isVerified: 1,
      totalDonations: donations,
      livesSaved: Math.round(donations * 2.5 + Math.random() * 5),
      nextEligibleDate: new Date(Date.now() + randomInt(30, 120) * 86400000).toISOString().split('T')[0],
      badges: ['Verified', ...(donations > 5 ? ['Life Saver'] : [])],
      createdAt: new Date(Date.now() - randomInt(1, 365) * 86400000).toISOString()
    });
  }

  // Seed demo users
  insert('users', { id: 'demo-donor', fullName: 'Demo Donor', email: 'donor@demo.com', phone: '+91-9876543210', password, role: 'donor', bloodGroup: 'O+', age: 28, weight: 72, healthConditions: 'None', isAvailable: 1, isVerified: 1, totalDonations: 5, livesSaved: 12, nextEligibleDate: '2026-08-15', badges: ['Verified', 'Life Saver'], createdAt: new Date().toISOString() });
  insert('users', { id: 'demo-user', fullName: 'Demo User', email: 'user@demo.com', phone: '+91-9876543211', password, role: 'receiver', bloodGroup: 'B+', age: 30, weight: 65, healthConditions: 'None', isAvailable: 0, isVerified: 1, totalDonations: 0, livesSaved: 0, badges: [], createdAt: new Date().toISOString() });
  insert('users', { id: 'demo-hospital', fullName: 'Demo Hospital', email: 'hospital@demo.com', phone: '+91-9876543212', password, role: 'hospital', bloodGroup: null, age: null, weight: null, healthConditions: null, isAvailable: 0, isVerified: 1, totalDonations: 0, livesSaved: 0, badges: ['Verified'], createdAt: new Date().toISOString() });

  // Seed donations
  const donors = getAll('users').filter(u => u.role === 'donor');
  const hospitals = getAll('hospitals');
  for (const donor of donors) {
    const count = randomInt(1, 5);
    for (let i = 0; i < count; i++) {
      const daysAgo = randomInt(1, 365);
      const hospital = pick(hospitals);
      insert('donations', {
        id: `don-${uuidv4().slice(0, 8)}`,
        donorId: donor.id,
        recipientName: `Patient at ${hospital.name}`,
        bloodGroup: donor.bloodGroup,
        units: randomInt(1, 2),
        hospitalId: hospital.id,
        date: new Date(Date.now() - daysAgo * 86400000).toISOString()
      });
    }
  }

  // Seed alerts
  const users = getAll('users').slice(0, 5);
  const alertTemplates = [
    { type: 'match', title: 'Blood Match Found', description: 'We found O+ donors near you.' },
    { type: 'emergency', title: 'Emergency Alert', description: 'Urgent blood needed at AIIMS Delhi.' },
    { type: 'confirmation', title: 'Donation Confirmed', description: 'Your donation helped save a life.' },
    { type: 'info', title: 'Eligibility Update', description: 'You can donate again soon.' },
  ];
  for (const user of users) {
    for (const a of alertTemplates) {
      insert('alerts', {
        id: `alert-${uuidv4().slice(0, 8)}`,
        userId: user.id,
        type: a.type,
        title: a.title,
        description: a.description,
        isRead: Math.random() > 0.4 ? 1 : 0,
        relatedId: null,
        createdAt: new Date(Date.now() - randomInt(0, 14) * 86400000).toISOString()
      });
    }
  }

  console.log('✅ Database seeded successfully!');
}
