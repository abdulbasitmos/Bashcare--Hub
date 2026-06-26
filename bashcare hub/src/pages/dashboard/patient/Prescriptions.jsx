import { useState, useEffect, useMemo } from 'react';
import { 
  Pill, 
  Download, 
  Calendar, 
  Clock, 
  AlertCircle, 
  Info,
  ExternalLink,
  Check,
  X,
  Flame,
  Plus,
  ChevronLeft,
  ChevronRight,
  BarChart3,
  CheckCircle2,
  Trash2,
  Bell,
  Sparkles,
  CalendarDays,
  Activity
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { db } from '../../../utils/db';

const TIME_PERIODS = [
  { id: 'morning', label: 'Morning', icon: '🌅', time: '8:00 AM' },
  { id: 'afternoon', label: 'Afternoon', icon: '☀️', time: '1:00 PM' },
  { id: 'evening', label: 'Evening', icon: '🌆', time: '6:00 PM' },
  { id: 'bedtime', label: 'Bedtime', icon: '🌙', time: '10:00 PM' },
];

const Prescriptions = ({ user }) => {
  const [activeTab, setActiveTab] = useState('tracker'); // 'tracker' or 'prescriptions'
  const [prescriptions, setPrescriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toastMessage, setToastMessage] = useState(null);
  
  // Custom Local Reminders
  const [customMeds, setCustomMeds] = useState(() => {
    try {
      const saved = localStorage.getItem(`bashcare_custom_meds_${user.id}`);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Track logs: { [dateStr]: { [medId_periodId]: 'taken' | 'skipped' } }
  const [logs, setLogs] = useState(() => {
    try {
      const saved = localStorage.getItem(`bashcare_med_logs_${user.id}`);
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  // Modal State
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newMed, setNewMed] = useState({
    medication: '',
    dosage: '',
    instructions: '',
    slots: { morning: true, afternoon: false, evening: false, bedtime: false },
    startDate: '',
    endDate: ''
  });

  // Date Formatting Helper
  const getLocalDateString = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const [selectedDateStr, setSelectedDateStr] = useState(getLocalDateString(new Date()));

  // Toast Helper
  const triggerToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Fetch prescriptions from DB
  useEffect(() => {
    const fetchPrescriptions = async () => {
      try {
        const all = await db.getPatientPrescriptions(user.id);
        setPrescriptions(all);
      } catch (err) {
        console.error("Error fetching prescriptions:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchPrescriptions();
  }, [user.id]);

  // Persist Custom Meds
  useEffect(() => {
    localStorage.setItem(`bashcare_custom_meds_${user.id}`, JSON.stringify(customMeds));
  }, [customMeds, user.id]);

  // Persist Logs
  useEffect(() => {
    localStorage.setItem(`bashcare_med_logs_${user.id}`, JSON.stringify(logs));
  }, [logs, user.id]);

  // Auto-set starting date in modal
  useEffect(() => {
    if (isAddModalOpen && !newMed.startDate) {
      setNewMed(prev => ({ ...prev, startDate: getLocalDateString(new Date()) }));
    }
  }, [isAddModalOpen]);

  const activePrescriptions = prescriptions.filter(p => p.status !== 'expired');
  const pastPrescriptions = prescriptions.filter(p => p.status === 'expired');

  // Map Database prescriptions into Tracking objects
  const dbMedsMapped = useMemo(() => {
    return activePrescriptions.map(p => {
      // Parse frequency to determine times of day
      let slots = ['morning'];
      const freq = (p.frequency || '').toLowerCase();
      if (freq.includes('twice') || freq.includes('2x') || freq.includes('bid')) {
        slots = ['morning', 'evening'];
      } else if (freq.includes('three') || freq.includes('3x') || freq.includes('tid') || freq.includes('8 hours')) {
        slots = ['morning', 'afternoon', 'evening'];
      } else if (freq.includes('four') || freq.includes('4x') || freq.includes('qid')) {
        slots = ['morning', 'afternoon', 'evening', 'bedtime'];
      } else if (freq.includes('bedtime') || freq.includes('night') || freq.includes('hs')) {
        slots = ['bedtime'];
      } else if (freq.includes('evening') || freq.includes('pm')) {
        slots = ['evening'];
      } else if (freq.includes('afternoon')) {
        slots = ['afternoon'];
      }

      return {
        id: `db-${p.id}`,
        medication: p.medication,
        dosage: p.dosage,
        instructions: p.instructions || 'Take as prescribed by doctor.',
        slots,
        startDate: p.startDate || p.date,
        endDate: p.endDate || 'N/A',
        isDb: true,
        refills: p.refills || 0
      };
    });
  }, [activePrescriptions]);

  // Combine DB & Custom Meds
  const allMedications = useMemo(() => {
    return [...dbMedsMapped, ...customMeds];
  }, [dbMedsMapped, customMeds]);

  // Filter medications active for the selected date
  const activeMedsForDate = useMemo(() => {
    return allMedications.filter(med => {
      // Check start date
      if (med.startDate) {
        const start = new Date(med.startDate);
        start.setHours(0,0,0,0);
        const sel = new Date(selectedDateStr);
        sel.setHours(0,0,0,0);
        if (sel < start) return false;
      }
      // Check end date
      if (med.endDate && med.endDate !== 'N/A' && med.endDate !== 'None' && med.endDate !== '') {
        const end = new Date(med.endDate);
        end.setHours(23,59,59,999);
        const sel = new Date(selectedDateStr);
        sel.setHours(0,0,0,0);
        if (sel > end) return false;
      }
      return true;
    });
  }, [allMedications, selectedDateStr]);

  // Date list for the horizontal slider (5 days past, today, 1 day future)
  const dateList = useMemo(() => {
    const list = [];
    const today = new Date();
    for (let i = -5; i <= 1; i++) {
      const d = new Date();
      d.setDate(today.getDate() + i);
      list.push({
        dateStr: getLocalDateString(d),
        label: d.toLocaleDateString('en-US', { weekday: 'short' }),
        dayNum: d.getDate(),
        isToday: i === 0,
      });
    }
    return list;
  }, []);

  // Toggle log function
  const toggleLog = (medId, periodId, status) => {
    const key = `${medId}_${periodId}`;
    setLogs(prev => {
      const dayLogs = prev[selectedDateStr] || {};
      const currentStatus = dayLogs[key];
      
      let newStatus;
      if (currentStatus === status) {
        newStatus = undefined; // clear/reset
      } else {
        newStatus = status;
      }

      const updatedDayLogs = { ...dayLogs };
      if (newStatus) {
        updatedDayLogs[key] = newStatus;
      } else {
        delete updatedDayLogs[key];
      }

      return {
        ...prev,
        [selectedDateStr]: updatedDayLogs
      };
    });
    
    if (status === 'taken') {
      triggerToast("Medication dose logged as taken!");
    } else {
      triggerToast("Medication dose logged as skipped.");
    }
  };

  // Calculate Today's Stats
  const todayStats = useMemo(() => {
    let scheduled = 0;
    let taken = 0;
    let skipped = 0;

    activeMedsForDate.forEach(med => {
      const slots = med.slots || ['morning'];
      scheduled += slots.length;
      slots.forEach(slot => {
        const logVal = logs[selectedDateStr]?.[`${med.id}_${slot}`];
        if (logVal === 'taken') taken++;
        else if (logVal === 'skipped') skipped++;
      });
    });

    const rate = scheduled > 0 ? Math.round((taken / scheduled) * 100) : 100;
    return { scheduled, taken, skipped, rate };
  }, [activeMedsForDate, logs, selectedDateStr]);

  // Calculate Compliance Streak
  const currentStreak = useMemo(() => {
    let streak = 0;
    const today = new Date();
    
    // Scan up to 30 days backwards
    for (let i = 0; i < 30; i++) {
      const d = new Date();
      d.setDate(today.getDate() - i);
      const dateStr = getLocalDateString(d);
      
      // Get medications for this day
      const medsForDay = allMedications.filter(med => {
        if (med.startDate) {
          const start = new Date(med.startDate);
          start.setHours(0,0,0,0);
          const sel = new Date(dateStr);
          sel.setHours(0,0,0,0);
          if (sel < start) return false;
        }
        if (med.endDate && med.endDate !== 'N/A' && med.endDate !== 'None' && med.endDate !== '') {
          const end = new Date(med.endDate);
          end.setHours(23,59,59,999);
          const sel = new Date(dateStr);
          sel.setHours(0,0,0,0);
          if (sel > end) return false;
        }
        return true;
      });

      if (medsForDay.length === 0) {
        // Skip days with no scheduled medications
        continue;
      }

      let dayScheduled = 0;
      let dayTaken = 0;
      let daySkipped = 0;

      medsForDay.forEach(med => {
        const slots = med.slots || ['morning'];
        dayScheduled += slots.length;
        slots.forEach(slot => {
          const logVal = logs[dateStr]?.[`${med.id}_${slot}`];
          if (logVal === 'taken') dayTaken++;
          else if (logVal === 'skipped') daySkipped++;
        });
      });

      if (i === 0) {
        // Today: streak stays active if we have taken at least one dose and skipped none,
        // or if we have taken everything so far.
        if (daySkipped > 0) {
          break; // broke streak today
        }
        if (dayTaken > 0) {
          streak++;
        }
      } else {
        // Past days: must complete all scheduled doses to maintain streak
        if (dayTaken === dayScheduled && dayScheduled > 0) {
          streak++;
        } else {
          break; // broke streak on this past day
        }
      }
    }
    return streak;
  }, [allMedications, logs]);

  // Compute Weekly Compliance Chart Data
  const chartData = useMemo(() => {
    return dateList.map(item => {
      const dateStr = item.dateStr;
      const medsForDay = allMedications.filter(med => {
        if (med.startDate) {
          const start = new Date(med.startDate);
          start.setHours(0,0,0,0);
          const sel = new Date(dateStr);
          sel.setHours(0,0,0,0);
          if (sel < start) return false;
        }
        if (med.endDate && med.endDate !== 'N/A' && med.endDate !== 'None' && med.endDate !== '') {
          const end = new Date(med.endDate);
          end.setHours(23,59,59,999);
          const sel = new Date(dateStr);
          sel.setHours(0,0,0,0);
          if (sel > end) return false;
        }
        return true;
      });

      let dayScheduled = 0;
      let dayTaken = 0;

      medsForDay.forEach(med => {
        const slots = med.slots || ['morning'];
        dayScheduled += slots.length;
        slots.forEach(slot => {
          const logVal = logs[dateStr]?.[`${med.id}_${slot}`];
          if (logVal === 'taken') dayTaken++;
        });
      });

      const rate = dayScheduled > 0 ? Math.round((dayTaken / dayScheduled) * 100) : 100;

      return {
        name: item.label,
        Adherence: rate,
      };
    });
  }, [dateList, allMedications, logs]);

  // Add Custom Reminder handler
  const handleAddCustomReminder = (e) => {
    e.preventDefault();
    if (!newMed.medication || !newMed.dosage) {
      alert("Please fill in the medication name and dosage.");
      return;
    }

    const slotsArray = Object.keys(newMed.slots).filter(key => newMed.slots[key]);
    if (slotsArray.length === 0) {
      alert("Please select at least one time of day for the dose.");
      return;
    }

    const reminder = {
      id: `custom-${Date.now()}`,
      medication: newMed.medication,
      dosage: newMed.dosage,
      instructions: newMed.instructions || 'Take as directed.',
      slots: slotsArray,
      startDate: newMed.startDate,
      endDate: newMed.endDate || '',
      isCustom: true
    };

    setCustomMeds(prev => [...prev, reminder]);
    setIsAddModalOpen(false);
    setNewMed({
      medication: '',
      dosage: '',
      instructions: '',
      slots: { morning: true, afternoon: false, evening: false, bedtime: false },
      startDate: '',
      endDate: ''
    });

    triggerToast("Custom medication reminder added!");
  };

  // Delete Custom Reminder
  const handleDeleteCustomReminder = (id) => {
    if (confirm("Are you sure you want to remove this medication reminder?")) {
      setCustomMeds(prev => prev.filter(m => m.id !== id));
      triggerToast("Reminder removed.");
    }
  };

  // Request Doctor Refill
  const handleRequestRefill = (medicationName) => {
    triggerToast(`Refill request for ${medicationName} submitted to your primary physician.`);
  };

  if (loading) return <div className="p-8 text-center font-bold text-slate-500">Loading prescriptions...</div>;

  return (
    <div className="space-y-8 pb-12">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Medication Tracker & Prescriptions</h1>
          <p className="text-slate-500 text-sm">Log your daily doses, track streaks, and view doctor prescriptions.</p>
        </div>
        
        {/* Tab Selection */}
        <div className="flex bg-[var(--bg-secondary)] border border-[var(--border-primary)] rounded-full p-1 self-start shadow-sm hover:shadow-md transition-shadow fade-in hover:shadow-md transition-all duration-300">
          <button 
            onClick={() => setActiveTab('tracker')}
            className={`px-5 py-2 rounded-full text-xs font-bold transition-all flex items-center gap-2 ${
              activeTab === 'tracker' 
                ? 'bg-[var(--color-primary)] text-white' 
                : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            <Activity size={14} /> Daily Tracker
          </button>
          <button 
            onClick={() => setActiveTab('prescriptions')}
            className={`px-5 py-2 rounded-full text-xs font-bold transition-all flex items-center gap-2 ${
              activeTab === 'prescriptions' 
                ? 'bg-[var(--color-primary)] text-white' 
                : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            <Pill size={14} /> Doctor Prescriptions
          </button>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {activeTab === 'tracker' ? (
          <motion.div 
            key="tracker"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            className="grid grid-cols-1 lg:grid-cols-3 gap-8"
          >
            {/* Left/Middle: Daily Checklist */}
            <div className="lg:col-span-2 space-y-6">
              
              {/* Horizontal Date Picker Slider */}
              <div className="bg-[var(--bg-secondary)] p-4 rounded-[24px] border border-[var(--border-primary)] shadow-sm hover:shadow-md transition-shadow fade-in hover:shadow-md transition-all duration-300">
                <div className="flex items-center justify-between mb-4 px-2">
                  <div className="flex items-center gap-2">
                    <CalendarDays className="text-[var(--color-primary)]" size={18} />
                    <span className="font-bold text-slate-900">
                      {new Date(selectedDateStr).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                    </span>
                  </div>
                  <div className="flex gap-2">
                    <button 
                      onClick={() => {
                        const d = new Date(selectedDateStr);
                        d.setDate(d.getDate() - 1);
                        setSelectedDateStr(getLocalDateString(d));
                      }}
                      className="p-1.5 rounded-lg border border-[var(--border-primary)] text-slate-500 hover:bg-[#f8fafc] transition-all"
                    >
                      <ChevronLeft size={16} />
                    </button>
                    <button 
                      onClick={() => {
                        const d = new Date(selectedDateStr);
                        d.setDate(d.getDate() + 1);
                        setSelectedDateStr(getLocalDateString(d));
                      }}
                      className="p-1.5 rounded-lg border border-[var(--border-primary)] text-slate-500 hover:bg-[#f8fafc] transition-all"
                    >
                      <ChevronRight size={16} />
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-7 gap-2">
                  {dateList.map((item) => {
                    const isSelected = selectedDateStr === item.dateStr;
                    return (
                      <button
                        key={item.dateStr}
                        onClick={() => setSelectedDateStr(item.dateStr)}
                        className={`flex flex-col items-center justify-center p-3 rounded-2xl border transition-all ${
                          isSelected 
                            ? 'bg-[var(--color-primary)] border-[var(--color-primary)] text-white shadow-lg shadow-teal-500/20' 
                            : 'bg-[#f8fafc] border-[var(--border-primary)] text-slate-500 hover:border-[var(--color-primary)]/40 hover:text-slate-900'
                        }`}
                      >
                        <span className="text-[10px] font-bold uppercase tracking-widest opacity-80">{item.label}</span>
                        <span className="text-lg font-black mt-1">{item.dayNum}</span>
                        {item.isToday && !isSelected && (
                          <span className="w-1.5 h-1.5 bg-[var(--color-primary)] rounded-full mt-1"></span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Timeline Time Slots */}
              <div className="space-y-6">
                {TIME_PERIODS.map(period => {
                  // Find meds scheduled for this period on this selected date
                  const periodMeds = activeMedsForDate.filter(m => m.slots && m.slots.includes(period.id));

                  return (
                    <div key={period.id} className="relative pl-8 border-l-2 border-dashed border-[var(--border-primary)] last:border-l-0 pb-2">
                      {/* Timeline Dot Indicator */}
                      <div className="absolute -left-[17px] top-0 w-8 h-8 rounded-full bg-[var(--bg-secondary)] border-2 border-[var(--border-primary)] flex items-center justify-center text-sm shadow-sm hover:shadow-md transition-shadow fade-in hover:shadow-md transition-all duration-300">
                        {period.icon}
                      </div>

                      {/* Header of Time Period */}
                      <div className="flex items-center justify-between mb-4">
                        <div>
                          <h3 className="font-extrabold text-slate-900 text-base flex items-center gap-2">
                            {period.label} 
                            <span className="text-xs font-normal text-slate-500">({period.time})</span>
                          </h3>
                        </div>
                        <span className="text-xs font-bold text-slate-500 bg-[var(--bg-secondary)] px-2.5 py-1 rounded-full border border-[var(--border-primary)]">
                          {periodMeds.length} {periodMeds.length === 1 ? 'dose' : 'doses'}
                        </span>
                      </div>

                      {/* List of Medications */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {periodMeds.length > 0 ? periodMeds.map((med) => {
                          const logKey = `${med.id}_${period.id}`;
                          const logStatus = logs[selectedDateStr]?.[logKey];

                          const isTaken = logStatus === 'taken';
                          const isSkipped = logStatus === 'skipped';

                          return (
                            <motion.div
                              key={med.id}
                              layout
                              className={`p-4 rounded-[1.8rem] border transition-all ${
                                isTaken 
                                  ? 'bg-emerald-500/5  border-emerald-500/40  shadow-sm hover:shadow-md transition-shadow fade-in hover:shadow-md transition-all duration-300'
                                  : isSkipped
                                    ? 'bg-white/50  border-slate-300  opacity-60'
                                    : 'bg-[var(--bg-secondary)] border-[var(--border-primary)] shadow-sm hover:shadow-md transition-shadow fade-in hover:shadow-md transition-all duration-300 hover:shadow-md'
                              }`}
                            >
                              <div className="flex items-start justify-between gap-2">
                                <div className="flex items-start gap-3">
                                  <div className={`p-2 rounded-xl shrink-0 ${
                                    isTaken 
                                      ? 'bg-emerald-100  text-emerald-500' 
                                      : 'bg-[#f8fafc] text-[var(--color-primary)]'
                                  }`}>
                                    <Pill size={18} />
                                  </div>
                                  <div>
                                    <h4 className={`font-bold text-sm text-slate-900 ${isSkipped ? 'line-through' : ''}`}>
                                      {med.medication}
                                    </h4>
                                    <p className="text-xs font-semibold text-[var(--color-primary)]">{med.dosage}</p>
                                  </div>
                                </div>

                                {med.isCustom && (
                                  <button 
                                    onClick={() => handleDeleteCustomReminder(med.id)}
                                    className="p-1 text-slate-400 hover:text-rose-500 transition-colors"
                                    title="Delete custom reminder"
                                  >
                                    <Trash2 size={14} />
                                  </button>
                                )}
                              </div>

                              <p className="text-xs text-slate-500 mt-3 leading-relaxed bg-[#f8fafc] p-2.5 rounded-xl border border-[var(--border-primary)]">
                                {med.instructions}
                              </p>

                              {/* Action Buttons */}
                              <div className="flex items-center gap-2 mt-4 pt-3 border-t border-[var(--border-primary)]/40">
                                <button
                                  onClick={() => toggleLog(med.id, period.id, 'taken')}
                                  className={`flex-grow py-1.5 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
                                    isTaken 
                                      ? 'bg-emerald-500 text-white' 
                                      : 'bg-[#f8fafc] text-slate-500 border border-[var(--border-primary)] hover:border-emerald-500 hover:text-emerald-500'
                                  }`}
                                >
                                  <Check size={14} /> Taken
                                </button>
                                <button
                                  onClick={() => toggleLog(med.id, period.id, 'skipped')}
                                  className={`py-1.5 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
                                    isSkipped 
                                      ? 'bg-rose-500 text-white' 
                                      : 'bg-[#f8fafc] text-slate-500 border border-[var(--border-primary)] hover:border-rose-500 hover:text-rose-500'
                                  }`}
                                >
                                  <X size={14} /> Skip
                                </button>
                              </div>
                            </motion.div>
                          );
                        }) : (
                          <div className="col-span-full py-4 px-6 border border-dashed border-[var(--border-primary)] bg-[var(--bg-secondary)]/50 rounded-2xl text-center">
                            <p className="text-xs text-slate-500 font-medium">No medications scheduled for this period.</p>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

            </div>

            {/* Right: Adherence and Custom Reminders */}
            <div className="space-y-6">
              
              {/* Adherence Card */}
              <div className="bg-[var(--bg-secondary)] p-6 rounded-[24px] border border-[var(--border-primary)] shadow-sm hover:shadow-md transition-shadow fade-in hover:shadow-md transition-all duration-300 text-center flex flex-col items-center">
                <h3 className="font-extrabold text-sm text-slate-500 uppercase tracking-wider mb-4">Today's Adherence</h3>
                
                {/* SVG Progress Ring */}
                <div className="relative w-32 h-32 flex items-center justify-center mb-4">
                  <svg className="w-full h-full transform -rotate-90">
                    <circle 
                      cx="64" 
                      cy="64" 
                      r="50" 
                      className="stroke-[var(--border-primary)]" 
                      strokeWidth="8" 
                      fill="transparent" 
                    />
                    <motion.circle 
                      cx="64" 
                      cy="64" 
                      r="50" 
                      className="stroke-[var(--color-primary)]" 
                      strokeWidth="8" 
                      fill="transparent" 
                      strokeDasharray={2 * Math.PI * 50}
                      initial={{ strokeDashoffset: 2 * Math.PI * 50 }}
                      animate={{ strokeDashoffset: 2 * Math.PI * 50 - (2 * Math.PI * 50 * todayStats.rate) / 100 }}
                      transition={{ duration: 0.8 }}
                    />
                  </svg>
                  <div className="absolute text-center">
                    <span className="text-3xl font-black text-slate-900">{todayStats.rate}%</span>
                    <span className="block text-[9px] font-bold text-slate-500 uppercase tracking-widest mt-0.5">COMPLETED</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 w-full border-t border-[var(--border-primary)] pt-4 mt-2">
                  <div>
                    <span className="text-xs text-slate-500 font-medium">Doses Taken</span>
                    <span className="block font-black text-lg text-emerald-500 mt-1">{todayStats.taken} / {todayStats.scheduled}</span>
                  </div>
                  <div>
                    <span className="text-xs text-slate-500 font-medium">Doses Skipped</span>
                    <span className="block font-black text-lg text-rose-500 mt-1">{todayStats.skipped}</span>
                  </div>
                </div>

                {/* Streak Counter */}
                <div className="mt-5 w-full bg-orange-500/10 border border-orange-500/20 text-orange-600  p-4 rounded-2xl flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Flame className="animate-pulse" size={20} />
                    <div className="text-left">
                      <span className="block text-xs font-bold uppercase tracking-wider leading-none">Streak</span>
                      <span className="text-sm font-semibold text-slate-500 leading-none mt-0.5">Consecutive Days</span>
                    </div>
                  </div>
                  <span className="text-2xl font-black">{currentStreak} {currentStreak === 1 ? 'Day' : 'Days'}</span>
                </div>
              </div>

              {/* Compliance Report Chart */}
              <div className="bg-[var(--bg-secondary)] p-6 rounded-[24px] border border-[var(--border-primary)] shadow-sm hover:shadow-md transition-shadow fade-in hover:shadow-md transition-all duration-300">
                <div className="flex items-center gap-2 mb-4">
                  <BarChart3 className="text-[var(--color-primary)]" size={18} />
                  <h3 className="font-extrabold text-sm text-slate-900">Weekly Performance</h3>
                </div>

                {/* Chart Container */}
                <div className="h-[200px] w-full mt-2">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData} margin={{ top: 10, right: 0, left: -25, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border-primary)" />
                      <XAxis dataKey="name" fontSize={11} tickLine={false} axisLine={false} stroke="#64748b" />
                      <YAxis fontSize={11} tickLine={false} axisLine={false} stroke="#64748b" domain={[0, 100]} />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: 'var(--bg-secondary)', 
                          borderColor: 'var(--border-primary)',
                          borderRadius: '1rem',
                          color: '#0f172a'
                        }}
                      />
                      <Bar dataKey="Adherence" fill="var(--color-primary)" radius={[4, 4, 0, 0]} barSize={16} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Action Banner */}
              <div className="bg-gradient-to-tr from-[var(--color-primary)] to-teal-600 p-6 rounded-[2.2rem] text-white shadow-lg shadow-teal-500/10 relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full blur-3xl group-hover:scale-150 transition-all duration-700"></div>
                <div className="flex items-center gap-3 mb-3">
                  <Sparkles size={20} className="text-teal-200" />
                  <h4 className="font-black text-sm uppercase tracking-wider">Custom Reminders</h4>
                </div>
                <p className="text-xs text-teal-100 mb-5 leading-relaxed">
                  Need to log supplements, over-the-counter drugs, or vitamins? Create customized pill reminders.
                </p>
                <button 
                  onClick={() => setIsAddModalOpen(true)}
                  className="w-full py-3 bg-white text-[var(--color-primary)]  rounded-xl text-xs font-bold hover:bg-teal-50 transition-all flex items-center justify-center gap-1.5 shadow-md active:scale-[0.98]"
                >
                  <Plus size={16} /> Add Reminder
                </button>
              </div>

            </div>
          </motion.div>
        ) : (
          <motion.div 
            key="prescriptions"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            className="grid grid-cols-1 lg:grid-cols-3 gap-8"
          >
            {/* Active Doctor Prescriptions */}
            <div className="lg:col-span-2 space-y-6">
              <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                Active Medical Orders 
                <span className="bg-blue-100  text-[#2563EB]  text-[10px] px-2 py-0.5 rounded-full font-black">
                  {activePrescriptions.length}
                </span>
              </h2>

              <div className="grid grid-cols-1 gap-4">
                {activePrescriptions.length > 0 ? activePrescriptions.map((presc, i) => (
                  <motion.div
                    key={presc.id}
                    initial={{ opacity: 0, x: -15 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="bg-[var(--bg-secondary)] p-6 rounded-[24px] shadow-sm hover:shadow-md transition-shadow fade-in hover:shadow-md transition-all duration-300 border border-[var(--border-primary)] hover:shadow-md transition-all relative overflow-hidden group"
                  >
                    <div className="absolute top-0 right-0 w-32 h-32 bg-[var(--color-primary)]/5 blur-3xl rounded-full"></div>
                    <div className="flex flex-col md:flex-row gap-6 relative z-10">
                      <div className="w-14 h-14 bg-[#f8fafc] text-[var(--color-primary)] border border-[var(--border-primary)] rounded-2xl flex items-center justify-center shrink-0">
                        <Pill size={28} />
                      </div>
                      <div className="flex-grow">
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="text-lg font-black text-slate-900">{presc.medication}</h3>
                          <button 
                            onClick={() => triggerToast(`Downloading PDF prescription card for ${presc.medication}...`)}
                            className="p-2 text-slate-500 hover:text-[var(--color-primary)] hover:bg-[#f8fafc] rounded-xl transition-all border border-transparent hover:border-[var(--border-primary)]"
                          >
                            <Download size={18} />
                          </button>
                        </div>
                        <p className="text-xs font-bold text-[var(--color-primary)] mb-4">{presc.dosage} • {presc.frequency}</p>
                        
                        <div className="bg-[#f8fafc] p-4 rounded-2xl mb-4 border border-[var(--border-primary)]">
                          <div className="flex items-start gap-2">
                            <Info size={16} className="text-slate-500 mt-0.5" />
                            <p className="text-xs text-slate-500 font-medium leading-relaxed">
                              {presc.instructions || 'Follow the dosage and schedule details exactly as prescribed.'}
                            </p>
                          </div>
                        </div>

                        <div className="flex flex-wrap items-center gap-6 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                          <div className="flex items-center gap-1.5">
                            <Calendar size={13} className="text-[var(--color-primary)]" /> 
                            <span>Start: {presc.startDate || new Date(presc.date).toLocaleDateString()}</span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <Clock size={13} className="text-[var(--color-primary)]" /> 
                            <span>End: {presc.endDate || 'N/A'}</span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <AlertCircle size={13} className="text-[var(--color-primary)]" /> 
                            <span>{presc.refills || 0} Refills Left</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )) : (
                  <div className="p-12 text-center bg-[var(--bg-secondary)] rounded-[24px] border border-dashed border-[var(--border-primary)]">
                    <p className="text-slate-500 font-medium">No official doctor prescriptions currently active.</p>
                  </div>
                )}
              </div>
            </div>

            {/* Doctor History & Refill Requests */}
            <div className="space-y-6">
              <h2 className="text-lg font-bold text-slate-900">Prescription History</h2>
              
              <div className="bg-[var(--bg-secondary)] p-6 rounded-[24px] border border-[var(--border-primary)] shadow-sm hover:shadow-md transition-shadow fade-in hover:shadow-md transition-all duration-300">
                <div className="space-y-5">
                  {pastPrescriptions.length > 0 ? pastPrescriptions.map((presc) => (
                    <div key={presc.id} className="flex items-center gap-4 border-b border-[var(--border-primary)]/50 pb-3 last:border-b-0 last:pb-0">
                      <div className="w-10 h-10 bg-[#f8fafc] text-slate-500 border border-[var(--border-primary)] rounded-xl flex items-center justify-center shrink-0">
                        <Pill size={18} />
                      </div>
                      <div className="flex-grow">
                        <h4 className="text-sm font-bold text-slate-900">{presc.medication}</h4>
                        <p className="text-[9px] text-slate-500 font-semibold uppercase tracking-widest">{new Date(presc.date).toLocaleDateString()}</p>
                      </div>
                      <button 
                        onClick={() => triggerToast(`Viewing details of expired prescription for ${presc.medication}...`)}
                        className="p-1.5 text-slate-500 hover:text-[var(--color-primary)] transition-colors"
                      >
                        <ExternalLink size={15} />
                      </button>
                    </div>
                  )) : (
                    <p className="text-center text-slate-500 text-xs font-medium">No medical order history recorded.</p>
                  )}
                </div>
                
                <button 
                  onClick={() => triggerToast("Full archive of historical prescriptions downloaded.")}
                  className="w-full mt-6 py-3 border border-dashed border-[var(--border-primary)] rounded-xl text-xs font-bold text-slate-500 hover:border-[var(--color-primary)] hover:text-[var(--color-primary)] transition-all active:scale-[0.98]"
                >
                  Download Complete History
                </button>
              </div>

              {/* Refill Card */}
              <div className="bg-[var(--bg-secondary)] p-6 rounded-[24px] border border-[var(--border-primary)] shadow-sm hover:shadow-md transition-shadow fade-in hover:shadow-md transition-all duration-300 relative overflow-hidden">
                <h3 className="font-extrabold text-sm text-slate-900 mb-2">Need a medication refill?</h3>
                <p className="text-xs text-slate-500 mb-5 leading-relaxed">
                  Submit a direct request for active prescriptions needing refills. Your doctor will review and update your file.
                </p>
                <div className="space-y-2">
                  {activePrescriptions.map(presc => (
                    <button 
                      key={presc.id}
                      onClick={() => handleRequestRefill(presc.medication)}
                      className="w-full py-2 px-3 border border-[var(--border-primary)] hover:bg-[#f8fafc] hover:border-[var(--color-primary)]/50 rounded-xl text-xs text-left font-bold text-slate-900 transition-all flex items-center justify-between"
                    >
                      <span>{presc.medication}</span>
                      <span className="text-[10px] text-[var(--color-primary)] uppercase tracking-wider">Request Refill &rarr;</span>
                    </button>
                  ))}
                  {activePrescriptions.length === 0 && (
                    <p className="text-xs text-slate-500 italic">No active prescriptions available to refill.</p>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Add Custom Reminder Modal */}
      <AnimatePresence>
        {isAddModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsAddModalOpen(false)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            />

            {/* Content Card */}
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="bg-[var(--bg-secondary)] border border-[var(--border-primary)] rounded-[24px] w-full max-w-lg p-6 relative z-10 shadow-2xl overflow-hidden"
            >
              <div className="flex items-center justify-between mb-4 pb-3 border-b border-[var(--border-primary)]">
                <div className="flex items-center gap-2">
                  <Pill className="text-[var(--color-primary)]" size={20} />
                  <h3 className="font-extrabold text-lg text-slate-900">Add Custom Reminder</h3>
                </div>
                <button 
                  onClick={() => setIsAddModalOpen(false)}
                  className="p-1 text-slate-400 hover:text-slate-900 rounded-lg"
                >
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleAddCustomReminder} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Medication Name</label>
                  <input 
                    type="text" 
                    placeholder="e.g. Vitamin C, Ibuprofen" 
                    value={newMed.medication}
                    onChange={(e) => setNewMed(prev => ({ ...prev, medication: e.target.value }))}
                    className="w-full bg-[#f8fafc] border border-[var(--border-primary)] rounded-xl py-2.5 px-3 text-xs font-medium text-slate-900 outline-none focus:border-[var(--color-primary)] transition-all"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Dosage</label>
                    <input 
                      type="text" 
                      placeholder="e.g. 1 pill, 500mg, 10ml" 
                      value={newMed.dosage}
                      onChange={(e) => setNewMed(prev => ({ ...prev, dosage: e.target.value }))}
                      className="w-full bg-[#f8fafc] border border-[var(--border-primary)] rounded-xl py-2.5 px-3 text-xs font-medium text-slate-900 outline-none focus:border-[var(--color-primary)] transition-all"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Start Date</label>
                    <input 
                      type="date" 
                      value={newMed.startDate}
                      onChange={(e) => setNewMed(prev => ({ ...prev, startDate: e.target.value }))}
                      className="w-full bg-[#f8fafc] border border-[var(--border-primary)] rounded-xl py-2.5 px-3 text-xs font-medium text-slate-900 outline-none focus:border-[var(--color-primary)] transition-all"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Instructions / Notes</label>
                  <input 
                    type="text" 
                    placeholder="e.g. Take with water before breakfast" 
                    value={newMed.instructions}
                    onChange={(e) => setNewMed(prev => ({ ...prev, instructions: e.target.value }))}
                    className="w-full bg-[#f8fafc] border border-[var(--border-primary)] rounded-xl py-2.5 px-3 text-xs font-medium text-slate-900 outline-none focus:border-[var(--color-primary)] transition-all"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Schedule Time slots</label>
                  <div className="grid grid-cols-2 gap-2">
                    {TIME_PERIODS.map(period => (
                      <label 
                        key={period.id}
                        className={`flex items-center gap-2.5 p-3 rounded-xl border cursor-pointer select-none transition-all ${
                          newMed.slots[period.id]
                            ? 'bg-[var(--color-primary)]/10 border-[var(--color-primary)] text-slate-900 font-bold'
                            : 'bg-[#f8fafc] border-[var(--border-primary)] text-slate-500'
                        }`}
                      >
                        <input 
                          type="checkbox"
                          checked={newMed.slots[period.id]}
                          onChange={(e) => setNewMed(prev => ({
                            ...prev,
                            slots: { ...prev.slots, [period.id]: e.target.checked }
                          }))}
                          className="sr-only"
                        />
                        <span className="text-lg">{period.icon}</span>
                        <div className="text-left leading-none">
                          <span className="block text-xs font-black">{period.label}</span>
                          <span className="text-[10px] opacity-70 mt-0.5 block">{period.time}</span>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="flex gap-3 mt-6 pt-4 border-t border-[var(--border-primary)]">
                  <button 
                    type="button"
                    onClick={() => setIsAddModalOpen(false)}
                    className="w-1/2 py-2.5 rounded-xl border border-[var(--border-primary)] text-xs font-bold text-slate-500 hover:bg-[#f8fafc] transition-all"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit"
                    className="w-1/2 py-2.5 rounded-xl bg-[var(--color-primary)] hover:bg-teal-700 text-white text-xs font-bold transition-all shadow-md"
                  >
                    Add Reminder
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Floating Animated Toast Feedback */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div 
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            className="fixed bottom-6 right-6 z-50 bg-slate-900/95  text-slate-100  px-5 py-4 rounded-2xl shadow-2xl flex items-center gap-3 border border-slate-800  font-semibold text-xs transition-colors"
          >
            <Bell className="animate-bounce text-teal-400 " size={16} />
            <span>{toastMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Prescriptions;
