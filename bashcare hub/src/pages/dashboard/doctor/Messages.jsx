import { useState, useEffect, useRef, useCallback } from 'react';
import { 
  Search, 
  Send, 
  MoreVertical, 
  Phone, 
  Video, 
  ImageIcon, 
  Paperclip,
  CheckCheck,
  MessageSquare,
  User as UserIcon,
  Loader,
  UserPlus
  } from 'lucide-react';
import { useLocation } from 'react-router-dom';
import { db } from '../../../utils/db';

const Messages = ({ user }) => {
  // Utility functions for formatting time and file sizes
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
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
  };

  // MediaCallModal component for handling voice/video calls UI
  const MediaCallModal = ({ isOpen, type, onClose, onEndCall }) => {
    const [duration, setDuration] = useState(0);
    const timerRef = useRef(null);

    useEffect(() => {
      if (isOpen) {
        setDuration(0);
        timerRef.current = setInterval(() => setDuration(d => d + 1), 1000);
      } else {
        clearInterval(timerRef.current);
      }
      return () => clearInterval(timerRef.current);
    }, [isOpen]);

    if (!isOpen) return null;

    const handleEnd = async () => {
      clearInterval(timerRef.current);
      const durationStr = formatTime(duration);
      await onEndCall(durationStr);
      onClose();
    };

    const handleCancel = () => {
      clearInterval(timerRef.current);
      onClose();
    };

    return (
      <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
        <div className="bg-white p-6 rounded-xl shadow-lg w-96">
          <h2 className="text-xl font-semibold mb-4">{type === 'video' ? 'Video Call' : 'Voice Call'} with Verification Officer</h2>
          <p className="mb-2">Duration: {formatTime(duration)}</p>
          <div className="flex justify-end gap-4 mt-4">
            <button onClick={handleCancel} className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300">Cancel</button>
            <button onClick={handleEnd} className="px-4 py-2 bg-[#2563EB] text-white rounded hover:bg-blue-700">End Call</button>
          </div>
        </div>
      </div>
    );
  };

  const location = useLocation();
  const preSelectedPatient = location.state?.patient;
  
  const [activeChatId, setActiveChatId] = useState(preSelectedPatient ? preSelectedPatient.id : null);
  const [messageText, setMessageText] = useState('');
  const [chats, setChats] = useState([]);
  const fileInputRef = useRef(null);
  const imageInputRef = useRef(null);
  const [callModal, setCallModal] = useState({ isOpen: false, type: 'voice' });
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [mediaRecorder, setMediaRecorder] = useState(null);
  const recordingTimerRef = useRef(null);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const messagesEndRef = useRef(null);

  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }
    const delayDebounce = setTimeout(async () => {
      setIsSearching(true);
      try {
        const users = await db.searchUsersForChat(searchQuery);
        // Only include patient roles
        const patients = users.filter(u => u.role === 'patient');
        setSearchResults(patients);
      } catch (err) {
        console.error("Error searching patients:", err);
      } finally {
        setIsSearching(false);
      }
    }, 300);
    return () => clearTimeout(delayDebounce);
  }, [searchQuery]);

  const handleSelectSearchResult = (searchedUser) => {
    const targetId = searchedUser.id || searchedUser._id;
    const existingChat = chats.find(c => c.id === targetId);
    if (existingChat) {
      setActiveChatId(targetId);
    } else {
      const newChat = {
        id: targetId,
        name: searchedUser.name,
        role: 'Patient',
        type: 'patient',
        online: true,
        lastMessage: 'Start a conversation'
      };
      setChats(prev => [newChat, ...prev]);
      setActiveChatId(targetId);
    }
    setSearchQuery('');
    setSearchResults([]);
  };

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  const loadMessages = useCallback(async (chatId) => {
    try {
      const dbChats = await db.getChats();
      // On doctor side, chatId is the patientId, participants are populated user objects
      const currentUserId = user.id || user._id;
      const chat = dbChats.find(c => 
        c.participants.some(p => (p._id || p.id || p) === currentUserId) && 
        c.participants.some(p => (p._id || p.id || p) === chatId)
      );
      setMessages(chat ? chat.messages : []);
    } catch (err) {
      console.error("Error loading messages:", err);
    }
  }, [user.id, user._id]);

  const loadChats = useCallback(async () => {
    try {
      const [allUsers, dbChats] = await Promise.all([
        db.getUsers(),
        db.getChats()
      ]);
      
      // Get all patients the doctor has had chats with
       const currentUserId = user.id || user._id;
       const doctorChats = dbChats.filter(c => 
         c.participants.some(p => (p._id || p.id || p) === currentUserId)
       );
       
       const patientIds = [...new Set(
         doctorChats.map(c => {
           const other = c.participants.find(p => (p._id || p.id || p) !== currentUserId);
           return other ? (other._id || other.id || other) : null;
         }).filter(Boolean)
       )];
      
      // Also include patient from location state if not already there
      if (preSelectedPatient && !patientIds.includes(preSelectedPatient.id)) {
        patientIds.push(preSelectedPatient.id);
      }

      const activePatients = allUsers.filter(u => patientIds.includes(u.id));
      
      const chatList = activePatients.map(patient => {
        const chat = doctorChats.find(c => 
          c.participants.some(p => (p._id || p.id || p) === patient.id)
        );
        return {
          id: patient.id,
          name: patient.name,
          role: 'Patient',
          type: 'patient',
          online: true,
          lastMessage: chat?.lastMessage || 'Start a conversation'
        };
      });
      
      setChats(chatList);
      if (!activeChatId && chatList.length > 0 && !preSelectedPatient) {
        setActiveChatId(chatList[0].id);
      }
    } catch (err) {
      console.error("Error loading chats:", err);
    } finally {
      setLoading(false);
    }
  }, [activeChatId, preSelectedPatient, user.id, user._id]);

  useEffect(() => {
    loadChats();
  }, [loadChats]);

  useEffect(() => {
    if (activeChatId) {
      loadMessages(activeChatId);
    }
  }, [activeChatId, loadMessages]);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  const activeChatData = chats.find(c => c.id === activeChatId);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!messageText.trim() || !activeChatId) return;

    const newMessage = {
      sender: 'doctor',
      senderId: user.id || user._id,
      text: messageText,
      messageType: 'text',
      time: new Date()
    };

    try {
      await db.addChatMessage(activeChatId, newMessage);
      setMessageText('');
      await Promise.all([
        loadMessages(activeChatId),
        loadChats()
      ]);
    } catch (err) {
      console.error("Error sending message:", err);
    }
  };

  // Send file or image as special message
  const handleSendSpecialMessage = async (type, fileEvent) => {
    if (!activeChatId) return;
    const file = fileEvent.target?.files?.[0];
    if (!file) return;
    if (file.size > 10 * 1024 * 1024) {
      alert('File size exceeds 10MB limit.');
      return;
    }
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onloadend = async () => {
      const base64Content = reader.result;
      try {
        await db.addChatMessage(activeChatId, {
          sender: 'doctor',
          senderId: user.id || user._id,
          messageType: type,
          fileUrl: base64Content,
          fileName: file.name,
          fileSize: formatBytes(file.size),
          text: type === 'image' ? '🖼️ Sent an image' : `📁 Sent file: ${file.name}`
        });
        await loadMessages(activeChatId);
      } catch (err) {
        console.error('Error sending special message:', err);
      }
    };
  };

  // Voice note handling
  const startRecording = async () => {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      alert('Audio recording not supported in this browser.');
      return;
    }
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    const recorder = new MediaRecorder(stream);
    const chunks = [];
    recorder.ondataavailable = e => chunks.push(e.data);
    recorder.onstop = async () => {
      const blob = new Blob(chunks, { type: 'audio/webm' });
      const base64Audio = await new Promise(res => {
        const reader = new FileReader();
        reader.onloadend = () => res(reader.result);
        reader.readAsDataURL(blob);
      });
      const duration = formatTime(recordingTime);
      await handleDirectSendSpecial('voice', base64Audio, 'voice_note.webm', blob.size, duration);
      setIsRecording(false);
      setRecordingTime(0);
    };
    recorder.start();
    setMediaRecorder(recorder);
    setIsRecording(true);
    recordingTimerRef.current = setInterval(() => setRecordingTime(t => t + 1), 1000);
  };

  const stopRecording = () => {
    if (mediaRecorder && mediaRecorder.state !== 'inactive') {
      mediaRecorder.stop();
    }
    clearInterval(recordingTimerRef.current);
  };

  const cancelRecording = () => {
    if (mediaRecorder && mediaRecorder.state !== 'inactive') {
      mediaRecorder.stop();
    }
    clearInterval(recordingTimerRef.current);
    setIsRecording(false);
    setRecordingTime(0);
  };

  // Direct send for voice or video call logs
  const handleDirectSendSpecial = async (type, base64Data, fileName, sizeVal, duration) => {
    if (!activeChatId) return;
    try {
      await db.addChatMessage(activeChatId, {
        sender: 'doctor',
        senderId: user.id || user._id,
        messageType: type,
        fileUrl: base64Data,
        fileName,
        fileSize: sizeVal ? formatBytes(sizeVal) : '',
        duration,
        text: type === 'voice' ? '🎤 Sent a voice note' : `📹 Video Call - Duration: ${duration}`
      });
      await loadMessages(activeChatId);
    } catch (err) {
      console.error('Error sending direct special message:', err);
    }
  };
  if (loading) return <div className="p-8 text-center font-bold text-slate-500">Loading your conversations...</div>;

  return (
    <div className="h-[calc(100vh-160px)] flex bg-[var(--bg-secondary)] rounded-[3rem] shadow-sm hover:shadow-md transition-shadow fade-in hover:shadow-md transition-all duration-300 border border-[var(--border-primary)] overflow-hidden">
      {/* Sidebar - Chat List */}
      <div className="w-full md:w-80 lg:w-96 border-r border-[var(--border-primary)] flex flex-col">
        <div className="p-6">
          <h1 className="text-xl font-bold text-slate-900 mb-4">Patient Messages</h1>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
            <input 
              type="text" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search patients by name..." 
              className="w-full pl-10 pr-4 py-2.5 bg-white  border-none rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none text-slate-900 font-medium"
            />

            {/* Search Results Dropdown */}
            {searchQuery.trim() && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-[var(--bg-secondary)]  border border-[var(--border-primary)]  rounded-2xl shadow-2xl overflow-hidden z-50 max-h-72 overflow-y-auto">
                {isSearching ? (
                  <div className="flex items-center justify-center gap-2 p-6 text-slate-500">
                    <Loader size={16} className="animate-spin" />
                    <span className="text-xs font-bold">Searching patients...</span>
                  </div>
                ) : searchResults.length > 0 ? (
                  searchResults.map((result) => (
                    <button
                      key={result.id || result._id}
                      onClick={() => handleSelectSearchResult(result)}
                      className="w-full p-3.5 flex items-center gap-3.5 hover:bg-blue-50/50 dark:bg-slate-700 transition-all text-left border-b border-[var(--border-primary)]  last:border-none"
                    >
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-100 to-indigo-100   flex items-center justify-center text-[var(--color-primary)] font-bold text-sm border border-blue-200/50 ">
                        {result.name.split(' ').map(n => n[0]).join('')}
                      </div>
                      <div className="flex-grow min-w-0">
                        <h4 className="text-sm font-bold text-slate-900  truncate">{result.name}</h4>
                        <p className="text-[10px] text-slate-500 truncate">{result.email}</p>
                      </div>
                      <div className="flex-shrink-0">
                        <UserPlus size={16} className="text-[var(--color-primary)]" />
                      </div>
                    </button>
                  ))
                ) : (
                  <div className="p-6 text-center">
                    <p className="text-xs font-bold text-slate-500">No patients found for "{searchQuery}"</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        <div className="flex-grow overflow-y-auto">
          {chats.length > 0 ? chats.map((chat) => (
            <button
              key={chat.id}
              onClick={() => setActiveChatId(chat.id)}
              className={`w-full p-4 flex items-center gap-4 transition-all hover:bg-white dark:bg-slate-800 border-l-4 ${
                activeChatId === chat.id ? 'bg-[#f8fafc]/50  border-blue-600' : 'border-transparent'
              }`}
            >
              <div className="relative">
                <div className="w-12 h-12 rounded-2xl bg-blue-100  text-[var(--color-primary)] font-bold flex items-center justify-center text-sm">
                  {chat.name ? chat.name.split(' ').map(n => n[0]).join('') : <UserIcon size={24} />}
                </div>
                {chat.online && (
                  <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-[#22C55E] border-2 border-white  rounded-full"></div>
                )}
              </div>
              <div className="flex-grow text-left min-w-0">
                <div className="flex items-center justify-between mb-0.5">
                  <h4 className="text-sm font-bold text-slate-900  truncate">{chat.name}</h4>
                  <span className="text-[10px] font-bold text-slate-500 whitespace-nowrap">Now</span>
                </div>
                <div className="flex items-center justify-between">
                  <p className="text-xs text-slate-500 truncate pr-2">{chat.lastMessage}</p>
                </div>
              </div>
            </button>
          )) : (
            <div className="flex flex-col items-center justify-center text-center p-8 pt-16">
              <div className="w-14 h-14 bg-white  rounded-2xl flex items-center justify-center mb-4">
                <MessageSquare size={24} className="text-slate-500 opacity-40" />
              </div>
              <p className="text-sm font-bold text-slate-900 ">No conversations yet</p>
              <p className="text-xs text-slate-500 mt-1 max-w-[200px]">Use the search bar above to find a patient and start chatting.</p>
            </div>
          )}
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
                  <div className="w-10 h-10 rounded-xl bg-blue-100 text-[var(--color-primary)] font-bold flex items-center justify-center">
                    <UserIcon size={20} />
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
                <button className="p-2 text-slate-500 hover:text-[var(--color-primary)] hover:bg-[#f8fafc] rounded-xl transition-all" onClick={() => setCallModal({ isOpen: true, type: 'voice' })}>
                  <Phone size={20} />
                </button>
                <button className="p-2 text-slate-500 hover:text-[var(--color-primary)] hover:bg-[#f8fafc] rounded-xl transition-all" onClick={() => setCallModal({ isOpen: true, type: 'video' })}>
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
                  key={msg.id || i} 
                  className={`flex ${msg.sender === 'doctor' ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`max-w-[75%] space-y-1 ${msg.sender === 'doctor' ? 'items-end' : 'items-start'}`}>
                    <div className={`p-4 rounded-2xl text-sm font-medium shadow-sm hover:shadow-md transition-shadow fade-in hover:shadow-md transition-all duration-300 ${
                      msg.sender === 'doctor' 
                        ? 'bg-[var(--color-primary)] text-white rounded-tr-none' 
                        : 'bg-[var(--bg-secondary)] text-slate-500 rounded-tl-none border border-[var(--border-primary)]'
                    }`}>
                      {msg.text}
                    </div>
                    <div className={`flex items-center gap-1.5 px-1 ${msg.sender === 'doctor' ? 'flex-row-reverse' : 'flex-row'}`}>
                      <span className="text-[10px] font-bold text-slate-500">
                        {displayTime(msg.time)}
                      </span>
                      {msg.sender === 'doctor' && <CheckCheck size={12} className="text-[var(--color-primary)]" />}
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

            {/* Input Area */}
            <div className="p-4 md:p-6 bg-[var(--bg-secondary)] border-t border-[var(--border-primary)]">
              <form onSubmit={handleSendMessage} className="flex items-center gap-3">
                <button type="button" onClick={() => fileInputRef.current?.click()} className="p-2 text-slate-500 hover:text-[var(--color-primary)]">
                  <Paperclip size={20} />
                </button>
                <button type="button" onClick={() => imageInputRef.current?.click()} className="p-2 text-slate-500 hover:text-[var(--color-primary)]"><ImageIcon size={20} /></button>
                {/* Hidden file inputs */}
                <input type="file" ref={fileInputRef} style={{ display: 'none' }} onChange={(e) => handleSendSpecialMessage('file', e)} />
                <input type="file" accept="image/*" ref={imageInputRef} style={{ display: 'none' }} onChange={(e) => handleSendSpecialMessage('image', e)} />
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
            </div>
          </>
        ) : (
          <div className="flex-grow flex flex-col items-center justify-center text-center p-6">
            <div className="w-20 h-20 bg-[#f8fafc] text-[var(--color-primary)] rounded-[24px] flex items-center justify-center mb-4">
              <MessageSquare size={40} />
            </div>
            <h3 className="text-xl font-bold text-slate-900">Patient Conversations</h3>
            <p className="text-slate-500 text-sm mt-2 max-w-xs">
              Select a patient to start messaging.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Messages;
