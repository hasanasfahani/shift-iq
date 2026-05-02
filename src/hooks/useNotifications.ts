'use client';

import { useEffect, useState, useCallback } from 'react';

interface Notification {
  id: string;
  message: string;
  is_read: boolean;
  created_at: string;
}

export function useNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const fetchNotifications = useCallback(async () => {
    const res = await fetch('/api/notifications');
    if (!res.ok) return;
    const json = await res.json();
    const list: Notification[] = json.notifications ?? [];
    setNotifications(list);
    setUnreadCount(list.filter((n) => !n.is_read).length);
  }, []);

  const markAllRead = useCallback(async () => {
    await fetch('/api/notifications', { method: 'PATCH' });
    setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
    setUnreadCount(0);
  }, []);

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30_000);
    return () => clearInterval(interval);
  }, [fetchNotifications]);

  return { notifications, unreadCount, refetch: fetchNotifications, markAllRead };
}
