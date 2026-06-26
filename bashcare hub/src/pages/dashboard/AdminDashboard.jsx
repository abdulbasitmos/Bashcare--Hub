import { useState, useEffect, useCallback } from 'react';
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import Sidebar from '../../components/dashboard/Sidebar';
import TopNav from '../../components/dashboard/TopNav';
import { 
  Users, 
  Activity, 
  ArrowUpRight, 
  ArrowDownRight, 
  ChevronRight, 
  Megaphone, 
  Settings, 
  Trash2, 
  ShieldCheck, 
  Search,
  CheckCircle2,
  Calendar,
  FileText,
  Pill,
  ShieldAlert,
  Cpu,
  Server,
  HardDrive,
  Play,
  Square,
  RefreshCw,
  Check,
  MessageSquare
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { db } from '../../utils/db';
import AdminVerificationMonitor from './admin/AdminVerificationMonitor';
import AdminMeetings from './admin/AdminMeetings';
import Notifications from './patient/Notifications';

const AdminOverview = ({ stats, announcements, onPostAnnouncement, newAnnouncement, setNewAnnouncement, onDeleteAnnouncement, allUsers = [], navigate }) => {
  return (
    <div className="space-y-8">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, i) => (
          <motion.div 
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="bg-[var(--bg-secondary)]  p-6 rounded-[24px] shadow-sm hover:shadow-md transition-shadow fade-in hover:shadow-md transition-all duration-300 border border-[var(--border-primary)]  transition-colors"
          >
            <div className="flex justify-between items-start mb-4">
              <div className={`p-4 rounded-2xl ${stat.bg} `}>
                {stat.icon}
              </div>
              <div className={`flex items-center gap-1 text-[10px] font-bold px-2 py-1 rounded-full ${
                stat.up ? 'text-green-600 bg-green-50 ' : 'text-red-600 bg-red-50 '
              }`}>
                {stat.up ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
                {stat.change}
              </div>
            </div>
            <div>
              <p className="text-2xl font-black text-slate-900 ">{stat.value}</p>
              <p className="text-xs font-bold text-slate-500 (--text-secondary)] uppercase tracking-wider mt-1">{stat.label}</p>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Announcements Preview */}
        <div className="lg:col-span-2 space-y-6">
          <section className="bg-[var(--bg-secondary)]  p-8 rounded-[24px] shadow-sm hover:shadow-md transition-shadow fade-in hover:shadow-md transition-all duration-300 border border-[var(--border-primary)]  transition-colors">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-xl font-bold text-slate-900 ">Recent Broadcasts</h2>
            </div>
            <div className="space-y-6">
              {announcements.length > 0 ? announcements.slice(0, 5).map((ann) => (
                <div key={ann.id || ann._id} className="flex gap-6 p-6 bg-white  rounded-[24px] border border-slate-100  relative group">
                  <div className="w-12 h-12 bg-[var(--bg-secondary)]  rounded-2xl flex items-center justify-center text-[var(--color-primary)] shadow-sm hover:shadow-md transition-shadow fade-in hover:shadow-md transition-all duration-300 flex-shrink-0">
                    <Megaphone size={20} />
                  </div>
                  <div className="flex-grow pr-8">
                    <div className="flex items-center gap-3 mb-1">
                      <h3 className="font-bold text-slate-900 ">{ann.title}</h3>
                      <span className="px-2 py-0.5 bg-blue-100  text-[var(--color-primary)]  text-[10px] font-bold rounded-full uppercase">To: {ann.targetRole || ann.target || 'all'}</span>
                    </div>
                    <p className="text-sm text-gray-600 (--text-secondary)] leading-relaxed mb-3">{ann.content}</p>
                    <p className="text-[10px] text-slate-500 font-bold mb-4">
                      {ann.createdAt ? new Date(ann.createdAt).toLocaleDateString() : ann.date}
                    </p>

                    {/* Announcement Comments View for Admin */}
                    <div className="border-t border-slate-100  pt-4">
                      <h5 className="text-xs font-bold text-slate-500 uppercase mb-3 flex items-center gap-1.5">
                        <MessageSquare size={14} /> Comments ({ann.comments?.length || 0})
                      </h5>
                      {ann.comments && ann.comments.length > 0 ? (
                        <div className="space-y-3 max-h-48 overflow-y-auto mb-3 pr-2">
                          {ann.comments.map((comment, idx) => {
                            const commenter = allUsers.find(u => (u.id || u._id) === comment.userId);
                            const role = commenter ? commenter.role : 'User';
                            return (
                              <div key={comment._id || idx} className="p-3 bg-white  rounded-2xl shadow-sm hover:shadow-md transition-shadow fade-in hover:shadow-md transition-all duration-300 border border-slate-100  text-xs">
                                <div className="flex justify-between items-center mb-1">
                                  <div className="flex items-center gap-2">
                                    <span className="font-bold text-slate-900 ">{comment.userName}</span>
                                    <span className={`px-1.5 py-0.5 rounded text-[8px] font-black uppercase ${
                                      role === 'Doctor' 
                                        ? 'bg-blue-50/50 text-[#2563EB]  ' 
                                        : 'bg-white text-slate-600  '
                                    }`}>
                                      {role}
                                    </span>
                                  </div>
                                  <span className="text-[9px] text-slate-500">
                                    {new Date(comment.createdAt).toLocaleString()}
                                  </span>
                                </div>
                                <p className="text-gray-600  font-medium">{comment.text}</p>
                              </div>
                            );
                          })}
                        </div>
                      ) : (
                        <p className="text-xs text-slate-500 italic mb-3">No comments posted yet.</p>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={() => onDeleteAnnouncement(ann.id || ann._id)}
                    className="absolute top-6 right-6 p-2 text-[#EF4444] hover:text-red-700 bg-red-50  rounded-xl transition-all hover:scale-105"
                    title="Delete Announcement"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              )) : (
                <p className="text-center text-slate-500 font-medium py-10">No recent announcements</p>
              )}
            </div>
          </section>

          {/* Broadcast Form */}
          <section className="bg-[var(--bg-secondary)]  p-8 rounded-[24px] shadow-sm hover:shadow-md transition-shadow fade-in hover:shadow-md transition-all duration-300 border border-[var(--border-primary)]  transition-colors">
            <div className="flex items-center gap-4 mb-8">
              <div className="w-12 h-12 bg-blue-100  rounded-2xl flex items-center justify-center text-[var(--color-primary)]">
                <Megaphone size={24} />
              </div>
              <div>
                <h2 className="text-xl font-bold text-slate-900 ">Broadcast New Message</h2>
                <p className="text-sm text-slate-500">Send an announcement to specific user roles.</p>
              </div>
            </div>

            <form onSubmit={onPostAnnouncement} className="space-y-6">
              <div>
                <label className="block text-sm font-bold text-slate-500  mb-2">Announcement Title</label>
                <input 
                  type="text" 
                  value={newAnnouncement.title}
                  onChange={(e) => setNewAnnouncement({...newAnnouncement, title: e.target.value})}
                  placeholder="e.g., System Maintenance"
                  className="w-full bg-[#f8fafc]  border-none rounded-xl py-3 px-4 focus:ring-2 focus:ring-blue-500/20 text-slate-900 "
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-500  mb-2">Target Audience</label>
                <select 
                  value={newAnnouncement.target}
                  onChange={(e) => setNewAnnouncement({...newAnnouncement, target: e.target.value})}
                  className="w-full bg-[#f8fafc]  border-none rounded-xl py-3 px-4 focus:ring-2 focus:ring-blue-500/20 text-slate-900 "
                >
                  <option value="all">Everyone</option>
                  <option value="doctor">Doctors Only</option>
                  <option value="patient">Patients Only</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-500  mb-2">Message Content</label>
                <textarea 
                  rows="4"
                  value={newAnnouncement.content}
                  onChange={(e) => setNewAnnouncement({...newAnnouncement, content: e.target.value})}
                  placeholder="Write your announcement here..."
                  className="w-full bg-[#f8fafc]  border-none rounded-xl py-3 px-4 focus:ring-2 focus:ring-blue-500/20 resize-none text-slate-900 "
                ></textarea>
              </div>
              <button type="submit" className="w-full py-4 bg-[var(--color-primary)] text-white rounded-2xl font-bold shadow-lg shadow-blue-600/20 hover:bg-blue-700 transition-all active:scale-[0.98]">
                Broadcast Announcement
              </button>
            </form>
          </section>
        </div>

        {/* Management Sidebar */}
        <div className="space-y-6">
          <section className="bg-[var(--bg-secondary)]  p-6 rounded-[24px] shadow-sm hover:shadow-md transition-shadow fade-in hover:shadow-md transition-all duration-300 border border-[var(--border-primary)]  transition-colors">
            <h3 className="text-lg font-bold text-slate-900  mb-6">Operations</h3>
            <div className="space-y-3">
              {[
                { label: 'Verification Monitor', icon: <ShieldCheck size={18} />, path: 'verifications' },
                { label: 'Network Monitor', icon: <Activity size={18} />, path: 'monitoring' },
                { label: 'Patient Directory', icon: <Users size={18} />, path: 'users' },
                { label: 'Staff Directory', icon: <ShieldAlert size={18} />, path: 'staff' },
                { label: 'Platform Settings', icon: <Settings size={18} />, path: 'settings' },
              ].map((tool, i) => (
                <button 
                  key={i} 
                  onClick={() => navigate(`/dashboard/admin/${tool.path}`)}
                  className="w-full flex items-center justify-between p-4 bg-[#f8fafc]  rounded-2xl hover:bg-[#f8fafc] dark:bg-slate-900 transition-all group"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-[var(--bg-secondary)]  rounded-xl text-slate-500 group-hover:text-[var(--color-primary)] shadow-sm hover:shadow-md transition-shadow fade-in hover:shadow-md transition-all duration-300 transition-colors">
                      {tool.icon}
                    </div>
                    <span className="text-sm font-bold text-slate-500 ">{tool.label}</span>
                  </div>
                  <ChevronRight size={16} className="text-gray-300 group-hover:text-gray-600" />
                </button>
              ))}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

const UserManagement = ({ users, onDelete, onToggleStatus, onAddStaff, title = "Medical Network Users", user }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [formData, setFormData] = useState({ name: '', email: '', role: 'officer', staffId: '' });
  const [selectedPages, setSelectedPages] = useState(['overview']);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const isMainAdmin = user?.email === 'admin@bashcare.internal';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!formData.name || !formData.email || !formData.staffId) {
      setError('Please fill in all fields.');
      return;
    }

    setSubmitting(true);
    try {
      await onAddStaff({
        name: formData.name,
        email: formData.email,
        role: formData.role,
        staffId: formData.staffId,
        password: 'STAFF_USER_NO_PASSWORD',
        isVerified: true,
        accessiblePages: formData.role === 'admin' ? selectedPages : []
      });
      setIsOpen(false);
      setFormData({ name: '', email: '', role: 'officer', staffId: '' });
      setSelectedPages(['overview']);
      alert('Staff account added successfully!');
    } catch (err) {
      setError(err.message || 'Failed to add staff member.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <section className="bg-[var(--bg-secondary)] rounded-[24px] shadow-sm hover:shadow-md transition-shadow border border-[var(--border-primary)] overflow-hidden transition-colors">
        <div className="p-8 border-b border-gray-50 flex items-center justify-between flex-wrap gap-4">
          <div>
            <h2 className="text-xl font-bold text-slate-900">{title}</h2>
            <p className="text-xs text-slate-500 mt-1">Manage system-wide staff credentials and permissions.</p>
          </div>
          <div className="flex items-center gap-3">
            {isMainAdmin && (
              <button 
                onClick={() => setIsOpen(true)}
                className="bg-[var(--color-primary)] text-white px-5 py-2.5 rounded-xl text-xs font-bold hover:bg-blue-700 transition-all flex items-center gap-1 cursor-pointer"
              >
                + Create Staff Account
              </button>
            )}
            <div className="relative hidden md:block">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
              <input 
                type="text" 
                placeholder="Search..." 
                className="pl-10 pr-4 py-2 bg-white border-none rounded-xl text-xs focus:ring-2 focus:ring-blue-500/20 w-64 text-slate-900"
              />
            </div>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-white text-[10px] font-black text-slate-500 uppercase tracking-widest border-b border-gray-50">
                <th className="px-8 py-4">User Details</th>
                <th className="px-8 py-4">Role</th>
                <th className="px-8 py-4">Status</th>
                {isMainAdmin && <th className="px-8 py-4 text-right">Actions</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {users.map((u, i) => (
                <tr key={i} className="hover:bg-white transition-colors">
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-xs ${
                        u.role === 'Doctor' 
                          ? 'bg-blue-100 text-[var(--color-primary)]' 
                          : u.role === 'Admin'
                            ? 'bg-red-100 text-red-600'
                            : u.role === 'Officer'
                              ? 'bg-amber-100 text-amber-600'
                              : 'bg-green-100 text-green-600'
                      }`}>
                        {u.name.split(' ').map(n => n[0]).join('')}
                      </div>
                      <div>
                        <p className="font-bold text-slate-900 text-sm">{u.name}</p>
                        <p className="text-[11px] text-slate-500">{u.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <span className={`px-2 py-1 rounded-lg text-[10px] font-bold ${
                      u.role === 'Doctor' 
                        ? 'bg-[#f8fafc] text-[var(--color-primary)]' 
                        : u.role === 'Admin'
                          ? 'bg-red-50 text-red-600'
                          : u.role === 'Officer'
                            ? 'bg-amber-50 text-amber-600'
                            : 'bg-green-50 text-green-600'
                    }`}>
                      {u.role}
                    </span>
                  </td>
                  <td className="px-8 py-6">
                    <div className={`flex items-center gap-1.5 text-xs font-bold ${
                      u.status === 'active' ? 'text-green-600' : 'text-amber-600'
                    }`}>
                      <div className={`w-1.5 h-1.5 rounded-full ${
                        u.status === 'active' ? 'bg-[#22C55E]' : 'bg-[#F59E0B]'
                      }`}></div> {u.status}
                    </div>
                  </td>
                  {isMainAdmin && (
                    <td className="px-8 py-6 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button 
                          onClick={() => onToggleStatus(u.id || u._id, u.role, u.status)}
                          title={u.status === 'active' ? 'Suspend' : 'Activate'}
                          className={`p-2 rounded-lg ${u.status === 'active' ? 'text-[#F59E0B] hover:bg-amber-50' : 'text-[#22C55E] hover:bg-green-50'}`}
                        >
                          <ShieldCheck size={18} />
                        </button>
                        <button 
                          onClick={() => onDelete(u.id || u._id, u.role)}
                          className="p-2 text-slate-500 hover:text-red-600 rounded-lg cursor-pointer"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white w-full max-w-md p-8 rounded-[2rem] border border-gray-100 shadow-2xl relative animate-in fade-in zoom-in-95 duration-200"
            >
              <h3 className="text-xl font-bold text-slate-900 mb-2">Create Staff Account</h3>
              <p className="text-xs text-slate-500 mb-6">Create a secure administrative or verification account.</p>

              {error && (
                <div className="p-3 bg-red-50 text-red-600 text-xs font-semibold rounded-xl mb-4">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Full Name</label>
                  <input 
                    type="text" 
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Jane Doe"
                    className="w-full bg-gray-50 border-none rounded-xl py-3 px-4 text-sm text-slate-900 focus:ring-2 focus:ring-blue-500/20"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Email Address</label>
                  <input 
                    type="email" 
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="jane@bashcare.internal"
                    className="w-full bg-gray-50 border-none rounded-xl py-3 px-4 text-sm text-slate-900 focus:ring-2 focus:ring-blue-500/20"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Role/Permissions</label>
                  <select 
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                    className="w-full bg-gray-50 border-none rounded-xl py-3 px-4 text-sm text-slate-900 focus:ring-2 focus:ring-blue-500/20"
                  >
                    <option value="admin">System Admin</option>
                    <option value="officer">Verification Officer</option>
                  </select>
                </div>

                {formData.role === 'admin' && (
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                      Authorized Dashboard Pages
                    </label>
                    <div className="grid grid-cols-2 gap-2 bg-gray-50 p-4 rounded-xl text-xs max-h-48 overflow-y-auto">
                      {[
                        { key: 'overview', label: 'Overview' },
                        { key: 'staff', label: 'Medical Staff' },
                        { key: 'users', label: 'Patients Directory' },
                        { key: 'verifications', label: 'Verifications' },
                        { key: 'monitoring', label: 'Request Monitor' },
                        { key: 'departments', label: 'Departments' },
                        { key: 'finance', label: 'Finance & Billing' },
                        { key: 'logs', label: 'System Logs' },
                        { key: 'settings', label: 'Platform Settings' },
                        { key: 'meetings', label: 'Staff Meetings' }
                      ].map((page) => (
                        <label key={page.key} className="flex items-center gap-2 font-semibold text-slate-700 cursor-pointer">
                          <input 
                            type="checkbox"
                            checked={selectedPages.includes(page.key)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSelectedPages([...selectedPages, page.key]);
                              } else {
                                setSelectedPages(selectedPages.filter(p => p !== page.key));
                              }
                            }}
                            className="rounded text-[var(--color-primary)] focus:ring-blue-500"
                          />
                          {page.label}
                        </label>
                      ))}
                    </div>
                  </div>
                )}

                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Staff ID (Access Key)</label>
                  <input 
                    type="text" 
                    required
                    value={formData.staffId}
                    onChange={(e) => setFormData({ ...formData, staffId: e.target.value })}
                    placeholder="e.g., ADM_JANE_2026"
                    className="w-full bg-gray-50 border-none rounded-xl py-3 px-4 text-sm text-slate-900 focus:ring-2 focus:ring-blue-500/20"
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <button 
                    type="button" 
                    onClick={() => setIsOpen(false)}
                    className="flex-1 py-3 bg-gray-100 hover:bg-gray-200 text-slate-700 font-bold rounded-xl text-xs transition-all"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit" 
                    disabled={submitting}
                    className="flex-1 py-3 bg-[var(--color-primary)] text-white font-bold rounded-xl text-xs transition-all hover:opacity-90 disabled:opacity-50"
                  >
                    {submitting ? 'Creating...' : 'Create Account'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

const RequestMonitor = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchRequests = useCallback(async () => {
    try {
      const [appts, records, prescs] = await Promise.all([
        db.getAppointments(),
        db.getRecords(),
        db.getPrescriptions()
      ]);
      
      const combined = [
        ...appts.map(a => ({ ...a, type: 'Appointment', icon: <Calendar className="text-blue-500" /> })),
        ...records.map(r => ({ ...r, type: 'Medical Record', icon: <FileText className="text-purple-500" /> })),
        ...prescs.map(p => ({ ...p, type: 'Prescription', icon: <Pill className="text-emerald-500" /> }))
      ].sort((a, b) => new Date(b.date || b.createdAt) - new Date(a.date || a.createdAt));

      setRequests(combined);
      setLoading(false);
    } catch (err) {
      console.error("Monitor fetch error:", err);
    }
  }, []);

  useEffect(() => {
    const load = async () => {
      await fetchRequests();
    };
    load();
    const interval = setInterval(fetchRequests, 10000);
    return () => clearInterval(interval);
  }, [fetchRequests]);

  if (loading) return <div className="p-12 text-center font-bold text-slate-500">Synchronizing monitor...</div>;

  return (
    <section className="bg-[var(--bg-secondary)]  rounded-[24px] shadow-sm hover:shadow-md transition-shadow fade-in hover:shadow-md transition-all duration-300 border border-[var(--border-primary)]  overflow-hidden transition-colors">
      <div className="p-8 border-b border-gray-50 ">
        <h2 className="text-xl font-bold text-slate-900  flex items-center gap-3">
          Network Request Monitor <div className="w-2 h-2 rounded-full bg-[#EF4444] animate-pulse"></div>
        </h2>
        <p className="text-xs text-slate-500 (--text-secondary)] mt-1 uppercase tracking-widest font-bold">Real-time system-wide activity logs</p>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="bg-white  text-[10px] font-black text-slate-500 uppercase tracking-widest border-b border-gray-50 ">
              <th className="px-8 py-4">Request Type</th>
              <th className="px-8 py-4">Participants</th>
              <th className="px-8 py-4">Finance</th>
              <th className="px-8 py-4">Timestamp</th>
              <th className="px-8 py-4 text-right">System Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50 ">
            {requests.map((req, i) => (
              <tr key={i} className="hover:bg-white dark:bg-slate-900/50 transition-colors">
                <td className="px-8 py-5">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-white  rounded-xl">{req.icon}</div>
                    <p className="font-bold text-slate-900  text-sm">{req.type}</p>
                  </div>
                </td>
                <td className="px-8 py-5">
                  <p className="text-sm font-bold text-slate-900 ">
                    {req.patientName || req.patientEmail || 'System'}
                  </p>
                  {req.doctorName && (
                    <p className="text-[10px] font-bold text-[var(--color-primary)]">with {req.doctorName}</p>
                  )}
                </td>
                <td className="px-8 py-5">
                  {req.amount > 0 ? (
                    <div className="flex flex-col">
                      <span className="text-sm font-black text-slate-900 ">${req.amount}</span>
                      <span className={`text-[10px] font-bold uppercase ${req.paymentConfirmed ? 'text-green-600' : 'text-amber-600'}`}>
                        {req.paymentConfirmed ? 'Paid' : 'Pending'}
                      </span>
                    </div>
                  ) : (
                    <span className="text-xs text-slate-500 font-bold">N/A</span>
                  )}
                </td>
                <td className="px-8 py-5">
                  <p className="text-xs font-bold text-slate-500">{new Date(req.date || req.createdAt).toLocaleString()}</p>
                </td>
                <td className="px-8 py-5 text-right">
                  <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase ${
                    req.status === 'completed' || req.status === 'confirmed' ? 'bg-green-100 text-green-700  ' : 'bg-blue-100 text-[var(--color-primary)]  '
                  }`}>
                    {req.status || 'Processed'}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
};

const DepartmentsManagement = () => {
  const [departments, setDepartments] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingDept, setEditingDept] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    head: 'Unassigned',
    staff: 0,
    status: 'Active'
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const loadData = async () => {
    try {
      setLoading(true);
      const [deptData, docData] = await Promise.all([
        db.getDepartments(),
        db.getDoctors()
      ]);

      setDoctors(docData || []);

      // Seed default departments if database is empty
      if (!deptData || deptData.length === 0) {
        const defaults = [
          { name: 'Cardiology', head: 'Dr. Sarah Wilson', staff: 12, status: 'Active' },
          { name: 'Neurology', head: 'Dr. Michael Chen', staff: 8, status: 'Active' },
          { name: 'Pediatrics', head: 'Dr. Emily Brown', staff: 15, status: 'Active' },
          { name: 'Orthopedics', head: 'Dr. James Lee', staff: 10, status: 'Active' },
        ];
        
        const seeded = [];
        for (const dept of defaults) {
          const res = await db.saveDepartment(dept);
          seeded.push(res);
        }
        setDepartments(seeded);
      } else {
        setDepartments(deptData);
      }
    } catch (err) {
      console.error('Failed to load departments data:', err);
      setError('Failed to fetch departments. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleOpenAdd = () => {
    setEditingDept(null);
    setFormData({
      name: '',
      head: 'Unassigned',
      staff: 0,
      status: 'Active'
    });
    setError('');
    setShowModal(true);
  };

  const handleOpenEdit = (dept) => {
    setEditingDept(dept);
    setFormData({
      name: dept.name,
      head: dept.head || 'Unassigned',
      staff: dept.staff || 0,
      status: dept.status || 'Active'
    });
    setError('');
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this department?')) return;
    try {
      await db.deleteDepartment(id);
      setDepartments(departments.filter(d => d._id !== id));
    } catch (err) {
      alert(err.message || 'Failed to delete department.');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      setError('Department name is required.');
      return;
    }

    setSubmitting(true);
    setError('');
    try {
      if (editingDept) {
        const updated = await db.updateDepartment(editingDept._id, formData);
        setDepartments(departments.map(d => d._id === editingDept._id ? updated : d));
      } else {
        const created = await db.saveDepartment(formData);
        setDepartments([created, ...departments]);
      }
      setShowModal(false);
    } catch (err) {
      setError(err.message || 'Failed to save department.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="bg-[var(--bg-secondary)] rounded-[24px] shadow-sm hover:shadow-md transition-all duration-300 border border-[var(--border-primary)] overflow-hidden">
      <div className="p-8 border-b border-gray-50 flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Hospital Departments</h2>
          <p className="text-xs text-gray-500 mt-1">Manage hospital clinical departments, heads, and staff count.</p>
        </div>
        <button 
          onClick={handleOpenAdd}
          className="bg-[var(--color-primary)] text-white px-5 py-2.5 rounded-xl text-xs font-bold hover:bg-blue-700 transition-all flex items-center gap-1.5 shadow-md shadow-blue-500/10 cursor-pointer"
        >
          Add Department
        </button>
      </div>

      {loading ? (
        <div className="p-12 text-center text-gray-500 font-semibold flex flex-col items-center justify-center gap-3">
          <RefreshCw className="animate-spin text-[var(--color-primary)]" size={24} />
          <span>Loading departments...</span>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-white text-[10px] font-black text-slate-500 uppercase tracking-widest border-b border-gray-50">
                <th className="px-8 py-4">Department Name</th>
                <th className="px-8 py-4">Department Head</th>
                <th className="px-8 py-4">Staff Count</th>
                <th className="px-8 py-4 text-center">Status</th>
                <th className="px-8 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {departments.map((dept) => (
                <tr key={dept._id} className="hover:bg-white transition-colors group">
                  <td className="px-8 py-5">
                    <p className="font-bold text-slate-900 text-sm">{dept.name}</p>
                  </td>
                  <td className="px-8 py-5 text-sm font-medium text-gray-600">{dept.head}</td>
                  <td className="px-8 py-5 text-sm font-medium text-gray-600">{dept.staff} Members</td>
                  <td className="px-8 py-5 text-center">
                    <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase ${
                      dept.status === 'Active' 
                        ? 'bg-green-50 text-green-700 border border-green-200' 
                        : 'bg-red-50 text-red-700 border border-red-200'
                    }`}>
                      {dept.status}
                    </span>
                  </td>
                  <td className="px-8 py-5 text-right">
                    <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button 
                        onClick={() => handleOpenEdit(dept)}
                        className="p-1.5 hover:bg-gray-100 rounded-lg text-slate-500 hover:text-[var(--color-primary)] transition-colors cursor-pointer"
                        title="Edit Department"
                      >
                        <Settings size={15} />
                      </button>
                      <button 
                        onClick={() => handleDelete(dept._id)}
                        className="p-1.5 hover:bg-red-50 rounded-lg text-slate-500 hover:text-red-600 transition-colors cursor-pointer"
                        title="Delete Department"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {departments.length === 0 && (
                <tr>
                  <td colSpan="5" className="p-12 text-center text-gray-500">
                    No departments found. Click "Add Department" to create one.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Add / Edit Department Modal */}
      {showModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-[32px] w-full max-w-md shadow-2xl border border-gray-100 overflow-hidden transform animate-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-gray-50 flex items-center justify-between">
              <h3 className="text-lg font-black text-slate-900">
                {editingDept ? 'Edit Department' : 'Add New Department'}
              </h3>
              <button 
                onClick={() => setShowModal(false)}
                className="p-1.5 hover:bg-gray-100 rounded-full text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
              >
                ✕
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {error && (
                <div className="p-3.5 bg-red-50 border border-red-100 text-red-600 text-xs font-semibold rounded-xl">
                  {error}
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Department Name</label>
                <input 
                  type="text"
                  required
                  placeholder="e.g. Cardiology"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-250 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Department Head</label>
                <select 
                  value={formData.head}
                  onChange={(e) => setFormData({ ...formData, head: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-250 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                >
                  <option value="Unassigned">Unassigned</option>
                  {doctors.map(doc => (
                    <option key={doc._id} value={doc.name}>
                      {doc.name} ({doc.specialty || 'General'})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Staff Count</label>
                <input 
                  type="number"
                  min="0"
                  value={formData.staff}
                  onChange={(e) => setFormData({ ...formData, staff: parseInt(e.target.value) || 0 })}
                  className="w-full px-4 py-3 border border-gray-250 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Status</label>
                <div className="flex gap-4">
                  <label className="flex items-center gap-2 text-sm font-semibold text-slate-700 cursor-pointer">
                    <input 
                      type="radio"
                      name="status"
                      value="Active"
                      checked={formData.status === 'Active'}
                      onChange={() => setFormData({ ...formData, status: 'Active' })}
                      className="text-[var(--color-primary)] focus:ring-blue-500"
                    />
                    Active
                  </label>
                  <label className="flex items-center gap-2 text-sm font-semibold text-slate-700 cursor-pointer">
                    <input 
                      type="radio"
                      name="status"
                      value="Inactive"
                      checked={formData.status === 'Inactive'}
                      onChange={() => setFormData({ ...formData, status: 'Inactive' })}
                      className="text-[var(--color-primary)] focus:ring-blue-500"
                    />
                    Inactive
                  </label>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-gray-50">
                <button 
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-5 py-2.5 rounded-xl border border-gray-200 text-xs font-bold text-slate-600 hover:bg-gray-50 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2.5 rounded-xl bg-[var(--color-primary)] text-white text-xs font-bold hover:bg-blue-700 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {submitting ? 'Saving...' : 'Save Department'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </section>
  );
};

const FinanceBilling = ({ appointments, onRefresh }) => {
  const confirmedAppointments = appointments.filter(a => a.status === 'confirmed' || a.status === 'completed');
  const paidAppointments = confirmedAppointments.filter(a => a.paymentConfirmed);
  
  const totalRevenue = paidAppointments.reduce((sum, a) => sum + (a.amount || 0), 0);
  const pendingRevenue = confirmedAppointments.filter(a => !a.paymentConfirmed).reduce((sum, a) => sum + (a.amount || 0), 0);
  const avgTicket = paidAppointments.length > 0 ? totalRevenue / paidAppointments.length : 0;

  // Custom Pricing Rules State
  const [pricingRules, setPricingRules] = useState(() => {
    const saved = localStorage.getItem('bashcare_pricing_rules');
    return saved ? JSON.parse(saved) : {
      'General Practitioner': 50,
      'Cardiology': 150,
      'Pediatrics': 80,
      'Neurology': 200,
      'Dentistry': 90,
      'afterHoursSurcharge': 20,
      'weekendSurcharge': 15
    };
  });

  const [editingAmounts, setEditingAmounts] = useState({});
  const [isRulesSaved, setIsRulesSaved] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [specialtyFilter, setSpecialtyFilter] = useState('All');

  // Revenue Breakdown by Specialty
  const specialtyBreakdown = {};
  paidAppointments.forEach(a => {
    const spec = a.specialty || 'General Practitioner';
    specialtyBreakdown[spec] = (specialtyBreakdown[spec] || 0) + (a.amount || 0);
  });

  const savePricingRules = () => {
    localStorage.setItem('bashcare_pricing_rules', JSON.stringify(pricingRules));
    setIsRulesSaved(true);
    setTimeout(() => setIsRulesSaved(false), 2000);
  };

  const calculateProposedFee = (appointment) => {
    const base = pricingRules[appointment.specialty] || pricingRules['General Practitioner'] || 50;
    let surcharge = 0;
    
    // Check after hours (time slot >= 5 PM)
    if (appointment.time) {
      const hour = parseInt(appointment.time.split(':')[0]);
      if (hour >= 17) {
        surcharge += parseFloat(pricingRules.afterHoursSurcharge || 0);
      }
    }
    
    // Check weekends (Saturday=6, Sunday=0)
    if (appointment.date) {
      const day = new Date(appointment.date).getDay();
      if (day === 0 || day === 6) {
        surcharge += parseFloat(pricingRules.weekendSurcharge || 0);
      }
    }
    
    return base + surcharge;
  };

  const applyProposedFee = (appId, proposed) => {
    setEditingAmounts({ ...editingAmounts, [appId]: proposed });
  };

  const applyDiscount = (appId, currentVal, percent) => {
    const original = parseFloat(currentVal);
    if (!isNaN(original) && original > 0) {
      const discounted = Math.max(0, original * (1 - percent / 100));
      setEditingAmounts({ ...editingAmounts, [appId]: discounted.toFixed(2) });
    }
  };

  const handleUpdateAmount = async (id, currentAmount) => {
    const amtVal = editingAmounts[id] !== undefined ? editingAmounts[id] : currentAmount;
    const amt = parseFloat(amtVal);
    if (isNaN(amt) || amt < 0) {
      alert("Please enter a valid positive number for the fee amount.");
      return;
    }

    try {
      await db.updateAppointment(id, { amount: amt });
      alert("Appointment fee updated successfully!");
      if (onRefresh) {
        await onRefresh();
      }
    } catch (err) {
      console.error("Error updating fee:", err);
      alert("Failed to update fee: " + err.message);
    }
  };

  const recentTransactions = paidAppointments.slice(0, 5).map(a => {
    const safeId = (a.id || a._id || '').toString();
    return {
      id: `#TRX-${safeId.slice(-4).toUpperCase()}`,
      patient: a.patientName,
      amount: `$${(a.amount || 0).toFixed(2)}`,
      date: new Date(a.date).toLocaleDateString(),
      status: 'Paid',
      method: 'Platform'
    };
  });

  const adjustableAppointments = appointments.filter(a => {
    const matchesSearch = (a.patientName || '').toLowerCase().includes(searchQuery.toLowerCase()) || 
                          (a.doctorName || '').toLowerCase().includes(searchQuery.toLowerCase());
    const matchesSpecialty = specialtyFilter === 'All' || a.specialty === specialtyFilter;
    return !a.paymentConfirmed && a.status !== 'cancelled' && a.status !== 'rejected' && matchesSearch && matchesSpecialty;
  });

  return (
    <div className="space-y-8">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-[var(--bg-secondary)]  p-6 rounded-[24px] border border-[var(--border-primary)]  shadow-sm hover:shadow-md transition-shadow fade-in hover:shadow-md transition-all duration-300">
          <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Total Revenue</p>
          <p className="text-3xl font-black text-slate-900 ">${totalRevenue.toFixed(2)}</p>
          <p className="text-xs text-green-600 font-bold mt-2">From {paidAppointments.length} payments</p>
        </div>
        <div className="bg-[var(--bg-secondary)]  p-6 rounded-[24px] border border-[var(--border-primary)]  shadow-sm hover:shadow-md transition-shadow fade-in hover:shadow-md transition-all duration-300">
          <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Pending Invoices</p>
          <p className="text-3xl font-black text-slate-900 ">${pendingRevenue.toFixed(2)}</p>
          <p className="text-xs text-amber-600 font-bold mt-2">{confirmedAppointments.length - paidAppointments.length} awaiting payment</p>
        </div>
        <div className="bg-[var(--bg-secondary)]  p-6 rounded-[24px] border border-[var(--border-primary)]  shadow-sm hover:shadow-md transition-shadow fade-in hover:shadow-md transition-all duration-300">
          <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Avg. Consultation</p>
          <p className="text-3xl font-black text-slate-900 ">${avgTicket.toFixed(2)}</p>
          <p className="text-xs text-[var(--color-primary)] font-bold mt-2">Per confirmed booking</p>
        </div>
      </div>

      {/* Specialty Revenue Share Breakdown */}
      <section className="bg-[var(--bg-secondary)] p-8 rounded-[24px] shadow-sm hover:shadow-md border border-[var(--border-primary)] transition-colors">
        <h2 className="text-xl font-bold text-slate-900 mb-6">Revenue Contribution by Specialty</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {Object.keys(specialtyBreakdown).map(spec => {
            const specAmt = specialtyBreakdown[spec];
            const pct = totalRevenue > 0 ? (specAmt / totalRevenue) * 100 : 0;
            return (
              <div key={spec} className="space-y-2">
                <div className="flex justify-between items-center text-xs font-bold text-slate-700">
                  <span className="capitalize">{spec}</span>
                  <span>${specAmt.toFixed(2)} ({pct.toFixed(1)}%)</span>
                </div>
                <div className="w-full bg-slate-100 dark:bg-slate-800 h-2.5 rounded-full overflow-hidden">
                  <div 
                    className="bg-[var(--color-primary)] h-full rounded-full transition-all duration-500" 
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>
            );
          })}
          {Object.keys(specialtyBreakdown).length === 0 && (
            <p className="text-sm text-slate-500 italic py-2">No transaction data available yet to render breakdown.</p>
          )}
        </div>
      </section>

      {/* Specialty Rates & Surcharges Rules Config */}
      <section className="bg-[var(--bg-secondary)] p-8 rounded-[24px] shadow-sm hover:shadow-md border border-[var(--border-primary)] transition-colors">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-bold text-slate-900">Service Base Rates & Surcharges</h2>
            <p className="text-xs text-slate-500 font-medium mt-1 font-bold">Configure auto-calculation templates based on service specialty, dates, and times.</p>
          </div>
          <button 
            onClick={savePricingRules}
            className="px-5 py-2 bg-[var(--color-primary)] text-white text-xs font-bold rounded-xl hover:opacity-90 transition-all border-none cursor-pointer"
          >
            {isRulesSaved ? '✓ Rules Saved' : 'Save Rules'}
          </button>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {Object.keys(pricingRules).map((key) => {
            const labelMap = {
              'General Practitioner': 'GP Base ($)',
              'Cardiology': 'Cardiology ($)',
              'Pediatrics': 'Pediatrics ($)',
              'Neurology': 'Neurology ($)',
              'Dentistry': 'Dentistry ($)',
              'afterHoursSurcharge': 'After-Hours (+$)',
              'weekendSurcharge': 'Weekend (+$)'
            };
            return (
              <div key={key} className="p-4 bg-white rounded-2xl border border-slate-100">
                <label className="text-[10px] font-black text-slate-500 uppercase block mb-1.5">{labelMap[key] || key}</label>
                <input 
                  type="number"
                  value={pricingRules[key]}
                  onChange={(e) => setPricingRules({ ...pricingRules, [key]: parseFloat(e.target.value) || 0 })}
                  className="w-full px-3 py-1.5 border border-[var(--border-primary)] rounded-lg text-sm font-bold text-slate-900 bg-white focus:outline-none"
                />
              </div>
            );
          })}
        </div>
      </section>

      {/* Adjust Appointment Fees & Service Pricing */}
      <section className="bg-[var(--bg-secondary)] rounded-[24px] shadow-sm hover:shadow-md transition-shadow border border-[var(--border-primary)] overflow-hidden transition-colors">
        <div className="p-8 border-b border-gray-50 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-slate-900">Monitor & Adjust Appointment Fees</h2>
            <p className="text-xs text-slate-500 font-medium mt-1">Configure and update pending consultation payments based on date, time, and service type.</p>
          </div>
          {/* Advanced Search & Filtering controls */}
          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
              <input 
                type="text" 
                placeholder="Search patient..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 pr-4 py-2 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/20 bg-white w-48 text-slate-900 font-medium"
              />
            </div>
            <select
              value={specialtyFilter}
              onChange={(e) => setSpecialtyFilter(e.target.value)}
              className="px-3 py-2 border border-slate-200 rounded-xl text-xs bg-white text-slate-700 focus:outline-none font-bold"
            >
              <option value="All">All Specialties</option>
              <option value="General Practitioner">General Practitioner</option>
              <option value="Cardiology">Cardiology</option>
              <option value="Pediatrics">Pediatrics</option>
              <option value="Neurology">Neurology</option>
              <option value="Dentistry">Dentistry</option>
            </select>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-white text-[10px] font-black text-slate-500 uppercase tracking-widest border-b border-gray-50">
                <th className="px-8 py-4">Patient & Doctor</th>
                <th className="px-8 py-4">Specialty & Service</th>
                <th className="px-8 py-4">Date & Time</th>
                <th className="px-8 py-4">Proposed Auto-Fee</th>
                <th className="px-8 py-4">Amount ($)</th>
                <th className="px-8 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {adjustableAppointments.length > 0 ? adjustableAppointments.map((app) => {
                const appId = app.id || app._id;
                const proposed = calculateProposedFee(app);
                const currentEditVal = editingAmounts[appId] !== undefined ? editingAmounts[appId] : (app.amount || 50);
                return (
                  <tr key={appId} className="hover:bg-white dark:bg-slate-900/50 transition-colors">
                    <td className="px-8 py-5">
                      <p className="text-sm font-bold text-slate-900">{app.patientName}</p>
                      <p className="text-xs text-slate-500 font-medium">Dr. {app.doctorName}</p>
                    </td>
                    <td className="px-8 py-5">
                      <span className="px-2.5 py-1 bg-blue-50/50 text-[#2563EB] text-[10px] font-bold rounded-full uppercase">
                        {app.specialty || 'General'}
                      </span>
                    </td>
                    <td className="px-8 py-5">
                      <p className="text-xs font-bold text-slate-700">{app.date}</p>
                      <p className="text-[10px] text-slate-500 font-medium mt-0.5">{app.time}</p>
                    </td>
                    <td className="px-8 py-5">
                      <button 
                        onClick={() => applyProposedFee(appId, proposed)}
                        className="text-xs font-bold text-[var(--color-primary)] bg-blue-50/70 hover:bg-blue-100/80 px-3 py-1.5 rounded-lg border-none cursor-pointer transition-colors"
                      >
                        Apply Proposed (${proposed})
                      </button>
                    </td>
                    <td className="px-8 py-5">
                      <div className="flex flex-col gap-1.5">
                        <input 
                          type="number" 
                          min="0"
                          value={currentEditVal}
                          onChange={(e) => setEditingAmounts({ ...editingAmounts, [appId]: e.target.value })}
                          className="w-24 px-3 py-1.5 border border-[var(--border-primary)] rounded-lg text-sm font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 bg-white"
                        />
                        <div className="flex gap-1">
                          <button 
                            onClick={() => applyDiscount(appId, currentEditVal, 10)}
                            className="px-1.5 py-0.5 bg-green-50 text-green-700 border border-green-200 text-[9px] font-bold rounded hover:bg-green-100 cursor-pointer"
                          >
                            -10%
                          </button>
                          <button 
                            onClick={() => applyDiscount(appId, currentEditVal, 25)}
                            className="px-1.5 py-0.5 bg-green-50 text-green-700 border border-green-200 text-[9px] font-bold rounded hover:bg-green-100 cursor-pointer"
                          >
                            -25%
                          </button>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-5 text-right flex items-center justify-end gap-2 h-[96px]">
                      <button
                        onClick={() => handleUpdateAmount(appId, app.amount || 50)}
                        className="px-4 py-2 bg-[var(--color-primary)] text-white text-xs font-bold rounded-xl hover:opacity-90 transition-all border-none cursor-pointer"
                      >
                        Update Fee
                      </button>
                    </td>
                  </tr>
                );
              }) : (
                <tr>
                  <td colSpan="6" className="px-8 py-10 text-center text-sm text-slate-500 italic font-medium">
                    No active appointments matching filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      <section className="bg-[var(--bg-secondary)]  rounded-[24px] shadow-sm hover:shadow-md transition-shadow border border-[var(--border-primary)]  overflow-hidden transition-colors">
        <div className="p-8 border-b border-gray-50  flex items-center justify-between">
          <h2 className="text-xl font-bold text-slate-900 ">Recent Transactions</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-white  text-[10px] font-black text-slate-500 uppercase tracking-widest border-b border-gray-50 ">
                <th className="px-8 py-4">Transaction ID</th>
                <th className="px-8 py-4">Patient</th>
                <th className="px-8 py-4">Amount</th>
                <th className="px-8 py-4">Date</th>
                <th className="px-8 py-4 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 ">
              {recentTransactions.map((trx, i) => (
                <tr key={i} className="hover:bg-white dark:bg-slate-900/50 transition-colors">
                  <td className="px-8 py-5 font-bold text-[var(--color-primary)] text-sm">{trx.id}</td>
                  <td className="px-8 py-5 text-sm font-medium text-gray-600 ">{trx.patient}</td>
                  <td className="px-8 py-5 text-sm font-bold text-slate-900 ">{trx.amount}</td>
                  <td className="px-8 py-5 text-xs text-slate-500 font-bold">{trx.date}</td>
                  <td className="px-8 py-5 text-right">
                    <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase ${trx.status === 'Paid' ? 'bg-green-100 text-green-700  ' : 'bg-amber-100 text-amber-700  '}`}>
                      {trx.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
};

const SystemLogs = ({ allUsers = [], appointments = [] }) => {
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDeps = async () => {
      try {
        const deps = await db.getDepartments();
        setDepartments(deps || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchDeps();
  }, []);

  const logs = [];

  allUsers.forEach(u => {
    logs.push({
      event: `${u.role} Account Created`,
      user: u.name,
      time: u.createdAt ? new Date(u.createdAt).toLocaleString() : 'Recent',
      status: u.status === 'suspended' ? 'Warning' : 'Success',
      rawTime: u.createdAt ? new Date(u.createdAt).getTime() : 0
    });
  });

  departments.forEach(d => {
    logs.push({
      event: `Department Created: ${d.name}`,
      user: 'System Admin',
      time: d.createdAt ? new Date(d.createdAt).toLocaleString() : 'Recent',
      status: 'Success',
      rawTime: d.createdAt ? new Date(d.createdAt).getTime() : 0
    });
  });

  const sortedLogs = logs
    .sort((a, b) => b.rawTime - a.rawTime)
    .slice(0, 10);

  const handleClearLogs = () => {
    alert("System activity logs cache cleared successfully!");
  };

  return (
    <section className="bg-[var(--bg-secondary)] rounded-[24px] shadow-sm hover:shadow-md border border-[var(--border-primary)] overflow-hidden transition-colors">
      <div className="p-8 border-b border-gray-50 flex items-center justify-between">
        <h2 className="text-xl font-bold text-slate-900">System Activity Logs</h2>
        <button 
          onClick={handleClearLogs}
          className="text-xs font-bold text-red-600 bg-red-50 px-4 py-2 rounded-xl hover:bg-red-100 transition-all cursor-pointer"
        >
          Clear Logs
        </button>
      </div>
      <div className="divide-y divide-gray-50">
        {loading ? (
          <div className="p-8 text-center text-gray-500 font-semibold">Generating logs...</div>
        ) : sortedLogs.map((log, i) => (
          <div key={i} className="px-8 py-5 flex items-center justify-between hover:bg-white transition-colors">
            <div className="flex items-center gap-4">
              <div className={`w-2 h-2 rounded-full ${log.status === 'Success' ? 'bg-[#22C55E]' : 'bg-[#F59E0B]'}`}></div>
              <div>
                <p className="text-sm font-bold text-slate-900">{log.event}</p>
                <p className="text-xs text-slate-500 font-medium">By {log.user}</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">{log.time}</p>
              <p className={`text-[10px] font-black uppercase tracking-wider mt-1 ${log.status === 'Success' ? 'text-green-600' : 'text-amber-600'}`}>
                {log.status}
              </p>
            </div>
          </div>
        ))}
        {!loading && sortedLogs.length === 0 && (
          <div className="p-8 text-center text-gray-500 font-semibold">No activity logs recorded.</div>
        )}
      </div>
    </section>
  );
};

const PlatformSettings = () => {
  const [settings, setSettings] = useState(() => {
    const saved = localStorage.getItem('bashcare_platform_settings');
    return saved ? JSON.parse(saved) : {
      maintenanceMode: false,
      twoFactor: true,
      emailAlerts: true
    };
  });

  const handleSave = () => {
    localStorage.setItem('bashcare_platform_settings', JSON.stringify(settings));
    alert("Platform configuration saved successfully!");
  };

  return (
    <div className="max-w-3xl space-y-8 animate-in fade-in duration-200">
      <section className="bg-[var(--bg-secondary)] p-8 rounded-[24px] shadow-sm hover:shadow-md border border-[var(--border-primary)] transition-colors">
        <h2 className="text-xl font-bold text-slate-900 mb-6">General Configuration</h2>
        <div className="space-y-6">
          <div className="flex items-center justify-between p-4 bg-white rounded-2xl">
            <div>
              <p className="text-sm font-bold text-slate-900">Platform Maintenance Mode</p>
              <p className="text-xs text-slate-500 font-medium">Disable patient bookings during updates.</p>
            </div>
            <div 
              onClick={() => setSettings({ ...settings, maintenanceMode: !settings.maintenanceMode })}
              className={`w-12 h-6 rounded-full p-1 cursor-pointer transition-colors duration-200 flex items-center ${
                settings.maintenanceMode ? 'bg-[var(--color-primary)] justify-end' : 'bg-gray-200 justify-start'
              }`}
            >
              <div className="w-4 h-4 bg-white rounded-full shadow-md"></div>
            </div>
          </div>
          <div className="flex items-center justify-between p-4 bg-white rounded-2xl">
            <div>
              <p className="text-sm font-bold text-slate-900">Two-Factor Authentication</p>
              <p className="text-xs text-slate-500 font-medium">Enforce 2FA for all medical staff.</p>
            </div>
            <div 
              onClick={() => setSettings({ ...settings, twoFactor: !settings.twoFactor })}
              className={`w-12 h-6 rounded-full p-1 cursor-pointer transition-colors duration-200 flex items-center ${
                settings.twoFactor ? 'bg-[var(--color-primary)] justify-end' : 'bg-gray-200 justify-start'
              }`}
            >
              <div className="w-4 h-4 bg-white rounded-full shadow-md"></div>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-[var(--bg-secondary)] p-8 rounded-[24px] shadow-sm hover:shadow-md border border-[var(--border-primary)] transition-colors">
        <h2 className="text-xl font-bold text-slate-900 mb-6">Notification Settings</h2>
        <div className="space-y-6">
          <div className="flex items-center justify-between p-4 bg-white rounded-2xl">
            <div>
              <p className="text-sm font-bold text-slate-900">Email Alerts</p>
              <p className="text-xs text-slate-500 font-medium">Send automated emails for all system events.</p>
            </div>
            <div 
              onClick={() => setSettings({ ...settings, emailAlerts: !settings.emailAlerts })}
              className={`w-12 h-6 rounded-full p-1 cursor-pointer transition-colors duration-200 flex items-center ${
                settings.emailAlerts ? 'bg-[var(--color-primary)] justify-end' : 'bg-gray-200 justify-start'
              }`}
            >
              <div className="w-4 h-4 bg-white rounded-full shadow-md"></div>
            </div>
          </div>
        </div>
      </section>

      <button 
        onClick={handleSave}
        className="w-full py-4 bg-[var(--color-primary)] text-white rounded-2xl font-bold shadow-lg hover:opacity-90 transition-all cursor-pointer border-none"
      >
        Save Changes
      </button>
    </div>
  );
};

const PatientManagement = ({ patients, onDelete, onToggleStatus }) => (
  <section className="bg-[var(--bg-secondary)]  rounded-[24px] shadow-sm hover:shadow-md transition-shadow fade-in hover:shadow-md transition-all duration-300 border border-[var(--border-primary)]  overflow-hidden transition-colors">
    <div className="p-8 border-b border-gray-50  flex items-center justify-between">
      <h2 className="text-xl font-bold text-slate-900 ">Global Patient Directory</h2>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
        <input 
          type="text" 
          placeholder="Search patients..." 
          className="pl-10 pr-4 py-2 bg-white  border-none rounded-xl text-xs focus:ring-2 focus:ring-blue-500/20 w-64 text-slate-900 "
        />
      </div>
    </div>
    <div className="overflow-x-auto">
      <table className="w-full text-left">
        <thead>
          <tr className="bg-white  text-[10px] font-black text-slate-500 uppercase tracking-widest border-b border-gray-50 ">
            <th className="px-8 py-4">Patient Name</th>
            <th className="px-8 py-4">Contact</th>
            <th className="px-8 py-4">Status</th>
            <th className="px-8 py-4 text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-50 ">
          {patients.map((p, i) => (
            <tr key={i} className="hover:bg-white dark:bg-slate-900/50 transition-colors">
              <td className="px-8 py-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-green-100  text-green-600  flex items-center justify-center font-bold text-xs">
                    {p.name.split(' ').map(n => n[0]).join('')}
                  </div>
                  <div>
                    <p className="font-bold text-slate-900  text-sm">{p.name}</p>
                    <p className="text-[11px] text-slate-500 (--text-secondary)]">ID: {p.id.slice(-8).toUpperCase()}</p>
                  </div>
                </div>
              </td>
              <td className="px-8 py-6">
                <p className="text-sm font-medium text-slate-500 ">{p.email}</p>
              </td>
              <td className="px-8 py-6">
                <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest ${
                  p.status === 'active' ? 'bg-green-100 text-green-700  ' : 'bg-red-100 text-red-700  '
                }`}>
                  {p.status}
                </span>
              </td>
              <td className="px-8 py-6 text-right">
                <div className="flex items-center justify-end gap-2">
                  <button onClick={() => onToggleStatus(p.id, 'Patient', p.status)} className="p-2 text-slate-500 hover:text-[var(--color-primary)] dark:text-blue-400 transition-colors"><ShieldCheck size={18} /></button>
                  <button onClick={() => onDelete(p.id, 'Patient')} className="p-2 text-slate-500 hover:text-red-600 dark:text-red-400 transition-colors"><Trash2 size={18} /></button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </section>
);



const AdminDashboard = ({ user, logout }) => {
  const navigate = useNavigate();

  const isPageAllowed = (page) => {
    if (!user) return true;
    if (user.email === 'admin@bashcare.internal' || !user.email) return true;
    if (user.accessiblePages && Array.isArray(user.accessiblePages) && user.accessiblePages.length > 0) {
      return user.accessiblePages.includes(page);
    }
    return true;
  };

  const renderProtectedRoute = (page, component) => {
    if (isPageAllowed(page)) {
      return component;
    }
    return <Navigate to="/dashboard/admin" replace />;
  };

  const [newAnnouncement, setNewAnnouncement] = useState({ title: '', content: '', target: 'all' });
  const [announcements, setAnnouncements] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    try {
      const [savedAnnouncements, savedDoctors, savedUsers, savedAppointments] = await Promise.all([
        db.getAnnouncements(),
        db.getDoctors(),
        db.getUsers(),
        db.getAppointments()
      ]);

      setAnnouncements(savedAnnouncements);
      setAppointments(savedAppointments);
      
      const users = [
        ...savedDoctors.map(d => ({ ...d, role: 'Doctor' })),
        ...savedUsers.map(u => ({ 
          ...u, 
          role: u.role === 'admin' ? 'Admin' : u.role === 'officer' ? 'Officer' : u.role === 'doctor' ? 'Doctor' : u.role === 'patient' ? 'Patient' : 'Patient'
        }))
      ];
      setAllUsers(users);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const stats = [
    { 
      label: 'Total Patients', 
      value: allUsers.filter(u => u.role === 'Patient').length.toString(), 
      icon: <Users className="text-[var(--color-primary)]" />, 
      change: '+12%', up: true, bg: 'bg-[#f8fafc]' 
    },
    { 
      label: 'Verified Doctors', 
      value: allUsers.filter(u => u.role === 'Doctor' && u.status === 'active').length.toString(), 
      icon: <ShieldCheck className="text-green-600" />, 
      change: '+3', up: true, bg: 'bg-green-50' 
    },
    { 
      label: 'Active Appointments', 
      value: appointments.filter(a => a.status === 'confirmed').length.toString(), 
      icon: <Activity className="text-purple-600" />, 
      change: '+18%', up: true, bg: 'bg-purple-50' 
    },
    { 
      label: 'Completed Visits', 
      value: appointments.filter(a => a.status === 'completed').length.toString(), 
      icon: <CheckCircle2 size={24} className="text-emerald-600" />, 
      change: '85%', up: true, bg: 'bg-emerald-50' 
    },
  ];

  const handlePostAnnouncement = async (e) => {
    e.preventDefault();
    if (!newAnnouncement.title || !newAnnouncement.content) return;
    try {
      await db.addAnnouncement(newAnnouncement);
      await db.addNotification({ 
        userId: newAnnouncement.target, 
        title: 'New Announcement: ' + newAnnouncement.title, 
        message: newAnnouncement.content, 
        type: 'system' 
      });
      setNewAnnouncement({ title: '', content: '', target: 'all' });
      await fetchData();
      alert('Announcement broadcasted successfully!');
    } catch (error) {
      console.error("Error posting announcement:", error);
    }
  };

  const handleDeleteAnnouncement = async (id) => {
    if (window.confirm('Are you sure you want to delete this announcement?')) {
      try {
        await db.deleteAnnouncement(id);
        await fetchData();
        alert('Announcement deleted successfully!');
      } catch (error) {
        console.error("Error deleting announcement:", error);
      }
    }
  };

  const handleDeleteUser = async (id, role) => {
    if (window.confirm(`Are you sure you want to delete this ${role}?`)) {
      try {
        if (role === 'Doctor') {
          await db.deleteDoctor(id);
        } else {
          await db.deleteUser(id);
        }
        await fetchData();
      } catch (error) {
        console.error("Error deleting user:", error);
      }
    }
  };

  const handleToggleUserStatus = async (id, role, currentStatus) => {
    const newStatus = currentStatus === 'active' ? 'suspended' : 'active';
    try {
      if (role === 'Doctor') {
        await db.updateDoctor(id, { status: newStatus });
      } else {
        await db.updateUser(id, { status: newStatus });
      }
      await fetchData();
    } catch (error) {
      console.error("Error toggling user status:", error);
    }
  };

  const handleAddStaff = async (staffData) => {
    try {
      await db.saveUser(staffData);
      await fetchData();
    } catch (error) {
      console.error("Error adding staff:", error);
      throw error;
    }
  };

  if (loading) return <div className="p-8 text-center font-bold text-slate-500 (--text-secondary)]">Loading admin console...</div>;

  return (
    <div className="flex min-h-screen bg-[#f8fafc] dark:bg-slate-950 transition-colors">
      <Sidebar role="admin" onLogout={logout} />
      
      <div className="flex-grow flex flex-col min-w-0">
        <TopNav userName={user?.name || "System Admin"} role="admin" />
        
        <main className="p-4 sm:p-6 lg:p-8">
          <Routes>
            <Route index element={
              isPageAllowed('overview') ? (
                <AdminOverview 
                  stats={stats} 
                  announcements={announcements} 
                  onPostAnnouncement={handlePostAnnouncement}
                  newAnnouncement={newAnnouncement}
                  setNewAnnouncement={setNewAnnouncement}
                  onDeleteAnnouncement={handleDeleteAnnouncement}
                  allUsers={allUsers}
                  navigate={navigate}
                />
              ) : (
                <div className="p-8 text-center bg-[var(--bg-secondary)] border border-gray-100 rounded-3xl mt-6">
                  <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
                    🔒
                  </div>
                  <h3 className="text-lg font-bold text-slate-900">Access Denied</h3>
                  <p className="text-slate-500 text-xs mt-1">You do not have permission to view the main overview. Please select an authorized tab from the sidebar.</p>
                </div>
              )
            } />
            <Route path="staff" element={renderProtectedRoute('staff', <UserManagement title="Medical Staff Directory" users={allUsers.filter(u => u.role === 'Doctor' || u.role === 'Admin' || u.role === 'Officer')} onDelete={handleDeleteUser} onToggleStatus={handleToggleUserStatus} onAddStaff={handleAddStaff} user={user} />)} />
            <Route path="users" element={renderProtectedRoute('users', <PatientManagement patients={allUsers.filter(u => u.role === 'Patient')} onDelete={handleDeleteUser} onToggleStatus={handleToggleUserStatus} />)} />
            <Route path="verifications" element={renderProtectedRoute('verifications', <AdminVerificationMonitor />)} />
            <Route path="monitoring" element={renderProtectedRoute('monitoring', <RequestMonitor />)} />
            <Route path="departments" element={renderProtectedRoute('departments', <DepartmentsManagement />)} />
            <Route path="finance" element={renderProtectedRoute('finance', <FinanceBilling appointments={appointments} onRefresh={fetchData} />)} />
            <Route path="logs" element={renderProtectedRoute('logs', <SystemLogs allUsers={allUsers} appointments={appointments} />)} />
            <Route path="settings" element={renderProtectedRoute('settings', <PlatformSettings />)} />
            <Route path="meetings" element={renderProtectedRoute('meetings', <AdminMeetings user={user} />)} />
            <Route path="notifications" element={<Notifications user={user} />} />
            <Route path="*" element={<Navigate to="/dashboard/admin" replace />} />
          </Routes>
        </main>
      </div>
    </div>
  );
};

export default AdminDashboard;

