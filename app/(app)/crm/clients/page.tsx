'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { PROJECT_TYPES, Client } from '@/lib/crm-data';
import { useCrm } from '@/lib/crm-context';
import { ClientStatusBadge } from '@/components/crm/StatusBadge';
import { EmptyState } from '@/components/crm/EmptyState';
import { PinButton } from '@/components/crm/PinButton';
import { SidePanel } from '@/components/ui/SidePanel';
import { useActivity } from '@/lib/activity-context';
import { Search, X, Filter, ArrowUpDown, Check, LayoutGrid, Rows3, ExternalLink } from 'lucide-react';

const SORT_OPTIONS = [
  { label: 'Name', value: 'name' },
  { label: 'Status', value: 'status' },
  { label: 'Last Contact', value: 'contact' },
];

export default function ClientsPage() {
  const [view, setView] = useState<'card' | 'table'>('card');
  const [showModal, setShowModal] = useState(false);
  const { clients, toggleClientPin, addClient } = useCrm();
  const { addActivity } = useActivity();

  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('All');
  const [sortBy, setSortBy] = useState('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  const [showFilterMenu, setShowFilterMenu] = useState(false);
  const [showSortMenu, setShowSortMenu] = useState(false);

  // New client form state
  const [newClient, setNewClient] = useState({ name: '', company: '', email: '', phone: '' });

  const togglePin = (id: string) => toggleClientPin(id);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return clients
      .filter(c => {
        if (q && ![c.company, c.primaryContact, c.email, c.phone].some(f => f.toLowerCase().includes(q))) return false;
        if (typeFilter !== 'All' && c.projectType !== typeFilter) return false;
        return true;
      })
      .sort((a, b) => {
        const pin = (b.pinned ? 1 : 0) - (a.pinned ? 1 : 0);
        if (pin !== 0) return pin;
        let va = '', vb = '';
        if (sortBy === 'name') { va = a.primaryContact; vb = b.primaryContact; }
        else if (sortBy === 'status') { va = a.status; vb = b.status; }
        else if (sortBy === 'contact') { va = a.lastContact; vb = b.lastContact; }
        const cmp = va.localeCompare(vb);
        return sortOrder === 'asc' ? cmp : -cmp;
      });
  }, [clients, search, typeFilter, sortBy, sortOrder]);

  const hasFilters = typeFilter !== 'All';

  const handleCreateClient = () => {
    if (!newClient.name) return;
    const created: Client = {
      id: `c-${Date.now()}`,
      primaryContact: newClient.name,
      company: newClient.company,
      email: newClient.email,
      phone: newClient.phone,
      address: '',
      projectType: 'Residential',
      status: 'Active',
      assignedDesigner: '',
      lastContact: new Date().toLocaleDateString('en-AU', { day: 'numeric', month: 'short', year: 'numeric' }),
      pinned: false,
      projects: [],
      contacts: [],
      notes: [],
      timeline: [],
      website: '',
      clientSince: new Date().toLocaleDateString('en-AU', { month: 'short', year: 'numeric' }),
    };
    addClient(created);
    addActivity({
      title: 'Client Created',
      description: `${newClient.name} added as a new client`,
      icon: 'person_add',
      source: 'Clients',
    });
    setNewClient({ name: '', company: '', email: '', phone: '' });
    setShowModal(false);
  };

  return (
    <>
      {showModal && (
        <SidePanel onClose={() => setShowModal(false)} footer={
          <><div /><div className="flex gap-2">
            <button onClick={() => setShowModal(false)} className="notion-button border border-border">Cancel</button>
            <button onClick={handleCreateClient} className="btn-primary">Create Client</button>
          </div></>
        }>
          <div className="px-6 py-5 space-y-4">
            <div>
              <label className="block text-xs text-muted-foreground mb-1.5">Full Name *</label>
              <input value={newClient.name} onChange={e => setNewClient(p => ({ ...p, name: e.target.value }))} placeholder="Sophie Williams" className="modal-input" />
            </div>
            <div>
              <label className="block text-xs text-muted-foreground mb-1.5">Company</label>
              <input value={newClient.company} onChange={e => setNewClient(p => ({ ...p, company: e.target.value }))} placeholder="Williams Family" className="modal-input" />
            </div>
            <div>
              <label className="block text-xs text-muted-foreground mb-1.5">Email</label>
              <input type="email" value={newClient.email} onChange={e => setNewClient(p => ({ ...p, email: e.target.value }))} placeholder="sophie@email.com" className="modal-input" />
            </div>
            <div>
              <label className="block text-xs text-muted-foreground mb-1.5">Phone</label>
              <input value={newClient.phone} onChange={e => setNewClient(p => ({ ...p, phone: e.target.value }))} placeholder="+61 400 000 000" className="modal-input" />
            </div>
          </div>
        </SidePanel>
      )}

      <div className="space-y-5">
        <div>
          <h1 className="text-2xl font-semibold">Clients</h1>
          <p className="text-muted-foreground text-sm mt-0.5">Manage your client relationships.</p>
        </div>

        {/* Toolbar */}
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex-1" />

          <div className="relative">
            <Search size={16} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
            <input type="text" placeholder="Search clients..." value={search} onChange={e => setSearch(e.target.value)}
              className="pl-8 pr-3 h-8 text-sm border border-border rounded-lg bg-background w-48 placeholder:text-muted-foreground outline-none focus:border-foreground/30 transition-colors" />
            {search && <button onClick={() => setSearch('')} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"><X size={14} /></button>}
          </div>

          {/* Filter — Project Type only */}
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
                  {hasFilters && <div className="border-t border-border/40 px-3 pt-2 pb-1"><button onClick={() => setTypeFilter('All')} className="text-xs text-muted-foreground hover:text-foreground">Clear Filters</button></div>}
                </div>
              </>
            )}
          </div>

          {/* Sort — includes Status */}
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
                  <button onClick={() => setSortOrder('asc')} className={`filter-item ${sortOrder === 'asc' ? 'filter-item-active' : 'filter-item-inactive'}`}>Ascending{sortOrder === 'asc' && <Check size={13} />}</button>
                  <button onClick={() => setSortOrder('desc')} className={`filter-item ${sortOrder === 'desc' ? 'filter-item-active' : 'filter-item-inactive'}`}>Descending{sortOrder === 'desc' && <Check size={13} />}</button>
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
            + New Client
          </button>
        </div>

        {filtered.length === 0 ? (
          <EmptyState icon="badge"
            description={search || hasFilters ? 'Try adjusting your search or filters.' : 'Add your first client.'}
            action={{ label: '+ New Client', onClick: () => setShowModal(true) }} />
        ) : view === 'card' ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filtered.map(client => {
              const activeProjects = client.projects.filter(p => p.status === 'Active').length;
              const currentPhase = client.projects.find(p => p.status === 'Active')?.phase ?? '—';
              return (
                <div key={client.id} className="card-base card-hover p-4 cursor-pointer">
                  <Link href={`/crm/clients/${client.id}`} className="block">
                    <div className="flex items-start justify-between gap-2 mb-3">
                      <div className="min-w-0 flex-1"><p className="font-medium text-sm truncate">{client.primaryContact}</p><p className="text-xs text-muted-foreground truncate">{client.company}</p></div>
                      <div className="flex items-center gap-1.5 flex-shrink-0"><ClientStatusBadge status={client.status} /><PinButton pinned={client.pinned} onToggle={() => togglePin(client.id)} /></div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-xs"><span className="text-muted-foreground">Active Projects</span><span>{activeProjects}</span></div>
                      <div className="flex items-center justify-between text-xs"><span className="text-muted-foreground">Phase</span><span>{currentPhase}</span></div>
                      <div className="flex items-center justify-between text-xs"><span className="text-muted-foreground">Last Contact</span><span>{client.lastContact}</span></div>
                    </div>
                  </Link>
                </div>
              );
            })}
            <button onClick={() => setShowModal(true)} className="border-2 border-dashed border-border rounded-xl h-40 flex flex-col items-center justify-center gap-2 text-muted-foreground hover:border-muted-foreground/40 hover:text-foreground transition-colors">
              <span className="text-sm">New Client</span>
            </button>
          </div>
        ) : (
          <div className="card-base overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border bg-muted/20">
                  <th className="table-header text-left">Client</th><th className="table-header text-left">Company</th><th className="table-header text-left">Projects</th><th className="table-header text-left">Phone</th><th className="table-header text-left">Last Contact</th><th className="table-header text-left">Status</th><th className="table-header w-12" />
                </tr>
              </thead>
              <tbody>
                {filtered.map(client => (
                  <tr key={client.id} className="border-b border-border/40 last:border-b-0 hover:bg-muted/15">
                    <td className="table-cell"><Link href={`/crm/clients/${client.id}`}><p className="font-medium">{client.primaryContact}</p><p className="text-xs text-muted-foreground">{client.email}</p></Link></td>
                    <td className="table-cell text-muted-foreground">{client.company}</td>
                    <td className="table-cell text-muted-foreground">{client.projects.length}</td>
                    <td className="table-cell text-muted-foreground">{client.phone}</td>
                    <td className="table-cell text-muted-foreground">{client.lastContact}</td>
                    <td className="table-cell"><ClientStatusBadge status={client.status} /></td>
                    <td className="table-cell"><div className="flex gap-1"><Link href={`/crm/clients/${client.id}`} className="p-1 hover:bg-muted rounded text-muted-foreground"><ExternalLink size={15} /></Link><PinButton pinned={client.pinned} onToggle={e => { e.preventDefault(); togglePin(client.id); }} /></div></td>
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
