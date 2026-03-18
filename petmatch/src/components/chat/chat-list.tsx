"use client";

import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { MessageCircle, Circle } from "lucide-react";
import { EmptyState } from "@/components/shared/empty-state";
import { useSocket } from "@/hooks/use-socket";
import Link from "next/link";
import { formatDistanceToNow, isToday, isYesterday } from "date-fns";
import { es } from "date-fns/locale";

interface Conversation {
  id: string;
  otherUser: { id: string; name: string; avatarUrl: string | null } | undefined;
  lastMessage: { content: string; senderId: string; createdAt: Date } | null;
  updatedAt: Date;
  unreadCount: number;
}

interface ChatListProps {
  conversations: Conversation[];
  currentUserId: string;
}

function formatChatTime(date: Date): string {
  const d = new Date(date);
  if (isToday(d)) return "Hoy";
  if (isYesterday(d)) return "Ayer";
  return formatDistanceToNow(d, { addSuffix: true, locale: es });
}

export function ChatList({ conversations: initial, currentUserId }: ChatListProps) {
  const [conversations, setConversations] = useState(initial);
  const [onlineUsers, setOnlineUsers] = useState<Set<string>>(new Set());
  const { onConversationUpdated, onUserOnline, onUserOffline, checkUserOnline } = useSocket(currentUserId);

  // Check online status for all conversation partners
  useEffect(() => {
    const userIds = conversations
      .map((c) => c.otherUser?.id)
      .filter((id): id is string => !!id);

    userIds.forEach((id) => {
      checkUserOnline(id).then((online) => {
        if (online) {
          setOnlineUsers((prev) => new Set([...prev, id]));
        }
      });
    });
  }, [conversations, checkUserOnline]);

  // Listen for real-time conversation updates (new messages)
  useEffect(() => {
    const cleanup = onConversationUpdated((data) => {
      setConversations((prev) => {
        const updated = prev.map((c) => {
          if (c.id === data.conversationId) {
            const msg = data.lastMessage as { content: string; senderId: string; createdAt: string };
            return {
              ...c,
              lastMessage: {
                content: msg.content,
                senderId: msg.senderId,
                createdAt: new Date(msg.createdAt),
              },
              updatedAt: new Date(),
              unreadCount: c.unreadCount + 1,
            };
          }
          return c;
        });
        // Sort by most recent
        return updated.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
      });
    });
    return cleanup;
  }, [onConversationUpdated]);

  // Listen for online/offline status changes
  useEffect(() => {
    const cleanupOnline = onUserOnline((data) => {
      setOnlineUsers((prev) => new Set([...prev, data.userId]));
    });
    const cleanupOffline = onUserOffline((data) => {
      setOnlineUsers((prev) => {
        const next = new Set(prev);
        next.delete(data.userId);
        return next;
      });
    });
    return () => {
      cleanupOnline();
      cleanupOffline();
    };
  }, [onUserOnline, onUserOffline]);

  const totalUnread = conversations.reduce((sum, c) => sum + c.unreadCount, 0);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <MessageCircle className="h-6 w-6 text-purple-500" />
          Mensajes
          {totalUnread > 0 && (
            <Badge className="bg-orange-500 text-white ml-1">{totalUnread}</Badge>
          )}
        </h1>
        <p className="text-muted-foreground">Tus conversaciones</p>
      </div>

      {conversations.length === 0 ? (
        <EmptyState
          icon={MessageCircle}
          title="No tienes conversaciones"
          description="Reserva un servicio o haz match con mascotas para comenzar a chatear con otros usuarios."
          actions={[
            { label: "Buscar servicios", href: "/services" },
            { label: "PetMatch", href: "/match", variant: "outline" },
          ]}
        />
      ) : (
        <div className="space-y-2">
          {conversations.map((convo) => {
            const user = convo.otherUser;
            const initials = user?.name
              ?.split(" ")
              .map((n: string) => n[0])
              .join("")
              .toUpperCase()
              .slice(0, 2);

            const lastMsg = convo.lastMessage?.content;
            const truncated = lastMsg && lastMsg.length > 50
              ? lastMsg.slice(0, 50) + "..."
              : lastMsg;

            const isOnline = user ? onlineUsers.has(user.id) : false;

            return (
              <Link key={convo.id} href={`/chat/${convo.id}`}>
                <Card className={`hover:bg-muted/50 transition-colors ${convo.unreadCount > 0 ? "border-orange-200 bg-orange-50/30" : ""}`}>
                  <CardContent className="py-3 flex items-center gap-3">
                    <div className="relative">
                      <Avatar className="h-12 w-12">
                        <AvatarImage src={user?.avatarUrl || undefined} />
                        <AvatarFallback className="bg-purple-100 text-purple-700">
                          {initials}
                        </AvatarFallback>
                      </Avatar>
                      {isOnline && (
                        <Circle className="absolute -bottom-0.5 -right-0.5 h-3.5 w-3.5 fill-green-500 text-white stroke-2" />
                      )}
                      {convo.unreadCount > 0 && (
                        <span className="absolute -top-1 -right-1 h-5 w-5 bg-orange-500 text-white text-[10px] rounded-full flex items-center justify-center font-medium">
                          {convo.unreadCount > 9 ? "9+" : convo.unreadCount}
                        </span>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <p className={`truncate ${convo.unreadCount > 0 ? "font-bold" : "font-semibold"}`}>
                          {user?.name || "Usuario"}
                        </p>
                        <span className="text-xs text-muted-foreground shrink-0 ml-2">
                          {formatChatTime(convo.updatedAt)}
                        </span>
                      </div>
                      {truncated && (
                        <p className={`text-sm truncate ${convo.unreadCount > 0 ? "text-foreground font-medium" : "text-muted-foreground"}`}>
                          {truncated}
                        </p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
