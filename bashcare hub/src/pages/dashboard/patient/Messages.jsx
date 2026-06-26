import { useState, useEffect, useRef, useCallback } from 'react';
import { 
  Search, 
  Send, 
  MoreVertical, 
  Phone, 
  Video, 
  Image as ImageIcon, 
  Paperclip,
  CheckCheck,
  Building2,
  MessageSquare,
  Loader,
  Mic,
  MicOff,
  Play,
  Pause,
  Download,
  FileText,
  X,
  Maximize2,
  VolumeX,
  Volume2,
  Camera,
  CameraOff
} from 'lucide-react';
import { useLocation } from 'react-router-dom';
import { db } from '../../../utils/db';

const formatTime = (secs) => {
  const m = Math.floor(secs / 60);
  const s = secs % 60;
  return `${m}:${s < 10 ? '0' : ''}${s}`;
};

const displayTime = (timeVal) => {
  if (!timeVal) return '';
  const d = new Date(timeVal);
  if (!isNaN(d.getTime())) {
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }
  return timeVal;
};

const formatBytes = (bytes, decimals = 2) => {
  if (!bytes) return '0 Bytes';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
};

const Messages = ({ user }) => {
  const location = useLocation();
  const preSelectedDoctor = location.state?.doctor;
  
  const [activeChatId, setActiveChatId] = useState(null);
  const [activeChatDoctor, setActiveChatDoctor] = useState(null);
  const [messageText, setMessageText] = useState('');
  const [chats, setChats] = useState([]);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [doctors, setDoctors] = useState({});
  const messagesEndRef = useRef(null);

  // Search users states
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);

  // Voice note recording states
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [mediaRecorder, setMediaRecorder] = useState(null);
  const recordingTimerRef = useRef(null);

  // File upload refs
  const fileInputRef = useRef(null);
  const imageInputRef = useRef(null);

  // Video call states
  const [videoCallActive, setVideoCallActive] = useState(false);
  const [videoCallStatus, setVideoCallStatus] = useState('calling'); // 'calling' | 'connected' | 'ended'
  const [videoCallDuration, setVideoCallDuration] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [isCameraOff, setIsCameraOff] = useState(false);
  const localVideoRef = useRef(null);
  const callTimerRef = useRef(null);
  const localStreamRef = useRef(null);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  const loadMessages = useCallback(async (doctorId) => {
    try {
      const chatMessages = await db.getChatById(doctorId);
      setMessages(chatMessages || []);
    } catch (err) {
      console.error("Error loading messages:", err);
      setMessages([]);
    }
  }, []);

  const loadChats = useCallback(async () => {
    try {
      const [allDoctors, userChats] = await Promise.all([
        db.getDoctors(),
        db.getChats()
      ]);
      
      const activeDoctors = allDoctors;
      const doctorsMap = {};
      activeDoctors.forEach(doc => {
        doctorsMap[doc.userId || doc.id] = doc;
      });
      setDoctors(doctorsMap);

      // Create chat list from existing populated chats
      const chatList = userChats.map(chat => {
        const otherParticipant = chat.participants.find(p => {
          const pId = p._id || p.id;
          const uId = user?.id || user?._id;
          return pId !== uId;
        });
        if (!otherParticipant) return null;

        const otherId = otherParticipant._id || otherParticipant.id;
        const doctor = doctorsMap[otherId];
        
        return {
          id: otherId,
          name: otherParticipant.name || 'Unknown User',
          role: otherParticipant.role === 'doctor' ? (doctor?.specialty || 'Specialist Doctor') : 'Patient',
          type: otherParticipant.role,
          online: true,
          lastMessage: chat.lastMessage || 'Start a conversation',
          updatedAt: chat.updatedAt
        };
      }).filter(Boolean);

      // Add support chat
      const supportChat = {
        id: 'support',
        name: 'Bashcare Support',
        role: 'Hospital Support',
        type: 'support',
        online: true,
        lastMessage: 'How can we help you today?',
        updatedAt: new Date()
      };

      const finalChats = [supportChat, ...chatList];
      setChats(finalChats);

      // Set initial active chat
      if (preSelectedDoctor) {
        setActiveChatId(preSelectedDoctor.id || preSelectedDoctor.userId);
        setActiveChatDoctor(preSelectedDoctor);
      } else {
        setActiveChatId(prev => {
          if (!prev && finalChats.length > 0) {
            if (finalChats[0].type === 'doctor') {
              setActiveChatDoctor(doctorsMap[finalChats[0].id]);
            }
            return finalChats[0].id;
          }
          return prev;
        });
      }
    } catch (err) {
      console.error("Error loading chats:", err);
    } finally {
      setLoading(false);
    }
  }, [preSelectedDoctor, user?.id, user?._id]);

  useEffect(() => {
    const timer = setTimeout(() => {
      loadChats();
    }, 0);
    return () => clearTimeout(timer);
  }, [loadChats]);

  useEffect(() => {
    if (activeChatId && activeChatId !== 'support') {
      const timer = setTimeout(() => {
        loadMessages(activeChatId);
      }, 0);
      return () => clearTimeout(timer);
    } else if (activeChatId === 'support') {
      setMessages([
        {
          id: 'support-welcome',
          sender: 'support',
          text: 'Hello! Welcome to Bashcare Support. How can we help you today?',
          time: new Date().toISOString()
        }
      ]);
    }
  }, [activeChatId, loadMessages]);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  // Handle searching users
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }
    const delayDebounce = setTimeout(async () => {
      setIsSearching(true);
      try {
        const users = await db.searchUsersForChat(searchQuery);
        setSearchResults(users);
      } catch (err) {
        console.error("Error searching users:", err);
      } finally {
        setIsSearching(false);
      }
    }, 300);
    return () => clearTimeout(delayDebounce);
  }, [searchQuery]);

  const handleSelectSearchResult = (searchedUser) => {
    const targetId = searchedUser.id || searchedUser._id;
    // Check if chat already exists
    const existingChat = chats.find(c => c.id === targetId);
    if (existingChat) {
      setActiveChatId(targetId);
      if (searchedUser.role === 'doctor') {
        setActiveChatDoctor(doctors[targetId] || searchedUser);
      } else {
        setActiveChatDoctor(null);
      }
    } else {
      // Add temporary chat to chats list
      const newChat = {
        id: targetId,
        name: searchedUser.name,
        role: searchedUser.role === 'doctor' ? 'Doctor' : 'Patient',
        type: searchedUser.role,
        online: true,
        lastMessage: 'Start a conversation',
        updatedAt: new Date()
      };
      setChats(prev => [newChat, ...prev]);
      setActiveChatId(targetId);
      setActiveChatDoctor(searchedUser.role === 'doctor' ? searchedUser : null);
    }
    setSearchQuery('');
    setSearchResults([]);
  };

  const activeChatData = chats.find(c => c.id === activeChatId);

  // Send message helper
  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!messageText.trim() || !activeChatId) return;

    if (activeChatId === 'support') {
      const userMsgText = messageText;
      const userMsg = {
        id: `support-user-${Date.now()}`,
        sender: 'patient',
        text: userMsgText,
        time: new Date().toISOString()
      };
      setMessages(prev => [...prev, userMsg]);
      setMessageText('');

      setTimeout(() => {
        const supportReply = {
          id: `support-bot-${Date.now()}`,
          sender: 'support',
          text: `Thank you for reaching out. We have received your query: "${userMsgText}". An agent will review this and respond shortly.`,
          time: new Date().toISOString()
        };
        setMessages(prev => [...prev, supportReply]);
      }, 1000);
      return;
    }

    try {
      await db.addChatMessage(activeChatId, {
        sender: 'patient',
        text: messageText,
        messageType: 'text'
      });
      
      setMessageText('');
      
      if (activeChatId !== 'support') {
        await loadMessages(activeChatId);
      }
    } catch (err) {
      console.error("Error sending message:", err);
    }
  };

  // Special messages (voice note, file, image, video log)
  const handleSendSpecialMessage = async (type, fileUrl, fileName, fileSizeVal, duration) => {
    if (!activeChatId) return;

    if (activeChatId === 'support') {
      const sizeStr = fileSizeVal ? formatBytes(fileSizeVal) : '';
      let logText = '';
      if (type === 'voice') logText = '🎤 Sent a voice note';
      else if (type === 'file') logText = `📁 Sent file: ${fileName}`;
      else if (type === 'image') logText = '🖼️ Sent an image';
      else if (type === 'video') logText = `📹 Video call - Duration: ${duration}`;

      const userMsg = {
        id: `support-user-special-${Date.now()}`,
        sender: 'patient',
        messageType: type,
        fileUrl,
        fileName,
        fileSize: sizeStr,
        duration,
        text: logText,
        time: new Date().toISOString()
      };
      setMessages(prev => [...prev, userMsg]);

      setTimeout(() => {
        const supportReply = {
          id: `support-bot-${Date.now()}`,
          sender: 'support',
          text: `Thank you for sharing the attachment (${type}). Our support team will analyze it and assist you.`,
          time: new Date().toISOString()
        };
        setMessages(prev => [...prev, supportReply]);
      }, 1000);
      return;
    }

    try {
      const sizeStr = fileSizeVal ? formatBytes(fileSizeVal) : '';
      let logText = '';
      if (type === 'voice') logText = '🎤 Sent a voice note';
      else if (type === 'file') logText = `📁 Sent file: ${fileName}`;
      else if (type === 'image') logText = '🖼️ Sent an image';
      else if (type === 'video') logText = `📹 Video call - Duration: ${duration}`;

      await db.addChatMessage(activeChatId, {
        sender: 'patient',
        messageType: type,
        fileUrl,
        fileName,
        fileSize: sizeStr,
        duration,
        text: logText
      });
      
      if (activeChatId !== 'support') {
        await loadMessages(activeChatId);
      }
    } catch (err) {
      console.error("Error sending file message:", err);
    }
  };

  // Voice note recording actions
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
          await handleSendSpecialMessage('voice', base64Audio, 'VoiceNote.webm', audioBlob.size, formatTime(recordingTime));
        };
        stream.getTracks().forEach(track => track.stop());
      };
      setMediaRecorder(recorder);
      recorder.start();
      setIsRecording(true);
      setRecordingTime(0);
      recordingTimerRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
    } catch (err) {
      console.error("Error accessing microphone:", err);
      alert("Microphone access denied or not available");
    }
  };

  const stopRecording = () => {
    if (mediaRecorder && mediaRecorder.state !== 'inactive') {
      mediaRecorder.stop();
    }
    clearInterval(recordingTimerRef.current);
    setIsRecording(false);
  };

  // File Upload actions
  const handleFileChange = async (e, type = 'file') => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      alert("File size exceeds the 10MB limit.");
      return;
    }

    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onloadend = async () => {
      const base64File = reader.result;
      await handleSendSpecialMessage(
        type, 
        base64File, 
        file.name, 
        file.size,
        ''
      );
    };
  };

  // Video call actions
  const startVideoCall = async () => {
    setVideoCallActive(true);
    setVideoCallStatus('calling');
    setVideoCallDuration(0);
    
    // Simulate connection after 4 seconds
    setTimeout(async () => {
      setVideoCallStatus('connected');
      // Trigger user camera
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        localStreamRef.current = stream;
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = stream;
        }
      } catch (err) {
        console.warn("Could not load camera for call preview:", err);
      }

      callTimerRef.current = setInterval(() => {
        setVideoCallDuration(prev => prev + 1);
      }, 1000);
    }, 4000);
  };

  const endVideoCall = async () => {
    clearInterval(callTimerRef.current);
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach(track => track.stop());
    }
    
    const finalDuration = formatTime(videoCallDuration);
    setVideoCallActive(false);
    
    // Save to message list
    await handleSendSpecialMessage('video', '', 'Video Call', 0, finalDuration);
  };

  return (
    <div className="h-[calc(100vh-160px)] flex bg-[var(--bg-secondary)] rounded-[3rem] shadow-sm hover:shadow-md transition-all duration-300 fade-in border border-[var(--border-primary)] overflow-hidden relative">
      {/* Sidebar - Chat List */}
      <div className="w-full md:w-80 lg:w-96 border-r border-[var(--border-primary)] flex flex-col bg-white">
        <div className="p-6">
          <h1 className="text-xl font-bold text-slate-900 mb-4">Messages</h1>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
            <input 
              type="text" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search patients or doctors..." 
              className="w-full pl-10 pr-4 py-2.5 bg-white border-none rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none font-medium"
            />
          </div>

          {/* Search results overlay/panel */}
          {searchQuery.trim() && (
            <div className="absolute left-6 right-6 mt-2 bg-white rounded-2xl shadow-xl border border-slate-100 z-50 max-h-60 overflow-y-auto p-2">
              <p className="text-[10px] font-bold text-gray-400 uppercase px-3 py-1.5 tracking-wider">Search Results</p>
              {isSearching ? (
                <div className="p-4 text-center text-xs text-slate-500 flex items-center justify-center gap-2">
                  <Loader size={14} className="animate-spin" /> Searching...
                </div>
              ) : searchResults.length > 0 ? (
                searchResults.map(u => (
                  <button
                    key={u._id || u.id}
                    onClick={() => handleSelectSearchResult(u)}
                    className="w-full text-left px-3 py-2.5 hover:bg-white rounded-xl flex items-center gap-3 transition-colors"
                  >
                    <div className="w-8 h-8 rounded-lg bg-blue-100 text-[#2563EB] font-bold flex items-center justify-center text-xs">
                      {u.name.split(' ').map(n => n[0]).join('')}
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-900">{u.name}</p>
                      <p className="text-[10px] text-gray-500 capitalize">{u.role}</p>
                    </div>
                  </button>
                ))
              ) : (
                <div className="p-4 text-center text-xs text-gray-400">No users found.</div>
              )}
            </div>
          )}
        </div>

        <div className="flex-grow overflow-y-auto">
          {chats.map((chat) => (
            <button
              key={chat.id}
              onClick={() => {
                setActiveChatId(chat.id);
                if (chat.type === 'doctor') {
                  setActiveChatDoctor(doctors[chat.id]);
                } else {
                  setActiveChatDoctor(null);
                }
              }}
              className={`w-full p-4 flex items-center gap-4 transition-all hover:bg-white border-l-4 ${
                activeChatId === chat.id ? 'bg-[#f8fafc]/50 border-blue-600' : 'border-transparent'
              }`}
            >
              <div className="relative">
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${chat.type === 'support' ? 'bg-[var(--color-primary)] text-white' : 'bg-blue-100 text-[var(--color-primary)] font-bold'}`}>
                  {chat.type === 'support' ? <Building2 size={24} /> : chat.name.split(' ').map(n => n[0]).join('')}
                </div>
                {chat.online && (
                  <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-[#22C55E] border-2 border-white rounded-full"></div>
                )}
              </div>
              <div className="flex-grow text-left min-w-0">
                <div className="flex items-center justify-between mb-0.5">
                  <h4 className="text-sm font-bold text-slate-900 truncate">{chat.name}</h4>
                  <span className="text-[10px] font-bold text-slate-500 whitespace-nowrap">Now</span>
                </div>
                <div className="flex items-center justify-between">
                  <p className="text-xs text-slate-500 truncate pr-2">{chat.lastMessage}</p>
                  <span className="text-[9px] font-bold bg-blue-50/50 text-[#2563EB] px-1.5 py-0.5 rounded capitalize">{chat.role}</span>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-grow flex flex-col bg-white/30">
        {activeChatData ? (
          <>
            {/* Chat Header */}
            <div className="p-4 md:p-6 bg-[var(--bg-secondary)] border-b border-[var(--border-primary)] flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="relative">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${activeChatData.type === 'support' ? 'bg-[var(--color-primary)] text-white' : 'bg-blue-100 text-[var(--color-primary)] font-bold'}`}>
                    {activeChatData.type === 'support' ? <Building2 size={20} /> : activeChatData.name.split(' ').map(n => n[0]).join('')}
                  </div>
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900">{activeChatData.name}</h4>
                  <p className="text-[10px] font-bold text-[#22C55E] uppercase tracking-widest">
                    {activeChatData.online ? 'Online' : 'Offline'}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button className="p-2 text-slate-500 hover:text-[var(--color-primary)] hover:bg-[#f8fafc] rounded-xl transition-all">
                  <Phone size={20} />
                </button>
                <button 
                  onClick={startVideoCall}
                  className="p-2 text-slate-500 hover:text-[var(--color-primary)] hover:bg-[#f8fafc] rounded-xl transition-all"
                >
                  <Video size={20} />
                </button>
                <button className="p-2 text-slate-500 hover:text-gray-600 hover:bg-[#f8fafc] rounded-xl transition-all">
                  <MoreVertical size={20} />
                </button>
              </div>
            </div>

            {/* Messages Area */}
            <div className="flex-grow overflow-y-auto p-6 space-y-4">
              {messages.length > 0 ? messages.map((msg, i) => (
                <div 
                  key={msg._id || msg.id || i} 
                  className={`flex ${msg.sender === 'patient' ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`max-w-[75%] space-y-1 ${msg.sender === 'patient' ? 'items-end' : 'items-start'}`}>
                    {/* Render message depending on type */}
                    {msg.messageType === 'voice' ? (
                      <div className={`p-3 rounded-2xl shadow-sm hover:shadow-md transition-shadow fade-in hover:shadow-md transition-all duration-300 text-sm font-medium ${
                        msg.sender === 'patient' 
                          ? 'bg-[var(--color-primary)] text-white rounded-tr-none' 
                          : 'bg-[var(--bg-secondary)] text-slate-500 rounded-tl-none border border-[var(--border-primary)]'
                      }`}>
                        <div className="flex items-center gap-3">
                          <audio src={msg.fileUrl} controls className="max-w-[200px] h-8 outline-none filter brightness-95" />
                          {msg.duration && <span className="text-[10px] opacity-90 whitespace-nowrap">{msg.duration}</span>}
                        </div>
                      </div>
                    ) : msg.messageType === 'image' ? (
                      <div className="rounded-2xl overflow-hidden border border-[var(--border-primary)] shadow-sm hover:shadow-md transition-shadow fade-in hover:shadow-md transition-all duration-300 bg-white p-1">
                        <img 
                          src={msg.fileUrl} 
                          alt="Sent image" 
                          className="max-h-60 rounded-xl cursor-pointer hover:opacity-90 transition-opacity" 
                          onClick={() => window.open(msg.fileUrl)} 
                        />
                      </div>
                    ) : msg.messageType === 'file' ? (
                      <div className={`p-1 rounded-2xl shadow-sm hover:shadow-md transition-shadow fade-in hover:shadow-md transition-all duration-300 ${
                        msg.sender === 'patient' 
                          ? 'bg-[var(--color-primary)] text-white rounded-tr-none' 
                          : 'bg-[var(--bg-secondary)] text-slate-500 rounded-tl-none border border-[var(--border-primary)]'
                      }`}>
                        <a 
                          href={msg.fileUrl} 
                          download={msg.fileName} 
                          className="flex items-center gap-3 p-3 rounded-xl hover:bg-black/5 transition-colors"
                        >
                          <div className="p-2 bg-white/20 rounded-lg">
                            <FileText size={20} />
                          </div>
                          <div className="text-left min-w-0">
                            <p className="text-xs font-bold truncate max-w-[150px]">{msg.fileName}</p>
                            <p className="text-[10px] opacity-75">{msg.fileSize || 'Unknown Size'}</p>
                          </div>
                          <Download size={16} className="ml-2 flex-shrink-0" />
                        </a>
                      </div>
                    ) : msg.messageType === 'video' ? (
                      <div className={`p-4 rounded-2xl text-sm font-medium shadow-sm hover:shadow-md transition-shadow fade-in hover:shadow-md transition-all duration-300 flex items-center gap-3 ${
                        msg.sender === 'patient' 
                          ? 'bg-blue-50/50 text-blue-700 rounded-tr-none' 
                          : 'bg-green-50 text-green-700 rounded-tl-none border border-green-100'
                      }`}>
                        <Video size={18} className="animate-pulse" />
                        <div>
                          <p className="font-bold text-xs">Video Call Completed</p>
                          <p className="text-[10px] opacity-75">Duration: {msg.duration}</p>
                        </div>
                      </div>
                    ) : (
                      // Text Message
                      <div className={`p-4 rounded-2xl text-sm font-medium shadow-sm hover:shadow-md transition-shadow fade-in hover:shadow-md transition-all duration-300 ${
                        msg.sender === 'patient' 
                          ? 'bg-[var(--color-primary)] text-white rounded-tr-none' 
                          : 'bg-[var(--bg-secondary)] text-slate-500 rounded-tl-none border border-[var(--border-primary)]'
                      }`}>
                        {msg.text}
                      </div>
                    )}
                    <div className={`flex items-center gap-1.5 px-1 ${msg.sender === 'patient' ? 'flex-row-reverse' : 'flex-row'}`}>
                      <span className="text-[10px] font-bold text-slate-500">
                        {displayTime(msg.time)}
                      </span>
                      {msg.sender === 'patient' && <CheckCheck size={12} className="text-[var(--color-primary)]" />}
                    </div>
                  </div>
                </div>
              )) : (
                <div className="h-full flex flex-col items-center justify-center text-center text-slate-500">
                  <p className="font-medium">No messages yet.</p>
                  <p className="text-xs">Start the conversation by sending a message below.</p>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Hidden inputs for attachments */}
            <input 
              type="file" 
              ref={fileInputRef} 
              onChange={(e) => handleFileChange(e, 'file')} 
              className="hidden" 
            />
            <input 
              type="file" 
              accept="image/*" 
              ref={imageInputRef} 
              onChange={(e) => handleFileChange(e, 'image')} 
              className="hidden" 
            />

            {/* Input Area */}
            <div className="p-4 md:p-6 bg-[var(--bg-secondary)] border-t border-[var(--border-primary)]">
              {isRecording ? (
                <div className="flex items-center gap-3 bg-red-50 text-red-600 px-4 py-3 rounded-xl flex-grow border border-red-100">
                  <div className="w-2.5 h-2.5 bg-red-600 rounded-full animate-ping"></div>
                  <span className="text-sm font-bold">Recording Voice Note: {formatTime(recordingTime)}</span>
                  <button 
                    type="button" 
                    onClick={stopRecording}
                    className="ml-auto text-xs font-bold bg-red-600 text-white px-3 py-1.5 rounded-lg hover:bg-red-700 active:scale-95 transition-all"
                  >
                    Done & Send
                  </button>
                  <button 
                    type="button" 
                    onClick={() => {
                      clearInterval(recordingTimerRef.current);
                      setIsRecording(false);
                      if (mediaRecorder) {
                        mediaRecorder.stream.getTracks().forEach(t => t.stop());
                      }
                    }}
                    className="text-xs font-bold text-gray-500 hover:text-gray-700"
                  >
                    Cancel
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSendMessage} className="flex items-center gap-3">
                  <button 
                    type="button" 
                    onClick={() => fileInputRef.current?.click()}
                    className="p-2.5 text-slate-500 hover:text-[var(--color-primary)] hover:bg-[#f8fafc] rounded-xl transition-all"
                  >
                    <Paperclip size={20} />
                  </button>
                  <button 
                    type="button" 
                    onClick={() => imageInputRef.current?.click()}
                    className="p-2.5 text-slate-500 hover:text-[var(--color-primary)] hover:bg-[#f8fafc] rounded-xl transition-all"
                  >
                    <ImageIcon size={20} />
                  </button>
                  <button 
                    type="button" 
                    onClick={startRecording}
                    className="p-2.5 text-slate-500 hover:text-[#EF4444] hover:bg-red-50 rounded-xl transition-all"
                  >
                    <Mic size={20} />
                  </button>
                  <input 
                    type="text" 
                    value={messageText}
                    onChange={(e) => setMessageText(e.target.value)}
                    placeholder="Type a message..." 
                    className="flex-grow py-3 px-4 bg-white border-none rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none font-medium"
                  />
                  <button 
                    type="submit"
                    disabled={!messageText.trim()}
                    className="p-3 bg-[var(--color-primary)] text-white rounded-xl shadow-lg shadow-blue-600/20 hover:bg-blue-700 transition-all disabled:opacity-50 active:scale-95"
                  >
                    <Send size={20} />
                  </button>
                </form>
              )}
            </div>
          </>
        ) : (
          <div className="flex-grow flex flex-col items-center justify-center text-center p-6 bg-white/10">
            <div className="w-20 h-20 bg-[#f8fafc] text-[var(--color-primary)] rounded-[24px] flex items-center justify-center mb-4">
              <MessageSquare size={40} />
            </div>
            <h3 className="text-xl font-bold text-slate-900">Your Conversations</h3>
            <p className="text-slate-500 text-sm mt-2 max-w-xs">
              Search a doctor or another patient by typing their name in the search bar above to start messaging.
            </p>
          </div>
        )}
      </div>

      {/* Video Call Modal Overlay */}
      {videoCallActive && (
        <div className="absolute inset-0 bg-slate-900 z-50 flex flex-col items-center justify-between p-8 text-white animate-fade-in">
          {/* Header */}
          <div className="w-full flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 bg-[#EF4444] rounded-full animate-ping"></div>
              <span className="text-xs uppercase tracking-widest font-bold opacity-80">
                {videoCallStatus === 'calling' ? 'Calling...' : 'Live Call'}
              </span>
            </div>
            {videoCallStatus === 'connected' && (
              <span className="text-lg font-mono font-bold bg-white/10 px-4 py-1.5 rounded-full">
                {formatTime(videoCallDuration)}
              </span>
            )}
          </div>

          {/* Video Streams Grid */}
          <div className="flex-grow w-full max-w-4xl my-6 grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
            {/* Local Patient Feed */}
            <div className="relative aspect-video rounded-[24px] bg-slate-800 border-2 border-white/10 overflow-hidden shadow-2xl flex flex-col items-center justify-center">
              {isCameraOff ? (
                <div className="text-slate-500 flex flex-col items-center gap-2">
                  <CameraOff size={40} />
                  <span className="text-sm">Camera Off</span>
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
              <span className="absolute bottom-4 left-4 bg-black/40 text-xs px-3 py-1 rounded-full backdrop-blur">
                You (Patient)
              </span>
            </div>

            {/* Remote Feed */}
            <div className="relative aspect-video rounded-[24px] bg-slate-800 border-2 border-white/10 overflow-hidden shadow-2xl flex flex-col items-center justify-center">
              {videoCallStatus === 'calling' ? (
                <div className="flex flex-col items-center gap-4 text-center">
                  <div className="w-20 h-20 rounded-full bg-blue-500 text-white font-bold text-3xl flex items-center justify-center animate-bounce">
                    {activeChatData?.name?.split(' ').map(n => n[0]).join('') || ''}
                  </div>
                  <div>
                    <h3 className="text-lg font-bold">{activeChatData?.name}</h3>
                    <p className="text-xs opacity-75 capitalize">{activeChatData?.role}</p>
                  </div>
                </div>
              ) : (
                // Connected simulated Remote Feed
                <div className="w-full h-full relative flex flex-col items-center justify-center bg-blue-900/30">
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent z-10"></div>
                  {/* Real WebRTC camera simulators or premium custom animations can go here */}
                  <div className="flex flex-col items-center gap-4 text-center z-20">
                    <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-blue-500 to-indigo-600 text-white font-bold text-4xl flex items-center justify-center border-4 border-white/20 animate-pulse shadow-2xl">
                      {activeChatData?.name?.split(' ').map(n => n[0]).join('') || ''}
                    </div>
                    <div>
                      <h3 className="text-xl font-bold">{activeChatData?.name}</h3>
                      <p className="text-sm text-blue-300 font-bold capitalize">{activeChatData?.role}</p>
                    </div>
                  </div>
                </div>
              )}
              <span className="absolute bottom-4 left-4 bg-black/40 text-xs px-3 py-1 rounded-full backdrop-blur z-20">
                {activeChatData?.name}
              </span>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-6">
            <button 
              onClick={() => setIsMuted(!isMuted)}
              className={`p-4 rounded-full transition-colors ${
                isMuted ? 'bg-[#EF4444] text-white' : 'bg-white/10 hover:bg-white/20 text-white'
              }`}
            >
              {isMuted ? <MicOff size={24} /> : <Mic size={24} />}
            </button>
            
            <button 
              onClick={endVideoCall}
              className="p-4 bg-red-600 hover:bg-red-700 text-white rounded-full shadow-lg hover:shadow-red-600/30 transition-all hover:scale-105 active:scale-95"
            >
              <X size={32} />
            </button>

            <button 
              onClick={() => setIsCameraOff(!isCameraOff)}
              className={`p-4 rounded-full transition-colors ${
                isCameraOff ? 'bg-[#EF4444] text-white' : 'bg-white/10 hover:bg-white/20 text-white'
              }`}
            >
              {isCameraOff ? <CameraOff size={24} /> : <Camera size={24} />}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Messages;
