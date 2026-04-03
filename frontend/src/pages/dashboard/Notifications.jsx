import { useState, useEffect } from 'react';
import { AnimatePresence } from 'framer-motion';
import { useNavigate } from '@tanstack/react-router';
import DashboardLayout from '../../components/DashboardLayout';
import axios from 'axios';

const backend_url = import.meta.env.VITE_BACKEND_URL;


export default function Notifications() {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user'));

  useEffect(() => {
    if (!user) { navigate({ to: '/login' }); return; }
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      const res = await axios.get(`${backend_url}/api/notifications`, { withCredentials: true });
      setNotifications(res.data.notifications || []);
      setUnreadCount(res.data.unreadCount || 0);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const markRead = async (id) => {
    try {
      await axios.put(`${backend_url}/api/notifications/read/${id}`, {}, { withCredentials: true });
      fetchNotifications();
    } catch (err) {
      console.error(err);
    }
  };

  const markAllRead = async () => {
    try {
      await axios.put(`${backend_url}/api/notifications/read-all`, {}, { withCredentials: true });
      fetchNotifications();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`${backend_url}/api/notifications/${id}`, { withCredentials: true });
      fetchNotifications();
    } catch (err) {
      console.error(err);
    }
  };

  const getIcon = (type) => {
    const icons = {
      booking: '📅', payment: '💰', reminder: '🔔', system: '⚙️', promotion: '🎉', review: '⭐'
    };
    return icons[type] || '📌';
  };

  const timeAgo = (date) => {
    const seconds = Math.floor((new Date() - new Date(date)) / 1000);
    if (seconds < 60) return 'Just now';
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    return `${Math.floor(seconds / 86400)}d ago`;
  };

  return (
    <DashboardLayout>
      <div>
        <style>{`
          @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@300;400;600&family=Cinzel:wght@400;600;700&family=Jost:wght@300;400;500&display=swap');
        `}</style>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4"
          style={{ background: 'linear-gradient(135deg, #4A3728, #8B6F47)', padding: 'clamp(24px, 4vw, 36px)' }}>
          <div>
            <span style={{ fontFamily: "'Cinzel', serif", fontSize: '8px', letterSpacing: '0.4em', color: 'rgba(201,169,110,0.6)', textTransform: 'uppercase', display: 'block', marginBottom: '8px' }}>
              Updates & Alerts
            </span>
            <h1 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 'clamp(1.4rem, 3vw, 2rem)', fontWeight: 300, color: '#fff' }}>
              Notifications {unreadCount > 0 && <span className="text-[#C9A96E] text-lg">({unreadCount})</span>}
            </h1>
          </div>
          {unreadCount > 0 && (
            <button onClick={markAllRead}
              className="px-5 py-2.5 text-xs uppercase tracking-widest font-bold transition-all hover:opacity-90"
              style={{ fontFamily: "'Cinzel', serif", background: 'rgba(201,169,110,0.2)', color: '#C9A96E', border: '1px solid rgba(201,169,110,0.3)' }}>
              Mark All Read
            </button>
          )}
        </motion.div>

        {loading ? (
          <div className="text-center py-16 text-gray-400">Loading...</div>
        ) : notifications.length === 0 ? (
          <div className="border border-dashed border-[rgba(139,111,71,0.2)] p-16 text-center">
            <p className="text-3xl mb-3">🔔</p>
            <h3 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '1.3rem', color: '#4A3728' }}>All caught up!</h3>
            <p className="text-gray-400 text-sm mt-2">No notifications at the moment.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {notifications.map((n, i) => (
              <motion.div key={n._id} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.03 }}
                className="flex items-start gap-4 p-4 transition-all hover:shadow-sm cursor-pointer"
                style={{
                  background: n.is_read ? '#fff' : '#FEFCF9',
                  borderLeft: n.is_read ? '2px solid transparent' : '2px solid #C9A96E',
                  border: '1px solid rgba(139,111,71,0.08)'
                }}
                onClick={() => !n.is_read && markRead(n._id)}
              >
                <span className="text-xl flex-shrink-0 mt-0.5">{getIcon(n.type)}</span>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-start gap-2">
                    <h4 className={`text-sm ${n.is_read ? 'text-gray-500' : 'text-[#4A3728] font-medium'}`}>{n.title}</h4>
                    <span className="text-xs text-gray-400 whitespace-nowrap flex-shrink-0">{timeAgo(n.createdAt)}</span>
                  </div>
                  <p className="text-sm text-gray-400 mt-1 truncate">{n.message}</p>
                </div>
                <button onClick={(e) => { e.stopPropagation(); handleDelete(n._id); }}
                  className="text-gray-300 hover:text-red-400 transition-colors flex-shrink-0">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                  </svg>
                </button>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
