import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Stethoscope, 
  Star, 
  MapPin, 
  Calendar, 
  Clock, 
  ShieldCheck, 
  MessageSquare,
  ChevronLeft,
  GraduationCap,
  History,
  Building,
  User
} from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import BackgroundPanel from '../components/BackgroundPanel';
import { db } from '../utils/db';

const DoctorProfile = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [doctor, setDoctor] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDoctor = async () => {
      try {
        const doc = await db.getDoctor(id);
        setDoctor(doc);
      } catch (err) {
        console.error("Error fetching doctor:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchDoctor();
  }, [id]);

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <div className="animate-pulse flex flex-col items-center gap-4">
        <div className="w-24 h-24 bg-slate-200 rounded-full"></div>
        <div className="h-4 w-48 bg-slate-200 rounded-lg"></div>
      </div>
    </div>
  );

  if (!doctor) return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-[var(--text-primary)] mb-2">Doctor Not Found</h2>
        <button onClick={() => navigate(-1)} className="text-[var(--color-primary)] font-bold hover:underline flex items-center gap-2 justify-center">
          <ChevronLeft size={20} /> Go Back
        </button>
      </div>
    </div>
  );

  return (
    <div className="relative min-h-screen bg-slate-50 overflow-hidden">
      <BackgroundPanel
        images={[
          'https://images.unsplash.com/photo-1493809842364-78817add7ffb?auto=format&fit=crop&q=80&w=1600',
          'https://images.unsplash.com/photo-1550831107-1553da8c8464?auto=format&fit=crop&q=80&w=1600',
          'https://images.unsplash.com/photo-1526256262350-7da7584cf5eb?auto=format&fit=crop&q=80&w=1600',
        ]}
        className="absolute inset-0 opacity-90"
      />
      <Navbar />
      
      <main className="relative z-10 max-w-7xl mx-auto px-4 py-12 md:py-20">
        <button 
          onClick={() => navigate(-1)}
          className="mb-8 flex items-center gap-2 text-[var(--text-secondary)] font-bold hover:text-[var(--color-primary)] transition-colors"
        >
          <ChevronLeft size={20} /> Back to Search
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column: Info & Stats */}
          <div className="lg:col-span-2 space-y-8">
            <section className="bg-[var(--bg-secondary)] rounded-[3rem] p-8 md:p-12 shadow-sm border border-[var(--border-primary)]">
              <div className="flex flex-col md:flex-row gap-8 items-start">
                <div className="relative">
                  <div className="w-32 h-32 md:w-48 md:h-48 rounded-[3rem] bg-blue-100 overflow-hidden border-4 border-white shadow-xl">
                    {doctor.profilePicture ? (
                      <img src={doctor.profilePicture} alt={doctor.name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-[var(--color-primary)] text-6xl font-black">
                        {doctor.name.split(' ').map(n => n[0]).join('')}
                      </div>
                    )}
                  </div>
                  <div className="absolute -bottom-2 -right-2 bg-[var(--color-primary)] text-white p-3 rounded-2xl border-4 border-white shadow-lg">
                    <ShieldCheck size={24} />
                  </div>
                </div>

                <div className="flex-grow">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
                    <div>
                      <h1 className="text-3xl font-black text-[var(--text-primary)] mb-2">{doctor.name}</h1>
                      <p className="text-lg font-bold text-[var(--color-primary)] mb-4">{doctor.professionalRole || doctor.specialty}</p>
                      <div className="flex items-center gap-6 text-[var(--text-secondary)] font-medium">
                        <div className="flex items-center gap-1.5">
                          <Star size={18} className="text-amber-500" fill="currentColor" />
                          <span className="text-[var(--text-primary)] font-bold">{doctor.rating || '4.9'}</span>
                          <span>(50+ Reviews)</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <MapPin size={18} className="text-red-500" />
                          <span>Bashcare Hospital</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8 pt-8 border-t border-gray-50">
                    {[
                      { label: 'Experience', value: doctor.experience || '10+ Years', icon: <History className="text-[var(--color-primary)]" /> },
                      { label: 'Patients', value: '1,200+', icon: <User className="text-green-600" /> },
                      { label: 'Dept', value: doctor.department || 'Clinical', icon: <Building className="text-purple-600" /> },
                      { label: 'Rating', value: doctor.rating || '4.9', icon: <Star className="text-amber-500" /> },
                    ].map((stat, i) => (
                      <div key={i} className="text-center md:text-left">
                        <div className="flex items-center justify-center md:justify-start gap-2 mb-1 text-[var(--text-secondary)]">
                          {stat.icon}
                          <span className="text-[10px] font-black uppercase tracking-widest">{stat.label}</span>
                        </div>
                        <p className="font-bold text-[var(--text-primary)]">{stat.value}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </section>

            <section className="bg-[var(--bg-secondary)] rounded-[3rem] p-8 md:p-12 shadow-sm border border-[var(--border-primary)]">
              <h2 className="text-2xl font-bold text-[var(--text-primary)] mb-6 flex items-center gap-3">
                <div className="w-10 h-10 bg-[var(--bg-primary)] rounded-xl flex items-center justify-center text-[var(--color-primary)]">
                  <Stethoscope size={20} />
                </div>
                Professional Biography
              </h2>
              <p className="text-gray-600 leading-relaxed text-lg font-medium">
                {doctor.bio || doctor.about || `Dr. ${doctor.name} is a highly skilled ${doctor.specialty} with years of experience in providing exceptional medical care. Specializing in ${doctor.specialty}, they have dedicated their career to improving patient outcomes through evidence-based medicine and a compassionate approach.`}
              </p>
            </section>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <section className="bg-[var(--bg-secondary)] rounded-[3rem] p-8 shadow-sm border border-[var(--border-primary)]">
                <h3 className="text-xl font-bold text-[var(--text-primary)] mb-6 flex items-center gap-3">
                  <GraduationCap size={20} className="text-[var(--color-primary)]" /> Education
                </h3>
                <ul className="space-y-4">
                  {doctor.education?.length > 0 ? doctor.education.map((edu, i) => (
                    <li key={i} className="flex gap-4">
                      <div className="w-2 h-2 rounded-full bg-[var(--color-primary)] mt-2 flex-shrink-0"></div>
                      <p className="font-medium text-[var(--text-secondary)]">{edu}</p>
                    </li>
                  )) : (
                    <li className="text-[var(--text-secondary)] font-medium">Details not provided</li>
                  )}
                </ul>
              </section>

              <section className="bg-[var(--bg-secondary)] rounded-[3rem] p-8 shadow-sm border border-[var(--border-primary)]">
                <h3 className="text-xl font-bold text-[var(--text-primary)] mb-6 flex items-center gap-3">
                  <Star size={20} className="text-[var(--color-primary)]" /> Specializations
                </h3>
                <div className="flex flex-wrap gap-2">
                  {[doctor.specialty, ...(doctor.category ? [doctor.category] : []), 'Diagnostic Medicine', 'Primary Care'].map((spec, i) => (
                    <span key={i} className="px-4 py-2 bg-[var(--bg-primary)] text-[var(--color-primary)] rounded-full text-xs font-bold border border-blue-100">{spec}</span>
                  ))}
                </div>
              </section>
            </div>
          </div>

          {/* Right Column: Booking & Availability */}
          <div className="space-y-8">
            <section className="bg-[var(--bg-secondary)] rounded-[3rem] p-8 shadow-sm border border-[var(--border-primary)] sticky top-24">
              <div className="mb-8">
                <h3 className="text-xl font-bold text-[var(--text-primary)] mb-2">Weekly Availability</h3>
                <p className="text-sm text-[var(--text-secondary)] font-medium">Set consultation times for patients</p>
              </div>

              <div className="space-y-4 mb-8">
                {doctor.availableTime?.length > 0 ? doctor.availableTime.map((at, i) => (
                  <div key={i} className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl">
                    <span className="font-bold text-[var(--text-primary)]">{at.day}</span>
                    <div className="text-right">
                      {at.slots.map((slot, j) => (
                        <p key={j} className="text-xs font-medium text-[var(--color-primary)]">{slot}</p>
                      ))}
                    </div>
                  </div>
                )) : (
                  <p className="text-center py-6 text-[var(--text-secondary)] font-medium bg-slate-50 rounded-2xl italic">No availability set</p>
                )}
              </div>

              <div className="space-y-4">
                <button 
                  onClick={() => {
                    const session = db.getSession();
                    if (session && session.user?.role === 'patient') {
                      navigate('/dashboard/patient/book-appointment', { state: { doctor } });
                    } else {
                      navigate('/auth/patient/signin');
                    }
                  }}
                  className="w-full py-5 bg-[var(--color-primary)] text-white rounded-[2rem] font-black text-lg shadow-xl shadow-blue-600/20 hover:bg-blue-700 transition-all active:scale-[0.98] flex items-center justify-center gap-3"
                >
                  <Calendar size={24} /> Book Appointment
                </button>
                <button 
                  onClick={() => {
                    const session = db.getSession();
                    if (session && session.user?.role === 'patient') {
                      navigate('/dashboard/patient/messages', { state: { doctor } });
                    } else {
                      navigate('/auth/patient/signin');
                    }
                  }}
                  className="w-full py-5 bg-[var(--bg-secondary)] text-[var(--color-primary)] border-2 border-blue-600 rounded-[2rem] font-black text-lg hover:bg-[var(--bg-primary)] transition-all flex items-center justify-center gap-3"
                >
                  <MessageSquare size={24} /> Start Consultation
                </button>
              </div>

              <div className="mt-8 p-6 bg-amber-50 rounded-3xl border border-amber-100 flex items-start gap-4">
                <Clock className="text-amber-600 flex-shrink-0" size={20} />
                <p className="text-xs font-bold text-amber-800 leading-relaxed">
                  Note: Emergency cases are handled 24/7. Please call the hospital directly for urgent medical assistance.
                </p>
              </div>
            </section>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default DoctorProfile;

