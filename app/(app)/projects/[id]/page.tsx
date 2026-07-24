'use client';

import { useState, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Project, PROJECT_PHASES, ProjectPhase, formatBudget } from '@/lib/projects-data';
import { useProjects } from '@/lib/projects-context';
import { useCrm } from '@/lib/crm-context';
import { useActivity } from '@/lib/activity-context';
import { FolderOpen, CircleCheck as CheckCircle2, ChevronDown, CirclePlay as PlayCircle, BadgeCheck, Mail, Phone, User } from 'lucide-react';
import { SchedulesTab } from '@/components/projects/schedules';
import { DeleteProjectDialog } from '@/components/projects/DeleteProjectDialog';
import { EmptyState } from '@/components/crm/EmptyState';
import { ProjectStatusBadge } from '@/components/projects/ProjectStatusBadge';
import { EditProjectModal } from '@/components/projects/EditProjectModal';
import { ArchiveDialog } from '@/components/projects/ArchiveDialog';
import { PlannerTab } from '@/components/projects/PlannerTab';
import { FinanceTab } from '@/components/projects/FinanceTab';
import { GanttPhase, GanttMilestone } from '@/components/projects/GanttView';
import { TimelineTab } from '@/components/projects/TimelineTab';
import { Timeline } from '@/components/crm/Timeline';
import { NotesPanel } from '@/components/crm/NotesPanel';
import { DetailSection, DetailField } from '@/components/crm/DetailSection';

const tabs = ['Overview', 'Planner', 'Timeline', 'Schedules', 'Finance'] as const;
type Tab = typeof tabs[number];

