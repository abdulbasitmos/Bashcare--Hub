import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Calendar as CalendarIcon, 
  Clock, 
  Search, 
  Filter, 
  MoreVertical, 
  XCircle, 
  CheckCircle2, 
  AlertCircle, 
  MessageSquare,
  ChevronLeft,
  ChevronRight,
  List,
  PlusCircle,
  Video,
  DollarSign
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { db } from '../../../utils/db';

const Appointments = ({ user }) => {
  const navigate = useNavigate();
  const [filter, setFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

  // Advanced Calendar States
  const [viewMode, setViewMode] = useState('calendar'); // 'calendar' | 'list'
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [quickRescheduleApp, setQuickRescheduleApp] = useState(null);
  const [newTime, setNewTime] = useState('09:00');
  const [newDateVal, setNewDateVal] = useState('');

  useEffect(() => {
    let active = true;
    const verifyAndFetch = async () => {
      const params = new URLSearchParams(window.location.search);
      const isSuccess = params.get('payment_success') === 'true';
      const sessionId = params.get('session_id');
      const appointmentId = params.get('appointment_id');

      if (isSuccess && sessionId && appointmentId) {
        try {
          await db.verifyPaymentSession(sessionId, appointmentId);
          await db.addNotification({
            userId: user.id,
            title: 'Payment Confirmed',
            message: 'Your payment was processed and verified successfully.',
            type: 'appointment'
          });
          navigate('/dashboard/patient/appointments', { replace: true });
        } catch (e) {
          console.error("Verification failed:", e);
        }
      }

      try {
        const patientAppointments = await db.getPatientAppointments(user.id);
        if (active) {
          setAppointments(patientAppointments);
          setLoading(false);
        }
      } catch (err) {
        console.error("Error fetching appointments:", err);
        if (active) setLoading(false);
      }
    };
    verifyAndFetch();
    return () => {
      active = false;
    };
  }, [user.id, navigate]);

  const filteredAppointments = appointments.filter(app => {
    const statusMap = {
      'upcoming': ['pending', 'confirmed', 'rescheduled'],
      'completed': ['completed'],
      'cancelled': ['cancelled', 'rejected']
    };
    
    const matchesFilter = filter === 'all' || (statusMap[filter] && statusMap[filter].includes(app.status));
    const matchesSearch = (app.doctorName || '').toLowerCase().includes(searchQuery.toLowerCase()) || 
                          (app.specialty || '').toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'bg-amber-50 text-amber-600 border border-amber-200';
      case 'confirmed': return 'bg-blue-50/50 text-[#2563EB] border border-blue-200';
      case 'completed': return 'bg-green-50 text-green-600 border border-green-200';
      case 'cancelled': return 'bg-red-50 text-red-600 border border-red-200';
      case 'rejected': return 'bg-red-50 text-red-600 border border-red-200';
      case 'rescheduled': return 'bg-indigo-50 text-indigo-600 border border-indigo-200';
      default: return 'bg-white text-gray-600 border border-gray-200';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending': return <Clock size={14} />;
      case 'confirmed': return <CheckCircle2 size={14} />;
      case 'completed': return <CheckCircle2 size={14} />;
      case 'cancelled': return <XCircle size={14} />;
      case 'rejected': return <XCircle size={14} />;
      case 'rescheduled': return <Clock size={14} />;
      default: return <AlertCircle size={14} />;
    }
  };

  const handleCancel = async (id) => {
    if (window.confirm('Are you sure you want to cancel this appointment?')) {
      try {
        await db.updateAppointment(id, { status: 'cancelled' });
        await db.addNotification({
          userId: user.id,
          title: 'Appointment Cancelled',
          message: 'You have cancelled your appointment request.',
          type: 'appointment'
        });
        const patientAppointments = await db.getPatientAppointments(user.id);
        setAppointments(patientAppointments);
      } catch (err) {
        console.error("Error cancelling appointment:", err);
      }
    }
  };

  const handleConfirmPayment = async (id) => {
    try {
      const session = await db.createCheckoutSession(id);
      if (session && session.url) {
        window.location.assign(session.url);
      } else {
        alert("Unable to create Stripe checkout session. Please try again.");
      }
    } catch (err) {
      console.error("Error creating checkout session:", err);
      alert("Payment failed: " + err.message);
    }
  };

  const handleAcceptReschedule = async (id, newDate, newTime) => {
    try {
      await db.updateAppointment(id, {
        date: newDate,
        time: newTime,
        status: 'confirmed',
        rescheduledDate: null,
        rescheduledTime: null,
        rescheduleReason: null,
        rescheduledBy: null
      });
      await db.addNotification({
        userId: user.id,
        title: '🗓️ Reschedule Accepted',
        message: `You accepted the doctor's reschedule proposal. Consultation is now scheduled for ${new Date(newDate).toLocaleDateString()} at ${newTime}.`,
        type: 'appointment'
      });
      const app = appointments.find(a => a.id === id);
      if (app) {
        await db.addNotification({
          userId: app.doctorId,
          title: '✅ Reschedule Proposal Accepted',
          message: `${user.name} accepted your reschedule proposal for ${new Date(newDate).toLocaleDateString()} at ${newTime}.`,
          type: 'appointment'
        });
      }
      const patientAppointments = await db.getPatientAppointments(user.id);
      setAppointments(patientAppointments);
    } catch (err) {
      console.error("Error accepting reschedule:", err);
    }
  };

  const handleCancelReschedule = async (id) => {
    try {
      await db.updateAppointment(id, {
        status: 'cancelled',
        rescheduledDate: null,
        rescheduledTime: null,
        rescheduleReason: null,
        rescheduledBy: null
      });
      await db.addNotification({
        userId: user.id,
        title: '❌ Reschedule Declined',
        message: 'You declined the doctor\'s reschedule proposal. The appointment is cancelled.',
        type: 'appointment'
      });
      const app = appointments.find(a => a.id === id);
      if (app) {
        await db.addNotification({
          userId: app.doctorId,
          title: '❌ Reschedule Proposal Declined',
          message: `${user.name} declined your reschedule proposal. The appointment has been cancelled.`,
          type: 'appointment'
        });
      }
      const patientAppointments = await db.getPatientAppointments(user.id);
      setAppointments(patientAppointments);
    } catch (err) {
      console.error("Error cancelling reschedule:", err);
    }
  };

  const handleRescheduleSubmit = async (e) => {
    e.preventDefault();
    if (!newDateVal || !quickRescheduleApp) return;

    try {
      await db.updateAppointment(quickRescheduleApp.id, {
        date: newDateVal,
        time: newTime,
        status: 'pending' // reset to pending for confirmation
      });
      await db.addNotification({
        userId: user.id,
        title: 'Appointment Rescheduled',
        message: `Requested rescheduling to ${newDateVal} at ${newTime}.`,
        type: 'appointment'
      });
      setQuickRescheduleApp(null);
      const patientAppointments = await db.getPatientAppointments(user.id);
      setAppointments(patientAppointments);
    } catch (err) {
      console.error("Reschedule error:", err);
    }
  };

  const handleChat = (doctor) => {
    navigate('/dashboard/patient/messages', { state: { doctor: { id: doctor.doctorId, name: doctor.doctorName } } });
  };

  // Calendar Utility Functions
  const changeMonth = (direction) => {
    const nextDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + direction, 1);
    setCurrentDate(nextDate);
  };

  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    
    const days = [];
    for (let i = 0; i < firstDay; i++) {
      days.push(null);
    }
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(new Date(year, month, i));
    }
    return days;
  };

  const getAppointmentsForDay = (date) => {
    if (!date) return [];
    return appointments.filter(app => {
      const appDate = new Date(app.date);
      return appDate.getDate() === date.getDate() &&
             appDate.getMonth() === date.getMonth() &&
             appDate.getFullYear() === date.getFullYear();
    });
  };

  const days = getDaysInMonth(currentDate);
  const selectedDayAppointments = getAppointmentsForDay(selectedDate);

  if (loading) return <div className="p-8 text-center font-bold text-slate-500">Loading appointments...</div>;

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">My Consultations</h1>
          <p className="text-slate-500 text-sm">Schedule, modify, and track your clinical bookings.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
            <input 
              type="text" 
              placeholder="Search doctors..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-4 py-2.5 bg-white border border-[var(--border-primary)] rounded-xl text-xs focus:ring-2 focus:ring-blue-500 outline-none w-48 font-medium"
            />
          </div>
          {/* Calendar / List View Toggle */}
          <div className="bg-white p-1.5 rounded-xl flex items-center gap-1">
            <button 
              onClick={() => setViewMode('calendar')}
              className={`p-2 rounded-lg transition-all ${viewMode === 'calendar' ? 'bg-white text-[#2563EB] shadow-sm hover:shadow-md transition-shadow fade-in hover:shadow-md transition-all duration-300' : 'text-gray-400'}`}
              title="Calendar View"
            >
              <CalendarIcon size={16} />
            </button>
            <button 
              onClick={() => setViewMode('list')}
              className={`p-2 rounded-lg transition-all ${viewMode === 'list' ? 'bg-white text-[#2563EB] shadow-sm hover:shadow-md transition-shadow fade-in hover:shadow-md transition-all duration-300' : 'text-gray-400'}`}
              title="List View"
            >
              <List size={16} />
            </button>
          </div>
          <button 
            onClick={() => navigate('/dashboard/patient/book-appointment')}
            className="flex items-center gap-1.5 px-4 py-2.5 bg-[#2563EB] hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-lg shadow-blue-600/15"
          >
            <PlusCircle size={16} /> Book New
          </button>
        </div>
      </div>

      {/* View Mode: Calendar */}
      {viewMode === 'calendar' ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Grid Calendar */}
          <div className="lg:col-span-2 bg-white rounded-[24px] border border-[var(--border-primary)] p-6 shadow-sm hover:shadow-md transition-shadow fade-in hover:shadow-md transition-all duration-300">
            {/* Calendar Controller */}
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-base font-bold text-slate-900">
                {currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
              </h2>
              <div className="flex items-center gap-2">
                <button onClick={() => changeMonth(-1)} className="p-1.5 rounded-lg border border-[var(--border-primary)] text-gray-500 hover:bg-white">
                  <ChevronLeft size={16} />
                </button>
                <button onClick={() => setCurrentDate(new Date())} className="px-3 py-1 text-xs font-bold rounded-lg border border-[var(--border-primary)] text-gray-500 hover:bg-white">
                  Today
                </button>
                <button onClick={() => changeMonth(1)} className="p-1.5 rounded-lg border border-[var(--border-primary)] text-gray-500 hover:bg-white">
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>

            {/* Weekdays */}
            <div className="grid grid-cols-7 gap-2 mb-3 text-center">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
                <span key={d} className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{d}</span>
              ))}
            </div>

            {/* Days Grid */}
            <div className="grid grid-cols-7 gap-2">
              {days.map((day, i) => {
                if (!day) return <div key={`empty-${i}`} className="aspect-square bg-white/20 rounded-xl"></div>;
                const isSelected = selectedDate.getDate() === day.getDate() && selectedDate.getMonth() === day.getMonth() && selectedDate.getFullYear() === day.getFullYear();
                const isToday = new Date().getDate() === day.getDate() && new Date().getMonth() === day.getMonth() && new Date().getFullYear() === day.getFullYear();
                const dayApps = getAppointmentsForDay(day);

                return (
                  <button
                    key={day.toISOString()}
                    onClick={() => setSelectedDate(day)}
                    className={`aspect-square rounded-2xl p-2 relative flex flex-col justify-between items-center group transition-all border ${
                      isSelected 
                        ? 'bg-[#2563EB] border-blue-600 text-white shadow-lg shadow-blue-600/15' 
                        : isToday 
                          ? 'bg-blue-50/50/70 border-blue-200 text-blue-700 font-bold' 
                          : 'bg-white border-[var(--border-primary)] hover:border-slate-300'
                    }`}
                  >
                    <span className="text-xs font-bold">{day.getDate()}</span>
                    
                    {/* Status Dots */}
                    {dayApps.length > 0 && (
                      <div className="flex gap-1 mt-auto">
                        {dayApps.slice(0, 3).map((app, idx) => (
                          <span 
                            key={idx} 
                            className={`w-1.5 h-1.5 rounded-full ${
                              app.status === 'confirmed' 
                                ? 'bg-blue-400' 
                                : app.status === 'pending'
                                  ? 'bg-amber-400'
                                  : app.status === 'completed'
                                    ? 'bg-green-400'
                                    : 'bg-red-400'
                            }`}
                          />
                        ))}
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Selected Date Actions & Events */}
          <div className="bg-white rounded-[24px] border border-[var(--border-primary)] p-6 shadow-sm hover:shadow-md transition-shadow fade-in hover:shadow-md transition-all duration-300 flex flex-col min-h-[400px]">
            <div className="border-b border-slate-100 pb-4 mb-4">
              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest">Schedule Details</h3>
              <p className="text-sm font-bold text-slate-900 mt-1">
                {selectedDate.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}
              </p>
            </div>

            <div className="flex-grow space-y-4 overflow-y-auto">
              {selectedDayAppointments.length > 0 ? selectedDayAppointments.map((app) => (
                <div key={app.id} className="p-4 bg-white rounded-2xl border border-slate-100 space-y-3 relative group">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="text-xs font-black text-slate-900">{app.doctorName}</h4>
                      <p className="text-[10px] text-gray-500 mt-0.5">{app.specialty || 'General Practice'} • {app.type}</p>
                    </div>
                    <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[9px] font-bold uppercase ${getStatusColor(app.status)}`}>
                      {app.status}
                    </span>
                  </div>

                  <div className="flex items-center gap-3 text-[10px] text-gray-500 font-semibold">
                    <div className="flex items-center gap-1"><Clock size={12} /> {app.time}</div>
                    {app.amount > 0 && <div className="flex items-center gap-1"><DollarSign size={12} /> {app.amount}</div>}
                  </div>

                  {app.preparationInstructions && (
                    <div className="p-2.5 bg-emerald-50 dark:bg-emerald-950/20 rounded-xl border border-emerald-100 dark:border-emerald-900/50 flex items-start gap-2">
                      <CheckCircle2 size={12} className="text-emerald-600 dark:text-emerald-400 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="text-[9px] font-bold text-emerald-800 dark:text-emerald-300">Prep Instructions</p>
                        <p className="text-[9px] text-emerald-600 dark:text-emerald-400 mt-0.5">{app.preparationInstructions}</p>
                      </div>
                    </div>
                  )}

                  {app.status === 'rescheduled' && app.rescheduledBy === 'doctor' && (
                    <div className="p-3 bg-indigo-50 dark:bg-indigo-950/30 rounded-xl border border-indigo-100 dark:border-indigo-900/50 space-y-2">
                      <div className="flex items-start gap-2">
                        <AlertCircle size={14} className="text-indigo-600 dark:text-indigo-400 mt-0.5 flex-shrink-0" />
                        <div>
                          <p className="text-[9px] font-bold text-indigo-800 dark:text-indigo-300">Doctor Proposed Reschedule</p>
                          <p className="text-[9px] text-indigo-600 dark:text-indigo-400 mt-0.5">
                            New: <strong>{new Date(app.rescheduledDate).toLocaleDateString()} at {app.rescheduledTime}</strong>
                          </p>
                          {app.rescheduleReason && <p className="text-[9px] text-indigo-500 mt-0.5 italic">"{app.rescheduleReason}"</p>}
                        </div>
                      </div>
                      <div className="flex gap-2 justify-end">
                        <button
                          onClick={() => handleCancelReschedule(app.id)}
                          className="px-2 py-1 bg-red-50 hover:bg-red-100 text-red-600 rounded text-[8px] font-bold border border-red-100"
                        >
                          Decline
                        </button>
                        <button
                          onClick={() => handleAcceptReschedule(app.id, app.rescheduledDate, app.rescheduledTime)}
                          className="px-2 py-1 bg-indigo-600 hover:bg-indigo-700 text-white rounded text-[8px] font-bold"
                        >
                          Accept
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Actions overlay/panel inside card */}
                  <div className="flex items-center gap-2 pt-2 border-t border-slate-100">
                    {app.status === 'confirmed' && !app.paymentConfirmed && (
                      <button 
                        onClick={() => handleConfirmPayment(app.id)}
                        className="text-[9px] font-bold bg-green-600 text-white px-2 py-1.5 rounded-lg hover:bg-green-700"
                      >
                        Pay
                      </button>
                    )}
                    {app.status === 'confirmed' && (
                      <button 
                        onClick={() => handleChat(app)}
                        className="text-[9px] font-bold bg-blue-100 text-[#2563EB] px-2 py-1.5 rounded-lg hover:bg-blue-200"
                      >
                        Chat
                      </button>
                    )}
                    {app.status === 'pending' && (
                      <>
                        <button 
                          onClick={() => {
                            setQuickRescheduleApp(app);
                            setNewDateVal(app.date);
                            setNewTime(app.time);
                          }}
                          className="text-[9px] font-bold bg-amber-100 text-amber-700 px-2.5 py-1.5 rounded-lg hover:bg-amber-200"
                        >
                          Reschedule
                        </button>
                        <button 
                          onClick={() => handleCancel(app.id)}
                          className="text-[9px] font-bold text-red-600 bg-red-50 hover:bg-red-100 px-2 py-1.5 rounded-lg"
                        >
                          Cancel
                        </button>
                      </>
                    )}
                  </div>
                </div>
              )) : (
                <div className="h-full flex flex-col items-center justify-center text-center text-gray-400 py-10">
                  <CalendarIcon size={32} className="opacity-20 mb-2" />
                  <p className="text-xs font-bold">No consultations booked</p>
                  <button 
                    onClick={() => navigate('/dashboard/patient/book-appointment')}
                    className="text-[10px] font-black text-[#2563EB] hover:text-blue-700 uppercase tracking-widest mt-3 flex items-center gap-1"
                  >
                    <PlusCircle size={12} /> Book slot on this day
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      ) : (
        /* View Mode: Timeline List */
        <div className="space-y-4">
          {/* Filters */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2">
            {['all', 'upcoming', 'completed', 'cancelled'].map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-4 py-2 rounded-xl text-sm font-bold capitalize transition-all whitespace-nowrap ${
                  filter === f 
                    ? 'bg-[#2563EB] text-white shadow-lg shadow-blue-600/20' 
                    : 'bg-white text-slate-500 border border-[var(--border-primary)] hover:border-slate-300'
                }`}
              >
                {f} Appointments
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 gap-4">
            {filteredAppointments.map((app, i) => (
              <motion.div 
                key={app.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="bg-white p-6 rounded-[24px] dash-card shadow-sm hover:shadow-md transition-shadow border border-[var(--border-primary)] group"
              >
                <div className="flex flex-col md:flex-row items-center gap-6">
                  <div className="w-20 h-20 rounded-2xl bg-blue-100 flex items-center justify-center text-[var(--color-primary)] font-bold text-2xl border-2 border-white">
                    {app.doctorName.split(' ').map(n => n[0]).join('')}
                  </div>
                  
                  <div className="flex-grow text-center md:text-left space-y-1">
                    <div className="flex flex-col md:flex-row md:items-center gap-2 mb-1">
                      <h3 className="text-lg font-bold text-slate-900">{app.doctorName}</h3>
                      <span className={`inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${getStatusColor(app.status)}`}>
                        {getStatusIcon(app.status)}
                        {app.status}
                      </span>
                    </div>
                    <p className="text-sm font-medium text-slate-500">{app.specialty || 'General Practice'} • {app.type || 'Consultation'}</p>
                    
                    <div className="flex flex-wrap justify-center md:justify-start gap-4 mt-3">
                      <div className="flex items-center gap-2 text-gray-600 text-sm font-medium">
                        <CalendarIcon size={16} className="text-blue-500" />
                        {new Date(app.date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                      </div>
                      <div className="flex items-center gap-2 text-gray-600 text-sm font-medium">
                        <Clock size={16} className="text-blue-500" />
                        {app.time}
                      </div>
                      {app.amount > 0 && (
                        <div className="flex items-center gap-2 text-gray-600 text-sm font-bold">
                          <span className="text-[#2563EB]">$</span>
                          {app.amount} {app.paymentConfirmed ? <span className="text-green-600 text-[10px] ml-1 uppercase">(Paid)</span> : <span className="text-amber-600 text-[10px] ml-1 uppercase">(Unpaid)</span>}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-3 w-full md:w-auto justify-center">
                    {app.status === 'confirmed' && (
                      <>
                        {!app.paymentConfirmed && (
                          <button 
                            onClick={() => handleConfirmPayment(app.id)}
                            className="flex-grow md:flex-grow-0 px-6 py-2.5 bg-green-600 text-white rounded-xl font-bold text-sm hover:bg-green-700 transition-all shadow-lg shadow-green-600/20"
                          >
                            Confirm Payment
                          </button>
                        )}
                        <button 
                          onClick={() => handleChat(app)}
                          className="flex-grow md:flex-grow-0 px-6 py-2.5 bg-blue-100 text-[var(--color-primary)] rounded-xl font-bold text-sm hover:bg-blue-200 transition-all flex items-center gap-2"
                        >
                          <MessageSquare size={18} /> Chat
                        </button>
                      </>
                    )}
                    {app.status === 'pending' && (
                      <>
                        <button 
                          onClick={() => {
                            setQuickRescheduleApp(app);
                            setNewDateVal(app.date);
                            setNewTime(app.time);
                          }}
                          className="flex-grow md:flex-grow-0 px-6 py-2.5 bg-[#2563EB] text-white rounded-xl font-bold text-sm hover:bg-blue-700 transition-all"
                        >
                          Reschedule
                        </button>
                        <button 
                          onClick={() => handleCancel(app.id)}
                          className="flex-grow md:flex-grow-0 px-6 py-2.5 bg-white text-red-600 border border-red-100 rounded-xl font-bold text-sm hover:bg-red-50 transition-all"
                        >
                          Cancel
                        </button>
                      </>
                    )}
                    {app.status === 'completed' && (
                      <button className="flex-grow md:flex-grow-0 px-6 py-2.5 bg-white text-[#2563EB] rounded-xl font-bold text-sm hover:bg-slate-200 transition-all">
                        View Summary
                      </button>
                    )}
                    <button className="p-2.5 text-slate-500 hover:text-gray-600 hover:bg-white rounded-xl transition-all">
                      <MoreVertical size={20} />
                    </button>
                  </div>
                </div>

                {app.preparationInstructions && (
                  <div className="p-4 bg-emerald-50 dark:bg-emerald-950/20 rounded-2xl border border-emerald-100 dark:border-emerald-900/50 flex items-start gap-3 mt-4">
                    <CheckCircle2 className="text-emerald-600 dark:text-emerald-400 mt-0.5 flex-shrink-0" size={16} />
                    <div>
                      <p className="text-xs font-bold text-emerald-800 dark:text-emerald-300">Preparation Instructions from Dr. {app.doctorName}</p>
                      <p className="text-sm text-emerald-600 dark:text-emerald-400 mt-0.5">{app.preparationInstructions}</p>
                    </div>
                  </div>
                )}

                {app.status === 'rescheduled' && app.rescheduledBy === 'doctor' && (
                  <div className="p-4 bg-indigo-50 dark:bg-indigo-950/30 rounded-2xl border border-indigo-100 dark:border-indigo-900/50 flex flex-col sm:flex-row sm:items-center justify-between gap-4 mt-4">
                    <div className="flex items-start gap-3">
                      <AlertCircle className="text-indigo-600 dark:text-indigo-400 mt-0.5 flex-shrink-0" size={18} />
                      <div>
                        <p className="text-xs font-bold text-indigo-800 dark:text-indigo-300">Dr. {app.doctorName} Proposed to Reschedule</p>
                        <p className="text-sm text-indigo-700 dark:text-indigo-200 mt-0.5">
                          Proposed Consultation: <strong className="text-indigo-900 dark:text-indigo-100">{new Date(app.rescheduledDate).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })} at {app.rescheduledTime}</strong>
                        </p>
                        {app.rescheduleReason && (
                          <p className="text-xs text-indigo-500 mt-1 italic">"Reason: {app.rescheduleReason}"</p>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-2.5 self-end sm:self-center">
                      <button
                        onClick={() => handleCancelReschedule(app.id)}
                        className="px-4 py-2 bg-red-50 hover:bg-red-100 text-red-600 rounded-xl text-xs font-bold transition-all border border-red-100"
                      >
                        Decline & Cancel
                      </button>
                      <button
                        onClick={() => handleAcceptReschedule(app.id, app.rescheduledDate, app.rescheduledTime)}
                        className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-all"
                      >
                        Accept Reschedule
                      </button>
                    </div>
                  </div>
                )}
              </motion.div>
            ))}

            {filteredAppointments.length === 0 && (
              <div className="text-center py-20 bg-white rounded-[3rem] border border-dashed border-[var(--border-primary)]">
                <div className="bg-white w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <CalendarIcon size={32} className="text-gray-300" />
                </div>
                <h3 className="text-lg font-bold text-slate-900">No appointments found</h3>
                <p className="text-slate-500 text-sm mt-1">Try adjusting your search or filters.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Quick Reschedule Modal Overlay */}
      {quickRescheduleApp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="bg-white rounded-[24px] border border-[var(--border-primary)] p-8 max-w-md w-full shadow-2xl relative">
            <h3 className="text-lg font-bold text-slate-900 mb-4">Quick Reschedule</h3>
            <p className="text-xs text-gray-500 mb-6">Select a new date and time for your consultation with {quickRescheduleApp.doctorName}.</p>
            
            <form onSubmit={handleRescheduleSubmit} className="space-y-4">
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">New Date</label>
                <input 
                  type="date" 
                  value={newDateVal} 
                  onChange={(e) => setNewDateVal(e.target.value)} 
                  className="w-full px-4 py-3 bg-white border-none rounded-xl text-sm focus:ring-2 focus:ring-blue-500" 
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">New Time Slot</label>
                <select 
                  value={newTime} 
                  onChange={(e) => setNewTime(e.target.value)} 
                  className="w-full px-4 py-3 bg-white border-none rounded-xl text-sm focus:ring-2 focus:ring-blue-500 font-semibold"
                >
                  <option>09:00</option>
                  <option>10:00</option>
                  <option>11:00</option>
                  <option>13:00</option>
                  <option>14:00</option>
                  <option>15:00</option>
                  <option>16:00</option>
                </select>
              </div>

              <div className="flex gap-3 pt-4">
                <button 
                  type="button" 
                  onClick={() => setQuickRescheduleApp(null)}
                  className="flex-grow py-3 border border-[var(--border-primary)] rounded-xl font-bold text-sm text-slate-500 hover:bg-white"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="flex-grow py-3 bg-[#2563EB] text-white rounded-xl font-bold text-sm hover:bg-blue-700 shadow-lg shadow-blue-600/10"
                >
                  Confirm
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Appointments;
