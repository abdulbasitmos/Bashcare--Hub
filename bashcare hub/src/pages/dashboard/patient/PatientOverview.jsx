import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Calendar, 
  Pill, 
  FileText, 
  Plus, 
  MessageSquare,
  Send
} from 'lucide-react';
import { motion } from 'framer-motion';
import { db } from '../../../utils/db';
import { useGlobalSettings } from '../../../context/GlobalSettingsContext';
import QuickActions from '../../../components/dashboard/QuickActions';
import GoalTracker from '../../../components/dashboard/GoalTracker';
import HealthTrends from '../../../components/dashboard/HealthTrends';
import WellnessReportGenerator from '../../../components/dashboard/WellnessReportGenerator';
import VitalsLogger from '../../../components/dashboard/VitalsLogger';

const PatientOverview = ({ user }) => {
  const navigate = useNavigate();
  const { t } = useGlobalSettings();
  const [stats, setStats] = useState({ appointments: 0, records: 0, prescriptions: 0 });
  const [announcements, setAnnouncements] = useState([]);
  const [commentTexts, setCommentTexts] = useState({});
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    try {
      const [appts, records, prescs, allAnnouncements] = await Promise.all([
        db.getAppointments(),
        db.getRecords(),
        db.getPrescriptions(),
        db.getAnnouncements()
      ]);
      setStats({
        appointments: appts.length,
        records: records.length,
        prescriptions: prescs.length
      });
      
      const filteredAnnouncements = allAnnouncements.filter(a => 
        a.target === 'all' || a.target === 'patient' || a.targetRole === 'all' || a.targetRole === 'patient'
      );
      setAnnouncements(filteredAnnouncements.slice(0, 5));
    } catch (err) {
      console.error("Fetch error:", err);
    } finally {
      setLoading(false);
    }
  }, [user.id]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

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

  if (loading) return <div className="p-8 text-center font-bold text-slate-500 (--text-secondary)]">Loading dashboard...</div>;

  const currentDayName = new Date().toLocaleDateString('en-US', { weekday: 'long' });
  const currentDateString = new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  const currentTimeString = new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });

  return (
    <div className="space-y-8 max-w-[1600px] mx-auto">
      
      {/* Welcome Banner Card */}
      <div className="bg-gradient-to-r from-[#2563EB] to-[#4F46E5] rounded-[32px] p-8 text-white relative overflow-hidden shadow-lg shadow-blue-500/10">
        {/* Background blobs */}
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
              <h1 className="text-3xl font-black tracking-tight">Good Day, {user?.name}!</h1>
              <p className="text-white/80 text-sm mt-1">We hope you are having a nice {currentDayName}. Keep track of your health goals today.</p>
            </div>
          </div>

          {/* Stethoscope illustration */}
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

      {/* Sparkline stats cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          { label: t('appointments'), value: stats.appointments, icon: <Calendar />, color: 'text-[#2563EB]', bg: 'bg-blue-50/50 dark:bg-blue-950/30', trend: '+1 this week', positive: true },
          { label: t('records'), value: stats.records, icon: <FileText />, color: 'text-purple-600 dark:text-purple-400', bg: 'bg-purple-50/50 dark:bg-purple-950/30', trend: 'Latest updated', positive: true },
          { label: t('prescriptions'), value: stats.prescriptions, icon: <Pill />, color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-50/50 dark:bg-emerald-950/30', trend: 'Active prescriptions', positive: true },
        ].map((stat, i) => (
          <motion.div 
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800/40 rounded-[28px] p-6 shadow-[0_8px_30px_rgb(0,0,0,0.015)] space-y-4"
          >
            <div className="flex justify-between items-center text-[10px] font-bold text-slate-400 uppercase tracking-widest">
              <span>{stat.label}</span>
              <span className={`p-2 rounded-xl ${stat.bg} ${stat.color}`}>{stat.icon}</span>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-black text-slate-900 dark:text-slate-100">{stat.value}</span>
            </div>
            {/* Sparkline curve */}
            <div className="h-8 w-full pr-1">
              <svg className={`w-full h-full ${i === 0 ? 'text-blue-400' : i === 1 ? 'text-purple-400' : 'text-emerald-400'}`} viewBox="0 0 100 30" fill="none">
                <path d={i === 0 ? "M0 25 C15 28, 25 5, 45 18 C65 28, 80 8, 100 12" : i === 1 ? "M0 22 C10 18, 20 28, 40 10 C60 -2, 80 20, 100 8" : "M0 28 C20 18, 40 28, 60 5 C80 20, 90 12, 100 15"} stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              </svg>
            </div>
            <div className="text-[10px] font-bold text-slate-400">
              {stat.trend}
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <section className="lg:col-span-2 space-y-8">
          
          {/* Upcoming Appointments */}
          <div className="bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800/40 rounded-[28px] p-8 shadow-[0_8px_30px_rgb(0,0,0,0.015)]">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-base font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wide">Upcoming Appointments</h2>
              <button 
                onClick={() => navigate('/dashboard/patient/appointments')}
                className="text-xs font-bold text-[#2563EB] dark:text-teal-400 hover:underline cursor-pointer"
              >
                View All
              </button>
            </div>
            <div className="text-center py-12 text-slate-400 font-medium bg-slate-50/50 dark:bg-slate-800/20 rounded-[20px] border border-dashed border-slate-150 dark:border-slate-800">
              No upcoming appointments scheduled.
            </div>
          </div>

          <HealthTrends />

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
                            <p className="text-gray-600 dark:text-slate-350 font-medium">{comment.text}</p>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-xs text-slate-400 italic mb-3">No comments yet.</p>
                    )}

                    {/* New Comment Form */}
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
        </section>

        {/* Sidebar Widgets Column */}
        <div className="space-y-8">
          <QuickActions />
          <VitalsLogger user={user} />
          <GoalTracker user={user} />
          <WellnessReportGenerator user={user} />
        </div>
      </div>
    </div>
  );
};

export default PatientOverview;

