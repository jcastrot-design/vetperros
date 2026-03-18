"use client";

import { useEffect, useRef, useCallback } from "react";
import { io, Socket } from "socket.io-client";

const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL || "http://localhost:3001";

let globalSocket: Socket | null = null;
let connectionCount = 0;

export function useSocket(userId: string | undefined) {
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    if (!userId) return;

    // Reuse global socket if already connected with same user
    if (globalSocket?.connected && (globalSocket.auth as Record<string, unknown>)?.userId === userId) {
      socketRef.current = globalSocket;
      connectionCount++;
      return () => {
        connectionCount--;
        if (connectionCount <= 0) {
          globalSocket?.disconnect();
          globalSocket = null;
          connectionCount = 0;
        }
      };
    }

    // Create new connection
    const socket = io(SOCKET_URL, {
      auth: { userId },
      transports: ["websocket", "polling"],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 2000,
    });

    globalSocket = socket;
    socketRef.current = socket;
    connectionCount++;

    socket.on("connect", () => {
      console.log("[Socket] Connected:", socket.id);
    });

    socket.on("disconnect", (reason) => {
      console.log("[Socket] Disconnected:", reason);
    });

    socket.on("connect_error", (err) => {
      console.log("[Socket] Connection error:", err.message);
    });

    return () => {
      connectionCount--;
      if (connectionCount <= 0) {
        socket.disconnect();
        globalSocket = null;
        connectionCount = 0;
      }
    };
  }, [userId]);

  const joinConversation = useCallback((conversationId: string) => {
    socketRef.current?.emit("conversation:join", conversationId);
  }, []);

  const leaveConversation = useCallback((conversationId: string) => {
    socketRef.current?.emit("conversation:leave", conversationId);
  }, []);

  const sendSocketMessage = useCallback((
    conversationId: string,
    message: {
      id: string;
      content: string;
      senderId: string;
      senderName: string;
      senderAvatar?: string;
      type: string;
      createdAt: string;
    },
  ) => {
    socketRef.current?.emit("message:send", { conversationId, message });
  }, []);

  const startTyping = useCallback((conversationId: string) => {
    socketRef.current?.emit("typing:start", { conversationId });
  }, []);

  const stopTyping = useCallback((conversationId: string) => {
    socketRef.current?.emit("typing:stop", { conversationId });
  }, []);

  const markAsRead = useCallback((conversationId: string) => {
    socketRef.current?.emit("message:read", { conversationId });
  }, []);

  const onNewMessage = useCallback((
    callback: (data: { conversationId: string; message: unknown }) => void,
  ) => {
    socketRef.current?.on("message:new", callback);
    return () => {
      socketRef.current?.off("message:new", callback);
    };
  }, []);

  const onTypingStart = useCallback((
    callback: (data: { userId: string; conversationId: string }) => void,
  ) => {
    socketRef.current?.on("typing:start", callback);
    return () => {
      socketRef.current?.off("typing:start", callback);
    };
  }, []);

  const onTypingStop = useCallback((
    callback: (data: { userId: string; conversationId: string }) => void,
  ) => {
    socketRef.current?.on("typing:stop", callback);
    return () => {
      socketRef.current?.off("typing:stop", callback);
    };
  }, []);

  const onConversationUpdated = useCallback((
    callback: (data: { conversationId: string; lastMessage: unknown }) => void,
  ) => {
    socketRef.current?.on("conversation:updated", callback);
    return () => {
      socketRef.current?.off("conversation:updated", callback);
    };
  }, []);

  const onUserOnline = useCallback((
    callback: (data: { userId: string }) => void,
  ) => {
    socketRef.current?.on("user:online", callback);
    return () => {
      socketRef.current?.off("user:online", callback);
    };
  }, []);

  const onUserOffline = useCallback((
    callback: (data: { userId: string }) => void,
  ) => {
    socketRef.current?.on("user:offline", callback);
    return () => {
      socketRef.current?.off("user:offline", callback);
    };
  }, []);

  const checkUserOnline = useCallback((targetUserId: string): Promise<boolean> => {
    return new Promise((resolve) => {
      if (!socketRef.current?.connected) {
        resolve(false);
        return;
      }
      socketRef.current.emit("user:check", targetUserId, (online: boolean) => {
        resolve(online);
      });
    });
  }, []);

  return {
    socket: socketRef.current,
    connected: socketRef.current?.connected ?? false,
    joinConversation,
    leaveConversation,
    sendSocketMessage,
    startTyping,
    stopTyping,
    markAsRead,
    onNewMessage,
    onTypingStart,
    onTypingStop,
    onConversationUpdated,
    onUserOnline,
    onUserOffline,
    checkUserOnline,
  };
}
