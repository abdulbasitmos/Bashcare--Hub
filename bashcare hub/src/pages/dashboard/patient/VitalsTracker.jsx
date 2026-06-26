import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Activity, 
  Heart, 
  Thermometer, 
  TrendingUp, 
  Plus, 
  ChevronRight, 
  FileText, 
  Calendar,
  Sparkles,
  Info
} from 'lucide-react';
import { db } from '../../../utils/db';

const initialVitals = [
  { date: '2026-06-17', bpm: 72, bpSys: 120, bpDia: 80, spo2: 98, temp: 98.6 },
  { date: '2026-06-18', bpm: 75, bpSys: 122, bpDia: 81, spo2: 99, temp: 98.4 },
  { date: '2026-06-19', bpm: 68, bpSys: 118, bpDia: 79, spo2: 97, temp: 99.1 },
  { date: '2026-06-20', bpm: 82, bpSys: 125, bpDia: 83, spo2: 98, temp: 98.8 },
  { date: '2026-06-21', bpm: 70, bpSys: 119, bpDia: 80, spo2: 99, temp: 98.5 },
  { date: '2026-06-22', bpm: 74, bpSys: 121, bpDia: 80, spo2: 98, temp: 98.6 },
  { date: '2026-06-23', bpm: 73, bpSys: 120, bpDia: 78, spo2: 99, temp: 98.7 }
];

