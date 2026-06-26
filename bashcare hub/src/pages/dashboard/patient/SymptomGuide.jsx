import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { db } from '../../../utils/db';
import { 
  Stethoscope, 
  Brain, 
  Heart, 
  Activity, 
  ChevronRight, 
  AlertCircle,
  HelpCircle,
  Sparkles,
  Search
} from 'lucide-react';

const bodyRegions = [
  {
    id: 'brain',
    name: 'Head & Nervous System',
    specialty: 'Neurology',
    icon: <Brain className="w-6 h-6" />,
    color: 'from-blue-500 to-indigo-600',
    hoverCoords: { x: 50, y: 15 }, // Percent coordinates on SVG body
    symptoms: [
      'Chronic or severe headaches & migraines',
      'Frequent dizziness, vertigo, or loss of balance',
      'Numbness, tingling, or weakness in limbs',
      'Memory difficulties or cognitive changes',
      'Unexplained tremors or coordination issues'
    ],
    description: 'Neurologists diagnose and treat disorders of the brain, spinal cord, nerves, and muscles, ensuring healthy cognitive and motor function.'
  },
  {
    id: 'heart',
    name: 'Chest & Cardiovascular',
    specialty: 'Cardiology',
    icon: <Heart className="w-6 h-6" />,
    color: 'from-red-500 to-rose-600',
    hoverCoords: { x: 50, y: 33 },
    symptoms: [
      'Chest pain, pressure, or tightness',
      'Shortness of breath during minor exertion',
      'Fluttering heartbeats or palpitations',
      'Chronic high blood pressure levels',
      'Dizziness or fainting spells'
    ],
    description: 'Cardiologists focus on heart health, coronary arteries, blood vessel circulation, and preventing cardiovascular diseases.'
  },
  {
    id: 'digestive',
    name: 'Abdomen & Digestive Track',
    specialty: 'Gastroenterology',
    icon: <Activity className="w-6 h-6" />,
    color: 'from-emerald-500 to-teal-600',
    hoverCoords: { x: 50, y: 48 },
    symptoms: [
      'Chronic abdominal pain or cramping',
      'Persistent heartburn, acid reflux, or difficulty swallowing',
      'Severe or ongoing changes in digestion',
      'Frequent nausea or unexplained vomiting',
      'Sudden unexplained weight loss'
    ],
    description: 'Gastroenterologists specialize in the digestive system, liver, gallbladder, and pancreas, optimizing gut health and digestion.'
  },
  {
    id: 'joints',
    name: 'Bones, Joints & Muscles',
    specialty: 'Orthopedics',
    icon: <Activity className="w-6 h-6" />, // Bone placeholder
    color: 'from-cyan-500 to-blue-600',
    hoverCoords: { x: 28, y: 55 },
    symptoms: [
      'Severe joint stiffness or swelling',
      'Persistent back, neck, or shoulder pain',
      'Difficulty walking or reduced range of motion',
      'Fracture, sprain, or sports injury recovery',
      'Numbness or pain radiating down legs'
    ],
    description: 'Orthopedic specialists treat conditions affecting bones, joints, ligaments, tendons, and muscles, improving physical mobility.'
  },
  {
    id: 'skin',
    name: 'Skin, Hair & Nails',
    specialty: 'Dermatology',
    icon: <Sparkles className="w-6 h-6" />,
    color: 'from-amber-500 to-orange-600',
    hoverCoords: { x: 74, y: 40 },
    symptoms: [
      'New, growing, or changing moles',
      'Persistent rashes, eczema, or psoriasis flare-ups',
      'Severe or painful acne unresponsive to over-the-counter care',
      'Unexplained hair loss or nail discoloration',
      'Chronic skin itching or dry patches'
    ],
    description: 'Dermatologists manage benign and malignant disorders of the skin, hair, nails, and mucous membranes.'
  }
];

