'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { useCrm } from '@/lib/crm-context';
import { useActivity } from '@/lib/activity-context';
import { LeadStatusBadge, ClientStatusBadge } from '@/components/crm/StatusBadge';
import { EmptyState } from '@/components/crm/EmptyState';
import { SidePanel } from '@/components/ui/SidePanel';
import { Client } from '@/lib/crm-data';
import { Search, X, ExternalLink } from 'lucide-react';

type ContactType = 'clients' | 'leads' | 'suppliers';

interface Supplier {
  id: string;
  name: string;
  category: string;
  contact: string;
  email: string;
  phone: string;
  status: 'Active' | 'Inactive';
}

const MOCK_SUPPLIERS: Supplier[] = [
  { id: 's1', name: 'Luxury Lighting Co.', category: 'Lighting', contact: 'Sarah Johnson', email: 'sarah@luxurylighting.com', phone: '+61 2 1000 1000', status: 'Active' },
  { id: 's2', name: 'Premium Fabrics Ltd', category: 'Textiles', contact: 'Mike Brown', email: 'mike@premiumfabrics.com', phone: '+61 2 2000 2000', status: 'Active' },
  { id: 's3', name: 'Artisan Furniture Co.', category: 'Furniture', contact: 'Emma Davis', email: 'emma@artisanfurniture.com', phone: '+61 2 3000 3000', status: 'Active' },
  { id: 's4', name: 'Stone & Tile World', category: 'Finishes', contact: 'John Smith', email: 'john@stonetile.com', phone: '+61 2 4000 4000', status: 'Active' },
  { id: 's5', name: 'Elite Hardware', category: 'Hardware', contact: 'Lisa Chen', email: 'lisa@elitehardware.com', phone: '+61 2 5000 5000', status: 'Inactive' },
  { id: 's6', name: 'Coastal Decor Studio', category: 'Decor', contact: 'Anna White', email: 'anna@coastaldecor.com', phone: '+61 2 6000 6000', status: 'Active' },
];

