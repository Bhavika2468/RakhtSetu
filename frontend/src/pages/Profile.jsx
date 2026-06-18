import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { api } from '../api';

const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

export default function Profile({ logout, refreshUser }) {
  const { user } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({});
  const [donations, setDonations] = useState([]);
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [sosHistory, setSosHistory] = useState([]);
  const [tab, setTab] = useState('profile');

  useEffect(() => {
    if (user) {
      setForm({
        fullName: user.fullName || '',
        phone: user.phone || '',
        bloodGroup: user.bloodGroup || '',
        age: user.age || '',
        weight: user.weight || '',
        healthConditions: user.healthConditions || '',
      });
      Promise.all([
        api.getDonations().catch(() => []),
        api.getMyRequests().catch(() => []),
        api.getSosHistory().catch(() => [])
      ]).then(([d, r, s]) => {
        setDonations(d);
        setRequests(r);
        setSosHistory(s);
        setLoading(false);
      });
    }
  }, [user]);

  const handleSave = async () => {
    setSaving(true);
    try {
      await api.updateProfile(form);
      await refreshUser();
      setEditing(false);
    } catch {} finally { setSaving(false); }
  };

  const formatDate = (d) => new Date(d).toLocaleDateString();

  if (!user) return null;

  return (
    <div className="space-y-6 animate-fade-in max-w-3xl mx-auto">
      {/* Header */}
      <div className="glass p-6 text-center">
        <div className="w-20 h-20 rounded-full bg-accent-blue/20 flex items-center justify-center text-2xl font-bold text-accent-blue mx-auto mb-4 border-2 border-accent-blue/30">
          {user.fullName?.charAt(0)?.toUpperCase() || 'U'}
        </div>
        <h1 className="text-2xl font-bold text-text-primary">{user.fullName}</h1>
        <p className="text-text-secondary text-sm">{user.email}</p>
        <div className="flex items-center justify-center gap-2 mt-3">
          <span className="chip active text-xs">{user.bloodGroup || 'N/A'}</span>
          <span className="chip text-xs capitalize">{user.role}</span>
          {user.badges?.map((b, i) => (
            <span key={i} className="chip text-xs">{b === 'Verified' ? '✅' : '🏅'} {b}</span>
          ))}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-white/5 rounded-xl p-1 overflow-x-auto">
        {[
          { id: 'profile', label: '👤 Profile', desc: 'Personal info' },
          { id: 'donations', label: '🩸 Donations', desc: `${donations.length} total` },
          { id: 'requests', label: '📋 Requests', desc: `${requests.length} total` },
          { id: 'sos', label: '🚨 SOS', desc: `${sosHistory.length} alerts` },
          { id: 'settings', label: '⚙️ Settings', desc: 'Preferences' },
        ].map(t => (
          <button key={t.id} onClick={() => setTab(t.id)}
            className={`flex-1 px-3 py-2 rounded-lg text-center transition-all min-w-[80px] ${
              tab === t.id ? 'bg-accent-blue/10 text-accent-blue' : 'text-text-secondary hover:text-text-primary'
            }`}>
            <div className="text-xs font-semibold">{t.label}</div>
            <div className="text-[8px] opacity-70">{t.desc}</div>
          </button>
        ))}
      </div>

      {/* Profile Tab */}
      {tab === 'profile' && (
        <div className="glass p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-text-primary">Personal Information</h2>
            {!editing && <button onClick={() => setEditing(true)} className="text-accent-blue text-sm hover:underline">Edit</button>}
          </div>

          {editing ? (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-text-secondary mb-1">Full Name</label>
                  <input type="text" className="input-field text-sm" value={form.fullName} onChange={e => setForm(f => ({...f, fullName: e.target.value}))} />
                </div>
                <div>
                  <label className="block text-xs text-text-secondary mb-1">Phone</label>
                  <input type="text" className="input-field text-sm" value={form.phone} onChange={e => setForm(f => ({...f, phone: e.target.value}))} />
                </div>
                <div>
                  <label className="block text-xs text-text-secondary mb-1">Blood Group</label>
                  <div className="flex flex-wrap gap-1">
                    {BLOOD_GROUPS.map(bg => (
                      <button key={bg} onClick={() => setForm(f => ({...f, bloodGroup: bg}))}
                        className={`chip text-xs ${form.bloodGroup === bg ? 'active' : ''}`}>{bg}</button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-xs text-text-secondary mb-1">Age</label>
                  <input type="number" className="input-field text-sm" value={form.age} onChange={e => setForm(f => ({...f, age: e.target.value}))} />
                </div>
                <div>
                  <label className="block text-xs text-text-secondary mb-1">Weight (kg)</label>
                  <input type="number" className="input-field text-sm" value={form.weight} onChange={e => setForm(f => ({...f, weight: e.target.value}))} />
                </div>
              </div>
              <div>
                <label className="block text-xs text-text-secondary mb-1">Health Conditions</label>
                <input type="text" className="input-field text-sm" value={form.healthConditions} onChange={e => setForm(f => ({...f, healthConditions: e.target.value}))} />
              </div>
              <div className="flex gap-3">
                <button onClick={() => setEditing(false)} className="btn btn-ghost text-sm flex-1">Cancel</button>
                <button onClick={handleSave} disabled={saving} className="btn btn-primary text-sm flex-1">
                  {saving ? <div className="loading-dots flex"><span></span><span></span><span></span></div> : 'Save Changes'}
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              {[
                { label: 'Email', value: user.email },
                { label: 'Phone', value: user.phone || 'Not set' },
                { label: 'Blood Group', value: user.bloodGroup || 'Not set' },
                { label: 'Age', value: user.age || 'Not set' },
                { label: 'Weight', value: user.weight ? `${user.weight} kg` : 'Not set' },
                { label: 'Health', value: user.healthConditions || 'None' },
                { label: 'Role', value: user.role === 'donor' ? '🩸 Donor' : user.role === 'hospital' ? '🏥 Hospital' : '👤 Receiver' },
                ...(user.nextEligibleDate ? [{ label: 'Next Eligible', value: formatDate(user.nextEligibleDate) }] : [])
              ].map(item => (
                <div key={item.label} className="flex items-center justify-between py-2 border-b border-border-subtle last:border-0">
                  <span className="text-sm text-text-secondary">{item.label}</span>
                  <span className="text-sm text-text-primary font-medium">{item.value}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Donations Tab */}
      {tab === 'donations' && (
        <div className="space-y-3">
          {loading ? (
            <div className="glass p-6 text-center"><p className="text-text-secondary">Loading...</p></div>
          ) : donations.length === 0 ? (
            <div className="glass p-8 text-center"><div className="text-4xl mb-3">🩸</div><p className="text-text-secondary">No donations yet</p></div>
          ) : donations.map(d => (
            <div key={d.id} className="glass p-4 hover:border-accent-blue/40 transition-all">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-text-primary">{d.recipientName}</p>
                  <div className="flex items-center gap-2 mt-1 text-xs text-text-secondary">
                    <span className="chip active text-[10px]">{d.bloodGroup}</span>
                    <span>{d.units} unit{d.units > 1 ? 's' : ''}</span>
                    <span>📅 {formatDate(d.date)}</span>
                  </div>
                </div>
                <span className="chip good text-[10px]">Completed</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Requests Tab */}
      {tab === 'requests' && (
        <div className="space-y-3">
          {loading ? (
            <div className="glass p-6 text-center"><p className="text-text-secondary">Loading...</p></div>
          ) : requests.length === 0 ? (
            <div className="glass p-8 text-center"><div className="text-4xl mb-3">📋</div><p className="text-text-secondary">No requests yet</p></div>
          ) : requests.map(r => (
            <div key={r.id} className="glass p-4 hover:border-accent-blue/40 transition-all">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-text-primary">{r.bloodGroup} — {r.units} unit{r.units > 1 ? 's' : ''}</p>
                  <div className="flex items-center gap-2 mt-1 text-xs text-text-secondary">
                    <span>{r.hospitalName || 'Pending hospital'}</span>
                    <span>📅 {formatDate(r.createdAt)}</span>
                  </div>
                </div>
                <span className={`chip text-[10px] ${r.status === 'matched' ? 'active' : r.status === 'fulfilled' ? 'good' : ''}`}>
                  {r.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* SOS History Tab */}
      {tab === 'sos' && (
        <div className="space-y-3">
          {loading ? (
            <div className="glass p-6 text-center"><p className="text-text-secondary">Loading...</p></div>
          ) : sosHistory.length === 0 ? (
            <div className="glass p-8 text-center"><div className="text-4xl mb-3">🚨</div><p className="text-text-secondary">No SOS alerts</p></div>
          ) : sosHistory.map(s => (
            <div key={s.id} className="glass p-4 border-l-4 border-accent-red/30 hover:border-accent-blue/40 transition-all">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-text-primary">🚨 Emergency {s.bloodGroup}</p>
                  <div className="flex items-center gap-2 mt-1 text-xs text-text-secondary">
                    <span>📍 Donors notified: {s.donorsNotified}</span>
                    <span>🏥 {s.hospitalResponding || 'Pending'}</span>
                    <span>📅 {formatDate(s.createdAt)}</span>
                  </div>
                </div>
                <span className={`chip text-[10px] ${s.status === 'resolved' ? 'good' : 'low'}`}>{s.status}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Settings Tab */}
      {tab === 'settings' && (
        <div className="glass p-6 space-y-5">
          <h2 className="text-lg font-semibold text-text-primary">Settings</h2>

          <div className="flex items-center justify-between py-3">
            <div>
              <p className="text-sm font-medium text-text-primary">Dark Mode</p>
              <p className="text-xs text-text-secondary">Toggle theme</p>
            </div>
            <label className="toggle">
              <input type="checkbox" checked={isDark} onChange={toggleTheme} />
              <span className="toggle-slider"></span>
            </label>
          </div>

          <div className="flex items-center justify-between py-3 border-t border-border-subtle">
            <div>
              <p className="text-sm font-medium text-text-primary">Notifications</p>
              <p className="text-xs text-text-secondary">Receive emergency alerts</p>
            </div>
            <label className="toggle">
              <input type="checkbox" defaultChecked />
              <span className="toggle-slider"></span>
            </label>
          </div>

          <div className="border-t border-border-subtle pt-4">
            <button onClick={logout} className="btn btn-danger w-full text-sm">
              🚪 Sign Out
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