const SymptomGuide = () => {
  const [selectedRegion, setSelectedRegion] = useState(bodyRegions[0]);
  const [hoveredRegion, setHoveredRegion] = useState(null);
  
  // AI Symptom State variables
  const [symptomInput, setSymptomInput] = useState('');
  const [analyzing, setAnalyzing] = useState(false);
  const [aiRecommendation, setAiRecommendation] = useState(null);
  const [regionDoctors, setRegionDoctors] = useState([]);
  const [loadingDocs, setLoadingDocs] = useState(false);
  
  const navigate = useNavigate();

  useEffect(() => {
    const fetchRegionDoctors = async () => {
      setLoadingDocs(true);
      try {
        const allDocs = await db.getDoctors();
        const filtered = allDocs.filter(d => d.specialty.toLowerCase() === selectedRegion.specialty.toLowerCase() && d.status === 'active');
        setRegionDoctors(filtered);
      } catch (err) {
        console.error("Error fetching doctors for region:", err);
      } finally {
        setLoadingDocs(false);
      }
    };
    fetchRegionDoctors();
  }, [selectedRegion]);

  const handleSearchDoctor = (specialty) => {
    navigate(`/dashboard/patient/doctors?specialty=${specialty}`);
  };

  const handleAISubmit = async (e) => {
    e.preventDefault();
    if (!symptomInput.trim()) return;

    setAnalyzing(true);
    setAiRecommendation(null);

    try {
      const data = await db.aiSymptomCheck(symptomInput);
      const matchedRegion = bodyRegions.find(r => r.specialty.toLowerCase() === data.specialty.toLowerCase());

      if (matchedRegion) {
        setSelectedRegion(matchedRegion);
      }

      setAiRecommendation({
        matched: data.matched,
        specialty: data.specialty,
        suggestion: data.suggestion,
        text: data.text,
        wellness_tips: data.wellness_tips || []
      });
    } catch (err) {
      console.error("AI Symptom check failed:", err);
      setAiRecommendation({
        matched: false,
        text: "Sorry, we had trouble processing your request. Please try listing your symptoms in a different format.",
        wellness_tips: []
      });
    } finally {
      setAnalyzing(false);
    }
  };

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      {/* Title Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900  flex items-center gap-3">
            <Stethoscope className="text-[var(--color-primary)] " size={32} />
            Smart Specialty & Symptom Guide
          </h1>
          <p className="text-sm text-slate-500 mt-1 font-medium">
            Describe your symptoms or click body areas to find recommended specialists.
          </p>
        </div>
      </div>

      {/* AI Symptom Input Bar */}
      <div className="bg-gradient-to-r from-blue-900/10 via-teal-900/10 to-emerald-900/10   p-6 rounded-[24px] border border-blue-500/20  shadow-sm hover:shadow-md transition-shadow fade-in hover:shadow-md transition-all duration-300 space-y-4">
        <div className="flex items-center gap-2.5">
          <Sparkles className="text-teal-500 animate-pulse" size={22} />
          <h3 className="text-sm font-bold text-slate-900  uppercase tracking-wider">AI Symptom Assistant</h3>
        </div>
        <form onSubmit={handleAISubmit} className="flex flex-col sm:flex-row gap-3">
          <input
            type="text"
            placeholder="Type symptoms here (e.g. 'sharp chest pain', 'dizziness and headaches', 'dry skin rash')..."
            value={symptomInput}
            onChange={(e) => setSymptomInput(e.target.value)}
            className="flex-grow px-5 py-4 rounded-2xl text-sm font-medium bg-white  text-slate-800  border border-slate-200  focus:outline-none focus:ring-2 focus:ring-teal-500 shadow-inner"
          />
          <button
            type="submit"
            disabled={analyzing}
            className="px-6 py-4 bg-[var(--color-primary)] text-white font-bold text-xs rounded-2xl hover:bg-[var(--color-accent)] active:scale-95 transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            {analyzing ? (
              <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <Sparkles size={14} />
            )}
            Analyze Symptoms
          </button>
        </form>

        {aiRecommendation && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }} 
            animate={{ opacity: 1, y: 0 }} 
            className={`p-5 rounded-[24px] border text-xs font-semibold flex flex-col gap-4 ${
              aiRecommendation.matched 
                ? 'bg-teal-500/10 border-teal-500/30 text-teal-800  shadow-sm hover:shadow-md transition-shadow fade-in hover:shadow-md transition-all duration-300' 
                : 'bg-[#F59E0B]/10 border-amber-500/30 text-amber-800  shadow-sm hover:shadow-md transition-shadow fade-in hover:shadow-md transition-all duration-300'
            }`}
          >
            <div className="flex items-start gap-3">
              <AlertCircle size={20} className={`mt-0.5 flex-shrink-0 ${aiRecommendation.matched ? 'text-teal-500' : 'text-[#F59E0B]'}`} />
              <div className="space-y-2 flex-grow">
                {aiRecommendation.matched ? (
                  <>
                    <p className="text-sm font-black text-teal-900 ">
                      AI Symptom Detection:
                    </p>
                    <p className="text-xs leading-relaxed">
                      Based on your input, we detected indications that may relate to:{" "}
                      <span className="underline decoration-2 decoration-teal-400 font-extrabold text-[var(--color-primary)] ">
                        {aiRecommendation.suggestion}
                      </span>.
                    </p>
                    <p className="text-xs opacity-90 leading-relaxed">
                      We highly recommend directing your symptoms to a <span className="font-bold">{aiRecommendation.specialty}</span> specialist to receive a professional clinical diagnosis and a personalized treatment plan.
                    </p>
                  </>
                ) : (
                  <p className="leading-relaxed">{aiRecommendation.text}</p>
                )}
              </div>
            </div>

            {aiRecommendation.matched && aiRecommendation.wellness_tips && aiRecommendation.wellness_tips.length > 0 && (
              <div className="mt-2 p-4 bg-white/40 dark:bg-slate-900/40 rounded-2xl border border-teal-500/10 space-y-3">
                <h4 className="text-[10px] font-black text-teal-800 uppercase tracking-widest flex items-center gap-1.5">
                  <Sparkles size={14} className="text-teal-500 animate-pulse" />
                  Personalized Home Care Guidance
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {aiRecommendation.wellness_tips.map((tip, idx) => (
                    <div key={idx} className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-teal-500/10 flex gap-2">
                      <span className="text-teal-500 font-extrabold text-xs">0{idx + 1}.</span>
                      <span className="text-[11px] font-semibold text-teal-950/80 leading-relaxed">{tip}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {aiRecommendation.matched && (
              <div className="flex justify-end pt-2 border-t border-teal-500/20">
                <button 
                  onClick={() => handleSearchDoctor(aiRecommendation.specialty)}
                  className="px-6 py-3 bg-[var(--color-primary)] hover:bg-[var(--color-accent)] text-white text-[10px] font-black uppercase tracking-wider rounded-xl transition-all shadow-sm hover:shadow-md transition-shadow fade-in hover:shadow-md transition-all duration-300 cursor-pointer w-full sm:w-auto text-center flex items-center justify-center gap-1.5"
                >
                  <Search size={12} />
                  Book {aiRecommendation.specialty} Specialist
                  <ChevronRight size={12} />
                </button>
              </div>
            )}
          </motion.div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* LEFT COLUMN: Interactive Silhouette Body (lg:col-span-5) */}
        <div className="lg:col-span-5 bg-[var(--bg-secondary)]  rounded-[24px] p-8 border border-[var(--border-primary)]  shadow-sm hover:shadow-md transition-shadow fade-in hover:shadow-md transition-all duration-300 flex flex-col items-center justify-center relative overflow-hidden group min-h-[450px]">
          <div className="absolute top-0 right-0 w-48 h-48 bg-blue-400/5  rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none" />
          
          <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-6 absolute top-6 left-8">
            Interactive Body Mapper
          </h3>

          {/* Human Silhouette SVG Container */}
          <div className="relative w-48 h-96 mt-6 select-none">
            {/* Outline body silhouette */}
            <svg 
              viewBox="0 0 100 200" 
              className="w-full h-full text-slate-200  hover:text-slate-300 dark:text-slate-600 transition-colors duration-300 fill-current stroke-current stroke-1"
            >
              {/* Human Head */}
              <circle cx="50" cy="20" r="14" />
              {/* Neck */}
              <rect x="47" y="32" width="6" height="8" rx="2" />
              {/* Torso & Shoulders */}
              <path d="M 32 45 L 68 45 C 72 45, 74 48, 73 53 L 65 110 C 65 112, 63 115, 60 115 L 40 115 C 37 115, 35 112, 35 110 L 27 53 C 26 48, 28 45, 32 45 Z" />
              {/* Arms */}
              <path d="M 27 50 L 16 95 C 15 99, 11 98, 12 94 L 23 48 Z" />
              <path d="M 73 50 L 84 95 C 85 99, 89 98, 88 94 L 77 48 Z" />
              {/* Left Leg */}
              <path d="M 37 115 L 34 185 C 34 190, 31 190, 29 185 L 32 115 Z" />
              {/* Right Leg */}
              <path d="M 63 115 L 66 185 C 66 190, 69 190, 71 185 L 68 115 Z" />
            </svg>

            {/* Glowing Interactive Hotspot Dots */}
            {bodyRegions.map((region) => {
              const isSelected = selectedRegion.id === region.id;
              const isHovered = hoveredRegion?.id === region.id;
              return (
                <button
                  key={region.id}
                  onClick={() => { setSelectedRegion(region); setAiRecommendation(null); }}
                  onMouseEnter={() => setHoveredRegion(region)}
                  onMouseLeave={() => setHoveredRegion(null)}
                  style={{ left: `${region.hoverCoords.x}%`, top: `${region.hoverCoords.y}%` }}
                  className={`absolute transform -translate-x-1/2 -translate-y-1/2 flex items-center justify-center transition-all duration-300 z-20 cursor-pointer ${
                    isSelected ? 'scale-125' : 'hover:scale-115'
                  }`}
                >
                  {/* Glowing halo ring */}
                  <span className={`absolute inline-flex h-8 w-8 rounded-full opacity-75 animate-ping ${
                    isSelected ? 'bg-teal-400' : 'bg-blue-400'
                  }`} />
                  {/* Inner dot */}
                  <span className={`relative inline-flex rounded-full h-4.5 w-4.5 border-2 border-white shadow-md transition-all duration-300 ${
                    isSelected 
                      ? 'bg-teal-500 scale-110' 
                      : isHovered 
                        ? 'bg-blue-50/500 scale-105' 
                        : 'bg-slate-400'
                  }`} />
                </button>
              );
            })}
          </div>

          {/* Body Map Legend/Hover Label */}
          <div className="mt-4 text-xs font-bold text-slate-500 text-center min-h-[16px]">
            {hoveredRegion ? (
              <span className="text-[var(--color-primary)]  animate-pulse">
                Target: {hoveredRegion.name} ({hoveredRegion.specialty})
              </span>
            ) : (
              <span>Hover over glowing hot-spots to target systems</span>
            )}
          </div>
        </div>

        {/* RIGHT COLUMN: Interactive Details Panel (lg:col-span-7) */}
        <div className="lg:col-span-7 flex flex-col gap-6">
          
          {/* Quick Filter Selection Chips */}
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
            {bodyRegions.map((region) => {
              const isSelected = selectedRegion.id === region.id;
              return (
                <button
                  key={region.id}
                  onClick={() => { setSelectedRegion(region); setAiRecommendation(null); }}
                  className={`px-4 py-2.5 rounded-full text-xs font-bold whitespace-nowrap transition-all duration-300 flex items-center gap-1.5 cursor-pointer ${
                    isSelected
                      ? 'bg-[var(--color-primary)] text-white shadow-lg shadow-teal-900/10'
                      : 'bg-[var(--bg-secondary)]  text-slate-500  border border-[var(--border-primary)]  hover:border-[var(--color-accent)]'
                  }`}
                >
                  {region.icon}
                  {region.specialty}
                </button>
              );
            })}
          </div>

          {/* Details Content Box */}
          <AnimatePresence mode="wait">
            <motion.div
              key={selectedRegion.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.25 }}
              className="bg-[var(--bg-secondary)]  rounded-[24px] p-8 border border-[var(--border-primary)]  shadow-sm hover:shadow-md transition-shadow fade-in hover:shadow-md transition-all duration-300 flex-grow flex flex-col justify-between"
            >
              <div>
                {/* Header Badge */}
                <div className="flex justify-between items-start gap-4 mb-6">
                  <div>
                    <span className={`inline-flex items-center gap-1.5 px-3 py-1 bg-gradient-to-r ${selectedRegion.color} text-white text-[10px] font-black uppercase tracking-wider rounded-full shadow-sm hover:shadow-md transition-shadow fade-in hover:shadow-md transition-all duration-300`}>
                      {selectedRegion.icon}
                      {selectedRegion.specialty}
                    </span>
                    <h2 className="text-2xl font-black text-slate-900  mt-3">
                      {selectedRegion.name}
                    </h2>
                  </div>
                  <div className="p-4 bg-teal-50  text-[var(--color-primary)]  rounded-[24px]">
                    <Stethoscope size={28} />
                  </div>
                </div>

                <p className="text-sm text-gray-600  leading-relaxed font-medium mb-8">
                  {selectedRegion.description}
                </p>

                {/* Symptom Checklist */}
                <div>
                  <h4 className="text-xs font-black text-slate-500  uppercase tracking-widest mb-4 flex items-center gap-2">
                    <AlertCircle size={16} className="text-[#F59E0B]" />
                    Key Symptoms to Monitor
                  </h4>
                  <div className="space-y-3">
                    {selectedRegion.symptoms.map((symptom, idx) => (
                      <div key={idx} className="flex items-start gap-3 p-3 bg-white  rounded-2xl border border-slate-100/50 ">
                        <span className="w-1.5 h-1.5 rounded-full bg-teal-500 mt-2 flex-shrink-0" />
                        <span className="text-xs font-semibold text-slate-900 ">
                          {symptom}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Matched Doctors Section */}
              <div className="mt-8 pt-6 border-t border-[var(--border-primary)]">
                <h4 className="text-xs font-black text-slate-500 uppercase tracking-widest mb-4 flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <Stethoscope size={16} className="text-[var(--color-primary)]" />
                    Available {selectedRegion.specialty} Specialists
                  </span>
                  {regionDoctors.length > 0 && (
                    <span className="text-[10px] bg-teal-500/10 text-teal-600 px-2 py-0.5 rounded-full font-extrabold">
                      {regionDoctors.length} found
                    </span>
                  )}
                </h4>

                {loadingDocs ? (
                  <div className="text-center py-4 text-xs font-medium text-slate-400">
                    Finding available specialists...
                  </div>
                ) : regionDoctors.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {regionDoctors.map((doc) => (
                      <div key={doc.id} className="p-4 bg-white dark:bg-slate-900 rounded-2xl border border-[var(--border-primary)] flex flex-col justify-between hover:shadow-md transition-all group">
                        <div className="flex gap-3">
                          <div className="w-12 h-12 rounded-xl bg-teal-500/10 dark:bg-teal-500/20 text-[var(--color-primary)] flex items-center justify-center font-bold text-sm">
                            {doc.name.split(' ').map(n => n[0]).join('')}
                          </div>
                          <div className="min-w-0 flex-1">
                            <h5 className="text-xs font-bold text-slate-900 truncate group-hover:text-[var(--color-primary)] transition-colors">
                              {doc.name}
                            </h5>
                            <p className="text-[10px] text-slate-500 font-medium">
                              {doc.experience || '10+ yrs'} exp • {doc.rating || '4.8'} ★
                            </p>
                          </div>
                        </div>
                        <div className="mt-4 pt-3 border-t border-slate-50 dark:border-slate-800 flex gap-2">
                          <button
                            onClick={() => navigate('/dashboard/patient/messages', { state: { doctor: doc } })}
                            className="flex-1 py-2 bg-slate-50 dark:bg-slate-800 text-[10px] font-bold text-slate-600 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer"
                          >
                            Chat
                          </button>
                          <button
                            onClick={() => navigate('/dashboard/patient/book-appointment', { state: { doctor: doc } })}
                            className="flex-1 py-2 bg-[var(--color-primary)] text-white text-[10px] font-bold rounded-xl hover:opacity-90 transition-opacity cursor-pointer"
                          >
                            Book
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-6 bg-slate-50 dark:bg-slate-900/50 rounded-2xl text-center border border-dashed border-[var(--border-primary)] space-y-2">
                    <p className="text-xs text-slate-500 font-semibold">No active specialists in {selectedRegion.specialty} are registered yet.</p>
                    <button
                      onClick={() => navigate('/dashboard/patient/doctors')}
                      className="text-[10px] text-[var(--color-primary)] font-black uppercase tracking-wider hover:underline cursor-pointer"
                    >
                      Browse All Doctors
                    </button>
                  </div>
                )}
              </div>
            </motion.div>
          </AnimatePresence>

        </div>
      </div>
    </div>
  );
};

export default SymptomGuide;
