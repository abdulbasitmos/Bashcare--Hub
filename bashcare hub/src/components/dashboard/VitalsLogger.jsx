import { useState, useEffect } from 'react';
import { Heart, Thermometer, Activity, Droplet, PlusCircle, CheckCircle2, TrendingUp } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const VitalsLogger = ({ user }) => {
  const [vitalsList, setVitalsList] = useState([]);
  const [systolic, setSystolic] = useState(120);
  const [diastolic, setDiastolic] = useState(80);
  const [heartRate, setHeartRate] = useState(72);
  const [temperature, setTemperature] = useState(98.6);
  const [sugar, setSugar] = useState(90);
  const [selectedSymptom, setSelectedSymptom] = useState('None');
  const [symptomSeverity, setSymptomSeverity] = useState(1);
  const [showLoggedSuccess, setShowLoggedSuccess] = useState(false);

  // Load past vitals from localStorage
  useEffect(() => {
    const storageKey = `vitals_${user?.id || 'guest'}`;
    const stored = localStorage.getItem(storageKey);
    if (stored) {
      try {
        setVitalsList(JSON.parse(stored));
      } catch (e) {
        console.error(e);
      }
    } else {
      // Default dummy data for initial stunning look
      const defaults = [
        { id: 1, date: '10 mins ago', bp: '118/79', hr: 70, temp: 98.4, sugar: 88, symptom: 'None', severity: 0 },
        { id: 2, date: 'Yesterday', bp: '122/81', hr: 75, temp: 99.1, sugar: 95, symptom: 'Fatigue', severity: 3 },
        { id: 3, date: '3 days ago', bp: '120/80', hr: 72, temp: 98.6, sugar: 92, symptom: 'None', severity: 0 }
      ];
      setVitalsList(defaults);
      localStorage.setItem(storageKey, JSON.stringify(defaults));
    }
  }, [user?.id]);

  const handleLogVitals = (e) => {
    e.preventDefault();
    const newEntry = {
      id: Date.now(),
      date: 'Just now',
      bp: `${systolic}/${diastolic}`,
      hr: Number(heartRate),
      temp: Number(temperature),
      sugar: Number(sugar),
      symptom: selectedSymptom,
      severity: selectedSymptom === 'None' ? 0 : Number(symptomSeverity)
    };

    const updated = [newEntry, ...vitalsList];
    setVitalsList(updated);
    localStorage.setItem(`vitals_${user?.id || 'guest'}`, JSON.stringify(updated));

    setShowLoggedSuccess(true);
    setTimeout(() => setShowLoggedSuccess(false), 3000);
  };

  return (
    <div className="bg-white  p-8 rounded-[24px] shadow-sm hover:shadow-md transition-shadow fade-in hover:shadow-md transition-all duration-300 border border-gray-200  transition-all space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-900  flex items-center gap-2">
            <Activity className="text-[#EF4444] animate-pulse" size={22} /> Daily Vitals & Symptoms
          </h2>
          <p className="text-xs text-slate-500  mt-1">Track and log your key health metrics daily.</p>
        </div>
      </div>

      <AnimatePresence>
        {showLoggedSuccess && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-green-50  text-green-600  p-3 rounded-xl flex items-center gap-2 font-bold text-xs border border-green-100 "
          >
            <CheckCircle2 size={16} />
            Vitals logged successfully! Your doctor can view these updates.
          </motion.div>
        )}
      </AnimatePresence>

      <form onSubmit={handleLogVitals} className="space-y-4">
        {/* Form Inputs Grid */}
        <div className="grid grid-cols-2 gap-4">
          {/* BP */}
          <div className="p-4 bg-white  rounded-2xl border border-slate-100 ">
            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-2">Blood Pressure</label>
            <div className="flex items-center gap-2">
              <input 
                type="number" 
                value={systolic} 
                onChange={(e) => setSystolic(e.target.value)} 
                className="w-12 bg-transparent text-sm font-bold focus:ring-0 outline-none text-slate-900 "
                placeholder="Sys" 
              />
              <span className="text-gray-300">/</span>
              <input 
                type="number" 
                value={diastolic} 
                onChange={(e) => setDiastolic(e.target.value)} 
                className="w-12 bg-transparent text-sm font-bold focus:ring-0 outline-none text-slate-900 "
                placeholder="Dia" 
              />
              <span className="text-[10px] text-gray-400 font-bold ml-auto">mmHg</span>
            </div>
          </div>

          {/* Heart Rate */}
          <div className="p-4 bg-white  rounded-2xl border border-slate-100 ">
            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-2 flex items-center gap-1">
              <Heart size={10} className="text-[#EF4444]" /> Heart Rate
            </label>
            <div className="flex items-center justify-between">
              <input 
                type="number" 
                value={heartRate} 
                onChange={(e) => setHeartRate(e.target.value)} 
                className="w-16 bg-transparent text-sm font-bold focus:ring-0 outline-none text-slate-900 " 
              />
              <span className="text-[10px] text-gray-400 font-bold">bpm</span>
            </div>
          </div>

          {/* Temperature */}
          <div className="p-4 bg-white  rounded-2xl border border-slate-100 ">
            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-2 flex items-center gap-1">
              <Thermometer size={10} className="text-orange-500" /> Temperature
            </label>
            <div className="flex items-center justify-between">
              <input 
                type="number" 
                step="0.1" 
                value={temperature} 
                onChange={(e) => setTemperature(e.target.value)} 
                className="w-16 bg-transparent text-sm font-bold focus:ring-0 outline-none text-slate-900 " 
              />
              <span className="text-[10px] text-gray-400 font-bold">°F</span>
            </div>
          </div>

          {/* Blood Sugar */}
          <div className="p-4 bg-white  rounded-2xl border border-slate-100 ">
            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-2 flex items-center gap-1">
              <Droplet size={10} className="text-teal-500" /> Blood Sugar
            </label>
            <div className="flex items-center justify-between">
              <input 
                type="number" 
                value={sugar} 
                onChange={(e) => setSugar(e.target.value)} 
                className="w-16 bg-transparent text-sm font-bold focus:ring-0 outline-none text-slate-900 " 
              />
              <span className="text-[10px] text-gray-400 font-bold">mg/dL</span>
            </div>
          </div>
        </div>

        {/* Symptoms Tracker */}
        <div className="p-4 bg-white  rounded-2xl border border-slate-100  space-y-3">
          <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block">Active Symptoms</label>
          <div className="grid grid-cols-3 gap-2">
            {['None', 'Headache', 'Cough', 'Fatigue', 'Fever', 'Pain'].map((sym) => (
              <button
                type="button"
                key={sym}
                onClick={() => setSelectedSymptom(sym)}
                className={`py-1.5 px-2 rounded-xl text-xs font-bold transition-all border ${
                  selectedSymptom === sym
                    ? 'bg-[#2563EB] border-blue-600 text-white shadow-sm hover:shadow-md transition-shadow fade-in hover:shadow-md transition-all duration-300'
                    : 'bg-white  border-slate-200  text-slate-600  hover:bg-white'
                }`}
              >
                {sym}
              </button>
            ))}
          </div>
          {selectedSymptom !== 'None' && (
            <div className="pt-2 space-y-1">
              <div className="flex justify-between text-[10px] font-bold text-gray-400">
                <span>Severity Scale</span>
                <span className="text-[#2563EB] ">{symptomSeverity}/10</span>
              </div>
              <input 
                type="range" 
                min="1" 
                max="10" 
                value={symptomSeverity} 
                onChange={(e) => setSymptomSeverity(e.target.value)}
                className="w-full accent-blue-600"
              />
            </div>
          )}
        </div>

        <button
          type="submit"
          className="w-full py-4 bg-[#2563EB] text-white rounded-2xl text-sm font-bold hover:bg-blue-700 transition-all flex items-center justify-center gap-2 active:scale-95 shadow-md shadow-blue-600/20"
        >
          <PlusCircle size={16} /> Log Today's Metrics
        </button>
      </form>

      {/* Log History */}
      <div className="space-y-3 pt-4 border-t border-slate-100 ">
        <h4 className="text-xs font-bold text-slate-900  flex items-center gap-1.5">
          <TrendingUp size={14} className="text-[#22C55E]" /> Recent Vitals History
        </h4>
        <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
          {vitalsList.map((log) => (
            <div 
              key={log.id} 
              className="p-3 bg-white  rounded-xl flex items-center justify-between text-xs border border-slate-100 "
            >
              <div>
                <p className="font-bold text-slate-900 ">BP: {log.bp} | HR: {log.hr} bpm</p>
                <p className="text-[10px] text-gray-400 mt-0.5">{log.date} {log.symptom !== 'None' && `• Sym: ${log.symptom} (${log.severity}/10)`}</p>
              </div>
              <div className="text-right">
                <span className="font-bold text-orange-500">{log.temp}°F</span>
                <span className="block text-[10px] text-teal-500 font-bold">{log.sugar} mg/dL</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default VitalsLogger;
