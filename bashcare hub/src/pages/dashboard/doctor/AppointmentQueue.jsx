import { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Clock,
  CheckCircle2,
  XCircle,
  Calendar,
  Search,
  Stethoscope,
  MessageSquare,
  Video,
  MapPin,
  Phone,
  AlertCircle,
  ChevronDown,
  ChevronUp,
  DollarSign,
  User,
  Loader2,
  Bell,
  RefreshCw,
  Filter,
  BriefcaseMedical,
  FileText,
  Pill,
  History,
  Tag,
  Printer,
  CalendarPlus,
  Save,
  StickyNote,
  Shield,
  Flame,
  RotateCcw,
  Eye,
  X,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { db } from '../../../utils/db';

// ─── Helpers ────────────────────────────────────────────────────────────────
const timeAgo = (date) => {
  const seconds = Math.floor((Date.now() - new Date(date).getTime()) / 1000);
  if (seconds < 60) return 'Just now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
};

const priorityConfig = {
  routine:    { bg: 'bg-slate-100 dark:bg-slate-800', text: 'text-slate-600 dark:text-slate-400', icon: Shield, label: 'Routine', border: 'border-slate-200 dark:border-slate-700' },
  urgent:     { bg: 'bg-red-50 dark:bg-red-900/20', text: 'text-red-600 dark:text-red-400', icon: Flame, label: 'Urgent', border: 'border-red-200 dark:border-red-700' },
  'follow-up': { bg: 'bg-violet-50 dark:bg-violet-900/20', text: 'text-violet-600 dark:text-violet-400', icon: RotateCcw, label: 'Follow-up', border: 'border-violet-200 dark:border-violet-700' },
};

// ─── Reject Reason Modal ────────────────────────────────────────────────────
const RejectModal = ({ appointment, onClose, onConfirm, isLoading }) => {
  const [reason, setReason] = useState('');

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
      <motion.div
        initial={{ opacity: 0, scale: 0.92 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.92 }}
        onClick={(e) => e.stopPropagation()}
        className="relative bg-white dark:bg-slate-900 rounded-[28px] shadow-2xl border border-slate-200 dark:border-slate-700 w-full max-w-md p-8 z-10"
      >
        <div className="flex items-center gap-3 mb-5">
          <div className="p-3 bg-red-100 rounded-2xl">
            <XCircle size={22} className="text-red-600" />
          </div>
          <div>
            <h3 className="text-lg font-black text-slate-900 dark:text-slate-100">Decline Booking</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {appointment.patientName}'s request on {new Date(appointment.date).toLocaleDateString()}
            </p>
          </div>
        </div>

        <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider mb-2">
          Reason for declining <span className="text-red-500">*</span>
        </label>
        <textarea
          rows={3}
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          placeholder="e.g. Schedule conflict, please rebook for another date..."
          className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-sm text-slate-800 dark:text-slate-200 outline-none focus:ring-2 focus:ring-red-400 resize-none"
        />

        <div className="flex gap-3 mt-6">
          <button
            onClick={onClose}
            className="flex-1 py-3 rounded-2xl border border-slate-200 dark:border-slate-700 font-bold text-sm text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all"
          >
            Cancel
          </button>
          <button
            onClick={() => onConfirm(reason)}
            disabled={!reason.trim() || isLoading}
            className="flex-1 py-3 rounded-2xl bg-red-600 text-white font-bold text-sm hover:bg-red-700 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {isLoading ? <Loader2 size={16} className="animate-spin" /> : <XCircle size={16} />}
            Decline
          </button>
        </div>
      </motion.div>
    </div>
  );
};

