import { useState, useEffect } from 'react';
import {
  Calendar,
  Clock,
  CheckCircle2,
  ArrowLeft,
  Video,
  MapPin,
  CreditCard,
  Wallet,
  Banknote,
  Star,
  User,
  Phone,
  Navigation,
  Shield,
  ChevronRight,
  Stethoscope,
  BadgeCheck,
  AlertCircle,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, useLocation } from 'react-router-dom';
import { db } from '../../../utils/db';

const STEPS = [
  { id: 1, label: 'Doctor',    icon: Stethoscope },
  { id: 2, label: 'Type',      icon: Video },
  { id: 3, label: 'Schedule',  icon: Calendar },
  { id: 4, label: 'Details',   icon: CreditCard },
  { id: 5, label: 'Confirm',   icon: CheckCircle2 },
];

const PAYMENT_METHODS = [
  { id: 'card',    label: 'Credit / Debit Card', icon: CreditCard,  desc: 'Visa, Mastercard, Verve' },
  { id: 'wallet',  label: 'Bashcare Wallet',     icon: Wallet,      desc: 'Pay from your balance' },
  { id: 'on_visit',label: 'Pay on Visit',        icon: Banknote,    desc: 'Cash or POS at clinic' },
];

const stepVariants = {
  enter:  { opacity: 0, x: 30 },
  center: { opacity: 1, x: 0 },
  exit:   { opacity: 0, x: -30 },
};

