import { useState, useEffect, useCallback, useRef } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Sidebar from '../../components/dashboard/Sidebar';
import TopNav from '../../components/dashboard/TopNav';
import { 
  Calendar,
  ShieldCheck, 
  Clock, 
  Search,
  MessageSquare,
  CheckCircle2,
  ExternalLink,
  ChevronRight,
  Send,
  Paperclip,
  XCircle,
  AlertCircle,
  Phone,
  Video,
  X,
  Mic,
  VideoOff,
  User,
  Shield,
  Monitor,
  Globe,
  LayoutDashboard,
  FileText,
  Moon,
  Sun,
  MicOff,
  Download,
  CheckCheck,
  Camera,
  Image as ImageIcon,
  Loader
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { db } from '../../utils/db';
import { useGlobalSettings } from '../../context/GlobalSettingsContext';
import Notifications from './patient/Notifications';

const formatTime = (secs) => {
  const m = Math.floor(secs / 60);
  const s = secs % 60;
  return `${m}:${s < 10 ? '0' : ''}${s}`;
};

const formatBytes = (bytes, decimals = 2) => {
  if (!bytes) return '0 Bytes';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
};

const MediaCallModal = ({ type, isOpen, onClose, doctorName, onCallCompleted }) => {
  const [status, setStatus] = useState('connecting');
  const [duration, setDuration] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [isCameraOff, setIsCameraOff] = useState(false);
  const localVideoRef = useRef(null);
  const timerRef = useRef(null);
  const streamRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      setStatus('connecting');
      setDuration(0);
      const timer = setTimeout(async () => {
        setStatus('active');
        if (type === 'video') {
          try {
            const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
            streamRef.current = stream;
            if (localVideoRef.current) {
              localVideoRef.current.srcObject = stream;
            }
          } catch (e) {
            console.warn("Could not start local camera stream:", e);
          }
        }
        timerRef.current = setInterval(() => {
          setDuration(prev => prev + 1);
        }, 1000);
      }, 3000);

      return () => {
        clearTimeout(timer);
        clearInterval(timerRef.current);
        if (streamRef.current) {
          streamRef.current.getTracks().forEach(t => t.stop());
        }
      };
    }
  }, [isOpen, type]);

  const handleHangUp = () => {
    clearInterval(timerRef.current);
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(t => t.stop());
    }
    const finalDuration = formatTime(duration);
    if (onCallCompleted) {
      onCallCompleted(type, finalDuration);
    }
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
      <div className="bg-slate-900 w-full max-w-2xl aspect-video rounded-[3rem] overflow-hidden relative border border-white/10 shadow-2xl">
        {status === 'connecting' ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-white space-y-6">
            <div className="w-24 h-24 bg-[var(--color-primary)] rounded-full flex items-center justify-center animate-pulse">
              {type === 'video' ? <Video size={40} /> : <Phone size={40} />}
            </div>
            <div className="text-center">
              <h3 className="text-xl font-bold">Connecting with {doctorName}...</h3>
              <p className="text-blue-400 font-medium">Establishing secure connection</p>
            </div>
          </div>
        ) : (
          <div className="h-full flex flex-col">
            <div className="flex-grow relative">
              {type === 'video' ? (
                <div className="absolute inset-0 bg-gradient-to-br from-slate-800 to-slate-900 flex items-center justify-center">
                  {isCameraOff ? (
                    <div className="text-center text-white/20">
                      <VideoOff size={120} />
                      <p className="mt-4 font-bold uppercase tracking-widest">Camera Off</p>
                    </div>
                  ) : (
                    <video 
                      ref={localVideoRef} 
                      autoPlay 
                      playsInline 
                      muted 
                      className="w-full h-full object-cover scale-x-[-1]" 
                    />
                  )}
                  <div className="absolute top-8 right-8 w-40 aspect-video bg-slate-700 rounded-2xl border-2 border-white/20 overflow-hidden flex flex-col items-center justify-center">
                    <div className="w-12 h-12 rounded-full bg-blue-50/50 font-bold text-white flex items-center justify-center text-xs mb-1">
                      {doctorName ? doctorName.split(' ').map(n => n[0]).join('') : 'DR'}
                    </div>
                    <p className="text-[10px] text-white/70 font-semibold">{doctorName}</p>
                  </div>
                </div>
              ) : (
                <div className="absolute inset-0 flex flex-col items-center justify-center text-white">
                  <div className="w-32 h-32 bg-[var(--color-primary)]/20 rounded-full flex items-center justify-center relative">
                    <div className="absolute inset-0 bg-[var(--color-primary)]/20 rounded-full animate-ping"></div>
                    <Mic size={48} className="text-blue-500" />
                  </div>
                  <div className="mt-8 text-center">
                    <h3 className="text-2xl font-bold">{doctorName}</h3>
                    <p className="text-blue-400 font-mono font-bold text-lg mt-1">{formatTime(duration)}</p>
                  </div>
                </div>
              )}
            </div>
            <div className="p-8 bg-black/40 backdrop-blur-md flex items-center justify-center gap-6">
              <button 
                onClick={() => setIsMuted(!isMuted)}
                className={`p-4 rounded-2xl transition-all ${isMuted ? 'bg-red-600 text-white' : 'bg-[var(--bg-secondary)]/10 hover:bg-[var(--bg-secondary)]/20 text-white'}`}
              >
                {isMuted ? <MicOff size={24} /> : <Mic size={24} />}
              </button>
              <button 
                onClick={() => setIsCameraOff(!isCameraOff)}
                className={`p-4 rounded-2xl transition-all ${isCameraOff ? 'bg-red-600 text-white' : 'bg-[var(--bg-secondary)]/10 hover:bg-[var(--bg-secondary)]/20 text-white'}`}
              >
                {isCameraOff ? <VideoOff size={24} /> : <Video size={24} />}
              </button>
              <button onClick={handleHangUp} className="p-4 bg-red-600 hover:bg-red-700 rounded-2xl text-white transition-all shadow-lg shadow-red-600/20">
                <Phone size={24} className="rotate-[135deg]" />
              </button>
            </div>
          </div>
        )}
        <button onClick={handleHangUp} className="absolute top-6 right-6 p-2 text-white/50 hover:text-white z-50">
          <X size={24} />
        </button>
      </div>
    </div>
  );
};

