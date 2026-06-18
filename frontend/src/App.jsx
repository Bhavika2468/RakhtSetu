import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import Login from './pages/Login';
import Signup from './pages/Signup';
import OtpVerify from './pages/OtpVerify';
import Home from './pages/Home';
import Sos from './pages/Sos';
import Search from './pages/Search';
import Alerts from './pages/Alerts';
import Profile from './pages/Profile';
import DonorDashboard from './pages/DonorDashboard';
import HospitalDashboard from './pages/HospitalDashboard';
import BottomNav from './components/BottomNav';
import Sidebar from './components/Sidebar';
import { useEffect, useState } from 'react';
import { api } from './api';

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="h-screen flex items-center justify-center"><div className="loading-dots flex"><span></span><span></span><span></span></div></div>;
  if (!user) return <Navigate to="/login" />;
  return children;
}

function AppLayout({ children, title }) {
  const { user } = useAuth();
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    const handle = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handle);
    return () => window.removeEventListener('resize', handle);
  }, []);

  const currentPath = window.location.pathname;
  const hideNav = currentPath === '/sos';

  return (
    <div className="min-h-screen bg-dark-bg dark:bg-dark-bg light:bg-slate-50">
      {!isMobile && !hideNav && <Sidebar />}
      <div className={`${!isMobile && !hideNav ? 'ml-64' : ''} pb-20 md:pb-0`}>
        <main className="p-4 md:p-8 max-w-7xl mx-auto">
          {children}
        </main>
      </div>
      {isMobile && !hideNav && <BottomNav />}
    </div>
  );
}

export default function App() {
  const { user, logout, setUser } = useAuth();
  const navigate = useNavigate();
  const [unreadAlerts, setUnreadAlerts] = useState(0);

  useEffect(() => {
    if (user) {
      api.getAlerts().then(a => setUnreadAlerts(a.filter(al => !al.isRead).length)).catch(() => {});
      const int = setInterval(() => {
        api.getAlerts().then(a => setUnreadAlerts(a.filter(al => !al.isRead).length)).catch(() => {});
      }, 15000);
      return () => clearInterval(int);
    }
  }, [user]);

  const handleLogout = () => { logout(); navigate('/login'); };

  const refreshUser = async () => {
    try {
      const profile = await api.getProfile();
      setUser(profile);
      localStorage.setItem('user', JSON.stringify(profile));
    } catch {}
  };

  return (
    <Routes>
      <Route path="/login" element={user ? <Navigate to={user.role === 'donor' ? '/donor' : user.role === 'hospital' ? '/hospital' : '/'} /> : <Login />} />
      <Route path="/signup" element={user ? <Navigate to="/" /> : <Signup />} />
      <Route path="/verify-otp" element={user ? <Navigate to="/" /> : <OtpVerify />} />

      <Route path="/" element={<ProtectedRoute>
        <AppLayout title="Home"><Home refreshUser={refreshUser} /></AppLayout>
      </ProtectedRoute>} />

      <Route path="/sos" element={<ProtectedRoute>
        <Sos />
      </ProtectedRoute>} />

      <Route path="/search" element={<ProtectedRoute>
        <AppLayout title="Find Blood"><Search /></AppLayout>
      </ProtectedRoute>} />

      <Route path="/alerts" element={<ProtectedRoute>
        <AppLayout title="Alerts"><Alerts unreadCount={unreadAlerts} setUnreadCount={setUnreadAlerts} /></AppLayout>
      </ProtectedRoute>} />

      <Route path="/profile" element={<ProtectedRoute>
        <AppLayout title="Profile"><Profile logout={handleLogout} refreshUser={refreshUser} /></AppLayout>
      </ProtectedRoute>} />

      <Route path="/donor" element={<ProtectedRoute>
        <AppLayout title="Donor Dashboard"><DonorDashboard refreshUser={refreshUser} /></AppLayout>
      </ProtectedRoute>} />

      <Route path="/hospital" element={<ProtectedRoute>
        <AppLayout title="Hospital Dashboard"><HospitalDashboard /></AppLayout>
      </ProtectedRoute>} />

      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
}
