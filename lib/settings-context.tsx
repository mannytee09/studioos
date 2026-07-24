'use client';

import { createContext, useContext, useState, ReactNode } from 'react';

interface StudioSettings {
  studioName: string;
  firstName: string;
  lastName: string;
  email: string;
}

interface SettingsContextValue {
  settings: StudioSettings;
  updateSettings: (s: Partial<StudioSettings>) => void;
}

const DEFAULT_SETTINGS: StudioSettings = {
  studioName: 'Design Studio HQ',
  firstName: 'Ellie',
  lastName: 'Sanders',
  email: 'ellie@studio.com',
};

const SettingsContext = createContext<SettingsContextValue>({
  settings: DEFAULT_SETTINGS,
  updateSettings: () => {},
});

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<StudioSettings>(DEFAULT_SETTINGS);

  const updateSettings = (s: Partial<StudioSettings>) => {
    setSettings((prev) => ({ ...prev, ...s }));
  };

  return (
    <SettingsContext.Provider value={{ settings, updateSettings }}>
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  return useContext(SettingsContext);
}
