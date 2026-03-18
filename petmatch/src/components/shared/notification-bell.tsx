"use client";

import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Bell, Check } from "lucide-react";
import { getNotifications, markAsRead, markAllAsRead } from "@/lib/actions/notifications";
import { formatDistanceToNow } from "date-fns";
import { es } from "date-fns/locale";
import { motion, AnimatePresence } from "framer-motion";
import { useSocket } from "@/hooks/use-socket";

interface Notification {
  id: string;
  type: string;
  title: string;
  body: string;
  data: string | null;
  isRead: boolean;
  createdAt: Date;
}

interface NotificationBellProps {
  userId?: string;
}

export function NotificationBell({ userId }: NotificationBellProps) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [open, setOpen] = useState(false);
  const { socket } = useSocket(userId);

  useEffect(() => {
    getNotifications().then((n) => setNotifications(n));
  }, []);

  // Listen for real-time notifications via WebSocket
  useEffect(() => {
    if (!socket) return;

    const handler = (notification: Notification) => {
      setNotifications((prev) => [notification, ...prev]);
    };

    socket.on("notification:new", handler);
    return () => {
      socket.off("notification:new", handler);
    };
  }, [socket]);

  // Refresh notifications when dropdown opens
  const handleToggle = useCallback(() => {
    setOpen((prev) => {
      if (!prev) {
        getNotifications().then((n) => setNotifications(n));
      }
      return !prev;
    });
  }, []);

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  async function handleMarkRead(id: string) {
    await markAsRead(id);
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, isRead: true } : n)),
    );
  }

  async function handleMarkAllRead() {
    await markAllAsRead();
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
  }

  function getLink(n: Notification): string | null {
    if (!n.data) return null;
    try {
      const parsed = JSON.parse(n.data);
      return parsed.link || parsed.url || null;
    } catch {
      return null;
    }
  }

  return (
    <div className="relative">
      <Button
        variant="ghost"
        size="icon"
        onClick={handleToggle}
        className="relative"
      >
        <Bell className="h-5 w-5" />
        <AnimatePresence>
          {unreadCount > 0 && (
            <motion.span
              key={unreadCount}
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
              transition={{ type: "spring", stiffness: 500, damping: 15 }}
              className="absolute -top-0.5 -right-0.5 h-4 w-4 bg-red-500 text-white text-[10px] rounded-full flex items-center justify-center"
            >
              {unreadCount > 9 ? "9+" : unreadCount}
            </motion.span>
          )}
        </AnimatePresence>
      </Button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 top-10 w-80 bg-background border rounded-lg shadow-lg z-50"
          >
            <div className="flex items-center justify-between p-3 border-b">
              <span className="font-medium text-sm">Notificaciones</span>
              {unreadCount > 0 && (
                <Button variant="ghost" size="sm" onClick={handleMarkAllRead} className="text-xs">
                  <Check className="h-3 w-3 mr-1" />
                  Marcar todas
                </Button>
              )}
            </div>
            <div className="max-h-80 overflow-y-auto">
              {notifications.length === 0 ? (
                <div className="text-center py-8">
                  <motion.div
                    animate={{ y: [0, -5, 0] }}
                    transition={{ repeat: Infinity, duration: 2 }}
                  >
                    <Bell className="h-8 w-8 mx-auto text-muted-foreground/40" />
                  </motion.div>
                  <p className="text-sm text-muted-foreground mt-2">
                    Sin notificaciones
                  </p>
                </div>
              ) : (
                notifications.slice(0, 10).map((n, i) => {
                  const link = getLink(n);
                  return (
                    <motion.div
                      key={n.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.03 }}
                      className={`p-3 border-b last:border-0 cursor-pointer hover:bg-muted/50 transition-colors ${
                        !n.isRead ? "bg-orange-50/50" : ""
                      }`}
                      onClick={() => {
                        if (!n.isRead) handleMarkRead(n.id);
                        if (link) window.location.href = link;
                      }}
                    >
                      <div className="flex items-start gap-2">
                        {!n.isRead && (
                          <motion.span
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            className="h-2 w-2 bg-orange-500 rounded-full mt-1.5 shrink-0"
                          />
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">{n.title}</p>
                          <p className="text-xs text-muted-foreground truncate">{n.body}</p>
                          <p className="text-xs text-muted-foreground mt-0.5">
                            {formatDistanceToNow(new Date(n.createdAt), { locale: es, addSuffix: true })}
                          </p>
                        </div>
                      </div>
                    </motion.div>
                  );
                })
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
