'use client';

import { useState } from 'react';
import { PROJECT_PHASES, PROJECT_STATUSES, PROJECT_TYPES, ProjectStatus, ProjectPhase, ProjectType } from '@/lib/projects-data';
import { ClientSelect } from './ClientSelect';
import { SelectDropdown } from './SelectDropdown';
import { DesignerSelect } from '@/components/crm/DesignerSelect';
import { DatePicker } from '@/components/ui/DatePicker';
import { SidePanel } from '@/components/ui/SidePanel';

interface NewProjectModalProps {
  onClose: () => void;
  onSave: (data: NewProjectData) => void;
}

export interface NewProjectData {
  name: string;
  clientId: string;
  address: string;
  projectType: ProjectType;
  description: string;
  currentPhase: ProjectPhase;
  status: ProjectStatus;
  estimatedBudget: string;
  startDate: string;
  targetCompletion: string;
  projectManager: string;
  builder: string;
  architect: string;
  siteNotes: string;
}

export function NewProjectModal({ onClose, onSave }: NewProjectModalProps) {
  const [form, setForm] = useState({
    name: '',
    clientId: '',
    address: '',
    projectType: 'Residential' as ProjectType,
    description: '',
    currentPhase: 'Discovery' as ProjectPhase,
    status: 'Active' as ProjectStatus,
    estimatedBudget: '',
    startDate: '',
    targetCompletion: '',
    projectManager: '',
    builder: '',
    architect: '',
    siteNotes: '',
  });

  const set = (field: string, value: string) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  const handleSave = () => {
    if (!form.name || !form.clientId) return;
    onSave(form);
    onClose();
  };

  return (
    <>
      <SidePanel
        title="Create Project"
        subtitle="Add a new project to your workspace"
        onClose={onClose}
        footer={
          <>
            <div />
            <div className="flex items-center gap-2">
              <button onClick={onClose} className="notion-button border border-border">Cancel</button>
              <button
                onClick={handleSave}
                disabled={!form.name || !form.clientId}
                className="notion-button bg-foreground text-background hover:bg-foreground/90 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Create Project
              </button>
            </div>
          </>
        }
      >
        <div className="px-6 py-5 space-y-6">
          {/* Client */}
          <div>
            <SectionLabel>Client</SectionLabel>
            <Field label="Select Existing Client" required>
              <ClientSelect
                value={form.clientId}
                onChange={(id) => set('clientId', id)}
              />
            </Field>
          </div>

          {/* Project Details */}
          <div>
            <SectionLabel>Project Details</SectionLabel>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Project Name" required>
                <input value={form.name} onChange={(e) => set('name', e.target.value)} placeholder="Hampton Residence" className="modal-input" />
              </Field>
              <Field label="Project Type">
                <SelectDropdown value={form.projectType} options={PROJECT_TYPES} onChange={(v) => set('projectType', v)} />
              </Field>
              <Field label="Project Address" className="col-span-2">
                <input value={form.address} onChange={(e) => set('address', e.target.value)} placeholder="24 Balmoral Avenue, Mosman NSW 2088" className="modal-input" />
              </Field>
              <Field label="Description" className="col-span-2">
                <textarea value={form.description} onChange={(e) => set('description', e.target.value)} rows={3} placeholder="Brief description of the project..." className="modal-input resize-none" />
              </Field>
              <Field label="Current Phase">
                <SelectDropdown value={form.currentPhase} options={PROJECT_PHASES} onChange={(v) => set('currentPhase', v)} />
              </Field>
              <Field label="Project Status">
                <SelectDropdown value={form.status} options={PROJECT_STATUSES.filter((s) => s !== 'Archived')} onChange={(v) => set('status', v)} />
              </Field>
              <Field label="Estimated Budget">
                <input value={form.estimatedBudget} onChange={(e) => set('estimatedBudget', e.target.value)} placeholder="$320,000" className="modal-input" />
              </Field>
              <Field label="Project Manager">
                <DesignerSelect value={form.projectManager} onChange={(v) => set('projectManager', v)} />
              </Field>
              <Field label="Start Date">
                <DatePicker value={form.startDate} onChange={(v) => set('startDate', v)} placeholder="Select date" />
              </Field>
              <Field label="Target Completion">
                <DatePicker value={form.targetCompletion} onChange={(v) => set('targetCompletion', v)} placeholder="Select date" />
              </Field>
            </div>
          </div>

          {/* Additional Information */}
          <div>
            <SectionLabel>Additional Information</SectionLabel>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Builder">
                <input value={form.builder} onChange={(e) => set('builder', e.target.value)} placeholder="Pacific Constructions" className="modal-input" />
              </Field>
              <Field label="Architect">
                <input value={form.architect} onChange={(e) => set('architect', e.target.value)} placeholder="Studio Architecture" className="modal-input" />
              </Field>
              <Field label="Site Notes" className="col-span-2">
                <textarea value={form.siteNotes} onChange={(e) => set('siteNotes', e.target.value)} rows={2} placeholder="Access instructions, parking, council requirements..." className="modal-input resize-none" />
              </Field>
            </div>
          </div>
        </div>
      </SidePanel>
    </>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3">{children}</p>;
}

function Field({ label, required, children, className }: { label: string; required?: boolean; children: React.ReactNode; className?: string }) {
  return (
    <div className={className}>
      <label className="block text-xs text-muted-foreground mb-1.5">
        {label}{required && <span className="text-red-400 ml-0.5">*</span>}
      </label>
      {children}
    </div>
  );
}
