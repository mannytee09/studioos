'use client';

import { useState } from 'react';
import { useNotifications } from '@/lib/notification-context';
import { Bell, BellOff, MailCheck, CheckCheck } from 'lucide-react';

type Tab = 'all' | 'unread';

export default function NotificationsPage() {
  const { notifications, unreadCount, markAsRead, markAllAsRead, clearAll } = useNotifications();
  const [activeTab, setActiveTab] = useState<Tab>('all');

  const filtered = notifications.filter(n => {
    if (activeTab === 'unread') return !n.read;
    return true;
  });

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-semibold">Notifications</h1>
        <p className="text-muted-foreground text-sm mt-0.5">{unreadCount} unread of {notifications.length} total</p>
      </div>

      {/* Toolbar: tabs + action buttons inline */}
      <div className="flex items-center gap-2 flex-wrap">
        {/* Tabs — styled like Projects All/Archived */}
        <div className="flex border border-border rounded-lg overflow-hidden">
          <button
            onClick={() => setActiveTab('all')}
            className={`px-3 py-1.5 text-sm font-medium transition-colors ${
              activeTab === 'all' ? 'bg-foreground text-background' : 'text-muted-foreground hover:text-foreground hover:bg-muted'
            }`}
          >
            All
          </button>
          <button
            onClick={() => setActiveTab('unread')}
            className={`px-3 py-1.5 text-sm font-medium transition-colors ${
              activeTab === 'unread' ? 'bg-foreground text-background' : 'text-muted-foreground hover:text-foreground hover:bg-muted'
            }`}
          >
            Unread
          </button>
        </div>

        <div className="flex-1" />

        {/* Action buttons inline */}
        {unreadCount > 0 && (
          <button onClick={markAllAsRead} className="notion-button border border-border text-sm">
            Mark all read
          </button>
        )}
        {notifications.length > 0 && (
          <button onClick={clearAll} className="notion-button border border-border text-sm text-muted-foreground hover:text-foreground">
            Clear all
          </button>
        )}
      </div>

      {/* List */}
      <div className="card-base overflow-hidden">
        {filtered.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-14 h-14 rounded-2xl bg-muted flex items-center justify-center mx-auto mb-3">
              {activeTab === 'unread' ? <MailCheck size={28} className="text-muted-foreground" /> : <BellOff size={28} className="text-muted-foreground" />}
            </div>
            <p className="text-sm text-muted-foreground">
              {activeTab === 'unread' ? 'No unread notifications' : 'No notifications'}
            </p>
          </div>
        ) : (
          filtered.map((n, i) => (
            <div key={n.id}
              className={`flex items-start gap-3 px-5 py-4 hover:bg-muted/30 transition-colors ${i < filtered.length - 1 ? 'border-b border-border/40' : ''} ${!n.read ? 'bg-muted/10' : ''}`}>
              {/* Icon */}
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${!n.read ? 'bg-foreground/10' : 'bg-muted'}`}>
                <Bell size={16} className={!n.read ? 'text-foreground' : 'text-muted-foreground'} />
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <p className={`text-sm leading-tight ${!n.read ? 'font-medium' : 'text-muted-foreground'}`}>{n.title}</p>
                {n.description && <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">{n.description}</p>}
                <p className="text-xs text-muted-foreground/60 mt-1">{n.time}</p>
              </div>

              {/* Mark read — removes notification */}
              {!n.read && (
                <button onClick={() => markAsRead(n.id)}
                  className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground px-2 py-1 rounded-lg hover:bg-muted transition-colors whitespace-nowrap flex-shrink-0">
                  <CheckCheck size={14} />
                  Mark read
                </button>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
