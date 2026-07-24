'use client';

import { createContext, useContext, useState, ReactNode } from 'react';

export interface Notification {
  id: string;
  title: string;
  description: string;
  time: string;
  read: boolean;
}

interface NotificationContextType {
  notifications: Notification[];
  unreadCount: number;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  clearAll: () => void;
}

const NotificationContext = createContext<NotificationContextType | null>(null);

const mockNotifications: Notification[] = [
  { id: 'n1', title: 'Project milestone reached', description: 'Hampton Residence has moved to Design Development phase.', time: '2 hours ago', read: false },
  { id: 'n2', title: 'New lead enquiry', description: 'Sophie Williams submitted an enquiry via Instagram.', time: '4 hours ago', read: false },
  { id: 'n3', title: 'Invoice paid', description: 'INV-0018 payment received from Alexandra Thompson.', time: 'Yesterday', read: false },
  { id: 'n4', title: 'Task assigned', description: 'Finalize stone selection for Hampton Residence assigned to you.', time: 'Yesterday', read: false },
  { id: 'n5', title: 'Meeting reminder', description: 'Concept presentation with James & Sarah tomorrow at 10 AM.', time: '2 days ago', read: false },
  { id: 'n6', title: 'Document uploaded', description: 'Kitchen layout drawings uploaded to Urban Loft Project.', time: '3 days ago', read: false },
];

export function NotificationProvider({ children }: { children: ReactNode }) {
  const [notifications, setNotifications] = useState<Notification[]>(mockNotifications);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const markAsRead = (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  const markAllAsRead = () => {
    setNotifications([]);
  };

  const clearAll = () => {
    setNotifications([]);
  };

  return (
    <NotificationContext.Provider value={{ notifications, unreadCount, markAsRead, markAllAsRead, clearAll }}>
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  const context = useContext(NotificationContext);
  if (!context) throw new Error('useNotifications must be used within NotificationProvider');
  return context;
}
