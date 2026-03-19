import { useCallback, useEffect, useMemo, useState } from 'react';
import { Bell, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Header } from '@/components/landing/Header';
import { getDeveloper, getMyNotifications, markAllNotificationsAsRead, markNotificationAsRead } from '@/lib/api';
import type { NotificationItem } from '@/types/api';

const POLL_MS = 20000;

function formatDateTime(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'Just now';
  return date.toLocaleString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export default function Notifications() {
  const [loading, setLoading] = useState(false);
  const [markingAll, setMarkingAll] = useState(false);
  const [showUnreadOnly, setShowUnreadOnly] = useState(false);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);

  const developer = getDeveloper();

  const fetchNotifications = useCallback(async () => {
    if (!developer) return;

    setLoading(true);
    try {
      const payload = await getMyNotifications({ limit: 100, unreadOnly: showUnreadOnly });
      setNotifications(payload.notifications);
    } catch {
      // keep page resilient on intermittent API errors
    } finally {
      setLoading(false);
    }
  }, [developer, showUnreadOnly]);

  useEffect(() => {
    void fetchNotifications();
  }, [fetchNotifications]);

  useEffect(() => {
    if (!developer) return;

    const id = window.setInterval(() => {
      void fetchNotifications();
    }, POLL_MS);

    return () => {
      window.clearInterval(id);
    };
  }, [developer, fetchNotifications]);

  const unreadCount = useMemo(() => notifications.filter((item) => !item.is_read).length, [notifications]);

  const handleMarkRead = async (notificationId: string) => {
    setNotifications((prev) => prev.map((item) => (item.id === notificationId ? { ...item, is_read: true } : item)));
    try {
      await markNotificationAsRead(notificationId);
    } catch {
      void fetchNotifications();
    }
  };

  const handleMarkAll = async () => {
    if (markingAll || unreadCount === 0) return;

    setMarkingAll(true);
    setNotifications((prev) => prev.map((item) => ({ ...item, is_read: true })));
    try {
      await markAllNotificationsAsRead();
    } catch {
      void fetchNotifications();
    } finally {
      setMarkingAll(false);
    }
  };

  if (!developer) {
    return (
      <div className="min-h-screen bg-gradient-hero">
        <Header />
        <main className="container py-20 pt-28 text-center">
          <h1 className="mb-4 text-display-sm">Notifications</h1>
          <p className="text-body text-muted-foreground">Sign in to view your notifications.</p>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-hero">
      <Header />

      <main className="mx-auto max-w-5xl px-4 pb-8 pt-24 sm:px-6 md:px-8 md:pt-28">
        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-display-sm">Notifications</h1>
            <p className="text-body-sm text-muted-foreground">
              Track AI evaluation updates, import progress, and profile activity.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Button variant={showUnreadOnly ? 'default' : 'outline'} size="sm" onClick={() => setShowUnreadOnly((prev) => !prev)}>
              {showUnreadOnly ? 'Showing unread only' : 'Show unread only'}
            </Button>
            <Button variant="outline" size="sm" onClick={() => void fetchNotifications()} disabled={loading}>
              {loading ? <Loader2 className="mr-1.5 h-4 w-4 animate-spin" /> : null}
              Refresh
            </Button>
            <Button variant="secondary" size="sm" onClick={() => void handleMarkAll()} disabled={markingAll || unreadCount === 0}>
              {markingAll ? <Loader2 className="mr-1.5 h-4 w-4 animate-spin" /> : null}
              Mark all as read
            </Button>
          </div>
        </div>

        <div className="mb-4 rounded-2xl border border-border bg-card px-4 py-3 text-body-sm text-muted-foreground shadow-card">
          <span className="font-medium text-foreground">Unread:</span> {unreadCount}
          <span className="mx-2 text-border">•</span>
          <span className="font-medium text-foreground">Total:</span> {notifications.length}
        </div>

        <section className="overflow-hidden rounded-3xl border border-border bg-card shadow-card">
          {loading && notifications.length === 0 ? (
            <div className="flex items-center justify-center gap-2 p-8 text-body-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              Loading notifications...
            </div>
          ) : notifications.length === 0 ? (
            <div className="p-8 text-center">
              <Bell className="mx-auto mb-3 h-6 w-6 text-muted-foreground" />
              <p className="text-body text-muted-foreground">No notifications available.</p>
            </div>
          ) : (
            <ul className="divide-y divide-border">
              {notifications.map((notification) => (
                <li key={notification.id} className={`px-4 py-4 transition-colors hover:bg-muted/30 ${notification.is_read ? 'bg-card' : 'bg-primary/5'}`}>
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-body-sm font-semibold text-foreground">
                        {notification.title || notification.message}
                      </p>
                      {notification.title && notification.title !== notification.message && (
                        <p className="mt-1 text-body-sm text-muted-foreground">{notification.message}</p>
                      )}
                      <p className="mt-1 text-caption text-muted-foreground">{formatDateTime(notification.created_at)}</p>
                    </div>

                    <div className="flex items-center gap-2">
                      {!notification.is_read && <span className="h-2 w-2 rounded-full bg-primary" />}
                      <Button variant="ghost" size="sm" disabled={notification.is_read} onClick={() => void handleMarkRead(notification.id)}>
                        {notification.is_read ? 'Read' : 'Mark as read'}
                      </Button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>
      </main>
    </div>
  );
}
