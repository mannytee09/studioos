'use client';

import { useState } from 'react';
import { PROJECT_TYPES, LEAD_SOURCES, LEAD_STATUSES, Lead } from '@/lib/crm-data';
import { useCrm } from '@/lib/crm-context';
import { useActivity } from '@/lib/activity-context';
import { DesignerSelect } from './DesignerSelect';

import { SidePanel } from '@/components/ui/SidePanel';

interface NewLeadModalProps {
  onClose: () => void;
  onAdd?: (lead: Lead) => void;
}

export function NewLeadModal({ onClose, onAdd }: NewLeadModalProps) {
  const [form, setForm] = useState({
    firstName: '', lastName: '', company: '', email: '', phone: '',
    projectName: '', address: '', projectType: 'Residential',
    estimatedBudget: '', expectedStartDate: '', leadSource: 'Website',
    assignedDesigner: '', status: 'New Enquiry', notes: '',
  });

  const { addLead } = useCrm();
  const { addActivity } = useActivity();

  const set = (field: string, value: string) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  const handleSave = () => {
    if (!form.firstName) return;
    const created: Lead = {
      id: `lead-${Date.now()}`,
      firstName: form.firstName,
      lastName: form.lastName,
      company: form.company,
      email: form.email,
      phone: form.phone,
      address: form.address,
      preferredContact: 'Email',
      projectName: form.projectName,
      projectType: form.projectType as Lead['projectType'],
      estimatedBudget: parseInt(form.estimatedBudget.replace(/[^0-9]/g, '')) || 0,
      expectedStartDate: form.expectedStartDate,
      leadSource: form.leadSource as Lead['leadSource'],
      assignedDesigner: form.assignedDesigner,
      status: form.status as Lead['status'],
      nextFollowUp: '-',
      createdAt: new Date().toLocaleDateString('en-AU', { day: 'numeric', month: 'short', year: 'numeric' }),
      pinned: false,
      notes: form.notes ? [{ id: `note-${Date.now()}`, content: form.notes, author: 'Ellie S.', createdAt: new Date().toLocaleDateString('en-AU', { day: 'numeric', month: 'short', year: 'numeric' }) }] : [],
      timeline: [{ id: `tl-${Date.now()}`, date: new Date().toLocaleDateString('en-AU', { day: 'numeric', month: 'short', year: 'numeric' }), type: 'created', title: 'Lead Created', description: 'Manually added' }],
      tasks: [],
    };
    if (onAdd) onAdd(created);
    else addLead(created);
    addActivity({
      title: 'Lead Created',
      description: `New lead "${form.firstName} ${form.lastName}" added`,
      icon: 'person_add',
      source: 'Leads',
    });
    onClose();
  };

  return (
    <SidePanel
      onClose={onClose}
      footer={
        <>
          <div />
          <div className="flex items-center gap-2">
            <button onClick={onClose} className="notion-button border border-border">Cancel</button>
            <button onClick={handleSave} className="notion-button bg-foreground text-background hover:bg-foreground/90">
              Save Lead
            </button>
          </div>
        </>
      }
    >
      <div className="px-6 py-5 space-y-6">
        {/* Contact */}
        <div>
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3">Contact</p>
          <div className="grid grid-cols-2 gap-3">
            <Field label="First Name" required>
              <input value={form.firstName} onChange={(e) => set('firstName', e.target.value)} placeholder="Sophie" className="modal-input" />
            </Field>
            <Field label="Last Name" required>
              <input value={form.lastName} onChange={(e) => set('lastName', e.target.value)} placeholder="Williams" className="modal-input" />
            </Field>
            <Field label="Company">
              <input value={form.company} onChange={(e) => set('company', e.target.value)} placeholder="Williams Family" className="modal-input" />
            </Field>
            <Field label="Email" required>
              <input type="email" value={form.email} onChange={(e) => set('email', e.target.value)} placeholder="sophie@email.com" className="modal-input" />
            </Field>
            <Field label="Phone">
              <input value={form.phone} onChange={(e) => set('phone', e.target.value)} placeholder="+61 400 000 000" className="modal-input" />
            </Field>
          </div>
        </div>

        {/* Project */}
        <div>
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3">Project</p>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Project Name">
              <input value={form.projectName} onChange={(e) => set('projectName', e.target.value)} placeholder="Mosman Beach House" className="modal-input" />
            </Field>
            <Field label="Project Address">
              <input value={form.address} onChange={(e) => set('address', e.target.value)} placeholder="12 Harbour View, Mosman" className="modal-input" />
            </Field>
            <Field label="Project Type">
              <select value={form.projectType} onChange={(e) => set('projectType', e.target.value)} className="modal-input">
                {PROJECT_TYPES.map((t) => <option key={t}>{t}</option>)}
              </select>
            </Field>
            <Field label="Estimated Budget">
              <input value={form.estimatedBudget} onChange={(e) => set('estimatedBudget', e.target.value)} placeholder="$180,000" className="modal-input" />
            </Field>
            <Field label="Expected Start Date">
              <input value={form.expectedStartDate} onChange={(e) => set('expectedStartDate', e.target.value)} placeholder="Feb 2025" className="modal-input" />
            </Field>
          </div>
        </div>

        {/* Studio */}
        <div>
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3">Studio</p>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Lead Source">
              <select value={form.leadSource} onChange={(e) => set('leadSource', e.target.value)} className="modal-input">
                {LEAD_SOURCES.map((s) => <option key={s}>{s}</option>)}
              </select>
            </Field>
            <Field label="Assigned Designer">
              <DesignerSelect value={form.assignedDesigner} onChange={(v) => set('assignedDesigner', v)} />
            </Field>
            <Field label="Status">
              <select value={form.status} onChange={(e) => set('status', e.target.value)} className="modal-input">
                {LEAD_STATUSES.map((s) => <option key={s}>{s}</option>)}
              </select>
            </Field>
          </div>
        </div>

        {/* Notes */}
        <Field label="Notes">
          <textarea
            value={form.notes}
            onChange={(e) => set('notes', e.target.value)}
            rows={4}
            placeholder="Any additional notes about this lead..."
            className="modal-input resize-none"
          />
        </Field>
      </div>
    </SidePanel>
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
