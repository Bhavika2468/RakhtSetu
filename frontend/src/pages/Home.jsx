import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api } from '../api';

const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

export default function Home({ refreshUser }) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [bloodData, setBloodData] = useState([]);
  const [hospitals, setHospitals] = useState([]);
  const [donors, setDonors] = useState([]);
  const [greeting, setGreeting] = useState('');

  useEffect(() => {
    const h = new Date().getHours();
    setGreeting(h < 12 ? 'Good Morning' : h < 17 ? 'Good Afternoon' : 'Good Evening');
  }, []);

  useEffect(() => {
    api.getBloodData().then(setBloodData).catch(() => {});
    api.getHospitals().then(setHospitals).catch(() => {});
    api.getDonors().then(setDonors).catch(() => {});
  }, []);

  const getStatusColor = (status) => {
    if (status === 'good') return 'text-green-400 chip good';
    if (status === 'medium') return 'text-yellow-400 border-yellow-400/30 bg-yellow-400/10';
    return 'text-accent-red chip low';
  };

  const quickActions = [
    { icon: '🚨', label: 'Emergency SOS', color: 'bg-accent-red/10 border-accent-red/30 text-accent-red', onClick: () => navigate('/sos') },
    { icon: '🔍', label: 'Find Blood', color: 'bg-accent-blue/10 border-accent-blue/30 text-accent-blue', onClick: () => navigate('/search') },
    { icon: '❤️', label: 'Donate Now', color: 'bg-green-500/10 border-green-500/30 text-green-400', onClick: () => user?.role === 'donor' ? navigate('/donor') : navigate('/search') },
    { icon: '📊', label: 'My Requests', color: 'bg-purple-500/10 border-purple-500/30 text-purple-400', onClick: () => navigate('/profile') },
  ];

  return (
    <div className="space-y-6 animate-fade-in relative">
      <div className="neon-bg">
        <div className="grid" />
        <div className="blob blue" />
        <div className="blob red" />
      </div>

      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-text-primary">
            {greeting}, <span className="text-accent-blue glow-blue">{user?.fullName?.split(' ')[0] || 'User'}</span>
          </h1>
          <p className="text-text-secondary text-sm mt-1">Ready to save lives today?</p>
        </div>

        <div className="flex items-center gap-3">
          {user?.badges?.length > 0 && user.badges.map((b, i) => (
            <span key={i} className="chip text-[10px]">{b === 'Verified' ? '✅' : '🏅'} {b}</span>
          ))}
          <button onClick={() => navigate('/profile')} className="w-10 h-10 rounded-full bg-accent-blue/20 flex items-center justify-center text-sm font-bold text-accent-blue border border-accent-blue/30">
            {user?.fullName?.charAt(0)?.toUpperCase() || 'U'}
          </button>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {quickActions.map((action, i) => (
          <button
            key={i}
            onClick={action.onClick}
            className={`p-4 rounded-xl border ${action.color} transition-all duration-200 hover:scale-[1.03] hover:shadow-lg hover:-translate-y-0.5 relative overflow-hidden`}>
            <span className="absolute -top-10 -left-10 w-20 h-20 rounded-full" style={{ background: 'rgba(0,229,255,0.12)', filter: 'blur(10px)' }} />
            <div className="relative">
              <div className="text-2xl mb-2">{action.icon}</div>
              <div className="text-sm font-semibold">{action.label}</div>
            </div>
          </button>
        ))}
      </div>


      {/* Live Blood Data */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-text-primary neon-title">🩸 Live Blood Availability</h2>
          <span className="flex items-center gap-1 text-xs text-text-secondary">
            <span className="w-2 h-2 rounded-full bg-green-400 animate-breathe"></span> Live
          </span>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {bloodData.map(bg => (
            <div key={bg.group} className={`glass p-4 hover:-translate-y-1 transition-all duration-200 cursor-default relative overflow-hidden ${bg.status === 'low' ? 'border-accent-red/20' : 'border-accent-blue/20'}`}>
              <span className="absolute -bottom-14 -right-14 w-32 h-32 rounded-full" style={{ background: bg.status === 'low' ? 'rgba(255,59,59,0.18)' : 'rgba(0,229,255,0.14)', filter: 'blur(16px)' }} />
              <div className="relative">

              <div className="flex items-center justify-between mb-2">
                <span className="text-xl font-bold text-text-primary">{bg.group}</span>
                <span className={`chip text-[10px] ${getStatusColor(bg.status)}`}>{bg.status.toUpperCase()}</span>
              </div>
              <div className="text-2xl font-bold text-accent-blue">{bg.units}</div>
              <div className="text-xs text-text-secondary mt-1">units available</div>
              <div className="flex items-center gap-2 mt-2 text-[10px] text-text-secondary">
                <span>{bg.availableAt}/{bg.hospitals} hospitals</span>
              </div>
            </div>
            </div>
          ))}
        </div>
      </div>


      {/* Nearby Hospitals */}
      <div>
        <h2 className="text-lg font-semibold text-text-primary mb-4">🏥 Nearby Hospitals</h2>
        <div className="flex gap-4 overflow-x-auto pb-2 -mx-2 px-2 snap-x">
          {hospitals.slice(0, 6).map(h => (
            <div key={h.id} className="glass p-4 min-w-[220px] flex-shrink-0 snap-start hover:border-accent-blue/40 transition-all duration-200 hover:-translate-y-1">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-xl bg-accent-blue/10 flex items-center justify-center text-lg">🏥</div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-text-primary truncate">{h.name}</p>
                  <p className="text-[10px] text-text-secondary truncate">{h.address}</p>
                </div>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-text-secondary">{h.distance} km away</span>
                <button onClick={() => navigate(`/search?hospital=${h.id}`)} className="text-accent-blue hover:underline font-medium">Request</button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Nearby Donors */}
      {donors.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold text-text-primary mb-4">🩸 Nearby Donors</h2>
          <div className="flex gap-4 overflow-x-auto pb-2 -mx-2 px-2 snap-x">
            {donors.filter(d => d.isAvailable).slice(0, 6).map(d => (
              <div key={d.id} className="glass p-4 min-w-[180px] flex-shrink-0 snap-start hover:border-accent-blue/40 transition-all duration-200 hover:-translate-y-1">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 rounded-full bg-accent-blue/10 flex items-center justify-center text-sm font-bold text-accent-blue">
                    {d.fullName?.charAt(0)?.toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-text-primary truncate">{d.fullName}</p>
                    <div className="flex items-center gap-2">
                      <span className="chip text-[10px] active">{d.bloodGroup}</span>
                      {d.distance && <span className="text-[10px] text-text-secondary">{d.distance} km</span>}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-[10px] text-text-secondary">
                  <span>🎖️ {d.totalDonations} donations</span>
                  {d.badges?.includes('Life Saver') && <span className="chip text-[8px]">🏅 Life Saver</span>}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
