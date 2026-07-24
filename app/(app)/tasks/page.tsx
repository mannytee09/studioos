'use client';

import { useState, useMemo } from 'react';
import { SidePanel } from '@/components/ui/SidePanel';
import { DatePicker } from '@/components/ui/DatePicker';
import { format, formatDistanceToNow } from 'date-fns';
import { useProjects } from '@/lib/projects-context';
import { useActivity } from '@/lib/activity-context';
import { SelectDropdown } from '@/components/projects/SelectDropdown';
import { Search, X, Filter, ArrowUpDown, Check, Rows3, SquareKanban as KanbanSquare, ListChecks } from 'lucide-react';

interface Task {
  id: string;
  title: string;
  project: string;
  due: string;
  dueDate: Date;
  priority: 'High' | 'Medium' | 'Low';
  status: 'To Do' | 'In Progress' | 'Review' | 'Done';
  completed: boolean;
}

const today = new Date();
today.setHours(0, 0, 0, 0);
const tomorrow = new Date(today); tomorrow.setDate(today.getDate() + 1);
const d = (offset: number) => { const d = new Date(today); d.setDate(today.getDate() + offset); return d; };

const INITIAL_TASKS: Task[] = [
  { id: '1', title: 'Kitchen Layout Review', project: 'Hampton Residence', due: 'Today', dueDate: today, priority: 'High', status: 'In Progress', completed: false },
  { id: '2', title: 'Material Board Presentation', project: 'Darling Point Apartment', due: 'Tomorrow', dueDate: tomorrow, priority: 'Medium', status: 'To Do', completed: false },
  { id: '3', title: 'Site Measure', project: 'Vaucluse House', due: '28 Jun', dueDate: d(1), priority: 'Low', status: 'To Do', completed: false },
  { id: '4', title: 'Client Brief Sign-Off', project: 'Mosman Terrace', due: '30 Jun', dueDate: d(3), priority: 'High', status: 'Review', completed: false },
  { id: '5', title: 'FF&E Schedule Draft', project: 'Rose Bay Villa', due: '2 Jul', dueDate: d(5), priority: 'Medium', status: 'In Progress', completed: false },
  { id: '6', title: 'Concept Presentation Prep', project: 'Woollahra Studio', due: '4 Jul', dueDate: d(7), priority: 'High', status: 'Done', completed: false },
  { id: '7', title: 'Invoice Follow-up', project: 'Darling Point Apartment', due: '22 Jun', dueDate: d(-5), priority: 'High', status: 'To Do', completed: false },
];

const PRIORITY_COLORS: Record<string, string> = {
  High: 'text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20',
  Medium: 'text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20',
  Low: 'text-muted-foreground bg-muted',
};
const STATUS_COLORS: Record<string, string> = {
  'To Do': 'text-muted-foreground bg-muted',
  'In Progress': 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20',
  'Review': 'text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20',
  'Done': 'text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20',
};
const KANBAN_COLUMNS = ['To Do', 'In Progress', 'Review', 'Done'] as const;

const STATUSES = ['All', 'To Do', 'In Progress', 'Review', 'Done'];
const PRIORITIES = ['All', 'High', 'Medium', 'Low'];

function getDueGroup(task: Task): string {
  const diff = Math.floor((task.dueDate.getTime() - today.getTime()) / 86400000);
  if (task.completed) return 'Completed';
  if (diff < 0) return 'Overdue';
  if (diff === 0) return 'Due Today';
  if (diff <= 3) return 'Due Soon';
  return 'Upcoming';
}

const DUE_GROUP_ORDER = ['Overdue', 'Due Today', 'Due Soon', 'Upcoming', 'Completed'];
const DUE_GROUP_COLORS: Record<string, string> = {
  Overdue: 'text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20',
  'Due Today': 'text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20',
  'Due Soon': 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20',
  Upcoming: 'text-muted-foreground bg-muted',
  Completed: 'text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20',
};

