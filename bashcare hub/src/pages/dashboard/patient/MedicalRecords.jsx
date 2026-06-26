import { useState, useEffect } from 'react';
import { 
  FileText, 
  Download, 
  Search, 
  Calendar, 
  ExternalLink,
  ClipboardList,
  FlaskConical,
  Stethoscope
} from 'lucide-react';
import { motion } from 'framer-motion';
import { db } from '../../../utils/db';

const MedicalRecords = ({ user }) => {
  const [filter, setFilter] = useState('all');
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRecords = async () => {
      try {
        const patientRecords = await db.getPatientRecords(user.id);
        setRecords(patientRecords);
      } catch (err) {
        console.error("Error fetching medical records:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchRecords();
  }, [user.id]);

  const categories = [
    { id: 'all', label: 'All Records', icon: <FileText size={18} /> },
    { id: 'diagnosis', label: 'Diagnoses', icon: <Stethoscope size={18} /> },
    { id: 'laboratory', label: 'Lab Results', icon: <FlaskConical size={18} /> },
    { id: 'visit', label: 'Visit History', icon: <ClipboardList size={18} /> }
  ];

  const filteredRecords = records.filter(rec => filter === 'all' || rec.category === filter);

  const getCategoryIcon = (cat) => {
    switch (cat) {
      case 'laboratory': return <FlaskConical className="text-purple-600" />;
      case 'imaging': return <FileText className="text-[var(--color-primary)]" />;
      case 'diagnosis': return <Stethoscope className="text-green-600" />;
      case 'visit': return <ClipboardList className="text-amber-600" />;
      default: return <FileText className="text-gray-600" />;
    }
  };

  const getCategoryBg = (cat) => {
    switch (cat) {
      case 'laboratory': return 'bg-purple-50';
      case 'imaging': return 'bg-[#f8fafc]';
      case 'diagnosis': return 'bg-green-50';
      case 'visit': return 'bg-amber-50';
      default: return 'bg-[#f8fafc]';
    }
  };

  if (loading) return <div className="p-8 text-center font-bold text-slate-500">Loading your medical records...</div>;

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Medical Records</h1>
          <p className="text-slate-500 text-sm">Access your complete medical history and test results.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
            <input 
              type="text" 
              placeholder="Search records..." 
              className="pl-10 pr-4 py-2.5 bg-[var(--bg-secondary)] border border-[var(--border-primary)] rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none w-64"
            />
          </div>
          <button className="bg-[var(--color-primary)] text-white px-5 py-2.5 rounded-xl text-sm font-bold flex items-center gap-2 hover:bg-gray-800 transition-all">
            <Download size={18} /> Export All
          </button>
        </div>
      </div>

      {/* Category Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2">
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setFilter(cat.id)}
            className={`flex items-center gap-2 px-5 py-3 rounded-2xl text-sm font-bold transition-all whitespace-nowrap ${
              filter === cat.id 
                ? 'bg-[var(--color-primary)] text-white shadow-lg shadow-blue-600/20' 
                : 'bg-[var(--bg-secondary)] text-slate-500 border border-[var(--border-primary)] hover:border-[var(--border-primary)]'
            }`}
          >
            {cat.icon}
            {cat.label}
          </button>
        ))}
      </div>

      {/* Records Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredRecords.map((rec, i) => (
          <motion.div
            key={rec.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="bg-[var(--bg-secondary)] p-6 rounded-[24px] shadow-sm hover:shadow-md transition-shadow fade-in hover:shadow-md transition-all duration-300 border border-[var(--border-primary)] hover:shadow-md transition-all group"
          >
            <div className="flex items-start gap-4">
              <div className={`p-4 rounded-2xl ${getCategoryBg(rec.category)} text-[var(--color-primary)]`}>
                {getCategoryIcon(rec.category)}
              </div>
              <div className="flex-grow">
                <div className="flex items-center justify-between mb-1">
                  <h3 className="font-bold text-slate-900 group-hover:text-[var(--color-primary)] transition-colors">{rec.title || rec.diagnosis}</h3>
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{rec.status || 'Finalized'}</span>
                </div>
                <div className="space-y-1 mb-4">
                  <p className="text-xs font-medium text-slate-500 flex items-center gap-2">
                    <Calendar size={12} /> {new Date(rec.date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                  </p>
                  <p className="text-xs font-medium text-slate-500">By {rec.doctorName} • {rec.hospital || 'Bashcare Hub'}</p>
                </div>
                
                <div className="flex items-center gap-3">
                  <button className="flex-grow py-2.5 bg-white text-slate-500 rounded-xl text-xs font-bold hover:bg-white transition-all flex items-center justify-center gap-2">
                    <ExternalLink size={14} /> View Details
                  </button>
                  <button className="p-2.5 bg-[#f8fafc] text-[var(--color-primary)] rounded-xl hover:bg-[var(--color-primary)] hover:text-white transition-all">
                    <Download size={16} />
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        ))}

        {filteredRecords.length === 0 && (
          <div className="col-span-full text-center py-20 bg-[var(--bg-secondary)] rounded-[3rem] border border-dashed border-[var(--border-primary)]">
            <div className="bg-[#f8fafc] w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <FileText size={32} className="text-gray-300" />
            </div>
            <h3 className="text-lg font-bold text-slate-900">No records found</h3>
            <p className="text-slate-500 text-sm mt-1">We couldn't find any medical records in this category.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default MedicalRecords;


