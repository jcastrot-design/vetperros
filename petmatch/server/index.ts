import { createServer, IncomingMessage, ServerResponse } from "http";
import { Server } from "socket.io";

const PORT = parseInt(process.env.SOCKET_PORT || "3001", 10);

// HTTP handler for internal notification API
function handleRequest(req: IncomingMessage, res: ServerResponse) {
  if (req.method === "POST" && req.url === "/emit-notification") {
    let body = "";
    req.on("data", (chunk: string) => (body += chunk));
    req.on("end", () => {
      try {
        const { userId, notification } = JSON.parse(body);
        if (userId && notification) {
          io.to(`user:${userId}`).emit("notification:new", notification);
          res.writeHead(200, { "Content-Type": "application/json" });
          res.end(JSON.stringify({ ok: true }));
        } else {
          res.writeHead(400, { "Content-Type": "application/json" });
          res.end(JSON.stringify({ error: "Missing userId or notification" }));
        }
      } catch {
        res.writeHead(400, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ error: "Invalid JSON" }));
      }
    });
    return;
  }
  // Let Socket.IO handle everything else
}

const httpServer = createServer(handleRequest);
const io = new Server(httpServer, {
  cors: {
    origin: process.env.CLIENT_URL || "http://localhost:3000",
    methods: ["GET", "POST"],
  },
});

// Track online users: userId -> Set<socketId>
const onlineUsers = new Map<string, Set<string>>();

io.on("connection", (socket) => {
  const userId = socket.handshake.auth.userId as string;

  if (!userId) {
    socket.disconnect();
    return;
  }

  // Register user as online
  if (!onlineUsers.has(userId)) {
    onlineUsers.set(userId, new Set());
  }
  onlineUsers.get(userId)!.add(socket.id);

  console.log(`[WS] User ${userId} connected (${socket.id})`);

  // Broadcast online status
  socket.broadcast.emit("user:online", { userId });

  // Join user to their personal room for targeted messages
  socket.join(`user:${userId}`);

  // ─── Join conversation room ───
  socket.on("conversation:join", (conversationId: string) => {
    socket.join(`conv:${conversationId}`);
    console.log(`[WS] User ${userId} joined conv:${conversationId}`);
  });

  socket.on("conversation:leave", (conversationId: string) => {
    socket.leave(`conv:${conversationId}`);
  });

  // ─── Send message ───
  socket.on("message:send", (data: {
    conversationId: string;
    message: {
      id: string;
      content: string;
      senderId: string;
      senderName: string;
      senderAvatar?: string;
      type: string;
      createdAt: string;
    };
  }) => {
    // Broadcast to all users in the conversation room EXCEPT sender
    socket.to(`conv:${data.conversationId}`).emit("message:new", {
      conversationId: data.conversationId,
      message: data.message,
    });

    // Also emit to conversation list updates for all participants
    socket.to(`conv:${data.conversationId}`).emit("conversation:updated", {
      conversationId: data.conversationId,
      lastMessage: data.message,
    });
  });

  // ─── Typing indicators ───
  socket.on("typing:start", (data: { conversationId: string }) => {
    socket.to(`conv:${data.conversationId}`).emit("typing:start", {
      userId,
      conversationId: data.conversationId,
    });
  });

  socket.on("typing:stop", (data: { conversationId: string }) => {
    socket.to(`conv:${data.conversationId}`).emit("typing:stop", {
      userId,
      conversationId: data.conversationId,
    });
  });

  // ─── Message read ───
  socket.on("message:read", (data: { conversationId: string }) => {
    socket.to(`conv:${data.conversationId}`).emit("message:read", {
      userId,
      conversationId: data.conversationId,
    });
  });

  // ─── Check if user is online ───
  socket.on("user:check", (targetUserId: string, callback: (online: boolean) => void) => {
    const isOnline = onlineUsers.has(targetUserId) && onlineUsers.get(targetUserId)!.size > 0;
    callback(isOnline);
  });

  // ─── Disconnect ───
  socket.on("disconnect", () => {
    const userSockets = onlineUsers.get(userId);
    if (userSockets) {
      userSockets.delete(socket.id);
      if (userSockets.size === 0) {
        onlineUsers.delete(userId);
        socket.broadcast.emit("user:offline", { userId });
      }
    }
    console.log(`[WS] User ${userId} disconnected (${socket.id})`);
  });
});

httpServer.listen(PORT, () => {
  console.log(`[WS] Socket.io server running on port ${PORT}`);
});
