'use client';

import { useState } from 'react';
import { Project, PROJECT_PHASES, PROJECT_STATUSES, PROJECT_TYPES, ProjectStatus, ProjectPhase, ProjectType } from '@/lib/projects-data';
import { ClientSelect } from './ClientSelect';
import { SelectDropdown } from './SelectDropdown';
import { DesignerSelect } from '@/components/crm/DesignerSelect';
import { DatePicker } from '@/components/ui/DatePicker';
import { SidePanel } from '@/components/ui/SidePanel';
import { Plus, X } from 'lucide-react';

interface EditProjectModalProps {
  project: Project;
  onClose: () => void;
  onSave: (data: Partial<Project>) => void;
}

export function EditProjectModal({ project, onClose, onSave }: EditProjectModalProps) {
  const [form, setForm] = useState({
    name: project.name,
    clientId: project.clientId,
    address: project.address,
    projectType: project.projectType,
    description: project.description,
    currentPhase: project.currentPhase,
    status: project.status,
    estimatedBudget: project.estimatedBudget.toString(),
    startDate: project.startDate,
    targetCompletion: project.targetCompletion,
    projectManager: project.projectManager,
    consultants: project.consultants || [],
    designTeam: project.designTeam || [],
    siteNotes: project.siteNotes || '',
  });

  const set = (field: string, value: string) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  const handleSave = () => {
    onSave({
      name: form.name,
      clientId: form.clientId,
      address: form.address,
      projectType: form.projectType as ProjectType,
      description: form.description,
      currentPhase: form.currentPhase as ProjectPhase,
      status: form.status as ProjectStatus,
      estimatedBudget: parseInt(form.estimatedBudget.replace(/[^0-9]/g, '')) || 0,
      startDate: form.startDate,
      targetCompletion: form.targetCompletion,
      projectManager: form.projectManager,
      consultants: form.consultants,
      designTeam: form.designTeam,
      siteNotes: form.siteNotes || null,
    });
    onClose();
  };

  return (
    <SidePanel
      subtitle={project.name}
      onClose={onClose}
      footer={
        <>
          <div />
          <div className="flex items-center gap-2">
            <button onClick={onClose} className="notion-button border border-border">Cancel</button>
            <button onClick={handleSave} className="notion-button bg-foreground text-background hover:bg-foreground/90">
              Save Changes
            </button>
          </div>
        </>
      }
    >
      <div className="px-6 py-5 space-y-6">
        {/* Project Details */}
        <div>
          <SectionLabel>Project Details</SectionLabel>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Project Name" required>
              <input value={form.name} onChange={(e) => set('name', e.target.value)} className="modal-input" />
            </Field>
            <Field label="Client" required>
              <ClientSelect value={form.clientId} onChange={(id) => set('clientId', id)} />
            </Field>
            <Field label="Address" className="col-span-2">
              <input value={form.address} onChange={(e) => set('address', e.target.value)} className="modal-input" />
            </Field>
            <Field label="Description" className="col-span-2">
              <textarea value={form.description} onChange={(e) => set('description', e.target.value)} rows={3} className="modal-input resize-none" />
            </Field>
            <Field label="Project Type">
              <SelectDropdown value={form.projectType} options={PROJECT_TYPES} onChange={(v) => set('projectType', v)} />
            </Field>
            <Field label="Budget">
              <input value={form.estimatedBudget} onChange={(e) => set('estimatedBudget', e.target.value)} className="modal-input" />
            </Field>
          </div>
        </div>

        {/* Status and Phase */}
        <div>
          <SectionLabel>Status and Phase</SectionLabel>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Current Phase">
              <SelectDropdown value={form.currentPhase} options={PROJECT_PHASES} onChange={(v) => set('currentPhase', v)} />
            </Field>
            <Field label="Status">
              <SelectDropdown value={form.status} options={PROJECT_STATUSES} onChange={(v) => set('status', v)} />
            </Field>
          </div>
        </div>

        {/* Dates */}
        <div>
          <SectionLabel>Dates</SectionLabel>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Start Date">
              <DatePicker value={form.startDate} onChange={(v) => set('startDate', v)} />
            </Field>
            <Field label="Target Completion">
              <DatePicker value={form.targetCompletion} onChange={(v) => set('targetCompletion', v)} />
            </Field>
          </div>
        </div>

        {/* Project Team */}
        <div>
          <SectionLabel>Project Team</SectionLabel>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Project Designer" className="col-span-2">
              <DesignerSelect value={form.projectManager} onChange={(v) => set('projectManager', v)} />
            </Field>
          </div>

          {/* Design Team */}
          <div className="mt-4">
            <p className="text-xs text-muted-foreground mb-2">Design Team</p>
            <div className="space-y-2">
              {form.designTeam.map((m) => (
                <div key={m.id} className="grid grid-cols-[1fr_1fr_auto] gap-2 items-center">
                  <input
                    value={m.name}
                    onChange={(e) => setForm((prev) => ({
                      ...prev,
                      designTeam: prev.designTeam.map((x) => x.id === m.id ? { ...x, name: e.target.value } : x),
                    }))}
                    placeholder="Name"
                    className="modal-input"
                  />
                  <input
                    value={m.role}
                    onChange={(e) => setForm((prev) => ({
                      ...prev,
                      designTeam: prev.designTeam.map((x) => x.id === m.id ? { ...x, role: e.target.value } : x),
                    }))}
                    placeholder="Role (e.g. Interior Designer)"
                    className="modal-input"
                  />
                  <button
                    onClick={() => setForm((prev) => ({ ...prev, designTeam: prev.designTeam.filter((x) => x.id !== m.id) }))}
                    className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
                  >
                    <X size={14} />
                  </button>
                </div>
              ))}
              <button
                onClick={() => setForm((prev) => ({
                  ...prev,
                  designTeam: [...prev.designTeam, { id: `dt-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`, name: '', role: '' }],
                }))}
                className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
              >
                <Plus size={14} />
                Add Team Member
              </button>
            </div>
          </div>

          {/* Consultants */}
          <div className="mt-4">
            <p className="text-xs text-muted-foreground mb-2">Consultants</p>
            <div className="space-y-2">
              {form.consultants.map((c) => (
                <div key={c.id} className="grid grid-cols-[1fr_1fr_auto] gap-2 items-center">
                  <input
                    value={c.role}
                    onChange={(e) => setForm((prev) => ({
                      ...prev,
                      consultants: prev.consultants.map((x) => x.id === c.id ? { ...x, role: e.target.value } : x),
                    }))}
                    placeholder="Role (e.g. Structural Engineer)"
                    className="modal-input"
                  />
                  <input
                    value={c.name}
                    onChange={(e) => setForm((prev) => ({
                      ...prev,
                      consultants: prev.consultants.map((x) => x.id === c.id ? { ...x, name: e.target.value } : x),
                    }))}
                    placeholder="Name"
                    className="modal-input"
                  />
                  <button
                    onClick={() => setForm((prev) => ({ ...prev, consultants: prev.consultants.filter((x) => x.id !== c.id) }))}
                    className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
                  >
                    <X size={14} />
                  </button>
                </div>
              ))}
              <button
                onClick={() => setForm((prev) => ({
                  ...prev,
                  consultants: [...prev.consultants, { id: `con-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`, role: '', name: '' }],
                }))}
                className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
              >
                <Plus size={14} />
                Add Consultant
              </button>
            </div>
          </div>
        </div>

        {/* Site Notes */}
        <div>
          <SectionLabel>Site Notes</SectionLabel>
          <textarea value={form.siteNotes} onChange={(e) => set('siteNotes', e.target.value)} rows={3} className="modal-input resize-none" />
        </div>
      </div>
    </SidePanel>
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
