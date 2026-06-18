import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api } from '../api';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!email || !password) { setError('Please fill in all fields'); return; }
    setLoading(true);
    try {
      const data = await api.login(email, password);
      login(data.user, data.token);
      const role = data.user.role;
      if (role === 'donor') navigate('/donor');
      else if (role === 'hospital') navigate('/hospital');
      else navigate('/');
    } catch (err) {
      setError(err.message || 'Login failed');
    } finally { setLoading(false); }
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await api.googleLogin('demo.google@user.com', 'Google User');
      login(data.user, data.token);
      navigate('/');
    } catch (err) { setError(err.message); }
    finally { setLoading(false); }
  };

  const handleQuickAccess = async () => {
    setLoading(true);
    try {
      const data = await api.quickAccess();
      login(data.user, data.token);
      navigate('/sos');
    } catch (err) { setError(err.message); }
    finally { setLoading(false); }
  };

  const fillDemo = (type) => {
    if (type === 'donor') { setEmail('donor@demo.com'); setPassword('password123'); }
    else if (type === 'user') { setEmail('user@demo.com'); setPassword('password123'); }
    else if (type === 'hospital') { setEmail('hospital@demo.com'); setPassword('password123'); }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-dark-bg">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8 animate-fade-in">
          <div className="w-16 h-16 rounded-2xl bg-accent-blue/20 flex items-center justify-center text-3xl mx-auto mb-4 shadow-glow-blue">
            🩸
          </div>
          <h1 className="text-3xl font-bold text-text-primary glow-blue">RakhtSetu</h1>
          <p className="text-text-secondary mt-2 text-sm">AI-Powered Emergency Blood Network</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="glass p-6 md:p-8 space-y-5 animate-slide-up">
          <h2 className="text-xl font-semibold text-text-primary">Welcome Back</h2>

          {error && (
            <div className="p-3 rounded-xl bg-accent-red/10 border border-accent-red/20 text-accent-red text-sm">
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm text-text-secondary mb-1.5">Email or Phone</label>
            <input
              type="email" value={email} onChange={e => setEmail(e.target.value)}
              className="input-field" placeholder="you@example.com"
            />
          </div>

          <div>
            <label className="block text-sm text-text-secondary mb-1.5">Password</label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password} onChange={e => setPassword(e.target.value)}
                className="input-field pr-10" placeholder="••••••••"
              />
              <button type="button" onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-text-secondary text-sm">
                {showPassword ? '🙈' : '👁️'}
              </button>
            </div>
          </div>

          <button type="submit" disabled={loading}
            className="btn btn-primary w-full text-sm">
            {loading ? <div className="loading-dots flex"><span></span><span></span><span></span></div> : 'Sign In'}
          </button>

          <div className="relative">
            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-border-subtle"></div></div>
            <div className="relative flex justify-center"><span className="px-3 text-xs text-text-secondary bg-dark-bg">or continue with</span></div>
          </div>

          <button type="button" onClick={handleGoogleLogin} disabled={loading}
            className="btn btn-ghost w-full text-sm">
            <span>🔵</span> Google
          </button>

          <button type="button" onClick={handleQuickAccess} disabled={loading}
            className="btn btn-danger w-full text-sm">
            🚨 Emergency Quick Access
          </button>

          <div className="flex flex-wrap gap-2 justify-center">
            <button type="button" onClick={() => fillDemo('user')} className="text-xs text-text-secondary hover:text-accent-blue underline">Demo User</button>
            <button type="button" onClick={() => fillDemo('donor')} className="text-xs text-text-secondary hover:text-accent-blue underline">Demo Donor</button>
            <button type="button" onClick={() => fillDemo('hospital')} className="text-xs text-text-secondary hover:text-accent-blue underline">Demo Hospital</button>
          </div>

          <p className="text-center text-sm text-text-secondary">
            Don't have an account? <Link to="/signup" className="text-accent-blue hover:underline">Sign Up</Link>
          </p>
        </form>
      </div>
    </div>
  );
}
