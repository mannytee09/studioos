'use client';

import { useMemo, useState, useRef, useEffect, useCallback } from 'react';
import { SidePanel } from '@/components/ui/SidePanel';
import { DatePicker } from '@/components/ui/DatePicker';
import { ProjectStatus, PROJECT_PHASES } from '@/lib/projects-data';
import { ChevronDown, Plus } from 'lucide-react';

// ── Types ────────────────────────────────────────────────────────────────────

export interface GanttPhase {
  id: string;
  name: string;
  start: string; // ISO date YYYY-MM-DD
  end: string;
  progress: number; // 0–100
  taskCount: number;
  taskComplete: number;
}

export interface GanttMilestone {
  id: string;
  name: string;
  date: string;
  assignedUsers: string[];
  status: 'On Track' | 'At Risk' | 'Completed' | 'Delayed';
  phaseId?: string;
}

interface GanttViewProps {
  projectName: string;
  projectStatus: ProjectStatus;
  currentPhase: string;
  phases: GanttPhase[];
  milestones?: GanttMilestone[];
  onAddPhase?: (phase: GanttPhase) => void;
  onEditPhase?: (phase: GanttPhase) => void;
  onDeletePhase?: (id: string) => void;
  onAddMilestone?: (m: GanttMilestone) => void;
  onReorderPhases?: (phases: GanttPhase[]) => void;
}

// ── Constants ────────────────────────────────────────────────────────────────

type ZoomLevel = 'Day' | 'Week' | 'Month' | 'Quarter' | 'Year';
const ZOOM_LEVELS: ZoomLevel[] = ['Day', 'Week', 'Month', 'Quarter', 'Year'];
const MONTH_LABELS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

const LEFT_COL_W = 280;
const ROW1_H = 32;       // Project heading / Month YYYY
const ROW2_H = 28;       // Project name / Days
const ROW3_H = 44;       // Current phase header / spacer
const PHASE_ROW_H = 44;  // Each phase row
const ROW4_H = 44;       // Today button / Zoom dropdown
const BAR_H = 28;

// ── Date helpers ─────────────────────────────────────────────────────────────

function parseDate(s: string): Date {
  const [y, m, d] = s.split('-').map(Number);
  if (y && m && d) return new Date(y, m - 1, d);
  const fallback = new Date(s);
  return isNaN(fallback.getTime()) ? new Date() : fallback;
}

function toISO(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

function formatDayMonth(d: Date): string {
  return `${String(d.getDate()).padStart(2, '0')} ${MONTH_LABELS[d.getMonth()]}`;
}

function daysBetween(a: Date, b: Date): number {
  return Math.round((b.getTime() - a.getTime()) / 86400000);
}

function addDays(d: Date, n: number): Date {
  const r = new Date(d);
  r.setDate(r.getDate() + n);
  return r;
}

function startOfWeek(d: Date): Date {
  const r = new Date(d);
  r.setHours(0, 0, 0, 0);
  r.setDate(r.getDate() - r.getDay());
  return r;
}

function startOfMonth(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), 1);
}

function startOfQuarter(d: Date): Date {
  return new Date(d.getFullYear(), Math.floor(d.getMonth() / 3) * 3, 1);
}

function startOfYear(d: Date): Date {
  return new Date(d.getFullYear(), 0, 1);
}

// ── Zoom config ──────────────────────────────────────────────────────────────

interface ZoomConfig {
  unitWidth: number;
  unitLabel: (d: Date) => string;
  unitStep: (d: Date, n: number) => Date;
  groupLabel: (d: Date) => string;
}

const ZOOM_CONFIGS: Record<ZoomLevel, ZoomConfig> = {
  Day: {
    unitWidth: 40,
    unitLabel: (d) => String(d.getDate()),
    unitStep: (d, n) => addDays(d, n),
    groupLabel: (d) => `${MONTH_LABELS[d.getMonth()]} ${d.getFullYear()}`,
  },
  Week: {
    unitWidth: 70,
    unitLabel: (d) => `${d.getDate()}`,
    unitStep: (d, n) => addDays(d, n * 7),
    groupLabel: (d) => `${MONTH_LABELS[d.getMonth()]} ${d.getFullYear()}`,
  },
  Month: {
    unitWidth: 100,
    unitLabel: (d) => MONTH_LABELS[d.getMonth()],
    unitStep: (d, n) => new Date(d.getFullYear(), d.getMonth() + n, 1),
    groupLabel: (d) => String(d.getFullYear()),
  },
  Quarter: {
    unitWidth: 90,
    unitLabel: (d) => `Q${Math.floor(d.getMonth() / 3) + 1}`,
    unitStep: (d, n) => new Date(d.getFullYear(), d.getMonth() + n * 3, 1),
    groupLabel: (d) => String(d.getFullYear()),
  },
  Year: {
    unitWidth: 130,
    unitLabel: (d) => String(d.getFullYear()),
    unitStep: (d, n) => new Date(d.getFullYear() + n, 0, 1),
    groupLabel: () => 'Years',
  },
};

