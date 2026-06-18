import { useState, useEffect } from 'react';
import { api } from '../api';

const TYPE_ICONS = { emergency: '🚨', match: '🩸', confirmation: '✅', info: 'ℹ️' };
const TYPE_COLORS = { emergency: 'border-accent-red/30 bg-accent-red/5', match: 'border-accent-blue/30 bg-accent-blue/5', confirmation: 'border-green-500/30 bg-green-500/5', info: 'border-yellow-500/30 bg-yellow-500/5' };

export default function Alerts({ unreadCount, setUnreadCount }) {
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadAlerts = async () => {
    try {
      const data = await api.getAlerts();
      setAlerts(data);
      setUnreadCount(data.filter(a => !a.isRead).length);
    } catch {} finally { setLoading(false); }
  };

  useEffect(() => { loadAlerts(); }, []);

  const markRead = async (id) => {
    try {
      await api.markAlertRead(id);
      setAlerts(prev => prev.map(a => a.id === id ? { ...a, isRead: 1 } : a));
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch {}
  };

  const formatDate = (dateStr) => {
    const d = new Date(dateStr);
    const now = new Date();
    const diff = now - d;
    if (diff < 60000) return 'Just now';
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
    return d.toLocaleDateString();
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">🔔 Alerts</h1>
          <p className="text-text-secondary text-sm mt-1">{unreadCount} unread notifications</p>
        </div>
        {unreadCount > 0 && (
          <button onClick={loadAlerts} className="chip text-xs text-accent-blue hover:bg-accent-blue/20 transition-all">Refresh</button>
        )}
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1,2,3,4].map(i => (
            <div key={i} className="glass p-4 animate-pulse">
              <div className="flex gap-3 items-center">
                <div className="w-10 h-10 rounded-full bg-white/10"></div>
                <div className="flex-1">
                  <div className="h-4 bg-white/10 rounded w-1/3 mb-2"></div>
                  <div className="h-3 bg-white/5 rounded w-2/3"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : alerts.length === 0 ? (
        <div className="glass p-8 text-center">
          <div className="text-4xl mb-3">🔔</div>
          <p className="text-text-secondary">No alerts yet</p>
          <p className="text-text-secondary text-sm mt-1">You'll see notifications here</p>
        </div>
      ) : (
        <div className="space-y-2">
          {alerts.map(alert => (
            <div key={alert.id}
              className={`glass p-4 border-l-4 ${TYPE_COLORS[alert.type] || 'border-border-subtle'} 
                transition-all duration-200 hover:-translate-y-0.5 cursor-pointer
                ${!alert.isRead ? 'ring-1 ring-accent-blue/20' : 'opacity-70'}`}
              onClick={() => !alert.isRead && markRead(alert.id)}
            >
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-lg flex-shrink-0">
                  {TYPE_ICONS[alert.type] || 'ℹ️'}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <h3 className={`text-sm font-semibold ${!alert.isRead ? 'text-text-primary' : 'text-text-secondary'}`}>
                      {alert.title}
                    </h3>
                    <span className="text-[10px] text-text-secondary flex-shrink-0">{formatDate(alert.createdAt)}</span>
                  </div>
                  <p className="text-xs text-text-secondary mt-1">{alert.description}</p>
                  {!alert.isRead && (
                    <button onClick={(e) => { e.stopPropagation(); markRead(alert.id); }}
                      className="text-[10px] text-accent-blue hover:underline mt-1">
                      Mark as read
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
