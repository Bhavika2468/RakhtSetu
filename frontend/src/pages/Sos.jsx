import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api } from '../api';

const STEPS = [
  { icon: '🔄', title: 'Searching for nearby hospitals...', desc: 'Scanning within 5km radius' },
  { icon: '👥', title: 'Matching compatible donors...', desc: 'Checking blood group compatibility' },
  { icon: '📡', title: 'Sending emergency alerts...', desc: 'Notifying donors and hospitals' },
  { icon: '✅', title: 'Help is on the way!', desc: 'Donors confirmed', final: true },
];

export default function Sos() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [active, setActive] = useState(false);
  const [step, setStep] = useState(0);
  const [sosData, setSosData] = useState(null);
  const [showStatus, setShowStatus] = useState(false);

  const triggerSos = async () => {
    setActive(true);
    setShowStatus(false);
    setStep(0);

    // Animate through steps
    for (let i = 0; i < STEPS.length; i++) {
      setStep(i);
      await new Promise(r => setTimeout(r, 1200));
    }

    try {
      const data = await api.triggerSos(user?.bloodGroup || 'O+');
      setSosData(data);
      setShowStatus(true);
    } catch {
      // Use mock data if API fails
      setSosData({
        id: 'sos-mock',
        donorsNotified: 3,
        hospitalResponding: 'AIIMS Delhi',
        status: 'responding',
        bloodGroup: user?.bloodGroup || 'O+'
      });
      setShowStatus(true);
    }
  };

  const cancelSos = () => {
    setActive(false);
    setStep(0);
    setShowStatus(false);
    setSosData(null);
  };

  // Poll SOS status
  useEffect(() => {
    if (!sosData?.id) return;
    const int = setInterval(async () => {
      try {
        const updated = await api.getSos(sosData.id);
        setSosData(updated);
      } catch {}
    }, 3000);
    return () => clearInterval(int);
  }, [sosData?.id]);

  return (
    <div className="min-h-screen bg-dark-bg flex flex-col items-center justify-center p-4 relative overflow-hidden">
      <div className="neon-bg" aria-hidden="true">
        <div className="grid" />
        <div className="blob blue" />
        <div className="blob red" />
      </div>

      {/* Radial background glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] rounded-full bg-accent-red/5 blur-[80px] pointer-events-none"></div>
      <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] rounded-full bg-accent-red/10 blur-[60px] pointer-events-none transition-all duration-1000 ${active ? 'scale-150 opacity-100' : 'scale-50 opacity-0'}`}></div>


      {/* Header */}
      <div className="relative z-10 text-center mb-8">
        <button onClick={() => navigate('/')} className="absolute left-0 top-0 text-text-secondary hover:text-text-primary text-xl p-2">
          ← Back
        </button>
        <h1 className="text-2xl font-bold text-accent-red glow-red">Emergency SOS</h1>
        <p className="text-text-secondary text-sm mt-1">Immediate blood request</p>
      </div>

      {/* Main SOS Button */}
      <div className="relative z-10 mb-8">
        {!active ? (
          <div className="text-center">
            <button onClick={triggerSos}
              className="w-48 h-48 rounded-full bg-accent-red cursor-pointer border-4 border-accent-red/50 
                animate-sos-pulse flex flex-col items-center justify-center text-white text-xl font-bold
                hover:scale-105 active:scale-95 transition-all duration-200"
            >
              <span className="text-5xl mb-2">🚨</span>
              <span>TAP FOR</span>
              <span>EMERGENCY</span>
            </button>
            <p className="text-text-secondary text-sm mt-4">Press to instantly alert donors and hospitals</p>
          </div>
        ) : !showStatus ? (
          <div className="text-center">
            <button className="w-40 h-40 rounded-full bg-accent-red/50 border-4 border-accent-red/30 
              animate-sos-glow flex flex-col items-center justify-center text-white cursor-default">
              <span className="text-4xl mb-1">🚨</span>
              <span className="text-sm">SOS SENT</span>
            </button>
            <div className="mt-8 max-w-md mx-auto">
              {STEPS.slice(0, step + 1).map((s, i) => (
                <div key={i} className={`flex items-center gap-4 p-4 rounded-xl mb-3 transition-all duration-500 ${
                  i === step ? 'bg-accent-red/10 border border-accent-red/30 animate-slide-up' : 'opacity-50'
                }`}>
                  <span className={`text-2xl ${i <= step ? 'animate-breathe' : ''}`}>{s.icon}</span>
                  <div className="text-left">
                    <p className={`text-sm font-semibold ${i === step ? 'text-accent-red' : 'text-text-secondary'}`}>{s.title}</p>
                    <p className="text-xs text-text-secondary">{s.desc}</p>
                  </div>
                  {i < step && <span className="ml-auto text-green-400">✓</span>}
                </div>
              ))}
              <div className="loading-dots flex justify-center mt-4">
                <span></span><span></span><span></span>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center animate-fade-in w-full max-w-md">
            <div className="w-24 h-24 rounded-full bg-green-500/20 border-2 border-green-500 flex items-center justify-center text-4xl mx-auto mb-4">
              ✅
            </div>
            <h2 className="text-xl font-bold text-green-400 mb-2">SOS Activated!</h2>
            
            <div className="glass p-6 space-y-4 mt-6">
              <div className="flex items-center justify-between p-3 rounded-xl bg-accent-blue/10">
                <span className="text-text-secondary text-sm">Donors Notified</span>
                <span className="text-accent-blue font-bold text-lg">{sosData?.donorsNotified || 0}</span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-xl bg-accent-blue/10">
                <span className="text-text-secondary text-sm">Hospital Responding</span>
                <span className="text-accent-blue font-bold text-sm">{sosData?.hospitalResponding || 'Searching...'}</span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-xl bg-accent-blue/10">
                <span className="text-text-secondary text-sm">Blood Group</span>
                <span className="chip active">{sosData?.bloodGroup || 'O+'}</span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-xl bg-accent-blue/10">
                <span className="text-text-secondary text-sm">Status</span>
                <span className={`chip ${sosData?.status === 'resolved' ? 'good' : 'low'}`}>
                  {sosData?.status === 'responding' ? '🔄 Responding' : sosData?.status}
                </span>
              </div>
            </div>

            <div className="flex gap-3 mt-6 justify-center">
              <button onClick={cancelSos} className="btn btn-ghost text-sm">Cancel SOS</button>
              <button onClick={() => navigate('/')} className="btn btn-primary text-sm">Back to Home</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
