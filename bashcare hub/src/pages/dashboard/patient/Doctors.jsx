import { useState, useEffect } from 'react';
import { 
  Search, 
  Filter, 
  Star, 
  ChevronRight,
  ShieldCheck,
  Stethoscope
} from 'lucide-react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { db } from '../../../utils/db';

const Doctors = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSpecialty, setSelectedSpecialty] = useState('All');
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        const allDoctors = await db.getDoctors();
        const activeDocs = allDoctors;
        setDoctors(activeDocs);
      } catch (err) {
        console.error("Error fetching doctors:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchDoctors();
  }, []);

  const specialties = [
    'All', ...new Set(doctors.map(d => d.specialty))
  ];

  const filteredDoctors = doctors.filter(doc => {
    const matchesSearch = doc.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          doc.specialty.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesSpecialty = selectedSpecialty === 'All' || doc.specialty === selectedSpecialty;
    return matchesSearch && matchesSpecialty;
  });

  if (loading) return <div className="p-8 text-center font-bold text-slate-500">Finding doctors...</div>;

  return (
    <div className="space-y-8 max-w-[1600px] mx-auto">
      <div className="bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800/40 rounded-[28px] p-8 shadow-[0_8px_30px_rgb(0,0,0,0.015)] flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-800 dark:text-slate-200">Find a Specialist</h1>
          <p className="text-slate-400 font-semibold text-xs mt-0.5">Browse our network of verified medical professionals.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input 
              type="text" 
              placeholder="Search by name or specialty..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800 border-none rounded-xl text-xs focus:ring-2 focus:ring-[#2563EB] outline-none w-72 text-slate-900 dark:text-slate-100"
            />
          </div>
          <button className="p-2.5 bg-slate-50 dark:bg-slate-800 border-none rounded-xl text-slate-500 hover:text-[#2563EB] cursor-pointer">
            <Filter size={18} />
          </button>
        </div>
      </div>

      {/* Specialty Filter */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 custom-scrollbar">
        {specialties.map((s) => (
          <button
            key={s}
            onClick={() => setSelectedSpecialty(s)}
            className={`px-5 py-2 rounded-2xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer border-none ${
              selectedSpecialty === s 
                ? 'bg-[#2563EB] text-white shadow-md shadow-blue-500/10' 
                : 'bg-white dark:bg-slate-900 text-slate-500 hover:text-slate-700 dark:hover:text-slate-350 border border-slate-100 dark:border-slate-800/80'
            }`}
          >
            {s || 'Specialist'}
          </button>
        ))}
      </div>

      {/* Doctors Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredDoctors.map((doc, i) => (
          <motion.div
            key={doc.id}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.05 }}
            className="bg-white dark:bg-slate-900 rounded-[28px] border border-gray-100 dark:border-slate-800/40 p-6 shadow-[0_8px_30px_rgb(0,0,0,0.01)] hover:-translate-y-1 hover:shadow-md transition-all duration-300 flex flex-col justify-between"
          >
            <div>
              <div className="flex items-start justify-between mb-4">
                <div className="relative cursor-pointer" onClick={() => navigate(`/doctor/${doc.id}`)}>
                  <div className="w-16 h-16 rounded-2xl bg-blue-50 dark:bg-blue-950/30 text-[#2563EB] dark:text-blue-400 flex items-center justify-center font-black text-xl border border-slate-150 dark:border-slate-800">
                    {doc.name.split(' ').map(n => n[0]).join('')}
                  </div>
                  {doc.status === 'active' && (
                    <div className="absolute -top-1.5 -right-1.5 bg-[#2563EB] text-white p-1 rounded-lg border-2 border-white dark:border-slate-900 shadow-sm">
                      <ShieldCheck size={12} />
                    </div>
                  )}
                </div>
                <div className="text-right">
                  <div className="flex items-center gap-1 text-yellow-600 bg-yellow-50 dark:bg-yellow-950/20 px-2 py-0.5 rounded-full font-black text-xs justify-end">
                    <Star size={13} fill="currentColor" /> {doc.rating || '4.8'}
                  </div>
                  <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-1">{doc.reviews || '50+'} reviews</p>
                </div>
              </div>

              <div className="space-y-1 mb-4">
                <h3 
                  className="text-base font-black text-slate-800 dark:text-slate-100 hover:text-[#2563EB] dark:hover:text-blue-450 transition-colors cursor-pointer"
                  onClick={() => navigate(`/doctor/${doc.id}`)}
                >
                  {doc.name}
                </h3>
                <div className="flex items-center gap-2 text-xs text-slate-500 font-semibold">
                  <Stethoscope size={13} className="text-[#2563EB]" /> {doc.specialty} • {doc.experience || '10+ yrs'}
                </div>
              </div>

              <p className="text-xs text-slate-550 dark:text-slate-400 line-clamp-2 mb-6 font-medium">
                {doc.bio || `Experienced ${doc.specialty} specialist dedicated to providing the best patient care.`}
              </p>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-slate-50/50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 rounded-2xl">
                <div>
                  <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Availability</p>
                  <p className="text-[11px] font-bold text-slate-600 dark:text-slate-350">{doc.availability || 'Available Mon-Fri'}</p>
                </div>
                <div className="w-px h-8 bg-slate-200 dark:bg-slate-700"></div>
                <button 
                  onClick={() => navigate('/dashboard/patient/messages', { state: { doctor: doc } })}
                  className="text-xs font-bold text-[#2563EB] dark:text-teal-400 flex items-center gap-0.5 hover:underline cursor-pointer border-none bg-transparent"
                >
                  Consult <ChevronRight size={12} />
                </button>
              </div>

              <button 
                onClick={() => navigate('/dashboard/patient/book-appointment', { state: { doctor: doc } })}
                className="w-full py-4 bg-[#2563EB] text-white rounded-2xl text-xs font-bold hover:opacity-90 transition-all cursor-pointer border-none shadow-md shadow-blue-500/10 active:scale-[0.98]"
              >
                Book Appointment
              </button>
            </div>
          </motion.div>
        ))}
      </div>

      {filteredDoctors.length === 0 && (
        <div className="text-center py-20 bg-white dark:bg-slate-900 border border-gray-150 dark:border-slate-800 rounded-[28px] shadow-[0_8px_30px_rgb(0,0,0,0.015)]">
          <div className="bg-slate-50 dark:bg-slate-800 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Search size={30} className="text-slate-400" />
          </div>
          <h3 className="text-lg font-bold text-slate-800 dark:text-slate-200">No doctors found</h3>
          <p className="text-slate-450 text-xs font-semibold mt-1">Try a different search term or specialty.</p>
        </div>
      )}
    </div>
  );
};

export default Doctors;


