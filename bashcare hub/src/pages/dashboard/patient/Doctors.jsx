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
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Find a Specialist</h1>
          <p className="text-slate-500 text-sm">Browse our network of verified medical professionals.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
            <input 
              type="text" 
              placeholder="Search by name or specialty..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-4 py-2.5 bg-[var(--bg-secondary)] border border-[var(--border-primary)] rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none w-72"
            />
          </div>
          <button className="p-2.5 bg-[var(--bg-secondary)] border border-[var(--border-primary)] rounded-xl text-gray-600 hover:bg-[#f8fafc] transition-colors">
            <Filter size={20} />
          </button>
        </div>
      </div>

      {/* Specialty Filter */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2">
        {specialties.map((s) => (
          <button
            key={s}
            onClick={() => setSelectedSpecialty(s)}
            className={`px-5 py-2.5 rounded-2xl text-sm font-bold transition-all whitespace-nowrap ${
              selectedSpecialty === s 
                ? 'bg-[var(--color-primary)] text-white shadow-lg shadow-blue-600/20' 
                : 'bg-[var(--bg-secondary)] text-slate-500 border border-[var(--border-primary)] hover:border-[var(--border-primary)]'
            }`}
          >
            {s}
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
            className="bg-[var(--bg-secondary)] rounded-[24px] shadow-sm hover:shadow-md transition-shadow fade-in hover:shadow-md transition-all duration-300 border border-[var(--border-primary)] overflow-hidden hover:shadow-md transition-all group"
          >
            <div className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="relative cursor-pointer" onClick={() => navigate(`/doctor/${doc.id}`)}>
                  <div className="w-20 h-20 rounded-[24px] bg-blue-100 flex items-center justify-center text-[var(--color-primary)] font-bold text-2xl border-2 border-white shadow-sm hover:shadow-md transition-shadow fade-in hover:shadow-md transition-all duration-300">
                    {doc.name.split(' ').map(n => n[0]).join('')}
                  </div>
                  {doc.status === 'active' && (
                    <div className="absolute -top-2 -right-2 bg-[var(--color-primary)] text-white p-1.5 rounded-xl border-2 border-white shadow-sm hover:shadow-md transition-shadow fade-in hover:shadow-md transition-all duration-300">
                      <ShieldCheck size={14} />
                    </div>
                  )}
                </div>
                <div className="text-right">
                  <div className="flex items-center gap-1 text-[#F59E0B] font-black text-sm justify-end">
                    <Star size={16} fill="currentColor" /> {doc.rating || '4.8'}
                  </div>
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{doc.reviews || '50+'} reviews</p>
                </div>
              </div>

              <div className="space-y-1 mb-4">
                <h3 
                  className="text-lg font-bold text-slate-900 group-hover:text-[var(--color-primary)] transition-colors cursor-pointer"
                  onClick={() => navigate(`/doctor/${doc.id}`)}
                >
                  {doc.name}
                </h3>
                <div className="flex items-center gap-2 text-sm text-slate-500 font-medium">
                  <Stethoscope size={14} className="text-[var(--color-primary)]" /> {doc.specialty} • {doc.experience || '10+ yrs'}
                </div>
              </div>

              <p className="text-sm text-slate-500 line-clamp-2 mb-6 font-medium">
                {doc.bio || `Experienced ${doc.specialty} specialist dedicated to providing the best patient care.`}
              </p>

              <div className="flex items-center justify-between p-4 bg-white rounded-2xl mb-6">
                <div>
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Availability</p>
                  <p className="text-xs font-bold text-slate-500">{doc.availability || 'Available Mon-Fri'}</p>
                </div>
                <div className="w-px h-8 bg-gray-200"></div>
                <button 
                  onClick={() => navigate('/dashboard/patient/messages', { state: { doctor: doc } })}
                  className="text-xs font-bold text-[var(--color-primary)] flex items-center gap-1 hover:underline"
                >
                  Consult Now <ChevronRight size={14} />
                </button>
              </div>

              <button 
                onClick={() => navigate('/dashboard/patient/book-appointment', { state: { doctor: doc } })}
                className="w-full py-4 bg-[var(--color-primary)] text-white rounded-2xl font-bold hover:bg-gray-800 transition-all shadow-lg shadow-gray-900/10 active:scale-[0.98]"
              >
                Book Appointment
              </button>
            </div>
          </motion.div>
        ))}
      </div>

      {filteredDoctors.length === 0 && (
        <div className="text-center py-20 bg-[var(--bg-secondary)] rounded-[3rem] border border-dashed border-[var(--border-primary)]">
          <div className="bg-[#f8fafc] w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Search size={32} className="text-gray-300" />
          </div>
          <h3 className="text-lg font-bold text-slate-900">No doctors found</h3>
          <p className="text-slate-500 text-sm mt-1">Try a different search term or specialty.</p>
        </div>
      )}
    </div>
  );
};

export default Doctors;