export default function ProjectWorkspacePage() {
  const params = useParams();
  const id = params.id as string;

  const { projects, setPhaseProgress, changePhase, updateProject, archiveProject, unarchiveProject, deleteProject } = useProjects();
  const { addActivity } = useActivity();
  const { clients } = useCrm();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<Tab>('Overview');
  const [showEditModal, setShowEditModal] = useState(false);
  const [showArchiveDialog, setShowArchiveDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [phaseConfirmMsg, setPhaseConfirmMsg] = useState('');
  const [customPhases, setCustomPhases] = useState<GanttPhase[]>([]);
  const [customMilestones, setCustomMilestones] = useState<GanttMilestone[]>([]);

  const project = projects.find((p) => p.id === id);

  if (!project) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <FolderOpen size={48} className="text-muted-foreground mb-3" />
        <h2 className="font-medium text-lg mb-1">Project not found</h2>
        <Link href="/projects" className="notion-button text-muted-foreground mt-2">
          Back to Projects
        </Link>
      </div>
    );
  }

  const client = clients.find((c) => c.id === project.clientId);
  const isArchived = project.status === 'Archived';

  const handlePhaseChange = (phase: ProjectPhase) => {
    const prevPhase = project.currentPhase;
    changePhase(id, phase);
    setPhaseConfirmMsg(`${prevPhase} completed successfully.`);
    setTimeout(() => setPhaseConfirmMsg(''), 3500);
    addActivity({ title: 'Phase Changed', description: `${project.name} moved from ${prevPhase} to ${phase}`, icon: 'change_circle', source: project.name });
  };

  const handleEditSave = (data: Partial<Project>) => {
    updateProject(id, data);
    addActivity({ title: 'Project Updated', description: `Details updated for ${project.name}`, icon: 'edit', source: project.name });
  };

  const handleArchive = () => {
    archiveProject(id);
    setShowArchiveDialog(false);
    addActivity({ title: 'Project Archived', description: `${project.name} has been archived`, icon: 'archive', source: project.name });
  };

  const handleDelete = () => {
    deleteProject(id);
    setShowDeleteDialog(false);
    addActivity({ title: 'Project Deleted', description: `${project.name} has been deleted`, icon: 'delete', source: 'Projects' });
    router.push('/projects');
  };

  const handleUpdateTasks = (tasks: Project['tasks']) => {
    updateProject(id, { tasks });
  };

  const handleUpdateInvoices = (invoices: Project['invoices']) => {
    updateProject(id, { invoices });
  };

  const handleAddPhase = (p: GanttPhase) => setCustomPhases(prev => [...prev, p]);
  const handleEditPhase = (p: GanttPhase) => setCustomPhases(prev => {
    const exists = prev.some(x => x.id === p.id);
    return exists ? prev.map(x => x.id === p.id ? p : x) : [...prev, p];
  });
  const handleDeletePhase = (pid: string) => setCustomPhases(prev => prev.filter(x => x.id !== pid));
  const handleReorderPhases = (reordered: GanttPhase[]) => setCustomPhases(reordered);

  return (
    <>
      {showEditModal && <EditProjectModal project={project} onClose={() => setShowEditModal(false)} onSave={handleEditSave} />}
      {showArchiveDialog && <ArchiveDialog projectName={project.name} onConfirm={handleArchive} onCancel={() => setShowArchiveDialog(false)} />}
      {showDeleteDialog && <DeleteProjectDialog projectName={project.name} onConfirm={handleDelete} onCancel={() => setShowDeleteDialog(false)} />}

      <div className="space-y-5">
        {phaseConfirmMsg && (
          <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 glass-toast text-sm px-4 py-2.5 rounded-xl flex items-center gap-2 animate-in fade-in slide-in-from-bottom-4 duration-300">
            <CheckCircle2 size={16} />
            {phaseConfirmMsg}
          </div>
        )}

        {/* Header */}
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2.5 flex-wrap">
              <h1 className="text-2xl font-semibold">{project.name}</h1>
              <ProjectStatusBadge status={project.status} />
              {isArchived && (
                <span className="text-xs px-2 py-0.5 rounded-md bg-muted text-muted-foreground font-medium">
                  Archived
                </span>
              )}
            </div>
            <p className="text-muted-foreground text-sm mt-0.5">{client?.primaryContact || 'Unknown Client'} · {project.currentPhase}</p>
          </div>

          <div className="flex items-center gap-2 flex-shrink-0">
            <button onClick={() => setShowEditModal(true)} className="notion-button border border-border text-sm">
              Edit
            </button>
            <button onClick={() => setShowDeleteDialog(true)} className="notion-button border border-border text-sm hover:text-red-600">
              Delete
            </button>
            {isArchived ? (
              <button onClick={() => unarchiveProject(id)} className="notion-button border border-border text-sm text-amber-600">
                Unarchive
              </button>
            ) : (
              <button onClick={() => setShowArchiveDialog(true)} className="notion-button border border-border text-sm">
                Archive
              </button>
            )}
          </div>
        </div>

        {/* Tab Navigation — button style */}
        <div className="flex border border-border rounded-lg overflow-hidden w-fit">
          {tabs.map((tab, i) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`h-8 px-4 text-sm font-medium transition-colors ${i > 0 ? 'border-l border-border' : ''} ${
                activeTab === tab
                  ? 'bg-foreground text-background'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        {activeTab === 'Overview' && (
          <OverviewTab
            project={project}
            client={client}
            onPhaseProgressChange={(progress) => setPhaseProgress(id, progress)}
            onPhaseChange={handlePhaseChange}
            onEditCard={(card) => setShowEditModal(true)}
          />
        )}

        {activeTab === 'Planner' && (
          <PlannerTab project={project} onUpdateTasks={handleUpdateTasks} />
        )}

        {activeTab === 'Timeline' && (
          <TimelineTab project={project} customPhases={customPhases} customMilestones={customMilestones} onAddPhase={handleAddPhase} onEditPhase={handleEditPhase} onDeletePhase={handleDeletePhase} onAddMilestone={(m) => setCustomMilestones(prev => [...prev, m])} onReorderPhases={handleReorderPhases} />
        )}

        {activeTab === 'Schedules' && (
          <SchedulesTab projectId={project.id} />
        )}

        {activeTab === 'Finance' && (
          <FinanceTab project={project} onUpdateInvoices={handleUpdateInvoices} />
        )}
      </div>
    </>
  );
}

function OverviewTab({
  project,
  client,
  onPhaseProgressChange,
  onPhaseChange,
  onEditCard,
}: {
  project: Project;
  client: any;
  onPhaseProgressChange: (progress: number) => void;
  onPhaseChange: (phase: ProjectPhase) => void;
  onEditCard: (card: string) => void;
}) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
      {/* Left Column */}
      <div className="lg:col-span-1 space-y-4">
        {/* Project Details */}
        <DetailSection title="Project Details">
          <div className="space-y-3">
            <DetailField label="Project Name" value={project.name} />
            <DetailField label="Address" value={project.address} />
            <DetailField label="Project Type" value={project.projectType} />
            <DetailField label="Status" value={<ProjectStatusBadge status={project.status} />} />
            <DetailField label="Project Manager" value={project.projectManager} />
            <DetailField label="Estimated Budget" value={formatBudget(project.estimatedBudget)} />
            <DetailField label="Start Date" value={project.startDate} />
            <DetailField label="Target Completion" value={project.targetCompletion} />
          </div>
        </DetailSection>

        {/* Client Details */}
        <DetailSection title="Client Details">
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center flex-shrink-0">
                <BadgeCheck size={16} className="text-muted-foreground" />
              </div>
              <div>
                <p className="text-sm font-medium">{client?.primaryContact || 'Unknown'}</p>
                <p className="text-xs text-muted-foreground">{client?.company}</p>
              </div>
            </div>
            {client?.email && (
              <a href={`mailto:${client.email}`} className="flex items-center gap-2 text-sm hover:text-foreground transition-colors">
                <Mail size={16} className="text-muted-foreground flex-shrink-0" />
                <span className="text-muted-foreground truncate">{client.email}</span>
              </a>
            )}
            {client?.phone && (
              <a href={`tel:${client.phone}`} className="flex items-center gap-2 text-sm hover:text-foreground transition-colors">
                <Phone size={16} className="text-muted-foreground flex-shrink-0" />
                <span className="text-muted-foreground">{client.phone}</span>
              </a>
            )}
            <Link href={`/crm/clients/${client?.id}`} className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors">
              View Client Record
            </Link>
          </div>
        </DetailSection>

        {/* Current Phase Progress */}
        <div className="bg-card border border-border rounded-xl p-5 card-base">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-medium text-sm">Current Phase</h3>
          </div>
          <SimplifiedPhaseProgress
            currentPhase={project.currentPhase}
            phaseProgress={project.phaseProgress ?? 0}
            onProgressChange={onPhaseProgressChange}
            onPhaseChange={onPhaseChange}
          />
        </div>
      </div>

      {/* Right Columns */}
      <div className="lg:col-span-2 space-y-4">
        {project.description && (
          <DetailSection title="Description">
            <p className="text-sm text-muted-foreground leading-relaxed">{project.description}</p>
          </DetailSection>
        )}

        {/* Project Team */}
        <DetailSection title="Project Team">
          <div className="space-y-4">
            {/* Project Designer */}
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center flex-shrink-0">
                <User size={15} className="text-muted-foreground" />
              </div>
              <div>
                <p className="text-sm font-medium">{project.projectManager || 'Unassigned'}</p>
                <p className="text-xs text-muted-foreground">Project Designer</p>
              </div>
            </div>

            {/* Design Team */}
            {project.designTeam && project.designTeam.length > 0 && (
              <div>
                <p className="text-xs text-muted-foreground mb-2">Design Team</p>
                <div className="space-y-2">
                  {project.designTeam.map((m) => (
                    <div key={m.id} className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center flex-shrink-0">
                        <User size={15} className="text-muted-foreground" />
                      </div>
                      <div>
                        <p className="text-sm font-medium">{m.name || 'Unassigned'}</p>
                        <p className="text-xs text-muted-foreground">{m.role}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Consultants */}
            {project.consultants && project.consultants.length > 0 && (
              <div>
                <p className="text-xs text-muted-foreground mb-2">Consultants</p>
                <div className="space-y-2">
                  {project.consultants.map((c) => (
                    <div key={c.id} className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center flex-shrink-0">
                        <User size={15} className="text-muted-foreground" />
                      </div>
                      <div>
                        <p className="text-sm font-medium">{c.name || 'Unassigned'}</p>
                        <p className="text-xs text-muted-foreground">{c.role}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Site Notes */}
            {project.siteNotes && <DetailField label="Site Notes" value={project.siteNotes} />}
          </div>
        </DetailSection>

        <DetailSection title="Recent Activity">
          {project.timeline.length === 0 ? (
            <EmptyState icon="history" description="Activity will appear here as the project progresses." />
          ) : (
            <Timeline events={[...project.timeline].reverse().slice(0, 5)} />
          )}
        </DetailSection>

        <DetailSection title="Notes">
          <NotesPanel notes={project.notes} />
        </DetailSection>
      </div>
    </div>
  );
}

// ── Simplified Phase Progress ─────────────────────────────────────────────────

function SimplifiedPhaseProgress({
  currentPhase,
  phaseProgress,
  onProgressChange,
  onPhaseChange,
}: {
  currentPhase: ProjectPhase;
  phaseProgress: number;
  onProgressChange: (p: number) => void;
  onPhaseChange: (phase: ProjectPhase) => void;
}) {
  const currentIndex = PROJECT_PHASES.indexOf(currentPhase);
  const remainingPhases = PROJECT_PHASES.slice(currentIndex + 1);
  const [showNextPhaseMenu, setShowNextPhaseMenu] = useState(false);
  const isLastPhase = currentIndex >= PROJECT_PHASES.length - 1;

  const progressWidth = phaseProgress === 0 ? '0%' : phaseProgress === 50 ? '50%' : '100%';

  return (
    <div className="space-y-4">
      <p className="text-base font-semibold">{currentPhase}</p>

      {/* Progress bar — matches ProjectCard styling */}
      <div className="h-1.5 bg-muted rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{ width: progressWidth, background: 'rgba(51,51,51,0.35)' }}
        />
      </div>

      {/* Progress buttons */}
      <div className="flex items-center justify-between">
        <span className="text-xs text-muted-foreground">{phaseProgress}% complete</span>
        <div className="flex items-center gap-1 border border-border rounded-lg p-0.5">
          {[0, 50, 100].map((p) => (
            <button
              key={p}
              onClick={() => onProgressChange(p)}
              className={`px-2.5 py-1 text-xs rounded-md transition-colors ${
                phaseProgress === p
                  ? 'bg-foreground text-background font-medium'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted'
              }`}
            >
              {p === 0 ? '0%' : p === 50 ? '50%' : '100%'}
            </button>
          ))}
        </div>
      </div>

      {/* Select Next Phase — only visible at 100% and not last phase */}
      {phaseProgress === 100 && !isLastPhase && (
        <div className="relative pt-1">
          <button
            onClick={() => setShowNextPhaseMenu(!showNextPhaseMenu)}
            className="w-full flex items-center justify-between px-3 py-2 notion-button border border-border text-sm font-medium hover:bg-muted/50 transition-colors"
          >
            <span className="flex items-center gap-2">
              Select Next Phase
            </span>
            <ChevronDown size={16} />
          </button>
          {showNextPhaseMenu && (
            <>
              <div className="fixed inset-0 z-20" onClick={() => setShowNextPhaseMenu(false)} />
              <div className="absolute left-0 right-0 mt-1 bg-popover border border-border rounded-xl shadow-lg z-30 py-1">
                {remainingPhases.map((phase) => (
                  <button
                    key={phase}
                    onClick={() => { onPhaseChange(phase); setShowNextPhaseMenu(false); }}
                    className="w-full px-3 py-2.5 text-sm text-left hover:bg-muted transition-colors text-muted-foreground hover:text-foreground flex items-center gap-2"
                  >
                    <PlayCircle size={14} />
                    {phase}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>
      )}

      {phaseProgress === 100 && isLastPhase && (
        <p className="text-xs text-center text-muted-foreground pt-1">All phases completed</p>
      )}
    </div>
  );
}

// ── date helpers ─────────────────────────────────────────────────────────────
function parseProjectDate(s: string): Date {
  const d = new Date(s);
  if (!isNaN(d.getTime())) return d;
  const cleaned = s.replace(/(\d+)(st|nd|rd|th)/, '$1');
  const parsed = new Date(cleaned);
  if (!isNaN(parsed.getTime())) return parsed;
  return new Date(s + ' 2024');
}
function daysBetween(a: Date, b: Date): number {
  return Math.round((b.getTime() - a.getTime()) / 86400000);
}
function addDays(d: Date, n: number): Date {
  const r = new Date(d);
  r.setDate(r.getDate() + n);
  return r;
}
function toISO(d: Date): string {
  return d.toISOString().slice(0, 10);
}
