import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Users, 
  Search, 
  Filter, 
  FileText, 
  MessageSquare,
  Sparkles,
  HeartHandshake
} from 'lucide-react';
import { motion } from 'framer-motion';
import { db } from '../../../utils/db';

const Patients = ({ user }) => {
  const navigate = useNavigate();
  const [activePatients, setActivePatients] = useState([]);
  const [allPatients, setAllPatients] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('active'); // 'active' (my clinic) or 'directory' (all database)

  useEffect(() => {
    const loadPatients = async () => {
      try {
        const [allAppts, allUsers] = await Promise.all([
          db.getAppointments(),
          db.getUsers()
        ]);
        
        // Active patients: those who have booked an appointment with this doctor
        const appointments = allAppts.filter(a => a.doctorId === user.id);
        const patientIds = [...new Set(appointments.map(a => a.patientId))];
        const myPatients = allUsers.filter(u => patientIds.includes(u.id));
        setActivePatients(myPatients);

        // All patients: all users in the system with the role 'patient'
        const patientsInSystem = allUsers.filter(u => u.role === 'patient');
        setAllPatients(patientsInSystem);

        setLoading(false);
      } catch (error) {
        console.error("Error loading patients:", error);
        setLoading(false);
      }
    };
    loadPatients();
  }, [user.id]);

  const handleChat = (patient) => {
    navigate('/dashboard/doctor/messages', { 
      state: { 
        patient: { 
          id: patient.id || patient._id, 
          name: patient.name,
          email: patient.email 
        } 
      } 
    });
  };

  const handleCreateRecord = (patient) => {
    navigate('/dashboard/doctor/consultations', { 
      state: { 
        patient: { 
          id: patient.id || patient._id, 
          name: patient.name 
        } 
      } 
    });
  };

  const currentPatientsList = activeTab === 'active' ? activePatients : allPatients;

  const filteredPatients = currentPatientsList.filter(p => 
    (p.name || '').toLowerCase().includes(searchQuery.toLowerCase()) || 
    (p.email || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) return <div className="p-8 text-center font-bold text-slate-500">Loading clinical directory...</div>;

  return (
    <div className="space-y-8">
      {/* Header section with styling */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 bg-gradient-to-br from-blue-600/10 to-indigo-600/5 p-8 rounded-[24px] border border-blue-50/50">
        <div>
          <div className="flex items-center gap-2 text-xs font-black text-[var(--color-primary)] uppercase tracking-widest mb-1.5">
            <Sparkles size={14} /> Clinical Directory
          </div>
          <h1 className="text-3xl font-black text-slate-900">Patients Registry</h1>
          <p className="text-slate-500 text-sm font-medium mt-0.5">Search and chat with any patient or access clinical records.</p>
        </div>

        {/* Tab switcher */}
        <div className="flex bg-white p-1.5 rounded-2xl self-start lg:self-center border border-slate-200/50">
          <button 
            onClick={() => { setActiveTab('active'); setSearchQuery(''); }}
            className={`px-6 py-2.5 rounded-xl text-xs font-bold transition-all ${activeTab === 'active' ? 'bg-white text-[var(--color-primary)] shadow-sm hover:shadow-md transition-shadow fade-in hover:shadow-md transition-all duration-300' : 'text-slate-500 hover:text-slate-900'}`}
          >
            My Active Patients ({activePatients.length})
          </button>
          <button 
            onClick={() => { setActiveTab('directory'); setSearchQuery(''); }}
            className={`px-6 py-2.5 rounded-xl text-xs font-bold transition-all ${activeTab === 'directory' ? 'bg-white text-[var(--color-primary)] shadow-sm hover:shadow-md transition-shadow fade-in hover:shadow-md transition-all duration-300' : 'text-slate-500 hover:text-slate-900'}`}
          >
            All Database Patients ({allPatients.length})
          </button>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="flex items-center gap-4 bg-[var(--bg-secondary)] p-4 rounded-[24px] border border-[var(--border-primary)] shadow-sm hover:shadow-md transition-shadow fade-in hover:shadow-md transition-all duration-300">
        <div className="relative flex-grow">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
          <input 
            type="text" 
            placeholder={activeTab === 'active' ? "Search clinic patients by name or email..." : "Search entire patient database by name or email..."}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-[#f8fafc] border-none rounded-2xl text-sm focus:ring-2 focus:ring-blue-500/20 outline-none text-slate-900 font-medium transition-all"
          />
        </div>
        <button className="p-3 bg-[#f8fafc] border border-[var(--border-primary)] rounded-2xl text-gray-500 hover:text-[var(--color-primary)] hover:border-blue-200 transition-all">
          <Filter size={18} />
        </button>
      </div>

      {/* Patients Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredPatients.map((patient, i) => (
          <motion.div
            key={patient.id || patient._id}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.04 }}
            className="bg-[var(--bg-secondary)] p-6 rounded-[24px] shadow-sm hover:shadow-md transition-shadow fade-in hover:shadow-md transition-all duration-300 border border-[var(--border-primary)] hover:border-blue-100 hover:shadow-md transition-all group flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center gap-4 mb-6">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-100/50 flex items-center justify-center text-[var(--color-primary)] font-bold text-lg">
                  {patient.profileImage ? (
                    <img src={patient.profileImage} alt={patient.name} className="w-full h-full object-cover rounded-2xl" />
                  ) : (
                    patient.name.split(' ').map(n => n[0]).join('')
                  )}
                </div>
                <div className="min-w-0">
                  <h3 className="font-bold text-slate-900 truncate text-base">{patient.name}</h3>
                  <p className="text-xs text-slate-500 font-medium truncate">{patient.email}</p>
                </div>
              </div>

              {/* Bio / Details */}
              <div className="space-y-2 mb-6">
                <div className="flex justify-between items-center bg-white px-4 py-2.5 rounded-2xl text-xs font-semibold text-slate-500">
                  <span>Phone:</span>
                  <span className="text-slate-900">{patient.phone || 'Not provided'}</span>
                </div>
                <div className="flex justify-between items-center bg-white px-4 py-2.5 rounded-2xl text-xs font-semibold text-slate-500">
                  <span>Gender / Blood:</span>
                  <span className="text-slate-900">
                    {patient.gender || 'N/A'} {patient.bloodGroup ? `(${patient.bloodGroup})` : ''}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3 mt-4 pt-4 border-t border-slate-50">
              <button 
                onClick={() => handleCreateRecord(patient)}
                className="flex-grow py-3 bg-[var(--color-primary)] text-white rounded-2xl text-xs font-bold hover:bg-gray-800 transition-all flex items-center justify-center gap-2 shadow-md shadow-blue-500/10 active:scale-98"
              >
                <FileText size={14} /> Medical Profile
              </button>
              <button 
                onClick={() => handleChat(patient)}
                className="p-3 bg-blue-50/50 text-[var(--color-primary)] rounded-2xl hover:bg-[var(--color-primary)] hover:text-white transition-all active:scale-98"
                title="Send Chat Message"
              >
                <MessageSquare size={16} />
              </button>
            </div>
          </motion.div>
        ))}

        {filteredPatients.length === 0 && (
          <div className="col-span-full text-center py-24 bg-[var(--bg-secondary)] rounded-[3rem] border border-dashed border-[var(--border-primary)]">
            <div className="bg-[#f8fafc] w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <HeartHandshake size={32} className="text-gray-300" />
            </div>
            <h3 className="text-lg font-bold text-slate-900">No matches found</h3>
            <p className="text-slate-500 text-sm mt-1">We couldn't find any patient matching "{searchQuery}" in this list.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Patients;
