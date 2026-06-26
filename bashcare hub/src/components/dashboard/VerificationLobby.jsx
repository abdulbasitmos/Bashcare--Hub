import { useState, useEffect, useCallback, useRef } from 'react';
import { 
  ShieldAlert, 
  MessageSquare, 
  Send, 
  Paperclip, 
  Clock, 
  FileCheck,
  UserCheck,
  Phone,
  Video,
  X,
  Mic,
  VideoOff,
  File
} from 'lucide-react';
import { motion } from 'framer-motion';
import { db } from '../../utils/db';
import { LogoIcon } from '../Logo';

const MediaCallModal = ({ type, isOpen, onClose, officerName, onCallCompleted }) => {
  const [status, setStatus] = useState('connecting');
  const [duration, setDuration] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [isCameraOff, setIsCameraOff] = useState(false);
  const localVideoRef = useRef(null);
  const timerRef = useRef(null);
  const streamRef = useRef(null);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

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
              <h3 className="text-xl font-bold">Calling {officerName}...</h3>
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
                      {officerName ? officerName.split(' ').map(n => n[0]).join('') : 'OF'}
                    </div>
                    <p className="text-[10px] text-white/70 font-semibold">{officerName}</p>
                  </div>
                </div>
              ) : (
                <div className="absolute inset-0 flex flex-col items-center justify-center text-white">
                  <div className="w-32 h-32 bg-[var(--color-primary)]/20 rounded-full flex items-center justify-center relative">
                    <div className="absolute inset-0 bg-[var(--color-primary)]/20 rounded-full animate-ping"></div>
                    <Mic size={48} className="text-blue-500" />
                  </div>
                  <div className="mt-8 text-center">
                    <h3 className="text-2xl font-bold">{officerName}</h3>
                    <p className="text-blue-400 font-mono font-bold text-lg mt-1">{formatTime(duration)}</p>
                  </div>
                </div>
              )}
            </div>
            <div className="p-8 bg-black/40 backdrop-blur-md flex items-center justify-center gap-6">
              <button 
                onClick={() => setIsMuted(!isMuted)}
                className={`p-4 rounded-2xl transition-all ${isMuted ? 'bg-red-600/20 text-red-500' : 'bg-slate-800 text-white hover:bg-slate-700'}`}
              >
                <Mic size={24} />
              </button>
              {type === 'video' && (
                <button 
                  onClick={() => setIsCameraOff(!isCameraOff)}
                  className={`p-4 rounded-2xl transition-all ${isCameraOff ? 'bg-red-600/20 text-red-500' : 'bg-slate-800 text-white hover:bg-slate-700'}`}
                >
                  <VideoOff size={24} />
                </button>
              )}
              <button onClick={handleHangUp} className="p-4 bg-red-600 hover:bg-red-700 rounded-2xl text-white transition-all shadow-lg shadow-red-600/20">
                <Phone size={24} className="rotate-[135deg]" />
              </button>
            </div>
          </div>
        )}
        <button onClick={handleHangUp} className="absolute top-6 right-6 p-2 text-white/50 hover:text-white">
          <X size={24} />
        </button>
      </div>
    </div>
  );
};

