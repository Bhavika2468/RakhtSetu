import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api } from '../api';

const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

export default function Signup() {
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({ fullName: '', email: '', phone: '', password: '', role: 'receiver', bloodGroup: '', age: '', weight: '', healthConditions: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const update = (key, value) => setForm(f => ({ ...f, [key]: value }));

  const handleSubmit = async () => {
    setError('');
    if (!form.fullName || !form.email || !form.password) { setError('Name, email, and password required'); return; }
    setLoading(true);
    try {
      const data = await api.signup(form);
      login(data.user, data.token);
      navigate('/verify-otp');
    } catch (err) { setError(err.message); }
    finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-dark-bg">
      <div className="w-full max-w-md">
        <div className="text-center mb-8 animate-fade-in">
          <div className="w-14 h-14 rounded-2xl bg-accent-blue/20 flex items-center justify-center text-2xl mx-auto mb-3 shadow-glow-blue-sm">🩸</div>
          <h1 className="text-2xl font-bold text-text-primary">Create Account</h1>
          <p className="text-text-secondary mt-1 text-sm">Join the lifesaving network</p>
        </div>

        <div className="glass p-6 md:p-8 space-y-5 animate-slide-up">
          {/* Step indicator */}
          <div className="flex gap-2 justify-center mb-4">
            {[1,2,3].map(s => (
              <div key={s} className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300 ${
                step >= s ? 'bg-accent-blue text-dark-bg' : 'bg-white/5 text-text-secondary'
              }`}>{s}</div>
            ))}
          </div>

          {error && <div className="p-3 rounded-xl bg-accent-red/10 border border-accent-red/20 text-accent-red text-sm">{error}</div>}

          {step === 1 && (
            <div className="space-y-4 animate-fade-in">
              <h3 className="text-lg font-semibold text-text-primary">Basic Details</h3>
              <div>
                <label className="block text-sm text-text-secondary mb-1">Full Name</label>
                <input type="text" className="input-field" placeholder="John Doe" value={form.fullName} onChange={e => update('fullName', e.target.value)} />
              </div>
              <div>
                <label className="block text-sm text-text-secondary mb-1">Email</label>
                <input type="email" className="input-field" placeholder="you@example.com" value={form.email} onChange={e => update('email', e.target.value)} />
              </div>
              <div>
                <label className="block text-sm text-text-secondary mb-1">Phone</label>
                <input type="tel" className="input-field" placeholder="+91 98765 43210" value={form.phone} onChange={e => update('phone', e.target.value)} />
              </div>
              <div>
                <label className="block text-sm text-text-secondary mb-1">Password</label>
                <input type="password" className="input-field" placeholder="••••••••" value={form.password} onChange={e => update('password', e.target.value)} />
              </div>
              <button onClick={() => setStep(2)} className="btn btn-primary w-full text-sm">Next →</button>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4 animate-fade-in">
              <h3 className="text-lg font-semibold text-text-primary">Role & Health</h3>
              <div>
                <label className="block text-sm text-text-secondary mb-2">I am a...</label>
                <div className="grid grid-cols-3 gap-2">
                  {[{v:'receiver',l:'👤 Receiver',d:'Need blood'},{v:'donor',l:'🩸 Donor',d:'Donate blood'},{v:'hospital',l:'🏥 Hospital',d:'Manage supply'}].map(r => (
                    <button key={r.v} type="button" onClick={() => update('role', r.v)}
                      className={`p-3 rounded-xl border text-center transition-all duration-200 ${
                        form.role === r.v ? 'border-accent-blue bg-accent-blue/10 text-accent-blue' : 'border-border-subtle text-text-secondary hover:border-accent-blue/50'
                      }`}>
                      <div className="text-lg mb-1">{r.l}</div>
                      <div className="text-[10px] opacity-70">{r.d}</div>
                    </button>
                  ))}
                </div>
              </div>

              {form.role === 'donor' && (
                <>
                  <div>
                    <label className="block text-sm text-text-secondary mb-1">Blood Group</label>
                    <div className="flex flex-wrap gap-2">
                      {BLOOD_GROUPS.map(bg => (
                        <button key={bg} type="button" onClick={() => update('bloodGroup', bg)}
                          className={`chip text-sm px-4 py-2 ${form.bloodGroup === bg ? 'active' : ''}`}>{bg}</button>
                      ))}
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm text-text-secondary mb-1">Age</label>
                      <input type="number" className="input-field" placeholder="25" value={form.age} onChange={e => update('age', e.target.value)} />
                    </div>
                    <div>
                      <label className="block text-sm text-text-secondary mb-1">Weight (kg)</label>
                      <input type="number" className="input-field" placeholder="70" value={form.weight} onChange={e => update('weight', e.target.value)} />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm text-text-secondary mb-1">Health Conditions</label>
                    <input type="text" className="input-field" placeholder="None" value={form.healthConditions} onChange={e => update('healthConditions', e.target.value)} />
                  </div>
                </>
              )}

              <div className="flex gap-3">
                <button onClick={() => setStep(1)} className="btn btn-ghost flex-1 text-sm">← Back</button>
                <button onClick={() => setStep(3)} className="btn btn-primary flex-1 text-sm">Next →</button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4 animate-fade-in">
              <h3 className="text-lg font-semibold text-text-primary">Verify & Finish</h3>
              <div className="p-4 rounded-xl bg-accent-blue/5 border border-accent-blue/20 text-sm text-text-secondary space-y-2">
                <p><span className="text-text-primary font-medium">Name:</span> {form.fullName}</p>
                <p><span className="text-text-primary font-medium">Email:</span> {form.email}</p>
                <p><span className="text-text-primary font-medium">Role:</span> {form.role === 'donor' ? '🩸 Donor' : form.role === 'hospital' ? '🏥 Hospital' : '👤 Receiver'}</p>
                {form.bloodGroup && <p><span className="text-text-primary font-medium">Blood Group:</span> {form.bloodGroup}</p>}
              </div>
              <div className="flex gap-3">
                <button onClick={() => setStep(2)} className="btn btn-ghost flex-1 text-sm">← Back</button>
                <button onClick={handleSubmit} disabled={loading} className="btn btn-primary flex-1 text-sm">
                  {loading ? <div className="loading-dots flex"><span></span><span></span><span></span></div> : 'Create Account'}
                </button>
              </div>
            </div>
          )}

          <p className="text-center text-sm text-text-secondary">
            Already have an account? <Link to="/login" className="text-accent-blue hover:underline">Sign In</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
