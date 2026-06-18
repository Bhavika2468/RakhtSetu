import { useNavigate, useLocation } from 'react-router-dom';

const navItems = [
  { path: '/', icon: '🏠', label: 'Home' },
  { path: '/search', icon: '🔍', label: 'Find Blood' },
  { path: '/alerts', icon: '🔔', label: 'Alerts' },
  { path: '/profile', icon: '👤', label: 'Profile' },
];

export default function BottomNav() {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 md:hidden">
      <div className="glass rounded-none border-x-0 border-b-0 border-t border-border-subtle bg-dark-bg/95 backdrop-blur-xl">
        <div className="flex justify-around items-center py-2 px-2">
          {navItems.map(item => {
            const isActive = location.pathname === item.path;
            return (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                className={`flex flex-col items-center gap-0.5 px-3 py-2 rounded-xl transition-all duration-200 min-w-[60px] ${
                  isActive ? 'text-accent-blue scale-110' : 'text-text-secondary hover:text-text-primary'
                }`}
              >
                <span className="text-lg">{item.icon}</span>
                <span className="text-[10px] font-medium">{item.label}</span>
                {isActive && <span className="w-1 h-1 rounded-full bg-accent-blue mt-0.5" />}
              </button>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
