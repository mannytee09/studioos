'use client';

import { useState } from 'react';
import { SidePanel } from '@/components/ui/SidePanel';
import { useSettings } from '@/lib/settings-context';
import {
  CheckCircle2, LogOut, Save, Plus, Pencil, Trash2, ArrowUp, ArrowDown,
  GripVertical, User, Layers, type LucideIcon,
} from 'lucide-react';

type Tab = 'user' | 'phases';

const DEFAULT_PHASES = [
  'Discovery',
  'Concept Design',
  'Schematic Design',
  'Design Development',
  'Construction Documentation',
  'Contract Administration',
  'FF&E Selection',
];

export default function SettingsPage() {
  const { settings, updateSettings } = useSettings();
  const [activeTab, setActiveTab] = useState<Tab>('user');
  const [studioName, setStudioName] = useState(settings.studioName);
  const [firstName, setFirstName] = useState(settings.firstName);
  const [lastName, setLastName] = useState(settings.lastName);
  const [email, setEmail] = useState(settings.email);
  const [saved, setSaved] = useState(false);
  const [phases, setPhases] = useState(DEFAULT_PHASES);
  const [showAddPhase, setShowAddPhase] = useState(false);
  const [editingPhase, setEditingPhase] = useState<{ index: number; value: string } | null>(null);
  const [newPhase, setNewPhase] = useState('');
  const [showLogoutDialog, setShowLogoutDialog] = useState(false);

  const handleSave = () => {
    updateSettings({ studioName, firstName, lastName, email });
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  const addPhase = () => {
    if (!newPhase.trim()) return;
    setPhases(prev => [...prev, newPhase.trim()]);
    setNewPhase('');
    setShowAddPhase(false);
  };

  const savePhaseEdit = () => {
    if (!editingPhase) return;
    setPhases(prev => prev.map((p, i) => i === editingPhase.index ? editingPhase.value : p));
    setEditingPhase(null);
  };

  const deletePhase = (index: number) => {
    setPhases(prev => prev.filter((_, i) => i !== index));
  };

  const movePhase = (index: number, dir: -1 | 1) => {
    setPhases(prev => {
      const arr = [...prev];
      const tmp = arr[index];
      arr[index] = arr[index + dir];
      arr[index + dir] = tmp;
      return arr;
    });
  };

  const handleLogout = () => {
    setShowLogoutDialog(false);
    window.location.href = '/';
  };

  return (
    <>
      {showAddPhase && (
        <SidePanel onClose={() => setShowAddPhase(false)} footer={
          <><div /><div className="flex gap-2">
            <button onClick={() => setShowAddPhase(false)} className="notion-button border border-border">Cancel</button>
            <button onClick={addPhase} className="btn-primary">Add Phase</button>
          </div></>
        }>
          <div className="px-6 py-5 space-y-4">
            <div>
              <label className="block text-xs text-muted-foreground mb-1.5">Phase Name *</label>
              <input value={newPhase} onChange={e => setNewPhase(e.target.value)} placeholder="e.g. Post-Construction Review"
                className="modal-input" onKeyDown={e => { if (e.key === 'Enter') addPhase(); }} autoFocus />
            </div>
            <p className="text-xs text-muted-foreground">The new phase will be added to the end of your project workflow.</p>
          </div>
        </SidePanel>
      )}

      {editingPhase !== null && (
        <SidePanel onClose={() => setEditingPhase(null)} footer={
          <><div /><div className="flex gap-2">
            <button onClick={() => setEditingPhase(null)} className="notion-button border border-border">Cancel</button>
            <button onClick={savePhaseEdit} className="btn-primary">Save</button>
          </div></>
        }>
          <div className="px-6 py-5 space-y-4">
            <div>
              <label className="block text-xs text-muted-foreground mb-1.5">Phase Name</label>
              <input value={editingPhase.value} onChange={e => setEditingPhase(p => p && ({ ...p, value: e.target.value }))}
                className="modal-input" autoFocus />
            </div>
          </div>
        </SidePanel>
      )}

      {showLogoutDialog && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center" onClick={() => setShowLogoutDialog(false)}>
          <div className="absolute inset-0 bg-black/20" />
          <div className="relative bg-card border border-border rounded-2xl shadow-2xl p-6 max-w-sm w-full mx-4 z-10" onClick={(e) => e.stopPropagation()}>
            <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center mb-4">
              <LogOut size={20} className="text-muted-foreground" />
            </div>
            <h3 className="font-semibold mb-1">Sign out of StudioOS?</h3>
            <p className="text-sm text-muted-foreground mb-5">You will be redirected to the login screen.</p>
            <div className="flex items-center gap-2 justify-end">
              <button onClick={() => setShowLogoutDialog(false)} className="notion-button border border-border">Cancel</button>
              <button onClick={handleLogout} className="notion-button bg-foreground text-background hover:bg-foreground/90">Sign Out</button>
            </div>
          </div>
        </div>
      )}

      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-semibold">Account Settings</h1>
          <p className="text-muted-foreground text-sm mt-0.5">Manage your account and studio preferences</p>
        </div>

        {saved && (
          <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-foreground text-background text-sm px-4 py-2.5 rounded-xl shadow-lg flex items-center gap-2">
            <CheckCircle2 size={16} />
            Settings saved successfully.
          </div>
        )}

        {/* Tabs */}
        <div className="flex items-center gap-1 border-b border-border">
          {([
            { id: 'user' as const, label: 'User Settings', icon: User as LucideIcon },
            { id: 'phases' as const, label: 'Phases', icon: Layers as LucideIcon },
          ]).map(tab => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium transition-colors border-b-2 -mb-px ${
                activeTab === tab.id ? 'border-foreground text-foreground' : 'border-transparent text-muted-foreground hover:text-foreground'
              }`}>
              <tab.icon size={16} />
              {tab.label}
            </button>
          ))}
        </div>

        {/* User Settings Tab */}
        {activeTab === 'user' && (
          <div className="card-base p-5 max-w-lg">
            <h2 className="font-medium mb-4">Studio Profile</h2>
            <div className="space-y-3">
              <div>
                <label className="text-xs text-muted-foreground block mb-1.5">Studio Name</label>
                <input type="text" value={studioName} onChange={e => setStudioName(e.target.value)} className="modal-input" />
              </div>
              <div>
                <label className="text-xs text-muted-foreground block mb-1.5">First Name</label>
                <input type="text" value={firstName} onChange={e => setFirstName(e.target.value)} className="modal-input" />
              </div>
              <div>
                <label className="text-xs text-muted-foreground block mb-1.5">Last Name</label>
                <input type="text" value={lastName} onChange={e => setLastName(e.target.value)} className="modal-input" />
              </div>
              <div>
                <label className="text-xs text-muted-foreground block mb-1.5">Email</label>
                <input type="email" value={email} onChange={e => setEmail(e.target.value)} className="modal-input" />
              </div>
              <button onClick={handleSave} className="btn-primary mt-2">
                <Save size={16} />
                Save Changes
              </button>
            </div>

            {/* Sign Out section */}
            <div className="mt-8 pt-5 border-t border-border">
              <h3 className="font-medium mb-1">Sign Out</h3>
              <p className="text-xs text-muted-foreground mb-3">Sign out of your StudioOS account.</p>
              <button onClick={() => setShowLogoutDialog(true)}
                className="notion-button border border-border text-sm hover:text-red-500">
                <LogOut size={16} />
                Sign Out
              </button>
            </div>
          </div>
        )}

        {/* Phases Tab */}
        {activeTab === 'phases' && (
          <div className="card-base p-5 max-w-lg">
            <h2 className="font-medium mb-0.5">Project Phases</h2>
            <p className="text-xs text-muted-foreground mb-4">Customise your project workflow stages</p>
            <div className="space-y-1">
              {phases.map((phase, i) => (
                <div key={`${phase}-${i}`}
                  className="flex items-center gap-2 px-2 py-2 hover:bg-muted/40 rounded-lg group">
                  <GripVertical size={16} className="text-muted-foreground/40" />
                  <span className="text-sm flex-1">{phase}</span>
                  <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => i > 0 && movePhase(i, -1)} disabled={i === 0}
                      className="p-1 hover:bg-muted rounded disabled:opacity-30 text-muted-foreground">
                      <ArrowUp size={13} />
                    </button>
                    <button onClick={() => i < phases.length - 1 && movePhase(i, 1)} disabled={i === phases.length - 1}
                      className="p-1 hover:bg-muted rounded disabled:opacity-30 text-muted-foreground">
                      <ArrowDown size={13} />
                    </button>
                    <button onClick={() => setEditingPhase({ index: i, value: phase })}
                      className="p-1 hover:bg-muted rounded text-muted-foreground">
                      <Pencil size={13} />
                    </button>
                    <button onClick={() => deletePhase(i)}
                      className="p-1 hover:bg-muted rounded text-muted-foreground hover:text-red-500">
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
            <button onClick={() => setShowAddPhase(true)} className="notion-button border border-border mt-3 w-full justify-center text-sm">
              <Plus size={16} />
              Add Phase
            </button>
          </div>
        )}
      </div>
    </>
  );
}
