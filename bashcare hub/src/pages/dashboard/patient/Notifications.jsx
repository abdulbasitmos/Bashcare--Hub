import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { 
  Bell, 
  Calendar, 
  MessageSquare, 
  Pill, 
  AlertTriangle, 
  MoreVertical,
  Circle,
  Clock,
  Loader2
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { db } from '../../../utils/db';

const Notifications = ({ user }) => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchNotifications = useCallback(async () => {
    try {
      const data = await db.getNotifications(user.id);
      setNotifications(data);
    } catch (err) {
      console.error("Error fetching notifications:", err);
    } finally {
      setLoading(false);
    }
  }, [user.id]);

  useEffect(() => {
    const load = async () => {
      await fetchNotifications();
    };
    load();
  }, [user.id, fetchNotifications]);

  const markAsRead = async (id) => {
    try {
      await db.markNotificationRead(id);
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
    } catch (err) {
      console.error("Error marking notification as read:", err);
    }
  };

  const deleteNotification = async (id) => {
    // There's no delete notification API in db.js, let's just hide it from UI or add it if needed
    // For now, let's just filter it out from state
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const markAllRead = async () => {
    try {
      const unread = notifications.filter(n => !n.read);
      await Promise.all(unread.map(n => db.markNotificationRead(n.id)));
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    } catch (err) {
      console.error("Error marking all as read:", err);
    }
  };

  const getIcon = (type) => {
    switch (type) {
      case 'appointment': return <Calendar size={18} className="text-[var(--color-primary)]" />;
      case 'message': return <MessageSquare size={18} className="text-green-600" />;
      case 'prescription': return <Pill size={18} className="text-purple-600" />;
      case 'system': return <AlertTriangle size={18} className="text-amber-600" />;
      default: return <Bell size={18} className="text-gray-600" />;
    }
  };

  const getBg = (type) => {
    switch (type) {
      case 'appointment': return 'bg-[#f8fafc]';
      case 'message': return 'bg-green-50';
      case 'prescription': return 'bg-purple-50';
      case 'system': return 'bg-amber-50';
      default: return 'bg-[#f8fafc]';
    }
  };

  if (loading) return (
    <div className="p-20 text-center">
      <Loader2 className="w-12 h-12 text-[var(--color-primary)] animate-spin mx-auto mb-4" />
      <p className="text-slate-500 font-bold">Loading notifications...</p>
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Notifications</h1>
          <p className="text-slate-500 text-sm">Stay updated with your latest health activities.</p>
        </div>
        {notifications.some(n => !n.read) && (
          <button 
            onClick={markAllRead}
            className="text-sm font-bold text-[var(--color-primary)] hover:underline"
          >
            Mark all as read
          </button>
        )}
      </div>

      <div className="bg-[var(--bg-secondary)] rounded-[3rem] shadow-sm hover:shadow-md transition-shadow fade-in hover:shadow-md transition-all duration-300 border border-[var(--border-primary)] overflow-hidden">
        <div className="divide-y divide-gray-50">
          <AnimatePresence initial={false}>
            {notifications.map((notif) => (
              <motion.div
                key={notif.id}
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, x: 20 }}
                className={`p-6 flex items-start gap-4 transition-colors group relative ${notif.read ? 'opacity-70' : 'bg-[#f8fafc]/20'}`}
              >
                {!notif.read && (
                  <div className="absolute left-0 top-0 bottom-0 w-1 bg-[var(--color-primary)]"></div>
                )}
                
                <div className={`p-3 rounded-2xl ${getBg(notif.type)} shrink-0`}>
                  {getIcon(notif.type)}
                </div>
                
                <div className="flex-grow">
                  <div className="flex items-center justify-between mb-1">
                    <h3 className={`text-sm font-bold ${notif.read ? 'text-gray-600' : 'text-slate-900'}`}>{notif.title}</h3>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-1">
                        <Clock size={10} /> {new Date(notif.createdAt).toLocaleDateString()}
                      </span>
                      <div className="relative group/menu">
                        <button className="p-1 text-gray-300 hover:text-gray-600 rounded-lg">
                          <MoreVertical size={16} />
                        </button>
                      </div>
                    </div>
                  </div>
                  <p className="text-sm text-slate-500 leading-relaxed pr-8">{notif.message}</p>
                  
                  {notif.link && (
                    <div className="mt-2.5">
                      <Link 
                        to={notif.link}
                        onClick={() => !notif.read && markAsRead(notif.id)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 text-[var(--color-primary)] text-xs font-bold rounded-xl hover:bg-blue-100 transition-colors"
                      >
                        View Details →
                      </Link>
                    </div>
                  )}
                  
                  <div className="flex items-center gap-4 mt-3 opacity-0 group-hover:opacity-100 transition-opacity">
                    {!notif.read && (
                      <button 
                        onClick={() => markAsRead(notif.id)}
                        className="text-[10px] font-black text-[var(--color-primary)] uppercase tracking-widest hover:underline"
                      >
                        Mark as read
                      </button>
                    )}
                    <button 
                      onClick={() => deleteNotification(notif.id)}
                      className="text-[10px] font-black text-[#EF4444] uppercase tracking-widest hover:underline"
                    >
                      Delete
                    </button>
                  </div>
                </div>

                {!notif.read && (
                  <Circle size={8} fill="currentColor" className="text-[var(--color-primary)] absolute right-6 top-10" />
                )}
              </motion.div>
            ))}
          </AnimatePresence>

          {notifications.length === 0 && (
            <div className="p-20 text-center">
              <div className="bg-[#f8fafc] w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Bell size={32} className="text-gray-300" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">No notifications</h3>
              <p className="text-slate-500 text-sm mt-1">You're all caught up!</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Notifications;