export default function TasksPage() {
  const { projects } = useProjects();
  const { addActivity } = useActivity();
  const projectNames = ['All', ...projects.map(p => p.name)];
  const [tasks, setTasks] = useState<Task[]>(INITIAL_TASKS);
  const [view, setView] = useState<'table' | 'kanban'>('table');
  const [search, setSearch] = useState('');
  const [filterProject, setFilterProject] = useState('All');
  const [filterStatus, setFilterStatus] = useState('All');
  const [sortBy, setSortBy] = useState('due');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [showFilterMenu, setShowFilterMenu] = useState(false);
  const [showSortMenu, setShowSortMenu] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [showAddPanel, setShowAddPanel] = useState(false);
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  // New task form
  const [newTask, setNewTask] = useState({ title: '', project: '', priority: 'Medium' as Task['priority'], status: 'To Do' as Task['status'], due: '' });

  const toggleComplete = (id: string) => {
    setTasks(prev => prev.map(t => {
      if (t.id !== id) return t;
      const updated = { ...t, completed: !t.completed, status: (!t.completed ? 'Done' : 'To Do') as Task['status'] };
      addActivity({
        title: updated.completed ? 'Task Completed' : 'Task Reopened',
        description: `"${t.title}" marked as ${updated.completed ? 'complete' : 'incomplete'}`,
        icon: updated.completed ? 'check_circle' : 'task_alt',
        source: 'Tasks',
      });
      return updated;
    }));
  };

  const saveEdit = (updated: Task) => {
    setTasks(prev => prev.map(t => t.id === updated.id ? updated : t));
    setEditingTask(null);
    addActivity({
      title: 'Task Updated',
      description: `"${updated.title}" details were edited`,
      icon: 'edit',
      source: 'Tasks',
    });
  };

  const addTask = () => {
    if (!newTask.title) return;
    const dueDate = newTask.due ? new Date(newTask.due) : d(7);
    const created: Task = {
      id: `t-${Date.now()}`,
      title: newTask.title,
      project: newTask.project,
      due: newTask.due || format(dueDate, 'd MMM'),
      dueDate,
      priority: newTask.priority,
      status: newTask.status,
      completed: false,
    };
    setTasks(prev => [...prev, created]);
    addActivity({
      title: 'Task Added',
      description: `New task "${newTask.title}" created`,
      icon: 'task_alt',
      source: 'Tasks',
    });
    setNewTask({ title: '', project: '', priority: 'Medium', status: 'To Do', due: '' });
    setShowAddPanel(false);
  };

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return tasks.filter(t => {
      if (q && !t.title.toLowerCase().includes(q) && !t.project.toLowerCase().includes(q)) return false;
      if (filterProject !== 'All' && t.project !== filterProject) return false;
      if (filterStatus !== 'All' && t.status !== filterStatus) return false;
      return true;
    }).sort((a, b) => {
      let va: number | string = 0, vb: number | string = 0;
      if (sortBy === 'due') { va = a.dueDate.getTime(); vb = b.dueDate.getTime(); }
      else if (sortBy === 'priority') {
        const order: Record<string, number> = { High: 0, Medium: 1, Low: 2 };
        va = order[a.priority]; vb = order[b.priority];
      } else if (sortBy === 'status') {
        const order: Record<string, number> = { 'To Do': 0, 'In Progress': 1, 'Review': 2, 'Done': 3 };
        va = order[a.status]; vb = order[b.status];
      } else if (sortBy === 'created') {
        va = a.id; vb = b.id;
      }
      const cmp = va < vb ? -1 : va > vb ? 1 : 0;
      return sortOrder === 'asc' ? cmp : -cmp;
    });
  }, [tasks, search, filterProject, filterStatus, sortBy, sortOrder]);

  const hasFilters = filterProject !== 'All' || filterStatus !== 'All';

  // Group for table view
  const groups = useMemo(() => {
    const map: Record<string, Task[]> = {};
    filtered.forEach(t => {
      const g = getDueGroup(t);
      if (!map[g]) map[g] = [];
      map[g].push(t);
    });
    return DUE_GROUP_ORDER.filter(g => map[g]?.length > 0).map(g => ({ group: g, tasks: map[g] }));
  }, [filtered]);

  return (
    <>
      {/* Edit panel */}
      {editingTask && (
        <SidePanel
          title="Edit Task"
          subtitle={editingTask.title}
          onClose={() => setEditingTask(null)}
          footer={
          <><div /><div className="flex gap-2">
            <button onClick={() => setEditingTask(null)} className="notion-button border border-border">Cancel</button>
            <button onClick={() => saveEdit(editingTask)} className="btn-primary">Save</button>
          </div></>
        }>
          <div className="px-6 py-5 space-y-4">
            <div><label className="block text-xs text-muted-foreground mb-1.5">Task Name</label>
              <input value={editingTask.title} onChange={e => setEditingTask(p => p && ({ ...p, title: e.target.value }))} className="modal-input" /></div>
            <div><label className="block text-xs text-muted-foreground mb-1.5">Project</label>
              <SelectDropdown value={editingTask.project} options={projects.map(p => p.name)} onChange={(v) => setEditingTask(p => p && ({ ...p, project: v }))} /></div>
            <div><label className="block text-xs text-muted-foreground mb-1.5">Priority</label>
              <div className="flex gap-2">{PRIORITIES.filter(p => p !== 'All').map(p => (
                <button key={p} onClick={() => setEditingTask(prev => prev && ({ ...prev, priority: p as Task['priority'] }))}
                  className={`flex-1 py-2 text-xs rounded-lg border transition-colors ${editingTask.priority === p ? 'border-foreground bg-muted font-medium' : 'border-border text-muted-foreground hover:bg-muted/30'}`}>{p}</button>
              ))}</div></div>
            <div><label className="block text-xs text-muted-foreground mb-1.5">Status</label>
              <div className="grid grid-cols-2 gap-2">{STATUSES.filter(s => s !== 'All').map(s => (
                <button key={s} onClick={() => setEditingTask(prev => prev && ({ ...prev, status: s as Task['status'] }))}
                  className={`py-2 text-xs rounded-lg border transition-colors ${editingTask.status === s ? 'border-foreground bg-muted font-medium' : 'border-border text-muted-foreground hover:bg-muted/30'}`}>{s}</button>
              ))}</div></div>
            <div><label className="block text-xs text-muted-foreground mb-1.5">Due Date</label>
              <DatePicker value={editingTask.dueDate ? format(editingTask.dueDate, 'd MMM yyyy') : ''} onChange={(v) => { const d = new Date(v); if (!isNaN(d.getTime())) setEditingTask(p => p && ({ ...p, dueDate: d, due: format(d, 'd MMM') })); }} /></div>
          </div>
        </SidePanel>
      )}

      {/* Add task panel */}
      {showAddPanel && (
        <SidePanel onClose={() => setShowAddPanel(false)} footer={
          <><div /><div className="flex gap-2">
            <button onClick={() => setShowAddPanel(false)} className="notion-button border border-border">Cancel</button>
            <button onClick={addTask} className="btn-primary">Add Task</button>
          </div></>
        }>
          <div className="px-6 py-5 space-y-4">
            <div><label className="block text-xs text-muted-foreground mb-1.5">Task Name *</label>
              <input value={newTask.title} onChange={e => setNewTask(p => ({ ...p, title: e.target.value }))} placeholder="e.g. Kitchen Layout Review" className="modal-input" /></div>
            <div><label className="block text-xs text-muted-foreground mb-1.5">Project</label>
              <SelectDropdown value={newTask.project} options={projects.map(p => p.name)} onChange={(v) => setNewTask(p => ({ ...p, project: v }))} /></div>
            <div><label className="block text-xs text-muted-foreground mb-1.5">Priority</label>
              <div className="flex gap-2">{PRIORITIES.filter(p => p !== 'All').map(p => (
                <button key={p} onClick={() => setNewTask(prev => ({ ...prev, priority: p as Task['priority'] }))}
                  className={`flex-1 py-2 text-xs rounded-lg border transition-colors ${newTask.priority === p ? 'border-foreground bg-muted font-medium' : 'border-border text-muted-foreground hover:bg-muted/30'}`}>{p}</button>
              ))}</div></div>
            <div><label className="block text-xs text-muted-foreground mb-1.5">Status</label>
              <div className="grid grid-cols-2 gap-2">{STATUSES.filter(s => s !== 'All').map(s => (
                <button key={s} onClick={() => setNewTask(prev => ({ ...prev, status: s as Task['status'] }))}
                  className={`py-2 text-xs rounded-lg border transition-colors ${newTask.status === s ? 'border-foreground bg-muted font-medium' : 'border-border text-muted-foreground hover:bg-muted/30'}`}>{s}</button>
              ))}</div></div>
            <div><label className="block text-xs text-muted-foreground mb-1.5">Due Date</label>
              <DatePicker value={newTask.due || ''} onChange={(v) => { const d = new Date(v); if (!isNaN(d.getTime())) setNewTask(p => ({ ...p, due: format(d, 'd MMM') })); }} /></div>
          </div>
        </SidePanel>
      )}

      <div className="space-y-5">
        <div>
          <h1 className="text-2xl font-semibold">Tasks</h1>
          <p className="text-muted-foreground text-sm mt-0.5">{tasks.filter(t => !t.completed).length} tasks remaining</p>
        </div>

        {/* Toolbar */}
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex-1" />

          <div className="relative">
            <Search size={16} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
            <input type="text" placeholder="Search tasks..." value={search} onChange={e => setSearch(e.target.value)}
              className="pl-8 pr-3 h-8 text-sm border border-border rounded-lg bg-background w-48 placeholder:text-muted-foreground outline-none focus:border-foreground/30 transition-colors" />
            {search && <button onClick={() => setSearch('')} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"><X size={14} /></button>}
          </div>

          {/* Filter */}
          <div className="relative">
            <button onClick={() => { setShowFilterMenu(!showFilterMenu); setShowSortMenu(false); }}
              className={`relative toolbar-icon-btn ${hasFilters ? 'toolbar-icon-btn-active' : ''}`}>
              <Filter size={18} />
            </button>
            {showFilterMenu && (
              <>
                <div className="fixed inset-0 z-20" onClick={() => setShowFilterMenu(false)} />
                <div className="absolute right-0 mt-1 w-64 bg-popover border border-border rounded-xl shadow-lg z-30 py-2 overflow-hidden">
                  <p className="px-3 py-1 text-xs font-medium text-muted-foreground uppercase tracking-wide">Project</p>
                  {projectNames.map(opt => <button key={opt} onClick={() => setFilterProject(opt)} className={`filter-item ${filterProject === opt ? 'filter-item-active' : 'filter-item-inactive'}`}>{opt}{filterProject === opt && <Check size={13} />}</button>)}
                  <div className="border-t border-border/40 my-1" />
                  <p className="px-3 py-1 text-xs font-medium text-muted-foreground uppercase tracking-wide">Status</p>
                  {STATUSES.map(opt => <button key={opt} onClick={() => setFilterStatus(opt)} className={`filter-item ${filterStatus === opt ? 'filter-item-active' : 'filter-item-inactive'}`}>{opt}{filterStatus === opt && <Check size={13} />}</button>)}
                  {hasFilters && <div className="border-t border-border/40 px-3 pt-2 pb-1"><button onClick={() => { setFilterProject('All'); setFilterStatus('All'); }} className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1.5"><X size={12} />Clear Filters</button></div>}
                </div>
              </>
            )}
          </div>

          {/* Sort */}
          <div className="relative">
            <button onClick={() => { setShowSortMenu(!showSortMenu); setShowFilterMenu(false); }}
              className="toolbar-icon-btn">
              <ArrowUpDown size={18} />
            </button>
            {showSortMenu && (
              <>
                <div className="fixed inset-0 z-20" onClick={() => setShowSortMenu(false)} />
                <div className="absolute right-0 mt-1 w-48 bg-popover border border-border rounded-xl shadow-lg z-30 py-2 overflow-hidden">
                  <p className="px-3 py-1 text-xs font-medium text-muted-foreground uppercase tracking-wide">Sort By</p>
                  {[{l:'Priority',v:'priority'},{l:'Status',v:'status'},{l:'Due Date',v:'due'},{l:'Created',v:'created'}].map(opt => (
                    <button key={opt.v} onClick={() => { setSortBy(opt.v); setShowSortMenu(false); }}
                      className={`filter-item ${sortBy === opt.v ? 'filter-item-active' : 'filter-item-inactive'}`}>{opt.l}{sortBy === opt.v && <Check size={13} />}</button>
                  ))}
                  <div className="border-t border-border/40 my-1" />
                  <button onClick={() => setSortOrder('asc')} className={`filter-item ${sortOrder === 'asc' ? 'filter-item-active' : 'filter-item-inactive'}`}>Ascending{sortOrder === 'asc' && <Check size={13} />}</button>
                  <button onClick={() => setSortOrder('desc')} className={`filter-item ${sortOrder === 'desc' ? 'filter-item-active' : 'filter-item-inactive'}`}>Descending{sortOrder === 'desc' && <Check size={13} />}</button>
                </div>
              </>
            )}
          </div>

          {/* View toggle */}
          <div className="flex border border-border rounded-lg overflow-hidden">
            <button onClick={() => setView('table')} className={`w-8 h-8 flex items-center justify-center transition-colors ${view === 'table' ? 'bg-muted text-foreground' : 'text-muted-foreground hover:bg-muted/50'}`}>
              <Rows3 size={16} />
            </button>
            <button onClick={() => setView('kanban')} className={`w-8 h-8 flex items-center justify-center border-l border-border transition-colors ${view === 'kanban' ? 'bg-muted text-foreground' : 'text-muted-foreground hover:bg-muted/50'}`}>
              <KanbanSquare size={16} />
            </button>
          </div>

          <button onClick={() => setShowAddPanel(true)} className="btn-primary">
            Add Task
          </button>
        </div>

        {/* Table View */}
        {view === 'table' && (
          <div>
            {groups.length === 0 && (
              <div className="text-center py-12 text-muted-foreground card-base">
                <ListChecks size={32} className="text-muted-foreground block mb-2 mx-auto" />
                <p className="text-sm">No tasks match your filters</p>
              </div>
            )}
            {groups.map(({ group, tasks: groupTasks }) => (
              <div key={group} className="mb-5">
                <div className="flex items-center gap-2 mb-2">
                  <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full ${DUE_GROUP_COLORS[group]}`}>{group}</span>
                  <span className="text-xs text-muted-foreground">{groupTasks.length}</span>
                </div>
                <div className="card-base overflow-hidden">
                  <table className="w-full table-fixed">
                    <colgroup>
                      <col className="w-10" />
                      <col className="w-1/5" />
                      <col className="w-1/5" />
                      <col className="w-1/5" />
                      <col className="w-1/5" />
                      <col className="w-1/5" />
                      <col className="w-16" />
                    </colgroup>
                    <thead>
                      <tr className="border-b border-border bg-muted/15">
                        <th className="px-3 py-2.5" />
                        <th className="table-header text-left">Task</th>
                        <th className="table-header text-left">Project</th>
                        <th className="table-header text-left">Priority</th>
                        <th className="table-header text-left">Status</th>
                        <th className="table-header text-left">Due</th>
                        <th className="w-16" />
                      </tr>
                    </thead>
                    <tbody>
                      {groupTasks.map(task => (
                        <tr key={task.id}
                          className="border-b border-border/40 last:border-b-0 hover:bg-muted/10 transition-colors"
                          onMouseEnter={() => setHoveredId(task.id)}
                          onMouseLeave={() => setHoveredId(null)}>
                          <td className="px-3 py-3">
                            <input type="checkbox" checked={task.completed} onChange={() => toggleComplete(task.id)}
                              className="w-4 h-4 rounded border-border cursor-pointer accent-foreground" />
                          </td>
                          <td className="table-cell overflow-hidden text-ellipsis whitespace-nowrap">
                            <span className={`font-medium ${task.completed ? 'line-through text-muted-foreground' : ''}`}>{task.title}</span>
                          </td>
                          <td className="table-cell text-muted-foreground text-sm overflow-hidden text-ellipsis whitespace-nowrap">{task.project}</td>
                          <td className="table-cell"><span className={`text-xs px-2 py-0.5 rounded-full font-medium ${PRIORITY_COLORS[task.priority]}`}>{task.priority}</span></td>
                          <td className="table-cell"><span className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_COLORS[task.status]}`}>{task.status}</span></td>
                          <td className="table-cell text-sm text-muted-foreground overflow-hidden text-ellipsis whitespace-nowrap">{task.due}</td>
                          <td className="px-3 py-2 text-right">
                            <button onClick={() => setEditingTask(task)}
                              className={`text-xs px-2 py-1 border border-border rounded-lg hover:bg-muted transition-all text-muted-foreground hover:text-foreground ${hoveredId === task.id ? 'opacity-100' : 'opacity-0'}`}>
                              Edit
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Kanban View */}
        {view === 'kanban' && (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {KANBAN_COLUMNS.map(col => {
              const colTasks = filtered.filter(t => t.status === col);
              return (
                <div key={col} className="flex flex-col gap-2">
                  <div className="flex items-center justify-between mb-1">
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${STATUS_COLORS[col]}`}>{col}</span>
                    <span className="text-xs text-muted-foreground">{colTasks.length}</span>
                  </div>
                  {colTasks.map(task => (
                    <div key={task.id} className="card-base card-hover p-3 group">
                      <div className="flex items-start gap-2">
                        <input type="checkbox" checked={task.completed} onChange={() => toggleComplete(task.id)}
                          className="w-3.5 h-3.5 rounded mt-0.5 border-border cursor-pointer accent-foreground flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className={`text-sm font-medium mb-1 leading-tight ${task.completed ? 'line-through text-muted-foreground' : ''}`}>{task.title}</p>
                          <p className="text-xs text-muted-foreground mb-2">{task.project}</p>
                          <div className="flex items-center justify-between">
                            <span className={`text-xs px-1.5 py-0.5 rounded-full font-medium ${PRIORITY_COLORS[task.priority]}`}>{task.priority}</span>
                            <span className={`text-xs px-1.5 py-0.5 rounded-full ${DUE_GROUP_COLORS[getDueGroup(task)]}`}>{task.due}</span>
                          </div>
                        </div>
                      </div>
                      <button onClick={() => setEditingTask(task)}
                        className="mt-2 w-full text-xs py-1 border border-border rounded-lg hover:bg-muted transition-colors text-muted-foreground hover:text-foreground opacity-0 group-hover:opacity-100">
                        Edit
                      </button>
                    </div>
                  ))}
                  {colTasks.length === 0 && (
                    <div className="border-2 border-dashed border-border rounded-xl h-16 flex items-center justify-center text-xs text-muted-foreground">No tasks</div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </>
  );
}
