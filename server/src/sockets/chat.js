const setupChatSocket = (io) => {
  io.on('connection', (socket) => {
    console.log(`User connected: ${socket.id}`);

    // Join a specific room
    socket.on('join_room', (room) => {
      socket.join(room);
      console.log(`User ${socket.id} joined room: ${room}`);
    });

    // Send and receive messages
    socket.on('send_message', (data) => {
      // Broadcast message to everyone in the room
      io.to(data.room).emit('receive_message', data);
    });

    socket.on('disconnect', () => {
      console.log('User disconnected', socket.id);
    });
  });
};

module.exports = setupChatSocket;
