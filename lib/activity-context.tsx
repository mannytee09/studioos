'use client';

import { createContext, useContext, useState, useCallback, useEffect, ReactNode } from 'react';

export interface ActivityEntry {
  id: string;
  title: string;
  description: string;
  icon: string;
  source: string;
  timestamp: number;
}

interface ActivityContextValue {
  activities: ActivityEntry[];
  addActivity: (entry: Omit<ActivityEntry, 'id' | 'timestamp'>) => void;
}

const ActivityContext = createContext<ActivityContextValue>({
  activities: [],
  addActivity: () => {},
});

function createSeedActivities(): ActivityEntry[] {
  const now = Date.now();
  return [
    { id: 'seed-1', title: 'Phase Changed', description: 'Hampton Residence moved to Design Development', icon: 'change_circle', source: 'Hampton Residence', timestamp: now - 2 * 3600_000 },
    { id: 'seed-2', title: 'New Lead Enquiry', description: 'Sophie Williams submitted an enquiry via Instagram', icon: 'person_add', source: 'Leads', timestamp: now - 4 * 3600_000 },
    { id: 'seed-3', title: 'Invoice Paid', description: 'INV-0018 payment received from Alexandra Thompson', icon: 'receipt_long', source: 'Finance', timestamp: now - 26 * 3600_000 },
    { id: 'seed-4', title: 'Task Assigned', description: 'Finalize stone selection for Hampton Residence', icon: 'task_alt', source: 'Tasks', timestamp: now - 28 * 3600_000 },
    { id: 'seed-5', title: 'Meeting Reminder', description: 'Concept presentation with James & Sarah tomorrow at 10 AM', icon: 'groups', source: 'Hampton Residence', timestamp: now - 2 * 86400_000 },
    { id: 'seed-6', title: 'Document Uploaded', description: 'Kitchen layout drawings uploaded to Urban Loft Project', icon: 'upload_file', source: 'Urban Loft Project', timestamp: now - 3 * 86400_000 },
    { id: 'seed-7', title: 'Phase Changed', description: 'Coastal Villa Renovation moved to Construction Documentation', icon: 'change_circle', source: 'Coastal Villa Renovation', timestamp: now - 4 * 86400_000 },
  ];
}

export function ActivityProvider({ children }: { children: ReactNode }) {
  const [activities, setActivities] = useState<ActivityEntry[]>([]);

  useEffect(() => {
    setActivities(createSeedActivities());
  }, []);

  const addActivity = useCallback((entry: Omit<ActivityEntry, 'id' | 'timestamp'>) => {
    setActivities((prev) => [
      { ...entry, id: `act-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`, timestamp: Date.now() },
      ...prev,
    ]);
  }, []);

  return (
    <ActivityContext.Provider value={{ activities, addActivity }}>
      {children}
    </ActivityContext.Provider>
  );
}

export function useActivity() {
  return useContext(ActivityContext);
}