// ── Dropdown Select ──────────────────────────────────────────────────────────

function SelectDropdown({ value, options, onChange, placeholder }: {
  value: string;
  options: readonly string[];
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const h = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false); };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, []);
  return (
    <div className="relative" ref={ref}>
      <button onClick={() => setOpen(!open)} className="notion-button border border-border w-full justify-between text-sm">
        <span className={value ? '' : 'text-muted-foreground'}>{value || placeholder || 'Select...'}</span>
        <ChevronDown size={14} className="text-muted-foreground" />
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-20" onClick={() => setOpen(false)} />
          <div className="absolute left-0 right-0 mt-1 bg-popover border border-border rounded-xl shadow-lg z-50 py-1 overflow-hidden">
            {options.map((opt: string) => (
              <button
                key={opt}
                onClick={() => { onChange(opt); setOpen(false); }}
                className="flex items-center justify-between w-full px-4 py-2 text-sm text-left hover:bg-muted transition-colors whitespace-nowrap"
              >
                <span className={value === opt ? 'text-foreground font-medium' : 'text-muted-foreground'}>{opt}</span>
                {value === opt && <span className="w-1.5 h-1.5 rounded-full bg-foreground/50" />}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

function DateDropdown({ value, onChange, label }: {
  value: string;
  onChange: (iso: string) => void;
  label: string;
}) {
  const display = value
    ? parseDate(value).toLocaleDateString('en-AU', { day: 'numeric', month: 'short', year: 'numeric' })
    : '';
  const handleChange = (formatted: string) => {
    if (!formatted) { onChange(''); return; }
    const d = new Date(formatted);
    if (!isNaN(d.getTime())) onChange(toISO(d));
  };
  return <DatePicker value={display} onChange={handleChange} placeholder={label} />;
}

// ── Add / Edit Phase Panels ──────────────────────────────────────────────────

function AddPhasePanel({ onClose, onSave }: { onClose: () => void; onSave: (p: GanttPhase) => void }) {
  const [name, setName] = useState('');
  const [start, setStart] = useState('');
  const [end, setEnd] = useState('');
  const canSave = name.trim() && start && end && end >= start;

  return (
    <SidePanel
      subtitle="Define a new timeline phase"
      onClose={onClose}
      footer={
        <>
          <div />
          <div className="flex items-center gap-2">
            <button onClick={onClose} className="notion-button border border-border">Cancel</button>
            <button onClick={() => canSave && onSave({ id: `phase-${Date.now()}`, name: name.trim(), start, end, progress: 0, taskCount: 0, taskComplete: 0 })} disabled={!canSave} className="notion-button bg-foreground text-background hover:bg-foreground/90 disabled:opacity-40 disabled:cursor-not-allowed">
              Add Phase
            </button>
          </div>
        </>
      }
    >
      <div className="px-6 py-5 space-y-6">
        <div>
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3">Phase Details</p>
          <label className="block text-xs text-muted-foreground mb-1.5">Phase Name <span className="text-red-400 ml-0.5">*</span></label>
          <SelectDropdown value={name} options={PROJECT_PHASES} onChange={setName} placeholder="Select a phase" />
        </div>
        <div>
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3">Timeframe</p>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-muted-foreground mb-1.5">Start Date <span className="text-red-400 ml-0.5">*</span></label>
              <DateDropdown value={start} onChange={setStart} label="Start date" />
            </div>
            <div>
              <label className="block text-xs text-muted-foreground mb-1.5">End Date <span className="text-red-400 ml-0.5">*</span></label>
              <DateDropdown value={end} onChange={setEnd} label="End date" />
            </div>
          </div>
          {start && end && end < start && <p className="text-xs text-red-500 mt-1">End date must be after start date</p>}
          {start && end && end >= start && (
            <div className="p-3 bg-muted/30 rounded-lg mt-3">
              <p className="text-xs text-muted-foreground">Duration: <span className="text-foreground font-medium">{daysBetween(parseDate(start), parseDate(end))} days</span></p>
            </div>
          )}
        </div>
      </div>
    </SidePanel>
  );
}

function EditPhasePanel({ phase, onClose, onSave }: { phase: GanttPhase; onClose: () => void; onSave: (p: GanttPhase) => void }) {
  const [name, setName] = useState(phase.name);
  const [start, setStart] = useState(phase.start);
  const [end, setEnd] = useState(phase.end);
  const canSave = name.trim() && start && end && end >= start;

  return (
    <SidePanel
      subtitle={phase.name}
      onClose={onClose}
      footer={
        <>
          <div />
          <div className="flex items-center gap-2">
            <button onClick={onClose} className="notion-button border border-border">Cancel</button>
            <button onClick={() => canSave && onSave({ ...phase, name: name.trim(), start, end })} disabled={!canSave} className="notion-button bg-foreground text-background hover:bg-foreground/90 disabled:opacity-40 disabled:cursor-not-allowed">
              Save Changes
            </button>
          </div>
        </>
      }
    >
      <div className="px-6 py-5 space-y-6">
        <div>
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3">Phase Details</p>
          <label className="block text-xs text-muted-foreground mb-1.5">Phase Name <span className="text-red-400 ml-0.5">*</span></label>
          <SelectDropdown value={name} options={PROJECT_PHASES} onChange={setName} />
        </div>
        <div>
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3">Timeframe</p>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-muted-foreground mb-1.5">Start Date <span className="text-red-400 ml-0.5">*</span></label>
              <DateDropdown value={start} onChange={setStart} label="Start date" />
            </div>
            <div>
              <label className="block text-xs text-muted-foreground mb-1.5">End Date <span className="text-red-400 ml-0.5">*</span></label>
              <DateDropdown value={end} onChange={setEnd} label="End date" />
            </div>
          </div>
          {start && end && end >= start && (
            <div className="p-3 bg-muted/30 rounded-lg mt-3">
              <p className="text-xs text-muted-foreground">Duration: <span className="text-foreground font-medium">{daysBetween(parseDate(start), parseDate(end))} days</span></p>
            </div>
          )}
        </div>
      </div>
    </SidePanel>
  );
}

// ── Zoom Selector (opens upward to avoid overflow) ───────────────────────────

function ZoomSelector({ value, onChange }: { value: ZoomLevel; onChange: (v: ZoomLevel) => void }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const h = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false); };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, []);
  return (
    <div className="relative" ref={ref}>
      <button onClick={() => setOpen(!open)} className="notion-button border border-border text-sm w-32 justify-between">
        <span>{value}</span>
        <ChevronDown size={14} className="text-muted-foreground" />
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-20" onClick={() => setOpen(false)} />
          <div className="absolute bottom-full mb-1 right-0 bg-popover border border-border rounded-xl shadow-lg z-50 py-1 overflow-hidden">
            {ZOOM_LEVELS.map(level => (
              <button
                key={level}
                onClick={() => { onChange(level); setOpen(false); }}
                className="flex items-center justify-between w-full px-4 py-2 text-sm text-left hover:bg-muted transition-colors whitespace-nowrap min-w-[8rem]"
              >
                <span className={value === level ? 'text-foreground font-medium' : 'text-muted-foreground'}>{level}</span>
                {value === level && <span className="w-1.5 h-1.5 rounded-full bg-foreground/50" />}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

// ── Main GanttView ───────────────────────────────────────────────────────────

export function GanttView({
  projectName,
  projectStatus: _projectStatus,
  currentPhase,
  phases,
  milestones: _milestones = [],
  onAddPhase,
  onEditPhase,
  onDeletePhase,
  onReorderPhases,
}: GanttViewProps) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const [zoom, setZoom] = useState<ZoomLevel>('Week');
  const [showAddPanel, setShowAddPanel] = useState(false);
  const [editingPhase, setEditingPhase] = useState<GanttPhase | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Drag-and-drop reorder state
  const [draggedId, setDraggedId] = useState<string | null>(null);
  const [dragOverId, setDragOverId] = useState<string | null>(null);

  const config = ZOOM_CONFIGS[zoom];

  // Timeline bounds — always include today so the Today button works
  const { timelineStart, timelineEnd } = useMemo(() => {
    let minD = today;
    let maxD = addDays(today, 30);

    if (phases.length > 0) {
      minD = parseDate(phases[0].start);
      maxD = parseDate(phases[0].end);
      phases.forEach(p => {
        const s = parseDate(p.start);
        const e = parseDate(p.end);
        if (s < minD) minD = s;
        if (e > maxD) maxD = e;
      });
      // Always include today in the range
      if (today < minD) minD = new Date(today);
      if (today > maxD) maxD = new Date(today);
    }

    // Always extend timeline to Dec 31 of next year
    const nextYearEnd = new Date(today.getFullYear() + 1, 11, 31);
    if (nextYearEnd > maxD) maxD = nextYearEnd;

    let alignedStart: Date;
    let alignedEnd: Date;
    if (zoom === 'Day') { alignedStart = addDays(minD, -7); alignedEnd = addDays(maxD, 14); }
    else if (zoom === 'Week') { alignedStart = addDays(startOfWeek(minD), -14); alignedEnd = addDays(startOfWeek(maxD), 28); }
    else if (zoom === 'Month') { alignedStart = addDays(startOfMonth(minD), -31); alignedEnd = addDays(startOfMonth(maxD), 62); }
    else if (zoom === 'Quarter') { alignedStart = startOfQuarter(addDays(minD, -45)); alignedEnd = addDays(startOfQuarter(maxD), 180); }
    else { alignedStart = startOfYear(addDays(minD, -90)); alignedEnd = addDays(startOfYear(maxD), 365); }

    return { timelineStart: alignedStart, timelineEnd: alignedEnd };
  }, [phases, zoom, today]);

  // Generate unit columns and group spans
  const { units, groups, calendarW } = useMemo(() => {
    const unitArr: { date: Date; label: string; isMonthStart: boolean; isWeekend: boolean }[] = [];
    let cur = new Date(timelineStart);
    let guard = 0;
    while (cur < timelineEnd && guard < 5000) {
      const prev = guard > 0 ? unitArr[guard - 1].date : null;
      unitArr.push({
        date: new Date(cur),
        label: config.unitLabel(cur),
        isMonthStart: !prev || prev.getMonth() !== cur.getMonth(),
        isWeekend: zoom === 'Day' && (cur.getDay() === 0 || cur.getDay() === 6),
      });
      cur = config.unitStep(cur, 1);
      guard++;
    }

    const groupArr: { label: string; width: number }[] = [];
    let i = 0;
    while (i < unitArr.length) {
      const gLabel = config.groupLabel(unitArr[i].date);
      let w = 0;
      let count = 0;
      while (i + count < unitArr.length && config.groupLabel(unitArr[i + count].date) === gLabel) {
        w += config.unitWidth;
        count++;
      }
      groupArr.push({ label: gLabel, width: w });
      i += count;
    }

    return { units: unitArr, groups: groupArr, calendarW: unitArr.length * config.unitWidth };
  }, [timelineStart, timelineEnd, config, zoom]);

  const totalDays = daysBetween(timelineStart, timelineEnd);
  const dayWidth = calendarW / Math.max(totalDays, 1);

  // Today position
  const todayOffsetDays = daysBetween(timelineStart, today);
  const todayX = todayOffsetDays * dayWidth;
  const todayVisible = todayOffsetDays >= 0 && todayOffsetDays <= totalDays;

  // Scroll to today — scrolls the timeline so today is centered
  const scrollToToday = useCallback(() => {
    const container = scrollRef.current;
    if (!container) return;
    const targetX = todayX - container.clientWidth / 2;
    container.scrollTo({ left: Math.max(0, targetX), behavior: 'smooth' });
  }, [todayX]);

  // No auto-scroll — start at project start date

  // Bars area height — grows with phases
  const barsAreaH = ROW3_H + Math.max(phases.length, 1) * PHASE_ROW_H;

  return (
    <>
      {showAddPanel && <AddPhasePanel onClose={() => setShowAddPanel(false)} onSave={(p) => { onAddPhase?.(p); setShowAddPanel(false); }} />}
      {editingPhase && <EditPhasePanel phase={editingPhase} onClose={() => setEditingPhase(null)} onSave={(p) => { onEditPhase?.(p); setEditingPhase(null); }} />}

      <div className="card-base overflow-hidden flex w-full flex-col" style={{ maxHeight: 'calc(100vh - 140px)' }}>
        <div className="flex">
          {/* ════════ COLUMN 1 — LEFT SIDEBAR ════════ */}
          <div className="flex flex-col flex-shrink-0 border-r border-border bg-card" style={{ width: LEFT_COL_W }}>
            {/* Row 1: Project heading */}
            <div className="flex items-center px-4 border-b border-border bg-muted/20" style={{ height: ROW1_H }}>
              <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Project</span>
            </div>

            {/* Row 2: Project name only (no status text) */}
            <div className="flex items-center px-4 border-b border-border" style={{ height: ROW2_H }}>
              <span className="text-sm font-semibold truncate">{projectName}</span>
            </div>

            {/* Row 3: Current phase + Add New Phase text button */}
            <div className="flex items-center justify-between gap-2 px-4 bg-card border-b border-border" style={{ height: ROW3_H }}>
              <div className="min-w-0">
                <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Current Phase</p>
                <p className="text-sm font-medium truncate">{currentPhase || '—'}</p>
              </div>
            </div>

            {/* Phase rows — each aligns with a bar row in Column 2. Draggable to reorder. */}
            {phases.map((phase) => {
              const isCurrent = phase.name === currentPhase;
              const isDragging = draggedId === phase.id;
              const isDragOver = dragOverId === phase.id && draggedId !== phase.id;
              return (
                <div
                  key={phase.id}
                  draggable
                  onDragStart={(e) => {
                    setDraggedId(phase.id);
                    e.dataTransfer.effectAllowed = 'move';
                    e.dataTransfer.setData('text/plain', phase.id);
                  }}
                  onDragEnd={() => { setDraggedId(null); setDragOverId(null); }}
                  onDragOver={(e) => {
                    e.preventDefault();
                    if (draggedId && draggedId !== phase.id) setDragOverId(phase.id);
                  }}
                  onDragLeave={() => setDragOverId(prev => prev === phase.id ? null : prev)}
                  onDrop={(e) => {
                    e.preventDefault();
                    if (!draggedId || draggedId === phase.id) return;
                    const fromIdx = phases.findIndex(p => p.id === draggedId);
                    const toIdx = phases.findIndex(p => p.id === phase.id);
                    if (fromIdx < 0 || toIdx < 0) return;
                    const reordered = [...phases];
                    const [moved] = reordered.splice(fromIdx, 1);
                    reordered.splice(toIdx, 0, moved);
                    onReorderPhases?.(reordered);
                    setDraggedId(null);
                    setDragOverId(null);
                  }}
                  className={`flex items-center gap-2.5 w-full px-4 transition-colors text-left border-b border-border/20 ${isCurrent ? 'bg-muted/40' : 'hover:bg-muted/20'} ${isDragging ? 'opacity-40' : ''} ${isDragOver ? 'border-t-2 border-t-foreground' : ''}`}
                  style={{ height: PHASE_ROW_H, cursor: isDragging ? 'grabbing' : 'grab' }}
                >
                  <button
                    onClick={() => setEditingPhase(phase)}
                    className="min-w-0 flex-1 text-left"
                  >
                    <p className="text-xs font-medium truncate">{phase.name}</p>
                    <p className="text-[10px] text-muted-foreground truncate">
                      {phase.taskComplete}/{phase.taskCount} tasks · {phase.progress}%
                    </p>
                  </button>
                </div>
              );
            })}

            {/* Add New Phase — text-only button, no border */}
            <button
              onClick={() => setShowAddPanel(true)}
              className="flex items-center gap-1.5 px-4 text-xs text-muted-foreground hover:text-foreground transition-colors text-left"
              style={{ height: PHASE_ROW_H }}
            >
              <Plus size={14} />
              Add New Phase
            </button>

          </div>

          {/* ════════ COLUMN 2 — TIMELINE ════════ */}
          <div className="flex flex-col overflow-hidden" style={{ width: `calc(100% - ${LEFT_COL_W}px)` }}>
            {/* Scrollable timeline area — horizontal scroll only */}
            <div ref={scrollRef} className="overflow-x-auto overflow-y-hidden gantt-scroll">
              <div style={{ width: calendarW }} className="relative">

                {/* Row 1: Month YYYY (group header) */}
                <div className="flex bg-muted/20 border-b border-border" style={{ height: ROW1_H }}>
                  {groups.map((g, i) => (
                    <div key={i} className="text-xs font-medium text-muted-foreground flex items-center px-2 border-r border-border/25" style={{ width: g.width }}>
                      {g.label}
                    </div>
                  ))}
                </div>

                {/* Row 2: Days (unit header) */}
                <div className="flex bg-card border-b border-border" style={{ height: ROW2_H }}>
                  {units.map((u, i) => (
                    <div
                      key={i}
                      className={`text-[10px] text-center flex items-center justify-center border-r border-border/20 ${u.isMonthStart ? 'font-semibold text-foreground/60' : 'text-muted-foreground'} ${u.isWeekend ? 'bg-muted/20' : ''}`}
                      style={{ width: config.unitWidth }}
                    >
                      {u.label}
                    </div>
                  ))}
                </div>

                {/* Row 3 + Phase rows: Bars area */}
                <div className="relative" style={{ height: barsAreaH }}>
                  {/* Background strips + weekend shading */}
                  {units.map((u, i) => (
                    <div
                      key={i}
                      className={`absolute top-0 bottom-0 ${i % 2 === 0 ? 'bg-muted/[0.04]' : ''} ${u.isWeekend ? 'bg-muted/[0.08]' : ''} ${u.isMonthStart ? 'border-l border-border/10' : ''}`}
                      style={{ left: i * config.unitWidth, width: config.unitWidth }}
                    />
                  ))}

                  {/* Today indicator line */}
                  {todayVisible && (
                    <div className="absolute top-0 bottom-0 z-10 pointer-events-none" style={{ left: todayX }}>
                      <div className="w-px h-full bg-foreground/40" />
                    </div>
                  )}

                  {/* Phase bars — centered in each row */}
                  {phases.map((phase, i) => {
                    const startOff = daysBetween(timelineStart, parseDate(phase.start));
                    const endOff = daysBetween(timelineStart, parseDate(phase.end));
                    const barLeft = Math.max(0, startOff) * dayWidth;
                    const barWidth = Math.max((Math.min(totalDays, endOff + 1) - Math.max(0, startOff)) * dayWidth, 24);
                    // Center bar vertically in its row (row starts after ROW3_H spacer)
                    const barTop = ROW3_H + i * PHASE_ROW_H + (PHASE_ROW_H - BAR_H) / 2;

                    return (
                      <div
                        key={phase.id}
                        className="absolute rounded-lg overflow-hidden cursor-pointer bg-muted hover:bg-muted-foreground/30 transition-colors"
                        style={{ left: barLeft, width: barWidth, top: barTop, height: BAR_H }}
                        onClick={() => setEditingPhase(phase)}
                        title={`${phase.name} — ${parseDate(phase.start).toLocaleDateString('en-AU')} to ${parseDate(phase.end).toLocaleDateString('en-AU')}`}
                      >
                        {/* Label */}
                        {barWidth > 60 && (
                          <span className="absolute inset-0 flex items-center px-2.5 text-[11px] font-medium truncate text-foreground/70 group-hover:text-foreground">
                            {phase.name}
                          </span>
                        )}
                        {/* Date range — DD Mon - DD Mon */}
                        {barWidth > 140 && (
                          <span className="absolute inset-y-0 right-2 flex items-center text-[10px] text-foreground/40 whitespace-nowrap">
                            {formatDayMonth(parseDate(phase.start))} - {formatDayMonth(parseDate(phase.end))}
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* Row 4 spacer (matches zoom row height) */}
                <div style={{ height: ROW4_H }} />
              </div>
            </div>

            {/* Row 4: Today button + Zoom dropdown (right-aligned, order: Today then Week/Month) */}
            <div className="flex items-center justify-end gap-2 px-4 bg-card flex-shrink-0" style={{ height: ROW4_H }}>
              <button
                onClick={scrollToToday}
                className="notion-button border border-border text-sm"
              >
                Today
              </button>
              <ZoomSelector value={zoom} onChange={setZoom} />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
