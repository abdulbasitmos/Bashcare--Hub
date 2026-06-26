import { useState, useEffect, useCallback } from 'react';
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

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          { label: t('appointments'), value: stats.appointments, icon: <Calendar />, color: 'text-[#2563EB]', bg: 'bg-blue-50/50 ' },
          { label: t('records'), value: stats.records, icon: <FileText />, color: 'text-purple-600', bg: 'bg-purple-50 ' },
          { label: t('prescriptions'), value: stats.prescriptions, icon: <Pill />, color: 'text-emerald-600', bg: 'bg-emerald-50 ' },
        ].map((stat, i) => (
          <motion.div 
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="bg-white  p-6 rounded-[24px] shadow-sm hover:shadow-md transition-shadow fade-in hover:shadow-md transition-all duration-300 border border-gray-200  transition-colors"
          >
            <div className={`p-4 rounded-2xl w-fit mb-4 ${stat.bg} ${stat.color} `}>
              {stat.icon}
            </div>
            <p className="text-2xl font-black text-slate-900 ">{stat.value}</p>
            <p className="text-xs font-bold text-slate-500 (--text-secondary)] uppercase tracking-wider mt-1">{stat.label}</p>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <section className="lg:col-span-2 space-y-8">
            <div className="bg-white  p-8 rounded-[24px] shadow-sm hover:shadow-md transition-shadow fade-in hover:shadow-md transition-all duration-300 border border-gray-200  transition-colors">
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-xl font-bold text-slate-900 ">Upcoming Appointments</h2>
                <button className="text-xs font-bold text-[#2563EB] hover:text-blue-700 ">View All</button>
              </div>
              <div className="text-center py-12 text-slate-500 ">No upcoming appointments.</div>
            </div>
            <HealthTrends />

            {/* System Announcements */}
            <div className="bg-white  p-8 rounded-[24px] shadow-sm hover:shadow-md transition-shadow fade-in hover:shadow-md transition-all duration-300 border border-gray-200  transition-colors">
              <h2 className="text-xl font-bold text-slate-900  mb-6">System Announcements</h2>
              <div className="space-y-6">
                {announcements.length > 0 ? announcements.map((ann, i) => (
                  <div key={ann._id || ann.id || i} className="p-6 bg-white  rounded-[24px] border border-slate-100  space-y-4">
                    <div>
                      <h4 className="font-bold text-slate-900  mb-1">{ann.title}</h4>
                      <p className="text-sm text-gray-600 ">{ann.content}</p>
                      <p className="text-[10px] text-slate-500 font-bold mt-2 uppercase">
                        {ann.createdAt ? new Date(ann.createdAt).toLocaleString() : ann.date}
                      </p>
                    </div>

                    {/* Comments Display */}
                    <div className="border-t border-slate-200/60  pt-4">
                      <h5 className="text-xs font-bold text-slate-500 uppercase mb-3 flex items-center gap-1.5">
                        <MessageSquare size={14} /> Comments ({ann.comments?.length || 0})
                      </h5>
                      {ann.comments && ann.comments.length > 0 ? (
                        <div className="space-y-3 max-h-48 overflow-y-auto mb-3 pr-2">
                          {ann.comments.map((comment, idx) => (
                            <div key={comment._id || idx} className="p-3 bg-white  rounded-2xl shadow-sm hover:shadow-md transition-shadow fade-in hover:shadow-md transition-all duration-300 border border-slate-100  text-xs">
                              <div className="flex justify-between items-center mb-1">
                                <span className="font-bold text-slate-900 ">{comment.userName}</span>
                                <span className="text-[9px] text-slate-500">
                                  {new Date(comment.createdAt).toLocaleString()}
                                </span>
                              </div>
                              <p className="text-gray-600  font-medium">{comment.text}</p>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-xs text-slate-500 italic mb-3">No comments yet.</p>
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
                          className="flex-grow bg-white  border border-slate-200  rounded-xl px-4 py-2 text-xs focus:ring-2 focus:ring-blue-500/20 text-slate-900 "
                        />
                        <button
                          onClick={() => handleAddComment(ann._id || ann.id)}
                          className="p-2 bg-[#2563EB] text-white rounded-xl hover:bg-blue-700 transition-all active:scale-95"
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
        </section>

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

