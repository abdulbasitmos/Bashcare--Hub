import { useState, useEffect, useRef, useCallback } from 'react';
import { io } from 'socket.io-client';
import { 
  Video, 
  VideoOff, 
  Mic, 
  MicOff, 
  Hand, 
  MessageSquare, 
  Users as UsersIcon, 
  PhoneOff, 
  Lock, 
  Unlock, 
  VolumeX, 
  Edit3, 
  Trash2, 
  Megaphone,
  Radio,
  Copy,
  CheckCircle,
  HelpCircle
} from 'lucide-react';
import { db } from '../../../utils/db';

const MeetingPortal = ({ user, role, exitPortal }) => {
  const [roomCode, setRoomCode] = useState('');
  const [meetingState, setMeetingState] = useState('setup'); // 'setup' | 'connected' | 'ended'
  const [activeParticipants, setActiveParticipants] = useState([]);
  const [chatMessages, setChatMessages] = useState([]);
  const [newMsg, setNewMsg] = useState('');
  
  // Device Controls
  const [micEnabled, setMicEnabled] = useState(true);
  const [camEnabled, setCamEnabled] = useState(true);
  const [handRaised, setHandRaised] = useState(false);
  const [isCopied, setIsCopied] = useState(false);

  // Tab View
  const [activeTab, setActiveTab] = useState('chat'); // 'chat' | 'participants' | 'whiteboard'
  
  // Host / Admin controls
  const [lockStatus, setLockStatus] = useState(false);
  const [broadcastInput, setBroadcastInput] = useState('');
  const [currentBroadcast, setCurrentBroadcast] = useState('');

  // Refs for WebRTC & Canvas
  const localVideoRef = useRef(null);
  const canvasRef = useRef(null);
  const socketRef = useRef(null);
  const localStreamRef = useRef(null);
  
  // Drawing states
  const [isDrawing, setIsDrawing] = useState(false);
  const [color, setColor] = useState('#3b82f6');
  const [lineWidth, setLineWidth] = useState(3);
  const lastPosRef = useRef({ x: 0, y: 0 });

  // Error/Status States
  const [errorMessage, setErrorMessage] = useState('');
  const [isConnecting, setIsConnecting] = useState(false);

  // Stop device media stream
  const stopMediaStream = useCallback(() => {
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach(track => track.stop());
      localStreamRef.current = null;
    }
  }, []);

  // Initialize camera/mic for local preview
  const initLocalStream = async (enableCam, enableMic) => {
    try {
      stopMediaStream();
      if (!enableCam && !enableMic) return;

      const constraints = {
        video: enableCam ? { width: 320, height: 240, facingMode: 'user' } : false,
        audio: enableMic
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      localStreamRef.current = stream;
      if (localVideoRef.current && enableCam) {
        localVideoRef.current.srcObject = stream;
      }
    } catch (err) {
      console.warn("Media devices access denied/unavailable:", err);
    }
  };

  // Keep camera feed bound to video element when cam status changes
  useEffect(() => {
    if (meetingState === 'connected') {
      initLocalStream(camEnabled, micEnabled);
    }
    return () => stopMediaStream();
  }, [camEnabled, micEnabled, meetingState, stopMediaStream]);

  // Handle Socket.io connections & sync
  const connectToMeeting = (code) => {
    setIsConnecting(true);
    setErrorMessage('');
    
    const apiBase = import.meta.env.VITE_API_URL || 'http://localhost:5000';
    const socket = io(apiBase);
    socketRef.current = socket;

    socket.on('connect', () => {
      console.log('Connected to socket server');
      // Emit join meeting
      socket.emit('join_meeting', {
        roomCode: code,
        userId: user.id,
        name: user.name,
        role: role,
        mic: micEnabled,
        cam: camEnabled
      });
      setIsConnecting(false);
      setMeetingState('connected');
    });

    // Listen for participant list updates
    socket.on('participants_list', (list) => {
      setActiveParticipants(list);
    });

    // Listen for new chat messages
    socket.on('receive_meeting_chat', (msg) => {
      setChatMessages(prev => [...prev, msg]);
    });

    // Listen for whiteboard drawings
    socket.on('receive_whiteboard_draw', (drawData) => {
      drawOnCanvas(drawData);
    });

    // Listen for whiteboard clear
    socket.on('receive_whiteboard_clear', () => {
      clearLocalCanvas();
    });

    // Listen for Admin actions
    socket.on('receive_admin_action', ({ action, value }) => {
      if (action === 'mute_all' && value === true && role !== 'admin') {
        setMicEnabled(false);
        alert('The administrator has muted all microphones.');
      } else if (action === 'lock_room') {
        setLockStatus(value);
      } else if (action === 'broadcast_message') {
        setCurrentBroadcast(value);
      } else if (action === 'end_meeting') {
        handleLeaveMeeting(true);
      }
    });

    socket.on('connect_error', () => {
      setErrorMessage('Failed to connect to real-time server. Ensure backend is running.');
      setIsConnecting(false);
      socket.close();
    });
  };

  // Create Room (Admin only)
  const handleCreateRoom = async () => {
    const randomCode = 'BASH-' + Math.floor(1000 + Math.random() * 9000) + '-' + Math.floor(1000 + Math.random() * 9000);
    try {
      setIsConnecting(true);
      await db.createMeeting({
        roomCode: randomCode,
        hostName: user.name
      });
      setRoomCode(randomCode);
      connectToMeeting(randomCode);
    } catch (err) {
      setErrorMessage(err.message || 'Failed to initialize meeting room.');
      setIsConnecting(false);
    }
  };

  // Join Room (Doctor or Admin entry)
  const handleJoinRoom = async (e) => {
    e.preventDefault();
    if (!roomCode.trim()) return;
    const formattedCode = roomCode.trim().toUpperCase();

    try {
      setIsConnecting(true);
      const meeting = await db.getMeetingByCode(formattedCode);
      if (meeting.isLocked) {
        setErrorMessage('This meeting room has been locked by the host.');
        setIsConnecting(false);
        return;
      }
      setRoomCode(formattedCode);
      connectToMeeting(formattedCode);
    } catch (err) {
      setErrorMessage(err.message || 'Room code not found or meeting ended.');
      setIsConnecting(false);
    }
  };

  // Send message
  const handleSendChat = (e) => {
    e.preventDefault();
    if (!newMsg.trim() || !socketRef.current) return;
    socketRef.current.emit('send_meeting_chat', { roomCode, text: newMsg });
    setNewMsg('');
  };

  // Toggle local states and push changes to socket
  const toggleMic = () => {
    const nextState = !micEnabled;
    setMicEnabled(nextState);
    if (socketRef.current) {
      socketRef.current.emit('update_participant_state', {
        roomCode,
        state: { mic: nextState }
      });
    }
  };

  const toggleCam = () => {
    const nextState = !camEnabled;
    setCamEnabled(nextState);
    if (socketRef.current) {
      socketRef.current.emit('update_participant_state', {
        roomCode,
        state: { cam: nextState }
      });
    }
  };

  const toggleHandRaise = () => {
    const nextState = !handRaised;
    setHandRaised(nextState);
    if (socketRef.current) {
      socketRef.current.emit('update_participant_state', {
        roomCode,
        state: { handRaised: nextState }
      });
    }
  };

  // Host Controls (Admin only)
  const triggerMuteAll = () => {
    if (socketRef.current && role === 'admin') {
      socketRef.current.emit('admin_action', { roomCode, action: 'mute_all', value: true });
    }
  };

  const toggleLockRoom = async () => {
    const nextState = !lockStatus;
    if (socketRef.current && role === 'admin') {
      try {
        await db.updateMeeting(roomCode, { isLocked: nextState });
        socketRef.current.emit('admin_action', { roomCode, action: 'lock_room', value: nextState });
        setLockStatus(nextState);
      } catch (err) {
        console.error(err);
      }
    }
  };

  const postBroadcast = () => {
    if (socketRef.current && role === 'admin') {
      socketRef.current.emit('admin_action', { roomCode, action: 'broadcast_message', value: broadcastInput });
      setBroadcastInput('');
    }
  };

  const clearBroadcast = () => {
    if (socketRef.current && role === 'admin') {
      socketRef.current.emit('admin_action', { roomCode, action: 'broadcast_message', value: '' });
    }
  };

  // Leaving / Terminating meeting
  const handleLeaveMeeting = async (wasEndedByAdmin = false) => {
    stopMediaStream();
    if (socketRef.current) {
      socketRef.current.disconnect();
    }
    if (role === 'admin' && !wasEndedByAdmin) {
      // Prompt admin to end meeting for all
      if (window.confirm('Do you want to end the meeting for all participants?')) {
        try {
          await db.updateMeeting(roomCode, { status: 'ended' });
          if (socketRef.current) {
            socketRef.current.emit('admin_action', { roomCode, action: 'end_meeting', value: true });
          }
        } catch (err) {
          console.error(err);
        }
      }
    }
    setMeetingState('ended');
  };

  // Copy Code to Clipboard
  const copyRoomCode = () => {
    navigator.clipboard.writeText(roomCode);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  // Canvas Whiteboard Drawing Handlers
  const getMousePos = (canvas, evt) => {
    const rect = canvas.getBoundingClientRect();
    return {
      x: ((evt.clientX - rect.left) / rect.width) * canvas.width,
      y: ((evt.clientY - rect.top) / rect.height) * canvas.height
    };
  };

  const startDrawing = (e) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const pos = getMousePos(canvas, e);
    lastPosRef.current = pos;
    setIsDrawing(true);
  };

  const draw = (e) => {
    if (!isDrawing || !canvasRef.current) return;
    const canvas = canvasRef.current;
    const pos = getMousePos(canvas, e);

    const drawData = {
      x0: lastPosRef.current.x,
      y0: lastPosRef.current.y,
      x1: pos.x,
      y1: pos.y,
      color,
      lineWidth
    };

    drawOnCanvas(drawData);

    // Emit to other participants
    if (socketRef.current) {
      socketRef.current.emit('whiteboard_draw', { roomCode, drawData });
    }

    lastPosRef.current = pos;
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const drawOnCanvas = ({ x0, y0, x1, y1, color, lineWidth }) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    ctx.beginPath();
    ctx.moveTo(x0, y0);
    ctx.lineTo(x1, y1);
    ctx.strokeStyle = color;
    ctx.lineWidth = lineWidth;
    ctx.lineCap = 'round';
    ctx.stroke();
    ctx.closePath();
  };

  const clearLocalCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  };

  const triggerClearCanvas = () => {
    clearLocalCanvas();
    if (socketRef.current) {
      socketRef.current.emit('whiteboard_clear', { roomCode });
    }
  };

  // Setup drawing canvas size
  useEffect(() => {
    if (activeTab === 'whiteboard' && canvasRef.current) {
      const canvas = canvasRef.current;
      canvas.width = 800;
      canvas.height = 500;
    }
  }, [activeTab]);

  // Setup broadcast display cleanup
  useEffect(() => {
    let timeout;
    if (currentBroadcast) {
      timeout = setTimeout(() => setCurrentBroadcast(''), 10000);
    }
    return () => clearTimeout(timeout);
  }, [currentBroadcast]);

  return (
    <div className="min-h-screen bg-slate-900 text-white font-sans overflow-hidden flex flex-col relative">
      <style>{`
        .glass-panel {
          background: rgba(15, 23, 42, 0.45);
          backdrop-filter: blur(16px);
          border: 1px solid rgba(255, 255, 255, 0.08);
        }
        .mic-active {
          box-shadow: 0 0 15px rgba(59, 130, 246, 0.4);
        }
        .video-box {
          aspect-ratio: 16/10;
          background: #0f172a;
          border-radius: 1.5rem;
          border: 2px solid rgba(255, 255, 255, 0.04);
          overflow: hidden;
          transition: all 0.3s ease;
        }
        .active-speaker {
          border-color: #3b82f6;
          box-shadow: 0 0 25px rgba(59, 130, 246, 0.25);
        }
        .wave-bar {
          display: inline-block;
          width: 3px;
          height: 12px;
          background-color: #3b82f6;
          margin: 0 1px;
          border-radius: 10px;
          animation: wave 1.2s infinite ease-in-out;
        }
        .wave-bar:nth-child(2) { animation-delay: 0.2s; }
        .wave-bar:nth-child(3) { animation-delay: 0.4s; }
        .wave-bar:nth-child(4) { animation-delay: 0.6s; }
        @keyframes wave {
          0%, 100% { height: 4px; }
          50% { height: 16px; }
        }
        .pulse-glowing {
          animation: glow 2s infinite alternate;
        }
        @keyframes glow {
          0% { box-shadow: 0 0 5px rgba(239, 68, 68, 0.3); }
          100% { box-shadow: 0 0 15px rgba(239, 68, 68, 0.6); }
        }
      `}</style>

      {/* Broadcast Banner overlay */}
      {currentBroadcast && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-50 w-full max-w-xl px-4 animate-bounce">
          <div className="bg-gradient-to-r from-red-600 to-amber-600 text-white font-bold p-4 rounded-2xl shadow-2xl flex items-center gap-3 border border-red-500/30">
            <Megaphone size={24} className="flex-shrink-0 animate-pulse" />
            <div className="flex-grow text-sm">
              <span className="uppercase text-xs tracking-wider block text-white/70 font-black mb-0.5">Admin Announcement</span>
              {currentBroadcast}
            </div>
          </div>
        </div>
      )}

      {/* SETUP VIEW: BEFORE JOINING ROOM */}
      {meetingState === 'setup' && (
        <div className="flex-grow flex items-center justify-center p-6 relative">
          {/* Subtle background glow circles */}
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-50/500/10 rounded-full blur-3xl"></div>
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl"></div>

          <div className="w-full max-w-md glass-panel p-8 rounded-[24px] shadow-2xl z-10 space-y-8">
            <div className="text-center">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-blue-50/500/10 text-blue-400 font-bold text-xs rounded-full uppercase tracking-wider mb-3">
                <Radio size={12} className="animate-pulse" /> Live Clinical Meetings
              </span>
              <h1 className="text-3xl font-black tracking-tight">Staff Consult Room</h1>
              <p className="text-slate-400 text-sm mt-1">Connect, present, and align with hospital medical staff.</p>
            </div>

            {errorMessage && (
              <div className="p-4 bg-red-950/40 border border-red-800/40 text-red-400 text-xs font-bold rounded-2xl">
                {errorMessage}
              </div>
            )}

            <div className="space-y-6">
              {role === 'admin' ? (
                <div className="grid grid-cols-1 gap-4">
                  <button
                    disabled={isConnecting}
                    onClick={handleCreateRoom}
                    className="w-full py-4 bg-[#2563EB] hover:bg-blue-700 text-white rounded-2xl font-bold flex items-center justify-center gap-2 shadow-lg shadow-blue-500/20 active:scale-98 transition-all disabled:opacity-50"
                  >
                    {isConnecting ? 'Opening Workspace...' : 'Create Meeting Room'}
                  </button>
                  
                  <div className="relative flex items-center py-2">
                    <div className="flex-grow border-t border-slate-800"></div>
                    <span className="flex-shrink mx-4 text-xs font-bold uppercase text-slate-500 tracking-widest">Or Entry Meeting Code</span>
                    <div className="flex-grow border-t border-slate-800"></div>
                  </div>
                </div>
              ) : null}

              <form onSubmit={handleJoinRoom} className="space-y-4">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Enter Meeting Code</label>
                  <input
                    type="text"
                    value={roomCode}
                    onChange={(e) => setRoomCode(e.target.value)}
                    placeholder="e.g., BASH-1234-5678"
                    className="w-full p-4 bg-slate-950/80 border border-slate-800 rounded-2xl text-center text-lg font-bold tracking-widest uppercase placeholder:normal-case placeholder:tracking-normal placeholder:font-medium focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 outline-none transition-all"
                  />
                </div>
                <button
                  type="submit"
                  disabled={isConnecting || !roomCode}
                  className="w-full py-4 bg-slate-800 hover:bg-slate-700 text-white rounded-2xl font-bold flex items-center justify-center gap-2 active:scale-98 transition-all disabled:opacity-50"
                >
                  {isConnecting ? 'Joining Room...' : 'Join Meeting'}
                </button>
              </form>
            </div>

            <div className="flex items-center justify-center gap-6 pt-4 border-t border-slate-800/80">
              <button 
                onClick={() => setMicEnabled(!micEnabled)}
                className={`p-3.5 rounded-full border transition-all ${micEnabled ? 'bg-slate-800 border-slate-700 hover:bg-slate-700' : 'bg-red-950/50 border-red-800/30 text-red-400'}`}
              >
                {micEnabled ? <Mic size={18} /> : <MicOff size={18} />}
              </button>
              <button 
                onClick={() => setCamEnabled(!camEnabled)}
                className={`p-3.5 rounded-full border transition-all ${camEnabled ? 'bg-slate-800 border-slate-700 hover:bg-slate-700' : 'bg-red-950/50 border-red-800/30 text-red-400'}`}
              >
                {camEnabled ? <Video size={18} /> : <VideoOff size={18} />}
              </button>
              <button 
                type="button"
                onClick={exitPortal}
                className="px-5 py-2.5 bg-slate-900 border border-slate-800 hover:bg-slate-950 hover:border-slate-700 rounded-xl text-xs font-bold text-slate-400"
              >
                Back to Dashboard
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CONNECTED LIVE VIEW */}
      {meetingState === 'connected' && (
        <div className="flex-grow flex flex-col md:flex-row">
          
          {/* Main workspace layout */}
          <div className="flex-grow flex flex-col p-6 space-y-6 max-h-screen overflow-y-auto">
            
            {/* Header info */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 glass-panel p-4 px-6 rounded-[24px]">
              <div className="flex items-center gap-4">
                <div className="w-3.5 h-3.5 bg-[#EF4444] rounded-full animate-ping"></div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-black text-sm tracking-wide">Live Meeting Room</span>
                    {lockStatus ? (
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold bg-red-950/50 border border-red-800/30 text-red-400 px-2 py-0.5 rounded-md"><Lock size={10} /> Locked</span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold bg-green-950/50 border border-green-800/30 text-green-400 px-2 py-0.5 rounded-md"><Unlock size={10} /> Open</span>
                    )}
                  </div>
                  <p className="text-xs text-slate-400 font-medium">Participants connected: {activeParticipants.length}</p>
                </div>
              </div>

              {/* Room Code Display */}
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Room Code:</span>
                <div className="flex bg-slate-950/80 rounded-xl border border-slate-800 p-1.5 px-3 items-center gap-3">
                  <span className="font-mono text-sm font-bold tracking-widest text-blue-400">{roomCode}</span>
                  <button 
                    onClick={copyRoomCode}
                    className="p-1 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white transition-colors"
                    title="Copy Meeting Code"
                  >
                    {isCopied ? <CheckCircle size={14} className="text-[#22C55E]" /> : <Copy size={14} />}
                  </button>
                </div>
              </div>
            </div>

            {/* Video Streams Container */}
            <div className="flex-grow grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 items-center">
              
              {/* Local Participant Card (Me) */}
              <div className="video-box active-speaker relative flex flex-col items-center justify-center">
                {camEnabled ? (
                  <video 
                    ref={localVideoRef} 
                    autoPlay 
                    playsInline 
                    muted 
                    className="w-full h-full object-cover scale-x-[-1]"
                  />
                ) : (
                  <div className="w-20 h-20 rounded-full bg-[#2563EB]/10 border-2 border-blue-500/20 flex items-center justify-center text-blue-400 font-black text-2xl">
                    {user.name.split(' ').map(n => n[0]).join('')}
                  </div>
                )}

                {/* Info Overlay */}
                <div className="absolute top-4 left-4 flex gap-2">
                  <span className="bg-slate-950/70 backdrop-blur-md px-3 py-1 rounded-xl text-[10px] font-bold uppercase tracking-wider text-blue-400 border border-blue-500/20">Me (Host)</span>
                  {handRaised && (
                    <span className="bg-[#F59E0B] text-slate-950 p-1 px-2 rounded-xl text-[10px] font-extrabold flex items-center gap-1 animate-pulse"><Hand size={10} /> Hand Raised</span>
                  )}
                </div>

                <div className="absolute bottom-4 left-4 right-4 flex justify-between items-center bg-slate-950/60 backdrop-blur-md px-3.5 py-2 rounded-2xl text-xs border border-white/5">
                  <span className="font-bold truncate">{user.name}</span>
                  <div className="flex gap-2 text-slate-300">
                    {micEnabled ? (
                      <div className="flex items-center gap-1.5 bg-[#2563EB]/20 text-blue-400 px-2 py-0.5 rounded-lg border border-blue-500/10">
                        <div className="flex items-center"><div className="wave-bar"></div><div className="wave-bar"></div><div className="wave-bar"></div></div>
                        <span className="text-[10px] font-bold">Live</span>
                      </div>
                    ) : <MicOff size={14} className="text-[#EF4444]" />}
                    {!camEnabled && <VideoOff size={14} className="text-[#EF4444]" />}
                  </div>
                </div>
              </div>

              {/* Active Participants Streams */}
              {activeParticipants.filter(p => p.userId !== user.id).map((participant, index) => (
                <div 
                  key={participant.socketId || index} 
                  className={`video-box relative flex flex-col items-center justify-center ${participant.mic ? 'active-speaker' : ''}`}
                >
                  {/* Mock Remote video feed using dynamic animations */}
                  {participant.cam ? (
                    <div className="w-full h-full bg-slate-950 flex items-center justify-center relative overflow-hidden">
                      {/* Animated mesh canvas as mock webcam feed */}
                      <div className="absolute inset-0 bg-gradient-to-br from-indigo-950/40 via-slate-950 to-blue-950/40 opacity-70"></div>
                      <div className="w-24 h-24 rounded-full bg-indigo-500/10 flex items-center justify-center text-indigo-400 border border-indigo-500/20 relative z-10 animate-pulse">
                        <Video size={36} className="text-indigo-400 opacity-60 animate-bounce" />
                      </div>
                      <div className="absolute bottom-4 right-4 text-[9px] font-black uppercase text-indigo-400 bg-indigo-950/60 border border-indigo-500/20 px-2 py-0.5 rounded-md tracking-wider">Feed Connected</div>
                    </div>
                  ) : (
                    <div className="w-20 h-20 rounded-full bg-slate-800/80 border-2 border-slate-700/50 flex items-center justify-center text-slate-300 font-black text-2xl">
                      {participant.name.split(' ').map(n => n[0]).join('')}
                    </div>
                  )}

                  {/* Info Overlay */}
                  <div className="absolute top-4 left-4 flex gap-2">
                    <span className={`px-3 py-1 rounded-xl text-[10px] font-bold uppercase tracking-wider border ${
                      participant.role === 'admin' 
                        ? 'bg-[#EF4444]/10 border-red-500/20 text-red-400' 
                        : 'bg-indigo-500/10 border-indigo-500/20 text-indigo-400'
                    }`}>
                      {participant.role}
                    </span>
                    {participant.handRaised && (
                      <span className="bg-[#F59E0B] text-slate-950 p-1 px-2 rounded-xl text-[10px] font-extrabold flex items-center gap-1"><Hand size={10} /> Hand Raised</span>
                    )}
                  </div>

                  <div className="absolute bottom-4 left-4 right-4 flex justify-between items-center bg-slate-950/60 backdrop-blur-md px-3.5 py-2 rounded-2xl text-xs border border-white/5">
                    <span className="font-bold truncate">{participant.name}</span>
                    <div className="flex gap-2">
                      {participant.mic ? (
                        <div className="flex items-center gap-1.5 bg-[#2563EB]/20 text-blue-400 px-2 py-0.5 rounded-lg border border-blue-500/10">
                          <div className="flex items-center"><div className="wave-bar"></div><div className="wave-bar"></div><div className="wave-bar"></div></div>
                          <span className="text-[10px] font-bold">Speaking</span>
                        </div>
                      ) : <MicOff size={14} className="text-[#EF4444]" />}
                      {!participant.cam && <VideoOff size={14} className="text-[#EF4444]" />}
                    </div>
                  </div>
                </div>
              ))}

              {/* Placeholder when alone in room */}
              {activeParticipants.length <= 1 && (
                <div className="video-box border-dashed border-2 border-slate-800 flex flex-col items-center justify-center p-8 text-center text-slate-500">
                  <div className="w-16 h-16 rounded-full bg-slate-950 border border-slate-800 flex items-center justify-center mb-4">
                    <HelpCircle size={28} className="opacity-40 animate-pulse" />
                  </div>
                  <h4 className="font-bold text-sm text-slate-400">Waiting for participants</h4>
                  <p className="text-xs text-slate-600 max-w-[200px] mt-1">Share the meeting room code with other clinicians to start the sync.</p>
                </div>
              )}
            </div>

            {/* Live Control Panel Dock */}
            <div className="glass-panel p-4 rounded-[24px] flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-2.5">
                <button
                  onClick={toggleMic}
                  className={`p-3.5 rounded-2xl transition-all border ${micEnabled ? 'bg-[#2563EB] hover:bg-blue-700 text-white border-blue-500 mic-active' : 'bg-red-950/60 border-red-800/30 text-[#EF4444]'}`}
                  title={micEnabled ? 'Mute Microphone' : 'Unmute Microphone'}
                >
                  {micEnabled ? <Mic size={20} /> : <MicOff size={20} />}
                </button>
                <button
                  onClick={toggleCam}
                  className={`p-3.5 rounded-2xl transition-all border ${camEnabled ? 'bg-[#2563EB] hover:bg-blue-700 text-white border-blue-500 mic-active' : 'bg-red-950/60 border-red-800/30 text-[#EF4444]'}`}
                  title={camEnabled ? 'Disable Camera' : 'Enable Camera'}
                >
                  {camEnabled ? <Video size={20} /> : <VideoOff size={20} />}
                </button>
                {role !== 'admin' && (
                  <button
                    onClick={toggleHandRaise}
                    className={`p-3.5 rounded-2xl transition-all border ${handRaised ? 'bg-[#F59E0B] border-amber-600 text-slate-950' : 'bg-slate-800 border-slate-700 hover:bg-slate-700 hover:text-white'}`}
                    title={handRaised ? 'Lower Hand' : 'Raise Hand'}
                  >
                    <Hand size={20} />
                  </button>
                )}
              </div>

              {/* Specialized Host Actions Panel */}
              {role === 'admin' && (
                <div className="flex items-center gap-2 bg-slate-950/40 p-1.5 rounded-2xl border border-white/5">
                  <span className="text-[10px] font-black uppercase text-red-400 tracking-wider px-2 block">Host Tools</span>
                  <button
                    onClick={triggerMuteAll}
                    className="flex items-center gap-1 px-3.5 py-2 bg-slate-800 hover:bg-slate-700 hover:text-white border border-slate-700 text-slate-300 text-xs font-bold rounded-xl"
                    title="Force mute everyone else"
                  >
                    <VolumeX size={14} /> Mute All
                  </button>
                  <button
                    onClick={toggleLockRoom}
                    className={`flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold rounded-xl border ${
                      lockStatus 
                        ? 'bg-[#EF4444]/10 border-red-500/20 text-red-400' 
                        : 'bg-slate-800 border-slate-700 hover:bg-slate-700 text-slate-300'
                    }`}
                  >
                    {lockStatus ? <Lock size={14} /> : <Unlock size={14} />} {lockStatus ? 'Unlock Room' : 'Lock Room'}
                  </button>
                </div>
              )}

              {/* End / Leave button */}
              <button
                onClick={() => handleLeaveMeeting(false)}
                className="px-6 py-3.5 bg-red-600 hover:bg-red-700 text-white rounded-2xl font-bold flex items-center gap-2 shadow-lg shadow-red-600/20 hover:scale-[1.02] active:scale-[0.98] transition-all"
              >
                <PhoneOff size={18} /> {role === 'admin' ? 'End Meeting' : 'Leave Meeting'}
              </button>
            </div>
          </div>

          {/* Right Sidebar Layout: Chat, Participants, Whiteboard */}
          <div className="w-full md:w-96 bg-slate-950 border-l border-slate-800 flex flex-col h-screen md:sticky md:top-0">
            
            {/* View Tabs */}
            <div className="flex border-b border-slate-800 p-2 gap-1 bg-slate-900/60">
              <button
                onClick={() => setActiveTab('chat')}
                className={`flex-grow py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                  activeTab === 'chat' ? 'bg-slate-800 text-white shadow-sm hover:shadow-md transition-shadow fade-in hover:shadow-md transition-all duration-300' : 'text-slate-400 hover:text-white'
                }`}
              >
                <MessageSquare size={14} /> Chat
              </button>
              <button
                onClick={() => setActiveTab('participants')}
                className={`flex-grow py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                  activeTab === 'participants' ? 'bg-slate-800 text-white shadow-sm hover:shadow-md transition-shadow fade-in hover:shadow-md transition-all duration-300' : 'text-slate-400 hover:text-white'
                }`}
              >
                <UsersIcon size={14} /> Staff ({activeParticipants.length})
              </button>
              <button
                onClick={() => setActiveTab('whiteboard')}
                className={`flex-grow py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                  activeTab === 'whiteboard' ? 'bg-slate-800 text-white shadow-sm hover:shadow-md transition-shadow fade-in hover:shadow-md transition-all duration-300' : 'text-slate-400 hover:text-white'
                }`}
              >
                <Edit3 size={14} /> Whiteboard
              </button>
            </div>

            {/* Content Switcher */}
            <div className="flex-grow overflow-y-auto p-4 flex flex-col min-h-0">
              
              {/* CHAT TAB VIEW */}
              {activeTab === 'chat' && (
                <div className="flex-grow flex flex-col min-h-0 h-full">
                  <div className="flex-grow overflow-y-auto space-y-4 mb-4 pr-1 min-h-0">
                    {chatMessages.map((msg) => {
                      const isMe = msg.senderId === user.id;
                      const isSystem = msg.role === 'system';
                      
                      if (isSystem) {
                        return (
                          <div key={msg.id} className="text-center py-1">
                            <span className="bg-slate-900 border border-slate-800/80 px-3 py-1 rounded-full text-[10px] text-slate-500 font-semibold">{msg.text}</span>
                          </div>
                        );
                      }

                      return (
                        <div key={msg.id} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                          <span className="text-[10px] font-bold text-slate-400 mb-1 px-1 flex items-center gap-1">
                            {msg.senderName} 
                            <span className={`text-[8px] px-1 rounded-sm uppercase tracking-wide ${
                              msg.role === 'admin' ? 'bg-[#EF4444]/20 text-red-400' : 'bg-blue-50/500/20 text-blue-400'
                            }`}>{msg.role}</span>
                          </span>
                          <div className={`p-3.5 rounded-2xl max-w-[85%] text-xs font-medium border leading-relaxed ${
                            isMe 
                              ? 'bg-[#2563EB] border-blue-500 text-white rounded-tr-none' 
                              : 'bg-slate-900 border-slate-800 text-slate-200 rounded-tl-none'
                          }`}>
                            {msg.text}
                          </div>
                          <span className="text-[8px] text-slate-600 mt-1 px-1">
                            {new Date(msg.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                  
                  <form onSubmit={handleSendChat} className="flex gap-2">
                    <input
                      type="text"
                      value={newMsg}
                      onChange={(e) => setNewMsg(e.target.value)}
                      placeholder="Type message to room..."
                      className="flex-grow p-3 bg-slate-900 border border-slate-800 rounded-xl text-xs focus:border-blue-500 outline-none"
                    />
                    <button
                      type="submit"
                      disabled={!newMsg.trim()}
                      className="p-3 bg-[#2563EB] hover:bg-blue-700 text-white rounded-xl font-bold flex items-center justify-center shadow-lg shadow-blue-500/20 disabled:opacity-50"
                    >
                      Send
                    </button>
                  </form>
                </div>
              )}

              {/* PARTICIPANTS TAB VIEW */}
              {activeTab === 'participants' && (
                <div className="space-y-4">
                  
                  {/* Host Broadcast Banner Panel (Admin Only) */}
                  {role === 'admin' && (
                    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-3">
                      <div className="flex items-center gap-2 text-xs font-bold text-slate-300">
                        <Megaphone size={14} className="text-red-400" /> Send Broadcast Banner
                      </div>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={broadcastInput}
                          onChange={(e) => setBroadcastInput(e.target.value)}
                          placeholder="Broadcast message to all screens..."
                          className="flex-grow p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs focus:border-red-500 outline-none"
                        />
                        <button
                          onClick={postBroadcast}
                          disabled={!broadcastInput.trim()}
                          className="px-3 bg-red-600 hover:bg-red-700 text-white font-bold text-xs rounded-xl transition-all"
                        >
                          Alert
                        </button>
                      </div>
                      {currentBroadcast && (
                        <button 
                          onClick={clearBroadcast}
                          className="text-[10px] text-red-400 hover:text-red-300 font-bold block"
                        >
                          Remove active broadcast banner
                        </button>
                      )}
                    </div>
                  )}

                  <div className="space-y-2">
                    {activeParticipants.map((p, idx) => (
                      <div key={p.socketId || idx} className="flex items-center justify-between p-3 bg-slate-900/60 rounded-xl border border-slate-800/50">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-slate-800 flex items-center justify-center font-bold text-xs">
                            {p.name.split(' ').map(n => n[0]).join('')}
                          </div>
                          <div>
                            <span className="text-xs font-bold block">{p.name} {p.userId === user.id ? '(You)' : ''}</span>
                            <span className="text-[9px] uppercase tracking-wider font-extrabold text-slate-500">{p.role}</span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          {p.handRaised && <Hand size={14} className="text-[#F59E0B] animate-bounce" />}
                          {p.mic ? <Mic size={14} className="text-blue-500" /> : <MicOff size={14} className="text-slate-600" />}
                          {p.cam ? <Video size={14} className="text-blue-500" /> : <VideoOff size={14} className="text-slate-600" />}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* WHITEBOARD DRAW TAB VIEW */}
              {activeTab === 'whiteboard' && (
                <div className="flex-grow flex flex-col space-y-4">
                  <div className="flex justify-between items-center bg-slate-900 p-3 rounded-xl border border-slate-800">
                    <div className="flex gap-2">
                      {['#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#ffffff'].map(c => (
                        <button
                          key={c}
                          onClick={() => setColor(c)}
                          style={{ backgroundColor: c }}
                          className={`w-6 h-6 rounded-full border-2 transition-transform ${color === c ? 'scale-110 border-white' : 'border-slate-800'}`}
                        />
                      ))}
                    </div>

                    <div className="flex gap-2 items-center">
                      <select
                        value={lineWidth}
                        onChange={(e) => setLineWidth(Number(e.target.value))}
                        className="bg-slate-950 border border-slate-800 p-1 rounded-lg text-[10px] font-bold"
                      >
                        <option value="1">Thin</option>
                        <option value="3">Med</option>
                        <option value="6">Thick</option>
                      </select>

                      <button
                        onClick={triggerClearCanvas}
                        className="p-1.5 bg-red-950/40 hover:bg-red-950 text-red-400 border border-red-800/30 rounded-lg"
                        title="Clear whiteboard for all"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>

                  {/* Draw Canvas Container */}
                  <div className="relative flex-grow bg-slate-950 border border-slate-800 rounded-2xl overflow-hidden aspect-video">
                    <canvas
                      ref={canvasRef}
                      onMouseDown={startDrawing}
                      onMouseMove={draw}
                      onMouseUp={stopDrawing}
                      onMouseLeave={stopDrawing}
                      className="absolute inset-0 w-full h-full cursor-crosshair"
                    />
                  </div>
                  <p className="text-[10px] text-center text-slate-500 font-bold">Use your pointer to draw on the canvas. Drawing synchronizes to all screens.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* MEETING ENDED VIEW */}
      {meetingState === 'ended' && (
        <div className="flex-grow flex items-center justify-center p-6">
          <div className="max-w-md w-full glass-panel p-8 rounded-[24px] text-center space-y-6 animate-in fade-in slide-in-from-bottom duration-500">
            <div className="w-16 h-16 bg-red-950/40 border border-red-800/30 text-[#EF4444] rounded-[24px] flex items-center justify-center mx-auto shadow-lg shadow-red-500/10">
              <PhoneOff size={32} />
            </div>
            <div>
              <h2 className="text-2xl font-black">Meeting Disconnected</h2>
              <p className="text-slate-400 text-sm mt-1.5">You have left the consult session, or the meeting was closed by the host.</p>
            </div>
            <button
              onClick={exitPortal}
              className="w-full py-4 bg-[#2563EB] hover:bg-blue-700 text-white rounded-2xl font-bold shadow-lg shadow-blue-500/20 active:scale-98 transition-all"
            >
              Return to Portal Dashboard
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default MeetingPortal;
