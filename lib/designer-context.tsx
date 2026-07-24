'use client';

import { createContext, useContext, useState, ReactNode } from 'react';
import { DESIGNERS } from './crm-data';

interface DesignerContextValue {
  designers: string[];
  addDesigner: (name: string) => void;
}

const DesignerContext = createContext<DesignerContextValue>({
  designers: DESIGNERS,
  addDesigner: () => {},
});

export function DesignerProvider({ children }: { children: ReactNode }) {
  const [designers, setDesigners] = useState<string[]>(DESIGNERS);

  const addDesigner = (name: string) => {
    const trimmed = name.trim();
    if (!trimmed || designers.includes(trimmed)) return;
    setDesigners((prev) => [...prev, trimmed]);
  };

  return (
    <DesignerContext.Provider value={{ designers, addDesigner }}>
      {children}
    </DesignerContext.Provider>
  );
}

export function useDesigners() {
  return useContext(DesignerContext);
}