export default function ContactsPage() {
  const { leads, clients, addClient } = useCrm();
  const { addActivity } = useActivity();
  const [typeFilter, setTypeFilter] = useState<ContactType>('clients');
  const [search, setSearch] = useState('');
  const [suppliers, setSuppliers] = useState<Supplier[]>(MOCK_SUPPLIERS);
  const [showAddClient, setShowAddClient] = useState(false);
  const [showAddSupplier, setShowAddSupplier] = useState(false);
  const [newClient, setNewClient] = useState({ name: '', company: '', email: '', phone: '' });
  const [newSupplier, setNewSupplier] = useState({ name: '', category: 'Furniture', contact: '', email: '', phone: '' });

  const handleAddClient = () => {
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
      title: 'Client Added',
      description: `${newClient.name} added as a new client`,
      icon: 'person_add',
      source: 'Contacts',
    });
    setNewClient({ name: '', company: '', email: '', phone: '' });
    setShowAddClient(false);
  };

  const handleAddSupplier = () => {
    if (!newSupplier.name) return;
    const supplier: Supplier = {
      id: `s-${Date.now()}`,
      name: newSupplier.name,
      category: newSupplier.category,
      contact: newSupplier.contact,
      email: newSupplier.email,
      phone: newSupplier.phone,
      status: 'Active',
    };
    setSuppliers(prev => [supplier, ...prev]);
    addActivity({
      title: 'Supplier Added',
      description: `"${newSupplier.name}" added as a new supplier`,
      icon: 'local_shipping',
      source: 'Contacts',
    });
    setNewSupplier({ name: '', category: 'Furniture', contact: '', email: '', phone: '' });
    setShowAddSupplier(false);
  };

  const filteredLeads = useMemo(() => {
    const q = search.toLowerCase();
    return leads.filter(l => {
      if (q && ![`${l.firstName} ${l.lastName}`, l.company, l.email].some(f => f.toLowerCase().includes(q))) return false;
      return true;
    });
  }, [leads, search]);

  const filteredClients = useMemo(() => {
    const q = search.toLowerCase();
    return clients.filter(c => {
      if (q && ![c.primaryContact, c.company, c.email].some(f => f.toLowerCase().includes(q))) return false;
      return true;
    });
  }, [clients, search]);

  const filteredSuppliers = useMemo(() => {
    const q = search.toLowerCase();
    return suppliers.filter(s => {
      if (q && ![s.name, s.category, s.contact, s.email].some(f => f.toLowerCase().includes(q))) return false;
      return true;
    });
  }, [suppliers, search]);

  const currentCount = typeFilter === 'leads' ? filteredLeads.length : typeFilter === 'clients' ? filteredClients.length : filteredSuppliers.length;
  const addButton = typeFilter === 'suppliers'
    ? { label: 'Add Supplier', onClick: () => setShowAddSupplier(true), icon: 'local_shipping' }
    : { label: 'Add Client', onClick: () => setShowAddClient(true), icon: 'person_add' };

  return (
    <>
      {showAddClient && (
        <SidePanel title="Add Client" subtitle="Create a new client contact" onClose={() => setShowAddClient(false)} footer={
          <><div /><div className="flex gap-2">
            <button onClick={() => setShowAddClient(false)} className="notion-button border border-border">Cancel</button>
            <button onClick={handleAddClient} className="btn-primary">Add Client</button>
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

      {showAddSupplier && (
        <SidePanel title="Add Supplier" subtitle="Create a new supplier contact" onClose={() => setShowAddSupplier(false)} footer={
          <><div /><div className="flex gap-2">
            <button onClick={() => setShowAddSupplier(false)} className="notion-button border border-border">Cancel</button>
            <button onClick={handleAddSupplier} className="btn-primary">Add Supplier</button>
          </div></>
        }>
          <div className="px-6 py-5 space-y-4">
            <div>
              <label className="block text-xs text-muted-foreground mb-1.5">Company Name *</label>
              <input value={newSupplier.name} onChange={e => setNewSupplier(p => ({ ...p, name: e.target.value }))} placeholder="Luxury Lighting Co." className="modal-input" />
            </div>
            <div>
              <label className="block text-xs text-muted-foreground mb-1.5">Category</label>
              <select value={newSupplier.category} onChange={e => setNewSupplier(p => ({ ...p, category: e.target.value }))} className="modal-input">
                {['Furniture', 'Lighting', 'Finishes', 'Textiles', 'Plumbing', 'Appliances', 'Decor', 'Artwork', 'Materials', 'Hardware'].map(c => <option key={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs text-muted-foreground mb-1.5">Contact Person</label>
              <input value={newSupplier.contact} onChange={e => setNewSupplier(p => ({ ...p, contact: e.target.value }))} placeholder="Sarah Johnson" className="modal-input" />
            </div>
            <div>
              <label className="block text-xs text-muted-foreground mb-1.5">Email</label>
              <input type="email" value={newSupplier.email} onChange={e => setNewSupplier(p => ({ ...p, email: e.target.value }))} placeholder="sarah@luxurylighting.com" className="modal-input" />
            </div>
            <div>
              <label className="block text-xs text-muted-foreground mb-1.5">Phone</label>
              <input value={newSupplier.phone} onChange={e => setNewSupplier(p => ({ ...p, phone: e.target.value }))} placeholder="+61 2 1000 1000" className="modal-input" />
            </div>
          </div>
        </SidePanel>
      )}

      <div className="space-y-5">
        <div>
          <h1 className="text-2xl font-semibold">Contacts</h1>
          <p className="text-muted-foreground text-sm mt-0.5">All your clients, leads, and suppliers in one place</p>
        </div>

        {/* Toolbar */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Type filter tabs */}
          <div className="flex border border-border rounded-lg overflow-hidden">
            {([
              { id: 'clients' as const, label: 'Clients' },
              { id: 'leads' as const, label: 'Leads' },
              { id: 'suppliers' as const, label: 'Suppliers' },
            ]).map(tab => (
              <button key={tab.id} onClick={() => setTypeFilter(tab.id)}
                className={`px-3 py-1.5 text-sm font-medium transition-colors border-l border-border first:border-l-0 ${
                  typeFilter === tab.id ? 'bg-foreground text-background' : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                }`}>
                {tab.label}
              </button>
            ))}
          </div>

          <div className="flex-1" />

          {/* Search */}
          <div className="relative">
            <Search size={16} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
            <input type="text" placeholder="Search contacts..." value={search} onChange={e => setSearch(e.target.value)}
              className="pl-8 pr-3 py-1.5 text-sm border border-border rounded-lg bg-background w-48 placeholder:text-muted-foreground outline-none focus:border-foreground/30 transition-colors" />
            {search && <button onClick={() => setSearch('')} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"><X size={14} /></button>}
          </div>

            <button onClick={addButton.onClick} className="btn-primary">
              + {addButton.label}
            </button>
        </div>

        {/* Content */}
        {currentCount === 0 ? (
          <EmptyState icon="recent_actors"
            description={search ? 'Try adjusting your search.' : 'Add your first contact to get started.'}
            action={{ label: `+ ${addButton.label}`, onClick: addButton.onClick }} />
        ) : (
          <div className="card-base overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border bg-muted/20">
                  <th className="table-header text-left">Name</th>
                  <th className="table-header text-left">{typeFilter === 'suppliers' ? 'Category' : 'Company'}</th>
                  <th className="table-header text-left">Email</th>
                  <th className="table-header text-left">Phone</th>
                  {typeFilter !== 'suppliers' && <th className="table-header text-left">Type</th>}
                  <th className="table-header text-left">Status</th>
                  <th className="table-header w-12" />
                </tr>
              </thead>
              <tbody>
                {typeFilter === 'leads' && filteredLeads.map(lead => (
                  <tr key={`lead-${lead.id}`} className="border-b border-border/40 last:border-b-0 hover:bg-muted/15">
                    <td className="table-cell">
                      <Link href={`/crm/leads/${lead.id}`} className="hover:underline">
                        <p className="font-medium">{lead.firstName} {lead.lastName}</p>
                      </Link>
                    </td>
                    <td className="table-cell text-muted-foreground">{lead.company}</td>
                    <td className="table-cell text-muted-foreground">{lead.email}</td>
                    <td className="table-cell text-muted-foreground">{lead.phone}</td>
                    <td className="table-cell"><span className="text-xs px-2 py-0.5 rounded-full bg-amber-50 text-amber-600 font-medium">Lead</span></td>
                    <td className="table-cell"><LeadStatusBadge status={lead.status} /></td>
                    <td className="table-cell">
                      <Link href={`/crm/leads/${lead.id}`} className="p-1 hover:bg-muted rounded text-muted-foreground">
                        <ExternalLink size={15} />
                      </Link>
                    </td>
                  </tr>
                ))}
                {typeFilter === 'clients' && filteredClients.map(client => (
                  <tr key={`client-${client.id}`} className="border-b border-border/40 last:border-b-0 hover:bg-muted/15">
                    <td className="table-cell">
                      <Link href={`/crm/clients/${client.id}`} className="hover:underline">
                        <p className="font-medium">{client.primaryContact}</p>
                      </Link>
                    </td>
                    <td className="table-cell text-muted-foreground">{client.company}</td>
                    <td className="table-cell text-muted-foreground">{client.email}</td>
                    <td className="table-cell text-muted-foreground">{client.phone}</td>
                    <td className="table-cell"><span className="text-xs px-2 py-0.5 rounded-full bg-blue-50 text-blue-600 font-medium">Client</span></td>
                    <td className="table-cell"><ClientStatusBadge status={client.status} /></td>
                    <td className="table-cell">
                      <Link href={`/crm/clients/${client.id}`} className="p-1 hover:bg-muted rounded text-muted-foreground">
                        <ExternalLink size={15} />
                      </Link>
                    </td>
                  </tr>
                ))}
                {typeFilter === 'suppliers' && filteredSuppliers.map(supplier => (
                  <tr key={`supplier-${supplier.id}`} className="border-b border-border/40 last:border-b-0 hover:bg-muted/15">
                    <td className="table-cell">
                      <p className="font-medium">{supplier.name}</p>
                    </td>
                    <td className="table-cell text-muted-foreground">{supplier.category}</td>
                    <td className="table-cell text-muted-foreground">{supplier.email}</td>
                    <td className="table-cell text-muted-foreground">{supplier.phone}</td>
                    <td className="table-cell">
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${supplier.status === 'Active' ? 'bg-green-50 text-green-600' : 'bg-gray-100 text-gray-500'}`}>
                        {supplier.status}
                      </span>
                    </td>
                    <td className="table-cell" />
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
