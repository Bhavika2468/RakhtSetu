import { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { api } from '../api';
import { useAuth } from '../context/AuthContext';

export default function OtpVerify() {
  const [otp, setOtp] = useState(['','','','','','']);
  const [timer, setTimer] = useState(300);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [verified, setVerified] = useState(false);
  const inputs = useRef([]);
  const navigate = useNavigate();
  const { user } = useAuth();
  const email = user?.email || '';

  useEffect(() => {
    if (!email) { navigate('/login'); return; }
    api.sendOtp(email).catch(() => {});
  }, []);

  useEffect(() => {
    if (timer <= 0) return;
    const int = setInterval(() => setTimer(t => t - 1), 1000);
    return () => clearInterval(int);
  }, [timer]);

  const handleChange = (i, val) => {
    if (!/^\d?$/.test(val)) return;
    const newOtp = [...otp];
    newOtp[i] = val;
    setOtp(newOtp);
    if (val && i < 5) inputs.current[i + 1]?.focus();
  };

  const handleKeyDown = (i, e) => {
    if (e.key === 'Backspace' && !otp[i] && i > 0) inputs.current[i - 1]?.focus();
  };

  const handleVerify = async () => {
    const code = otp.join('');
    if (code.length !== 6) { setError('Enter all 6 digits'); return; }
    setLoading(true);
    try {
      await api.verifyOtp(email, code);
      setVerified(true);
      setTimeout(() => {
        const role = user?.role;
        if (role === 'donor') navigate('/donor');
        else if (role === 'hospital') navigate('/hospital');
        else navigate('/');
      }, 1500);
    } catch (err) { setError(err.message || 'Invalid OTP'); }
    finally { setLoading(false); }
  };

  const resendOtp = async () => {
    setTimer(300);
    try { await api.sendOtp(email); } catch {}
  };

  const formatTime = (s) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;

  if (verified) return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-dark-bg">
      <div className="text-center animate-fade-in">
        <div className="w-20 h-20 rounded-full bg-green-500/20 flex items-center justify-center text-4xl mx-auto mb-4">✅</div>
        <h2 className="text-2xl font-bold text-text-primary">Verified!</h2>
        <p className="text-text-secondary mt-2">Redirecting you...</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-dark-bg">
      <div className="w-full max-w-md animate-slide-up">
        <div className="text-center mb-8">
          <div className="w-14 h-14 rounded-2xl bg-accent-blue/20 flex items-center justify-center text-2xl mx-auto mb-3 shadow-glow-blue-sm">📱</div>
          <h1 className="text-2xl font-bold text-text-primary">Verify OTP</h1>
          <p className="text-text-secondary mt-1 text-sm">Code sent to {email}</p>
        </div>

        <div className="glass p-8 space-y-6">
          {error && <div className="p-3 rounded-xl bg-accent-red/10 border border-accent-red/20 text-accent-red text-sm text-center">{error}</div>}

          <div className="flex justify-center gap-3">
            {otp.map((digit, i) => (
              <input key={i} ref={el => inputs.current[i] = el}
                type="text" maxLength={1} value={digit}
                onChange={e => handleChange(i, e.target.value)}
                onKeyDown={e => handleKeyDown(i, e)}
                className="w-12 h-14 text-center text-xl font-bold rounded-xl border outline-none transition-all duration-200 bg-white/5 border-border-subtle text-text-primary focus:border-accent-blue focus:shadow-glow-blue-sm"
              />
            ))}
          </div>

          <button onClick={handleVerify} disabled={loading || otp.join('').length !== 6}
            className="btn btn-primary w-full text-sm">
            {loading ? <div className="loading-dots flex"><span></span><span></span><span></span></div> : 'Verify'}
          </button>

          <div className="text-center">
            {timer > 0 ? (
              <p className="text-text-secondary text-sm">Resend in <span className="text-accent-blue font-medium">{formatTime(timer)}</span></p>
            ) : (
              <button onClick={resendOtp} className="text-accent-blue text-sm hover:underline">Resend OTP</button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
