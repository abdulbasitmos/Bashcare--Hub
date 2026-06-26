// Sockets setup for Live Staff Meetings
const meetings = {}; // Tracks active meeting participants in memory

const setupMeetingSocket = (io) => {
  io.on('connection', (socket) => {
    console.log(`Meeting user connected: ${socket.id}`);

    // Join meeting room
    socket.on('join_meeting', ({ roomCode, userId, name, role, mic, cam }) => {
      socket.join(roomCode);
      socket.meetingRoom = roomCode;
      socket.meetingUser = { userId, name, role, mic, cam, socketId: socket.id, handRaised: false };

      if (!meetings[roomCode]) {
        meetings[roomCode] = {};
      }
      meetings[roomCode][socket.id] = socket.meetingUser;

      console.log(`${name} (${role}) joined meeting room: ${roomCode}`);

      // Broadcast list of all active participants to the room
      io.to(roomCode).emit('participants_list', Object.values(meetings[roomCode]));

      // Send join announcement
      io.to(roomCode).emit('receive_meeting_chat', {
        id: `system-${Date.now()}`,
        senderName: 'System',
        role: 'system',
        text: `${name} has joined the meeting.`,
        time: new Date()
      });
    });

    // Handle updates to mic, cam, hand-raised state
    socket.on('update_participant_state', ({ roomCode, state }) => {
      if (meetings[roomCode] && meetings[roomCode][socket.id]) {
        meetings[roomCode][socket.id] = {
          ...meetings[roomCode][socket.id],
          ...state
        };
        // Broadcast new list to sync states
        io.to(roomCode).emit('participants_list', Object.values(meetings[roomCode]));
      }
    });

    // Send and receive meeting chat
    socket.on('send_meeting_chat', ({ roomCode, text }) => {
      if (meetings[roomCode] && meetings[roomCode][socket.id]) {
        const user = meetings[roomCode][socket.id];
        const chatMsg = {
          id: `msg-${Date.now()}`,
          senderName: user.name,
          senderId: user.userId,
          role: user.role,
          text,
          time: new Date()
        };
        io.to(roomCode).emit('receive_meeting_chat', chatMsg);
      }
    });

    // Synchronize whiteboard drawing in real time
    socket.on('whiteboard_draw', ({ roomCode, drawData }) => {
      socket.to(roomCode).emit('receive_whiteboard_draw', drawData);
    });

    // Clear whiteboard
    socket.on('whiteboard_clear', ({ roomCode }) => {
      io.to(roomCode).emit('receive_whiteboard_clear');
    });

    // Handle Admin controls
    socket.on('admin_action', ({ roomCode, action, value }) => {
      console.log(`Admin action in room ${roomCode}: ${action} = ${value}`);
      
      // Broadcast admin action to everyone in the room
      io.to(roomCode).emit('receive_admin_action', { action, value });

      // Update local room state if needed
      if (action === 'mute_all' && value === true && meetings[roomCode]) {
        // Force all participants except admin to mute
        Object.keys(meetings[roomCode]).forEach(sid => {
          if (meetings[roomCode][sid].role !== 'admin') {
            meetings[roomCode][sid].mic = false;
          }
        });
        io.to(roomCode).emit('participants_list', Object.values(meetings[roomCode]));
      }
    });

    // Handle disconnection
    socket.on('disconnect', () => {
      const roomCode = socket.meetingRoom;
      if (roomCode && meetings[roomCode] && meetings[roomCode][socket.id]) {
        const user = meetings[roomCode][socket.id];
        console.log(`${user.name} disconnected from meeting room: ${roomCode}`);
        
        delete meetings[roomCode][socket.id];
        
        // Broadcast updated list
        io.to(roomCode).emit('participants_list', Object.values(meetings[roomCode]));

        // Send leave announcement
        io.to(roomCode).emit('receive_meeting_chat', {
          id: `system-${Date.now()}`,
          senderName: 'System',
          role: 'system',
          text: `${user.name} has left the meeting.`,
          time: new Date()
        });

        // Clean up empty room
        if (Object.keys(meetings[roomCode]).length === 0) {
          delete meetings[roomCode];
        }
      }
    });
  });
};

module.exports = setupMeetingSocket;
