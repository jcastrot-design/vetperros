"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Send, ArrowLeft, Circle } from "lucide-react";
import { sendMessage } from "@/lib/actions/conversations";
import { useSocket } from "@/hooks/use-socket";
import { toast } from "sonner";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { es } from "date-fns/locale";

interface Message {
  id: string;
  content: string;
  senderId: string;
  createdAt: Date;
  sender: { id: string; name: string; avatarUrl: string | null };
}

interface ChatRoomProps {
  conversationId: string;
  currentUserId: string;
  currentUserName: string;
  currentUserAvatar?: string | null;
  otherUser: { id: string; name: string; avatarUrl: string | null };
  initialMessages: Message[];
}

export function ChatRoom({
  conversationId,
  currentUserId,
  currentUserName,
  currentUserAvatar,
  otherUser,
  initialMessages,
}: ChatRoomProps) {
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [otherOnline, setOtherOnline] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const {
    joinConversation,
    leaveConversation,
    sendSocketMessage,
    startTyping,
    stopTyping,
    onNewMessage,
    onTypingStart,
    onTypingStop,
    checkUserOnline,
    onUserOnline,
    onUserOffline,
  } = useSocket(currentUserId);

  // Join conversation room on mount
  useEffect(() => {
    joinConversation(conversationId);
    return () => {
      leaveConversation(conversationId);
    };
  }, [conversationId, joinConversation, leaveConversation]);

  // Listen for incoming messages
  useEffect(() => {
    const cleanup = onNewMessage((data) => {
      if (data.conversationId === conversationId) {
        const msg = data.message as Message;
        setMessages((prev) => {
          // Avoid duplicates
          if (prev.some((m) => m.id === msg.id)) return prev;
          return [...prev, msg];
        });
      }
    });
    return cleanup;
  }, [conversationId, onNewMessage]);

  // Listen for typing indicators
  useEffect(() => {
    const cleanupStart = onTypingStart((data) => {
      if (data.conversationId === conversationId && data.userId === otherUser.id) {
        setIsTyping(true);
      }
    });
    const cleanupStop = onTypingStop((data) => {
      if (data.conversationId === conversationId && data.userId === otherUser.id) {
        setIsTyping(false);
      }
    });
    return () => {
      cleanupStart();
      cleanupStop();
    };
  }, [conversationId, otherUser.id, onTypingStart, onTypingStop]);

  // Check other user online status
  useEffect(() => {
    checkUserOnline(otherUser.id).then(setOtherOnline);

    const cleanupOnline = onUserOnline((data) => {
      if (data.userId === otherUser.id) setOtherOnline(true);
    });
    const cleanupOffline = onUserOffline((data) => {
      if (data.userId === otherUser.id) setOtherOnline(false);
    });
    return () => {
      cleanupOnline();
      cleanupOffline();
    };
  }, [otherUser.id, checkUserOnline, onUserOnline, onUserOffline]);

  // Auto-scroll on new messages
  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Handle typing indicator emission
  const handleInputChange = useCallback((value: string) => {
    setInput(value);
    if (value.trim()) {
      startTyping(conversationId);
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = setTimeout(() => {
        stopTyping(conversationId);
      }, 2000);
    } else {
      stopTyping(conversationId);
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    }
  }, [conversationId, startTyping, stopTyping]);

  async function handleSend(e: React.FormEvent) {
    e.preventDefault();
    if (!input.trim() || sending) return;

    const content = input.trim();
    setSending(true);
    stopTyping(conversationId);
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);

    const result = await sendMessage(conversationId, content);

    if (result.error) {
      toast.error(result.error);
    } else if (result.message) {
      const msg = result.message as Message;
      setMessages((prev) => [...prev, msg]);
      setInput("");

      // Broadcast via WebSocket so the other user receives it in real-time
      sendSocketMessage(conversationId, {
        id: msg.id,
        content: msg.content,
        senderId: msg.senderId,
        senderName: currentUserName,
        senderAvatar: currentUserAvatar || undefined,
        type: "TEXT",
        createdAt: new Date(msg.createdAt).toISOString(),
      });
    }
    setSending(false);
  }

  const initials = otherUser.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)] md:h-[calc(100vh-6rem)]">
      {/* Header */}
      <div className="flex items-center gap-3 pb-4 border-b">
        <Link href="/chat">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div className="relative">
          <Avatar className="h-10 w-10">
            <AvatarImage src={otherUser.avatarUrl || undefined} />
            <AvatarFallback className="bg-purple-100 text-purple-700">
              {initials}
            </AvatarFallback>
          </Avatar>
          {otherOnline && (
            <Circle className="absolute -bottom-0.5 -right-0.5 h-3.5 w-3.5 fill-green-500 text-white stroke-2" />
          )}
        </div>
        <div>
          <p className="font-semibold">{otherUser.name}</p>
          <p className="text-xs text-muted-foreground">
            {isTyping ? "Escribiendo..." : otherOnline ? "En linea" : "Desconectado"}
          </p>
        </div>
      </div>

      {/* Messages */}
      <ScrollArea className="flex-1 py-4">
        <div className="space-y-3">
          {messages.map((msg) => {
            const isMe = msg.senderId === currentUserId;
            return (
              <div
                key={msg.id}
                className={`flex ${isMe ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[75%] rounded-2xl px-4 py-2 ${
                    isMe
                      ? "bg-orange-500 text-white rounded-br-sm"
                      : "bg-muted rounded-bl-sm"
                  }`}
                >
                  <p className="text-sm">{msg.content}</p>
                  <p
                    className={`text-[10px] mt-1 ${
                      isMe ? "text-white/60" : "text-muted-foreground"
                    }`}
                  >
                    {formatDistanceToNow(new Date(msg.createdAt), {
                      addSuffix: true,
                      locale: es,
                    })}
                  </p>
                </div>
              </div>
            );
          })}
          {isTyping && (
            <div className="flex justify-start">
              <div className="bg-muted rounded-2xl rounded-bl-sm px-4 py-2">
                <div className="flex gap-1 items-center h-5">
                  <span className="w-2 h-2 bg-muted-foreground/50 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                  <span className="w-2 h-2 bg-muted-foreground/50 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                  <span className="w-2 h-2 bg-muted-foreground/50 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                </div>
              </div>
            </div>
          )}
          <div ref={scrollRef} />
        </div>
      </ScrollArea>

      {/* Input */}
      <form onSubmit={handleSend} className="flex gap-2 pt-4 border-t">
        <Input
          value={input}
          onChange={(e) => handleInputChange(e.target.value)}
          placeholder="Escribe un mensaje..."
          className="flex-1"
          autoFocus
        />
        <Button
          type="submit"
          size="icon"
          className="bg-brand hover:bg-brand-hover"
          disabled={sending || !input.trim()}
        >
          <Send className="h-4 w-4" />
        </Button>
      </form>
    </div>
  );
}
