import { useCallback, useEffect, useMemo, useState } from 'react';
import { Bell, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { getMyNotifications, markAllNotificationsAsRead, markNotificationAsRead } from '@/lib/api';
import type { NotificationItem } from '@/types/api';

const POLL_MS = 15000;

function formatNotificationTime(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'Just now';
  return date.toLocaleString(undefined, {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function NotificationBell({ enabled }: { enabled: boolean }) {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [updatingAll, setUpdatingAll] = useState(false);

  const unreadCount = useMemo(() => notifications.filter((item) => !item.is_read).length, [notifications]);

  const fetchNotifications = useCallback(async (unreadOnly = false) => {
    if (!enabled) return;
    setLoading(true);
    try {
      const payload = await getMyNotifications({ limit: 50, unreadOnly });
      setNotifications(payload.notifications);
    } catch {
      // Keep bell resilient if endpoint is temporarily unavailable
    } finally {
      setLoading(false);
    }
  }, [enabled]);

  useEffect(() => {
    if (!enabled) {
      setNotifications([]);
      return;
    }

    void fetchNotifications(false);

    const intervalId = window.setInterval(() => {
      void fetchNotifications(false);
    }, POLL_MS);

    return () => {
      window.clearInterval(intervalId);
    };
  }, [enabled, fetchNotifications]);

  useEffect(() => {
    if (!open || !enabled) return;
    void fetchNotifications(false);
  }, [open, enabled, fetchNotifications]);

  const handleMarkOneRead = async (notificationId: string) => {
    setNotifications((prev) => prev.map((item) => (item.id === notificationId ? { ...item, is_read: true } : item)));
    try {
      await markNotificationAsRead(notificationId);
    } catch {
      void fetchNotifications(false);
    }
  };

  const handleMarkAllRead = async () => {
    if (updatingAll || unreadCount === 0) return;
    setUpdatingAll(true);

    setNotifications((prev) => prev.map((item) => ({ ...item, is_read: true })));
    try {
      await markAllNotificationsAsRead();
    } catch {
      void fetchNotifications(false);
    } finally {
      setUpdatingAll(false);
    }
  };

  if (!enabled) return null;

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative rounded-full" aria-label="Notifications">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <span className="absolute -right-0.5 -top-0.5 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-destructive px-1 text-[10px] font-semibold text-destructive-foreground">
              {unreadCount > 99 ? '99+' : unreadCount}
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-[22rem] p-0">
        <div className="flex items-center justify-between p-3">
          <DropdownMenuLabel className="p-0">Notifications</DropdownMenuLabel>
          <Button
            variant="ghost"
            size="sm"
            className="h-8 px-2 text-caption"
            disabled={updatingAll || unreadCount === 0}
            onClick={() => void handleMarkAllRead()}
          >
            {updatingAll ? <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" /> : null}
            Mark all as read
          </Button>
        </div>

        <DropdownMenuSeparator className="m-0" />

        <div className="max-h-80 overflow-y-auto">
          {loading ? (
            <div className="flex items-center justify-center gap-2 p-4 text-body-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              Loading notifications...
            </div>
          ) : notifications.length === 0 ? (
            <p className="p-4 text-body-sm text-muted-foreground">No notifications yet.</p>
          ) : (
            notifications.map((notification) => (
              <button
                key={notification.id}
                type="button"
                className={`w-full border-b border-border/50 px-3 py-3 text-left transition-colors hover:bg-muted/50 ${
                  notification.is_read ? 'opacity-70' : 'bg-primary/5'
                }`}
                onClick={() => void handleMarkOneRead(notification.id)}
              >
                <div className="flex items-start justify-between gap-2">
                  <p className="text-body-sm font-medium text-foreground line-clamp-2">
                    {notification.title || notification.message}
                  </p>
                  {!notification.is_read && <span className="mt-1 h-2 w-2 flex-shrink-0 rounded-full bg-primary" />}
                </div>
                {notification.title && notification.message !== notification.title && (
                  <p className="mt-1 text-caption text-muted-foreground line-clamp-2">{notification.message}</p>
                )}
                <p className="mt-1 text-caption text-muted-foreground">{formatNotificationTime(notification.created_at)}</p>
              </button>
            ))
          )}
        </div>

        <DropdownMenuSeparator className="m-0" />
        <div className="p-2">
          <Button
            variant="ghost"
            size="sm"
            className="w-full justify-center"
            onClick={() => {
              setOpen(false);
              navigate('/notifications');
            }}
          >
            View all notifications
          </Button>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
