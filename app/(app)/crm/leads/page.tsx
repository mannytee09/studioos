'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { PROJECT_TYPES, LEAD_SOURCES, Lead } from '@/lib/crm-data';
import { useCrm } from '@/lib/crm-context';
import { formatBudget } from '@/lib/utils';
import { LeadStatusBadge } from '@/components/crm/StatusBadge';
import { NewLeadModal } from '@/components/crm/NewLeadModal';
import { EmptyState } from '@/components/crm/EmptyState';
import { PinButton } from '@/components/crm/PinButton';
import { Search, X, Filter, ArrowUpDown, Check, LayoutGrid, Rows3, ExternalLink } from 'lucide-react';

const SORT_OPTIONS = [
  { label: 'Name', value: 'name' },
  { label: 'Status', value: 'status' },
  { label: 'Budget', value: 'budget' },
  { label: 'Created', value: 'created' },
];

export default function LeadsPage() {
  const [view, setView] = useState<'card' | 'table'>('card');
  const [showModal, setShowModal] = useState(false);
  const { leads, toggleLeadPin, addLead } = useCrm();

  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('All');
  const [sourceFilter, setSourceFilter] = useState('All');
  const [sortBy, setSortBy] = useState('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  const [showFilterMenu, setShowFilterMenu] = useState(false);
  const [showSortMenu, setShowSortMenu] = useState(false);

  const togglePin = (id: string) => toggleLeadPin(id);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return leads
      .filter(l => {
        const name = `${l.firstName} ${l.lastName}`;
        if (q && ![name, l.company, l.email, l.projectName].some(f => f.toLowerCase().includes(q))) return false;
        if (typeFilter !== 'All' && l.projectType !== typeFilter) return false;
        if (sourceFilter !== 'All' && l.leadSource !== sourceFilter) return false;
        return true;
      })
      .sort((a, b) => {
        const pin = (b.pinned ? 1 : 0) - (a.pinned ? 1 : 0);
        if (pin !== 0) return pin;
        let va = '', vb = '';
        if (sortBy === 'name') { va = `${a.firstName} ${a.lastName}`; vb = `${b.firstName} ${b.lastName}`; }
        else if (sortBy === 'status') { va = a.status; vb = b.status; }
        else if (sortBy === 'budget') { va = a.estimatedBudget.toString().padStart(10, '0'); vb = b.estimatedBudget.toString().padStart(10, '0'); }
        else if (sortBy === 'created') { va = a.createdAt; vb = b.createdAt; }
        const cmp = va.localeCompare(vb);
        return sortOrder === 'asc' ? cmp : -cmp;
      });
  }, [leads, search, typeFilter, sourceFilter, sortBy, sortOrder]);

  const hasFilters = typeFilter !== 'All' || sourceFilter !== 'All';

  return (
    <>
      {showModal && <NewLeadModal onClose={() => setShowModal(false)} />}

      <div className="space-y-5">
        <div>
          <h1 className="text-2xl font-semibold">Leads</h1>
          <p className="text-muted-foreground text-sm mt-0.5">Manage enquiries and convert them into clients.</p>
        </div>

        {/* Toolbar */}
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex-1" />

          {/* Search */}
          <div className="relative">
            <Search size={16} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
            <input type="text" placeholder="Search leads..." value={search} onChange={e => setSearch(e.target.value)}
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
                  <p className="px-3 py-1 text-xs font-medium text-muted-foreground uppercase tracking-wide">Project Type</p>
                  {['All', ...PROJECT_TYPES].map(opt => (
                    <button key={opt} onClick={() => setTypeFilter(opt)}
                      className={`filter-item ${typeFilter === opt ? 'filter-item-active' : 'filter-item-inactive'}`}>
                      {opt}{typeFilter === opt && <Check size={13} />}
                    </button>
                  ))}
                  <div className="border-t border-border/40 my-1" />
                  <p className="px-3 py-1 text-xs font-medium text-muted-foreground uppercase tracking-wide">Source</p>
                  {['All', ...LEAD_SOURCES].map(opt => (
                    <button key={opt} onClick={() => setSourceFilter(opt)}
                      className={`filter-item ${sourceFilter === opt ? 'filter-item-active' : 'filter-item-inactive'}`}>
                      {opt}{sourceFilter === opt && <Check size={13} />}
                    </button>
                  ))}
                  {hasFilters && <div className="border-t border-border/40 px-3 pt-2 pb-1"><button onClick={() => { setTypeFilter('All'); setSourceFilter('All'); }} className="text-xs text-muted-foreground hover:text-foreground">Clear Filters</button></div>}
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
                  {SORT_OPTIONS.map(opt => (
                    <button key={opt.value} onClick={() => { setSortBy(opt.value); setShowSortMenu(false); }}
                      className={`filter-item ${sortBy === opt.value ? 'filter-item-active' : 'filter-item-inactive'}`}>
                      {opt.label}{sortBy === opt.value && <Check size={13} />}
                    </button>
                  ))}
                  <div className="border-t border-border/40 my-1" />
                  <button onClick={() => setSortOrder('asc')} className={`filter-item ${sortOrder === 'asc' ? 'filter-item-active' : 'filter-item-inactive'}`}>
                    Ascending{sortOrder === 'asc' && <Check size={13} />}
                  </button>
                  <button onClick={() => setSortOrder('desc')} className={`filter-item ${sortOrder === 'desc' ? 'filter-item-active' : 'filter-item-inactive'}`}>
                    Descending{sortOrder === 'desc' && <Check size={13} />}
                  </button>
                </div>
              </>
            )}
          </div>

          {/* View toggle */}
          <div className="flex border border-border rounded-lg overflow-hidden">
            <button onClick={() => setView('card')} className={`w-8 h-8 flex items-center justify-center transition-colors ${view === 'card' ? 'view-toggle-active' : 'text-muted-foreground hover:bg-muted/50'}`}>
              <LayoutGrid size={18} />
            </button>
            <button onClick={() => setView('table')} className={`w-8 h-8 flex items-center justify-center border-l border-border transition-colors ${view === 'table' ? 'view-toggle-active' : 'text-muted-foreground hover:bg-muted/50'}`}>
              <Rows3 size={18} />
            </button>
          </div>

          <button onClick={() => setShowModal(true)} className="btn-primary">
            + New Lead
          </button>
        </div>

        {/* Content */}
        {filtered.length === 0 ? (
          <EmptyState icon="person_search"
            description={search || hasFilters ? 'Try adjusting your search or filters.' : 'Add your first lead to get started.'}
            action={{ label: '+ New Lead', onClick: () => setShowModal(true) }} />
        ) : view === 'card' ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filtered.map(lead => (
              <div key={lead.id} className="card-base card-hover p-4 cursor-pointer">
                <Link href={`/crm/leads/${lead.id}`} className="block">
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <div className="min-w-0 flex-1">
                      <p className="font-medium text-sm truncate">{lead.firstName} {lead.lastName}</p>
                      <p className="text-xs text-muted-foreground truncate">{lead.company}</p>
                    </div>
                    <div className="flex items-center gap-1.5 flex-shrink-0">
                      <LeadStatusBadge status={lead.status} />
                      <PinButton pinned={lead.pinned} onToggle={() => togglePin(lead.id)} />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs"><span className="text-muted-foreground">Type</span><span>{lead.projectType}</span></div>
                    <div className="flex items-center justify-between text-xs"><span className="text-muted-foreground">Budget</span><span className="font-medium">{formatBudget(lead.estimatedBudget)}</span></div>
                    <div className="flex items-center justify-between text-xs"><span className="text-muted-foreground">Source</span><span>{lead.leadSource}</span></div>
                    <div className="flex items-center justify-between text-xs"><span className="text-muted-foreground">Follow-up</span><span>{lead.nextFollowUp}</span></div>
                  </div>
                </Link>
              </div>
            ))}
            <button onClick={() => setShowModal(true)} className="border-2 border-dashed border-border rounded-xl h-40 flex flex-col items-center justify-center gap-2 text-muted-foreground hover:border-muted-foreground/40 hover:text-foreground transition-colors">
              <span className="text-sm">New Lead</span>
            </button>
          </div>
        ) : (
          <div className="card-base overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border bg-muted/20">
                  <th className="table-header text-left">Lead</th>
                  <th className="table-header text-left">Company</th>
                  <th className="table-header text-left">Project Type</th>
                  <th className="table-header text-left">Budget</th>
                  <th className="table-header text-left">Status</th>
                  <th className="table-header text-left">Source</th>
                  <th className="table-header text-left">Follow-up</th>
                  <th className="table-header w-12" />
                </tr>
              </thead>
              <tbody>
                {filtered.map(lead => (
                  <tr key={lead.id} className="border-b border-border/40 last:border-b-0 hover:bg-muted/15">
                    <td className="table-cell"><Link href={`/crm/leads/${lead.id}`}><p className="font-medium">{lead.firstName} {lead.lastName}</p><p className="text-xs text-muted-foreground">{lead.email}</p></Link></td>
                    <td className="table-cell text-muted-foreground">{lead.company}</td>
                    <td className="table-cell text-muted-foreground">{lead.projectType}</td>
                    <td className="table-cell text-muted-foreground">{formatBudget(lead.estimatedBudget)}</td>
                    <td className="table-cell"><LeadStatusBadge status={lead.status} /></td>
                    <td className="table-cell text-muted-foreground">{lead.leadSource}</td>
                    <td className="table-cell text-muted-foreground">{lead.nextFollowUp}</td>
                    <td className="table-cell"><div className="flex gap-1"><Link href={`/crm/leads/${lead.id}`} className="p-1 hover:bg-muted rounded text-muted-foreground"><ExternalLink size={15} /></Link><PinButton pinned={lead.pinned} onToggle={e => { e.preventDefault(); togglePin(lead.id); }} /></div></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  );
}
