'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Project, PROJECT_PHASES, PROJECT_STATUSES, PROJECT_TYPES, formatBudget } from '@/lib/projects-data';
import { useProjects } from '@/lib/projects-context';
import { useCrm } from '@/lib/crm-context';
import { EmptyState } from '@/components/crm/EmptyState';
import { ProjectCard } from '@/components/projects/ProjectCard';
import { EditProjectModal } from '@/components/projects/EditProjectModal';
import { ArchiveDialog } from '@/components/projects/ArchiveDialog';
import { DeleteProjectDialog } from '@/components/projects/DeleteProjectDialog';
import { ProjectStatusBadge } from '@/components/projects/ProjectStatusBadge';
import { NewProjectModal, NewProjectData } from '@/components/projects/NewProjectModal';
import { useActivity } from '@/lib/activity-context';
import { Search, X, Filter, ArrowUpDown, Check, LayoutGrid, Rows3, ListChecks, Plus } from 'lucide-react';

const SORT_OPTIONS = [
  { label: 'Project Name', value: 'name' },
  { label: 'Last Updated', value: 'updated' },
  { label: 'Created', value: 'created' },
];

const FILTER_PHASES = ['All Phases', ...PROJECT_PHASES];
const FILTER_STATUSES = ['All Statuses', ...PROJECT_STATUSES];
const FILTER_TYPES = ['All Types', ...PROJECT_TYPES];

