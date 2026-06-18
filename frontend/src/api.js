const API = '/api';

async function request(path, options = {}) {
  const token = localStorage.getItem('token');
  const headers = { 'Content-Type': 'application/json', ...options.headers };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(`${API}${path}`, { ...options, headers });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Request failed');
  return data;
}

export const api = {
  // Auth
  login: (email, password) => request('/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) }),
  signup: (data) => request('/auth/signup', { method: 'POST', body: JSON.stringify(data) }),
  googleLogin: (email, fullName) => request('/auth/google', { method: 'POST', body: JSON.stringify({ email, fullName }) }),
  sendOtp: (email) => request('/auth/send-otp', { method: 'POST', body: JSON.stringify({ email }) }),
  verifyOtp: (email, otp) => request('/auth/verify-otp', { method: 'POST', body: JSON.stringify({ email, otp }) }),
  quickAccess: () => request('/auth/quick-access', { method: 'POST' }),

  // Blood & Hospitals
  getBloodData: () => request('/blood-data'),
  getHospitals: () => request('/hospitals'),
  getDonors: () => request('/donors'),

  // Profile
  getProfile: () => request('/profile'),
  updateProfile: (data) => request('/profile', { method: 'PUT', body: JSON.stringify(data) }),
  toggleAvailability: () => request('/toggle-availability', { method: 'POST' }),

  // SOS
  triggerSos: (bloodGroup) => request('/sos', { method: 'POST', body: JSON.stringify({ bloodGroup }) }),
  getSos: (id) => request(`/sos/${id}`),
  getSosHistory: () => request('/sos-history'),

  // Requests
  requestBlood: (data) => request('/request-blood', { method: 'POST', body: JSON.stringify(data) }),
  getMyRequests: () => request('/my-requests'),

  // Alerts
  getAlerts: () => request('/alerts'),
  markAlertRead: (id) => request(`/alerts/${id}/read`, { method: 'POST' }),

  // Donations
  getDonations: () => request('/donations'),

  // Inventory
  updateInventory: (bloodGroup, units) => request('/inventory', { method: 'PUT', body: JSON.stringify({ bloodGroup, units }) }),
};
