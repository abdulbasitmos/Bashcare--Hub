import { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import {
  Search,
  Star,
  MapPin,
  Stethoscope,
  ShieldCheck,
  Calendar,
  Filter,
  Loader,
  ChevronRight,
} from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { db } from '../utils/db';

const SPECIALTIES = ['All', 'General Medicine', 'Cardiology', 'Neurology', 'Pediatrics', 'Dermatology', 'Orthopedics', 'Psychiatry', 'Gynecology'];

const DoctorCard = ({ doctor }) => {
  const navigate = useNavigate();
  const initials = doctor.name?.split(' ').map(n => n[0]).join('') || '?';

  return (
    <div className="group bg-[var(--bg-secondary)] border border-[var(--border-primary)] rounded-[2.5rem] p-6 flex flex-col gap-5 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
      {/* Avatar + verified badge */}
      <div className="flex items-start gap-4">
        <div className="relative flex-shrink-0">
          <div className="w-20 h-20 rounded-[1.5rem] bg-blue-100 overflow-hidden border-4 border-white shadow-md">
            {doctor.profilePicture ? (
              <img src={doctor.profilePicture} alt={doctor.name} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-[var(--color-primary)] text-2xl font-black">
                {initials}
              </div>
            )}
          </div>
          <div className="absolute -bottom-2 -right-2 bg-[var(--color-primary)] text-white p-1.5 rounded-xl border-2 border-white shadow">
            <ShieldCheck size={14} />
          </div>
        </div>

        <div className="flex-grow min-w-0">
          <h3 className="text-lg font-black text-[var(--text-primary)] truncate">{doctor.name}</h3>
          <p className="text-sm font-bold text-[var(--color-primary)] mb-2 truncate">
            {doctor.professionalRole || doctor.specialty || 'Specialist'}
          </p>
          <div className="flex items-center gap-1">
            <Star size={14} className="text-amber-500" fill="currentColor" />
            <span className="text-sm font-bold text-[var(--text-primary)]">{doctor.rating || '4.9'}</span>
            <span className="text-xs text-[var(--text-secondary)] ml-1">· 50+ reviews</span>
          </div>
        </div>
      </div>

      {/* Tags */}
      <div className="flex flex-wrap gap-2">
        {[doctor.specialty, doctor.department].filter(Boolean).map((tag, i) => (
          <span
            key={i}
            className="px-3 py-1 bg-[var(--bg-primary)] text-[var(--color-primary)] rounded-full text-xs font-bold border border-blue-100"
          >
            {tag}
          </span>
        ))}
      </div>

      {/* Location & Experience */}
      <div className="flex items-center justify-between text-xs text-[var(--text-secondary)] font-medium">
        <span className="flex items-center gap-1">
          <MapPin size={13} className="text-red-400" /> Bashcare Hospital
        </span>
        <span className="flex items-center gap-1">
          <Stethoscope size={13} className="text-blue-400" />
          {doctor.experience || '10+ yrs'}
        </span>
      </div>

      {/* Actions */}
      <div className="flex gap-2 mt-auto pt-2 border-t border-[var(--border-primary)]">
        <button
          onClick={() => navigate(`/doctor/${doctor.id}`)}
          className="flex-1 py-2.5 bg-[var(--color-primary)] text-white rounded-2xl text-sm font-bold hover:bg-blue-700 transition-all active:scale-95 flex items-center justify-center gap-1"
        >
          View Profile <ChevronRight size={16} />
        </button>
        <button
          onClick={() => {
            const session = db.getSession();
            if (session && session.user?.role === 'patient') {
              navigate('/dashboard/patient/book-appointment', { state: { doctor } });
            } else {
              navigate('/auth/patient/signin');
            }
          }}
          title="Book Appointment"
          className="p-2.5 border-2 border-[var(--color-primary)] text-[var(--color-primary)] rounded-2xl hover:bg-[var(--bg-primary)] transition-all"
        >
          <Calendar size={18} />
        </button>
      </div>
    </div>
  );
};

const Doctors = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const specialtyParam = searchParams.get('specialty') || 'All';
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState(searchParams.get('search') || searchParams.get('q') || '');
  const [activeSpecialty, setActiveSpecialty] = useState(specialtyParam);

  useEffect(() => {
    if (specialtyParam !== activeSpecialty) {
      setActiveSpecialty(specialtyParam);
    }
  }, [specialtyParam]);

  const handleSelectSpecialty = (spec) => {
    setActiveSpecialty(spec);
    const newParams = new URLSearchParams(searchParams);
    if (spec === 'All') {
      newParams.delete('specialty');
    } else {
      newParams.set('specialty', spec);
    }
    setSearchParams(newParams);
  };

  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        const all = await db.getDoctors();
        setDoctors(all);
      } catch (err) {
        console.error('Error fetching doctors:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchDoctors();
  }, []);

  const matchesSpecialty = (docSpecialty = '', activeSpec = '') => {
    if (activeSpec === 'All') return true;
    
    const docSpec = docSpecialty.toLowerCase();
    const actSpec = activeSpec.toLowerCase();
    
    if (docSpec.includes(actSpec) || actSpec.includes(docSpec)) return true;
    
    const mappings = {
      'cardiology': ['cardiologist', 'cardiology'],
      'neurology': ['neurologist', 'neurology'],
      'pediatrics': ['pediatrician', 'pediatrics'],
      'dermatology': ['dermatologist', 'dermatology'],
      'orthopedics': ['orthopedic', 'orthopedics'],
      'psychiatry': ['psychiatrist', 'psychiatry'],
      'general medicine': ['general practitioner', 'general medicine']
    };
    
    const mappedList = mappings[actSpec];
    if (mappedList) {
      return mappedList.some(item => docSpec.includes(item));
    }
    
    return false;
  };

  const filtered = doctors.filter(doc => {
    const matchSearch =
      !search.trim() ||
      doc.name?.toLowerCase().includes(search.toLowerCase()) ||
      doc.specialty?.toLowerCase().includes(search.toLowerCase()) ||
      doc.department?.toLowerCase().includes(search.toLowerCase());
    const matchSpecialty = matchesSpecialty(doc.specialty, activeSpecialty) || matchesSpecialty(doc.department, activeSpecialty);
    return matchSearch && matchSpecialty;
  });

  return (
    <div className="min-h-screen bg-[var(--bg-primary)]">
      <Navbar />

      {/* Hero banner */}
      <section className="relative pt-40 pb-20 px-4 overflow-hidden bg-white dark:bg-slate-950 transition-colors duration-300 border-b border-gray-100 dark:border-slate-900">
        <video 
          autoPlay 
          loop 
          muted 
          playsInline 
          className="absolute inset-0 w-full h-full object-cover opacity-75 z-0"
        >
          <source src="/videos/services_bg.mp4" type="video/mp4" />
        </video>
        <div className="absolute inset-0 bg-white/75 dark:bg-slate-950/70 backdrop-blur-[0.5px] z-0 transition-colors duration-300" />
        {/* decorative blobs */}
        <div className="absolute top-0 left-0 w-96 h-96 bg-blue-100/30 dark:bg-white/5 rounded-full -translate-x-1/2 -translate-y-1/2 blur-3xl z-0" />
        <div className="absolute bottom-0 right-0 w-80 h-80 bg-cyan-100/30 dark:bg-cyan-900/10 rounded-full translate-x-1/3 translate-y-1/3 blur-3xl z-0" />

        <div className="relative max-w-4xl mx-auto text-center z-10">
          <span className="inline-flex items-center gap-2 px-4 py-1.5 bg-blue-50 dark:bg-slate-900/50 text-[var(--color-primary)] dark:text-teal-400 text-xs font-bold rounded-full mb-6 border border-blue-100 dark:border-slate-800">
            <Stethoscope size={14} /> Our Medical Team
          </span>
          <h1 className="text-4xl md:text-6xl font-black text-slate-900 dark:text-white mb-4 leading-tight">
            Find Your <span className="text-[var(--color-primary)] dark:text-teal-400">Doctor</span>
          </h1>
          <p className="text-lg text-slate-500 dark:text-slate-400 font-medium max-w-xl mx-auto mb-10">
            Browse our team of board-certified specialists and book your appointment in seconds.
          </p>

          {/* Search bar */}
          <div className="relative max-w-xl mx-auto">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
            <input
              type="text"
              placeholder="Search by name, specialty or department…"
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-12 pr-4 py-4 rounded-2xl bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-sm font-medium shadow-md border border-gray-200 dark:border-slate-800 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
            />
          </div>
        </div>
      </section>

      {/* Specialty filter chips */}
      <section className="sticky top-0 z-30 bg-[var(--bg-primary)]/90 backdrop-blur-md border-b border-[var(--border-primary)] py-4 px-4">
        <div className="max-w-7xl mx-auto flex gap-2 overflow-x-auto scrollbar-hide pb-1">
          <Filter size={16} className="text-[var(--text-secondary)] flex-shrink-0 mt-1.5" />
          {SPECIALTIES.map(spec => (
            <button
              key={spec}
              onClick={() => handleSelectSpecialty(spec)}
              className={`px-4 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all flex-shrink-0 cursor-pointer ${
                activeSpecialty === spec
                  ? 'bg-[var(--color-primary)] text-white shadow-md'
                  : 'bg-[var(--bg-secondary)] text-[var(--text-secondary)] border border-[var(--border-primary)] hover:border-[var(--color-accent)] hover:text-[var(--color-primary)]'
              }`}
            >
              {spec}
            </button>
          ))}
        </div>
      </section>

      {/* Doctor grid */}
      <main className="max-w-7xl mx-auto px-4 py-12">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-32 gap-4 text-[var(--text-secondary)]">
            <Loader size={32} className="animate-spin text-[var(--color-primary)]" />
            <p className="font-bold">Loading doctors…</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-32 gap-4 text-center">
            <div className="w-20 h-20 bg-[var(--bg-secondary)] rounded-[2rem] flex items-center justify-center mb-2">
              <Stethoscope size={36} className="text-[var(--color-primary)]" />
            </div>
            <h2 className="text-xl font-black text-[var(--text-primary)]">No doctors found</h2>
            <p className="text-[var(--text-secondary)] text-sm max-w-xs">
              Try adjusting your search or selecting a different specialty.
            </p>
            <button
              onClick={() => { setSearch(''); handleSelectSpecialty('All'); }}
              className="mt-2 px-6 py-2.5 bg-[var(--color-primary)] text-white rounded-full text-sm font-bold hover:bg-[var(--color-accent)] transition-all cursor-pointer"
            >
              Clear Filters
            </button>
          </div>
        ) : (
          <>
            <p className="text-sm font-bold text-[var(--text-secondary)] mb-6">
              Showing <span className="text-[var(--text-primary)]">{filtered.length}</span> doctor{filtered.length !== 1 ? 's' : ''}
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filtered.map(doc => (
                <DoctorCard key={doc.id} doctor={doc} />
              ))}
            </div>
          </>
        )}
      </main>

      {/* Doctor Signup CTA */}
      <section className="max-w-7xl mx-auto px-4 py-10">
        <div className="bg-[var(--color-primary)] rounded-[2rem] p-8 md:p-12 flex flex-col md:flex-row items-center justify-between gap-8 shadow-2xl relative overflow-hidden">
          <div className="absolute -top-24 -right-24 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
          <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-black/10 rounded-full blur-3xl"></div>
          
          <div className="relative z-10 max-w-2xl text-center md:text-left">
            <h2 className="text-2xl md:text-3xl font-black text-white mb-3">
              Are you a medical professional?
            </h2>
            <p className="text-blue-100 text-sm md:text-base">
              Join Bashcare Hub and connect with thousands of patients. Manage your practice efficiently and grow your career with our state-of-the-art tools.
            </p>
          </div>
          
          <div className="relative z-10 flex-shrink-0">
            <Link 
              to="/doctor-onboarding"
              className="px-6 py-2.5 bg-white text-[var(--color-primary)] rounded-full font-bold text-sm md:text-base hover:bg-blue-50 transition-all shadow-xl hover:shadow-2xl hover:-translate-y-1 inline-block"
            >
              Join as a Doctor
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Doctors;
