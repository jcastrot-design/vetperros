"use client";

import { useEffect, useCallback } from "react";
import { getUnreadCount } from "@/lib/actions/notifications";

export function useNotificationPolling(intervalMs = 30000) {
  const checkNotifications = useCallback(async () => {
    try {
      const count = await getUnreadCount();

      if (count > 0 && "Notification" in window && Notification.permission === "granted") {
        // We could show a notification here, but to avoid spamming
        // we just update the badge in the header (via revalidation)
      }
    } catch {
      // Silent fail
    }
  }, []);

  useEffect(() => {
    // Initial check
    checkNotifications();

    // Poll periodically
    const interval = setInterval(checkNotifications, intervalMs);
    return () => clearInterval(interval);
  }, [checkNotifications, intervalMs]);
}

export function showBrowserNotification(title: string, body: string, url?: string) {
  if (!("Notification" in window) || Notification.permission !== "granted") return;

  const notification = new Notification(title, {
    body,
    icon: "/favicon.ico",
    tag: "petmatch-notification",
  });

  if (url) {
    notification.onclick = () => {
      window.focus();
      window.location.href = url;
    };
  }
}
