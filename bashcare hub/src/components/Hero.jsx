import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Star, Zap, Activity, Heart, Search } from 'lucide-react';
import { db } from '../utils/db';
import { useGlobalSettings } from '../context/GlobalSettingsContext';

const doctorImages = [
  "https://images.unsplash.com/photo-1550831107-1553da8c8464?auto=format&fit=crop&q=80&w=1200",
  "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?auto=format&fit=crop&q=80&w=1200",
  "https://images.unsplash.com/photo-1538108149393-fbbd81895907?auto=format&fit=crop&q=80&w=1200",
  "https://images.unsplash.com/photo-1579684385127-1ef15d508118?auto=format&fit=crop&q=80&w=1200",
  "https://images.unsplash.com/photo-1551076805-e1869033e561?auto=format&fit=crop&q=80&w=1200",
  "https://images.unsplash.com/photo-1559757148-5c350d0d3c56?auto=format&fit=crop&q=80&w=1200",
  "https://images.unsplash.com/photo-1582750433449-648ed127bb54?auto=format&fit=crop&q=80&w=1200",
  "https://images.unsplash.com/photo-1594824476967-48c8b964273f?auto=format&fit=crop&q=80&w=1200",
  "https://images.unsplash.com/photo-1631815588090-d4bfec5b1ccb?auto=format&fit=crop&q=80&w=1200",
  "https://images.unsplash.com/photo-1666214280391-8ff5bd3d0bf0?auto=format&fit=crop&q=80&w=1200",
  "https://images.unsplash.com/photo-1607746882042-944635dfe10e?auto=format&fit=crop&q=80&w=1200",
  "https://images.unsplash.com/photo-1527613426441-4da17471b66d?auto=format&fit=crop&q=80&w=1200",
  "https://images.unsplash.com/photo-1643297654416-05795d62e39c?auto=format&fit=crop&q=80&w=1200",
  "https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&q=80&w=1200",
];

