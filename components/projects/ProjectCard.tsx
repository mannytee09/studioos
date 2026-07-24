'use client';

import { useState, useRef, useEffect } from 'react';
import { Ellipsis as MoreHorizontal, Settings, Copy, Archive, Trash2 } from 'lucide-react';
import { Project, formatBudget } from '@/lib/projects-data';
import { ProjectStatusBadge } from './ProjectStatusBadge';
import { mockClients } from '@/lib/crm-data';

interface ProjectCardProps {
  project: Project;
  onEdit?: (project: Project) => void;
  onDuplicate?: (project: Project) => void;
  onArchive?: (project: Project) => void;
  onDelete?: (project: Project) => void;
}

export function ProjectCard({ project, onEdit, onDuplicate, onArchive, onDelete }: ProjectCardProps) {
  const client = mockClients.find((c) => c.id === project.clientId);
  const isArchived = project.status === 'Archived';
  const [showMenu, setShowMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setShowMenu(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const stop = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const run = (fn?: (p: Project) => void) => (e: React.MouseEvent) => {
    stop(e);
    setShowMenu(false);
    fn?.(project);
  };

  return (
    <div className={`project-card p-4 group ${isArchived ? 'opacity-70' : ''}`}>
      <div className="flex items-start justify-between gap-2 mb-3">
        <div className="min-w-0 flex-1">
          <a href={`/projects/${project.id}`} className="block">
            <p className="font-medium text-sm truncate hover:text-foreground/80 transition-colors">{project.name}</p>
            <p className="text-xs text-muted-foreground truncate">{client?.primaryContact || 'Unknown Client'}</p>
          </a>
        </div>
        <div className="flex items-center gap-1.5 flex-shrink-0">
          {isArchived ? (
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-muted text-muted-foreground font-medium">Archived</span>
          ) : (
            <ProjectStatusBadge status={project.status} />
          )}
          {/* 3-dot menu — always visible */}
          <div className="relative" ref={menuRef}>
            <button
              onClick={(e) => { stop(e); setShowMenu(!showMenu); }}
              className="w-7 h-7 rounded-lg flex items-center justify-center hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
            >
              <MoreHorizontal size={16} />
            </button>
            {showMenu && (
              <>
                <div className="fixed inset-0 z-20" onClick={(e) => { stop(e); setShowMenu(false); }} />
                <div className="absolute right-0 top-8 w-44 bg-popover border border-border rounded-xl shadow-lg z-50 py-1 overflow-hidden">
                  <button onClick={run(onEdit)} className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-left hover:bg-muted transition-colors text-foreground">
                    <Settings size={15} className="text-muted-foreground" />
                    Project settings
                  </button>
                  <button onClick={run(onDuplicate)} className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-left hover:bg-muted transition-colors text-foreground">
                    <Copy size={15} className="text-muted-foreground" />
                    Duplicate
                  </button>
                  {!isArchived && (
                    <button onClick={run(onArchive)} className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-left hover:bg-muted transition-colors text-foreground">
                      <Archive size={15} className="text-muted-foreground" />
                      Archive
                    </button>
                  )}
                  <button onClick={run(onDelete)} className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-left hover:bg-red-50 transition-colors text-red-600">
                    <Trash2 size={15} />
                    Delete
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      <a href={`/projects/${project.id}`} className="block">
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground">Phase</span>
            <span className="text-foreground">{project.currentPhase}</span>
          </div>
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground">Manager</span>
            <span className="text-foreground">{project.projectManager}</span>
          </div>
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground">Budget</span>
            <span className="text-foreground font-medium">{formatBudget(project.estimatedBudget)}</span>
          </div>
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground">Target</span>
            <span className="text-foreground">{project.targetCompletion}</span>
          </div>
        </div>

        <div className="mt-4">
          <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all"
              style={{ width: `${project.progress}%`, background: 'rgba(51,51,51,0.35)' }}
            />
          </div>
          <div className="flex justify-between items-center mt-1.5">
            <span className="text-xs text-muted-foreground">{project.progress}% complete</span>
          </div>
        </div>
      </a>
    </div>
  );
}