export default function ProjectsPage() {
  const { projects, updateProject, addProject, archiveProject, deleteProject, duplicateProject } = useProjects();
  const { clients } = useCrm();
  const { addActivity } = useActivity();
  const router = useRouter();
  const [view, setView] = useState<'card' | 'table'>('card');
  const [showModal, setShowModal] = useState(false);
  const [editProject, setEditProject] = useState<Project | null>(null);
  const [archiveTarget, setArchiveTarget] = useState<Project | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Project | null>(null);

  // View mode: all vs archived
  const [viewMode, setViewMode] = useState<'all' | 'archived'>('all');

  // Filters
  const [search, setSearch] = useState('');
  const [phaseFilter, setPhaseFilter] = useState('All Phases');
  const [statusFilter, setStatusFilter] = useState('All Statuses');
  const [typeFilter, setTypeFilter] = useState('All Types');

  // Sort
  const [sortBy, setSortBy] = useState('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  // Dropdowns
  const [showFilterMenu, setShowFilterMenu] = useState(false);
  const [showSortMenu, setShowSortMenu] = useState(false);
  const [showTypeMenu, setShowTypeMenu] = useState(false);

  const filtered = useMemo(() => {
    return projects
      .filter((p) => {
        // View mode filter
        if (viewMode === 'archived' && p.status !== 'Archived') return false;
        if (viewMode === 'all' && p.status === 'Archived') return false;

        const client = clients.find((c) => c.id === p.clientId);
        const q = search.toLowerCase();

        if (q && ![p.name, p.address, p.projectManager, client?.primaryContact, client?.company]
          .some((f) => f?.toLowerCase().includes(q))) return false;
        if (phaseFilter !== 'All Phases' && p.currentPhase !== phaseFilter) return false;
        if (statusFilter !== 'All Statuses' && p.status !== statusFilter) return false;
        if (typeFilter !== 'All Types' && p.projectType !== typeFilter) return false;

        return true;
      })
      .sort((a, b) => {
        // Pinned first
        const pinDiff = (b.pinned ? 1 : 0) - (a.pinned ? 1 : 0);
        if (pinDiff !== 0) return pinDiff;

        let valA = '', valB = '';
        if (sortBy === 'name') { valA = a.name; valB = b.name; }
        else if (sortBy === 'updated') { valA = a.updatedAt; valB = b.updatedAt; }
        else if (sortBy === 'created') { valA = a.createdAt; valB = b.createdAt; }

        const cmp = valA.localeCompare(valB);
        return sortOrder === 'asc' ? cmp : -cmp;
      });
  }, [projects, search, phaseFilter, statusFilter, typeFilter, viewMode, sortBy, sortOrder]);

  const hasActiveFilters = phaseFilter !== 'All Phases' || statusFilter !== 'All Statuses';
  const hasTypeFilter = typeFilter !== 'All Types';
  const activeSortLabel = SORT_OPTIONS.find(o => o.value === sortBy)?.label ?? 'Sort';

  const handleNewProject = (data: NewProjectData) => {
    const newProject: Project = {
      id: `proj-${Date.now()}`,
      name: data.name,
      clientId: data.clientId,
      address: data.address,
      projectType: data.projectType,
      description: data.description,
      currentPhase: data.currentPhase,
      phaseProgress: 50,
      status: data.status,
      estimatedBudget: parseInt(data.estimatedBudget.replace(/[^0-9]/g, '')) || 0,
      startDate: data.startDate,
      targetCompletion: data.targetCompletion,
      projectManager: data.projectManager,
      builder: data.builder || null,
      architect: data.architect || null,
      consultants: [],
      designTeam: [],
      siteNotes: data.siteNotes || null,
      pinned: false,
      coverIndex: Math.floor(Math.random() * 6),
      createdAt: new Date().toLocaleDateString('en-AU', { day: 'numeric', month: 'short', year: 'numeric' }),
      updatedAt: new Date().toLocaleDateString('en-AU', { day: 'numeric', month: 'short', year: 'numeric' }),
      progress: Math.round((PROJECT_PHASES.indexOf(data.currentPhase) + 1) / PROJECT_PHASES.length * 100),
      team: {
        projectManager: data.projectManager || 'Ellie S.',
        leadDesigner: null,
        supportDesigner: null,
      },
      notes: [],
      timeline: [],
      tasks: [],
    };
    addProject(newProject);
    addActivity({
      title: 'Project Created',
      description: `New project "${data.name}" created`,
      icon: 'create_new_folder',
      source: data.name,
    });
  };

  const handleEdit = (p: Project) => setEditProject(p);
  const handleDuplicate = (p: Project) => {
    const newId = duplicateProject(p.id);
    addActivity({ title: 'Project Duplicated', description: `${p.name} duplicated`, icon: 'content_copy', source: 'Projects' });
    if (newId) router.push(`/projects/${newId}`);
  };
  const handleArchive = (p: Project) => setArchiveTarget(p);
  const handleDelete = (p: Project) => setDeleteTarget(p);
  const confirmArchive = () => {
    if (!archiveTarget) return;
    archiveProject(archiveTarget.id);
    addActivity({ title: 'Project Archived', description: `${archiveTarget.name} has been archived`, icon: 'archive', source: 'Projects' });
    setArchiveTarget(null);
  };
  const confirmDelete = () => {
    if (!deleteTarget) return;
    deleteProject(deleteTarget.id);
    addActivity({ title: 'Project Deleted', description: `${deleteTarget.name} has been deleted`, icon: 'delete', source: 'Projects' });
    setDeleteTarget(null);
  };

  return (
    <>
      {showModal && <NewProjectModal onClose={() => setShowModal(false)} onSave={handleNewProject} />}
      {editProject && (
        <EditProjectModal
          project={editProject}
          onClose={() => setEditProject(null)}
          onSave={(data) => {
            updateProject(editProject.id, data);
            addActivity({ title: 'Project Updated', description: `Details updated for ${editProject.name}`, icon: 'edit', source: editProject.name });
            setEditProject(null);
          }}
        />
      )}
      {archiveTarget && (
        <ArchiveDialog projectName={archiveTarget.name} onConfirm={confirmArchive} onCancel={() => setArchiveTarget(null)} />
      )}
      {deleteTarget && (
        <DeleteProjectDialog projectName={deleteTarget.name} onConfirm={confirmDelete} onCancel={() => setDeleteTarget(null)} />
      )}

      <div className="space-y-5">
        {/* Page header */}
        <div>
          <h1 className="text-2xl font-semibold">Projects</h1>
          <p className="text-muted-foreground text-sm mt-0.5">Manage all interior design projects across your studio.</p>
        </div>

        {/* Toolbar */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Left: All / Archived tabs */}
          <div className="flex border border-border rounded-lg overflow-hidden">
            <button
              onClick={() => setViewMode('all')}
              className={`h-8 px-3 text-sm font-medium transition-colors ${
                viewMode === 'all' ? 'bg-foreground text-background' : 'text-muted-foreground hover:text-foreground hover:bg-muted'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setViewMode('archived')}
              className={`h-8 px-3 text-sm font-medium transition-colors border-l border-border ${
                viewMode === 'archived' ? 'bg-foreground text-background' : 'text-muted-foreground hover:text-foreground hover:bg-muted'
              }`}
            >
              Archived
            </button>
          </div>

          <div className="flex-1" />

          {/* Right: Search, Filter, Sort, View toggle, New */}
          <div className="flex items-center gap-2 flex-wrap">
            {/* Search */}
            <div className="relative">
              <Search size={16} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
              <input
                type="text"
                placeholder="Search projects..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-8 pr-3 h-8 text-sm border border-border rounded-lg bg-background w-52 placeholder:text-muted-foreground outline-none focus:border-foreground/30 transition-colors"
              />
              {search && (
                <button onClick={() => setSearch('')} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                  <X size={14} />
                </button>
              )}
            </div>

            {/* Project Type — icon only, separate button */}
            <div className="relative">
              <button
                onClick={() => { setShowTypeMenu(!showTypeMenu); setShowFilterMenu(false); setShowSortMenu(false); }}
                className={`relative toolbar-icon-btn ${hasTypeFilter ? 'toolbar-icon-btn-active' : ''}`}
              >
                <ListChecks size={18} />
              </button>
              {showTypeMenu && (
                <>
                  <div className="fixed inset-0 z-20" onClick={() => setShowTypeMenu(false)} />
                  <div className="absolute right-0 mt-1 w-64 bg-popover border border-border rounded-xl shadow-lg z-30 py-2">
                    <p className="px-3 py-1 text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">Project Types</p>
                    {FILTER_TYPES.map(t => (
                      <button key={t} onClick={() => { setTypeFilter(t); setShowTypeMenu(false); }}
                        className={`filter-item ${typeFilter === t ? 'filter-item-active' : 'filter-item-inactive'}`}>
                        {t}{typeFilter === t && <Check size={13} />}
                      </button>
                    ))}
                    {hasTypeFilter && (
                      <div className="border-t border-border/40 px-3 pt-2 pb-1">
                        <button onClick={() => { setTypeFilter('All Types'); setShowTypeMenu(false); }} className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1.5">
                          <X size={12} />
                          Clear Filters
                        </button>
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>

            {/* Filter — icon only */}
            <div className="relative">
              <button
                onClick={() => setShowFilterMenu(!showFilterMenu)}
                className={`relative toolbar-icon-btn ${hasActiveFilters ? 'toolbar-icon-btn-active' : ''}`}
              >
                <Filter size={18} />
              </button>
              {showFilterMenu && (
                <>
                  <div className="fixed inset-0 z-20" onClick={() => setShowFilterMenu(false)} />
                  <div className="absolute right-0 mt-1 w-64 bg-popover border border-border rounded-xl shadow-lg z-30 py-2 overflow-hidden">
                    <p className="px-3 py-1 text-xs font-medium text-muted-foreground uppercase tracking-wide">Phase</p>
                    {FILTER_PHASES.map(p => (
                      <button key={p} onClick={() => setPhaseFilter(p)}
                        className={`filter-item ${phaseFilter === p ? 'filter-item-active' : 'filter-item-inactive'}`}>
                        {p}{phaseFilter === p && <Check size={13} />}
                      </button>
                    ))}
                    <div className="border-t border-border/40 my-1" />
                    <p className="px-3 py-1 text-xs font-medium text-muted-foreground uppercase tracking-wide">Status</p>
                    {['All Statuses', 'Active', 'On Hold', 'Completed'].map(s => (
                      <button key={s} onClick={() => setStatusFilter(s)}
                        className={`filter-item ${statusFilter === s ? 'filter-item-active' : 'filter-item-inactive'}`}>
                        {s}{statusFilter === s && <Check size={13} />}
                      </button>
                    ))}
                    {hasActiveFilters && (
                      <div className="border-t border-border/40 px-3 pt-2 pb-1">
                        <button onClick={() => { setPhaseFilter('All Phases'); setStatusFilter('All Statuses'); setShowFilterMenu(false); }} className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1.5">
                          <X size={12} />
                          Clear Filters
                        </button>
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>

            {/* Sort — icon only */}
            <div className="relative">
              <button
                onClick={() => setShowSortMenu(!showSortMenu)}
                className="toolbar-icon-btn"
              >
                <ArrowUpDown size={18} />
              </button>
              {showSortMenu && (
                <>
                  <div className="fixed inset-0 z-20" onClick={() => setShowSortMenu(false)} />
                  <div className="absolute right-0 mt-1 w-52 bg-popover border border-border rounded-xl shadow-lg z-30 py-1">
                    <p className="px-3 py-1.5 text-xs font-medium text-muted-foreground">Sort By</p>
                    {SORT_OPTIONS.map(opt => (
                      <button
                        key={opt.value}
                        onClick={() => { setSortBy(opt.value); setShowSortMenu(false); }}
                        className={`flex items-center justify-between w-full px-3 py-2 text-sm hover:bg-muted transition-colors text-left ${sortBy === opt.value ? 'font-medium text-foreground' : 'text-muted-foreground'}`}
                      >
                        {opt.label}
                        {sortBy === opt.value && <Check size={14} />}
                      </button>
                    ))}
                    <div className="border-t border-border my-1" />
                    <p className="px-3 py-1.5 text-xs font-medium text-muted-foreground">Order</p>
                    <button
                      onClick={() => { setSortOrder('asc'); setShowSortMenu(false); }}
                      className={`flex items-center justify-between w-full px-3 py-2 text-sm hover:bg-muted transition-colors text-left ${sortOrder === 'asc' ? 'font-medium text-foreground' : 'text-muted-foreground'}`}
                    >
                      Ascending
                      {sortOrder === 'asc' && <Check size={14} />}
                    </button>
                    <button
                      onClick={() => { setSortOrder('desc'); setShowSortMenu(false); }}
                      className={`flex items-center justify-between w-full px-3 py-2 text-sm hover:bg-muted transition-colors text-left ${sortOrder === 'desc' ? 'font-medium text-foreground' : 'text-muted-foreground'}`}
                    >
                      Descending
                      {sortOrder === 'desc' && <Check size={14} />}
                    </button>
                  </div>
                </>
              )}
            </div>

            <div className="flex border border-border rounded-lg overflow-hidden">
              <button
                onClick={() => setView('card')}
                className={`w-8 h-8 flex items-center justify-center transition-colors ${view === 'card' ? 'view-toggle-active' : 'text-muted-foreground hover:bg-muted/50'}`}
              >
                <LayoutGrid size={18} />
              </button>
              <button
                onClick={() => setView('table')}
                className={`w-8 h-8 flex items-center justify-center border-l border-border transition-colors ${view === 'table' ? 'view-toggle-active' : 'text-muted-foreground hover:bg-muted/50'}`}
              >
                <Rows3 size={18} />
              </button>
            </div>

            {/* New Project */}
            <button
              onClick={() => setShowModal(true)}
              className="btn-primary"
            >
              + New Project
            </button>
          </div>
        </div>

        {/* Content */}
        {filtered.length === 0 ? (
          <EmptyState
            icon="folder"
            title={viewMode === 'archived' ? 'No archived projects' : (search || hasActiveFilters ? 'No projects match your filters' : 'No projects yet')}
            description={search || hasActiveFilters ? 'Try adjusting your search or filters.' : viewMode === 'archived' ? 'Archived projects will appear here.' : 'Create your first project to get started.'}
            action={viewMode === 'all' ? { label: '+ New Project', onClick: () => setShowModal(true) } : undefined}
          />
        ) : view === 'card' ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filtered.map((project) => (
              <ProjectCard
                key={project.id}
                project={project}
                onEdit={handleEdit}
                onDuplicate={handleDuplicate}
                onArchive={handleArchive}
                onDelete={handleDelete}
              />
            ))}
            {viewMode === 'all' && (
              <button
                onClick={() => setShowModal(true)}
                className="border-2 border-dashed border-border rounded-xl h-56 flex flex-col items-center justify-center gap-2 text-muted-foreground hover:border-muted-foreground/40 hover:text-foreground transition-colors"
              >
                <Plus size={22} />
                <span className="text-sm">New Project</span>
              </button>
            )}
          </div>
        ) : (
          <div className="bg-card border border-border rounded-xl overflow-hidden">
            <table className="w-full table-fixed">
              <colgroup>
                <col style={{ width: '28%' }} />
                <col style={{ width: '12%' }} />
                <col style={{ width: '12%' }} />
                <col style={{ width: '12%' }} />
                <col style={{ width: '12%' }} />
                <col style={{ width: '12%' }} />
                <col style={{ width: '12%' }} />
              </colgroup>
              <thead>
                <tr className="border-b border-border bg-muted/30">
                  <th className="table-header text-left">Project</th>
                  <th className="table-header text-left">Client</th>
                  <th className="table-header text-left">Phase</th>
                  <th className="table-header text-left">Status</th>
                  <th className="table-header text-left">Manager</th>
                  <th className="table-header text-left">Budget</th>
                  <th className="table-header text-left">Target</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((project) => {
                  const client = clients.find((c) => c.id === project.clientId);
                  return (
                    <tr key={project.id} className="hover:bg-muted/20 cursor-pointer border-b border-border/50 last:border-b-0">
                      <td className="table-cell">
                        <Link href={`/projects/${project.id}`}>
                          <p className="font-medium">{project.name}</p>
                          <p className="text-xs text-muted-foreground">{project.address}</p>
                        </Link>
                      </td>
                      <td className="table-cell text-muted-foreground overflow-hidden text-ellipsis whitespace-nowrap">{client?.primaryContact || '—'}</td>
                      <td className="table-cell text-muted-foreground overflow-hidden text-ellipsis whitespace-nowrap">{project.currentPhase}</td>
                      <td className="table-cell"><ProjectStatusBadge status={project.status} /></td>
                      <td className="table-cell text-muted-foreground overflow-hidden text-ellipsis whitespace-nowrap">{project.projectManager}</td>
                      <td className="table-cell text-muted-foreground overflow-hidden text-ellipsis whitespace-nowrap">{formatBudget(project.estimatedBudget)}</td>
                      <td className="table-cell text-muted-foreground overflow-hidden text-ellipsis whitespace-nowrap">{project.targetCompletion}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  );
}
