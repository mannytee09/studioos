'use client';

import { ProjectStatus, projectStatusBadgeColors } from '@/lib/projects-data';

interface ProjectStatusBadgeProps {
  status: ProjectStatus;
}

export function ProjectStatusBadge({ status }: ProjectStatusBadgeProps) {
  return (
    <span className={`text-xs px-2 py-0.5 rounded-md font-medium ${projectStatusBadgeColors[status]}`}>
      {status}
    </span>
  );
}
