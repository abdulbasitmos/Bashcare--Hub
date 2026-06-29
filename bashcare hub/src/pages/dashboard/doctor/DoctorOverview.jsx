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

  if (loading) return <div className="p-8 text-center font-bold text-slate-500">Loading clinical overview...</div>;  const currentDayName = new Date().toLocaleDateString('en-US', { weekday: 'long' });
  const currentDateString = new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  const currentTimeString = new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });

  return (
    <main className="space-y-8 max-w-[1600px] mx-auto">
      {/* ── Pending Bookings Inbox ── */}
      {pendingBookings.length > 0 && (
        <div className="bg-amber-50/70 dark:bg-amber-900/10 backdrop-blur-md border border-amber-200 dark:border-amber-700/50 rounded-[28px] overflow-hidden shadow-sm">
          <div className="flex items-center justify-between px-6 py-4 border-b border-amber-200/50 dark:border-amber-700/30">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-amber-100 dark:bg-amber-900/40 rounded-xl">
                <Bell size={18} className="text-amber-600 dark:text-amber-400" />
              </div>
              <div>
                <h2 className="font-black text-slate-900 dark:text-slate-100 text-sm">Pending Booking Requests</h2>
                <p className="text-[11px] text-amber-700 dark:text-amber-400 font-semibold">
                  {pendingBookings.length} patient{pendingBookings.length > 1 ? 's are' : ' is'} waiting for your confirmation
                </p>
              </div>
            </div>
            <button
              onClick={() => navigate('/dashboard/doctor/queue')}
              className="flex items-center gap-1.5 text-xs font-bold text-[#2563EB] dark:text-teal-400 hover:underline"
            >
              View All <ChevronRight size={14} />
            </button>
          </div>
          <div className="divide-y divide-amber-200/40 dark:divide-amber-700/20">
            {pendingBookings.map((booking) => (
              <div key={booking._id || booking.id} className="flex flex-col sm:flex-row sm:items-center gap-4 p-5 hover:bg-amber-100/30 dark:hover:bg-amber-900/10 transition-colors">
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 text-white font-black text-xs flex items-center justify-center flex-shrink-0">
                  {(booking.patientName || 'P').split(' ').map(n => n[0]).join('').toUpperCase().slice(0,2)}
                </div>
                <div className="flex-grow min-w-0">
                  <p className="font-bold text-sm text-slate-900 dark:text-slate-100">{booking.patientName}</p>
                  <div className="flex flex-wrap gap-2 mt-1">
                    <span className="flex items-center gap-1 text-[11px] text-slate-500 dark:text-slate-400 font-semibold">
                      <Calendar size={10} /> {new Date(booking.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </span>
                    <span className="flex items-center gap-1 text-[11px] text-slate-500 dark:text-slate-400 font-semibold">
                      <Clock size={10} /> {booking.time}
                    </span>
                    <span className="bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 text-[10px] font-bold px-2 py-0.5 rounded-full">
                      {booking.appointmentType === 'online' ? 'Online' : 'In-Person'}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <button
                    onClick={() => handleQuickAction(booking._id || booking.id, booking.patientId, 'confirmed')}
                    disabled={quickUpdating === (booking._id || booking.id)}
                    className="flex items-center gap-1 px-3 py-2 bg-green-500 hover:bg-green-600 text-white rounded-xl text-[11px] font-bold transition-all disabled:opacity-60 cursor-pointer"
                  >
                    {quickUpdating === (booking._id || booking.id) ? <Loader2 size={12} className="animate-spin" /> : <CheckCircle2 size={12} />}
                    Accept
                  </button>
                  <button
                    onClick={() => navigate('/dashboard/doctor/queue')}
                    className="flex items-center gap-1 px-3 py-2 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 rounded-xl text-[11px] font-bold hover:bg-slate-50 transition-all cursor-pointer"
                  >
                    Review
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Main Grid: Left 2 cols, Right 1 col */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column (Span 2) */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Welcome Banner Card */}
          <div className="bg-gradient-to-r from-[#2563EB] to-[#4F46E5] rounded-[32px] p-8 text-white relative overflow-hidden shadow-lg shadow-blue-500/10">
            {/* Background elements */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-2xl pointer-events-none"></div>
            <div className="absolute bottom-0 left-1/3 w-32 h-32 bg-white/5 rounded-full blur-xl pointer-events-none"></div>

            <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="space-y-4">
                {/* Time Badge */}
                <div className="inline-flex items-center gap-2 bg-white/15 backdrop-blur-md px-4 py-1.5 rounded-full text-xs font-bold tracking-wide">
                  <Calendar size={13} />
                  <span>{currentDateString} • {currentTimeString}</span>
                </div>
                <div>
                  <h1 className="text-3xl font-black tracking-tight">Good Day, Dr. {user?.name ? user.name.split(' ').pop() : 'User'}!</h1>
                  <p className="text-white/80 text-sm mt-1">Have a Nice {currentDayName}!</p>
                </div>
              </div>

              {/* Decorative SVG Medical Banner Asset */}
              <div className="hidden md:block flex-shrink-0 pr-4">
                <svg className="w-24 h-24 text-white opacity-85" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M50 15C50 15 32 30 32 52C32 63.0457 40.0543 72.1 50 72.1C59.9457 72.1 68 63.0457 68 52C68 30 50 15 50 15Z" fill="currentColor" fillOpacity="0.1" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M50 40V64" stroke="currentColor" strokeWidth="3" strokeLinecap="round"/>
                  <path d="M38 52H62" stroke="currentColor" strokeWidth="3" strokeLinecap="round"/>
                  <circle cx="50" cy="52" r="28" stroke="currentColor" strokeWidth="2" strokeDasharray="3 3"/>
                </svg>
              </div>
            </div>
          </div>

          {/* Sparkline Stats Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            
            {/* Offline Work */}
            <div className="bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800/40 rounded-[28px] p-6 shadow-[0_8px_30px_rgb(0,0,0,0.015)] space-y-4">
              <div className="flex justify-between items-center text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">
                <span>Offline Work</span>
                <span className="w-1.5 h-1.5 rounded-full bg-red-500"></span>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-black text-slate-900 dark:text-slate-100">27</span>
                <span className="text-xs text-slate-500 font-medium">hospital patients</span>
              </div>
              {/* Sparkline curve */}
              <div className="h-10 w-full pr-1">
                <svg className="w-full h-full text-red-400" viewBox="0 0 100 30" fill="none">
                  <path d="M0 25 C15 28, 25 5, 45 18 C65 28, 80 8, 100 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                  <path d="M0 25 C15 28, 25 5, 45 18 C65 28, 80 8, 100 12 L100 30 L0 30 Z" fill="currentColor" fillOpacity="0.05"/>
                </svg>
              </div>
              <div className="flex justify-between items-center text-[10px] font-bold">
                <span className="text-red-500 bg-red-50 dark:bg-red-950/20 px-2 py-0.5 rounded-full">-6% than average</span>
              </div>
            </div>

            {/* Online Work */}
            <div className="bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800/40 rounded-[28px] p-6 shadow-[0_8px_30px_rgb(0,0,0,0.015)] space-y-4">
              <div className="flex justify-between items-center text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">
                <span>Online Work</span>
                <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-black text-slate-900 dark:text-slate-100">{stats[1]?.value || '9'}</span>
                <span className="text-xs text-slate-500 font-medium">online consults</span>
              </div>
              {/* Sparkline curve */}
              <div className="h-10 w-full pr-1">
                <svg className="w-full h-full text-green-400" viewBox="0 0 100 30" fill="none">
                  <path d="M0 22 C10 18, 20 28, 40 10 C60 -2, 80 20, 100 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                  <path d="M0 22 C10 18, 20 28, 40 10 C60 -2, 80 20, 100 8 L100 30 L0 30 Z" fill="currentColor" fillOpacity="0.05"/>
                </svg>
              </div>
              <div className="flex justify-between items-center text-[10px] font-bold">
                <span className="text-green-500 bg-green-50 dark:bg-green-950/20 px-2 py-0.5 rounded-full">+12% than average</span>
              </div>
            </div>

            {/* Lab Work */}
            <div className="bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800/40 rounded-[28px] p-6 shadow-[0_8px_30px_rgb(0,0,0,0.015)] space-y-4">
              <div className="flex justify-between items-center text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">
                <span>Laboratory Work</span>
                <span className="w-1.5 h-1.5 rounded-full bg-[#2563EB]"></span>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-black text-slate-900 dark:text-slate-100">19</span>
                <span className="text-xs text-slate-500 font-medium">lab analyses</span>
              </div>
              {/* Sparkline progress/flat curve */}
              <div className="h-10 w-full pr-1 flex items-center">
                <div className="w-full h-1 bg-blue-100 dark:bg-slate-800 rounded-full overflow-hidden">
                  <div className="w-[60%] h-full bg-[#2563EB]"></div>
                </div>
              </div>
              <div className="flex justify-between items-center text-[10px] font-bold">
                <span className="text-blue-600 bg-blue-50 dark:bg-blue-950/20 px-2 py-0.5 rounded-full">+0% than average</span>
              </div>
            </div>

          </div>

          {/* AI Clinic Insights & Anomaly Alerts */}
          <div className="bg-gradient-to-br from-purple-500/10 via-[#2563EB]/5 to-transparent dark:from-purple-950/20 dark:via-blue-950/10 dark:to-transparent border border-purple-100/60 dark:border-purple-900/30 rounded-[28px] p-6 sm:p-8 shadow-[0_8px_30px_rgb(0,0,0,0.01)] space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-purple-500 text-white rounded-xl flex items-center justify-center shadow-md animate-pulse">
                  ✨
                </div>
                <div>
                  <h3 className="font-black text-slate-800 dark:text-slate-200 text-base">AI Clinic Insights & Anomalies</h3>
                  <p className="text-xs text-slate-400 font-semibold">Real-time automation alerts & patient monitoring parameters</p>
                </div>
              </div>
              <span className="text-[10px] font-bold bg-purple-100 dark:bg-purple-950 text-purple-750 dark:text-purple-400 px-3 py-1 rounded-full uppercase tracking-wider">Active Analysis</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Alert 1 */}
              <div className="bg-white/80 dark:bg-slate-900/50 backdrop-blur-md border border-slate-100 dark:border-slate-800/60 rounded-2xl p-5 space-y-2 hover:-translate-y-0.5 transition-all">
                <div className="flex items-center gap-2 text-xs font-bold text-orange-600 dark:text-orange-400">
                  <span className="w-2 h-2 rounded-full bg-orange-500 animate-ping"></span>
                  <span>Vitals Anomaly</span>
                </div>
                <p className="text-xs font-semibold text-slate-700 dark:text-slate-350">
                  Patient <span className="font-bold text-slate-900 dark:text-slate-100">John Doe</span> logged 145/95 mmHg (Grade 1 Hypertension) today.
                </p>
                <button onClick={() => navigate('/dashboard/doctor/patients')} className="text-[10px] font-bold text-[#2563EB] dark:text-teal-400 hover:underline flex items-center gap-0.5 cursor-pointer bg-transparent border-none">
                  Review Patient <ChevronRight size={10} />
                </button>
              </div>

              {/* Alert 2 */}
              <div className="bg-white/80 dark:bg-slate-900/50 backdrop-blur-md border border-slate-100 dark:border-slate-800/60 rounded-2xl p-5 space-y-2 hover:-translate-y-0.5 transition-all">
                <div className="flex items-center gap-2 text-xs font-bold text-green-600 dark:text-green-400">
                  <span className="w-2 h-2 rounded-full bg-green-500"></span>
                  <span>Queue Efficiency</span>
                </div>
                <p className="text-xs font-semibold text-slate-700 dark:text-slate-350">
                  Average consultation wait time is <span className="font-bold text-slate-900 dark:text-slate-100">4.2 mins</span> today, 12% faster than weekly average.
                </p>
                <button onClick={() => navigate('/dashboard/doctor/queue')} className="text-[10px] font-bold text-[#2563EB] dark:text-teal-400 hover:underline flex items-center gap-0.5 cursor-pointer bg-transparent border-none">
                  Open Live Queue <ChevronRight size={10} />
                </button>
              </div>

              {/* Alert 3 */}
              <div className="bg-white/80 dark:bg-slate-900/50 backdrop-blur-md border border-slate-100 dark:border-slate-800/60 rounded-2xl p-5 space-y-2 hover:-translate-y-0.5 transition-all">
                <div className="flex items-center gap-2 text-xs font-bold text-blue-600 dark:text-blue-400">
                  <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                  <span>Satisfaction Rating</span>
                </div>
                <p className="text-xs font-semibold text-slate-700 dark:text-slate-350">
                  Patient satisfaction index is averaging <span className="font-bold text-slate-900 dark:text-slate-100">4.9/5.0⭐</span> based on 18 checkups this week.
                </p>
                <button onClick={() => navigate('/dashboard/doctor/analytics')} className="text-[10px] font-bold text-[#2563EB] dark:text-teal-400 hover:underline flex items-center gap-0.5 cursor-pointer bg-transparent border-none">
                  View Analytics <ChevronRight size={10} />
                </button>
              </div>
            </div>
          </div>

          {/* Busyness and Task Plans Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            
            {/* Scheduled Events / Busyness */}
            <div className="bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800/40 rounded-[28px] p-8 shadow-[0_8px_30px_rgb(0,0,0,0.015)]">
              <div className="flex justify-between items-center mb-6">
                <h3 className="font-bold text-slate-800 dark:text-slate-200 text-sm uppercase tracking-wide">My Scheduled Events</h3>
                <span className="text-xs bg-slate-50 dark:bg-slate-800 px-3 py-1 rounded-full text-slate-500 font-bold border border-slate-100 dark:border-slate-700">Today</span>
              </div>

              <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
                {/* Circular ring chart */}
                <div className="relative w-32 h-32 flex items-center justify-center flex-shrink-0">
                  <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                    <circle cx="18" cy="18" r="15.915" fill="none" stroke="#E2E8F0" strokeWidth="2.5" className="dark:stroke-slate-800"/>
                    <circle cx="18" cy="18" r="15.915" fill="none" stroke="#4F46E5" strokeWidth="2.5" strokeDasharray="95 5" strokeLinecap="round"/>
                  </svg>
                  <div className="absolute text-center">
                    <p className="text-2xl font-black text-slate-800 dark:text-slate-200">95%</p>
                    <p className="text-[9px] font-bold text-slate-400 uppercase">Busyness</p>
                  </div>
                </div>

                {/* Event list stats */}
                <div className="space-y-4 flex-grow w-full">
                  <div className="flex justify-between items-center text-xs">
                    <div className="flex items-center gap-2 font-semibold text-slate-600 dark:text-slate-400">
                      <span className="w-2.5 h-2.5 rounded-full bg-[#4F46E5]"></span>
                      <span>Consultations</span>
                    </div>
                    <span className="font-black text-slate-800 dark:text-slate-200">25</span>
                  </div>
                  <div className="flex justify-between items-center text-xs">
                    <div className="flex items-center gap-2 font-semibold text-slate-600 dark:text-slate-400">
                      <span className="w-2.5 h-2.5 rounded-full bg-[#F43F5E]"></span>
                      <span>Laboratory analyses</span>
                    </div>
                    <span className="font-black text-slate-800 dark:text-slate-200">10</span>
                  </div>
                  <div className="flex justify-between items-center text-xs">
                    <div className="flex items-center gap-2 font-semibold text-slate-600 dark:text-slate-400">
                      <span className="w-2.5 h-2.5 rounded-full bg-[#10B981]"></span>
                      <span>Meetings</span>
                    </div>
                    <span className="font-black text-slate-800 dark:text-slate-200">3</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Plans Completed */}
            <div className="bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800/40 rounded-[28px] p-8 shadow-[0_8px_30px_rgb(0,0,0,0.015)] flex flex-col justify-between">
              <div>
                <div className="flex justify-between items-center mb-6">
                  <h3 className="font-bold text-slate-800 dark:text-slate-200 text-sm uppercase tracking-wide">My Plans Done</h3>
                  <span className="text-xs bg-slate-50 dark:bg-slate-800 px-3 py-1 rounded-full text-slate-500 font-bold border border-slate-100 dark:border-slate-700">Today</span>
                </div>

                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-xs font-bold text-slate-600 dark:text-slate-400 mb-1">
                      <span>Consultations</span>
                      <span>64%</span>
                    </div>
                    <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                      <div className="h-full bg-indigo-600" style={{ width: '64%' }}></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-xs font-bold text-slate-600 dark:text-slate-400 mb-1">
                      <span>Analysis</span>
                      <span>50%</span>
                    </div>
                    <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                      <div className="h-full bg-coral-400 bg-orange-400" style={{ width: '50%' }}></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-xs font-bold text-slate-600 dark:text-slate-400 mb-1">
                      <span>Meetings</span>
                      <span>33%</span>
                    </div>
                    <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                      <div className="h-full bg-pink-500" style={{ width: '33%' }}></div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Add plan trigger */}
              <button 
                onClick={() => navigate('/dashboard/doctor/schedule')}
                className="mt-6 w-full py-3 border border-dashed border-slate-200 dark:border-slate-850 hover:bg-slate-50/50 dark:hover:bg-slate-800/30 rounded-xl text-xs font-bold text-[#2563EB] dark:text-teal-400 flex items-center justify-center gap-1.5 transition-all cursor-pointer"
              >
                Add plan +
              </button>
            </div>

          </div>

          {/* System Announcements */}
          <div className="bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800/40 rounded-[28px] p-8 shadow-[0_8px_30px_rgb(0,0,0,0.015)]">
            <h2 className="text-base font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wide mb-6">System Announcements</h2>
            <div className="space-y-6">
              {announcements.length > 0 ? announcements.map((ann, i) => (
                <div key={ann._id || ann.id || i} className="p-6 bg-slate-50/50 dark:bg-slate-800/30 rounded-[24px] border border-slate-100 dark:border-slate-800/50 space-y-4">
                  <div>
                    <h4 className="font-bold text-slate-900 dark:text-slate-100 mb-1">{ann.title}</h4>
                    <p className="text-sm text-gray-600 dark:text-slate-350">{ann.content}</p>
                    <p className="text-[10px] text-slate-500 font-bold mt-2 uppercase">
                      {ann.createdAt ? new Date(ann.createdAt).toLocaleString() : ann.date}
                    </p>
                  </div>

                  {/* Comments Display */}
                  <div className="border-t border-slate-200/60 dark:border-slate-700/40 pt-4">
                    <h5 className="text-[10px] font-bold text-slate-400 uppercase mb-3 flex items-center gap-1.5">
                      <MessageSquare size={12} /> Comments ({ann.comments?.length || 0})
                    </h5>
                    {ann.comments && ann.comments.length > 0 ? (
                      <div className="space-y-3 max-h-48 overflow-y-auto mb-3 pr-2 custom-scrollbar">
                        {ann.comments.map((comment, idx) => (
                          <div key={comment._id || idx} className="p-3 bg-white dark:bg-slate-900 rounded-2xl border border-slate-100/80 dark:border-slate-800/50 text-xs">
                            <div className="flex justify-between items-center mb-1">
                              <span className="font-bold text-slate-800 dark:text-slate-200">{comment.userName}</span>
                              <span className="text-[9px] text-slate-400">
                                {new Date(comment.createdAt).toLocaleString()}
                              </span>
                            </div>
                            <p className="text-gray-600 dark:text-slate-300 font-medium">{comment.text}</p>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-xs text-slate-400 italic mb-3">No comments yet.</p>
                    )}

                    {/* New Comment Input */}
                    <div className="flex gap-2 items-center">
                      <input
                        type="text"
                        placeholder="Write a comment..."
                        value={commentTexts[ann._id || ann.id] || ''}
                        onChange={(e) => setCommentTexts({ ...commentTexts, [ann._id || ann.id]: e.target.value })}
                        className="flex-grow bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-750 rounded-xl px-4 py-2 text-xs focus:ring-2 focus:ring-[#2563EB] text-slate-900 dark:text-slate-100 outline-none"
                      />
                      <button
                        onClick={() => handleAddComment(ann._id || ann.id)}
                        className="p-2 bg-[#2563EB] text-white rounded-xl hover:bg-blue-600 transition-all active:scale-95 cursor-pointer border-none flex items-center justify-center"
                      >
                        <Send size={12} />
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

        {/* Right Side Column (Span 1) */}
        <div className="space-y-8">
          
          {/* Profile Card */}
          <div className="bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800/40 rounded-[28px] overflow-hidden shadow-[0_8px_30px_rgb(0,0,0,0.015)]">
            <div className="bg-[#2563EB] p-4 flex justify-between items-center text-white">
              <h3 className="font-bold text-xs uppercase tracking-widest">My Profile</h3>
              <button 
                onClick={() => navigate('/dashboard/doctor/settings')}
                className="p-1.5 bg-white/15 hover:bg-white/25 rounded-lg border-none text-white cursor-pointer transition-colors"
              >
                <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M12 20h9"/><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z"/></svg>
              </button>
            </div>
            
            <div className="p-8 text-center space-y-6">
              {/* Picture */}
              <div className="relative w-20 h-20 mx-auto">
                <div className="w-20 h-20 rounded-full border-4 border-slate-50 dark:border-slate-800 bg-[#2563EB] text-white flex items-center justify-center font-black text-2xl uppercase overflow-hidden shadow-md">
                  {user?.profilePicture || user?.profileImage ? (
                    <img src={user.profilePicture || user.profileImage} alt="Profile" className="w-full h-full object-cover" />
                  ) : (
                    (user?.name || "D").charAt(0)
                  )}
                </div>
                <div className="absolute bottom-0 right-0 w-5 h-5 bg-[#10B981] border-2 border-white rounded-full"></div>
              </div>

              <div>
                <h4 className="text-lg font-black text-slate-850 dark:text-slate-100">Dr. {user?.name}</h4>
                <p className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider mt-0.5">Specialist Practitioner</p>
                <p className="text-[11px] text-slate-500 font-semibold flex items-center justify-center gap-1 mt-2">
                  <MapPin size={12} className="text-slate-400" /> Bottrop, Germany
                </p>
              </div>

              {/* Stats parameters */}
              <div className="grid grid-cols-3 gap-2 border-t border-slate-100 dark:border-slate-800 pt-6">
                <div>
                  <p className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider">Date Birth</p>
                  <p className="text-xs font-black text-slate-800 dark:text-slate-200 mt-1">17.07.86</p>
                </div>
                <div className="border-x border-slate-100 dark:border-slate-800">
                  <p className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider">Blood</p>
                  <p className="text-xs font-black text-slate-800 dark:text-slate-200 mt-1">A(II) Rh+</p>
                </div>
                <div>
                  <p className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider">Hours</p>
                  <p className="text-xs font-black text-slate-800 dark:text-slate-200 mt-1">9pm - 5am</p>
                </div>
              </div>
            </div>
          </div>

          {/* Calendar timeline events */}
          <div className="bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800/40 rounded-[28px] p-6 shadow-[0_8px_30px_rgb(0,0,0,0.015)]">
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-bold text-slate-850 dark:text-slate-200 text-xs uppercase tracking-widest">My Calendar</h3>
              <div className="relative">
                <select className="bg-slate-50 dark:bg-slate-800 border-none rounded-lg px-3 py-1 text-[11px] font-bold text-slate-600 dark:text-slate-400 focus:outline-none appearance-none cursor-pointer pr-5">
                  <option>April</option>
                  <option>May</option>
                  <option>June</option>
                </select>
                <ChevronRight size={10} className="absolute right-2 top-1/2 -translate-y-1/2 rotate-90 text-slate-400 pointer-events-none" />
              </div>
            </div>

            {/* Weekday List selector mockup */}
            <div className="grid grid-cols-7 text-center gap-1 mb-6">
              {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, idx) => (
                <div key={idx} className="text-[10px] font-bold text-slate-400 uppercase">{day}</div>
              ))}
              {[12, 13, 14, 15, 16, 17, 18].map((num, idx) => (
                <div 
                  key={idx} 
                  className={`py-2 rounded-xl text-xs font-bold cursor-pointer transition-all ${
                    idx === 1 
                      ? 'bg-[#2563EB] text-white shadow-md shadow-blue-500/10' 
                      : 'text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
                  }`}
                >
                  {num}
                </div>
              ))}
            </div>

            {/* Schedule timeline */}
            <div className="border-t border-slate-100 dark:border-slate-800 pt-6">
              <div className="flex justify-between items-center mb-4">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">April 13</span>
                <span className="text-[10px] font-black text-slate-400">•••</span>
              </div>

              <div className="space-y-4">
                {patientQueue.length > 0 ? patientQueue.map((item, idx) => (
                  <div key={idx} className="flex gap-4 items-start group">
                    <span className="text-[11px] font-bold text-slate-400 w-12 flex-shrink-0 pt-0.5">{item.time}</span>
                    <div className="flex-grow bg-slate-50 dark:bg-slate-800/40 hover:bg-blue-50/50 dark:hover:bg-blue-950/20 border border-slate-100 dark:border-slate-800 p-3 rounded-2xl transition-colors cursor-pointer">
                      <p className="text-xs font-bold text-slate-800 dark:text-slate-100 group-hover:text-[#2563EB] transition-colors">
                        Consultation with {item.patientName}
                      </p>
                      <p className="text-[10px] text-slate-400 mt-0.5 truncate">{item.reason}</p>
                    </div>
                  </div>
                )) : (
                  <div className="space-y-4">
                    <div className="flex gap-4 items-start">
                      <span className="text-[11px] font-bold text-slate-400 w-12 flex-shrink-0 pt-0.5">2:00 pm</span>
                      <div className="flex-grow bg-slate-50 dark:bg-slate-800/40 p-3 rounded-2xl border border-slate-100 dark:border-slate-800">
                        <p className="text-xs font-bold text-slate-800 dark:text-slate-100">Meeting with chief physician</p>
                        <p className="text-[10px] text-slate-400 mt-0.5">Clinical updates discussion</p>
                      </div>
                    </div>
                    <div className="flex gap-4 items-start">
                      <span className="text-[11px] font-bold text-slate-400 w-12 flex-shrink-0 pt-0.5">2:30 pm</span>
                      <div className="flex-grow bg-slate-50 dark:bg-slate-800/40 p-3 rounded-2xl border border-slate-100 dark:border-slate-800">
                        <p className="text-xs font-bold text-slate-800 dark:text-slate-100">Consultation with Patient</p>
                        <p className="text-[10px] text-slate-400 mt-0.5">Follow-up checkup</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

          </div>

          {/* Recent Records list */}
          <div className="bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800/40 rounded-[28px] p-6 shadow-[0_8px_30px_rgb(0,0,0,0.015)]">
            <h3 className="text-xs font-bold text-slate-850 dark:text-slate-200 uppercase tracking-widest mb-6">Recent Records</h3>
            <div className="space-y-5">
              {recentRecords.length > 0 ? recentRecords.map((record, i) => (
                <div key={i} className="flex items-center gap-4">
                  <div className="p-3 bg-slate-50 dark:bg-slate-800 text-slate-400 rounded-xl">
                    <FileText size={16} />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-800 dark:text-slate-200">{record.patientName}</p>
                    <p className="text-[10px] text-slate-400 font-bold">{record.diagnosis} • {new Date(record.date).toLocaleDateString()}</p>
                  </div>
                </div>
              )) : (
                <p className="text-center text-slate-500 text-xs font-medium py-2">No recent records</p>
              )}
            </div>
            <button 
              onClick={() => navigate('/dashboard/doctor/consultations')}
              className="w-full mt-6 py-3 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100/50 dark:hover:bg-slate-700/50 text-slate-500 dark:text-slate-400 rounded-xl font-bold text-xs transition-all border-none cursor-pointer"
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


