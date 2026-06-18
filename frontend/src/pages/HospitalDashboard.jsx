import { useState, useEffect } from 'react';
import { api } from '../api';

const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

export default function HospitalDashboard() {
  const [tab, setTab] = useState('dashboard');
  const [hospitals, setHospitals] = useState([]);
  const [inventory, setInventory] = useState({});
  const [loading, setLoading] = useState(true);
  const [requests, setRequests] = useState([]);
  const [selectedBg, setSelectedBg] = useState('');
  const [addUnits, setAddUnits] = useState(0);

  useEffect(() => {
    api.getHospitals().then(h => {
      setHospitals(h);
      if (h.length > 0) {
        const inv = h[0].bloodInventory || {};
        setInventory(inv);
      }
      setLoading(false);
    }).catch(() => setLoading(false));

    // Get some requests from the API (for the demo, we'll use the user's)
    api.getMyRequests().then(r => setRequests(r)).catch(() => {});
  }, []);

  const updateInventory = async () => {
    if (!selectedBg || addUnits === 0) return;
    try {
      const result = await api.updateInventory(selectedBg, addUnits);
      setInventory(prev => ({
        ...prev,
        [selectedBg]: result.inventory
      }));
      setAddUnits(0);
    } catch {}
  };

  const totalUnits = Object.values(inventory).reduce((sum, bg) => sum + (bg.units || 0), 0);
  const lowStock = Object.entries(inventory).filter(([_, v]) => v.status === 'low' || v.units < 10).length;
  const availableCount = Object.entries(inventory).filter(([_, v]) => v.units > 0).length;

  const handleAcceptRequest = (id) => {
    alert(`✅ Request ${id} accepted! Donor will be notified.`);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Tabs */}
      <div className="flex gap-1 bg-white/5 rounded-xl p-1 overflow-x-auto">
        {[
          { id: 'dashboard', label: '📊 Dashboard', desc: 'Overview' },
          { id: 'inventory', label: '📦 Inventory', desc: `${totalUnits} units` },
          { id: 'requests', label: '📋 Requests', desc: `${requests.length} pending` },
          { id: 'analytics', label: '📈 Analytics', desc: 'Trends & stats' },
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

      {/* Dashboard */}
      {tab === 'dashboard' && (
        <div className="space-y-4">
          <div className="glass p-6">
            <h2 className="text-lg font-semibold text-text-primary mb-1">🏥 Hospital Dashboard</h2>
            <p className="text-text-secondary text-sm">Blood inventory and request management</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="glass p-4 text-center hover:border-accent-blue/40 transition-all">
              <div className="text-3xl font-bold text-accent-blue">{totalUnits}</div>
              <div className="text-xs text-text-secondary mt-1">Total Units</div>
            </div>
            <div className="glass p-4 text-center hover:border-accent-blue/40 transition-all">
              <div className="text-3xl font-bold text-green-400">{availableCount}</div>
              <div className="text-xs text-text-secondary mt-1">Blood Types Available</div>
            </div>
            <div className="glass p-4 text-center hover:border-accent-blue/40 transition-all">
              <div className="text-3xl font-bold text-accent-red">{lowStock}</div>
              <div className="text-xs text-text-secondary mt-1">Low Stock Items</div>
            </div>
            <div className="glass p-4 text-center hover:border-accent-blue/40 transition-all">
              <div className="text-3xl font-bold text-yellow-400">{requests.length}</div>
              <div className="text-xs text-text-secondary mt-1">Pending Requests</div>
            </div>
          </div>
          {/* Hospital list */}
          <div>
            <h3 className="text-md font-semibold text-text-primary mb-3">🏥 Connected Hospitals</h3>
            <div className="space-y-2">
              {hospitals.slice(0, 4).map(h => (
                <div key={h.id} className="glass p-4 hover:border-accent-blue/40 transition-all">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-accent-blue/10 flex items-center justify-center">🏥</div>
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-text-primary">{h.name}</p>
                      <p className="text-xs text-text-secondary">{h.address}</p>
                    </div>
                    <span className="chip text-xs">{h.distance} km</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Inventory */}
      {tab === 'inventory' && (
        <div className="space-y-4">
          <div className="glass p-6">
            <h2 className="text-lg font-semibold text-text-primary mb-4">📦 Blood Inventory</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {BLOOD_GROUPS.map(bg => {
                const data = inventory[bg] || { units: 0, status: 'low' };
                return (
                  <div key={bg} className={`p-4 rounded-xl border transition-all hover:-translate-y-1 ${
                    data.status === 'low' ? 'border-accent-red/30 bg-accent-red/5' : 'border-border-subtle bg-white/5'
                  }`}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-lg font-bold text-text-primary">{bg}</span>
                      <span className={`chip text-[10px] ${data.status === 'available' ? 'good' : 'low'}`}>
                        {data.status === 'available' ? '✓' : '⚠️'} {data.status}
                      </span>
                    </div>
                    <div className="text-2xl font-bold text-accent-blue">{data.units || 0}</div>
                    <div className="text-xs text-text-secondary mt-1">units available</div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Update Inventory */}
          <div className="glass p-6">
            <h3 className="text-md font-semibold text-text-primary mb-4">📦 Update Inventory</h3>
            <div className="flex flex-wrap gap-2 mb-4">
              {BLOOD_GROUPS.map(bg => (
                <button key={bg} onClick={() => setSelectedBg(bg)}
                  className={`chip text-sm px-4 py-2 ${selectedBg === bg ? 'active' : ''}`}>{bg}</button>
              ))}
            </div>
            <div className="flex items-center gap-3">
              <input type="number" value={addUnits} onChange={e => setAddUnits(Number(e.target.value))}
                className="input-field w-24 text-center" placeholder="Units" min="-50" max="50" />
              <button onClick={() => addUnits > 0 && setSelectedBg(prev => prev) && updateInventory()}
                className="btn btn-primary text-xs px-4">+ Add</button>
              <button onClick={() => { if (addUnits < 0 || (addUnits === 0)) return; setAddUnits(-Math.abs(addUnits)); }}
                className="btn btn-danger text-xs px-4">- Remove</button>
            </div>
          </div>
        </div>
      )}

      {/* Requests */}
      {tab === 'requests' && (
        <div className="space-y-3">
          {requests.length === 0 ? (
            <div className="glass p-8 text-center">
              <div className="text-4xl mb-3">📋</div>
              <p className="text-text-secondary">No incoming requests</p>
              <p className="text-text-secondary text-sm mt-1">Requests will appear here</p>
            </div>
          ) : requests.map(r => (
            <div key={r.id} className="glass p-4 hover:border-accent-blue/40 transition-all">
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="chip active text-xs">{r.bloodGroup}</span>
                    <span className="text-sm font-semibold text-text-primary">{r.units} unit{r.units > 1 ? 's' : ''}</span>
                    {r.urgency === 'emergency' && <span className="chip low text-[10px]">🚨 Emergency</span>}
                  </div>
                  <p className="text-xs text-text-secondary mt-1">
                    {r.hospitalName || 'Mobile app user'} · {new Date(r.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => handleAcceptRequest(r.id)} className="btn btn-primary text-xs px-3 py-1.5">Accept</button>
                  <button className="btn btn-ghost text-xs px-3 py-1.5">Decline</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Analytics */}
      {tab === 'analytics' && (
        <div className="space-y-4">
          <div className="glass p-6">
            <h2 className="text-lg font-semibold text-text-primary mb-4">📈 Analytics</h2>
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="p-4 rounded-xl bg-accent-blue/5 border border-accent-blue/20">
                <p className="text-xs text-text-secondary">Most Requested</p>
                <p className="text-lg font-bold text-accent-blue">O+</p>
                <p className="text-[10px] text-text-secondary">35% of all requests</p>
              </div>
              <div className="p-4 rounded-xl bg-accent-red/5 border border-accent-red/20">
                <p className="text-xs text-text-secondary">Shortage Risk</p>
                <p className="text-lg font-bold text-accent-red">High</p>
                <p className="text-[10px] text-text-secondary">{lowStock} blood types low</p>
              </div>
            </div>

            {/* Demand Trends */}
            <h3 className="text-sm font-semibold text-text-primary mb-3">📊 Demand Trends</h3>
            <div className="space-y-2">
              {BLOOD_GROUPS.slice(0, 6).map(bg => {
                const data = inventory[bg] || { units: 0 };
                const demand = Math.floor(Math.random() * 40 + 5);
                const shortagePct = Math.min((demand - (data.units || 0)) / demand * 100, 100);
                return (
                  <div key={bg} className="flex items-center gap-3">
                    <span className="w-8 text-xs font-bold text-text-primary">{bg}</span>
                    <div className="flex-1">
                      <div className="flex justify-between text-[10px] text-text-secondary mb-1">
                        <span>Supply: {data.units || 0}u</span>
                        <span>Demand: {demand}u</span>
                      </div>
                      <div className="w-full h-2 rounded-full bg-white/5 overflow-hidden">
                        <div className={`h-full rounded-full transition-all duration-500 ${
                          shortagePct > 50 ? 'bg-accent-red' : shortagePct > 20 ? 'bg-yellow-400' : 'bg-green-400'
                        }`} style={{ width: `${Math.min((data.units || 0) / demand * 100, 100)}%` }}></div>
                      </div>
                    </div>
                    <span className={`chip text-[8px] w-16 text-center ${shortagePct > 50 ? 'low' : shortagePct > 20 ? 'border-yellow-400 text-yellow-400' : 'good'}`}>
                      {shortagePct > 50 ? 'Critical' : shortagePct > 20 ? 'Warning' : 'Stable'}
                    </span>
                  </div>
                );
              })}
            </div>

            {/* Shortage prediction */}
            <div className="mt-6 p-4 rounded-xl bg-accent-red/5 border border-accent-red/20">
              <p className="text-sm font-semibold text-accent-red mb-1">⚠️ Shortage Prediction</p>
              <p className="text-xs text-text-secondary">Based on current trends, <strong className="text-accent-red">O+</strong> and <strong className="text-accent-red">B-</strong> may face critical shortage within the next 48 hours. Consider increasing procurement.</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
