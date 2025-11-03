import { Server as SocketIOServer } from 'socket.io';
import { Server as HTTPServer } from 'http';

let io: SocketIOServer | null = null;

export function initializeWebSocket(httpServer: HTTPServer): SocketIOServer {
  io = new SocketIOServer(httpServer, {
    cors: {
      origin: '*', // Configure based on your needs
      methods: ['GET', 'POST'],
    },
  });

  io.on('connection', (socket) => {
    console.log(`✅ Client connected: ${socket.id}`);

    // Join outlet-specific room
    socket.on('join:outlet', (outletId: number) => {
      const room = `outlet:${outletId}`;
      socket.join(room);
      console.log(`🏪 Socket ${socket.id} joined outlet room: ${room}`);
    });

    // Leave outlet-specific room
    socket.on('leave:outlet', (outletId: number) => {
      const room = `outlet:${outletId}`;
      socket.leave(room);
      console.log(`🚪 Socket ${socket.id} left outlet room: ${room}`);
    });

    // Join product stocks monitoring room (for admin)
    socket.on('join:product:stocks', () => {
      socket.join('product:stocks');
      console.log(`📦 Socket ${socket.id} joined product stocks monitoring room`);
    });

    // Leave product stocks monitoring room
    socket.on('leave:product:stocks', () => {
      socket.leave('product:stocks');
      console.log(`📦 Socket ${socket.id} left product stocks monitoring room`);
    });

    // Join material stocks monitoring room (for admin)
    socket.on('join:material:stocks', () => {
      socket.join('material:stocks');
      console.log(`🧱 Socket ${socket.id} joined material stocks monitoring room`);
    });

    // Leave material stocks monitoring room
    socket.on('leave:material:stocks', () => {
      socket.leave('material:stocks');
      console.log(`🧱 Socket ${socket.id} left material stocks monitoring room`);
    });

    socket.on('disconnect', () => {
      console.log(`❌ Client disconnected: ${socket.id}`);
    });
  });

  console.log('🔌 WebSocket server initialized');
  return io;
}

export function getWebSocketInstance(): SocketIOServer {
  if (!io) {
    throw new Error('WebSocket not initialized. Call initializeWebSocket first.');
  }
  return io;
}
