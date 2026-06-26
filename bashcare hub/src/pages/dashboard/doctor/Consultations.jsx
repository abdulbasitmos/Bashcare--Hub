import { useState, useEffect, useCallback } from 'react';
import { 
  FileText, 
  Plus, 
  Search, 
  Calendar, 
  ChevronRight,
  X,
  Loader,
  UserPlus
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { db } from '../../../utils/db';

const Consultations = ({ user }) => {
  const [records, setRecords] = useState([]);
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newRecord, setNewRecord] = useState({
    patientId: '',
    patientName: '',
    diagnosis: '',
    treatment: '',
    notes: '',
    category: 'diagnosis'
  });
  const [patientSearchQuery, setPatientSearchQuery] = useState('');
  const [patientSearchResults, setPatientSearchResults] = useState([]);
  const [isSearchingPatients, setIsSearchingPatients] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState(null);

  const fetchData = useCallback(async () => {
    try {
      const [allRecords, allAppointments, allUsers] = await Promise.all([
        db.getDoctorRecords(user.id),
        db.getAppointments(),
        db.getUsers()
      ]);

      setRecords(allRecords);
      
      const appointments = allAppointments.filter(a => a.doctorId === user.id);
      const patientIds = [...new Set(appointments.map(a => a.patientId))];
      setPatients(allUsers.filter(u => patientIds.includes(u.id)));
      
      setLoading(false);
    } catch (error) {
      console.error("Error fetching data:", error);
      setLoading(false);
    }
  }, [user.id]);

  useEffect(() => {
    const load = async () => {
      await fetchData();
    };
    load();
  }, [fetchData]);

  // Patient search with debounce
  useEffect(() => {
    if (!patientSearchQuery.trim()) {
      setPatientSearchResults([]);
      return;
    }
    const timeout = setTimeout(async () => {
      setIsSearchingPatients(true);
      try {
        const results = await db.searchUsersForChat(patientSearchQuery);
        setPatientSearchResults((results || []).filter(u => u.role === 'patient'));
      } catch (err) {
        console.error('Error searching patients:', err);
      } finally {
        setIsSearchingPatients(false);
      }
    }, 300);
    return () => clearTimeout(timeout);
  }, [patientSearchQuery]);

  const handleSelectPatient = (patient) => {
    const id = patient.id || patient._id;
    setSelectedPatient(patient);
    setNewRecord({ ...newRecord, patientId: id, patientName: patient.name });
    setPatientSearchQuery('');
    setPatientSearchResults([]);
    // Also add to patients list if not already there
    if (!patients.find(p => (p.id || p._id) === id)) {
      setPatients(prev => [...prev, patient]);
    }
  };

  const handleCreateRecord = async (e) => {
    e.preventDefault();
    const patient = selectedPatient || patients.find(p => (p.id || p._id) === newRecord.patientId);
    if (!patient) {
      alert('Please search and select a patient first.');
      return;
    }

    try {
      await db.addRecord({
        ...newRecord,
        doctorId: user.id,
        doctorName: user.name,
        patientName: patient.name
      });

      await db.addNotification({
        userId: patient.id,
        title: 'New Medical Record',
        message: `${user.name} has added a new record to your medical history.`,
        type: 'record'
      });

      setIsModalOpen(false);
      setNewRecord({ patientId: '', patientName: '', diagnosis: '', treatment: '', notes: '', category: 'diagnosis' });
      setSelectedPatient(null);
      setPatientSearchQuery('');
      await fetchData();
      alert('Medical record created successfully!');
    } catch (error) {
      console.error("Error creating medical record:", error);
    }
  };

  if (loading) return <div className="p-8 text-center font-bold text-slate-500">Loading consultations...</div>;

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Medical Records</h1>
          <p className="text-slate-500 text-sm">Create and manage patient clinical documentation.</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 bg-[var(--color-primary)] text-white px-6 py-3 rounded-2xl font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-600/20"
        >
          <Plus size={20} /> Create New Record
        </button>
      </div>

      <div className="bg-[var(--bg-secondary)] rounded-[24px] shadow-sm hover:shadow-md transition-shadow fade-in hover:shadow-md transition-all duration-300 border border-[var(--border-primary)] overflow-hidden">
        <div className="p-6 border-b border-gray-50">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
            <input 
              type="text" 
              placeholder="Search by patient or diagnosis..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-4 py-2.5 bg-white border-none rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none w-full md:w-80"
            />
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-white text-[10px] font-black text-slate-500 uppercase tracking-widest border-b border-gray-50">
                <th className="px-8 py-4">Patient</th>
                <th className="px-8 py-4">Diagnosis</th>
                <th className="px-8 py-4">Date</th>
                <th className="px-8 py-4">Category</th>
                <th className="px-8 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {(() => {
                const filteredRecords = records.filter(r => {
                  if (!searchQuery.trim()) return true;
                  const query = searchQuery.toLowerCase();
                  return (r.patientName || '').toLowerCase().includes(query) ||
                         (r.diagnosis || '').toLowerCase().includes(query) ||
                         (r.category || '').toLowerCase().includes(query);
                });
                return filteredRecords.length > 0 ? filteredRecords.map((rec) => (
                <tr key={rec.id} className="hover:bg-white transition-colors group">
                  <td className="px-8 py-5">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-[#f8fafc] flex items-center justify-center text-[var(--color-primary)] font-bold text-xs">
                        {rec.patientName?.split(' ').map(n => n[0]).join('')}
                      </div>
                      <p className="font-bold text-slate-900 text-sm">{rec.patientName}</p>
                    </div>
                  </td>
                  <td className="px-8 py-5">
                    <p className="text-sm font-medium text-slate-500">{rec.diagnosis}</p>
                  </td>
                  <td className="px-8 py-5">
                    <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
                      <Calendar size={14} /> {new Date(rec.date).toLocaleDateString()}
                    </div>
                  </td>
                  <td className="px-8 py-5">
                    <span className="px-2 py-1 bg-[#f8fafc] text-[var(--color-primary)] rounded-lg text-[10px] font-bold uppercase">
                      {rec.category}
                    </span>
                  </td>
                  <td className="px-8 py-5 text-right">
                    <button className="p-2 text-slate-500 hover:text-[var(--color-primary)] rounded-lg">
                      <ChevronRight size={20} />
                    </button>
                  </td>
                </tr>
              )) : null;
              })()}
            </tbody>
          </table>
        </div>
        {records.length === 0 && !searchQuery.trim() && (
          <div className="text-center py-20">
            <FileText size={48} className="mx-auto text-gray-200 mb-4" />
            <p className="text-slate-500 font-medium">No medical records found.</p>
          </div>
        )}
        {searchQuery.trim() && records.filter(r => {
          const query = searchQuery.toLowerCase();
          return (r.patientName || '').toLowerCase().includes(query) ||
                 (r.diagnosis || '').toLowerCase().includes(query) ||
                 (r.category || '').toLowerCase().includes(query);
        }).length === 0 && (
          <div className="text-center py-20">
            <FileText size={48} className="mx-auto text-gray-200 mb-4" />
            <p className="text-slate-500 font-medium">No records matching "{searchQuery}"</p>
          </div>
        )}
      </div>

      {/* Create Record Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsModalOpen(false)}
              className="absolute inset-0 bg-[var(--color-primary)]/60 backdrop-blur-sm"
            ></motion.div>
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative bg-[var(--bg-secondary)] w-full max-w-2xl rounded-[24px] shadow-2xl overflow-hidden"
            >
              <div className="p-8 border-b border-[var(--border-primary)] flex items-center justify-between">
                <h2 className="text-2xl font-bold text-slate-900">New Clinical Record</h2>
                <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-[#f8fafc] rounded-xl transition-all">
                  <X size={24} />
                </button>
              </div>
              <form onSubmit={handleCreateRecord} className="p-8 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-bold text-slate-500 mb-2">Patient</label>
                    {selectedPatient ? (
                      <div className="flex items-center gap-3 p-4 bg-blue-50/50  rounded-2xl border border-blue-100 ">
                        <div className="w-10 h-10 rounded-xl bg-[var(--color-primary)] text-white flex items-center justify-center font-bold text-sm">
                          {(selectedPatient.name || '').split(' ').map(n => n[0]).join('')}
                        </div>
                        <div className="flex-grow min-w-0">
                          <p className="text-sm font-bold text-slate-900 truncate">{selectedPatient.name}</p>
                          <p className="text-[10px] text-slate-500 truncate">{selectedPatient.email}</p>
                        </div>
                        <button
                          type="button"
                          onClick={() => { setSelectedPatient(null); setNewRecord({ ...newRecord, patientId: '', patientName: '' }); }}
                          className="p-1.5 hover:bg-blue-100 dark:bg-blue-800/30 rounded-lg transition-all"
                        >
                          <X size={16} className="text-slate-500" />
                        </button>
                      </div>
                    ) : (
                      <div className="relative">
                        <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
                        <input
                          type="text"
                          placeholder="Search patient by name..."
                          value={patientSearchQuery}
                          onChange={(e) => setPatientSearchQuery(e.target.value)}
                          className="w-full p-4 pl-11 bg-white border-none rounded-2xl focus:ring-2 focus:ring-blue-500 font-medium text-sm"
                        />
                        {patientSearchQuery.trim() && (
                          <div className="absolute top-full left-0 right-0 mt-2 bg-[var(--bg-secondary)]  border border-[var(--border-primary)]  rounded-2xl shadow-2xl overflow-hidden z-50 max-h-56 overflow-y-auto">
                            {isSearchingPatients ? (
                              <div className="flex items-center justify-center gap-2 p-5 text-slate-500">
                                <Loader size={16} className="animate-spin" />
                                <span className="text-xs font-bold">Searching...</span>
                              </div>
                            ) : patientSearchResults.length > 0 ? (
                              patientSearchResults.map((result) => (
                                <button
                                  key={result.id || result._id}
                                  type="button"
                                  onClick={() => handleSelectPatient(result)}
                                  className="w-full p-3.5 flex items-center gap-3 hover:bg-blue-50/50 dark:bg-slate-700 transition-all text-left border-b border-[var(--border-primary)]  last:border-none"
                                >
                                  <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-100 to-indigo-100   flex items-center justify-center text-[var(--color-primary)] font-bold text-xs">
                                    {(result.name || '').split(' ').map(n => n[0]).join('')}
                                  </div>
                                  <div className="flex-grow min-w-0">
                                    <p className="text-sm font-bold text-slate-900 truncate">{result.name}</p>
                                    <p className="text-[10px] text-slate-500 truncate">{result.email}</p>
                                  </div>
                                  <UserPlus size={14} className="text-[var(--color-primary)] flex-shrink-0" />
                                </button>
                              ))
                            ) : (
                              <div className="p-5 text-center">
                                <p className="text-xs font-bold text-slate-500">No patients found for "{patientSearchQuery}"</p>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-500 mb-2">Category</label>
                    <select 
                      value={newRecord.category}
                      onChange={(e) => setNewRecord({...newRecord, category: e.target.value})}
                      className="w-full p-4 bg-white border-none rounded-2xl focus:ring-2 focus:ring-blue-500 font-medium"
                    >
                      <option value="diagnosis">Diagnosis</option>
                      <option value="laboratory">Laboratory Result</option>
                      <option value="visit">Visit Note</option>
                      <option value="imaging">Imaging</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-500 mb-2">Diagnosis / Title</label>
                  <input 
                    type="text" 
                    required
                    value={newRecord.diagnosis}
                    onChange={(e) => setNewRecord({...newRecord, diagnosis: e.target.value})}
                    placeholder="e.g., Acute Respiratory Infection"
                    className="w-full p-4 bg-white border-none rounded-2xl focus:ring-2 focus:ring-blue-500 font-medium"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-500 mb-2">Treatment Plan</label>
                  <textarea 
                    rows="3"
                    value={newRecord.treatment}
                    onChange={(e) => setNewRecord({...newRecord, treatment: e.target.value})}
                    placeholder="Describe the treatment plan..."
                    className="w-full p-4 bg-white border-none rounded-2xl focus:ring-2 focus:ring-blue-500 font-medium resize-none"
                  ></textarea>
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-500 mb-2">Clinical Notes</label>
                  <textarea 
                    rows="3"
                    value={newRecord.notes}
                    onChange={(e) => setNewRecord({...newRecord, notes: e.target.value})}
                    placeholder="Additional clinical observations..."
                    className="w-full p-4 bg-white border-none rounded-2xl focus:ring-2 focus:ring-blue-500 font-medium resize-none"
                  ></textarea>
                </div>
                <button type="submit" className="w-full py-4 bg-[var(--color-primary)] text-white rounded-2xl font-bold shadow-lg shadow-blue-600/20 hover:bg-blue-700 transition-all">
                  Save Clinical Record
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Consultations;

