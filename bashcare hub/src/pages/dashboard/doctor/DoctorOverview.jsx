import { useState, useEffect, useCallback } from 'react';
import {
  Users,
  FileText,
  Wallet,
  Clock,
  ChevronRight,
  Send,
  MessageSquare,
  Bell,
  Calendar,
  Video,
  MapPin,
  CheckCircle2,
  XCircle,
  Loader2,
} from 'lucide-react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { db } from '../../../utils/db';

const DoctorOverview = ({ user }) => {
  const navigate = useNavigate();
  const [stats, setStats] = useState([]);
  const [patientQueue, setPatientQueue] = useState([]);
  const [pendingBookings, setPendingBookings] = useState([]);
  const [recentRecords, setRecentRecords] = useState([]);
  const [announcements, setAnnouncements] = useState([]);
  const [commentTexts, setCommentTexts] = useState({});
  const [loading, setLoading] = useState(true);
  const [quickUpdating, setQuickUpdating] = useState(null);

  const fetchData = useCallback(async () => {
    try {
      const [doctorAppts, doctorRecords, allAnnouncements] = await Promise.all([
        db.getDoctorAppointments(user.id),
        db.getDoctorRecords(user.id),
        db.getAnnouncements()
      ]);

      const today = new Date().toISOString().split('T')[0];
      const todayAppts = doctorAppts.filter(a => a.date === today && a.status === 'confirmed');
      const pending = doctorAppts.filter(a => a.status === 'pending');

      const patientIds = [...new Set(doctorAppts.map(a => a.patientId))];
      const filteredAnnouncements = allAnnouncements.filter(a =>
        a.target === 'all' || a.target === 'doctor' || a.targetRole === 'all' || a.targetRole === 'doctor'
      );

      setStats([
        { label: "Today's Appts", value: todayAppts.length.toString(), icon: <Clock className="text-[var(--color-primary)]" />, bg: 'bg-[#f8fafc] dark:bg-slate-800' },
        { label: 'Total Patients', value: patientIds.length.toString(), icon: <Users className="text-green-600" />, bg: 'bg-green-50 dark:bg-green-900/20' },
        { label: 'Consultations', value: doctorRecords.length.toString(), icon: <FileText className="text-purple-600" />, bg: 'bg-purple-50 dark:bg-purple-900/20' },
        { label: 'Pending Queue', value: pending.length.toString(), icon: <Bell className="text-amber-600" />, bg: 'bg-amber-50 dark:bg-amber-900/20' },
      ]);

      setPatientQueue(todayAppts.slice(0, 3));
      setPendingBookings(pending.slice(0, 4));
      setRecentRecords(doctorRecords.slice(0, 3));
      setAnnouncements(filteredAnnouncements.slice(0, 5));
      setLoading(false);
    } catch (error) {
      console.error('Error fetching data:', error);
      setLoading(false);
    }
  }, [user.id]);

  const handleQuickAction = useCallback(async (appointmentId, patientId, action) => {
    setQuickUpdating(appointmentId);
    try {
      await db.updateAppointment(appointmentId, { status: action });
      await db.addNotification({
        userId: patientId,
        title: action === 'confirmed' ? '✅ Appointment Confirmed!' : '❌ Appointment Declined',
        message: action === 'confirmed'
          ? `Dr. ${user.name} has confirmed your appointment request.`
          : `Dr. ${user.name} has declined your appointment request. Please rebook.`,
        type: 'appointment',
      });
      await fetchData();
    } catch (e) {
      console.error('Quick action error:', e);
    } finally {
      setQuickUpdating(null);
    }
  }, [user.name, fetchData]);

  const handleAddComment = async (announcementId) => {
    const text = commentTexts[announcementId];
    if (!text || !text.trim()) return;
    try {
      await db.addAnnouncementComment(announcementId, text.trim());
      setCommentTexts(prev => ({ ...prev, [announcementId]: '' }));
      await fetchData();
    } catch (error) {
      console.error("Error adding comment:", error);
    }
  };

  useEffect(() => {
    const load = async () => {
      await fetchData();
    };
    load();
  }, [fetchData]);

  if (loading) return <div className="p-8 text-center font-bold text-slate-500">Loading clinical overview...</div>;

  return (
    <main className="space-y-8">
      {/* Header */}
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100">Clinical Overview 🩺</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">You have {stats[0]?.value || '0'} confirmed appointments for today.</p>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 rounded-xl font-bold text-sm border border-green-100 dark:border-green-800">
          <div className="w-2 h-2 bg-[#22C55E] rounded-full animate-pulse"></div>
          Live Status: Active
        </div>
      </div>

      {/* ── Pending Bookings Inbox ── */}
      {pendingBookings.length > 0 && (
        <div className="bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-700 rounded-[28px] overflow-hidden">
          <div className="flex items-center justify-between px-6 py-4 border-b border-amber-200 dark:border-amber-700">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-amber-100 dark:bg-amber-900/40 rounded-xl">
                <Bell size={18} className="text-amber-600 dark:text-amber-400" />
              </div>
              <div>
                <h2 className="font-black text-slate-900 dark:text-slate-100">Pending Booking Requests</h2>
                <p className="text-xs text-amber-700 dark:text-amber-400 font-semibold">
                  {pendingBookings.length} patient{pendingBookings.length > 1 ? 's are' : ' is'} waiting for your confirmation
                </p>
              </div>
            </div>
            <button
              onClick={() => navigate('/dashboard/doctor/queue')}
              className="flex items-center gap-1.5 text-sm font-bold text-[var(--color-primary)] hover:underline"
            >
              View All <ChevronRight size={16} />
            </button>
          </div>
          <div className="divide-y divide-amber-200/60 dark:divide-amber-700/40">
            {pendingBookings.map((booking) => (
              <div key={booking._id || booking.id} className="flex flex-col sm:flex-row sm:items-center gap-4 p-5 hover:bg-amber-100/50 dark:hover:bg-amber-900/20 transition-colors">
                {/* Avatar */}
                <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 text-white font-black text-base flex items-center justify-center flex-shrink-0">
                  {(booking.patientName || 'P').split(' ').map(n => n[0]).join('').toUpperCase().slice(0,2)}
                </div>
                {/* Info */}
                <div className="flex-grow min-w-0">
                  <p className="font-black text-slate-900 dark:text-slate-100">{booking.patientName}</p>
                  <div className="flex flex-wrap gap-2 mt-1">
                    <span className="flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400 font-semibold">
                      <Calendar size={11} /> {new Date(booking.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </span>
                    <span className="flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400 font-semibold">
                      <Clock size={11} /> {booking.time}
                    </span>
                    <span className={`flex items-center gap-1 text-xs font-bold px-2 py-0.5 rounded-full ${
                      booking.appointmentType === 'online'
                        ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400'
                        : 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400'
                    }`}>
                      {booking.appointmentType === 'online' ? <Video size={10} /> : <MapPin size={10} />}
                      {booking.appointmentType === 'online' ? 'Online' : 'In-Person'}
                    </span>
                  </div>
                  {booking.reason && (
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 truncate">Reason: {booking.reason}</p>
                  )}
                </div>
                {/* Quick Actions */}
                <div className="flex items-center gap-2 flex-shrink-0">
                  <button
                    onClick={() => handleQuickAction(booking._id || booking.id, booking.patientId, 'confirmed')}
                    disabled={quickUpdating === (booking._id || booking.id)}
                    className="flex items-center gap-1.5 px-4 py-2 bg-green-500 text-white rounded-xl text-xs font-bold hover:bg-green-600 transition-all disabled:opacity-60"
                  >
                    {quickUpdating === (booking._id || booking.id) ? <Loader2 size={13} className="animate-spin" /> : <CheckCircle2 size={13} />}
                    Accept
                  </button>
                  <button
                    onClick={() => navigate('/dashboard/doctor/queue')}
                    className="flex items-center gap-1.5 px-4 py-2 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-600 rounded-xl text-xs font-bold hover:bg-slate-50 transition-all"
                  >
                    Review
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, i) => (
          <motion.div 
            key={stat.label}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.1 }}
            className="bg-[var(--bg-secondary)] p-6 rounded-[24px] shadow-sm hover:shadow-md transition-shadow fade-in hover:shadow-md transition-all duration-300 border border-[var(--border-primary)] flex items-center gap-4"
          >
            <div className={`p-4 rounded-2xl ${stat.bg}`}>
              {stat.icon}
            </div>
            <div>
              <p className="text-2xl font-black text-slate-900">{stat.value}</p>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">{stat.label}</p>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Live Queue */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-[var(--bg-secondary)] rounded-[24px] shadow-sm hover:shadow-md transition-shadow fade-in hover:shadow-md transition-all duration-300 border border-[var(--border-primary)] overflow-hidden">
            <div className="p-6 border-b border-gray-50 flex items-center justify-between">
              <h2 className="text-xl font-bold text-slate-900">Today's Confirmed Queue</h2>
              <button onClick={() => navigate('/dashboard/doctor/queue')} className="text-sm font-bold text-[var(--color-primary)] hover:underline">Full Queue</button>
            </div>
            <div className="divide-y divide-gray-50">
              {patientQueue.length > 0 ? patientQueue.map((patient, i) => (
                <div key={i} className="p-6 flex items-center justify-between hover:bg-[#f8fafc]/50 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center font-bold text-slate-500">
                      {patient.patientName.split(' ').map(n => n[0]).join('')}
                    </div>
                    <div>
                      <p className="font-bold text-slate-900">{patient.patientName}</p>
                      <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
                        <Clock size={12} /> {patient.time} • <span className="text-blue-500">Scheduled</span>
                      </div>
                    </div>
                  </div>
                  <div className="hidden md:block">
                    <p className="text-xs font-bold text-slate-500 uppercase mb-1 tracking-wider">Reason</p>
                    <p className="text-sm font-medium text-slate-500">{patient.reason}</p>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="px-3 py-1 rounded-full text-[10px] font-bold uppercase bg-green-50 text-green-600">
                      Confirmed
                    </span>
                    <button className="p-2 hover:bg-[#f8fafc] rounded-xl transition-colors">
                      <ChevronRight size={20} className="text-slate-500" />
                    </button>
                  </div>
                </div>
              )) : (
                <div className="p-12 text-center text-slate-500 font-medium">
                  No confirmed appointments for today.
                </div>
              )}
            </div>
          </div>

          {/* Announcements */}
          <div className="bg-[var(--bg-secondary)] p-8 rounded-[24px] shadow-sm hover:shadow-md transition-shadow fade-in hover:shadow-md transition-all duration-300 border border-[var(--border-primary)]">
            <h2 className="text-xl font-bold text-slate-900 mb-6">System Announcements</h2>
            <div className="space-y-6">
              {announcements.length > 0 ? announcements.map((ann, i) => (
                <div key={ann._id || ann.id || i} className="p-6 bg-white rounded-[24px] border border-slate-100 space-y-4">
                  <div>
                    <h4 className="font-bold text-slate-900 mb-1">{ann.title}</h4>
                    <p className="text-sm text-gray-600">{ann.content}</p>
                    <p className="text-[10px] text-slate-500 font-bold mt-2 uppercase">
                      {ann.createdAt ? new Date(ann.createdAt).toLocaleString() : ann.date}
                    </p>
                  </div>

                  {/* Comments Display */}
                  <div className="border-t border-slate-200/60 pt-4">
                    <h5 className="text-xs font-bold text-slate-500 uppercase mb-3 flex items-center gap-1.5">
                      <MessageSquare size={14} /> Comments ({ann.comments?.length || 0})
                    </h5>
                    {ann.comments && ann.comments.length > 0 ? (
                      <div className="space-y-3 max-h-48 overflow-y-auto mb-3 pr-2">
                        {ann.comments.map((comment, idx) => (
                          <div key={comment._id || idx} className="p-3 bg-white rounded-2xl shadow-sm hover:shadow-md transition-shadow fade-in hover:shadow-md transition-all duration-300 border border-slate-100 text-xs">
                            <div className="flex justify-between items-center mb-1">
                              <span className="font-bold text-slate-900">{comment.userName}</span>
                              <span className="text-[9px] text-slate-500">
                                {new Date(comment.createdAt).toLocaleString()}
                              </span>
                            </div>
                            <p className="text-gray-600 font-medium">{comment.text}</p>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-xs text-slate-500 italic mb-3">No comments yet. Be the first to leave one!</p>
                    )}

                    {/* New Comment Form */}
                    <div className="flex gap-2 items-center">
                      <input
                        type="text"
                        placeholder="Write a comment..."
                        value={commentTexts[ann._id || ann.id] || ''}
                        onChange={(e) => setCommentTexts({ ...commentTexts, [ann._id || ann.id]: e.target.value })}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            handleAddComment(ann._id || ann.id);
                          }
                        }}
                        className="flex-grow bg-white border border-slate-200 rounded-xl px-4 py-2 text-xs focus:ring-2 focus:ring-blue-500/20 text-slate-900"
                      />
                      <button
                        onClick={() => handleAddComment(ann._id || ann.id)}
                        className="p-2 bg-[var(--color-primary)] text-white rounded-xl hover:bg-blue-700 transition-all active:scale-95"
                      >
                        <Send size={14} />
                      </button>
                    </div>
                  </div>
                </div>
              )) : (
                <p className="text-center text-slate-500 font-medium py-4">No recent announcements</p>
              )}
            </div>
          </div>
        </div>

        {/* Sidebar Column */}
        <div className="space-y-8">
          {/* Action Cards */}
          <div className="bg-[var(--color-primary)] p-8 rounded-[24px] text-white shadow-xl shadow-blue-600/20">
            <h3 className="text-xl font-bold mb-2">New Consultation</h3>
            <p className="text-sm text-blue-100 mb-6">Start a new clinical record for your patient.</p>
            <button 
              onClick={() => navigate('/dashboard/doctor/consultations')}
              className="w-full py-3 bg-[var(--bg-secondary)] text-[var(--color-primary)] rounded-2xl font-bold text-sm hover:bg-[#f8fafc] transition-all"
            >
              Open Records
            </button>
          </div>

          {/* Consultation History */}
          <div className="bg-[var(--bg-secondary)] p-6 rounded-[24px] shadow-sm hover:shadow-md transition-shadow fade-in hover:shadow-md transition-all duration-300 border border-[var(--border-primary)]">
            <h3 className="text-lg font-bold text-slate-900 mb-6">Recent Records</h3>
            <div className="space-y-6">
              {recentRecords.length > 0 ? recentRecords.map((record, i) => (
                <div key={i} className="flex items-center gap-4">
                  <div className="p-3 bg-white text-slate-400 rounded-xl">
                    <FileText size={18} />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-900">{record.patientName}</p>
                    <p className="text-[11px] text-slate-500 font-medium">{record.diagnosis} • {new Date(record.date).toLocaleDateString()}</p>
                  </div>
                </div>
              )) : (
                <p className="text-center text-slate-500 text-sm font-medium">No recent records</p>
              )}
            </div>
            <button 
              onClick={() => navigate('/dashboard/doctor/consultations')}
              className="w-full mt-8 py-3 bg-white text-slate-500 rounded-2xl font-bold text-xs hover:bg-white transition-all"
            >
              Access Archives
            </button>
          </div>
        </div>
      </div>
    </main>
  );
};

export default DoctorOverview;


