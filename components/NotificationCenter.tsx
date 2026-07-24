'use client';

import Link from 'next/link';
import { useNotifications } from '@/lib/notification-context';
import { Bell } from 'lucide-react';

export function NotificationCenter() {
  const { unreadCount } = useNotifications();
  const hasUnread = unreadCount > 0;

  return (
    <Link
      href="/notifications"
      className="relative w-9 h-9 flex items-center justify-center rounded-lg border border-border bg-card hover:bg-muted/50 transition-colors"
    >
      <Bell size={18} className="text-foreground" />
      {hasUnread && (
        <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border-2 border-card" />
      )}
    </Link>
  );
}