const Hero = () => {
  const navigate = useNavigate();
  const { t } = useGlobalSettings();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [heroSearch, setHeroSearch] = useState('');
  const [doctorsList, setDoctorsList] = useState([]);
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        const list = await db.getDoctors();
        setDoctorsList(list.filter(d => d.status === 'active'));
      } catch (err) {
        console.error("Error loading doctors for suggestions:", err);
      }
    };
    fetchDoctors();
  }, []);

  useEffect(() => {
    if (!heroSearch.trim()) {
      setSuggestions([]);
      return;
    }
    const query = heroSearch.toLowerCase();
    const specialties = ['Cardiology', 'Neurology', 'Pediatrics', 'Orthopedics', 'Dental', 'General Medicine', 'Dermatology'];
    
    const matchedSpecs = specialties
      .filter(s => s.toLowerCase().includes(query))
      .map(s => ({ type: 'specialty', text: s, display: `Specialty: ${s}` }));
      
    const matchedDocs = doctorsList
      .filter(d => d.name?.toLowerCase().includes(query) || d.specialty?.toLowerCase().includes(query))
      .map(d => ({ type: 'doctor', text: d.name, display: `Dr. ${d.name} (${d.specialty || 'Specialist'})` }));

    setSuggestions([...matchedSpecs, ...matchedDocs].slice(0, 5));
  }, [heroSearch, doctorsList]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (heroSearch.trim()) {
      navigate(`/doctors?search=${encodeURIComponent(heroSearch)}`);
    }
  };

  const handleSelectSuggestion = (sug) => {
    setHeroSearch(sug.text);
    setShowSuggestions(false);
    if (sug.type === 'doctor') {
      navigate(`/doctors?search=${encodeURIComponent(sug.text)}`);
    } else {
      navigate(`/doctors?specialty=${encodeURIComponent(sug.text)}`);
    }
  };

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex((prevIndex) => (prevIndex + 1) % doctorImages.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <section className="relative pt-24 pb-20 lg:pt-32 lg:pb-24 overflow-hidden transition-colors hero-gradient">
      {/* Dynamic Background Elements */}
      <motion.div 
        className="absolute top-0 right-0 w-[600px] h-[400px] md:h-[500px] bg-blue-100/60  rounded-full blur-[150px] opacity-60"
        animate={{ x: [0, 100, 0], y: [0, 50, 0] }}
        transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div 
        className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-indigo-100/60  rounded-full blur-[120px] opacity-60"
        animate={{ x: [0, -50, 0], y: [0, 100, 0] }}
        transition={{ duration: 25, repeat: Infinity, ease: "easeInOut" }}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="lg:grid lg:grid-cols-12 lg:gap-12 items-center">
          
          {/* Text Content */}
          <motion.div 
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="sm:text-center md:max-w-2xl md:mx-auto lg:col-span-6 lg:text-left"
          >
            <motion.div 
              whileHover={{ scale: 1.03 }}
              className="inline-flex items-center px-4 py-1.5 rounded-full bg-blue-50  text-blue-600  text-sm font-semibold mb-6 border border-blue-100 "
            >
              <span className="flex h-2.5 w-2.5 rounded-full bg-blue-500  mr-2 animate-pulse"></span>
              {t('Now Accepting Online Consultations')}
            </motion.div>
            
            <h1 className="text-3xl md:text-4xl tracking-tight font-extrabold text-[#0f172a] sm:text-3xl md:text-4xl md:text-3xl md:text-4xl lg:text-5xl leading-tight">
              <span className="block">{t('Compassionate Care')}</span>
              <span className="block text-[var(--color-primary)] relative">
                {t('for a Better Life')}
              </span>
            </h1>
            
            <p className="mt-6 text-base text-[#64748b] sm:text-xl lg:text-lg xl:text-xl leading-relaxed">
              {t('Bashcare Hub provides top-tier medical services with a team of experienced professionals. We are committed to your health and well-being.')}
            </p>
            
            {/* Quick Diagnostic / Specialist Search Bar */}
            <form 
              onSubmit={handleSearchSubmit} 
              onMouseLeave={() => setShowSuggestions(false)}
              className="mt-8 relative max-w-md hidden sm:block z-30"
            >
              <div className="relative group">
                <div className="absolute -inset-1 bg-gradient-to-r from-blue-500 to-teal-500 rounded-full blur opacity-15 group-hover:opacity-30 transition duration-300"></div>
                <input 
                  type="text" 
                  placeholder={t('Search specialties, doctors, or symptoms...')} 
                  value={heroSearch}
                  onChange={(e) => {
                    setHeroSearch(e.target.value);
                    setShowSuggestions(true);
                  }}
                  onFocus={() => setShowSuggestions(true)}
                  className="relative w-full px-6 py-4.5 rounded-full border border-gray-200  bg-white/70  backdrop-blur-md text-sm text-gray-900  placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:ring-teal-400 shadow-md pr-14 transition-all"
                />
                <button 
                  type="submit"
                  className="absolute right-2 top-2 p-2.5 rounded-full bg-[var(--color-primary)] text-white hover:opacity-90 transition-all cursor-pointer"
                >
                  <Search size={18} />
                </button>

                {showSuggestions && suggestions.length > 0 && (
                  <div className="absolute left-0 right-0 mt-2 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border border-slate-100 dark:border-slate-800 rounded-2xl shadow-xl overflow-hidden z-40 p-2">
                    {suggestions.map((sug, idx) => (
                      <button
                        type="button"
                        key={idx}
                        onClick={() => handleSelectSuggestion(sug)}
                        className="w-full text-left px-4 py-2.5 rounded-xl hover:bg-blue-50/50 dark:hover:bg-blue-950/20 text-xs font-bold text-slate-700 dark:text-slate-350 hover:text-[#2563EB] dark:hover:text-blue-400 transition-colors border-none bg-transparent cursor-pointer flex items-center justify-between"
                      >
                        <span>{sug.display}</span>
                        <span className="text-[9px] uppercase tracking-wider bg-slate-100 dark:bg-slate-800 text-slate-400 px-2 py-0.5 rounded-md font-black">{sug.type}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </form>

            <div className="mt-8 flex flex-col sm:flex-row sm:justify-center lg:justify-start gap-4">
              <motion.button 
                onClick={() => {
                  const el = document.getElementById('services');
                  if (el) {
                    el.scrollIntoView({ behavior: 'smooth' });
                  } else {
                    window.location.hash = '#services';
                  }
                }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="inline-flex items-center justify-center px-6 py-3 font-bold text-white bg-[var(--color-primary)] rounded-full shadow-lg hover:opacity-95 cursor-pointer"
              >
                {t('Explore Services')}
              </motion.button>
              <motion.button 
                onClick={() => navigate('/doctors')}
                whileHover={{ scale: 1.05, backgroundColor: "var(--border-primary)" }}
                className="inline-flex items-center justify-center px-6 py-3 font-bold text-[#64748b] border border-[var(--border-primary)] rounded-full bg-[#ffffff] cursor-pointer transition-colors"
              >
                {t('Our Specialists')}
              </motion.button>
            </div>
          </motion.div>

          {/* Image Content with Floating Info Cards */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8 }}
            className="mt-16 lg:mt-0 lg:col-span-6 relative select-none"
          >
            <AnimatePresence mode='wait'>
              <motion.img
                key={currentImageIndex}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.5 }}
                className="w-full h-[380px] md:h-[420px] object-cover rounded-[3rem] shadow-2xl border-4 border-white/50 "
                src={doctorImages[currentImageIndex]}
                alt="Medical professional"
              />
            </AnimatePresence>

             {/* Floating Card 1: Top Left (Rating) */}
            <motion.div
              animate={{ y: [0, -12, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              className="absolute -top-6 -left-6 bg-white/90  backdrop-blur-md p-4 rounded-2xl shadow-xl border border-white/40  flex items-center gap-3 hidden sm:flex"
            >
              <div className="bg-amber-50  p-2 rounded-xl text-amber-500">
                <Star className="w-6 h-6 fill-current" />
              </div>
              <div>
                <p className="text-[10px] text-gray-500  font-bold uppercase tracking-wider">{t('Top Rated Care')}</p>
                <p className="text-sm font-bold text-gray-800 ">4.9/5 (18k+ reviews)</p>
              </div>
            </motion.div>
 
            {/* Floating Card 2: Bottom Right (Online status) */}
            <motion.div
              animate={{ y: [0, 12, 0] }}
              transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
              className="absolute -bottom-6 -right-6 bg-white/90  backdrop-blur-md p-4 rounded-2xl shadow-xl border border-white/40  flex items-center gap-3"
            >
              <div className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
              </div>
              <div>
                <p className="text-[10px] text-gray-500  font-bold uppercase tracking-wider">{t('consultations')}</p>
                <p className="text-sm font-bold text-gray-800 ">{t('98 Doctors Online')}</p>
              </div>
            </motion.div>
 
            {/* Floating Card 3: Bottom Left (AI assistance status) */}
            <motion.div
              animate={{ x: [0, 10, 0] }}
              transition={{ duration: 6, repeat: Infinity, ease: "easeInOut", delay: 1 }}
              className="absolute bottom-12 -left-8 bg-white/90  backdrop-blur-md p-3.5 rounded-2xl shadow-xl border border-white/40  flex items-center gap-2.5 hidden md:flex"
            >
              <div className="bg-blue-50  p-2 rounded-xl text-blue-500 ">
                <Zap className="w-5 h-5 fill-current" />
              </div>
              <p className="text-xs font-bold text-gray-800 ">{t('AI Diagnostic Assistant Live')}</p>
            </motion.div>
          </motion.div>
        </div>
      </div>
 
        {/* Glassmorphism Booking Bar */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="mt-12 lg:mt-16 relative z-10"
        >
          <div className="bg-white/70 backdrop-blur-xl rounded-2xl shadow-lg border border-white/30 p-4 md:p-6 max-w-4xl mx-auto flex flex-wrap items-center gap-4">
            {/* Department */}
            <div className="flex-1 min-w-[160px]">
              <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-500 mb-1">{t('Department')}</label>
              <select className="w-full bg-white/60 border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-teal-400 transition-all cursor-pointer appearance-none">
                <option value="all">{t('All')}</option>
                <option value="cardiology">{t('Cardiology')}</option>
                <option value="neurology">{t('Neurology')}</option>
                <option value="pediatrics">{t('Pediatrics')}</option>
                <option value="orthopedics">{t('Orthopedics')}</option>
                <option value="dental">Dental</option>
                <option value="general">{t('General Medicine')}</option>
              </select>
            </div>
 
            {/* Doctor */}
            <div className="flex-1 min-w-[160px]">
              <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-500 mb-1">{t('Doctor')}</label>
              <select className="w-full bg-white/60 border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-teal-400 transition-all cursor-pointer appearance-none">
                <option value="all">{t('All Doctors')}</option>
              </select>
            </div>
 
            {/* Date */}
            <div className="flex-1 min-w-[160px]">
              <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-500 mb-1">{t('Date')}</label>
              <input
                type="date"
                className="w-full bg-white/60 border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-teal-400 transition-all cursor-pointer"
              />
            </div>
 
            {/* Book Now Button */}
            <div className="flex-shrink-0 w-full sm:w-auto mt-2 sm:mt-0 sm:self-end">
              <motion.button
                onClick={() => navigate('/doctors')}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="w-full sm:w-auto bg-[var(--color-primary)] text-white px-8 py-3 rounded-xl font-bold hover:opacity-90 cursor-pointer transition-all shadow-md"
              >
                {t('Book Now')}
              </motion.button>
            </div>
          </div>
        </motion.div>
    </section>
  );
};

export default Hero;