const VitalsTracker = ({ user }) => {
  const [vitalsList, setVitalsList] = useState(initialVitals);
  const [activeTab, setActiveTab] = useState('bpm'); // bpm, bp, spo2, temp
  const [showLogModal, setShowLogModal] = useState(false);
  const [formData, setFormData] = useState({
    bpm: '',
    bpSys: '',
    bpDia: '',
    spo2: '',
    temp: ''
  });

  const [aiReport, setAiReport] = useState(null);
  const [analyzingVitals, setAnalyzingVitals] = useState(false);

  const handleLogSubmit = (e) => {
    e.preventDefault();
    if (!formData.bpm || !formData.bpSys || !formData.bpDia || !formData.spo2 || !formData.temp) return;

    const newRecord = {
      date: new Date().toISOString().split('T')[0],
      bpm: parseInt(formData.bpm),
      bpSys: parseInt(formData.bpSys),
      bpDia: parseInt(formData.bpDia),
      spo2: parseInt(formData.spo2),
      temp: parseFloat(formData.temp)
    };

    setVitalsList([...vitalsList, newRecord]);
    setShowLogModal(false);
    setFormData({ bpm: '', bpSys: '', bpDia: '', spo2: '', temp: '' });
  };

  const getChartDataPoints = () => {
    const list = vitalsList.slice(-7); // Get last 7 readings
    let values = [];
    let min = 0;
    let max = 100;

    if (activeTab === 'bpm') {
      values = list.map(v => v.bpm);
      min = Math.min(...values) - 5;
      max = Math.max(...values) + 5;
    } else if (activeTab === 'bp') {
      values = list.map(v => v.bpSys);
      min = Math.min(...vitalsList.map(v => v.bpDia)) - 5;
      max = Math.max(...vitalsList.map(v => v.bpSys)) + 5;
    } else if (activeTab === 'spo2') {
      values = list.map(v => v.spo2);
      min = 90;
      max = 100;
    } else if (activeTab === 'temp') {
      values = list.map(v => v.temp);
      min = Math.min(...values) - 0.5;
      max = Math.max(...values) + 0.5;
    }

    return { values, min, max, list };
  };

  const { values, min, max, list } = getChartDataPoints();
  const range = max - min || 1;

  // Render line chart SVG coordinates
  const width = 500;
  const height = 150;
  const padding = 20;

  const points = values.map((val, idx) => {
    const x = padding + (idx * (width - padding * 2)) / (values.length - 1);
    const y = height - padding - ((val - min) * (height - padding * 2)) / range;
    return { x, y, value: val, date: list[idx].date };
  });

  const pathD = points.reduce((acc, p, idx) => {
    return idx === 0 ? `M ${p.x} ${p.y}` : `${acc} L ${p.x} ${p.y}`;
  }, '');

  // Render double line path for Blood Pressure (systolic & diastolic)
  const bpPointsDia = activeTab === 'bp' ? list.map((v, idx) => {
    const x = padding + (idx * (width - padding * 2)) / (list.length - 1);
    const y = height - padding - ((v.bpDia - min) * (height - padding * 2)) / range;
    return { x, y, value: v.bpDia };
  }) : [];

  const pathDDia = bpPointsDia.reduce((acc, p, idx) => {
    return idx === 0 ? `M ${p.x} ${p.y}` : `${acc} L ${p.x} ${p.y}`;
  }, '');

  const latest = vitalsList[vitalsList.length - 1];

  const getAnalysisMessage = () => {
    if (latest.bpm > 100) return { text: "Elevated Heart Rate. Limit caffeine and rest.", type: "warning" };
    if (latest.bpSys > 130 || latest.bpDia > 85) return { text: "Prehypertension readings. Monitor intake and reduce salt.", type: "warning" };
    if (latest.spo2 < 95) return { text: "Slightly low oxygen. Deep breathing exercises recommended.", type: "warning" };
    return { text: "All vitals currently sit in healthy reference ranges. Keep up the good work!", type: "success" };
  };

  const analysis = getAnalysisMessage();

  const handleGenerateAIReport = async () => {
    setAnalyzingVitals(true);
    try {
      const data = await db.aiVitalsCheck(vitalsList.slice(-7));
      setAiReport(data);
    } catch (err) {
      console.error("AI vitals report generation failed:", err);
      setAiReport({
        assessment: "Failed to connect to the AI service. However, your local assessment shows that: " + getAnalysisMessage().text,
        riskLevel: latest.bpm > 100 || latest.bpSys > 130 || latest.spo2 < 95 ? "Medium" : "Low",
        wellnessTips: [
          "Ensure you stay fully hydrated by drinking 8+ glasses of water daily.",
          "Keep logging your daily vitals to establish a personal baseline.",
          "Engage in at least 30 minutes of light cardio exercises like walking."
        ]
      });
    } finally {
      setAnalyzingVitals(false);
    }
  };

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      {/* Header section */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900  flex items-center gap-3">
            <Activity className="text-[var(--color-primary)]  animate-pulse" size={32} />
            Interactive Vitals Dashboard
          </h1>
          <p className="text-sm text-slate-500 mt-1 font-medium">
            Monitor, record, and track your cardiorespiratory metrics dynamically.
          </p>
        </div>
        <button
          onClick={() => setShowLogModal(true)}
          className="px-5 py-3.5 bg-[var(--color-primary)] hover:bg-[var(--color-accent)] text-white font-bold text-xs rounded-2xl flex items-center gap-2 active:scale-95 transition-all shadow-md cursor-pointer"
        >
          <Plus size={16} />
          Log New Vitals
        </button>
      </div>

      {/* Grid: 4 Cards showing latest vitals */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Card 1: Heart Rate */}
        <button 
          onClick={() => setActiveTab('bpm')}
          className={`p-6 rounded-[24px] border transition-all duration-300 flex flex-col justify-between text-left relative overflow-hidden group cursor-pointer ${
            activeTab === 'bpm' 
              ? 'bg-[var(--color-primary)] text-white border-[var(--color-primary)] shadow-lg shadow-teal-900/10' 
              : 'bg-[var(--bg-secondary)]  text-slate-900  border-[var(--border-primary)]  hover:border-[var(--color-accent)] shadow-sm hover:shadow-md transition-shadow fade-in hover:shadow-md transition-all duration-300'
          }`}
        >
          <div className="flex justify-between items-start mb-4">
            <div className={`p-3 rounded-2xl ${activeTab === 'bpm' ? 'bg-white/10' : 'bg-red-50 '} text-[#EF4444]`}>
              <Heart size={20} className={latest.bpm > 80 ? "animate-pulse" : ""} />
            </div>
            <span className={`text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full ${activeTab === 'bpm' ? 'bg-white/10 text-white' : 'bg-white  text-slate-500'}`}>
              bpm
            </span>
          </div>
          <div>
            <p className="text-3xl font-black">{latest.bpm}</p>
            <p className={`text-xs font-bold mt-1 uppercase tracking-wider ${activeTab === 'bpm' ? 'text-white/80' : 'text-slate-500'}`}>Heart Rate</p>
          </div>
        </button>

        {/* Card 2: Blood Pressure */}
        <button 
          onClick={() => setActiveTab('bp')}
          className={`p-6 rounded-[24px] border transition-all duration-300 flex flex-col justify-between text-left relative overflow-hidden group cursor-pointer ${
            activeTab === 'bp' 
              ? 'bg-[var(--color-primary)] text-white border-[var(--color-primary)] shadow-lg shadow-teal-900/10' 
              : 'bg-[var(--bg-secondary)]  text-slate-900  border-[var(--border-primary)]  hover:border-[var(--color-accent)] shadow-sm hover:shadow-md transition-shadow fade-in hover:shadow-md transition-all duration-300'
          }`}
        >
          <div className="flex justify-between items-start mb-4">
            <div className={`p-3 rounded-2xl ${activeTab === 'bp' ? 'bg-white/10' : 'bg-blue-50/50 '} text-blue-500`}>
              <Activity size={20} />
            </div>
            <span className={`text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full ${activeTab === 'bp' ? 'bg-white/10 text-white' : 'bg-white  text-slate-500'}`}>
              mmHg
            </span>
          </div>
          <div>
            <p className="text-3xl font-black">{latest.bpSys}/{latest.bpDia}</p>
            <p className={`text-xs font-bold mt-1 uppercase tracking-wider ${activeTab === 'bp' ? 'text-white/80' : 'text-slate-500'}`}>Blood Pressure</p>
          </div>
        </button>

        {/* Card 3: Oxygen Saturation */}
        <button 
          onClick={() => setActiveTab('spo2')}
          className={`p-6 rounded-[24px] border transition-all duration-300 flex flex-col justify-between text-left relative overflow-hidden group cursor-pointer ${
            activeTab === 'spo2' 
              ? 'bg-[var(--color-primary)] text-white border-[var(--color-primary)] shadow-lg shadow-teal-900/10' 
              : 'bg-[var(--bg-secondary)]  text-slate-900  border-[var(--border-primary)]  hover:border-[var(--color-accent)] shadow-sm hover:shadow-md transition-shadow fade-in hover:shadow-md transition-all duration-300'
          }`}
        >
          <div className="flex justify-between items-start mb-4">
            <div className={`p-3 rounded-2xl ${activeTab === 'spo2' ? 'bg-white/10' : 'bg-teal-50 '} text-teal-500`}>
              <Activity size={20} /> {/* SpO2 representation */}
            </div>
            <span className={`text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full ${activeTab === 'spo2' ? 'bg-white/10 text-white' : 'bg-white  text-slate-500'}`}>
              %
            </span>
          </div>
          <div>
            <p className="text-3xl font-black">{latest.spo2}%</p>
            <p className={`text-xs font-bold mt-1 uppercase tracking-wider ${activeTab === 'spo2' ? 'text-white/80' : 'text-slate-500'}`}>Blood Oxygen</p>
          </div>
        </button>

        {/* Card 4: Temperature */}
        <button 
          onClick={() => setActiveTab('temp')}
          className={`p-6 rounded-[24px] border transition-all duration-300 flex flex-col justify-between text-left relative overflow-hidden group cursor-pointer ${
            activeTab === 'temp' 
              ? 'bg-[var(--color-primary)] text-white border-[var(--color-primary)] shadow-lg shadow-teal-900/10' 
              : 'bg-[var(--bg-secondary)]  text-slate-900  border-[var(--border-primary)]  hover:border-[var(--color-accent)] shadow-sm hover:shadow-md transition-shadow fade-in hover:shadow-md transition-all duration-300'
          }`}
        >
          <div className="flex justify-between items-start mb-4">
            <div className={`p-3 rounded-2xl ${activeTab === 'temp' ? 'bg-white/10' : 'bg-orange-50 '} text-orange-500`}>
              <Thermometer size={20} />
            </div>
            <span className={`text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full ${activeTab === 'temp' ? 'bg-white/10 text-white' : 'bg-white  text-slate-500'}`}>
              °F
            </span>
          </div>
          <div>
            <p className="text-3xl font-black">{latest.temp}°F</p>
            <p className={`text-xs font-bold mt-1 uppercase tracking-wider ${activeTab === 'temp' ? 'text-white/80' : 'text-slate-500'}`}>Body Temp</p>
          </div>
        </button>
      </div>

      {/* Main Graph Card */}
      <div className="bg-[var(--bg-secondary)]  border border-[var(--border-primary)]  rounded-[24px] p-8 shadow-sm hover:shadow-md transition-shadow fade-in hover:shadow-md transition-all duration-300">
        <div className="flex justify-between items-center mb-8 flex-wrap gap-4">
          <div>
            <h3 className="text-lg font-black text-slate-900  flex items-center gap-2">
              <TrendingUp size={20} className="text-[var(--color-primary)] " />
              7-Day Metric Trends
            </h3>
            <p className="text-xs text-slate-500 mt-0.5 font-bold uppercase tracking-wider">
              Showing active chart for: <span className="text-[var(--color-primary)] ">{activeTab === 'bpm' ? 'Heart Rate' : activeTab === 'bp' ? 'Blood Pressure' : activeTab === 'spo2' ? 'Blood Oxygen' : 'Body Temperature'}</span>
            </p>
          </div>
        </div>

        {/* Line Chart SVG */}
        <div className="w-full h-48 bg-white  rounded-[24px] border border-slate-100  relative flex items-center justify-center p-4">
          <svg className="w-full h-full" viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none">
            {/* Grid lines */}
            <line x1={padding} y1={height/2} x2={width-padding} y2={height/2} stroke="#e2e8f0" strokeDasharray="3 3" className="" />
            
            {/* Primary line path */}
            <motion.path 
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 1 }}
              d={pathD} 
              fill="none" 
              stroke="url(#chart-grad)" 
              strokeWidth="4" 
              strokeLinecap="round"
            />

            {/* Diastolic line path (only for blood pressure) */}
            {activeTab === 'bp' && (
              <motion.path 
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 1 }}
                d={pathDDia} 
                fill="none" 
                stroke="#60a5fa" 
                strokeWidth="4" 
                strokeLinecap="round"
              />
            )}

            {/* Glowing dots */}
            {points.map((p, idx) => (
              <g key={idx}>
                <circle cx={p.x} cy={p.y} r="5" className="fill-teal-400 stroke-2 stroke-white  shadow-md" />
                {activeTab === 'bp' && bpPointsDia[idx] && (
                  <circle cx={p.x} cy={bpPointsDia[idx].y} r="5" className="fill-blue-400 stroke-2 stroke-white  shadow-md" />
                )}
              </g>
            ))}

            {/* Gradients */}
            <defs>
              <linearGradient id="chart-grad" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="#2dd4bf" />
                <stop offset="100%" stopColor="#3b82f6" />
              </linearGradient>
            </defs>
          </svg>

          {/* SVG coordinate values (Overlay labels on hover) */}
          <div className="absolute inset-x-0 bottom-2 px-6 flex justify-between text-[9px] font-bold text-slate-500">
            {list.map((v, i) => (
              <span key={i}>{v.date.slice(5)}</span>
            ))}
          </div>
        </div>
      </div>

      {/* AI Analysis and Recent Records Table */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* AI Health Summary */}
        <div className="lg:col-span-1 bg-gradient-to-r from-blue-900/5 via-teal-900/5 to-emerald-900/5   p-8 rounded-[24px] border border-blue-500/10  shadow-sm hover:shadow-md transition-shadow fade-in hover:shadow-md transition-all duration-300 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2.5">
                <Sparkles className="text-teal-500 animate-pulse" size={22} />
                <h4 className="text-xs font-black text-slate-900  uppercase tracking-widest">AI Clinical Review</h4>
              </div>
              {aiReport && (
                <span className={`text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full ${
                  aiReport.riskLevel === 'High' 
                    ? 'bg-red-500/10 text-red-600 border border-red-500/20' 
                    : aiReport.riskLevel === 'Medium' 
                      ? 'bg-amber-500/10 text-amber-600 border border-amber-500/20' 
                      : 'bg-teal-500/10 text-teal-600 border border-teal-500/20'
                }`}>
                  {aiReport.riskLevel} Risk
                </span>
              )}
            </div>
            
            <div className="space-y-4">
              {!aiReport ? (
                <div className="space-y-4">
                  <div className={`p-4 rounded-2xl border text-xs font-semibold flex items-start gap-3 ${
                    analysis.type === 'warning' 
                      ? 'bg-[#F59E0B]/10 border-amber-500/30 text-amber-800 ' 
                      : 'bg-teal-500/10 border-teal-500/30 text-teal-800 '
                  }`}>
                    <Info size={18} className="mt-0.5 flex-shrink-0" />
                    <p className="leading-relaxed">{analysis.text}</p>
                  </div>
                  <p className="text-xs leading-relaxed text-slate-500 font-medium">
                    Vitals logging helps doctors track physiological adjustments over time. Generate a Gemini-powered assessment to receive customized wellness guidance.
                  </p>
                  <button
                    onClick={handleGenerateAIReport}
                    disabled={analyzingVitals}
                    className="w-full py-3.5 bg-[var(--color-primary)] hover:bg-[var(--color-accent)] text-white font-bold text-xs rounded-2xl flex items-center justify-center gap-2 transition-all shadow-md cursor-pointer disabled:opacity-50"
                  >
                    {analyzingVitals ? (
                      <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <Sparkles size={14} />
                    )}
                    Generate AI Health Report
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="p-4 bg-white dark:bg-slate-900 rounded-2xl border border-[var(--border-primary)] text-xs font-semibold text-slate-700 leading-relaxed shadow-sm">
                    {aiReport.assessment}
                  </div>
                  
                  <div className="space-y-2">
                    <h5 className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Personalized Wellness Advice</h5>
                    {aiReport.wellnessTips.map((tip, idx) => (
                      <div key={idx} className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-100 flex items-start gap-2.5">
                        <span className="w-4 h-4 rounded-full bg-teal-500/10 text-teal-600 flex items-center justify-center text-[10px] font-bold flex-shrink-0 mt-0.5">
                          {idx + 1}
                        </span>
                        <span className="text-[11px] font-medium text-slate-700 leading-normal">{tip}</span>
                      </div>
                    ))}
                  </div>

                  <button
                    onClick={handleGenerateAIReport}
                    disabled={analyzingVitals}
                    className="w-full py-2.5 bg-slate-100 dark:bg-slate-800 hover:opacity-95 text-slate-700 dark:text-slate-300 font-bold text-[10px] uppercase tracking-wider rounded-xl flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                  >
                    <Sparkles size={12} />
                    Update Report
                  </button>
                </div>
              )}
            </div>
          </div>

          <div className="pt-6 border-t border-slate-100  mt-6">
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">
              {aiReport ? "Analyzed by AI Assistant" : "Last Evaluated Today"}
            </p>
          </div>
        </div>

        {/* History Table */}
        <div className="lg:col-span-2 bg-[var(--bg-secondary)]  border border-[var(--border-primary)]  rounded-[24px] p-8 shadow-sm hover:shadow-md transition-shadow fade-in hover:shadow-md transition-all duration-300">
          <div className="flex justify-between items-center mb-6">
            <h4 className="text-xs font-black text-slate-900  uppercase tracking-widest flex items-center gap-2">
              <FileText size={16} className="text-slate-400" />
              Logged History
            </h4>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-100  text-slate-500 font-black uppercase tracking-wider">
                  <th className="py-3 px-2">Date</th>
                  <th className="py-3 px-2">Heart Rate</th>
                  <th className="py-3 px-2">BP (mmHg)</th>
                  <th className="py-3 px-2">Blood Oxygen</th>
                  <th className="py-3 px-2">Body Temp</th>
                </tr>
              </thead>
              <tbody>
                {vitalsList.slice(-5).reverse().map((record, i) => (
                  <tr key={i} className="border-b border-slate-50  hover:bg-white dark:bg-slate-900/30 transition-colors font-medium">
                    <td className="py-3.5 px-2 flex items-center gap-1.5 text-slate-400">
                      <Calendar size={13} />
                      {record.date}
                    </td>
                    <td className="py-3.5 px-2">{record.bpm} BPM</td>
                    <td className="py-3.5 px-2">{record.bpSys}/{record.bpDia}</td>
                    <td className="py-3.5 px-2">{record.spo2}%</td>
                    <td className="py-3.5 px-2">{record.temp}°F</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Log Vitals Modal Popup */}
      <AnimatePresence>
        {showLogModal && (
          <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-[var(--bg-secondary)]  rounded-[24px] p-8 border border-[var(--border-primary)]  w-full max-w-md shadow-2xl relative"
            >
              <h3 className="text-xl font-black text-slate-900  mb-6 flex items-center gap-2">
                <Plus size={20} className="text-teal-500" />
                Log Daily Vitals
              </h3>

              <form onSubmit={handleLogSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] font-black uppercase tracking-wider text-slate-500 mb-1 block">Heart Rate (BPM)</label>
                    <input 
                      type="number" 
                      placeholder="e.g. 72" 
                      value={formData.bpm}
                      onChange={(e) => setFormData({ ...formData, bpm: e.target.value })}
                      className="w-full p-3.5 text-xs font-semibold rounded-2xl bg-white  border border-slate-200  focus:outline-none focus:ring-2 focus:ring-teal-500"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-black uppercase tracking-wider text-slate-500 mb-1 block">Oxygen SpO2 (%)</label>
                    <input 
                      type="number" 
                      placeholder="e.g. 98" 
                      value={formData.spo2}
                      onChange={(e) => setFormData({ ...formData, spo2: e.target.value })}
                      className="w-full p-3.5 text-xs font-semibold rounded-2xl bg-white  border border-slate-200  focus:outline-none focus:ring-2 focus:ring-teal-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] font-black uppercase tracking-wider text-slate-500 mb-1 block">BP Systolic</label>
                    <input 
                      type="number" 
                      placeholder="e.g. 120" 
                      value={formData.bpSys}
                      onChange={(e) => setFormData({ ...formData, bpSys: e.target.value })}
                      className="w-full p-3.5 text-xs font-semibold rounded-2xl bg-white  border border-slate-200  focus:outline-none focus:ring-2 focus:ring-teal-500"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-black uppercase tracking-wider text-slate-500 mb-1 block">BP Diastolic</label>
                    <input 
                      type="number" 
                      placeholder="e.g. 80" 
                      value={formData.bpDia}
                      onChange={(e) => setFormData({ ...formData, bpDia: e.target.value })}
                      className="w-full p-3.5 text-xs font-semibold rounded-2xl bg-white  border border-slate-200  focus:outline-none focus:ring-2 focus:ring-teal-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[10px] font-black uppercase tracking-wider text-slate-500 mb-1 block">Body Temp (°F)</label>
                  <input 
                    type="number" 
                    step="0.1" 
                    placeholder="e.g. 98.6" 
                    value={formData.temp}
                    onChange={(e) => setFormData({ ...formData, temp: e.target.value })}
                    className="w-full p-3.5 text-xs font-semibold rounded-2xl bg-white  border border-slate-200  focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                </div>

                <div className="flex gap-3 justify-end pt-4 border-t border-slate-100 ">
                  <button 
                    type="button"
                    onClick={() => setShowLogModal(false)}
                    className="px-5 py-3 rounded-2xl font-bold text-xs text-slate-500 hover:bg-white dark:bg-slate-900 cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit"
                    className="px-5 py-3 bg-[var(--color-primary)] text-white font-bold text-xs rounded-2xl hover:bg-[var(--color-accent)] active:scale-95 transition-all shadow-md cursor-pointer"
                  >
                    Submit Logs
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

export default VitalsTracker;