const VerificationLobby = ({ user, logout }) => {
  const [inputText, setInputText] = useState('');
  const [messages, setMessages] = useState([]);
  const [callModal, setCallModal] = useState({ isOpen: false, type: 'voice' });
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const fileInputRef = useRef(null);
  const scrollRef = useRef(null);

  const fetchData = useCallback(async () => {
    try {
      // Fetch messages
      const allChats = await db.getChats();
      const myChat = allChats.find(chat => chat.participants.includes(user.id));
      
      if (myChat) {
        setMessages(myChat.messages);
      } else {
        setMessages([
          { id: 'sys-1', sender: 'system', text: `Welcome Dr. ${user.name}. An officer will be with you shortly to verify your medical credentials.`, time: 'System' }
        ]);
      }

      // Fetch uploaded files from doctor profile
      const doctorProfile = await db.getDoctor(user.id);
      if (doctorProfile && doctorProfile.verificationDocuments) {
        setUploadedFiles(doctorProfile.verificationDocuments);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  }, [user.id, user.name]);

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 5000);
    return () => clearInterval(interval);
  }, [fetchData]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!inputText.trim()) return;
    
    const newMsg = {
      sender: 'user',
      senderId: user.id,
      text: inputText,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    try {
      await db.addChatMessage(user.id, newMsg);
      setInputText('');
      await fetchData();
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  const handleCallCompleted = async (callType, durationStr) => {
    try {
      await db.addChatMessage(user.id, {
        sender: 'doctor',
        senderId: user.id,
        messageType: callType,
        text: callType === 'voice' ? `📞 Voice Call - Duration: ${durationStr}` : `📹 Video Call - Duration: ${durationStr}`,
        duration: durationStr,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      });
      await fetchData();
    } catch (err) {
      console.error("Error logging call:", err);
    }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        alert("File size exceeds 10MB limit.");
        return;
      }
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onloadend = async () => {
        const base64Content = reader.result;
        const isImage = file.type.startsWith('image/');
        const msgType = isImage ? 'image' : 'file';
        const fileSizeStr = (file.size / 1024 / 1024).toFixed(2) + ' MB';

        const newFile = {
          name: file.name,
          size: fileSizeStr,
          type: file.type,
          url: base64Content,
          date: new Date()
        };

        try {
          // Update doctor profile with the new file
          const currentProfile = await db.getDoctor(user.id);
          const updatedDocs = [...(currentProfile.verificationDocuments || []), newFile];
          await db.updateDoctor(user.id, { verificationDocuments: updatedDocs });

          // Send chat message with the file attachment
          await db.addChatMessage(user.id, {
            sender: 'doctor',
            senderId: user.id,
            messageType: msgType,
            fileUrl: base64Content,
            fileName: file.name,
            fileSize: fileSizeStr,
            text: isImage ? '🖼️ Sent an image' : `📁 Sent file: ${file.name}`,
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          });
          
          await fetchData();
        } catch (err) {
          console.error("Upload error:", err);
          alert("Failed to upload file.");
        }
      };
    }
  };

  return (
    <div className="flex flex-col lg:flex-row h-screen bg-white overflow-hidden">
      <MediaCallModal 
        isOpen={callModal.isOpen} 
        type={callModal.type} 
        officerName="Officer Sarah"
        onClose={() => setCallModal({ ...callModal, isOpen: false })} 
        onCallCompleted={handleCallCompleted}
      />

      {/* Left Side: Status & Info */}
      <div className="lg:w-1/3 p-8 border-r border-[var(--border-primary)] bg-[var(--bg-secondary)] flex flex-col overflow-y-auto custom-scrollbar">
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-2">
            <LogoIcon className="h-7 w-7" animated={true} />
            <div className="text-2xl font-black text-[var(--color-primary)]">Bashcare<span className="text-slate-900">Hub</span></div>
          </div>
          <p className="text-xs font-bold text-slate-500 uppercase tracking-widest pl-9">Verification Portal</p>
        </div>

        <div className="flex-grow space-y-8">
          <section>
            <div className="flex items-center gap-3 p-6 bg-amber-50 border border-amber-100 rounded-[24px] text-amber-700">
              <ShieldAlert className="flex-shrink-0" size={24} />
              <div>
                <p className="font-bold">Identity Verification Required</p>
                <p className="text-xs font-medium opacity-80 mt-0.5">Please wait for an officer to start the interview.</p>
              </div>
            </div>
          </section>

          <section>
            <div className="p-6 bg-blue-50 border border-blue-100 rounded-[24px] text-blue-700 shadow-sm">
              <h4 className="font-bold mb-1 flex items-center gap-2 text-sm">
                📞 Contact Support Officer
              </h4>
              <p className="text-xs opacity-90 leading-relaxed mb-3">
                Need immediate help or want to speak with support regarding your verification docs?
              </p>
              <div className="bg-white p-3 rounded-xl border border-blue-100 flex items-center justify-between shadow-sm">
                <span className="text-xs font-bold text-slate-600">Direct Phone:</span>
                <a href="tel:07089593412" className="text-xs font-black text-[var(--color-primary)] hover:underline">
                  07089593412
                </a>
              </div>
            </div>
          </section>

          <section>
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-6">Verification Progress</h3>
            <div className="space-y-4">
              {[
                { label: 'Registration', status: 'complete', icon: <FileCheck className="text-green-600" /> },
                { label: 'Email Verified', status: 'complete', icon: <FileCheck className="text-green-600" /> },
                { label: 'Identity Check', status: 'pending', icon: <Clock className="text-[#F59E0B]" /> },
                { label: 'Final Interview', status: 'pending', icon: <UserCheck className="text-gray-300" /> },
              ].map((step, i) => (
                <div key={i} className="flex items-center gap-4 p-4 rounded-2xl border border-gray-50 bg-[#f8fafc]/50">
                  <div className="w-10 h-10 rounded-xl bg-[var(--bg-secondary)] flex items-center justify-center shadow-sm hover:shadow-md transition-shadow fade-in hover:shadow-md transition-all duration-300">
                    {step.icon}
                  </div>
                  <span className={`text-sm font-bold ${step.status === 'complete' ? 'text-slate-900' : 'text-slate-500'}`}>
                    {step.label}
                  </span>
                </div>
              ))}
            </div>
          </section>

          {uploadedFiles.length > 0 && (
            <section>
              <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4">Shared Documents</h3>
              <div className="space-y-3">
                {uploadedFiles.map((file, i) => (
                  <div key={i} className="flex items-center gap-3 p-3 bg-[#f8fafc]/50 rounded-xl border border-blue-100">
                    <File size={18} className="text-[var(--color-primary)]" />
                    <div className="min-w-0 flex-grow">
                      <p className="text-xs font-bold text-slate-900 truncate">{file.name}</p>
                      <p className="text-[10px] text-[var(--color-primary)] font-medium">{file.size}</p>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          <section className="p-6 bg-[var(--color-primary)] rounded-[24px] text-white shadow-xl shadow-blue-600/20">
            <h4 className="font-bold mb-2 flex items-center gap-2">
              <ShieldAlert size={18} /> Required Materials
            </h4>
            <ul className="text-xs space-y-2 opacity-90 font-medium">
              <li>• Valid Medical License</li>
              <li>• Government-issued Identity Card</li>
              <li>• University Degree Certificate</li>
            </ul>
          </section>
        </div>

        <button 
          onClick={logout}
          className="mt-8 w-full py-4 border-2 border-[var(--border-primary)] rounded-2xl text-sm font-bold text-slate-500 hover:text-red-600 hover:border-red-100 hover:bg-red-50 transition-all"
        >
          Logout & Withdraw Application
        </button>
      </div>

      {/* Right Side: Live Chat */}
      <div className="flex-grow flex flex-col h-full bg-white">
        <header className="p-6 bg-[var(--bg-secondary)] border-b border-[var(--border-primary)] flex items-center justify-between shadow-sm hover:shadow-md transition-shadow fade-in hover:shadow-md transition-all duration-300">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-green-100 rounded-2xl flex items-center justify-center text-green-600">
              <MessageSquare size={24} />
            </div>
            <div>
              <h2 className="font-bold text-slate-900">Verification Interview</h2>
              <p className="text-xs text-green-600 font-bold flex items-center gap-1.5 mt-0.5">
                <span className="w-2 h-2 bg-[#22C55E] rounded-full animate-pulse"></span> Officer Sarah is Online
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setCallModal({ isOpen: true, type: 'voice' })}
              className="p-3 bg-white text-gray-600 rounded-xl hover:bg-[var(--color-primary)] hover:text-white transition-all"
            >
              <Phone size={20} />
            </button>
            <button 
              onClick={() => setCallModal({ isOpen: true, type: 'video' })}
              className="p-3 bg-white text-gray-600 rounded-xl hover:bg-[var(--color-primary)] hover:text-white transition-all"
            >
              <Video size={20} />
            </button>
          </div>
        </header>

        <div ref={scrollRef} className="flex-grow overflow-y-auto p-8 space-y-6 custom-scrollbar">
          {messages.map((msg, i) => {
            const isMe = msg.sender === 'user' || msg.sender === 'doctor';
            return (
              <motion.div 
                key={i}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`max-w-[75%] p-5 rounded-[24px] shadow-sm hover:shadow-md transition-shadow fade-in hover:shadow-md transition-all duration-300 ${
                  isMe 
                    ? 'bg-[var(--color-primary)] text-white rounded-tr-none' 
                    : msg.sender === 'system'
                      ? 'bg-[#f8fafc] text-slate-500 text-center mx-auto text-[10px] font-black uppercase w-full tracking-widest'
                      : 'bg-[var(--bg-secondary)] text-gray-800 rounded-tl-none border border-[var(--border-primary)]'
                }`}>
                  {msg.sender === 'officer' && <p className="text-[10px] font-bold text-[var(--color-primary)] uppercase mb-1.5 tracking-wider">Officer</p>}
                  
                  {msg.messageType === 'voice' ? (
                    <div className="flex items-center gap-3">
                      <audio src={msg.fileUrl} controls className="max-w-[200px] h-8 outline-none filter brightness-95" />
                      {msg.duration && <span className="text-[10px] opacity-75">{msg.duration}</span>}
                    </div>
                  ) : msg.messageType === 'image' ? (
                    <div className="rounded-xl overflow-hidden bg-white p-1">
                      <img 
                        src={msg.fileUrl} 
                        alt="Sent image" 
                        className="max-h-60 rounded-lg cursor-pointer hover:opacity-90" 
                        onClick={() => window.open(msg.fileUrl)} 
                      />
                    </div>
                  ) : msg.messageType === 'file' ? (
                    <div className="p-1 rounded-xl bg-black/5 hover:bg-black/10 transition-all">
                      <a href={msg.fileUrl} download={msg.fileName} className="flex items-center gap-3 p-2">
                        <FileCheck size={18} className="text-[var(--color-primary)]" />
                        <div className="text-left min-w-0">
                          <p className="text-xs font-bold truncate max-w-[150px]">{msg.fileName}</p>
                          <p className="text-[10px] opacity-75">{msg.fileSize}</p>
                        </div>
                      </a>
                    </div>
                  ) : (msg.messageType === 'video' || msg.messageType === 'call') ? (
                    <div className="flex items-center gap-2 text-xs font-bold">
                      <Video size={16} />
                      <span>Call Completed - {msg.duration || '00:00'}</span>
                    </div>
                  ) : (
                    <p className="text-sm font-medium leading-relaxed">{msg.text}</p>
                  )}

                  {msg.sender !== 'system' && (
                    <p className={`text-[9px] mt-2 font-bold ${isMe ? 'text-blue-200 text-right' : 'text-slate-500'}`}>
                      {msg.time || (msg.createdAt ? new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '')}
                    </p>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>

        <div className="p-6 bg-[var(--bg-secondary)] border-t border-[var(--border-primary)]">
          <form onSubmit={handleSendMessage} className="flex items-center gap-4 bg-[#f8fafc] p-2 rounded-[24px] border border-[var(--border-primary)] focus-within:border-blue-500 focus-within:ring-4 focus-within:ring-blue-500/5 transition-all">
            <button 
              type="button" 
              onClick={() => fileInputRef.current?.click()}
              className="p-3 text-slate-500 hover:text-[var(--color-primary)] transition-colors"
            >
              <Paperclip size={22} />
            </button>
            <input 
              type="file"
              hidden
              ref={fileInputRef}
              onChange={handleFileUpload}
            />
            <input 
              type="text" 
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Type your message here..."
              className="flex-grow bg-transparent border-none focus:ring-0 text-sm py-3 px-2 font-medium"
            />
            <button 
              type="submit"
              disabled={!inputText.trim()}
              className="bg-[var(--color-primary)] text-white p-3.5 rounded-[1.5rem] hover:bg-blue-700 transition-all shadow-lg shadow-blue-600/20 active:scale-95 disabled:opacity-50"
            >
              <Send size={20} />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default VerificationLobby;

