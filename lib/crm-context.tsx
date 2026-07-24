'use client';

import { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { mockClients, mockLeads, Client, Lead, Note, TimelineEvent } from './crm-data';

interface CrmContextValue {
  clients: Client[];
  leads: Lead[];
  addClient: (client: Client) => void;
  addLead: (lead: Lead) => void;
  deleteClient: (id: string) => void;
  deleteLead: (id: string) => void;
  toggleClientPin: (id: string) => void;
  toggleLeadPin: (id: string) => void;
  updateClient: (id: string, updates: Partial<Client>) => void;
  updateLead: (id: string, updates: Partial<Lead>) => void;
  addClientNote: (clientId: string, note: Note) => void;
  addLeadNote: (leadId: string, note: Note) => void;
  deleteClientNote: (clientId: string, noteId: string) => void;
  deleteLeadNote: (leadId: string, noteId: string) => void;
}

const CrmContext = createContext<CrmContextValue>({
  clients: mockClients,
  leads: mockLeads,
  addClient: () => {},
  addLead: () => {},
  deleteClient: () => {},
  deleteLead: () => {},
  toggleClientPin: () => {},
  toggleLeadPin: () => {},
  updateClient: () => {},
  updateLead: () => {},
  addClientNote: () => {},
  addLeadNote: () => {},
  deleteClientNote: () => {},
  deleteLeadNote: () => {},
});

export function CrmProvider({ children }: { children: ReactNode }) {
  const [clients, setClients] = useState<Client[]>(mockClients);
  const [leads, setLeads] = useState<Lead[]>(mockLeads);

  const addClient = useCallback((client: Client) => {
    setClients((prev) => [client, ...prev]);
  }, []);

  const addLead = useCallback((lead: Lead) => {
    setLeads((prev) => [lead, ...prev]);
  }, []);

  const deleteClient = useCallback((id: string) => {
    setClients((prev) => prev.filter((c) => c.id !== id));
  }, []);

  const deleteLead = useCallback((id: string) => {
    setLeads((prev) => prev.filter((l) => l.id !== id));
  }, []);

  const toggleClientPin = useCallback((id: string) => {
    setClients((prev) => prev.map((c) => (c.id === id ? { ...c, pinned: !c.pinned } : c)));
  }, []);

  const toggleLeadPin = useCallback((id: string) => {
    setLeads((prev) => prev.map((l) => (l.id === id ? { ...l, pinned: !l.pinned } : l)));
  }, []);

  const updateClient = useCallback((id: string, updates: Partial<Client>) => {
    setClients((prev) => prev.map((c) => (c.id === id ? { ...c, ...updates } : c)));
  }, []);

  const updateLead = useCallback((id: string, updates: Partial<Lead>) => {
    setLeads((prev) => prev.map((l) => (l.id === id ? { ...l, ...updates } : l)));
  }, []);

  const addClientNote = useCallback((clientId: string, note: Note) => {
    setClients((prev) => prev.map((c) =>
      c.id === clientId ? { ...c, notes: [note, ...c.notes] } : c
    ));
  }, []);

  const addLeadNote = useCallback((leadId: string, note: Note) => {
    setLeads((prev) => prev.map((l) =>
      l.id === leadId ? { ...l, notes: [note, ...l.notes] } : l
    ));
  }, []);

  const deleteClientNote = useCallback((clientId: string, noteId: string) => {
    setClients((prev) => prev.map((c) =>
      c.id === clientId ? { ...c, notes: c.notes.filter((n) => n.id !== noteId) } : c
    ));
  }, []);

  const deleteLeadNote = useCallback((leadId: string, noteId: string) => {
    setLeads((prev) => prev.map((l) =>
      l.id === leadId ? { ...l, notes: l.notes.filter((n) => n.id !== noteId) } : l
    ));
  }, []);

  return (
    <CrmContext.Provider value={{
      clients,
      leads,
      addClient,
      addLead,
      deleteClient,
      deleteLead,
      toggleClientPin,
      toggleLeadPin,
      updateClient,
      updateLead,
      addClientNote,
      addLeadNote,
      deleteClientNote,
      deleteLeadNote,
    }}>
      {children}
    </CrmContext.Provider>
  );
}

export function useCrm() {
  return useContext(CrmContext);
}
