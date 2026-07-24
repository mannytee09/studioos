'use client';

import { createContext, useContext, useState, ReactNode, useCallback } from 'react';
import { mockProjects, Project, ProjectPhase, Note } from './projects-data';
import { PROJECT_PHASES } from './projects-data';

interface ProjectsContextValue {
  projects: Project[];
  updateProject: (id: string, updates: Partial<Project>) => void;
  addProject: (project: Project) => void;
  togglePin: (id: string) => void;
  setPhaseProgress: (id: string, progress: number) => void;
  changePhase: (id: string, phase: ProjectPhase) => void;
  archiveProject: (id: string) => void;
  unarchiveProject: (id: string) => void;
  deleteProject: (id: string) => void;
  duplicateProject: (id: string) => string | null;
}

const ProjectsContext = createContext<ProjectsContextValue>({
  projects: mockProjects,
  updateProject: () => {},
  addProject: () => {},
  togglePin: () => {},
  setPhaseProgress: () => {},
  changePhase: () => {},
  archiveProject: () => {},
  unarchiveProject: () => {},
  deleteProject: () => {},
  duplicateProject: () => null,
});

export function ProjectsProvider({ children }: { children: ReactNode }) {
  const [projects, setProjects] = useState<Project[]>(mockProjects);

  const updateProject = useCallback((id: string, updates: Partial<Project>) => {
    setProjects((prev) => prev.map((p) =>
      p.id === id
        ? { ...p, ...updates, updatedAt: new Date().toLocaleDateString('en-AU', { day: 'numeric', month: 'short', year: 'numeric' }) }
        : p
    ));
  }, []);

  const addProject = useCallback((project: Project) => {
    setProjects((prev) => [project, ...prev]);
  }, []);

  const togglePin = useCallback((id: string) => {
    setProjects((prev) => prev.map((p) => (p.id === id ? { ...p, pinned: !p.pinned } : p)));
  }, []);

  const setPhaseProgress = useCallback((id: string, progress: number) => {
    setProjects((prev) => prev.map((p) => (p.id === id ? { ...p, phaseProgress: progress } : p)));
  }, []);

  const changePhase = useCallback((id: string, phase: ProjectPhase) => {
    const idx = PROJECT_PHASES.indexOf(phase);
    const newProgress = Math.round(((idx + 1) / PROJECT_PHASES.length) * 100);
    setProjects((prev) => prev.map((p) =>
      p.id === id ? { ...p, currentPhase: phase, progress: newProgress, phaseProgress: 0 } : p
    ));
  }, []);

  const archiveProject = useCallback((id: string) => {
    setProjects((prev) => prev.map((p) => (p.id === id ? { ...p, status: 'Archived' as const } : p)));
  }, []);

  const unarchiveProject = useCallback((id: string) => {
    setProjects((prev) => prev.map((p) => (p.id === id ? { ...p, status: 'Active' as const } : p)));
  }, []);

  const deleteProject = useCallback((id: string) => {
    setProjects((prev) => prev.filter((p) => p.id !== id));
  }, []);

  const duplicateProject = useCallback((id: string): string | null => {
    const source = projects.find((p) => p.id === id);
    if (!source) return null;
    const newId = `proj-${Date.now()}`;
    const copy: Project = {
      ...source,
      id: newId,
      name: `${source.name} (Copy)`,
      pinned: false,
      status: 'Active',
      createdAt: new Date().toLocaleDateString('en-AU', { day: 'numeric', month: 'short', year: 'numeric' }),
      updatedAt: new Date().toLocaleDateString('en-AU', { day: 'numeric', month: 'short', year: 'numeric' }),
      notes: source.notes.map(n => ({ ...n, id: `note-${Date.now()}-${Math.random().toString(36).slice(2, 7)}` })),
      timeline: [],
      tasks: source.tasks.map(t => ({ ...t, id: `task-${Date.now()}-${Math.random().toString(36).slice(2, 7)}` })),
      invoices: [],
    };
    setProjects((prev) => [copy, ...prev]);
    return newId;
  }, [projects]);

  return (
    <ProjectsContext.Provider value={{
      projects,
      updateProject,
      addProject,
      togglePin,
      setPhaseProgress,
      changePhase,
      archiveProject,
      unarchiveProject,
      deleteProject,
      duplicateProject,
    }}>
      {children}
    </ProjectsContext.Provider>
  );
}

export function useProjects() {
  return useContext(ProjectsContext);
}