// ─── Quick Prescribe Modal ──────────────────────────────────────────────────
const PrescribeModal = ({ appointment, user, onClose, onSave }) => {
  const [form, setForm] = useState({
    medication: '',
    dosage: '',
    frequency: 'Once daily',
    duration: '7 days',
    instructions: '',
    refills: 0,
  });
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      await db.addPrescription({
        patientId: appointment.patientId,
        patientName: appointment.patientName,
        doctorId: user.id,
        doctorName: user.name,
        ...form,
        date: new Date().toISOString(),
      });
      await db.addNotification({
        userId: appointment.patientId,
        title: '💊 New Prescription',
        message: `Dr. ${user.name} prescribed ${form.medication} — ${form.dosage}, ${form.frequency} for ${form.duration}.`,
        type: 'prescription',
      });
      onSave();
    } catch (error) {
      console.error('Error saving prescription:', error);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
      <motion.div
        initial={{ opacity: 0, scale: 0.92 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.92 }}
        onClick={(e) => e.stopPropagation()}
        className="relative bg-white dark:bg-slate-900 rounded-[28px] shadow-2xl border border-slate-200 dark:border-slate-700 w-full max-w-lg p-8 z-10 max-h-[90vh] overflow-y-auto"
      >
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-emerald-100 dark:bg-emerald-900/30 rounded-2xl">
              <Pill size={22} className="text-emerald-600" />
            </div>
            <div>
              <h3 className="text-lg font-black text-slate-900 dark:text-slate-100">Quick Prescribe</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                For {appointment.patientName}
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-all">
            <X size={18} className="text-slate-400" />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Medication Name <span className="text-red-500">*</span></label>
            <input
              type="text"
              value={form.medication}
              onChange={(e) => setForm({ ...form, medication: e.target.value })}
              placeholder="e.g. Amoxicillin 500mg"
              className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-sm font-semibold outline-none focus:ring-2 focus:ring-emerald-400 text-slate-800 dark:text-slate-200"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Dosage <span className="text-red-500">*</span></label>
              <input
                type="text"
                value={form.dosage}
                onChange={(e) => setForm({ ...form, dosage: e.target.value })}
                placeholder="e.g. 1 tablet"
                className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-sm font-semibold outline-none focus:ring-2 focus:ring-emerald-400 text-slate-800 dark:text-slate-200"
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Frequency</label>
              <select
                value={form.frequency}
                onChange={(e) => setForm({ ...form, frequency: e.target.value })}
                className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-sm font-semibold outline-none focus:ring-2 focus:ring-emerald-400 text-slate-800 dark:text-slate-200"
              >
                {['Once daily', 'Twice daily', 'Three times daily', 'Four times daily', 'Every 6 hours', 'Every 8 hours', 'Every 12 hours', 'As needed', 'Before meals', 'After meals'].map(f => (
                  <option key={f} value={f}>{f}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Duration</label>
              <select
                value={form.duration}
                onChange={(e) => setForm({ ...form, duration: e.target.value })}
                className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-sm font-semibold outline-none focus:ring-2 focus:ring-emerald-400 text-slate-800 dark:text-slate-200"
              >
                {['3 days', '5 days', '7 days', '10 days', '14 days', '21 days', '30 days', '60 days', '90 days', 'Ongoing'].map(d => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Refills</label>
              <input
                type="number"
                min={0}
                max={12}
                value={form.refills}
                onChange={(e) => setForm({ ...form, refills: parseInt(e.target.value) || 0 })}
                className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-sm font-semibold outline-none focus:ring-2 focus:ring-emerald-400 text-slate-800 dark:text-slate-200"
              />
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Special Instructions</label>
            <textarea
              rows={2}
              value={form.instructions}
              onChange={(e) => setForm({ ...form, instructions: e.target.value })}
              placeholder="e.g. Take with food, avoid alcohol..."
              className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-sm font-semibold outline-none focus:ring-2 focus:ring-emerald-400 text-slate-800 dark:text-slate-200 resize-none"
            />
          </div>
        </div>

        <div className="flex gap-3 mt-6">
          <button
            onClick={onClose}
            className="flex-1 py-3 rounded-2xl border border-slate-200 dark:border-slate-700 font-bold text-sm text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={!form.medication.trim() || !form.dosage.trim() || saving}
            className="flex-1 py-3 rounded-2xl bg-gradient-to-r from-emerald-500 to-green-600 text-white font-bold text-sm hover:from-emerald-600 hover:to-green-700 transition-all disabled:opacity-50 flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/25"
          >
            {saving ? <Loader2 size={16} className="animate-spin" /> : <Pill size={16} />}
            Send Prescription
          </button>
        </div>
      </motion.div>
    </div>
  );
};

// ─── Follow-up Modal ────────────────────────────────────────────────────────
const FollowUpModal = ({ appointment, user, onClose, onSave }) => {
  const [followDate, setFollowDate] = useState('');
  const [followNote, setFollowNote] = useState('');
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      await db.updateAppointment(appointment._id || appointment.id, {
        followUpDate: followDate,
      });
      await db.addNotification({
        userId: appointment.patientId,
        title: '📅 Follow-up Recommended',
        message: `Dr. ${user.name} recommends a follow-up visit on ${new Date(followDate).toLocaleDateString()}.${followNote ? ` Note: ${followNote}` : ''}`,
        type: 'appointment',
      });
      onSave();
    } catch (error) {
      console.error('Error setting follow-up:', error);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
      <motion.div
        initial={{ opacity: 0, scale: 0.92 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.92 }}
        onClick={(e) => e.stopPropagation()}
        className="relative bg-white dark:bg-slate-900 rounded-[28px] shadow-2xl border border-slate-200 dark:border-slate-700 w-full max-w-md p-8 z-10"
      >
        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-2xl">
            <CalendarPlus size={22} className="text-blue-600" />
          </div>
          <div>
            <h3 className="text-lg font-black text-slate-900 dark:text-slate-100">Set Follow-up</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Remind {appointment.patientName} to book again
            </p>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Follow-up Date <span className="text-red-500">*</span></label>
            <input
              type="date"
              min={new Date().toISOString().split('T')[0]}
              value={followDate}
              onChange={(e) => setFollowDate(e.target.value)}
              className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-sm font-semibold outline-none focus:ring-2 focus:ring-blue-400 text-slate-800 dark:text-slate-200"
            />
          </div>
          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Note (optional)</label>
            <textarea
              rows={2}
              value={followNote}
              onChange={(e) => setFollowNote(e.target.value)}
              placeholder="e.g. Check blood pressure, review test results..."
              className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-sm font-semibold outline-none focus:ring-2 focus:ring-blue-400 text-slate-800 dark:text-slate-200 resize-none"
            />
          </div>
        </div>

        <div className="flex gap-3 mt-6">
          <button
            onClick={onClose}
            className="flex-1 py-3 rounded-2xl border border-slate-200 dark:border-slate-700 font-bold text-sm text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={!followDate || saving}
            className="flex-1 py-3 rounded-2xl bg-gradient-to-r from-blue-500 to-blue-700 text-white font-bold text-sm hover:from-blue-600 hover:to-blue-800 transition-all disabled:opacity-50 flex items-center justify-center gap-2 shadow-lg shadow-blue-500/25"
          >
            {saving ? <Loader2 size={16} className="animate-spin" /> : <CalendarPlus size={16} />}
            Set Reminder
          </button>
        </div>
      </motion.div>
    </div>
  );
};

// ─── Patient History Drawer ─────────────────────────────────────────────────
const PatientHistoryPanel = ({ appointment, user, onClose }) => {
  const [history, setHistory] = useState([]);
  const [records, setRecords] = useState([]);
  const [prescriptions, setPrescriptions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const [allAppts, allRecords, allPresc] = await Promise.all([
          db.getDoctorAppointments(user.id),
          db.getPatientRecords(appointment.patientId).catch(() => []),
          db.getPatientPrescriptions(appointment.patientId).catch(() => []),
        ]);
        // Past appointments with this doctor for this patient
        const pastAppts = allAppts
          .filter(a => a.patientId === appointment.patientId && (a._id || a.id) !== (appointment._id || appointment.id))
          .sort((a, b) => new Date(b.date) - new Date(a.date));
        setHistory(pastAppts);
        setRecords(allRecords || []);
        setPrescriptions(allPresc || []);
      } catch (error) {
        console.error('Error fetching patient history:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchHistory();
  }, [appointment, user.id]);

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 40 }}
        onClick={(e) => e.stopPropagation()}
        className="relative bg-white dark:bg-slate-900 rounded-t-[28px] sm:rounded-[28px] shadow-2xl border border-slate-200 dark:border-slate-700 w-full max-w-2xl max-h-[85vh] overflow-y-auto z-10"
      >
        <div className="sticky top-0 bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800 p-6 flex items-center justify-between rounded-t-[28px]">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-violet-100 dark:bg-violet-900/30 rounded-2xl">
              <History size={22} className="text-violet-600" />
            </div>
            <div>
              <h3 className="text-lg font-black text-slate-900 dark:text-slate-100">Patient History</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">{appointment.patientName}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-all">
            <X size={18} className="text-slate-400" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 size={28} className="animate-spin text-[var(--color-primary)]" />
            </div>
          ) : (
            <>
              {/* Stats */}
              <div className="grid grid-cols-3 gap-3">
                <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-2xl">
                  <p className="text-2xl font-black text-blue-600 dark:text-blue-400">{history.length}</p>
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mt-1">Past Visits</p>
                </div>
                <div className="text-center p-4 bg-emerald-50 dark:bg-emerald-900/20 rounded-2xl">
                  <p className="text-2xl font-black text-emerald-600 dark:text-emerald-400">{records.length}</p>
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mt-1">Records</p>
                </div>
                <div className="text-center p-4 bg-amber-50 dark:bg-amber-900/20 rounded-2xl">
                  <p className="text-2xl font-black text-amber-600 dark:text-amber-400">{prescriptions.length}</p>
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mt-1">Prescriptions</p>
                </div>
              </div>

              {/* Past Appointments */}
              <div>
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Past Appointments</h4>
                {history.length > 0 ? (
                  <div className="space-y-2">
                    {history.slice(0, 10).map((h) => (
                      <div key={h._id || h.id} className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl">
                        <div className="flex items-center gap-3">
                          <Calendar size={14} className="text-slate-400" />
                          <div>
                            <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                              {new Date(h.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                            </p>
                            <p className="text-xs text-slate-500">{h.reason || 'General Consultation'}</p>
                          </div>
                        </div>
                        <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-lg ${
                          h.status === 'completed' ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600' :
                          h.status === 'confirmed' ? 'bg-green-100 dark:bg-green-900/30 text-green-600' :
                          'bg-slate-100 dark:bg-slate-700 text-slate-500'
                        }`}>
                          {h.status}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-slate-400 italic text-center py-6">First-time patient — no past visits</p>
                )}
              </div>

              {/* Recent Prescriptions */}
              {prescriptions.length > 0 && (
                <div>
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Recent Prescriptions</h4>
                  <div className="space-y-2">
                    {prescriptions.slice(0, 5).map((p, i) => (
                      <div key={i} className="flex items-center gap-3 p-3 bg-emerald-50 dark:bg-emerald-900/10 rounded-xl">
                        <Pill size={14} className="text-emerald-500 flex-shrink-0" />
                        <div className="min-w-0">
                          <p className="text-sm font-semibold text-slate-800 dark:text-slate-200 truncate">{p.medication}</p>
                          <p className="text-xs text-slate-500">{p.dosage} — {p.frequency}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </motion.div>
    </div>
  );
};

// ─── Appointment Card ───────────────────────────────────────────────────────
const AppointmentCard = ({
  app, index, user, amounts, onAmountChange, prepInstructions, onPrepChange,
  onConfirm, onReject, onChat, onReschedule, onNotes, isUpdating,
  visitCounts, onPrescribe, onFollowUp, onViewHistory, onPrint,
  onPriorityChange, onDoctorNoteSave,
}) => {
  const [expanded, setExpanded] = useState(app.status === 'pending');
  const [rescheduleMode, setRescheduleMode] = useState(false);
  const [resDate, setResDate] = useState('');
  const [resTime, setResTime] = useState('09:00 AM');
  const [resReason, setResReason] = useState('');
  const [localNotes, setLocalNotes] = useState(app.doctorNotes || '');
  const [noteSaving, setNoteSaving] = useState(false);
  const [noteSaved, setNoteSaved] = useState(false);

  const statusStyle = {
    pending:   { bg: 'bg-amber-50 dark:bg-amber-900/20', text: 'text-amber-600 dark:text-amber-400', dot: 'bg-amber-500', label: 'Pending Review' },
    confirmed: { bg: 'bg-green-50 dark:bg-green-900/20', text: 'text-green-600 dark:text-green-400', dot: 'bg-green-500', label: 'Confirmed' },
    completed: { bg: 'bg-blue-50 dark:bg-blue-900/20', text: 'text-blue-600 dark:text-blue-400', dot: 'bg-blue-500', label: 'Completed' },
    rejected:  { bg: 'bg-red-50 dark:bg-red-900/20', text: 'text-red-600 dark:text-red-400', dot: 'bg-red-500', label: 'Declined' },
    cancelled: { bg: 'bg-slate-100 dark:bg-slate-800', text: 'text-slate-500 dark:text-slate-400', dot: 'bg-slate-400', label: 'Cancelled' },
    rescheduled: { bg: 'bg-indigo-50 dark:bg-indigo-900/20', text: 'text-indigo-600 dark:text-indigo-400', dot: 'bg-indigo-500', label: 'Reschedule Proposed' },
  }[app.status] || { bg: 'bg-slate-100', text: 'text-slate-500', dot: 'bg-slate-400', label: app.status };

  const initials = (app.patientName || 'P').split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  const avatarColors = ['from-blue-400 to-blue-600', 'from-violet-400 to-violet-600', 'from-emerald-400 to-emerald-600', 'from-amber-400 to-amber-600', 'from-pink-400 to-pink-600'];
  const avatarColor = avatarColors[index % avatarColors.length];

  const prio = priorityConfig[app.priority || 'routine'];
  const PrioIcon = prio.icon;
  const visitCount = visitCounts[app.patientId] || 0;

  const handleNoteSave = async () => {
    setNoteSaving(true);
    try {
      await onDoctorNoteSave(app._id || app.id, localNotes);
      setNoteSaved(true);
      setTimeout(() => setNoteSaved(false), 2000);
    } catch (err) {
      console.error(err);
    } finally {
      setNoteSaving(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, type: 'spring', stiffness: 200, damping: 25 }}
      className={`bg-white dark:bg-slate-900 rounded-[24px] border overflow-hidden transition-all duration-300 ${
        app.status === 'pending'
          ? 'border-amber-200 dark:border-amber-700 shadow-lg shadow-amber-500/10'
          : app.priority === 'urgent'
          ? 'border-red-200 dark:border-red-700 shadow-lg shadow-red-500/10'
          : 'border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-md'
      }`}
    >
      {/* Urgent indicator strip */}
      {app.priority === 'urgent' && (
        <div className="h-1 bg-gradient-to-r from-red-500 via-orange-500 to-red-500 animate-pulse" />
      )}

      {/* Card Header */}
      <div
        className={`p-5 flex items-center gap-4 cursor-pointer ${app.status === 'pending' ? 'bg-amber-50/50 dark:bg-amber-900/10' : ''}`}
        onClick={() => setExpanded(v => !v)}
      >
        {/* Avatar */}
        <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${avatarColor} text-white font-black text-lg flex items-center justify-center shadow-md flex-shrink-0`}>
          {initials}
        </div>

        {/* Info */}
        <div className="flex-grow min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="font-black text-slate-900 dark:text-slate-100 text-base">{app.patientName || 'Patient'}</h3>
            {app.status === 'pending' && (
              <span className="flex items-center gap-1 px-2.5 py-0.5 bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 rounded-full text-[10px] font-bold uppercase tracking-wider">
                <span className="w-1.5 h-1.5 bg-amber-500 rounded-full animate-pulse" />
                New Request
              </span>
            )}
            {/* Visit Count Badge */}
            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
              visitCount === 0
                ? 'bg-teal-100 dark:bg-teal-900/30 text-teal-700 dark:text-teal-400'
                : 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400'
            }`}>
              {visitCount === 0 ? '✨ First Visit' : `🔄 ${visitCount} past visit${visitCount > 1 ? 's' : ''}`}
            </span>
            {/* Priority Badge */}
            {app.priority && app.priority !== 'routine' && (
              <span className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${prio.bg} ${prio.text}`}>
                <PrioIcon size={10} />
                {prio.label}
              </span>
            )}
          </div>
          <div className="flex flex-wrap gap-3 mt-1">
            <span className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 font-semibold">
              <Calendar size={12} className="text-[var(--color-primary)]" />
              {new Date(app.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
            </span>
            <span className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 font-semibold">
              <Clock size={12} className="text-[var(--color-primary)]" />
              {app.time}
            </span>
            <span className={`flex items-center gap-1.5 text-xs font-bold px-2.5 py-0.5 rounded-full ${
              app.appointmentType === 'online'
                ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400'
                : 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400'
            }`}>
              {app.appointmentType === 'online' ? <Video size={11} /> : <MapPin size={11} />}
              {app.appointmentType === 'online' ? 'Video Call' : 'In-Person'}
            </span>
            {/* Time Since Request */}
            {app.status === 'pending' && app.createdAt && (
              <span className="flex items-center gap-1.5 text-xs text-orange-500 dark:text-orange-400 font-semibold">
                <Clock size={11} />
                Requested {timeAgo(app.createdAt)}
              </span>
            )}
          </div>
        </div>

        {/* Status Badge + Expand */}
        <div className="flex items-center gap-3 flex-shrink-0">
          <span className={`hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[10px] font-bold uppercase tracking-wider ${statusStyle.bg} ${statusStyle.text}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${statusStyle.dot}`} />
            {statusStyle.label}
          </span>
          {expanded ? <ChevronUp size={18} className="text-slate-400" /> : <ChevronDown size={18} className="text-slate-400" />}
        </div>
      </div>

      {/* Expanded Details */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="overflow-hidden"
          >
            <div className="px-5 pb-5 border-t border-slate-100 dark:border-slate-800 space-y-4 pt-4">
              {/* Detail Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {app.reason && (
                  <div className="bg-slate-50 dark:bg-slate-800/60 rounded-2xl p-4">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 flex items-center gap-1">
                      <BriefcaseMedical size={11} /> Chief Complaint
                    </p>
                    <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">{app.reason}</p>
                  </div>
                )}
                {app.symptoms && (
                  <div className="bg-slate-50 dark:bg-slate-800/60 rounded-2xl p-4">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 flex items-center gap-1">
                      <AlertCircle size={11} /> Symptoms Reported
                    </p>
                    <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">{app.symptoms}</p>
                  </div>
                )}
                {app.patientPhone && (
                  <div className="bg-slate-50 dark:bg-slate-800/60 rounded-2xl p-4">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 flex items-center gap-1">
                      <Phone size={11} /> Contact Phone
                    </p>
                    <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                      <a href={`tel:${app.patientPhone}`} className="hover:underline text-[var(--color-primary)]">{app.patientPhone}</a>
                    </p>
                  </div>
                )}
                {app.patientAddress && (
                  <div className="bg-slate-50 dark:bg-slate-800/60 rounded-2xl p-4">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 flex items-center gap-1">
                      <MapPin size={11} /> Patient Location
                    </p>
                    <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">{app.patientAddress}</p>
                  </div>
                )}
                <div className="bg-slate-50 dark:bg-slate-800/60 rounded-2xl p-4">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 flex items-center gap-1">
                    <DollarSign size={11} /> Payment Method
                  </p>
                  <p className="text-sm font-semibold text-slate-800 dark:text-slate-200 capitalize flex items-center gap-1.5">
                    {(app.paymentMethod || 'Not specified').replace('_', ' ')}
                    {app.paymentMethod === 'card' && (
                      <span className="text-[10px] px-2 py-0.5 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-full font-bold uppercase tracking-wider">Secure Pre-auth</span>
                    )}
                  </p>
                </div>
                <div className="bg-slate-50 dark:bg-slate-800/60 rounded-2xl p-4">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 flex items-center gap-1">
                    <User size={11} /> Patient ID
                  </p>
                  <p className="text-sm font-semibold text-slate-800 dark:text-slate-200 font-mono">{app.patientId?.slice(-8) || '—'}</p>
                </div>
              </div>

              {/* Priority Tagging */}
              {(app.status === 'pending' || app.status === 'confirmed') && (
                <div className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-800/40 rounded-2xl">
                  <Tag size={14} className="text-slate-400 flex-shrink-0" />
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex-shrink-0">Priority:</span>
                  <div className="flex gap-2 flex-wrap">
                    {Object.entries(priorityConfig).map(([key, config]) => {
                      const Icon = config.icon;
                      return (
                        <button
                          key={key}
                          onClick={() => onPriorityChange(app._id || app.id, key)}
                          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[11px] font-bold transition-all border ${
                            (app.priority || 'routine') === key
                              ? `${config.bg} ${config.text} ${config.border} ring-2 ring-offset-1 ring-current/20`
                              : 'bg-white dark:bg-slate-800 text-slate-400 border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700'
                          }`}
                        >
                          <Icon size={12} />
                          {config.label}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Preparation Instructions if set */}
              {app.preparationInstructions && (
                <div className="flex items-start gap-3 p-4 bg-emerald-50 dark:bg-emerald-900/20 rounded-2xl border border-emerald-100 dark:border-emerald-800">
                  <CheckCircle2 size={16} className="text-emerald-500 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-xs font-bold text-emerald-700 dark:text-emerald-400 mb-0.5">Preparation Instructions</p>
                    <p className="text-sm text-emerald-600 dark:text-emerald-300">{app.preparationInstructions}</p>
                  </div>
                </div>
              )}

              {/* Follow-up date if set */}
              {app.followUpDate && (
                <div className="flex items-start gap-3 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-2xl border border-blue-100 dark:border-blue-800">
                  <CalendarPlus size={16} className="text-blue-500 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-xs font-bold text-blue-700 dark:text-blue-400 mb-0.5">Follow-up Scheduled</p>
                    <p className="text-sm text-blue-600 dark:text-blue-300 font-semibold">
                      {new Date(app.followUpDate).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
                    </p>
                  </div>
                </div>
              )}

              {/* Proposed Reschedule Details */}
              {app.status === 'rescheduled' && (
                <div className="flex items-start gap-3 p-4 bg-indigo-50 dark:bg-indigo-900/20 rounded-2xl border border-indigo-100 dark:border-indigo-800">
                  <Clock size={16} className="text-indigo-500 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-xs font-bold text-indigo-700 dark:text-indigo-400 mb-0.5">Proposed Reschedule Details</p>
                    <p className="text-sm text-indigo-800 dark:text-indigo-200 font-semibold">
                      New Date/Time: {new Date(app.rescheduledDate).toLocaleDateString()} at {app.rescheduledTime}
                    </p>
                    <p className="text-xs text-indigo-600 dark:text-indigo-300 mt-1">
                      Reason: {app.rescheduleReason}
                    </p>
                    <p className="text-[10px] text-slate-400 uppercase tracking-wider font-bold mt-2 animate-pulse">
                      Pending Patient Approval
                    </p>
                  </div>
                </div>
              )}

              {/* Rejection reason if rejected */}
              {app.rejectionReason && (
                <div className="flex items-start gap-3 p-4 bg-red-50 dark:bg-red-900/20 rounded-2xl border border-red-100 dark:border-red-800">
                  <XCircle size={16} className="text-red-500 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-xs font-bold text-red-700 dark:text-red-400 mb-0.5">Reason for Declining</p>
                    <p className="text-sm text-red-600 dark:text-red-300">{app.rejectionReason}</p>
                  </div>
                </div>
              )}

              {/* ── Doctor Notes (inline) ── */}
              {(app.status === 'pending' || app.status === 'confirmed' || app.status === 'completed') && (
                <div className="p-4 bg-amber-50/50 dark:bg-amber-900/10 rounded-2xl border border-amber-100 dark:border-amber-800/50 space-y-2">
                  <div className="flex items-center justify-between">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                      <StickyNote size={11} /> Private Doctor Notes
                    </p>
                    <button
                      onClick={handleNoteSave}
                      disabled={noteSaving || localNotes === (app.doctorNotes || '')}
                      className={`flex items-center gap-1 px-3 py-1 rounded-lg text-[10px] font-bold transition-all ${
                        noteSaved
                          ? 'bg-green-100 text-green-600'
                          : 'bg-white dark:bg-slate-800 text-slate-500 hover:text-slate-700 dark:text-slate-400 border border-slate-200 dark:border-slate-700 disabled:opacity-40'
                      }`}
                    >
                      {noteSaving ? <Loader2 size={10} className="animate-spin" /> : noteSaved ? <CheckCircle2 size={10} /> : <Save size={10} />}
                      {noteSaved ? 'Saved!' : 'Save'}
                    </button>
                  </div>
                  <textarea
                    rows={2}
                    value={localNotes}
                    onChange={(e) => setLocalNotes(e.target.value)}
                    placeholder="Jot down private notes about this appointment..."
                    className="w-full px-3 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold outline-none focus:ring-2 focus:ring-amber-300 text-slate-800 dark:text-slate-200 resize-none"
                  />
                </div>
              )}

              {/* ── PENDING Actions ── */}
              {app.status === 'pending' && !rescheduleMode && (
                <div className="space-y-3 pt-2">
                  {/* Fee & Prep Instructions Row */}
                  <div className="flex flex-col sm:flex-row gap-3 w-full">
                    {/* Fee Input */}
                    <div className="relative w-full sm:w-36 flex-shrink-0">
                      <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-sm">₦</span>
                      <input
                        type="number"
                        placeholder="Fee"
                        value={amounts[app._id || app.id] || ''}
                        onChange={(e) => onAmountChange(app._id || app.id, e.target.value)}
                        className="w-full pl-8 pr-3 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-sm font-semibold outline-none focus:ring-2 focus:ring-blue-400 text-slate-800 dark:text-slate-200"
                      />
                    </div>
                    {/* Preparation Instructions */}
                    <div className="flex-grow">
                      <input
                        type="text"
                        placeholder="Pre-consultation instructions (e.g. fast for 8h, bring scan reports) - Optional"
                        value={prepInstructions[app._id || app.id] || ''}
                        onChange={(e) => onPrepChange(app._id || app.id, e.target.value)}
                        className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-sm font-semibold outline-none focus:ring-2 focus:ring-blue-400 text-slate-800 dark:text-slate-200"
                      />
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-3">
                    <button
                      onClick={() => onConfirm(app._id || app.id)}
                      disabled={isUpdating === (app._id || app.id)}
                      className="flex-grow min-w-[130px] px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-2xl font-bold text-sm hover:from-green-600 hover:to-emerald-700 transition-all shadow-lg shadow-green-500/25 flex items-center justify-center gap-2 disabled:opacity-60"
                    >
                      {isUpdating === (app._id || app.id) ? (
                        <Loader2 size={16} className="animate-spin" />
                      ) : (
                        <CheckCircle2 size={16} />
                      )}
                      Accept Booking
                    </button>

                    <button
                      onClick={() => setRescheduleMode(true)}
                      disabled={isUpdating === (app._id || app.id)}
                      className="px-6 py-3 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-700 rounded-2xl font-bold text-sm hover:bg-indigo-100 dark:hover:bg-indigo-900/40 transition-all flex items-center justify-center gap-2 disabled:opacity-60"
                    >
                      <Clock size={16} />
                      Reschedule
                    </button>

                    <button
                      onClick={() => onReject(app)}
                      disabled={isUpdating === (app._id || app.id)}
                      className="px-6 py-3 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-700 rounded-2xl font-bold text-sm hover:bg-red-100 dark:hover:bg-red-900/40 transition-all flex items-center justify-center gap-2 disabled:opacity-60"
                    >
                      <XCircle size={16} />
                      Decline
                    </button>
                  </div>

                  {/* Utility row for pending */}
                  <div className="flex flex-wrap gap-2 pt-1">
                    <button
                      onClick={() => onViewHistory(app)}
                      className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-violet-600 dark:text-violet-400 bg-violet-50 dark:bg-violet-900/20 border border-violet-200 dark:border-violet-700 rounded-xl hover:bg-violet-100 dark:hover:bg-violet-900/40 transition-all"
                    >
                      <Eye size={13} /> Patient History
                    </button>
                    <button
                      onClick={() => onPrint(app)}
                      className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-700 transition-all"
                    >
                      <Printer size={13} /> Print
                    </button>
                  </div>
                </div>
              )}

              {/* Reschedule Mode Inline Form */}
              {rescheduleMode && (
                <div className="mt-4 p-4 bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 rounded-2xl space-y-3">
                  <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider">Propose Reschedule</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 mb-1">New Date</label>
                      <input
                        type="date"
                        min={new Date().toISOString().split('T')[0]}
                        value={resDate}
                        onChange={(e) => setResDate(e.target.value)}
                        className="w-full p-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold outline-none focus:ring-2 focus:ring-indigo-400 text-slate-800 dark:text-slate-200"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 mb-1">New Time</label>
                      <select
                        value={resTime}
                        onChange={(e) => setResTime(e.target.value)}
                        className="w-full p-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold outline-none focus:ring-2 focus:ring-indigo-400 text-slate-800 dark:text-slate-200"
                      >
                        {['08:00 AM', '08:30 AM', '09:00 AM', '09:30 AM', '10:00 AM', '10:30 AM', '11:00 AM', '11:30 AM', '12:00 PM', '12:30 PM', '01:00 PM', '01:30 PM', '02:00 PM', '02:30 PM', '03:00 PM', '03:30 PM', '04:00 PM', '04:30 PM', '05:00 PM'].map(t => (
                          <option key={t} value={t}>{t}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 mb-1">Reason for Rescheduling</label>
                    <textarea
                      rows={2}
                      value={resReason}
                      onChange={(e) => setResReason(e.target.value)}
                      placeholder="e.g. Doctor is called in for emergency surgery..."
                      className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold outline-none focus:ring-2 focus:ring-indigo-400 text-slate-800 dark:text-slate-200 resize-none"
                    />
                  </div>
                  <div className="flex gap-2 justify-end">
                    <button
                      type="button"
                      onClick={() => setRescheduleMode(false)}
                      className="px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-500 hover:bg-white dark:hover:bg-slate-800"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      disabled={!resDate || !resReason.trim() || isUpdating === (app._id || app.id)}
                      onClick={async () => {
                        await onReschedule(app._id || app.id, resDate, resTime, resReason);
                        setRescheduleMode(false);
                      }}
                      className="px-4 py-2 bg-indigo-600 text-white rounded-xl text-xs font-bold hover:bg-indigo-700 disabled:opacity-50"
                    >
                      Propose Reschedule
                    </button>
                  </div>
                </div>
              )}

              {/* ── CONFIRMED Actions ── */}
              {app.status === 'confirmed' && (
                <div className="space-y-3 pt-2">
                  <div className="flex flex-wrap gap-3">
                    <button
                      onClick={() => onChat(app)}
                      className="px-5 py-3 bg-blue-50 dark:bg-blue-900/20 text-[var(--color-primary)] border border-blue-200 dark:border-blue-700 rounded-2xl font-bold text-sm hover:bg-blue-100 transition-all flex items-center gap-2"
                    >
                      <MessageSquare size={16} /> Message Patient
                    </button>
                    <button
                      onClick={() => onNotes(app)}
                      className="px-5 py-3 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-700 rounded-2xl font-bold text-sm hover:bg-emerald-100 dark:hover:bg-emerald-900/40 transition-all flex items-center gap-2"
                    >
                      <FileText size={16} /> Clinical Workspace
                    </button>
                    {app.appointmentType === 'online' && (
                      <button
                        onClick={async () => {
                          const roomCode = `BC-${Date.now().toString(36).toUpperCase()}`;
                          try {
                            await db.createMeeting({
                              roomCode,
                              doctorId: user.id,
                              doctorName: user.name,
                              patientId: app.patientId,
                              patientName: app.patientName,
                              appointmentId: app._id || app.id,
                              status: 'waiting',
                            });
                            await db.addNotification({
                              userId: app.patientId,
                              title: '📹 Video Call Started',
                              message: `Dr. ${user.name} has started your video consultation. Join with code: ${roomCode}`,
                              type: 'meeting',
                            });
                            window.open(`/meeting/${roomCode}`, '_blank');
                          } catch (error) {
                            console.error('Error creating meeting:', error);
                          }
                        }}
                        className="px-5 py-3 bg-gradient-to-r from-violet-500 to-purple-600 text-white rounded-2xl font-bold text-sm hover:from-violet-600 hover:to-purple-700 transition-all shadow-lg shadow-violet-500/25 flex items-center gap-2"
                      >
                        <Video size={16} /> Start Video Call
                      </button>
                    )}
                    <button
                      onClick={() => onPrescribe(app)}
                      className="px-5 py-3 bg-teal-50 dark:bg-teal-900/20 text-teal-600 dark:text-teal-400 border border-teal-200 dark:border-teal-700 rounded-2xl font-bold text-sm hover:bg-teal-100 dark:hover:bg-teal-900/40 transition-all flex items-center gap-2"
                    >
                      <Pill size={16} /> Quick Prescribe
                    </button>
                    <button
                      onClick={() => onConfirm(app._id || app.id, 'completed')}
                      disabled={isUpdating === (app._id || app.id)}
                      className="px-5 py-3 bg-gradient-to-r from-blue-500 to-blue-700 text-white rounded-2xl font-bold text-sm hover:from-blue-600 hover:to-blue-800 transition-all shadow-lg shadow-blue-500/25 flex items-center gap-2 disabled:opacity-60"
                    >
                      {isUpdating === (app._id || app.id) ? <Loader2 size={16} className="animate-spin" /> : <CheckCircle2 size={16} />}
                      Mark Completed
                    </button>
                  </div>
                  {/* Utility row for confirmed */}
                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={() => onViewHistory(app)}
                      className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-violet-600 dark:text-violet-400 bg-violet-50 dark:bg-violet-900/20 border border-violet-200 dark:border-violet-700 rounded-xl hover:bg-violet-100 dark:hover:bg-violet-900/40 transition-all"
                    >
                      <Eye size={13} /> Patient History
                    </button>
                    <button
                      onClick={() => onPrint(app)}
                      className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-700 transition-all"
                    >
                      <Printer size={13} /> Print
                    </button>
                  </div>
                </div>
              )}

              {/* ── COMPLETED Actions ── */}
              {app.status === 'completed' && (
                <div className="space-y-3 pt-2">
                  <div className="flex flex-wrap gap-3">
                    <button
                      onClick={() => onPrescribe(app)}
                      className="px-5 py-3 bg-teal-50 dark:bg-teal-900/20 text-teal-600 dark:text-teal-400 border border-teal-200 dark:border-teal-700 rounded-2xl font-bold text-sm hover:bg-teal-100 dark:hover:bg-teal-900/40 transition-all flex items-center gap-2"
                    >
                      <Pill size={16} /> Write Prescription
                    </button>
                    <button
                      onClick={() => onFollowUp(app)}
                      className="px-5 py-3 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-700 rounded-2xl font-bold text-sm hover:bg-blue-100 dark:hover:bg-blue-900/40 transition-all flex items-center gap-2"
                    >
                      <CalendarPlus size={16} /> Set Follow-up
                    </button>
                    <button
                      onClick={() => onNotes(app)}
                      className="px-5 py-3 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-700 rounded-2xl font-bold text-sm hover:bg-emerald-100 dark:hover:bg-emerald-900/40 transition-all flex items-center gap-2"
                    >
                      <FileText size={16} /> Clinical Notes
                    </button>
                    <button
                      onClick={() => onChat(app)}
                      className="px-5 py-3 bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700 rounded-2xl font-bold text-sm hover:bg-slate-100 dark:hover:bg-slate-700 transition-all flex items-center gap-2"
                    >
                      <MessageSquare size={16} /> Message
                    </button>
                  </div>
                  {/* Utility row for completed */}
                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={() => onViewHistory(app)}
                      className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-violet-600 dark:text-violet-400 bg-violet-50 dark:bg-violet-900/20 border border-violet-200 dark:border-violet-700 rounded-xl hover:bg-violet-100 dark:hover:bg-violet-900/40 transition-all"
                    >
                      <Eye size={13} /> Patient History
                    </button>
                    <button
                      onClick={() => onPrint(app)}
                      className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-700 transition-all"
                    >
                      <Printer size={13} /> Print
                    </button>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

// ─── Main Component ─────────────────────────────────────────────────────────
const AppointmentQueue = ({ user }) => {
  const navigate = useNavigate();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [amounts, setAmounts] = useState({});
  const [prepInstructions, setPrepInstructions] = useState({});
  const [isUpdating, setIsUpdating] = useState(null);
  const [rejectTarget, setRejectTarget] = useState(null);
  const [rejectLoading, setRejectLoading] = useState(false);
  const [visitCounts, setVisitCounts] = useState({});

  // Modal states
  const [prescribeTarget, setPrescribeTarget] = useState(null);
  const [followUpTarget, setFollowUpTarget] = useState(null);
  const [historyTarget, setHistoryTarget] = useState(null);

  const fetchAppointments = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    else setRefreshing(true);
    try {
      const all = await db.getDoctorAppointments(user.id);
      // Sort: pending first, then rescheduled, then urgent, then by date desc
      all.sort((a, b) => {
        if (a.status === 'pending' && b.status !== 'pending') return -1;
        if (b.status === 'pending' && a.status !== 'pending') return 1;
        if (a.status === 'rescheduled' && b.status !== 'rescheduled') return -1;
        if (b.status === 'rescheduled' && a.status !== 'rescheduled') return 1;
        if (a.priority === 'urgent' && b.priority !== 'urgent') return -1;
        if (b.priority === 'urgent' && a.priority !== 'urgent') return 1;
        return new Date(b.date) - new Date(a.date);
      });
      setAppointments(all);

      // Calculate visit counts per patient
      const counts = {};
      all.forEach(a => {
        if (!counts[a.patientId]) counts[a.patientId] = 0;
        if (a.status === 'completed' || a.status === 'confirmed') {
          counts[a.patientId]++;
        }
      });
      setVisitCounts(counts);
    } catch (error) {
      console.error('Error fetching appointments:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [user.id]);

  useEffect(() => {
    fetchAppointments();
  }, [fetchAppointments]);

  const handleConfirm = async (id, status = 'confirmed') => {
    setIsUpdating(id);
    try {
      const updateData = { status };
      if (status === 'confirmed') {
        updateData.amount = parseFloat(amounts[id] || 0);
        updateData.preparationInstructions = prepInstructions[id] || '';
      }
      await db.updateAppointment(id, updateData);
      const app = appointments.find(a => (a._id || a.id) === id);
      if (app) {
        await db.addNotification({
          userId: app.patientId,
          title: status === 'confirmed' ? '✅ Appointment Confirmed!' : '✅ Consultation Completed',
          message: status === 'confirmed'
            ? `Dr. ${user.name} has confirmed your appointment on ${new Date(app.date).toLocaleDateString()} at ${app.time}.${amounts[id] ? ` Consultation fee: ₦${amounts[id]}.` : ''}${prepInstructions[id] ? ` Instructions: ${prepInstructions[id]}` : ''}`
            : `Your consultation with Dr. ${user.name} on ${new Date(app.date).toLocaleDateString()} has been marked as completed.`,
          type: 'appointment',
        });
      }
      await fetchAppointments(true);
    } catch (error) {
      console.error('Error updating appointment:', error);
    } finally {
      setIsUpdating(null);
    }
  };

  const handleReschedule = async (id, date, time, reason) => {
    setIsUpdating(id);
    try {
      const app = appointments.find(a => (a._id || a.id) === id);
      const updateData = {
        status: 'rescheduled',
        rescheduledDate: date,
        rescheduledTime: time,
        rescheduleReason: reason,
        rescheduledBy: 'doctor'
      };
      await db.updateAppointment(id, updateData);
      if (app) {
        await db.addNotification({
          userId: app.patientId,
          title: '🗓️ Appointment Reschedule Proposed',
          message: `Dr. ${user.name} has proposed rescheduling your appointment to ${new Date(date).toLocaleDateString()} at ${time}. Reason: ${reason}`,
          type: 'appointment',
        });
      }
      await fetchAppointments(true);
    } catch (error) {
      console.error('Error proposing reschedule:', error);
    } finally {
      setIsUpdating(null);
    }
  };

  const handleRejectConfirm = async (reason) => {
    if (!rejectTarget) return;
    const id = rejectTarget._id || rejectTarget.id;
    setRejectLoading(true);
    try {
      await db.updateAppointment(id, { status: 'rejected', rejectionReason: reason });
      await db.addNotification({
        userId: rejectTarget.patientId,
        title: '❌ Appointment Declined',
        message: `Your appointment request with Dr. ${user.name} on ${new Date(rejectTarget.date).toLocaleDateString()} was declined. Reason: ${reason}`,
        type: 'appointment',
      });
      setRejectTarget(null);
      await fetchAppointments(true);
    } catch (error) {
      console.error('Error rejecting appointment:', error);
    } finally {
      setRejectLoading(false);
    }
  };

  const handleChat = (app) => {
    navigate('/dashboard/doctor/messages', { state: { patient: { id: app.patientId, name: app.patientName } } });
  };

  const handleNotes = (app) => {
    navigate('/dashboard/doctor/notes', { state: { patient: { id: app.patientId, name: app.patientName } } });
  };

  const handlePriorityChange = async (id, priority) => {
    try {
      await db.updateAppointment(id, { priority });
      await fetchAppointments(true);
    } catch (error) {
      console.error('Error updating priority:', error);
    }
  };

  const handleDoctorNoteSave = async (id, notes) => {
    await db.updateAppointment(id, { doctorNotes: notes });
    await fetchAppointments(true);
  };

  const handlePrint = (app) => {
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Appointment Summary — ${app.patientName}</title>
        <style>
          body { font-family: 'Segoe UI', system-ui, sans-serif; padding: 40px; color: #1e293b; max-width: 700px; margin: 0 auto; }
          h1 { font-size: 22px; margin-bottom: 4px; }
          h2 { font-size: 14px; color: #64748b; font-weight: 600; text-transform: uppercase; letter-spacing: 1px; margin-top: 28px; margin-bottom: 12px; border-bottom: 2px solid #e2e8f0; padding-bottom: 6px; }
          .header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 20px; border-bottom: 3px solid #3b82f6; padding-bottom: 16px; }
          .badge { display: inline-block; padding: 4px 12px; border-radius: 12px; font-size: 11px; font-weight: 700; text-transform: uppercase; }
          .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
          .field { background: #f8fafc; border-radius: 12px; padding: 14px; }
          .field-label { font-size: 10px; font-weight: 700; color: #94a3b8; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 4px; }
          .field-value { font-size: 14px; font-weight: 600; }
          .notes { background: #fffbeb; border-radius: 12px; padding: 14px; margin-top: 12px; }
          .footer { margin-top: 32px; padding-top: 16px; border-top: 1px solid #e2e8f0; font-size: 11px; color: #94a3b8; text-align: center; }
          @media print { body { padding: 20px; } }
        </style>
      </head>
      <body>
        <div class="header">
          <div>
            <h1>🏥 BashCare Hub</h1>
            <p style="color: #64748b; font-size: 13px;">Appointment Summary Report</p>
          </div>
          <div style="text-align: right;">
            <p style="font-size: 12px; color: #64748b;">Generated</p>
            <p style="font-size: 13px; font-weight: 600;">${new Date().toLocaleString()}</p>
          </div>
        </div>

        <h2>Patient Information</h2>
        <div class="grid">
          <div class="field">
            <div class="field-label">Patient Name</div>
            <div class="field-value">${app.patientName || '—'}</div>
          </div>
          <div class="field">
            <div class="field-label">Patient ID</div>
            <div class="field-value" style="font-family: monospace;">${app.patientId?.slice(-8) || '—'}</div>
          </div>
          <div class="field">
            <div class="field-label">Phone</div>
            <div class="field-value">${app.patientPhone || '—'}</div>
          </div>
          <div class="field">
            <div class="field-label">Address</div>
            <div class="field-value">${app.patientAddress || '—'}</div>
          </div>
        </div>

        <h2>Appointment Details</h2>
        <div class="grid">
          <div class="field">
            <div class="field-label">Date</div>
            <div class="field-value">${new Date(app.date).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}</div>
          </div>
          <div class="field">
            <div class="field-label">Time</div>
            <div class="field-value">${app.time}</div>
          </div>
          <div class="field">
            <div class="field-label">Type</div>
            <div class="field-value">${app.appointmentType === 'online' ? '📹 Video Call' : '🏥 In-Person'}</div>
          </div>
          <div class="field">
            <div class="field-label">Status</div>
            <div class="field-value" style="text-transform: capitalize;">${app.status}</div>
          </div>
          <div class="field">
            <div class="field-label">Payment Method</div>
            <div class="field-value" style="text-transform: capitalize;">${(app.paymentMethod || '—').replace('_', ' ')}</div>
          </div>
          <div class="field">
            <div class="field-label">Priority</div>
            <div class="field-value" style="text-transform: capitalize;">${app.priority || 'Routine'}</div>
          </div>
        </div>

        <h2>Clinical Information</h2>
        <div class="grid">
          <div class="field">
            <div class="field-label">Chief Complaint</div>
            <div class="field-value">${app.reason || '—'}</div>
          </div>
          <div class="field">
            <div class="field-label">Symptoms Reported</div>
            <div class="field-value">${app.symptoms || '—'}</div>
          </div>
        </div>

        ${app.preparationInstructions ? `
        <div class="notes" style="background: #ecfdf5;">
          <div class="field-label">Preparation Instructions</div>
          <div class="field-value">${app.preparationInstructions}</div>
        </div>
        ` : ''}

        ${app.doctorNotes ? `
        <div class="notes">
          <div class="field-label">Doctor's Notes</div>
          <div class="field-value">${app.doctorNotes}</div>
        </div>
        ` : ''}

        <div class="footer">
          <p>BashCare Hub — Confidential Medical Document</p>
          <p>Doctor: Dr. ${user.name} | Printed: ${new Date().toLocaleString()}</p>
        </div>
      </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => printWindow.print(), 500);
  };

  const filtered = appointments.filter(app => {
    const matchSearch = !searchQuery.trim() ||
      (app.patientName || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (app.reason || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (app.symptoms || '').toLowerCase().includes(searchQuery.toLowerCase());
    const matchFilter = filterStatus === 'all' || app.status === filterStatus;
    return matchSearch && matchFilter;
  });

  const pendingCount = appointments.filter(a => a.status === 'pending').length;
  const urgentCount = appointments.filter(a => a.priority === 'urgent' && (a.status === 'pending' || a.status === 'confirmed')).length;

  const STATUS_FILTERS = [
    { key: 'all', label: 'All' },
    { key: 'pending', label: 'Pending' },
    { key: 'confirmed', label: 'Confirmed' },
    { key: 'rescheduled', label: 'Rescheduled' },
    { key: 'completed', label: 'Completed' },
    { key: 'rejected', label: 'Declined' },
  ];

  if (loading) return (
    <div className="flex flex-col items-center justify-center py-24 gap-4">
      <Loader2 size={36} className="animate-spin text-[var(--color-primary)]" />
      <p className="font-bold text-slate-500">Loading appointment queue...</p>
    </div>
  );

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-black text-slate-900 dark:text-slate-100">Booking Inbox</h1>
            {pendingCount > 0 && (
              <span className="flex items-center gap-1.5 px-3 py-1 bg-amber-500 text-white rounded-full text-xs font-black">
                <Bell size={12} />
                {pendingCount} New
              </span>
            )}
            {urgentCount > 0 && (
              <span className="flex items-center gap-1.5 px-3 py-1 bg-red-500 text-white rounded-full text-xs font-black animate-pulse">
                <Flame size={12} />
                {urgentCount} Urgent
              </span>
            )}
          </div>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            Review, accept or decline patient booking requests
          </p>
        </div>
        <button
          onClick={() => fetchAppointments(true)}
          disabled={refreshing}
          className="flex items-center gap-2 px-4 py-2.5 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-2xl text-sm font-bold hover:bg-slate-200 dark:hover:bg-slate-700 transition-all"
        >
          <RefreshCw size={15} className={refreshing ? 'animate-spin' : ''} />
          Refresh
        </button>
      </div>

      {/* Pending alert banner */}
      {pendingCount > 0 && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-3 p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700 rounded-2xl"
        >
          <div className="p-2 bg-amber-100 dark:bg-amber-900/40 rounded-xl">
            <Bell size={18} className="text-amber-600 dark:text-amber-400" />
          </div>
          <div className="flex-grow">
            <p className="text-sm font-bold text-amber-800 dark:text-amber-300">
              You have {pendingCount} pending booking request{pendingCount > 1 ? 's' : ''} awaiting your review.
            </p>
            <p className="text-xs text-amber-600 dark:text-amber-400 mt-0.5">
              Patients are waiting for your confirmation. Please review and respond promptly.
            </p>
          </div>
        </motion.div>
      )}

      {/* Search & Filter */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-grow">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={17} />
          <input
            type="text"
            placeholder="Search by patient name, reason, or symptoms..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-11 pr-4 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl text-sm outline-none focus:ring-2 focus:ring-[var(--color-primary)]/30 text-slate-800 dark:text-slate-200"
          />
        </div>
        <div className="flex items-center gap-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl px-3 overflow-x-auto">
          <Filter size={15} className="text-slate-400 flex-shrink-0" />
          {STATUS_FILTERS.map(f => (
            <button
              key={f.key}
              onClick={() => setFilterStatus(f.key)}
              className={`px-3 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                filterStatus === f.key
                  ? 'bg-[var(--color-primary)] text-white'
                  : 'text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              {f.label}
              {f.key === 'pending' && pendingCount > 0 && (
                <span className={`ml-1.5 px-1.5 py-0.5 rounded-full text-[9px] font-black ${filterStatus === 'pending' ? 'bg-white/30 text-white' : 'bg-amber-500 text-white'}`}>
                  {pendingCount}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Appointment List */}
      <div className="space-y-4">
        {filtered.length > 0 ? filtered.map((app, i) => (
          <AppointmentCard
            key={app._id || app.id}
            app={app}
            index={i}
            user={user}
            amounts={amounts}
            onAmountChange={(id, val) => setAmounts(prev => ({ ...prev, [id]: val }))}
            prepInstructions={prepInstructions}
            onPrepChange={(id, val) => setPrepInstructions(prev => ({ ...prev, [id]: val }))}
            onConfirm={handleConfirm}
            onReject={(app) => setRejectTarget(app)}
            onChat={handleChat}
            onReschedule={handleReschedule}
            onNotes={handleNotes}
            isUpdating={isUpdating}
            visitCounts={visitCounts}
            onPrescribe={(app) => setPrescribeTarget(app)}
            onFollowUp={(app) => setFollowUpTarget(app)}
            onViewHistory={(app) => setHistoryTarget(app)}
            onPrint={handlePrint}
            onPriorityChange={handlePriorityChange}
            onDoctorNoteSave={handleDoctorNoteSave}
          />
        )) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-24 bg-white dark:bg-slate-900 rounded-[3rem] border border-dashed border-slate-200 dark:border-slate-700"
          >
            <div className="w-20 h-20 bg-slate-50 dark:bg-slate-800 rounded-3xl flex items-center justify-center mx-auto mb-5">
              <Stethoscope size={36} className="text-slate-300 dark:text-slate-600" />
            </div>
            <h3 className="text-lg font-black text-slate-900 dark:text-slate-100">
              {searchQuery || filterStatus !== 'all' ? 'No matching appointments' : 'Your inbox is clear'}
            </h3>
            <p className="text-slate-500 dark:text-slate-400 text-sm mt-2 max-w-xs mx-auto">
              {searchQuery || filterStatus !== 'all'
                ? `No appointments found for your current filters.`
                : 'No booking requests yet. New patient requests will appear here.'
              }
            </p>
          </motion.div>
        )}
      </div>

      {/* ── Modals ── */}
      <AnimatePresence>
        {rejectTarget && (
          <RejectModal
            appointment={rejectTarget}
            onClose={() => setRejectTarget(null)}
            onConfirm={handleRejectConfirm}
            isLoading={rejectLoading}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {prescribeTarget && (
          <PrescribeModal
            appointment={prescribeTarget}
            user={user}
            onClose={() => setPrescribeTarget(null)}
            onSave={() => {
              setPrescribeTarget(null);
              fetchAppointments(true);
            }}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {followUpTarget && (
          <FollowUpModal
            appointment={followUpTarget}
            user={user}
            onClose={() => setFollowUpTarget(null)}
            onSave={() => {
              setFollowUpTarget(null);
              fetchAppointments(true);
            }}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {historyTarget && (
          <PatientHistoryPanel
            appointment={historyTarget}
            user={user}
            onClose={() => setHistoryTarget(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default AppointmentQueue;
