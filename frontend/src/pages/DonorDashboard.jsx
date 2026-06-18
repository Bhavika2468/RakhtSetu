import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api } from '../api';

export default function DonorDashboard({ refreshUser }) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isAvailable, setIsAvailable] = useState(user?.isAvailable || false);
  const [donations, setDonations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [bloodData, setBloodData] = useState([]);

  useEffect(() => {
    setIsAvailable(user?.isAvailable || false);
    Promise.all([
      api.getDonations().catch(() => []),
      api.getBloodData().catch(() => [])
    ]).then(([d, b]) => {
      setDonations(d);
      setBloodData(b);
      setLoading(false);
    });
  }, [user]);

  const toggleAvail = async () => {
    try {
      const data = await api.toggleAvailability();
      setIsAvailable(data.isAvailable);
      await refreshUser();
    } catch {}
  };

  const totalDonations = user?.totalDonations || donations.length || 0;
  const livesSaved = user?.livesSaved || Math.round(totalDonations * 2.5);
  const nextEligible = user?.nextEligibleDate || 'Available now';
  const badges = user?.badges || [];

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="glass p-6">
        <div className="flex items-center gap-4 mb-4">
          <div className="w-16 h-16 rounded-full bg-accent-blue/20 flex items-center justify-center text-2xl font-bold text-accent-blue border-2 border-accent-blue/30">
            {user?.fullName?.charAt(0)?.toUpperCase() || 'D'}
          </div>
          <div>
            <h1 className="text-2xl font-bold text-text-primary">{user?.fullName}</h1>
            <div className="flex items-center gap-2 mt-1">
              <span className="chip active text-xs">{user?.bloodGroup || 'O+'}</span>
              <span className="chip text-xs">🩸 Donor</span>
              {badges.map((b, i) => (
                <span key={i} className="chip text-[10px]">{b === 'Verified' ? '✅' : '🏅'} {b}</span>
              ))}
            </div>
          </div>
        </div>

        {/* Availability Toggle */}
        <div className={`p-4 rounded-xl border transition-all duration-300 ${isAvailable ? 'bg-green-500/10 border-green-500/30' : 'bg-white/5 border-border-subtle'}`}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-text-primary">Availability Status</p>
              <p className="text-xs text-text-secondary mt-0.5">
                {isAvailable ? '🟢 You are available to donate' : '🔴 Not accepting requests'}
              </p>
            </div>
            <label className="toggle">
              <input type="checkbox" checked={isAvailable} onChange={toggleAvail} />
              <span className="toggle-slider"></span>
            </label>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="glass p-4 text-center hover:border-accent-blue/40 transition-all">
          <div className="text-3xl font-bold text-accent-blue">{totalDonations}</div>
          <div className="text-xs text-text-secondary mt-1">Total Donations</div>
        </div>
        <div className="glass p-4 text-center hover:border-accent-blue/40 transition-all">
          <div className="text-3xl font-bold text-green-400">{livesSaved}</div>
          <div className="text-xs text-text-secondary mt-1">Lives Saved</div>
        </div>
        <div className="glass p-4 text-center hover:border-accent-blue/40 transition-all">
          <div className="text-3xl font-bold text-accent-red">{badges.length}</div>
          <div className="text-xs text-text-secondary mt-1">Badges Earned</div>
        </div>
        <div className="glass p-4 text-center hover:border-accent-blue/40 transition-all">
          <div className="text-sm font-bold text-yellow-400">{nextEligible === 'Available now' ? '✅ Now' : nextEligible}</div>
          <div className="text-xs text-text-secondary mt-1">Next Eligible</div>
        </div>
      </div>

      {/* Gamification */}
      <div className="glass p-6">
        <h2 className="text-lg font-semibold text-text-primary mb-4">🏆 Your Impact</h2>
        <div className="mb-4">
          <div className="flex items-center justify-between text-sm mb-2">
            <span className="text-text-secondary">Next Milestone: 10 Donations</span>
            <span className="text-accent-blue font-medium">{totalDonations}/10</span>
          </div>
          <div className="w-full h-3 rounded-full bg-white/5 overflow-hidden">
            <div className="h-full rounded-full bg-accent-blue transition-all duration-500" style={{ width: `${Math.min((totalDonations / 10) * 100, 100)}%` }}></div>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          {[
            { icon: '✅', name: 'Verified', earned: badges.includes('Verified') },
            { icon: '🏅', name: 'Life Saver', earned: badges.includes('Life Saver') },
            { icon: '⭐', name: 'Gold Donor', earned: totalDonations >= 10 },
            { icon: '💎', name: 'Diamond', earned: totalDonations >= 25 },
            { icon: '👑', name: 'Champion', earned: totalDonations >= 50 },
          ].map(b => (
            <div key={b.name} className={`chip text-xs ${b.earned ? 'active' : 'opacity-40'}`}>
              {b.icon} {b.name}
            </div>
          ))}
        </div>
      </div>

      {/* Quick actions */}
      <div className="grid grid-cols-2 gap-3">
        <button onClick={() => navigate('/sos')} className="btn btn-danger text-sm">🚨 Emergency SOS</button>
        <button onClick={() => navigate('/search')} className="btn btn-primary text-sm">🔍 Find Requests</button>
      </div>

      {/* Recent Donations */}
      <div>
        <h2 className="text-lg font-semibold text-text-primary mb-4">📋 Recent Donations</h2>
        {loading ? (
          <div className="glass p-4 animate-pulse"><div className="h-4 bg-white/10 rounded w-1/2"></div></div>
        ) : donations.length === 0 ? (
          <div className="glass p-8 text-center"><div className="text-4xl mb-3">🩸</div><p className="text-text-secondary">No donations yet</p></div>
        ) : (
          <div className="space-y-2">
            {donations.slice(0, 5).map(d => (
              <div key={d.id} className="glass p-4 hover:border-accent-blue/40 transition-all">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-accent-blue/10 flex items-center justify-center">🩸</div>
                    <div>
                      <p className="text-sm font-semibold text-text-primary">{d.recipientName}</p>
                      <p className="text-xs text-text-secondary">{new Date(d.date).toLocaleDateString()} · {d.units} unit{d.units > 1 ? 's' : ''}</p>
                    </div>
                  </div>
                  <span className="chip good text-[10px]">{d.bloodGroup}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Blood Availability */}
      <div>
        <h2 className="text-lg font-semibold text-text-primary mb-4">🩸 Blood Availability</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          {bloodData.map(bg => (
            <div key={bg.group} className="glass p-3 text-center hover:border-accent-blue/40 transition-all">
              <div className="text-lg font-bold text-text-primary">{bg.group}</div>
              <div className="text-accent-blue font-bold text-xl">{bg.units}</div>
              <div className={`chip text-[8px] mt-1 ${bg.status === 'good' ? 'good' : bg.status === 'medium' ? 'border-yellow-400 text-yellow-400' : 'low'}`}>
                {bg.status}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
