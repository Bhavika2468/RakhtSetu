import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

const menuItems = [
  { path: '/', icon: '🏠', label: 'Home' },
  { path: '/search', icon: '🔍', label: 'Find Blood' },
  { path: '/alerts', icon: '🔔', label: 'Alerts' },
  { path: '/profile', icon: '👤', label: 'Profile' },
];

const roleItems = {
  donor: [{ path: '/donor', icon: '🩸', label: 'Donor Dashboard' }],
  hospital: [{ path: '/hospital', icon: '🏥', label: 'Hospital Dashboard' }],
};

export default function Sidebar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const { isDark, toggleTheme } = useTheme();

  const isActive = (path) => location.pathname === path;

  return (
    <aside className="fixed left-0 top-0 bottom-0 w-64 z-50 hidden md:block">
      <div className="h-full glass rounded-none border-l-0 border-t-0 border-b-0 border-r border-border-subtle flex flex-col">
        {/* Logo */}
        <div className="p-6 border-b border-border-subtle">
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate('/')}>
            <div className="w-10 h-10 rounded-xl bg-accent-blue/20 flex items-center justify-center text-lg shadow-glow-blue-sm">
              🩸
            </div>
            <div>
              <h1 className="text-lg font-bold text-text-primary">RakhtSetu</h1>
              <p className="text-[10px] text-text-secondary tracking-wider uppercase">AI Blood Network</p>
            </div>
          </div>
        </div>

        {/* User info */}
        {user && (
          <div className="px-6 py-4 border-b border-border-subtle">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-accent-blue/20 flex items-center justify-center text-sm font-bold text-accent-blue">
                {user.fullName?.charAt(0)?.toUpperCase() || 'U'}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-text-primary truncate">{user.fullName}</p>
                <p className="text-xs text-text-secondary capitalize">{user.role === 'donor' ? '🩸 Donor' : user.role === 'hospital' ? '🏥 Hospital' : '👤 User'}</p>
              </div>
            </div>
          </div>
        )}

        {/* Nav items */}
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {menuItems.map(item => (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 text-left ${
                isActive(item.path)
                  ? 'bg-accent-blue/10 text-accent-blue border border-accent-blue/20'
                  : 'text-text-secondary hover:text-text-primary hover:bg-white/5'
              }`}
            >
              <span className="text-lg">{item.icon}</span>
              <span className="text-sm font-medium">{item.label}</span>
              {isActive(item.path) && <span className="ml-auto w-1.5 h-1.5 rounded-full bg-accent-blue" />}
            </button>
          ))}

          {/* Role-specific items */}
          {user && roleItems[user.role]?.map(item => (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 text-left ${
                isActive(item.path)
                  ? 'bg-accent-blue/10 text-accent-blue border border-accent-blue/20'
                  : 'text-text-secondary hover:text-text-primary hover:bg-white/5'
              }`}
            >
              <span className="text-lg">{item.icon}</span>
              <span className="text-sm font-medium">{item.label}</span>
              {isActive(item.path) && <span className="ml-auto w-1.5 h-1.5 rounded-full bg-accent-blue" />}
            </button>
          ))}
        </nav>

        {/* Bottom actions */}
        <div className="p-4 border-t border-border-subtle space-y-2">
          <button
            onClick={toggleTheme}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-text-secondary hover:text-text-primary hover:bg-white/5 transition-all duration-200"
          >
            <span className="text-lg">{isDark ? '☀️' : '🌙'}</span>
            <span className="text-sm font-medium">{isDark ? 'Light Mode' : 'Dark Mode'}</span>
          </button>
          <button
            onClick={() => navigate('/sos')}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl bg-accent-red/10 text-accent-red border border-accent-red/20 hover:bg-accent-red/20 transition-all duration-200"
          >
            <span className="text-lg">🚨</span>
            <span className="text-sm font-bold">Emergency SOS</span>
          </button>
        </div>
      </div>
    </aside>
  );
}
