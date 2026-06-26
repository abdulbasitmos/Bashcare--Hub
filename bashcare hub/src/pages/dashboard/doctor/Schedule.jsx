import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Calendar as CalendarIcon, 
  Clock, 
  Save, 
  ChevronLeft, 
  ChevronRight, 
  MessageSquare,
  Sparkles,
  CalendarCheck2
} from 'lucide-react';
import { motion } from 'framer-motion';
import { db } from '../../../utils/db';

const Schedule = ({ user }) => {
  const navigate = useNavigate();
  const [schedule, setSchedule] = useState({
    workingHours: { start: '09:00', end: '17:00' },
    offDays: [],
    slotDuration: '30'
  });
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

  // Calendar state
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());

  const fetchScheduleAndAppts = useCallback(async () => {
    try {
      const [savedSchedule, allAppts] = await Promise.all([
        db.getDoctorSchedule(user.id),
        db.getDoctorAppointments(user.id)
      ]);
      
      if (savedSchedule) setSchedule(savedSchedule);
      
      setAppointments(allAppts);
      setLoading(false);
    } catch (error) {
      console.error("Error loading schedule components:", error);
      setLoading(false);
    }
  }, [user.id]);

  useEffect(() => {
    fetchScheduleAndAppts();
  }, [fetchScheduleAndAppts]);

  const handleSaveSettings = async () => {
    try {
      await db.updateSchedule(user.id, schedule);
      alert('Availability schedule saved successfully!');
    } catch (error) {
      console.error("Error updating schedule:", error);
      alert('Failed to save schedule settings.');
    }
  };

  const toggleDay = (day) => {
    setSchedule(prev => ({
      ...prev,
      offDays: prev.offDays.includes(day) 
        ? prev.offDays.filter(d => d !== day) 
        : [...prev.offDays, day]
    }));
  };

  const handleChat = (app) => {
    navigate('/dashboard/doctor/messages', { 
      state: { 
        patient: { 
          id: app.patientId, 
          name: app.patientName 
        } 
      } 
    });
  };

  // Calendar Helpers
  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth();

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayIndex = new Date(year, month, 1).getDay();

  const prevMonth = () => setCurrentMonth(new Date(year, month - 1, 1));
  const nextMonth = () => setCurrentMonth(new Date(year, month + 1, 1));

  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  const months = [
    'January', 'February', 'March', 'April', 'May', 'June', 
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const getAppointmentsForDate = (date) => {
    if (!date) return [];
    return appointments.filter(app => {
      const appDate = new Date(app.date);
      return appDate.getDate() === date.getDate() &&
             appDate.getMonth() === date.getMonth() &&
             appDate.getFullYear() === date.getFullYear();
    });
  };

  // Build calendar grid days
  const calendarCells = [];
  // Pad previous month days
  for (let i = 0; i < (firstDayIndex === 0 ? 6 : firstDayIndex - 1); i++) {
    calendarCells.push(null);
  }
  // Month days
  for (let i = 1; i <= daysInMonth; i++) {
    calendarCells.push(new Date(year, month, i));
  }

  const selectedDateAppointments = getAppointmentsForDate(selectedDate);

  if (loading) return <div className="p-8 text-center font-bold text-slate-500">Syncing clinical calendar...</div>;

  return (
    <div className="space-y-8">
      {/* Header Panel */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-br from-blue-600/10 to-indigo-600/5 p-8 rounded-[24px] border border-blue-50/50">
        <div>
          <div className="flex items-center gap-2 text-xs font-black text-[var(--color-primary)] uppercase tracking-widest mb-1.5">
            <Sparkles size={14} /> Schedule & Planner
          </div>
          <h1 className="text-3xl font-black text-slate-900">Clinical Calendar</h1>
          <p className="text-slate-500 text-sm font-medium mt-0.5">Manage your daily appointments agenda and configure your availability.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Columns - Interactive Calendar */}
        <div className="lg:col-span-2 space-y-6">
          <section className="bg-[var(--bg-secondary)] p-6 md:p-8 rounded-[24px] shadow-sm hover:shadow-md transition-shadow fade-in hover:shadow-md transition-all duration-300 border border-[var(--border-primary)]">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                <CalendarIcon size={20} className="text-[var(--color-primary)]" />
                {months[month]} {year}
              </h2>
              <div className="flex items-center gap-1.5 bg-white p-1.5 rounded-2xl">
                <button onClick={prevMonth} className="p-2 hover:bg-white text-gray-600 rounded-xl transition-all"><ChevronLeft size={16} /></button>
                <button onClick={() => setCurrentMonth(new Date())} className="px-3 py-1 bg-white text-[var(--color-primary)] text-xs font-bold rounded-xl transition-all shadow-sm hover:shadow-md transition-shadow fade-in hover:shadow-md transition-all duration-300">Today</button>
                <button onClick={nextMonth} className="p-2 hover:bg-white text-gray-600 rounded-xl transition-all"><ChevronRight size={16} /></button>
              </div>
            </div>

            {/* Calendar Grid Header */}
            <div className="grid grid-cols-7 gap-2 mb-4 text-center">
              {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(d => (
                <span key={d} className="text-[10px] font-black text-slate-500 uppercase tracking-wider py-2">{d}</span>
              ))}
            </div>

            {/* Calendar Grid Cells */}
            <div className="grid grid-cols-7 gap-2">
              {calendarCells.map((date, idx) => {
                if (!date) return <div key={`empty-${idx}`} className="aspect-square bg-white/30 rounded-2xl"></div>;

                const dayAppts = getAppointmentsForDate(date);
                const isSelected = selectedDate.getDate() === date.getDate() &&
                                   selectedDate.getMonth() === date.getMonth() &&
                                   selectedDate.getFullYear() === date.getFullYear();
                const isToday = new Date().toDateString() === date.toDateString();

                return (
                  <button
                    key={date.toString()}
                    onClick={() => setSelectedDate(date)}
                    className={`aspect-square rounded-2xl relative flex flex-col items-center justify-center border font-bold text-sm transition-all group ${
                      isSelected 
                        ? 'bg-[var(--color-primary)] text-white border-blue-600 shadow-md shadow-blue-500/10' 
                        : isToday 
                          ? 'bg-blue-50/50 text-[var(--color-primary)] border-blue-100'
                          : 'bg-[#f8fafc] border-[var(--border-primary)] text-slate-900 hover:border-blue-300'
                    }`}
                  >
                    <span>{date.getDate()}</span>
                    
                    {/* Booking Indicators */}
                    {dayAppts.length > 0 && (
                      <div className="absolute bottom-2 flex gap-1 justify-center">
                        {dayAppts.slice(0, 3).map((_, i) => (
                          <span 
                            key={i} 
                            className={`w-1.5 h-1.5 rounded-full ${isSelected ? 'bg-white' : 'bg-[var(--color-primary)]'}`}
                          />
                        ))}
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </section>

          {/* Appointments of Selected Day */}
          <section className="bg-[var(--bg-secondary)] p-6 md:p-8 rounded-[24px] shadow-sm hover:shadow-md transition-shadow fade-in hover:shadow-md transition-all duration-300 border border-[var(--border-primary)]">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-lg font-bold text-slate-900">
                  Agenda: {selectedDate.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}
                </h3>
                <p className="text-xs text-slate-500 font-medium mt-0.5">List of consultations scheduled for this date.</p>
              </div>
              <span className="px-3.5 py-1.5 bg-blue-50/50 text-[var(--color-primary)] text-xs font-bold rounded-full">
                {selectedDateAppointments.length} Bookings
              </span>
            </div>

            <div className="space-y-4">
              {selectedDateAppointments.length > 0 ? selectedDateAppointments.map((app, i) => (
                <div 
                  key={app.id} 
                  className="p-5 bg-[#f8fafc] rounded-[24px] border border-[var(--border-primary)] flex flex-col md:flex-row items-center justify-between gap-4"
                >
                  <div className="flex items-center gap-4 w-full md:w-auto">
                    <div className="w-11 h-11 bg-white rounded-xl flex items-center justify-center text-[var(--color-primary)] font-bold text-base shadow-sm hover:shadow-md transition-shadow fade-in hover:shadow-md transition-all duration-300 border border-slate-100">
                      {app.patientName.split(' ').map(n => n[0]).join('')}
                    </div>
                    <div className="min-w-0">
                      <p className="font-bold text-sm text-slate-900">{app.patientName}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1">
                          <Clock size={12} className="text-blue-500" /> {app.time}
                        </span>
                        <span className={`px-2 py-0.5 rounded-full text-[8px] font-black uppercase tracking-widest ${
                          app.status === 'confirmed' ? 'bg-green-50 text-green-600' : 'bg-amber-50 text-amber-600'
                        }`}>
                          {app.status}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 w-full md:w-auto justify-end">
                    <p className="text-xs text-slate-500 font-medium hidden md:block max-w-[200px] truncate">
                      {app.reason}
                    </p>
                    <button 
                      onClick={() => handleChat(app)}
                      className="p-2.5 bg-white text-[var(--color-primary)] rounded-xl border border-slate-100 hover:bg-blue-50/50 transition-all flex items-center justify-center"
                      title="Quick Chat"
                    >
                      <MessageSquare size={16} />
                    </button>
                  </div>
                </div>
              )) : (
                <div className="text-center py-12 opacity-50 bg-[#f8fafc]/50 rounded-[24px] border border-dashed border-[var(--border-primary)]">
                  <CalendarCheck2 size={32} className="mx-auto text-slate-300 mb-2" />
                  <p className="text-xs font-bold text-slate-500">No clinical appointments scheduled for this date.</p>
                </div>
              )}
            </div>
          </section>
        </div>

        {/* Right Column - Availability Settings */}
        <div className="space-y-6">
          <section className="bg-[var(--bg-secondary)] p-6 md:p-8 rounded-[24px] shadow-sm hover:shadow-md transition-shadow fade-in hover:shadow-md transition-all duration-300 border border-[var(--border-primary)]">
            <h2 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2">
              <Clock size={20} className="text-[var(--color-primary)]" /> Working Hours
            </h2>
            <div className="space-y-5">
              <div>
                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 ml-1">Start Time</label>
                <input 
                  type="time" 
                  value={schedule.workingHours.start}
                  onChange={(e) => setSchedule({...schedule, workingHours: {...schedule.workingHours, start: e.target.value}})}
                  className="w-full p-4 bg-white border-none rounded-2xl text-sm font-bold focus:ring-2 focus:ring-blue-500/20 outline-none text-slate-900"
                />
              </div>
              <div>
                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 ml-1">End Time</label>
                <input 
                  type="time" 
                  value={schedule.workingHours.end}
                  onChange={(e) => setSchedule({...schedule, workingHours: {...schedule.workingHours, end: e.target.value}})}
                  className="w-full p-4 bg-white border-none rounded-2xl text-sm font-bold focus:ring-2 focus:ring-blue-500/20 outline-none text-slate-900"
                />
              </div>
              <div>
                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 ml-1">Consultation Interval</label>
                <select 
                  value={schedule.slotDuration}
                  onChange={(e) => setSchedule({...schedule, slotDuration: e.target.value})}
                  className="w-full p-4 bg-white border-none rounded-2xl text-sm font-bold focus:ring-2 focus:ring-blue-500/20 outline-none text-slate-900"
                >
                  <option value="15">15 Minutes</option>
                  <option value="30">30 Minutes</option>
                  <option value="45">45 Minutes</option>
                  <option value="60">1 Hour</option>
                </select>
              </div>
            </div>
          </section>

          <section className="bg-[var(--bg-secondary)] p-6 md:p-8 rounded-[24px] shadow-sm hover:shadow-md transition-shadow fade-in hover:shadow-md transition-all duration-300 border border-[var(--border-primary)]">
            <h2 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2">
              <CalendarIcon size={20} className="text-[var(--color-primary)]" /> Weekdays Availability
            </h2>
            <div className="space-y-3.5 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
              {days.map((day) => {
                const isOff = schedule.offDays.includes(day);
                return (
                  <div key={day} className={`p-4 rounded-2xl border transition-all flex items-center justify-between ${
                    isOff ? 'bg-[#f8fafc] border-[var(--border-primary)] opacity-60' : 'bg-blue-50/50/20 border-blue-100 shadow-sm hover:shadow-md transition-shadow fade-in hover:shadow-md transition-all duration-300'
                  }`}>
                    <span className={`text-xs font-bold ${isOff ? 'text-slate-500' : 'text-slate-900'}`}>{day}</span>
                    <button 
                      onClick={() => toggleDay(day)}
                      className={`px-3 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${
                        isOff ? 'bg-gray-200 text-slate-500' : 'bg-green-100 text-green-600'
                      }`}
                    >
                      {isOff ? 'Unavailable' : 'Available'}
                    </button>
                  </div>
                );
              })}
            </div>
          </section>

          <button 
            onClick={handleSaveSettings}
            className="w-full py-4.5 bg-[var(--color-primary)] hover:bg-blue-700 text-white rounded-[24px] font-black text-sm shadow-xl shadow-blue-600/20 transition-all flex items-center justify-center gap-2 active:scale-[0.98]"
          >
            <Save size={18} /> Save Settings
          </button>
        </div>
      </div>
    </div>
  );
};

export default Schedule;
