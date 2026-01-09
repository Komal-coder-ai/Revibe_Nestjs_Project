import { Server } from 'socket.io';
import LiveChat from '@/models/LiveChat';
import LiveLike from '@/models/LiveLike';
import LiveStream from '@/models/LiveStream';

export default function setupSocket(server: any) {
  const io = new Server(server, {
    cors: {
      origin: '*',
      methods: ['GET', 'POST']
    }
  });

  io.on('connection', (socket) => {
    console.log(`Socket connected: ${socket.id}`);

    // Store the streams this socket has joined
    const joinedStreams = new Set<string>();

    // Join live stream room
    socket.on('joinStream', async (data) => {
      try {
        const { streamId, userId } = data || {};
        if (!streamId || !userId) {
          socket.emit('error', { message: 'streamId and userId are required for joinStream' });
          return;
        }
        socket.join(streamId);
        joinedStreams.add(streamId);
        await LiveStream.findByIdAndUpdate(streamId, { $addToSet: { viewers: userId } });
        const stream = await LiveStream.findById(streamId);
        io.to(streamId).emit('viewerCount', stream?.viewers.length || 0);
      } catch (err) {
        console.error('joinStream error:', err);
        socket.emit('error', { message: 'Failed to join stream', error: err instanceof Error ? err.message : String(err) });
      }
    });

    // Handle live chat
    socket.on('sendMessage', async (data) => {
      try {
        const { streamId, userId, message } = data || {};
        if (!streamId || !userId || !message) {
          socket.emit('error', { message: 'streamId, userId, and message are required for sendMessage' });
          return;
        }
        const chat = await LiveChat.create({ stream: streamId, user: userId, message });
        io.to(streamId).emit('newMessage', chat);
      } catch (err) {
        console.error('sendMessage error:', err);
        socket.emit('error', { message: 'Failed to send message', error: err instanceof Error ? err.message : String(err) });
      }
    });

    // Handle likes
    socket.on('likeStream', async (data) => {
      try {
        const { streamId, userId } = data || {};
        if (!streamId || !userId) {
          socket.emit('error', { message: 'streamId and userId are required for likeStream' });
          return;
        }
        const existing = await LiveLike.findOne({ stream: streamId, user: userId });
        if (!existing) {
          await LiveLike.create({ stream: streamId, user: userId });
        }
        const likeCount = await LiveLike.countDocuments({ stream: streamId });
        io.to(streamId).emit('likeCount', likeCount);
      } catch (err) {
        console.error('likeStream error:', err);
        socket.emit('error', { message: 'Failed to like stream', error: err instanceof Error ? err.message : String(err) });
      }
    });

    socket.on('disconnect', async () => {
      try {
        // Remove user from viewers in all joined streams
        for (const streamId of joinedStreams) {
          // You may want to track userId <-> socket.id mapping for robust removal
          // For now, just emit updated viewer count
          const stream = await LiveStream.findById(streamId);
          io.to(streamId).emit('viewerCount', stream?.viewers.length || 0);
        }
        console.log(`Socket disconnected: ${socket.id}`);
      } catch (err) {
        console.error('disconnect error:', err);
      }
    });
  });

  io.on('error', (err) => {
    console.error('Socket.IO server error:', err);
  });

  return io;
}
