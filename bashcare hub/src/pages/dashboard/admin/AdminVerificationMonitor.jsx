import { useState, useEffect, useCallback } from 'react';
import { 
  ShieldAlert, 
  Search, 
  MessageSquare,
  Eye
} from 'lucide-react';
import { db } from '../../../utils/db';
import { useGlobalSettings } from '../../../context/GlobalSettingsContext';

const AdminVerificationMonitor = () => {
  const { t } = useGlobalSettings();
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedChat, setSelectedChat] = useState(null);
  const [chats, setChats] = useState({});

  const fetchData = useCallback(async () => {
    try {
      const [allDocs, allChats] = await Promise.all([
        db.getDoctors(),
        db.getChats()
      ]);
      setDoctors(allDocs);
      
      const formattedChats = {};
      allChats.forEach(chat => {
        const doctor = allDocs.find(d => chat.participants.includes(d.id) || chat.participants.includes(d._id));
        if (doctor) {
          formattedChats[doctor.id] = chat.messages;
        }
      });
      setChats(formattedChats);
      setLoading(false);
    } catch (err) {
      console.error("Error fetching data:", err);
    }
  }, []);

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 5000);
    return () => clearInterval(interval);
  }, [fetchData]);

  if (loading) return <div className="p-8 text-center font-bold text-slate-500 (--text-secondary)]">Loading monitor...</div>;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-slate-900  flex items-center gap-3">
          {t('verifications')} <ShieldAlert className="text-[var(--color-primary)]" />
        </h1>
        <p className="text-slate-500 (--text-secondary)] mt-1">Supervise the medical verification process in real-time.</p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        <div className="xl:col-span-2 space-y-6">
          <section className="bg-[var(--bg-secondary)]  rounded-[24px] shadow-sm hover:shadow-md transition-shadow fade-in hover:shadow-md transition-all duration-300 border border-[var(--border-primary)]  overflow-hidden transition-colors">
            <div className="p-8 border-b border-gray-50  flex items-center justify-between">
              <h2 className="text-xl font-bold text-slate-900 ">Applicant Tracking</h2>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
                <input 
                  type="text" 
                  placeholder="Filter applicants..." 
                  className="pl-10 pr-4 py-2 bg-white  border-none rounded-xl text-xs focus:ring-2 focus:ring-blue-500/20 w-64 text-slate-900 "
                />
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-white  text-[10px] font-black text-slate-500 uppercase tracking-widest border-b border-gray-50 ">
                    <th className="px-8 py-4">Applicant</th>
                    <th className="px-8 py-4">Status</th>
                    <th className="px-8 py-4">Onboarding</th>
                    <th className="px-8 py-4 text-right">Monitoring</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50 ">
                  {doctors.map((doc) => (
                    <tr key={doc.id} className="hover:bg-white dark:bg-slate-900/50 transition-colors">
                      <td className="px-8 py-5">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-[#f8fafc]  flex items-center justify-center text-[var(--color-primary)]  font-bold text-xs">
                            {doc.name.split(' ').map(n => n[0]).join('')}
                          </div>
                          <div>
                            <p className="font-bold text-slate-900  text-sm">{doc.name}</p>
                            <p className="text-[11px] text-slate-500 (--text-secondary)]">{doc.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-5">
                        <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest ${
                          doc.status === 'active' ? 'bg-green-100 text-green-700  ' :
                          doc.status === 'pending' ? 'bg-amber-100 text-amber-700  ' :
                          doc.status === 'verified' ? 'bg-blue-100 text-[var(--color-primary)]  ' :
                          'bg-red-100 text-red-700  '
                        }`}>
                          {doc.status}
                        </span>
                      </td>
                      <td className="px-8 py-5">
                        <div className="flex items-center gap-2">
                          <div className={`w-2 h-2 rounded-full ${doc.isProfileComplete ? 'bg-[#22C55E]' : 'bg-gray-300'}`}></div>
                          <span className="text-xs font-medium text-gray-600 (--text-secondary)]">{doc.isProfileComplete ? 'Complete' : 'Incomplete'}</span>
                        </div>
                      </td>
                      <td className="px-8 py-5 text-right">
                        <button 
                          onClick={() => setSelectedChat({ id: doc.id, name: doc.name })}
                          className="p-2 text-slate-500 hover:text-[var(--color-primary)] dark:text-blue-400 bg-white  rounded-xl transition-all"
                        >
                          <Eye size={18} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </div>

        <div className="space-y-6">
          <section className="bg-[var(--bg-secondary)]  rounded-[24px] shadow-sm hover:shadow-md transition-shadow fade-in hover:shadow-md transition-all duration-300 border border-[var(--border-primary)]  h-[600px] flex flex-col overflow-hidden transition-colors">
            <div className="p-6 border-b border-gray-50  flex items-center justify-between">
              <h3 className="font-bold text-slate-900  flex items-center gap-2">
                <MessageSquare size={18} className="text-[var(--color-primary)]" /> Interview Logs
              </h3>
              {selectedChat && (
                <span className="text-[10px] font-bold px-2 py-0.5 bg-[#f8fafc]  text-[var(--color-primary)]  rounded-full">{selectedChat.name}</span>
              )}
            </div>
            
            <div className="flex-grow overflow-y-auto p-6 space-y-4 custom-scrollbar bg-white ">
              {selectedChat ? (
                chats[selectedChat.id]?.length > 0 ? (
                  chats[selectedChat.id].map((msg, i) => (
                    <div key={i} className={`flex ${msg.sender === 'officer' ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-[85%] p-3 rounded-2xl text-xs ${
                        msg.sender === 'officer' 
                          ? 'bg-[var(--color-primary)] text-white rounded-tr-none' 
                          : 'bg-[var(--bg-secondary)]  border border-[var(--border-primary)]  text-gray-800  rounded-tl-none'
                      }`}>
                        <p className="font-bold text-[8px] mb-1 opacity-60 uppercase">{msg.sender === 'officer' ? 'Officer' : 'Doctor'}</p>
                        <p>{msg.text}</p>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="h-full flex flex-col items-center justify-center text-center text-slate-500 opacity-60">
                    <MessageSquare size={48} className="mb-4" />
                    <p className="text-sm font-medium">No messages found for this applicant.</p>
                  </div>
                )
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-center text-slate-500 opacity-60">
                  <Eye size={48} className="mb-4" />
                  <p className="text-sm font-medium">Select an applicant to view their verification logs.</p>
                </div>
              )}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default AdminVerificationMonitor;

