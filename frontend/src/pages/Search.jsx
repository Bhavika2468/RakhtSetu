import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { api } from '../api';

const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

export default function Search() {
  const [searchParams] = useSearchParams();
  const [bloodGroup, setBloodGroup] = useState(searchParams.get('bg') || '');
  const [maxDistance, setMaxDistance] = useState(10);
  const [showAvailable, setShowAvailable] = useState(true);
  const [viewMode, setViewMode] = useState('list');
  const [hospitals, setHospitals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [requesting, setRequesting] = useState(null);

  useEffect(() => {
    api.getHospitals().then(h => { setHospitals(h); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  const filtered = hospitals.filter(h => {
    const dist = parseFloat(h.distance);
    const inv = h.bloodInventory || {};
    const bgData = bloodGroup ? inv[bloodGroup] : null;
    if (bloodGroup && (!bgData || bgData.units === 0)) return false;
    if (dist > maxDistance) return false;
    if (showAvailable && bloodGroup && bgData && bgData.status !== 'available') return false;
    return true;
  });

  const handleRequest = async (hospitalId) => {
    if (!bloodGroup) return;
    setRequesting(hospitalId);
    try {
      const result = await api.requestBlood({ bloodGroup, units: 1, hospitalId, urgency: 'normal' });
      alert(`✅ Blood request submitted! ${result.hospitalName ? `Matched at ${result.hospitalName}` : 'Searching for nearest match...'}`);
    } catch (err) { alert('Error: ' + err.message); }
    finally { setRequesting(null); }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-text-primary">🔍 Find Blood</h1>
        <p className="text-text-secondary text-sm mt-1">Search hospitals and donors near you</p>
      </div>

      {/* Filters */}
      <div className="glass p-5 space-y-4">
        <div>
          <label className="block text-sm text-text-secondary mb-2">Blood Group</label>
          <div className="flex flex-wrap gap-2">
            {BLOOD_GROUPS.map(bg => (
              <button key={bg} onClick={() => setBloodGroup(bg === bloodGroup ? '' : bg)}
                className={`chip text-sm px-4 py-2 ${bloodGroup === bg ? 'active' : ''}`}>{bg}</button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm text-text-secondary mb-2">
            Max Distance: <span className="text-accent-blue font-medium">{maxDistance} km</span>
          </label>
          <input type="range" min="1" max="50" value={maxDistance} onChange={e => setMaxDistance(Number(e.target.value))}
            className="w-full h-2 rounded-full appearance-none bg-white/10 outline-none accent-accent-blue" />
        </div>

        <div className="flex items-center justify-between">
          <label className="flex items-center gap-3 cursor-pointer">
            <span className="text-sm text-text-secondary">Show available only</span>
            <div className="toggle" onClick={() => setShowAvailable(!showAvailable)}>
              <input type="checkbox" checked={showAvailable} readOnly />
              <span className="toggle-slider"></span>
            </div>
          </label>
          <div className="flex gap-1 bg-white/5 rounded-xl p-1">
            <button onClick={() => setViewMode('list')} className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${viewMode === 'list' ? 'bg-accent-blue text-dark-bg' : 'text-text-secondary'}`}>📋 List</button>
            <button onClick={() => setViewMode('map')} className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${viewMode === 'map' ? 'bg-accent-blue text-dark-bg' : 'text-text-secondary'}`}>🗺️ Map</button>
          </div>
        </div>
      </div>

      {/* Results */}
      {loading ? (
        <div className="grid gap-4">
          {[1,2,3].map(i => (
            <div key={i} className="glass p-5 animate-pulse">
              <div className="h-4 bg-white/10 rounded w-1/3 mb-3"></div>
              <div className="h-3 bg-white/5 rounded w-1/2 mb-2"></div>
              <div className="h-3 bg-white/5 rounded w-1/4"></div>
            </div>
          ))}
        </div>
      ) : viewMode === 'list' ? (
        <div className="space-y-3">
          {filtered.length === 0 ? (
            <div className="glass p-8 text-center">
              <div className="text-4xl mb-3">🔍</div>
              <p className="text-text-secondary">No hospitals found for the selected filters</p>
              <p className="text-text-secondary text-sm mt-1">Try a different blood group or increase distance</p>
            </div>
          ) : filtered.map(h => {
            const inv = h.bloodInventory || {};
            const bgData = bloodGroup ? inv[bloodGroup] : null;
            return (
              <div key={h.id} className="glass p-5 hover:border-accent-blue/40 transition-all duration-200 hover:-translate-y-0.5">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex gap-3">
                    <div className="w-12 h-12 rounded-xl bg-accent-blue/10 flex items-center justify-center text-xl">🏥</div>
                    <div>
                      <h3 className="font-semibold text-text-primary">{h.name}</h3>
                      <p className="text-xs text-text-secondary mt-0.5">{h.address}</p>
                      <div className="flex items-center gap-3 mt-2 text-xs text-text-secondary">
                        <span>📍 {h.distance} km</span>
                        {bgData && (
                          <span className={`chip text-[10px] ${bgData.status === 'available' ? 'good' : 'low'}`}>
                            {bgData.units} units {bgData.status}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <button onClick={() => handleRequest(h.id)} disabled={requesting === h.id || !bloodGroup}
                    className={`btn text-xs px-4 py-2 ${!bloodGroup ? 'btn-ghost cursor-not-allowed' : 'btn-primary'}`}>
                    {requesting === h.id ? <div className="loading-dots flex"><span></span><span></span><span></span></div> : 'Request'}
                  </button>
                </div>
              </div>
            );
          })}
          <p className="text-xs text-text-secondary text-center">{filtered.length} hospitals found</p>
        </div>
      ) : (
        <div className="glass p-6 text-center">
          <div className="w-full h-64 rounded-xl bg-accent-blue/5 border border-accent-blue/20 flex flex-col items-center justify-center">
            <div className="text-4xl mb-3">🗺️</div>
            <p className="text-text-secondary font-medium">Map View</p>
            <p className="text-text-secondary text-sm mt-1">{filtered.length} hospitals near you</p>
            <div className="flex flex-wrap gap-2 mt-4">
              {filtered.slice(0, 5).map(h => (
                <span key={h.id} className="chip text-[10px]">{h.name}</span>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
