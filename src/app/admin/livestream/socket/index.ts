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
    // Join live stream room
    socket.on('joinStream', async ({ streamId, userId }) => {
      socket.join(streamId);
      // Optionally update viewers in DB
      await LiveStream.findByIdAndUpdate(streamId, { $addToSet: { viewers: userId } });
      // Emit updated viewer count
      const stream = await LiveStream.findById(streamId);
      io.to(streamId).emit('viewerCount', stream?.viewers.length || 0);
    });

    // Handle live chat
    socket.on('sendMessage', async ({ streamId, userId, message }) => {
      const chat = await LiveChat.create({ stream: streamId, user: userId, message });
      io.to(streamId).emit('newMessage', chat);
    });

    // Handle likes
    socket.on('likeStream', async ({ streamId, userId }) => {
      const existing = await LiveLike.findOne({ stream: streamId, user: userId });
      if (!existing) {
        await LiveLike.create({ stream: streamId, user: userId });
      }
      const likeCount = await LiveLike.countDocuments({ stream: streamId });
      io.to(streamId).emit('likeCount', likeCount);
    });

    // ...other socket events...
  });

  return io;
}
