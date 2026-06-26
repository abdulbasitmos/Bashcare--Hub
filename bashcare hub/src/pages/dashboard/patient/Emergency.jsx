import { useState, useEffect } from 'react';
import { 
  Phone, 
  MapPin, 
  AlertOctagon, 
  ShieldAlert, 
  Loader2, 
  CheckCircle, 
  ChevronRight,
  Stethoscope
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { db } from '../../../utils/db';

const Emergency = ({ user }) => {
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [alerting, setAlerting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  
  // Form fields
  const [contactNumber, setContactNumber] = useState(user?.phone || '');
  const [message, setMessage] = useState('');
  const [locationCoords, setLocationCoords] = useState(null);
  const [gettingLocation, setGettingLocation] = useState(false);

  // Fetch doctors on mount
  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        const all = await db.getDoctors();
        // Filter only active/verified doctors
        const active = all.filter(d => d.status === 'verified' || d.status === 'active');
        setDoctors(active);
      } catch (err) {
        console.error('Error fetching doctors:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchDoctors();
  }, []);

  // Get current GPS location
  const handleGetLocation = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser.');
      return;
    }
    setGettingLocation(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLocationCoords({
          lat: position.coords.latitude,
          lng: position.coords.longitude
        });
        setGettingLocation(false);
      },
      (error) => {
        console.error('Error getting location:', error);
        alert('Could not retrieve your location. Please check your browser permissions.');
        setGettingLocation(false);
      }
    );
  };

  // Submit emergency alert
  const handleTriggerEmergency = async (e) => {
    e.preventDefault();
    setAlerting(true);
    setErrorMessage('');
    
    try {
      const payload = {
        message: message || 'Urgent emergency help requested by patient.',
        contactNumber,
        latitude: locationCoords ? locationCoords.lat : null,
        longitude: locationCoords ? locationCoords.lng : null
      };

      await db.triggerEmergency(payload);
      setSuccess(true);
      
      // Auto notification for patient
      await db.addNotification({
        userId: user.id,
        title: '🚨 Emergency Alert Active',
        message: 'Your emergency dispatch alert has been successfully broadcast to all available doctors on shift.',
        type: 'system'
      });

    } catch (err) {
      console.error('Failed to trigger emergency:', err);
      setErrorMessage(err.message || 'Failed to dispatch emergency alert. Please call a doctor directly below.');
    } finally {
      setAlerting(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      {/* Top Banner Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-red-500/10 dark:bg-red-950/20 border border-red-500/20 rounded-[2.5rem] p-6 sm:p-8">
        <div className="flex gap-4 items-start">
          <div className="p-4 bg-red-500 text-white rounded-3xl animate-pulse shadow-lg shadow-red-500/30">
            <AlertOctagon size={32} />
          </div>
          <div>
            <h1 className="text-2xl font-black text-red-600 dark:text-red-400">Emergency Response Portal</h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 max-w-xl">
              Instantly broadcast your health state, phone number, and optional GPS location directly to all verified medical staff on duty.
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Hand Form: Alert Dispatch */}
        <div className="lg:col-span-7 bg-[var(--bg-secondary)] border border-[var(--border-primary)] rounded-[3rem] p-6 sm:p-8 shadow-sm">
          <h2 className="text-xl font-black text-[var(--text-primary)] mb-6 flex items-center gap-2">
            <ShieldAlert className="text-red-500" /> Dispatch Emergency Broadcast
          </h2>

          {success ? (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-500/20 rounded-3xl p-6 text-center"
            >
              <div className="w-16 h-16 bg-emerald-500 text-white rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-emerald-500/30">
                <CheckCircle size={32} />
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">Broadcast Dispatched Successfully!</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">
                All active doctors have received high-priority in-app alerts and emergency emails. Please keep your phone close as a doctor will contact you shortly.
              </p>
              <button 
                onClick={() => {
                  setSuccess(false);
                  setMessage('');
                }}
                className="mt-6 px-6 py-2.5 bg-[var(--color-primary)] text-white rounded-2xl text-sm font-bold hover:opacity-90 transition-all"
              >
                Send Another Update
              </button>
            </motion.div>
          ) : (
            <form onSubmit={handleTriggerEmergency} className="space-y-6">
              {/* Phone number */}
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Emergency Callback Phone Number</label>
                <div className="relative">
                  <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  <input
                    type="tel"
                    required
                    placeholder="Enter your phone number..."
                    value={contactNumber}
                    onChange={(e) => setContactNumber(e.target.value)}
                    className="w-full pl-12 pr-4 py-3.5 rounded-2xl bg-[var(--bg-primary)] text-[var(--text-primary)] text-sm font-bold border border-[var(--border-primary)] focus:outline-none focus:ring-2 focus:ring-red-500 transition-all"
                  />
                </div>
              </div>

              {/* Symptoms / Notes */}
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Symptoms or Medical Condition</label>
                <textarea
                  rows={4}
                  placeholder="Describe your current symptoms or emergency details (e.g., chest pain, severe asthma, dizziness)..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="w-full p-4 rounded-2xl bg-[var(--bg-primary)] text-[var(--text-primary)] text-sm font-semibold border border-[var(--border-primary)] focus:outline-none focus:ring-2 focus:ring-red-500 transition-all"
                />
              </div>

              {/* Geolocation option */}
              <div className="bg-[var(--bg-primary)] rounded-3xl p-4 border border-[var(--border-primary)] flex items-center justify-between flex-wrap gap-4">
                <div className="flex items-center gap-3">
                  <MapPin className={locationCoords ? "text-emerald-500" : "text-slate-400"} />
                  <div>
                    <p className="text-sm font-bold text-[var(--text-primary)]">Share Geolocation Coordinates</p>
                    <p className="text-xs text-slate-500">
                      {locationCoords 
                        ? `GPS Lat: ${locationCoords.lat.toFixed(5)}, Lng: ${locationCoords.lng.toFixed(5)}` 
                        : 'Permit GPS helper for faster hospital navigation.'
                      }
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleGetLocation}
                  disabled={gettingLocation}
                  className="px-4 py-2 border-2 border-[var(--color-primary)] text-[var(--color-primary)] text-xs font-bold rounded-xl hover:bg-[var(--color-primary)] hover:text-white transition-all disabled:opacity-50"
                >
                  {gettingLocation ? (
                    <span className="flex items-center gap-1"><Loader2 className="w-3.5 h-3.5 animate-spin" /> Locating...</span>
                  ) : locationCoords ? 'Update Location' : 'Fetch Location'}
                </button>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={alerting}
                className="w-full py-4 bg-red-600 hover:bg-red-700 active:scale-[0.98] text-white rounded-3xl font-black text-base shadow-lg shadow-red-500/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {alerting ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Broadcasting Emergency Alert...
                  </>
                ) : (
                  <>
                    <AlertOctagon size={20} />
                    TRIGGER EMERGENCY ALERTS
                  </>
                )}
              </button>

              {errorMessage && (
                <p className="text-sm text-red-500 font-bold text-center mt-3">{errorMessage}</p>
              )}
            </form>
          )}
        </div>

        {/* Right Hand List: Available Doctor Contact Numbers */}
        <div className="lg:col-span-5 flex flex-col gap-6">
          <div className="bg-[var(--bg-secondary)] border border-[var(--border-primary)] rounded-[3rem] p-6 sm:p-8 shadow-sm flex-grow">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-black text-[var(--text-primary)] flex items-center gap-2">
                  <Stethoscope className="text-[var(--color-primary)]" /> Duty Doctors
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">Call our available staff directly for instant support</p>
              </div>
              <span className="px-2.5 py-1 bg-green-500/10 text-green-600 rounded-full text-xs font-black animate-pulse">
                Active
              </span>
            </div>

            {loading ? (
              <div className="py-20 text-center">
                <Loader2 className="w-8 h-8 text-[var(--color-primary)] animate-spin mx-auto mb-2" />
                <p className="text-xs text-slate-400 font-bold">Loading duty list...</p>
              </div>
            ) : doctors.length === 0 ? (
              <div className="py-12 text-center text-slate-400">
                <p className="text-sm font-bold">No active doctors on duty right now.</p>
                <p className="text-xs mt-1">Please call standard emergency services or 919/911.</p>
              </div>
            ) : (
              <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2 scrollbar-thin">
                {doctors.map((doc) => {
                  const initials = doc.name?.split(' ').map(n => n[0]).join('') || '?';
                  const docPhone = doc.userId?.phone || doc.phone || '+234 812 345 6789';
                  
                  return (
                    <div 
                      key={doc.id} 
                      className="bg-[var(--bg-primary)] p-4 rounded-3xl border border-[var(--border-primary)] flex items-center justify-between gap-4 hover:border-red-500/30 transition-colors"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-12 h-12 rounded-2xl bg-blue-100 dark:bg-slate-800 flex items-center justify-center text-[var(--color-primary)] dark:text-blue-300 text-lg font-black shrink-0 overflow-hidden">
                          {doc.profilePicture ? (
                            <img src={doc.profilePicture} alt={doc.name} className="w-full h-full object-cover" />
                          ) : initials}
                        </div>
                        <div className="min-w-0">
                          <h4 className="text-sm font-black text-[var(--text-primary)] truncate">{doc.name}</h4>
                          <p className="text-xs text-[var(--color-primary)] font-bold truncate">{doc.specialty}</p>
                          <p className="text-[10px] text-slate-400 truncate mt-0.5">{docPhone}</p>
                        </div>
                      </div>

                      <a 
                        href={`tel:${docPhone.replace(/\s+/g, '')}`}
                        className="p-3 bg-green-500 hover:bg-green-600 text-white rounded-2xl shadow-md transition-colors shrink-0"
                        title="Call Doctor Now"
                      >
                        <Phone size={16} />
                      </a>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};

export default Emergency;
