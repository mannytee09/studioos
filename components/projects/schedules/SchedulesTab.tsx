'use client';

import { useState } from 'react';
import {
  Schedule, SCHEDULE_TEMPLATES, createEmptySection,
} from '@/lib/schedules-data';
import { ScheduleBuilder } from './ScheduleBuilder';
import { SidePanel } from '@/components/ui/SidePanel';
import { Search, ArrowUpDown, Check, Plus, Table, ArrowRight } from 'lucide-react';

interface SchedulesTabProps {
  projectId: string;
}

function useLocalSchedules(projectId: string) {
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const create = (name: string) => {
    const s: Schedule = {
      id: `sched-${Date.now()}`,
      projectId,
      name,
      sections: [{ ...createEmptySection(0), name: 'General' }],
      createdAt: new Date().toLocaleDateString('en-AU', { day: 'numeric', month: 'short', year: 'numeric' }),
      updatedAt: new Date().toLocaleDateString('en-AU', { day: 'numeric', month: 'short', year: 'numeric' }),
    };
    setSchedules(prev => [...prev, s]);
    return s;
  };
  const update = (updated: Schedule) => setSchedules(prev => prev.map(s => s.id === updated.id ? updated : s));
  return { schedules, create, update };
}

export function SchedulesTab({ projectId }: SchedulesTabProps) {
  const { schedules, create, update } = useLocalSchedules(projectId);
  const [activeScheduleId, setActiveScheduleId] = useState<string | null>(null);
  const [showNewPanel, setShowNewPanel] = useState(false);
  const [newName, setNewName] = useState('');
  const [newType, setNewType] = useState(SCHEDULE_TEMPLATES[0]);
  const [searchQuery, setSearchQuery] = useState('');
  const [showSortMenu, setShowSortMenu] = useState(false);
  const [sortBy, setSortBy] = useState<'none' | 'name' | 'date' | 'type'>('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  const activeSchedule = schedules.find(s => s.id === activeScheduleId);

  const SCHEDULE_SORT_OPTIONS = [
    { label: 'Name', value: 'name' as const },
    { label: 'Date', value: 'date' as const },
    { label: 'Type', value: 'type' as const },
  ];

  const handleCreate = () => {
    const s = create(newName || newType);
    setActiveScheduleId(s.id);
    setShowNewPanel(false);
    setNewName('');
  };

  // ── Builder view ──────────────────────────────────────────────────────────
  if (activeSchedule) {
    return (
      <ScheduleBuilder
        schedule={activeSchedule}
        onChange={update}
        onBack={() => setActiveScheduleId(null)}
        onNewSchedule={() => setShowNewPanel(true)}
      />
    );
  }

  // ── All Schedules landing page ────────────────────────────────────────────

  const filtered = schedules.filter(s =>
    !searchQuery || s.name.toLowerCase().includes(searchQuery.toLowerCase())
  ).sort((a, b) => {
    if (sortBy === 'none') return 0;
    let cmp = 0;
    if (sortBy === 'name') cmp = a.name.localeCompare(b.name);
    else if (sortBy === 'date') cmp = (a.updatedAt || '').localeCompare(b.updatedAt || '');
    else if (sortBy === 'type') cmp = a.name.localeCompare(b.name);
    return sortOrder === 'asc' ? cmp : -cmp;
  });

  return (
    <>
      {showNewPanel && (
        <SidePanel
          onClose={() => setShowNewPanel(false)}
          footer={
            <>
              <div />
              <div className="flex items-center gap-2">
                <button onClick={() => setShowNewPanel(false)} className="notion-button border border-border">Cancel</button>
                <button
                  onClick={handleCreate}
                  className="notion-button bg-foreground text-background hover:bg-foreground/90"
                >
                  Create Schedule
                </button>
              </div>
            </>
          }
        >
          <div className="px-6 py-5 space-y-5">
            <div>
              <label className="block text-xs text-muted-foreground mb-1.5">Schedule Name</label>
              <input
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder={newType || 'e.g. Furniture Schedule'}
                className="modal-input"
              />
              <p className="text-xs text-muted-foreground mt-1.5">Leave blank to use the selected type as the name.</p>
            </div>
            <div>
              <label className="block text-xs text-muted-foreground mb-1.5">Schedule Type</label>
              <div className="grid grid-cols-2 gap-2">
                {[...SCHEDULE_TEMPLATES, 'Custom Schedule'].map(t => (
                  <button
                    key={t}
                    onClick={() => setNewType(t)}
                    className={`flex items-center gap-2 px-3 py-2.5 text-sm border rounded-xl transition-colors text-left ${
                      newType === t
                        ? 'border-foreground bg-muted text-foreground font-medium'
                        : 'border-border text-muted-foreground hover:border-muted-foreground/40 hover:text-foreground'
                    }`}
                  >
                    <Table size={16} className="flex-shrink-0" />
                    {t}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </SidePanel>
      )}

      {/* Toolbar — left: All tab, right: search/sort/new */}
      <div className="flex items-center gap-2">
        {/* Left: "All" tab */}
        <div className="flex border border-border rounded-lg overflow-hidden">
          <button className="h-8 px-3 text-sm view-toggle-active">
            All
          </button>
        </div>

        <div className="flex-1" />

        {/* Search */}
        <div className="relative flex-shrink-0">
          <Search size={16} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
          <input
            type="text"
            placeholder="Search schedules..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-8 pr-3 h-8 text-sm border border-border rounded-lg bg-background w-48 placeholder:text-muted-foreground outline-none focus:border-foreground/30 transition-colors"
          />
        </div>

        {/* Sort icon-only */}
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
              <div className="absolute right-0 mt-1 w-48 bg-popover border border-border rounded-xl shadow-lg z-30 py-2 overflow-hidden">
                <p className="px-3 py-1 text-xs font-medium text-muted-foreground uppercase tracking-wide">Sort By</p>
                {SCHEDULE_SORT_OPTIONS.map(opt => (
                  <button
                    key={opt.value}
                    onClick={() => { setSortBy(opt.value); setShowSortMenu(false); }}
                    className={`filter-item ${sortBy === opt.value ? 'filter-item-active' : 'filter-item-inactive'}`}
                  >
                    {opt.label}
                    {sortBy === opt.value && <Check size={13} />}
                  </button>
                ))}
                <div className="border-t border-border/40 my-1" />
                <button
                  onClick={() => { setSortOrder('asc'); setShowSortMenu(false); }}
                  className={`filter-item ${sortOrder === 'asc' ? 'filter-item-active' : 'filter-item-inactive'}`}
                >
                  Ascending
                  {sortOrder === 'asc' && <Check size={13} />}
                </button>
                <button
                  onClick={() => { setSortOrder('desc'); setShowSortMenu(false); }}
                  className={`filter-item ${sortOrder === 'desc' ? 'filter-item-active' : 'filter-item-inactive'}`}
                >
                  Descending
                  {sortOrder === 'desc' && <Check size={13} />}
                </button>
              </div>
            </>
          )}
        </div>

        {/* New Schedule */}
        <button
          onClick={() => setShowNewPanel(true)}
          className="flex items-center gap-1.5 h-8 px-3 text-sm bg-foreground text-background rounded-lg hover:bg-foreground/90 transition-colors font-medium"
        >
          <Plus size={16} />
          New Schedule
        </button>
      </div>

      {/* Content */}
      <div className="space-y-4">
        {schedules.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center mb-4">
              <Table size={30} className="text-muted-foreground" />
            </div>
            <h3 className="font-medium mb-1">No schedules yet</h3>
            <p className="text-sm text-muted-foreground mb-6 max-w-sm">
              Create your first FF&E schedule to start tracking products, specifications and procurement.
            </p>
            <button
              onClick={() => setShowNewPanel(true)}
              className="flex items-center gap-2 px-4 py-2 bg-foreground text-background rounded-lg hover:bg-foreground/90 transition-colors font-medium text-sm"
            >
              <Plus size={18} />
              New Schedule
            </button>
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <p className="text-sm">No schedules match your search</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map(schedule => {
              const products = schedule.sections.flatMap(s => s.products);
              const approved = products.filter(p => p.status === 'Approved').length;
              const pending = products.filter(p => p.status === 'Pending Approval').length;
              const totalCost = products.reduce((s, p) =>
                s + parseFloat(p.unitCost || '0') * parseFloat(p.quantity || '1'), 0);

              return (
                <div
                  key={schedule.id}
                  onClick={() => setActiveScheduleId(schedule.id)}
                  className="group bg-card border border-border rounded-xl p-4 hover:border-muted-foreground/30 hover:shadow-sm cursor-pointer transition-all"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center flex-shrink-0">
                        <Table size={20} className="text-muted-foreground" />
                      </div>
                      <div>
                        <h3 className="font-medium text-sm">{schedule.name}</h3>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {products.length} product{products.length !== 1 ? 's' : ''} · {schedule.sections.length} section{schedule.sections.length !== 1 ? 's' : ''}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 mb-3">
                    {approved > 0 && (
                      <span className="flex items-center gap-1 text-xs text-green-700 bg-green-50 dark:bg-green-900/20 dark:text-green-400 px-2 py-0.5 rounded-full">
                        <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
                        {approved} approved
                      </span>
                    )}
                    {pending > 0 && (
                      <span className="flex items-center gap-1 text-xs text-amber-700 bg-amber-50 dark:bg-amber-900/20 dark:text-amber-400 px-2 py-0.5 rounded-full">
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                        {pending} pending
                      </span>
                    )}
                    {products.length === 0 && (
                      <span className="text-xs text-muted-foreground">No products yet</span>
                    )}
                  </div>

                  <div className="pt-3 border-t border-border/50 flex items-center justify-between text-xs text-muted-foreground">
                    <span>
                      {totalCost > 0 ? `A$${totalCost.toLocaleString('en-AU', { minimumFractionDigits: 2 })}` : 'No cost data'}
                    </span>
                    <span className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">
                      Open
                      <ArrowRight size={14} />
                    </span>
                  </div>
                </div>
              );
            })}
            <button
              onClick={() => setShowNewPanel(true)}
              className="border-2 border-dashed border-border rounded-xl h-32 flex flex-col items-center justify-center gap-2 text-muted-foreground hover:border-muted-foreground/40 hover:text-foreground hover:bg-muted/10 transition-all"
            >
              <Plus size={22} />
              <span className="text-sm">New Schedule</span>
            </button>
          </div>
        )}
      </div>
    </>
  );
}
