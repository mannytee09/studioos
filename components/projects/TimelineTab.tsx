'use client';

import { useMemo } from 'react';
import { GanttView, GanttPhase, GanttMilestone } from '@/components/projects/GanttView';
import { Project } from '@/lib/projects-data';

interface TimelineTabProps {
  project: Project;
  customPhases: GanttPhase[];
  customMilestones: GanttMilestone[];
  onAddPhase: (p: GanttPhase) => void;
  onEditPhase: (p: GanttPhase) => void;
  onDeletePhase: (id: string) => void;
  onAddMilestone: (m: GanttMilestone) => void;
  onReorderPhases: (phases: GanttPhase[]) => void;
}

// Parse "Jan 2024" or "Dec 18, 2024" style date strings
function parseProjectDate(s: string): Date {
  const d = new Date(s);
  if (!isNaN(d.getTime())) return d;
  // Try "Month Year" format
  const parts = s.match(/(\w+)\s+(\d{4})/);
  if (parts) {
    const months: Record<string, number> = { Jan: 0, Feb: 1, Mar: 2, Apr: 3, May: 4, Jun: 5, Jul: 6, Aug: 7, Sep: 8, Oct: 9, Nov: 10, Dec: 11 };
    const m = months[parts[1]];
    if (m !== undefined) return new Date(Number(parts[2]), m, 1);
  }
  return new Date();
}

function toISO(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

export function TimelineTab({ project, customPhases, customMilestones, onAddPhase, onEditPhase, onDeletePhase, onAddMilestone, onReorderPhases }: TimelineTabProps) {
  // Phases on the Gantt chart are only those manually added by the user.
  // Project settings dates and currentPhase do NOT auto-create Gantt bars.
  const allPhases = useMemo(() => customPhases, [customPhases]);

  // Generate milestones from project timeline events
  const generatedMilestones = useMemo<GanttMilestone[]>(() => {
    return project.timeline
      .filter(e => e.type === 'meeting' || e.type === 'status')
      .slice(0, 4)
      .map((e, i) => ({
        id: `gen-m-${i}`,
        name: e.title,
        date: toISO(parseProjectDate(e.date)),
        assignedUsers: [project.team.leadDesigner || project.projectManager].filter(Boolean) as string[],
        status: 'Completed' as const,
        phaseId: undefined,
      }));
  }, [project]);

  const allMilestones = useMemo(() => {
    const map = new Map<string, GanttMilestone>();
    generatedMilestones.forEach(m => map.set(m.id, m));
    customMilestones.forEach(m => map.set(m.id, m));
    return Array.from(map.values());
  }, [generatedMilestones, customMilestones]);

  return (
    <GanttView
      projectName={project.name}
      projectStatus={project.status}
      currentPhase={project.currentPhase}
      phases={allPhases}
      milestones={allMilestones}
      onAddPhase={onAddPhase}
      onEditPhase={onEditPhase}
      onDeletePhase={onDeletePhase}
      onAddMilestone={onAddMilestone}
      onReorderPhases={onReorderPhases}
    />
  );
}
