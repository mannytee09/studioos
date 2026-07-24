'use client';

import { FilterDropdown } from '@/components/crm/FilterDropdown';
import { SearchBar } from '@/components/crm/SearchBar';
import { PROJECT_PHASES, PROJECT_STATUSES, PROJECT_TYPES } from '@/lib/projects-data';
import { useDesigners } from '@/lib/designer-context';
import { mockClients } from '@/lib/crm-data';

interface ProjectFilterBarProps {
  search: string;
  onSearchChange: (v: string) => void;
  phaseFilter: string;
  onPhaseChange: (v: string) => void;
  statusFilter: string;
  onStatusChange: (v: string) => void;
  managerFilter: string;
  onManagerChange: (v: string) => void;
  clientFilter: string;
  onClientChange: (v: string) => void;
  typeFilter: string;
  onTypeChange: (v: string) => void;
  pinnedFilter: string;
  onPinnedChange: (v: string) => void;
  onClearFilters: () => void;
}

export function ProjectFilterBar({
  search,
  onSearchChange,
  phaseFilter,
  onPhaseChange,
  statusFilter,
  onStatusChange,
  managerFilter,
  onManagerChange,
  clientFilter,
  onClientChange,
  typeFilter,
  onTypeChange,
  pinnedFilter,
  onPinnedChange,
  onClearFilters,
}: ProjectFilterBarProps) {
  const { designers } = useDesigners();

  const hasActiveFilters =
    phaseFilter !== 'All' ||
    statusFilter !== 'All' ||
    managerFilter !== 'All' ||
    clientFilter !== 'All' ||
    typeFilter !== 'All' ||
    pinnedFilter !== 'All';

  return (
    <div className="flex items-center justify-between gap-3 flex-wrap">
      <div className="flex items-center gap-2 flex-wrap">
        <SearchBar value={search} onChange={onSearchChange} placeholder="Search projects..." />
        <FilterDropdown label="Phase" value={phaseFilter} options={['All', ...PROJECT_PHASES]} onChange={onPhaseChange} />
        <FilterDropdown label="Status" value={statusFilter} options={['All', ...PROJECT_STATUSES]} onChange={onStatusChange} />
        <FilterDropdown label="Manager" value={managerFilter} options={['All', ...designers]} onChange={onManagerChange} />
        <FilterDropdown
          label="Client"
          value={clientFilter}
          options={['All', ...mockClients.map((c) => c.primaryContact)]}
          onChange={onClientChange}
        />
        <FilterDropdown label="Type" value={typeFilter} options={['All', ...PROJECT_TYPES]} onChange={onTypeChange} />
        <FilterDropdown label="Pinned" value={pinnedFilter} options={['All', 'Pinned', 'Unpinned']} onChange={onPinnedChange} />
        {hasActiveFilters && (
          <button onClick={onClearFilters} className="text-xs text-muted-foreground hover:text-foreground underline">
            Clear Filters
          </button>
        )}
      </div>
    </div>
  );
}