const VerificationHub = ({ 
  pendingDoctors, 
  chats, 
  onVerify, 
  onReject, 
  selectedDoctor, 
  onSelectDoctor, 
  inputText, 
  setInputText, 
  onSendMessage,
  onSendSpecialMessage,
  onDirectSendSpecial,
  callModal,
  setCallModal,
  // Voice note params
  isRecording,
  recordingTime,
  startRecording,
  stopRecording,
  cancelRecording,
  // Files Refs
  fileInputRef,
  imageInputRef
}) => (
  <div className="flex-grow flex gap-8 min-h-0 overflow-hidden">
    <MediaCallModal 
      isOpen={callModal.isOpen} 
      type={callModal.type} 
      doctorName={selectedDoctor?.name}
      onClose={() => setCallModal({ ...callModal, isOpen: false })}
      onCallCompleted={(type, duration) => onDirectSendSpecial(type, '', 'Call.log', 0, duration)} 
    />
    
    <div className="w-1/3 flex flex-col bg-[var(--bg-secondary)]  rounded-[24px] shadow-sm hover:shadow-md transition-shadow fade-in hover:shadow-md transition-all duration-300 border border-[var(--border-primary)]  overflow-hidden transition-colors">
      <div className="p-6 border-b border-gray-50 ">
        <h2 className="text-lg font-bold text-slate-900  mb-4">Applicant Queue</h2>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
          <input 
            type="text" 
            placeholder="Search doctors..." 
            className="w-full bg-[#f8fafc]  border-none rounded-xl py-2 pl-10 pr-4 text-sm focus:ring-2 focus:ring-blue-500/20 text-slate-900 "
          />
        </div>
      </div>
      <div className="flex-grow overflow-y-auto custom-scrollbar">
        {pendingDoctors.length === 0 ? (
          <div className="p-8 text-center">
            <CheckCircle2 size={48} className="mx-auto text-green-200  mb-4" />
            <p className="text-sm font-bold text-slate-500 (--text-secondary)]">All caught up!</p>
          </div>
        ) : (
          pendingDoctors.map((doc) => (
            <button
              key={doc.id}
              onClick={() => onSelectDoctor(doc)}
              className={`w-full p-6 flex items-center gap-4 text-left border-b border-gray-50  transition-all ${
                selectedDoctor?.id === doc.id ? 'bg-[#f8fafc]/50  border-l-4 border-l-blue-600' : 'hover:bg-[#f8fafc] dark:bg-slate-900/50'
              }`}
            >
              <div className="w-12 h-12 bg-white  rounded-2xl flex items-center justify-center font-bold text-slate-500 ">
                {doc.name.split(' ').map(n => n[0]).join('')}
              </div>
              <div className="flex-grow min-w-0">
                <p className="text-sm font-bold text-slate-900  truncate">{doc.name}</p>
                <p className="text-[11px] text-slate-500 (--text-secondary)] font-medium truncate">{doc.specialty || 'General Practitioner'}</p>
                <p className="text-[10px] text-amber-600  font-bold mt-1">Pending Interview</p>
              </div>
              <ChevronRight size={16} className="text-gray-300 " />
            </button>
          ))
        )}
      </div>
    </div>

    <div className="flex-grow bg-[var(--bg-secondary)]  rounded-[24px] shadow-sm hover:shadow-md transition-shadow fade-in hover:shadow-md transition-all duration-300 border border-[var(--border-primary)]  flex flex-col overflow-hidden transition-colors">
      <AnimatePresence mode="wait">
        {selectedDoctor ? (
          <motion.div 
            key={selectedDoctor.id}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-col h-full overflow-hidden"
          >
            <div className="p-6 border-b border-[var(--border-primary)]  flex items-center justify-between bg-white ">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-blue-100  rounded-2xl flex items-center justify-center font-bold text-[var(--color-primary)] ">
                  {selectedDoctor.name.split(' ').map(n => n[0]).join('')}
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 ">{selectedDoctor.name}</h3>
                  <div className="flex items-center gap-3">
                    <p className="text-xs text-slate-500 (--text-secondary)] font-medium">{selectedDoctor.email}</p>
                    <div className="flex items-center gap-1.5">
                      <button onClick={() => setCallModal({ isOpen: true, type: 'voice' })} className="p-1.5 text-slate-500 hover:text-[var(--color-primary)] transition-colors"><Phone size={14} /></button>
                      <button onClick={() => setCallModal({ isOpen: true, type: 'video' })} className="p-1.5 text-slate-500 hover:text-[var(--color-primary)] transition-colors"><Video size={14} /></button>
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <button 
                  onClick={() => onReject(selectedDoctor.id)}
                  className="flex items-center gap-2 px-4 py-2 bg-red-50  text-red-600  rounded-xl text-sm font-bold hover:bg-red-100 dark:bg-red-900/20 transition-all"
                >
                  <XCircle size={16} /> Reject
                </button>
                <button 
                  onClick={() => onVerify(selectedDoctor.id)}
                  className="flex items-center gap-2 px-6 py-2 bg-green-600 text-white rounded-xl text-sm font-bold hover:bg-green-700 transition-all shadow-lg shadow-green-600/20"
                >
                  <CheckCircle2 size={16} /> Verify
                </button>
              </div>
            </div>

            <div className="flex-grow flex bg-white  min-h-0 overflow-hidden">
              <div className="flex-grow flex flex-col border-r border-[var(--border-primary)]  min-w-0">
                <div className="flex-grow overflow-y-auto p-6 space-y-4 custom-scrollbar">
                  {(chats[selectedDoctor.userId] || chats[selectedDoctor.id])?.map((msg, i) => (
                    <div key={i} className={`flex ${msg.sender === 'officer' ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-[80%] space-y-1 ${msg.sender === 'officer' ? 'items-end' : 'items-start'}`}>
                        {msg.messageType === 'voice' ? (
                          <div className={`p-3 rounded-2xl text-sm ${
                            msg.sender === 'officer' 
                              ? 'bg-[var(--color-primary)] text-white rounded-tr-none shadow-md' 
                              : 'bg-white  text-gray-800  rounded-tl-none border border-[var(--border-primary)]  shadow-sm hover:shadow-md transition-shadow fade-in hover:shadow-md transition-all duration-300'
                          }`}>
                            <div className="flex items-center gap-3">
                              <audio src={msg.fileUrl} controls className="max-w-[200px] h-8 outline-none filter brightness-95" />
                              {msg.duration && <span className="text-[10px] opacity-75">{msg.duration}</span>}
                            </div>
                          </div>
                        ) : msg.messageType === 'image' ? (
                          <div className="rounded-2xl overflow-hidden border border-[var(--border-primary)]  bg-white p-1">
                            <img src={msg.fileUrl} alt="Sent image" className="max-h-60 rounded-xl cursor-pointer hover:opacity-90" onClick={() => window.open(msg.fileUrl)} />
                          </div>
                        ) : msg.messageType === 'file' ? (
                          <div className={`p-1 rounded-2xl shadow-sm hover:shadow-md transition-shadow fade-in hover:shadow-md transition-all duration-300 ${
                            msg.sender === 'officer' 
                              ? 'bg-[var(--color-primary)] text-white rounded-tr-none' 
                              : 'bg-white  text-gray-800  rounded-tl-none border border-[var(--border-primary)]  shadow-sm hover:shadow-md transition-shadow fade-in hover:shadow-md transition-all duration-300'
                          }`}>
                            <a href={msg.fileUrl} download={msg.fileName} className="flex items-center gap-3 p-3 rounded-xl hover:bg-black/5">
                              <FileText size={18} />
                              <div className="text-left min-w-0">
                                <p className="text-xs font-bold truncate max-w-[150px]">{msg.fileName}</p>
                                <p className="text-[10px] opacity-75">{msg.fileSize}</p>
                              </div>
                              <Download size={14} className="ml-2 flex-shrink-0" />
                            </a>
                          </div>
                        ) : msg.messageType === 'video' ? (
                          <div className={`p-4 rounded-2xl text-xs font-bold flex items-center gap-2 ${
                            msg.sender === 'officer'
                              ? 'bg-blue-50/50 text-blue-700 rounded-tr-none'
                              : 'bg-green-50 text-green-700 rounded-tl-none border border-green-100'
                          }`}>
                            <Video size={16} />
                            <div>
                              <p>Video Call Completed</p>
                              <p className="opacity-75">Duration: {msg.duration}</p>
                            </div>
                          </div>
                        ) : (
                          <div className={`p-3 rounded-2xl text-sm ${
                            msg.sender === 'officer' 
                              ? 'bg-[var(--color-primary)] text-white rounded-tr-none shadow-md' 
                              : msg.sender === 'system'
                                ? 'bg-[#f8fafc]  text-slate-500 (--text-secondary)] text-center mx-auto text-[10px] font-bold uppercase w-full'
                                : 'bg-white  text-gray-800  rounded-tl-none border border-[var(--border-primary)]  shadow-sm hover:shadow-md transition-shadow fade-in hover:shadow-md transition-all duration-300'
                          }`}>
                            <p>{msg.text}</p>
                          </div>
                        )}
                        {msg.sender !== 'system' && (
                          <div className={`flex items-center gap-1.5 px-1 ${msg.sender === 'officer' ? 'flex-row-reverse' : 'flex-row'}`}>
                            <span className="text-[9px] font-bold text-slate-500">{msg.time}</span>
                            {msg.sender === 'officer' && <CheckCheck size={10} className="text-blue-500" />}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Hidden attachment handlers */}
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  onChange={(e) => onSendSpecialMessage('file', e)} 
                  className="hidden" 
                />
                <input 
                  type="file" 
                  accept="image/*" 
                  ref={imageInputRef} 
                  onChange={(e) => onSendSpecialMessage('image', e)} 
                  className="hidden" 
                />

                {isRecording ? (
                  <div className="p-4 bg-[var(--bg-secondary)]  border-t border-[var(--border-primary)]  flex items-center gap-3">
                    <div className="flex items-center gap-3 bg-red-50 text-red-600 px-4 py-2.5 rounded-xl flex-grow border border-red-100">
                      <div className="w-2.5 h-2.5 bg-red-600 rounded-full animate-ping"></div>
                      <span className="text-xs font-bold">Recording Voice Note: {formatTime(recordingTime)}</span>
                      <button 
                        type="button" 
                        onClick={stopRecording}
                        className="ml-auto text-xs font-bold bg-red-600 text-white px-3 py-1 rounded-lg hover:bg-red-700 active:scale-95 transition-all"
                      >
                        Send
                      </button>
                      <button 
                        type="button" 
                        onClick={cancelRecording}
                        className="text-xs font-bold text-gray-500 hover:text-gray-700"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <form onSubmit={onSendMessage} className="p-4 bg-[var(--bg-secondary)]  border-t border-[var(--border-primary)]  flex items-center gap-3">
                    <button type="button" onClick={() => fileInputRef.current?.click()} className="p-2 text-slate-500 hover:text-[var(--color-primary)]"><Paperclip size={20} /></button>
                    <button type="button" onClick={() => imageInputRef.current?.click()} className="p-2 text-slate-500 hover:text-[var(--color-primary)]"><ImageIcon size={20} /></button>
                    <button type="button" onClick={startRecording} className="p-2 text-slate-500 hover:text-[#EF4444]"><Mic size={20} /></button>
                    <input 
                      type="text" 
                      value={inputText}
                      onChange={(e) => setInputText(e.target.value)}
                      placeholder="Type interview question..."
                      className="flex-grow bg-[#f8fafc]  border-none rounded-xl py-2 px-4 text-sm focus:ring-2 focus:ring-blue-500/20 text-slate-900 "
                    />
                    <button type="submit" className="bg-[var(--color-primary)] text-white p-2 rounded-xl hover:bg-blue-700 shadow-lg shadow-blue-600/20 transition-all"><Send size={18} /></button>
                  </form>
                )}
              </div>

              <div className="w-64 p-6 bg-[var(--bg-secondary)]  overflow-y-auto custom-scrollbar hidden xl:block transition-colors">
                <h4 className="text-xs font-bold text-slate-500 (--text-secondary)] uppercase tracking-widest mb-6 text-center">Submitted Files</h4>
                <div className="space-y-4">
                  {selectedDoctor.verificationDocuments?.length > 0 ? selectedDoctor.verificationDocuments.map((file, i) => (
                    <div 
                      key={i} 
                      onClick={() => window.open(file.url, '_blank')}
                      className="group p-3 border border-[var(--border-primary)]  rounded-xl hover:border-[var(--border-primary)] dark:border-blue-600 transition-all cursor-pointer bg-white "
                    >
                      <p className="text-xs font-bold text-slate-900  truncate">{file.name}</p>
                      <div className="flex items-center justify-between mt-1">
                        <p className="text-[10px] text-slate-500 font-medium">{file.size}</p>
                        <ExternalLink size={12} className="text-gray-300  group-hover:text-blue-500" />
                      </div>
                    </div>
                  )) : (
                    <div className="text-center py-10 opacity-40">
                      <FileText size={32} className="mx-auto mb-2" />
                      <p className="text-[10px] font-bold">No documents uploaded</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        ) : (
          <div className="flex-grow flex flex-col items-center justify-center p-12 text-center text-slate-500 ">
            <ShieldCheck size={64} className="opacity-10 mb-6" />
            <h3 className="text-xl font-bold text-slate-900  mb-2">Ready to Verify</h3>
            <p className="max-w-xs text-sm">Select an applicant to start the secure verification protocol.</p>
          </div>
        )}
      </AnimatePresence>
    </div>
  </div>
);

const VerifiedDirectory = ({ doctors }) => (
  <section className="bg-[var(--bg-secondary)]  rounded-[24px] shadow-sm hover:shadow-md transition-shadow fade-in hover:shadow-md transition-all duration-300 border border-[var(--border-primary)]  overflow-hidden transition-colors">
    <div className="p-8 border-b border-gray-50  flex items-center justify-between">
      <h2 className="text-xl font-bold text-slate-900 ">Verified Medical Professionals</h2>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
        <input 
          type="text" 
          placeholder="Search directory..." 
          className="pl-10 pr-4 py-2 bg-white  border-none rounded-xl text-xs focus:ring-2 focus:ring-blue-500/20 w-64 text-slate-900 "
        />
      </div>
    </div>
    <div className="overflow-x-auto">
      <table className="w-full text-left">
        <thead>
          <tr className="bg-white  text-[10px] font-black text-slate-500 uppercase tracking-widest border-b border-gray-50 ">
            <th className="px-8 py-4">Doctor</th>
            <th className="px-8 py-4">Specialty</th>
            <th className="px-8 py-4">Status</th>
            <th className="px-8 py-4 text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-50 ">
          {doctors.map((doc, i) => (
            <tr key={i} className="hover:bg-white dark:bg-slate-900/50 transition-colors">
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
              <td className="px-8 py-5 text-sm font-medium text-gray-600 ">{doc.specialty}</td>
              <td className="px-8 py-5">
                <span className="px-2 py-1 bg-green-50  text-green-600  rounded-lg text-[10px] font-bold uppercase tracking-widest">Verified</span>
              </td>
              <td className="px-8 py-5 text-right">
                <button className="p-2 text-slate-500 hover:text-[var(--color-primary)] dark:text-blue-400 transition-all"><ChevronRight size={20} /></button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </section>
);

const AuditReports = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLogs = async () => {
      const dummyLogs = [
        { id: 1, action: 'User Verification', target: 'Dr. Sarah Wilson', officer: 'Officer Smith', date: '2026-06-15 10:30 AM', status: 'Success' },
        { id: 2, action: 'Account Rejection', target: 'Dr. John Doe', officer: 'Officer Smith', date: '2026-06-15 11:45 AM', status: 'Success' },
        { id: 3, action: 'Document Review', target: 'Dr. Michael Chen', officer: 'Officer Sarah', date: '2026-06-14 02:15 PM', status: 'Success' },
        { id: 4, action: 'Identity Check', target: 'Dr. Emily Brown', officer: 'Officer Sarah', date: '2026-06-14 04:50 PM', status: 'Failed' },
      ];
      setLogs(dummyLogs);
      setLoading(false);
    };
    fetchLogs();
  }, []);

  if (loading) return <div className="p-8 text-center font-bold text-slate-500 (--text-secondary)]">Loading audit reports...</div>;

  return (
    <section className="bg-[var(--bg-secondary)]  rounded-[24px] shadow-sm hover:shadow-md transition-shadow fade-in hover:shadow-md transition-all duration-300 border border-[var(--border-primary)]  overflow-hidden transition-colors">
      <div className="p-8 border-b border-gray-50  flex items-center justify-between">
        <h2 className="text-xl font-bold text-slate-900 ">Verification Audit Logs</h2>
        <button className="text-xs font-bold text-[var(--color-primary)]  bg-[#f8fafc]  px-4 py-2 rounded-xl hover:bg-blue-100 dark:bg-blue-900/40 transition-all">Export Logs</button>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="bg-white  text-[10px] font-black text-slate-500 uppercase tracking-widest border-b border-gray-50 ">
              <th className="px-8 py-4">Action</th>
              <th className="px-8 py-4">Target Applicant</th>
              <th className="px-8 py-4">Officer</th>
              <th className="px-8 py-4">Timestamp</th>
              <th className="px-8 py-4 text-right">Result</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50 ">
            {logs.map((log) => (
              <tr key={log.id} className="hover:bg-white dark:bg-slate-900/50 transition-colors">
                <td className="px-8 py-5">
                  <p className="font-bold text-slate-900  text-sm">{log.action}</p>
                </td>
                <td className="px-8 py-5 text-sm font-medium text-gray-600 ">{log.target}</td>
                <td className="px-8 py-5 text-sm font-medium text-gray-600 ">{log.officer}</td>
                <td className="px-8 py-5 text-xs text-slate-500 font-bold">{log.date}</td>
                <td className="px-8 py-5 text-right">
                  <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase ${log.status === 'Success' ? 'bg-green-100 text-green-700  ' : 'bg-red-100 text-red-700  '}`}>
                    {log.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
};

const OfficerSettings = ({ user }) => {
  const { theme, toggleTheme, language, setLanguage, t } = useGlobalSettings();
  
  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 ">{t('settings')}</h1>
        <p className="text-slate-500 (--text-secondary)] text-sm">Manage your authorized hardware tokens and system preferences.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <section className="bg-[var(--bg-secondary)]  p-8 rounded-[24px] shadow-sm hover:shadow-md transition-shadow fade-in hover:shadow-md transition-all duration-300 border border-[var(--border-primary)]  transition-colors">
          <h3 className="text-lg font-bold text-slate-900  mb-6 flex items-center gap-2">
            <Monitor size={20} className="text-[var(--color-primary)]" /> {t('overview')}
          </h3>
          <div className="space-y-6">
            <div className="flex items-center justify-between p-4 bg-white  rounded-2xl">
              <div className="flex items-center gap-3">
                {theme === 'dark' ? <Moon size={18} className="text-[var(--color-primary)]" /> : <Sun size={18} className="text-[#F59E0B]" />}
                <p className="text-sm font-bold text-slate-900 ">Dark Mode</p>
              </div>
              <button onClick={toggleTheme} className={`w-12 h-6 rounded-full transition-all relative ${theme === 'dark' ? 'bg-[var(--color-primary)]' : 'bg-gray-200'}`}>
                <div className={`absolute top-1 w-4 h-4 bg-[var(--bg-secondary)] rounded-full transition-all ${theme === 'dark' ? 'right-1' : 'left-1'}`}></div>
              </button>
            </div>
            
            <div className="flex items-center justify-between p-4 bg-white  rounded-2xl">
              <div className="flex items-center gap-3">
                <Globe size={18} className="text-[var(--color-primary)]" />
                <p className="text-sm font-bold text-slate-900 ">Language</p>
              </div>
              <select value={language} onChange={(e) => setLanguage(e.target.value)} className="bg-transparent text-xs font-bold text-[var(--color-primary)] border-none outline-none">
                <option value="en">EN</option>
                <option value="fr">FR</option>
                <option value="es">ES</option>
                <option value="yo">YO</option>
                <option value="de">DE</option>
                <option value="pt">PT</option>
              </select>
            </div>
          </div>
        </section>

        <section className="bg-[var(--bg-secondary)]  p-8 rounded-[24px] shadow-sm hover:shadow-md transition-shadow fade-in hover:shadow-md transition-all duration-300 border border-[var(--border-primary)]  transition-colors">
          <h3 className="text-lg font-bold text-slate-900  mb-6 flex items-center gap-2">
            <Shield size={20} className="text-[var(--color-primary)]" /> Security
          </h3>
          <div className="space-y-4">
            <div className="p-4 bg-white  rounded-2xl flex items-center justify-between">
              <div>
                <p className="text-sm font-bold text-slate-900 ">Hardware Key Status</p>
                <p className="text-[10px] text-green-600 font-bold uppercase tracking-widest">Active & Secure</p>
              </div>
              <ShieldCheck size={20} className="text-[#22C55E]" />
            </div>
            <button className="w-full py-3 bg-[var(--color-primary)]  text-white rounded-xl text-xs font-bold hover:bg-black dark:bg-slate-600 transition-all">
              Manage Hardware Tokens
            </button>
          </div>
        </section>
      </div>
      
      <section className="bg-[var(--bg-secondary)]  p-8 rounded-[24px] shadow-sm hover:shadow-md transition-shadow fade-in hover:shadow-md transition-all duration-300 border border-[var(--border-primary)]  transition-colors">
        <h2 className="text-xl font-bold text-slate-900  mb-6">Current Authenticated Session</h2>
        <div className="p-6 bg-white  rounded-[24px] flex items-center justify-between border border-dashed border-[var(--border-primary)] ">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-blue-100  rounded-2xl flex items-center justify-center text-[var(--color-primary)]  font-bold text-xl">
              {user.name.charAt(0)}
            </div>
            <div>
              <p className="text-sm font-bold text-slate-900 ">{user.name}</p>
              <p className="text-xs text-slate-500 (--text-secondary)]">{user.email}</p>
            </div>
          </div>
          <span className="px-4 py-1.5 bg-green-100 text-green-700   rounded-full text-[10px] font-black uppercase tracking-widest border border-green-200 ">
            Internal Access Verified
          </span>
        </div>
      </section>
    </div>
  );
};

const OfficerDashboard = ({ user, logout }) => {
  const { t } = useGlobalSettings();
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [inputText, setInputText] = useState('');
  const [pendingDoctors, setPendingDoctors] = useState([]);
  const [verifiedDoctors, setVerifiedDoctors] = useState([]);
  const [chats, setChats] = useState({});
  const [loading, setLoading] = useState(true);
  const [callModal, setCallModal] = useState({ isOpen: false, type: 'voice' });
  const scrollRef = useRef(null);

  // Attachment inputs refs
  const fileInputRef = useRef(null);
  const imageInputRef = useRef(null);

  // Recording audio states
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [mediaRecorder, setMediaRecorder] = useState(null);
  const recordingTimerRef = useRef(null);

  const fetchData = useCallback(async () => {
    try {
      const [allDoctors, allChats] = await Promise.all([
        db.getDoctors(),
        db.getChats()
      ]);
      setPendingDoctors(allDoctors.filter(d => d.status === 'pending' || d.status === 'rejected'));
      setVerifiedDoctors(allDoctors.filter(d => d.status === 'verified' || d.status === 'active'));
      
      const formattedChats = {};
      allChats.forEach(chat => {
        const doctor = allDoctors.find(d => 
          chat.participants.some(p => {
            const pId = typeof p === 'object' && p !== null ? (p._id || p.id) : p;
            return pId === d.userId || pId === d.id;
          })
        );
        if (doctor) {
          formattedChats[doctor.id] = chat.messages;
          if (doctor.userId) {
            formattedChats[doctor.userId] = chat.messages;
          }
        }
      });
      setChats(formattedChats);
      
      if (selectedDoctor) {
        const updatedDoc = allDoctors.find(d => d.id === selectedDoctor.id);
        if (updatedDoc) setSelectedDoctor(updatedDoc);
      }
      
      setLoading(false);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  }, [selectedDoctor]);

  useEffect(() => {
    const init = async () => {
      await fetchData();
    };
    init();
    
    const interval = setInterval(fetchData, 5000);
    return () => clearInterval(interval);
  }, [fetchData]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [chats, selectedDoctor]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!inputText.trim() || !selectedDoctor) return;
    try {
      const recipientId = selectedDoctor.userId || selectedDoctor.id;
      await db.addChatMessage(recipientId, { 
        sender: 'officer', 
        senderId: user.id, 
        text: inputText, 
        messageType: 'text',
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) 
      });
      setInputText('');
      await fetchData();
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  const handleSendSpecialMessage = async (type, fileEvent) => {
    if (!selectedDoctor) return;
    const file = fileEvent.target?.files?.[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      alert("File size exceeds 10MB limit.");
      return;
    }

    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onloadend = async () => {
      const base64Content = reader.result;
      const recipientId = selectedDoctor.userId || selectedDoctor.id;
      try {
        await db.addChatMessage(recipientId, {
          sender: 'officer',
          senderId: user.id,
          messageType: type,
          fileUrl: base64Content,
          fileName: file.name,
          fileSize: formatBytes(file.size),
          text: type === 'image' ? '🖼️ Sent an image' : `📁 Sent file: ${file.name}`
        });
        await fetchData();
      } catch (err) {
        console.error("Error sending special message:", err);
      }
    };
  };

  // Direct send method for calls and audio recordings
  const handleDirectSendSpecial = async (type, base64Audio, fileName, sizeVal, duration) => {
    if (!selectedDoctor) return;
    const recipientId = selectedDoctor.userId || selectedDoctor.id;
    try {
      await db.addChatMessage(recipientId, {
        sender: 'officer',
        senderId: user.id,
        messageType: type,
        fileUrl: base64Audio,
        fileName,
        fileSize: sizeVal ? formatBytes(sizeVal) : '',
        duration,
        text: type === 'voice' ? '🎤 Sent a voice note' : `📹 Video Call - Duration: ${duration}`
      });
      await fetchData();
    } catch (err) {
      console.error("Error logging call/audio:", err);
    }
  };

  // Voice recording routines
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      const chunks = [];
      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunks.push(e.data);
      };
      recorder.onstop = async () => {
        const audioBlob = new Blob(chunks, { type: 'audio/webm' });
        const reader = new FileReader();
        reader.readAsDataURL(audioBlob);
        reader.onloadend = async () => {
          const base64Audio = reader.result;
          await handleDirectSendSpecial('voice', base64Audio, 'VoiceNote.webm', audioBlob.size, formatTime(recordingTime));
        };
        stream.getTracks().forEach(t => t.stop());
      };
      setMediaRecorder(recorder);
      recorder.start();
      setIsRecording(true);
      setRecordingTime(0);
      recordingTimerRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
    } catch (err) {
      console.error(err);
      alert("Microphone access denied or unavailable");
    }
  };

  const stopRecording = () => {
    if (mediaRecorder && mediaRecorder.state !== 'inactive') {
      mediaRecorder.stop();
    }
    clearInterval(recordingTimerRef.current);
    setIsRecording(false);
  };

  const cancelRecording = () => {
    clearInterval(recordingTimerRef.current);
    setIsRecording(false);
    if (mediaRecorder) {
      mediaRecorder.stream.getTracks().forEach(t => t.stop());
    }
  };

  const handleVerify = async (id) => {
    try {
      await db.updateDoctor(id, { status: 'verified' });
      await db.addNotification({ userId: id, title: 'Account Verified', message: 'Congratulations! Your medical account has been verified. Please set up your profile to continue.', type: 'system' });
      setSelectedDoctor(null);
      await fetchData();
      alert('Doctor has been verified successfully!');
    } catch (error) {
      console.error("Error verifying doctor:", error);
    }
  };

  const handleReject = async (id) => {
    if (window.confirm('Are you sure you want to reject this application?')) {
      try {
        await db.updateDoctor(id, { status: 'rejected' });
        await db.addNotification({ userId: id, title: 'Application Rejected', message: 'Your verification request was rejected.', type: 'system' });
        setSelectedDoctor(null);
        await fetchData();
      } catch (error) {
        console.error("Error rejecting application:", error);
      }
    }
  };

  const currentDayName = new Date().toLocaleDateString('en-US', { weekday: 'long' });
  const currentDateString = new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  const currentTimeString = new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });

  const stats = [
    { label: t('pending'), value: pendingDoctors.length.toString(), icon: <Clock className="text-[#2563EB]" />, bg: 'bg-blue-50/50 dark:bg-blue-950/30' },
    { label: t('directory'), value: verifiedDoctors.length.toString(), icon: <CheckCircle2 className="text-green-600 dark:text-green-400" />, bg: 'bg-green-50/50 dark:bg-green-950/30' },
    { label: 'Flagged Profiles', value: '0', icon: <AlertCircle className="text-red-600 dark:text-red-400" />, bg: 'bg-red-50/50 dark:bg-red-950/30' },
    { label: 'Active Sessions', value: selectedDoctor ? '1' : '0', icon: <MessageSquare className="text-amber-600 dark:text-amber-400" />, bg: 'bg-amber-50/50 dark:bg-amber-950/30' },
  ];

  if (loading) return <div className="p-8 text-center font-bold text-slate-500 (--text-secondary)]">Loading verification hub...</div>;

  return (
    <div className="flex min-h-screen medical-gradient-bg dark:bg-slate-950 transition-colors overflow-hidden">
      <Sidebar role="officer" onLogout={logout} />
      
      <div className="flex-grow flex flex-col h-screen overflow-hidden min-w-0">
        <TopNav userName={user?.name || "Officer"} role="officer" />
        
        <main className="p-4 sm:p-6 lg:p-8 flex-grow flex flex-col gap-8 overflow-hidden custom-scrollbar overflow-y-auto">
          
          {/* Welcome Banner Card */}
          <div className="bg-gradient-to-r from-[#2563EB] to-[#4F46E5] rounded-[32px] p-8 text-white relative overflow-hidden shadow-lg shadow-blue-500/10 flex-shrink-0">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-2xl pointer-events-none"></div>
            <div className="absolute bottom-0 left-1/3 w-32 h-32 bg-white/5 rounded-full blur-xl pointer-events-none"></div>

            <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="space-y-4">
                <div className="inline-flex items-center gap-2 bg-white/15 backdrop-blur-md px-4 py-1.5 rounded-full text-xs font-bold tracking-wide">
                  <Calendar size={13} />
                  <span>{currentDateString} • {currentTimeString}</span>
                </div>
                <div>
                  <h1 className="text-3xl font-black tracking-tight">Verification Command Center</h1>
                  <p className="text-white/80 text-sm mt-1">We hope you are having a nice {currentDayName}. Review credentials and interview medical applicants.</p>
                </div>
              </div>

              <div className="hidden md:block flex-shrink-0 pr-4">
                <svg className="w-24 h-24 text-white opacity-85" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M50 15C50 15 32 30 32 52C32 63.0457 40.0543 72.1 50 72.1C59.9457 72.1 68 63.0457 68 52C68 30 50 15 50 15Z" fill="currentColor" fillOpacity="0.1" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M50 40V64" stroke="currentColor" strokeWidth="3" strokeLinecap="round"/>
                  <path d="M38 52H62" stroke="currentColor" strokeWidth="3" strokeLinecap="round"/>
                  <circle cx="50" cy="52" r="28" stroke="currentColor" strokeWidth="2" strokeDasharray="3 3"/>
                </svg>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 flex-shrink-0">
            {stats.map((stat, i) => (
              <div key={i} className="bg-white dark:bg-slate-900 p-6 rounded-[24px] shadow-[0_8px_30px_rgb(0,0,0,0.015)] border border-gray-100 dark:border-slate-800/40 flex items-center gap-4 transition-all hover:shadow-md">
                <div className={`p-4 rounded-2xl ${stat.bg} `}>{stat.icon}</div>
                <div>
                  <p className="text-2xl font-black text-slate-900 dark:text-slate-100">{stat.value}</p>
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">{stat.label}</p>
                </div>
              </div>
            ))}
          </div>

          <Routes>
            <Route index element={
              <VerificationHub 
                user={user} 
                pendingDoctors={pendingDoctors} 
                chats={chats} 
                onVerify={handleVerify} 
                onReject={handleReject} 
                selectedDoctor={selectedDoctor} 
                onSelectDoctor={setSelectedDoctor} 
                inputText={inputText} 
                setInputText={setInputText} 
                onSendMessage={handleSendMessage}
                onSendSpecialMessage={handleSendSpecialMessage}
                onDirectSendSpecial={handleDirectSendSpecial}
                callModal={callModal}
                setCallModal={setCallModal}
                // Voice note hooks
                isRecording={isRecording}
                recordingTime={recordingTime}
                startRecording={startRecording}
                stopRecording={stopRecording}
                cancelRecording={cancelRecording}
                // Refs
                fileInputRef={fileInputRef}
                imageInputRef={imageInputRef}
              />
            } />
            <Route path="pending" element={<Navigate to="/dashboard/officer" replace />} />
            <Route path="directory" element={<VerifiedDirectory doctors={verifiedDoctors} />} />
            <Route path="audits" element={<AuditReports />} />
            <Route path="settings" element={<OfficerSettings user={user} />} />
            <Route path="notifications" element={<Notifications user={user} />} />
            <Route path="*" element={<Navigate to="/dashboard/officer" replace />} />
          </Routes>
        </main>
      </div>
    </div>
  );
};

export default OfficerDashboard;