const BookAppointment = ({ user }) => {
  const navigate    = useNavigate();
  const location    = useLocation();
  const preSelectedDoctor = location.state?.doctor;

  const [step, setStep] = useState(preSelectedDoctor ? 2 : 1);
  const [availableDoctors, setAvailableDoctors] = useState([]);
  const [doctorSchedule, setDoctorSchedule]     = useState(null);
  const [doctorAppointments, setDoctorAppointments] = useState([]);
  const [loadingSchedule, setLoadingSchedule]   = useState(false);
  const [isSubmitting, setIsSubmitting]         = useState(false);
  const [isSuccess, setIsSuccess]               = useState(false);
  const [cardFlipped, setCardFlipped]           = useState(false);

  const [formData, setFormData] = useState({
    doctor:          preSelectedDoctor || null,
    department:      preSelectedDoctor?.specialty || '',
    appointmentType: '',          // 'online' | 'in_person'
    date:            '',
    time:            '',
    reason:          '',
    symptoms:        '',
    // In-person address
    patientAddress:  '',
    patientCity:     '',
    patientPhone:    '',
    // Payment
    paymentMethod:   '',
    cardNumber:      '',
    cardName:        '',
    cardExpiry:      '',
    cardCVV:         '',
  });

  // ─── fetch doctors ─────────────────────────────────────────────
  useEffect(() => {
    db.getDoctors().then(setAvailableDoctors).catch(() => setAvailableDoctors([]));
  }, []);

  // ─── fetch doctor schedule when doctor changes ─────────────────
  useEffect(() => {
    if (!formData.doctor) return;
    const load = async () => {
      setLoadingSchedule(true);
      try {
        const docId = formData.doctor.userId || formData.doctor.id;
        const [schedule, appts] = await Promise.all([
          db.getDoctorSchedule(docId),
          db.getDoctorAppointments(docId),
        ]);
        setDoctorSchedule(schedule || { workingHours: { start: '09:00', end: '17:00' }, offDays: [], slotDuration: '30' });
        setDoctorAppointments(appts || []);
      } catch { /* ignore */ }
      finally { setLoadingSchedule(false); }
    };
    load();
  }, [formData.doctor]);

  // ─── slot generation ───────────────────────────────────────────
  const getAvailableSlots = () => {
    if (!doctorSchedule || !formData.date) return [];
    const selectedDateObj = new Date(formData.date);
    const dayOfWeek = selectedDateObj.toLocaleDateString('en-US', { weekday: 'long' });
    if (doctorSchedule.offDays?.includes(dayOfWeek)) return [];

    const parseTime = (t) => { const [h, m] = t.split(':').map(Number); return h * 60 + m; };
    const formatTime = (mins) => {
      const h = Math.floor(mins / 60), m = mins % 60;
      const ampm = h >= 12 ? 'PM' : 'AM';
      const dh = h % 12 === 0 ? 12 : h % 12;
      return `${String(dh).padStart(2,'0')}:${String(m).padStart(2,'0')} ${ampm}`;
    };

    const start = parseTime(doctorSchedule.workingHours?.start || '09:00');
    const end   = parseTime(doctorSchedule.workingHours?.end   || '17:00');
    const dur   = parseInt(doctorSchedule.slotDuration || '30', 10);

    const booked = doctorAppointments
      .filter(a => {
        const d = new Date(a.date).toISOString().split('T')[0];
        const s = new Date(formData.date).toISOString().split('T')[0];
        return d === s && (a.status === 'confirmed' || a.status === 'pending');
      })
      .map(a => a.time.trim().toUpperCase());

    const slots = [];
    for (let t = start; t < end; t += dur) {
      const s = formatTime(t);
      if (!booked.includes(s.toUpperCase())) slots.push(s);
    }
    return slots;
  };

  const slots = getAvailableSlots();

  const consultationFee = formData.doctor?.consultationFee
    || formData.doctor?.fee
    || (formData.appointmentType === 'online' ? '₦5,000' : '₦8,000');

  // ─── submit ────────────────────────────────────────────────────
  const handleSubmit = async () => {
    setIsSubmitting(true);
    const newAppointment = {
      patientId:       user.id,
      patientName:     user.name,
      doctorId:        formData.doctor.userId || formData.doctor.id,
      doctorName:      formData.doctor.name,
      specialty:       formData.doctor.specialty,
      date:            formData.date,
      time:            formData.time,
      reason:          formData.reason,
      symptoms:        formData.symptoms,
      appointmentType: formData.appointmentType,
      patientAddress:  formData.appointmentType === 'in_person' ? `${formData.patientAddress}, ${formData.patientCity}` : null,
      patientPhone:    formData.patientPhone,
      paymentMethod:   formData.paymentMethod,
      status:          'pending',
    };

    setTimeout(async () => {
      try {
        await db.addAppointment(newAppointment);
        // Notify the patient
        await db.addNotification({
          userId:  user.id,
          title:   'Appointment Requested',
          message: `Your ${formData.appointmentType === 'online' ? 'online' : 'in-person'} appointment with ${formData.doctor.name} has been submitted for approval.`,
          type:    'appointment',
        });
        // Notify the doctor
        const doctorId = formData.doctor.userId || formData.doctor.id;
        await db.addNotification({
          userId:  doctorId,
          title:   '🔔 New Booking Request',
          message: `${user.name} has requested a ${formData.appointmentType === 'online' ? 'video' : 'in-person'} appointment on ${formData.date} at ${formData.time}. Reason: ${formData.reason || 'Not specified'}.`,
          type:    'appointment',
        });
      } catch { /* continue even on error */ }
      setIsSubmitting(false);
      setIsSuccess(true);
    }, 1800);
  };

  const update = (key, val) => setFormData(prev => ({ ...prev, [key]: val }));

  // ─── step validators ───────────────────────────────────────────
  const canAdvance = () => {
    if (step === 1) return !!formData.doctor;
    if (step === 2) return !!formData.appointmentType;
    if (step === 3) return !!formData.date && !!formData.time;
    if (step === 4) {
      const base = !!formData.reason && !!formData.paymentMethod;
      if (formData.appointmentType === 'in_person') return base && !!formData.patientAddress && !!formData.patientCity;
      if (formData.paymentMethod === 'card') return base && formData.cardNumber.length >= 16 && !!formData.cardName && !!formData.cardExpiry && formData.cardCVV.length >= 3;
      return base;
    }
    return true;
  };

  // ─── Success Screen ────────────────────────────────────────────
  if (isSuccess) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex flex-col items-center justify-center py-16 bg-[var(--bg-secondary)] rounded-[3rem] border border-[var(--border-primary)] text-center px-8 shadow-sm"
      >
        <div className="w-24 h-24 bg-gradient-to-br from-green-400 to-emerald-600 text-white rounded-[28px] flex items-center justify-center mb-6 shadow-xl shadow-green-500/30">
          <CheckCircle2 size={44} />
        </div>
        <h2 className="text-3xl font-black text-slate-900 dark:text-slate-100">Booking Confirmed!</h2>
        <p className="text-slate-500 dark:text-slate-400 mt-3 max-w-md mx-auto leading-relaxed">
          Your {formData.appointmentType === 'online' ? '🎥 online video' : '🏥 in-person'} appointment with <strong>{formData.doctor?.name}</strong> on <strong>{formData.date}</strong> at <strong>{formData.time}</strong> is pending doctor approval.
        </p>
        {formData.paymentMethod === 'card' && (
          <div className="mt-4 flex items-center gap-2 px-4 py-2 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 rounded-full text-sm font-semibold">
            <Shield size={15} /> Payment pre-authorised securely
          </div>
        )}
        <div className="mt-8 grid grid-cols-2 gap-3 w-full max-w-sm">
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-4 border border-[var(--border-primary)] text-left">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide mb-1">Type</p>
            <p className="font-bold text-slate-800 dark:text-slate-100 text-sm">{formData.appointmentType === 'online' ? '🎥 Online' : '🏥 In-Person'}</p>
          </div>
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-4 border border-[var(--border-primary)] text-left">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide mb-1">Payment</p>
            <p className="font-bold text-slate-800 dark:text-slate-100 text-sm capitalize">{formData.paymentMethod?.replace('_', ' ')}</p>
          </div>
        </div>
        <div className="mt-8 flex gap-3 flex-wrap justify-center">
          <button onClick={() => navigate('/dashboard/patient/appointments')} className="px-8 py-3 bg-[var(--color-primary)] text-white rounded-2xl font-bold hover:opacity-90 transition-all">
            View Appointments
          </button>
          <button onClick={() => navigate('/dashboard/patient')} className="px-8 py-3 bg-[var(--bg-secondary)] text-slate-700 dark:text-slate-200 border border-[var(--border-primary)] rounded-2xl font-bold hover:bg-slate-50 dark:hover:bg-slate-800 transition-all">
            Dashboard
          </button>
        </div>
      </motion.div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-slate-100">Book Appointment</h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-0.5">Complete all steps to schedule your consultation</p>
        </div>
        {step > 1 && (
          <button onClick={() => setStep(p => p - 1)} className="flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-[var(--color-primary)] transition-colors">
            <ArrowLeft size={16} /> Back
          </button>
        )}
      </div>

      {/* Progress Stepper */}
      <div className="flex items-center">
        {STEPS.map((s, idx) => {
          const Icon = s.icon;
          const done    = step > s.id;
          const current = step === s.id;
          return (
            <div key={s.id} className="flex items-center flex-1 last:flex-none">
              <div className="flex flex-col items-center gap-1">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 font-bold text-sm shadow-sm
                  ${done    ? 'bg-green-500 text-white shadow-green-200'
                  : current ? 'bg-[var(--color-primary)] text-white shadow-blue-200 ring-4 ring-blue-100 dark:ring-blue-900/40'
                  :           'bg-[var(--bg-secondary)] text-slate-400 border-2 border-[var(--border-primary)]'}`}
                >
                  {done ? <CheckCircle2 size={16} /> : <Icon size={16} />}
                </div>
                <span className={`text-[10px] font-bold hidden sm:block ${current ? 'text-[var(--color-primary)]' : done ? 'text-green-500' : 'text-slate-400'}`}>{s.label}</span>
              </div>
              {idx < STEPS.length - 1 && (
                <div className={`flex-1 h-0.5 mx-1 rounded-full transition-colors duration-500 ${done ? 'bg-green-400' : 'bg-[var(--border-primary)]'}`} />
              )}
            </div>
          );
        })}
      </div>

      {/* Step Card */}
      <div className="bg-[var(--bg-secondary)] rounded-[2.5rem] border border-[var(--border-primary)] shadow-sm overflow-hidden">
        <AnimatePresence mode="wait">
          {/* ─── STEP 1: Select Doctor ──────────────────────────── */}
          {step === 1 && (
            <motion.div key="s1" variants={stepVariants} initial="enter" animate="center" exit="exit" transition={{ duration: 0.25 }} className="p-6 md:p-8 space-y-5">
              <div>
                <h2 className="text-xl font-black text-slate-900 dark:text-slate-100">Choose Your Doctor</h2>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Select a verified specialist for your consultation</p>
              </div>
              {availableDoctors.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {availableDoctors.map((doc) => {
                    const selected = formData.doctor?.id === doc.id || formData.doctor?.userId === doc.userId;
                    return (
                      <button key={doc.id || doc.userId}
                        onClick={() => { update('doctor', doc); update('department', doc.specialty); }}
                        className={`flex items-start gap-4 p-5 rounded-2xl border-2 transition-all text-left group
                          ${selected ? 'border-[var(--color-primary)] bg-blue-50/50 dark:bg-blue-900/10' : 'border-[var(--border-primary)] hover:border-blue-200 dark:hover:border-blue-800 bg-white dark:bg-slate-800/50'}`}
                      >
                        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center font-black text-lg flex-shrink-0 transition-all
                          ${selected ? 'bg-[var(--color-primary)] text-white' : 'bg-blue-100 dark:bg-slate-700 text-[var(--color-primary)] group-hover:bg-blue-200'}`}>
                          {doc.name.split(' ').map(n => n[0]).join('').slice(0,2)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <h4 className="font-black text-slate-900 dark:text-slate-100 text-sm">{doc.name}</h4>
                            <BadgeCheck size={14} className="text-[var(--color-primary)] flex-shrink-0" />
                          </div>
                          <p className="text-xs text-slate-500 dark:text-slate-400">{doc.specialty}</p>
                          <div className="flex items-center gap-3 mt-2">
                            <span className="flex items-center gap-1 text-amber-500 text-xs font-bold">
                              <Star size={11} fill="currentColor" /> {doc.rating || '4.8'}
                            </span>
                            <span className="text-[10px] text-slate-400">|</span>
                            <span className="text-xs text-slate-500 font-medium">{doc.experience || '5+ yrs'}</span>
                          </div>
                          <div className="flex items-center gap-1 mt-2">
                            <span className="text-xs font-black text-[var(--color-primary)]">
                              {doc.consultationFee || doc.fee || '₦5,000+'}
                            </span>
                            <span className="text-[10px] text-slate-400">/ session</span>
                          </div>
                        </div>
                        {selected && <CheckCircle2 size={18} className="text-[var(--color-primary)] flex-shrink-0 mt-0.5" />}
                      </button>
                    );
                  })}
                </div>
              ) : (
                <div className="p-12 text-center border-2 border-dashed border-[var(--border-primary)] rounded-2xl">
                  <Stethoscope size={32} className="text-slate-300 mx-auto mb-3" />
                  <p className="text-slate-500 font-medium">No verified doctors available at the moment.</p>
                </div>
              )}
              <div className="flex justify-end">
                <button disabled={!formData.doctor} onClick={() => setStep(2)}
                  className="px-8 py-3 bg-[var(--color-primary)] text-white rounded-2xl font-bold hover:opacity-90 transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-2">
                  Continue <ChevronRight size={16} />
                </button>
              </div>
            </motion.div>
          )}

          {/* ─── STEP 2: Appointment Type ───────────────────────── */}
          {step === 2 && (
            <motion.div key="s2" variants={stepVariants} initial="enter" animate="center" exit="exit" transition={{ duration: 0.25 }} className="p-6 md:p-8 space-y-5">
              <div>
                <h2 className="text-xl font-black text-slate-900 dark:text-slate-100">Appointment Type</h2>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">How would you like to meet with <strong className="text-slate-700 dark:text-slate-200">{formData.doctor?.name}</strong>?</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Online */}
                <button onClick={() => update('appointmentType', 'online')}
                  className={`relative p-6 rounded-2xl border-2 text-left transition-all group overflow-hidden
                    ${formData.appointmentType === 'online' ? 'border-blue-600 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20' : 'border-[var(--border-primary)] hover:border-blue-200 bg-white dark:bg-slate-800/50'}`}
                >
                  <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-4 transition-all
                    ${formData.appointmentType === 'online' ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30' : 'bg-blue-100 dark:bg-slate-700 text-blue-600'}`}>
                    <Video size={24} />
                  </div>
                  <h3 className="font-black text-slate-900 dark:text-slate-100 text-lg">Online Consultation</h3>
                  <p className="text-slate-500 dark:text-slate-400 text-sm mt-1 leading-relaxed">Video call from the comfort of your home. No travel needed.</p>
                  <div className="mt-4 flex flex-wrap gap-2">
                    {['Video call', 'Chat support', 'Prescription emailed'].map(tag => (
                      <span key={tag} className={`text-[10px] font-bold px-2.5 py-1 rounded-full ${formData.appointmentType === 'online' ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300' : 'bg-slate-100 dark:bg-slate-700 text-slate-500'}`}>{tag}</span>
                    ))}
                  </div>
                  {formData.appointmentType === 'online' && (
                    <div className="absolute top-4 right-4"><CheckCircle2 size={20} className="text-blue-600" /></div>
                  )}
                </button>

                {/* In-Person */}
                <button onClick={() => update('appointmentType', 'in_person')}
                  className={`relative p-6 rounded-2xl border-2 text-left transition-all group overflow-hidden
                    ${formData.appointmentType === 'in_person' ? 'border-emerald-600 bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20' : 'border-[var(--border-primary)] hover:border-emerald-200 bg-white dark:bg-slate-800/50'}`}
                >
                  <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-4 transition-all
                    ${formData.appointmentType === 'in_person' ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-500/30' : 'bg-emerald-100 dark:bg-slate-700 text-emerald-600'}`}>
                    <MapPin size={24} />
                  </div>
                  <h3 className="font-black text-slate-900 dark:text-slate-100 text-lg">In-Person Visit</h3>
                  <p className="text-slate-500 dark:text-slate-400 text-sm mt-1 leading-relaxed">Physical examination at the clinic or your location.</p>
                  <div className="mt-4 flex flex-wrap gap-2">
                    {['Physical exam', 'Lab tests', 'Clinic address given'].map(tag => (
                      <span key={tag} className={`text-[10px] font-bold px-2.5 py-1 rounded-full ${formData.appointmentType === 'in_person' ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300' : 'bg-slate-100 dark:bg-slate-700 text-slate-500'}`}>{tag}</span>
                    ))}
                  </div>
                  {formData.appointmentType === 'in_person' && (
                    <div className="absolute top-4 right-4"><CheckCircle2 size={20} className="text-emerald-600" /></div>
                  )}
                </button>
              </div>
              <div className="flex justify-end">
                <button disabled={!formData.appointmentType} onClick={() => setStep(3)}
                  className="px-8 py-3 bg-[var(--color-primary)] text-white rounded-2xl font-bold hover:opacity-90 transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-2">
                  Continue <ChevronRight size={16} />
                </button>
              </div>
            </motion.div>
          )}

          {/* ─── STEP 3: Schedule ──────────────────────────────── */}
          {step === 3 && (
            <motion.div key="s3" variants={stepVariants} initial="enter" animate="center" exit="exit" transition={{ duration: 0.25 }} className="p-6 md:p-8 space-y-6">
              <div>
                <h2 className="text-xl font-black text-slate-900 dark:text-slate-100">Pick a Date & Time</h2>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">All times are in your local timezone</p>
              </div>

              {/* Doctor mini-card */}
              <div className="flex items-center gap-3 p-4 bg-white dark:bg-slate-800 rounded-2xl border border-[var(--border-primary)]">
                <div className="w-10 h-10 rounded-xl bg-[var(--color-primary)] text-white flex items-center justify-center font-black text-sm">
                  {formData.doctor?.name?.split(' ').map(n => n[0]).join('').slice(0,2)}
                </div>
                <div>
                  <p className="font-black text-slate-900 dark:text-slate-100 text-sm">{formData.doctor?.name}</p>
                  <p className="text-xs text-slate-500">{formData.doctor?.specialty}</p>
                </div>
                <span className={`ml-auto px-3 py-1 rounded-full text-xs font-bold ${formData.appointmentType === 'online' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300' : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300'}`}>
                  {formData.appointmentType === 'online' ? '🎥 Online' : '🏥 In-Person'}
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Select Date</label>
                  <input
                    type="date"
                    min={new Date().toISOString().split('T')[0]}
                    value={formData.date}
                    onChange={(e) => { update('date', e.target.value); update('time', ''); }}
                    className="w-full p-4 bg-white dark:bg-slate-800 border border-[var(--border-primary)] rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-transparent font-medium text-slate-800 dark:text-slate-100"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Available Time Slots</label>
                  {loadingSchedule ? (
                    <div className="flex items-center gap-2 text-xs text-slate-500 p-4">
                      <div className="w-4 h-4 border-2 border-blue-400 border-t-transparent rounded-full animate-spin" />
                      Checking availability...
                    </div>
                  ) : !formData.date ? (
                    <div className="flex items-center gap-2 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-dashed border-[var(--border-primary)]">
                      <Clock size={16} className="text-slate-400" />
                      <p className="text-xs text-slate-400 font-semibold">Select a date to view available slots</p>
                    </div>
                  ) : slots.length === 0 ? (
                    <div className="flex items-start gap-2 p-4 bg-red-50 dark:bg-red-900/10 text-red-600 dark:text-red-400 rounded-2xl text-xs font-semibold border border-red-100 dark:border-red-800">
                      <AlertCircle size={15} className="mt-0.5 flex-shrink-0" />
                      Doctor is not available or fully booked on this date.
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 gap-2 max-h-52 overflow-y-auto pr-1 custom-scrollbar">
                      {slots.map((slot) => (
                        <button key={slot} type="button" onClick={() => update('time', slot)}
                          className={`p-3 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5
                            ${formData.time === slot ? 'bg-[var(--color-primary)] text-white shadow-md shadow-blue-500/20' : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-blue-50 dark:hover:bg-slate-700 border border-[var(--border-primary)]'}`}>
                          <Clock size={11} /> {slot}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
              <div className="flex justify-end">
                <button disabled={!formData.date || !formData.time} onClick={() => setStep(4)}
                  className="px-8 py-3 bg-[var(--color-primary)] text-white rounded-2xl font-bold hover:opacity-90 transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-2">
                  Continue <ChevronRight size={16} />
                </button>
              </div>
            </motion.div>
          )}

          {/* ─── STEP 4: Details + Payment ─────────────────────── */}
          {step === 4 && (
            <motion.div key="s4" variants={stepVariants} initial="enter" animate="center" exit="exit" transition={{ duration: 0.25 }} className="p-6 md:p-8 space-y-6">
              <div>
                <h2 className="text-xl font-black text-slate-900 dark:text-slate-100">Details & Payment</h2>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Provide visit details and choose how to pay</p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Left column: visit details */}
                <div className="space-y-4">
                  <h3 className="font-black text-slate-800 dark:text-slate-100 text-sm uppercase tracking-wide">Visit Details</h3>

                  <div>
                    <label className="block text-sm font-bold text-slate-600 dark:text-slate-400 mb-2">Reason for Visit <span className="text-red-400">*</span></label>
                    <textarea rows="3" placeholder="e.g. Persistent headache for 3 days..."
                      value={formData.reason}
                      onChange={(e) => update('reason', e.target.value)}
                      className="w-full p-4 bg-white dark:bg-slate-800 border border-[var(--border-primary)] rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-transparent font-medium placeholder:text-slate-400 text-slate-800 dark:text-slate-100 resize-none"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-slate-600 dark:text-slate-400 mb-2">Symptoms (optional)</label>
                    <input type="text" placeholder="e.g. fever, fatigue, nausea..."
                      value={formData.symptoms}
                      onChange={(e) => update('symptoms', e.target.value)}
                      className="w-full p-4 bg-white dark:bg-slate-800 border border-[var(--border-primary)] rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-transparent font-medium placeholder:text-slate-400 text-slate-800 dark:text-slate-100"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-slate-600 dark:text-slate-400 mb-2">
                      <Phone size={13} className="inline mr-1" />Contact Phone <span className="text-red-400">*</span>
                    </label>
                    <input type="tel" placeholder="+234 800 000 0000"
                      value={formData.patientPhone}
                      onChange={(e) => update('patientPhone', e.target.value)}
                      className="w-full p-4 bg-white dark:bg-slate-800 border border-[var(--border-primary)] rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-transparent font-medium placeholder:text-slate-400 text-slate-800 dark:text-slate-100"
                    />
                  </div>

                  {/* In-person address fields */}
                  {formData.appointmentType === 'in_person' && (
                    <div className="p-4 bg-emerald-50 dark:bg-emerald-900/10 rounded-2xl border border-emerald-100 dark:border-emerald-800 space-y-3">
                      <div className="flex items-center gap-2 text-emerald-700 dark:text-emerald-400 font-bold text-sm">
                        <Navigation size={14} /> Your Address for the Visit
                      </div>
                      <input type="text" placeholder="Street address"
                        value={formData.patientAddress}
                        onChange={(e) => update('patientAddress', e.target.value)}
                        className="w-full p-3.5 bg-white dark:bg-slate-800 border border-[var(--border-primary)] rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent font-medium placeholder:text-slate-400 text-sm text-slate-800 dark:text-slate-100"
                      />
                      <input type="text" placeholder="City / State"
                        value={formData.patientCity}
                        onChange={(e) => update('patientCity', e.target.value)}
                        className="w-full p-3.5 bg-white dark:bg-slate-800 border border-[var(--border-primary)] rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent font-medium placeholder:text-slate-400 text-sm text-slate-800 dark:text-slate-100"
                      />
                    </div>
                  )}
                </div>

                {/* Right column: payment */}
                <div className="space-y-4">
                  <h3 className="font-black text-slate-800 dark:text-slate-100 text-sm uppercase tracking-wide">Payment Method</h3>

                  {/* Fee summary */}
                  <div className="flex items-center justify-between p-4 bg-white dark:bg-slate-800 rounded-2xl border border-[var(--border-primary)]">
                    <div>
                      <p className="text-xs text-slate-500 font-medium">Consultation Fee</p>
                      <p className="text-2xl font-black text-slate-900 dark:text-slate-100">{consultationFee}</p>
                    </div>
                    <div className={`px-3 py-1.5 rounded-full text-xs font-bold ${formData.appointmentType === 'online' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300' : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300'}`}>
                      {formData.appointmentType === 'online' ? '🎥 Online' : '🏥 In-Person'}
                    </div>
                  </div>

                  {/* Payment method selection */}
                  <div className="space-y-2">
                    {PAYMENT_METHODS.map(pm => {
                      const Icon = pm.icon;
                      return (
                        <button key={pm.id} onClick={() => update('paymentMethod', pm.id)}
                          className={`w-full flex items-center gap-4 p-4 rounded-2xl border-2 text-left transition-all
                            ${formData.paymentMethod === pm.id ? 'border-[var(--color-primary)] bg-blue-50/50 dark:bg-blue-900/10' : 'border-[var(--border-primary)] hover:border-blue-200 bg-white dark:bg-slate-800/50'}`}>
                          <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${formData.paymentMethod === pm.id ? 'bg-[var(--color-primary)] text-white' : 'bg-slate-100 dark:bg-slate-700 text-slate-500'}`}>
                            <Icon size={18} />
                          </div>
                          <div className="flex-1">
                            <p className={`font-bold text-sm ${formData.paymentMethod === pm.id ? 'text-[var(--color-primary)]' : 'text-slate-800 dark:text-slate-100'}`}>{pm.label}</p>
                            <p className="text-[11px] text-slate-400 dark:text-slate-500">{pm.desc}</p>
                          </div>
                          <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all
                            ${formData.paymentMethod === pm.id ? 'border-[var(--color-primary)] bg-[var(--color-primary)]' : 'border-slate-300 dark:border-slate-600'}`}>
                            {formData.paymentMethod === pm.id && <div className="w-2 h-2 rounded-full bg-white" />}
                          </div>
                        </button>
                      );
                    })}
                  </div>

                  {/* Card form */}
                  {formData.paymentMethod === 'card' && (
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-3">
                      {/* Card visual */}
                      <div
                        className="relative h-40 rounded-2xl cursor-pointer"
                        style={{ perspective: '600px' }}
                        onClick={() => setCardFlipped(f => !f)}
                      >
                        <div className={`w-full h-full transition-transform duration-500 relative`} style={{ transformStyle: 'preserve-3d', transform: cardFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)' }}>
                          {/* Front */}
                          <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-[var(--color-primary)] to-indigo-700 p-5 flex flex-col justify-between" style={{ backfaceVisibility: 'hidden' }}>
                            <div className="flex justify-between items-start">
                              <div className="w-10 h-7 rounded bg-yellow-300/90 flex items-center justify-center text-[8px] font-bold text-slate-700">CHIP</div>
                              <span className="text-white/80 font-bold text-xs">BASHCARE</span>
                            </div>
                            <div>
                              <p className="text-white font-mono tracking-widest text-base">
                                {formData.cardNumber.replace(/\s/g,'').match(/.{1,4}/g)?.join(' ') || '•••• •••• •••• ••••'}
                              </p>
                              <div className="flex justify-between mt-2">
                                <div>
                                  <p className="text-white/50 text-[9px]">CARDHOLDER</p>
                                  <p className="text-white font-bold text-xs uppercase">{formData.cardName || 'Your Name'}</p>
                                </div>
                                <div>
                                  <p className="text-white/50 text-[9px]">EXPIRES</p>
                                  <p className="text-white font-bold text-xs">{formData.cardExpiry || 'MM/YY'}</p>
                                </div>
                              </div>
                            </div>
                          </div>
                          {/* Back */}
                          <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-slate-700 to-slate-900 flex flex-col justify-center" style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}>
                            <div className="w-full h-10 bg-slate-600 mb-4" />
                            <div className="px-5 flex items-center justify-end gap-3">
                              <div className="flex-1 h-8 bg-slate-100 rounded" />
                              <div className="bg-slate-100 rounded px-3 py-1.5">
                                <p className="font-mono font-bold text-slate-800 text-sm tracking-widest">{formData.cardCVV || '•••'}</p>
                              </div>
                            </div>
                            <p className="text-center text-slate-400 text-[9px] mt-4">Click to flip card</p>
                          </div>
                        </div>
                      </div>

                      <input type="text" placeholder="Card number" maxLength="19"
                        value={formData.cardNumber}
                        onChange={(e) => {
                          const raw = e.target.value.replace(/\D/g,'').slice(0,16);
                          update('cardNumber', raw);
                        }}
                        className="w-full p-4 bg-white dark:bg-slate-800 border border-[var(--border-primary)] rounded-2xl focus:ring-2 focus:ring-blue-500 font-mono text-slate-800 dark:text-slate-100 placeholder:text-slate-400 placeholder:font-sans"
                      />
                      <input type="text" placeholder="Cardholder name"
                        value={formData.cardName}
                        onChange={(e) => update('cardName', e.target.value.toUpperCase())}
                        className="w-full p-4 bg-white dark:bg-slate-800 border border-[var(--border-primary)] rounded-2xl focus:ring-2 focus:ring-blue-500 font-medium text-slate-800 dark:text-slate-100 placeholder:text-slate-400 uppercase"
                      />
                      <div className="grid grid-cols-2 gap-3">
                        <input type="text" placeholder="MM/YY" maxLength="5"
                          value={formData.cardExpiry}
                          onChange={(e) => {
                            let v = e.target.value.replace(/\D/g,'');
                            if (v.length >= 3) v = v.slice(0,2)+'/'+v.slice(2,4);
                            update('cardExpiry', v);
                          }}
                          className="p-4 bg-white dark:bg-slate-800 border border-[var(--border-primary)] rounded-2xl focus:ring-2 focus:ring-blue-500 font-mono text-slate-800 dark:text-slate-100 placeholder:text-slate-400 placeholder:font-sans"
                        />
                        <input type="text" placeholder="CVV" maxLength="4"
                          onFocus={() => setCardFlipped(true)}
                          onBlur={() => setCardFlipped(false)}
                          value={formData.cardCVV}
                          onChange={(e) => update('cardCVV', e.target.value.replace(/\D/g,'').slice(0,4))}
                          className="p-4 bg-white dark:bg-slate-800 border border-[var(--border-primary)] rounded-2xl focus:ring-2 focus:ring-blue-500 font-mono text-slate-800 dark:text-slate-100 placeholder:text-slate-400 placeholder:font-sans"
                        />
                      </div>
                      <div className="flex items-center gap-2 text-xs text-slate-400 dark:text-slate-500">
                        <Shield size={12} className="text-green-500 flex-shrink-0" />
                        Secured with 256-bit SSL encryption
                      </div>
                    </motion.div>
                  )}
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <button disabled={!canAdvance()} onClick={() => setStep(5)}
                  className="px-8 py-3 bg-[var(--color-primary)] text-white rounded-2xl font-bold hover:opacity-90 transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-2">
                  Review Booking <ChevronRight size={16} />
                </button>
              </div>
            </motion.div>
          )}

          {/* ─── STEP 5: Review & Confirm ──────────────────────── */}
          {step === 5 && (
            <motion.div key="s5" variants={stepVariants} initial="enter" animate="center" exit="exit" transition={{ duration: 0.25 }} className="p-6 md:p-8 space-y-6">
              <div>
                <h2 className="text-xl font-black text-slate-900 dark:text-slate-100">Review & Confirm</h2>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Please review your booking before confirming</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Doctor */}
                <div className="bg-white dark:bg-slate-800 rounded-2xl border border-[var(--border-primary)] p-5">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider mb-3">Doctor</p>
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-[var(--color-primary)] text-white flex items-center justify-center font-black">
                      {formData.doctor?.name?.split(' ').map(n=>n[0]).join('').slice(0,2)}
                    </div>
                    <div>
                      <p className="font-black text-slate-900 dark:text-slate-100">{formData.doctor?.name}</p>
                      <p className="text-xs text-slate-500">{formData.doctor?.specialty}</p>
                    </div>
                  </div>
                </div>

                {/* Type */}
                <div className="bg-white dark:bg-slate-800 rounded-2xl border border-[var(--border-primary)] p-5">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider mb-3">Appointment Type</p>
                  <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-black ${formData.appointmentType === 'online' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300' : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300'}`}>
                    {formData.appointmentType === 'online' ? <><Video size={16}/> Online Video Call</> : <><MapPin size={16}/> In-Person Visit</>}
                  </div>
                  {formData.appointmentType === 'in_person' && formData.patientAddress && (
                    <p className="text-xs text-slate-500 mt-2">📍 {formData.patientAddress}, {formData.patientCity}</p>
                  )}
                </div>

                {/* Date & Time */}
                <div className="bg-white dark:bg-slate-800 rounded-2xl border border-[var(--border-primary)] p-5">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider mb-3">Schedule</p>
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2 text-slate-700 dark:text-slate-200 font-bold text-sm">
                      <Calendar size={15} className="text-[var(--color-primary)]" /> {formData.date}
                    </div>
                    <div className="flex items-center gap-2 text-slate-700 dark:text-slate-200 font-bold text-sm">
                      <Clock size={15} className="text-[var(--color-primary)]" /> {formData.time}
                    </div>
                  </div>
                </div>

                {/* Payment */}
                <div className="bg-white dark:bg-slate-800 rounded-2xl border border-[var(--border-primary)] p-5">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider mb-3">Payment</p>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-black text-slate-900 dark:text-slate-100">{consultationFee}</p>
                      <p className="text-xs text-slate-400 capitalize">{formData.paymentMethod?.replace('_', ' ')}</p>
                    </div>
                    {formData.paymentMethod === 'card' && (
                      <p className="text-xs text-slate-400 font-mono">•••• {formData.cardNumber.slice(-4)}</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Reason */}
              <div className="bg-white dark:bg-slate-800 rounded-2xl border border-[var(--border-primary)] p-5">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider mb-2">Reason for Visit</p>
                <p className="text-sm text-slate-700 dark:text-slate-200">{formData.reason}</p>
                {formData.symptoms && <p className="text-xs text-slate-500 mt-1">Symptoms: {formData.symptoms}</p>}
              </div>

              {/* T&C note */}
              <div className="flex items-start gap-3 p-4 bg-amber-50 dark:bg-amber-900/10 rounded-2xl border border-amber-100 dark:border-amber-800">
                <AlertCircle size={16} className="text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
                <p className="text-xs text-amber-700 dark:text-amber-300 leading-relaxed">
                  By confirming, you agree to Bashcare's booking policy. Your appointment will be pending until the doctor approves it. Cancellations must be made at least 24 hours in advance.
                </p>
              </div>

              <button onClick={handleSubmit} disabled={isSubmitting}
                className="w-full py-4 bg-[var(--color-primary)] text-white rounded-2xl font-black hover:opacity-90 transition-all flex items-center justify-center gap-3 text-base shadow-lg shadow-blue-500/20 disabled:opacity-70"
              >
                {isSubmitting ? (
                  <><div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Processing Booking...</>
                ) : (
                  <><CheckCircle2 size={20} /> Confirm Appointment</>
                )}
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default BookAppointment;
