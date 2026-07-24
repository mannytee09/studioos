'use client';

import { useState } from 'react';
import { PROJECT_TYPES } from '@/lib/crm-data';
import { DesignerSelect } from './DesignerSelect';
import { X } from 'lucide-react';

interface NewClientModalProps {
  onClose: () => void;
}

export function NewClientModal({ onClose }: NewClientModalProps) {
  const [form, setForm] = useState({
    company: '', primaryContact: '', email: '', phone: '',
    address: '', website: '', projectType: 'Residential',
    assignedDesigner: '', notes: '',
  });

  const set = (field: string, value: string) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center">
      <div className="absolute inset-0 bg-black/20" onClick={onClose} />
      <div className="relative bg-card border border-border rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] flex flex-col mx-4 overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-border flex-shrink-0">
          <h2 className="font-semibold">New Client</h2>
          <button onClick={onClose} className="p-1.5 hover:bg-muted rounded-lg">
            <X size={18} />
          </button>
        </div>

        <div className="px-6 py-5 space-y-3 modal-scroll flex-1 min-h-0">
          <Field label="Company / Family Name" required>
            <input value={form.company} onChange={(e) => set('company', e.target.value)} placeholder="Williams Family" className="modal-input" />
          </Field>
          <Field label="Primary Contact" required>
            <input value={form.primaryContact} onChange={(e) => set('primaryContact', e.target.value)} placeholder="Sophie Williams" className="modal-input" />
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Email" required>
              <input type="email" value={form.email} onChange={(e) => set('email', e.target.value)} placeholder="sophie@email.com" className="modal-input" />
            </Field>
            <Field label="Phone">
              <input value={form.phone} onChange={(e) => set('phone', e.target.value)} placeholder="+61 400 000 000" className="modal-input" />
            </Field>
          </div>
          <Field label="Address">
            <input value={form.address} onChange={(e) => set('address', e.target.value)} placeholder="12 Harbour View, Mosman" className="modal-input" />
          </Field>
          <Field label="Website">
            <input value={form.website} onChange={(e) => set('website', e.target.value)} placeholder="www.example.com" className="modal-input" />
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Project Type">
              <select value={form.projectType} onChange={(e) => set('projectType', e.target.value)} className="modal-input">
                {PROJECT_TYPES.map((t) => <option key={t}>{t}</option>)}
              </select>
            </Field>
            <Field label="Assigned Designer">
              <DesignerSelect value={form.assignedDesigner} onChange={(v) => set('assignedDesigner', v)} />
            </Field>
          </div>
          <Field label="Notes">
            <textarea
              value={form.notes}
              onChange={(e) => set('notes', e.target.value)}
              rows={3}
              placeholder="Any initial notes about this client..."
              className="modal-input resize-none"
            />
          </Field>
        </div>

        <div className="flex items-center justify-end gap-2 px-6 py-4 border-t border-border flex-shrink-0">
          <button onClick={onClose} className="notion-button border border-border">Cancel</button>
          <button onClick={onClose} className="notion-button bg-foreground text-background hover:bg-foreground/90">
            Save Client
          </button>
        </div>
      </div>
    </div>
  );
}

function Field({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-xs text-muted-foreground mb-1.5">
        {label}{required && <span className="text-red-400 ml-0.5">*</span>}
      </label>
      {children}
    </div>
  );
}
