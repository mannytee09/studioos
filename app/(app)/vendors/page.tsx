'use client';

import { useState, useMemo } from 'react';
import { SidePanel } from '@/components/ui/SidePanel';
import { EmptyState } from '@/components/crm/EmptyState';
import { useActivity } from '@/lib/activity-context';
import { Search, X, Filter, Check } from 'lucide-react';

interface Vendor {
  id: string;
  name: string;
  category: string;
  contact: string;
  email: string;
  phone: string;
  discount: string;
  status: 'Active' | 'Inactive';
}

const CATEGORIES = ['All Categories', 'Furniture', 'Lighting', 'Finishes', 'Textiles', 'Plumbing', 'Appliances', 'Decor', 'Artwork', 'Materials', 'Hardware'];

const mockVendors: Vendor[] = [
  { id: '1', name: 'Luxury Lighting Co.', category: 'Lighting', contact: 'Sarah Johnson', email: 'sarah@luxurylighting.com', phone: '+61 2 1000 1000', discount: '15%', status: 'Active' },
  { id: '2', name: 'Premium Fabrics Ltd', category: 'Textiles', contact: 'Mike Brown', email: 'mike@premiumfabrics.com', phone: '+61 2 2000 2000', discount: '10%', status: 'Active' },
  { id: '3', name: 'Artisan Furniture Co.', category: 'Furniture', contact: 'Emma Davis', email: 'emma@artisanfurniture.com', phone: '+61 2 3000 3000', discount: '20%', status: 'Active' },
  { id: '4', name: 'Stone & Tile World', category: 'Finishes', contact: 'John Smith', email: 'john@stonetile.com', phone: '+61 2 4000 4000', discount: '12%', status: 'Active' },
  { id: '5', name: 'Elite Hardware', category: 'Hardware', contact: 'Lisa Chen', email: 'lisa@elitehardware.com', phone: '+61 2 5000 5000', discount: '8%', status: 'Inactive' },
  { id: '6', name: 'Coastal Decor Studio', category: 'Decor', contact: 'Anna White', email: 'anna@coastaldecor.com', phone: '+61 2 6000 6000', discount: '5%', status: 'Active' },
  { id: '7', name: 'Bespoke Cabinetry', category: 'Furniture', contact: 'James Park', email: 'james@bespokecab.com', phone: '+61 2 7000 7000', discount: '18%', status: 'Active' },
  { id: '8', name: 'Nordic Light House', category: 'Lighting', contact: 'Sven Lars', email: 'sven@nordiclight.com', phone: '+61 2 8000 8000', discount: '11%', status: 'Active' },
];

export default function VendorsPage() {
  const [vendors, setVendors] = useState<Vendor[]>(mockVendors);
  const { addActivity } = useActivity();
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All Categories');
  const [showFilterMenu, setShowFilterMenu] = useState(false);
  const [showAddPanel, setShowAddPanel] = useState(false);
  const [newVendor, setNewVendor] = useState({ name: '', category: 'Furniture', contact: '', email: '', phone: '', discount: '' });

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return vendors.filter(v => {
      const matchCat = categoryFilter === 'All Categories' || v.category === categoryFilter;
      const matchSearch = !search || v.name.toLowerCase().includes(q) || v.category.toLowerCase().includes(q) || v.contact.toLowerCase().includes(q);
      return matchCat && matchSearch;
    });
  }, [vendors, search, categoryFilter]);

  const handleAddVendor = () => {
    if (!newVendor.name) return;
    const created: Vendor = {
      id: `v-${Date.now()}`,
      name: newVendor.name,
      category: newVendor.category,
      contact: newVendor.contact || 'TBC',
      email: newVendor.email || '',
      phone: newVendor.phone || '',
      discount: newVendor.discount || '0%',
      status: 'Active',
    };
    setVendors(prev => [created, ...prev]);
    addActivity({
      title: 'Vendor Added',
      description: `"${newVendor.name}" added as a new vendor`,
      icon: 'local_shipping',
      source: 'Vendors',
    });
    setNewVendor({ name: '', category: 'Furniture', contact: '', email: '', phone: '', discount: '' });
    setShowAddPanel(false);
  };

  return (
    <>
      {showAddPanel && (
        <SidePanel title="Add Vendor" subtitle="Add a supplier or contractor to your database" onClose={() => setShowAddPanel(false)} footer={
          <><div /><div className="flex gap-2">
            <button onClick={() => setShowAddPanel(false)} className="notion-button border border-border">Cancel</button>
            <button onClick={handleAddVendor} className="btn-primary">Add Vendor</button>
          </div></>
        }>
          <div className="px-6 py-5 space-y-4">
            <div>
              <label className="block text-xs text-muted-foreground mb-1.5">Vendor Name *</label>
              <input value={newVendor.name} onChange={e => setNewVendor(p => ({ ...p, name: e.target.value }))} placeholder="Luxury Lighting Co." className="modal-input" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-muted-foreground mb-1.5">Category</label>
                <select value={newVendor.category} onChange={e => setNewVendor(p => ({ ...p, category: e.target.value }))} className="modal-input">
                  {CATEGORIES.slice(1).map(c => <option key={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs text-muted-foreground mb-1.5">Discount</label>
                <input value={newVendor.discount} onChange={e => setNewVendor(p => ({ ...p, discount: e.target.value }))} placeholder="15%" className="modal-input" />
              </div>
              <div>
                <label className="block text-xs text-muted-foreground mb-1.5">Contact Name</label>
                <input value={newVendor.contact} onChange={e => setNewVendor(p => ({ ...p, contact: e.target.value }))} placeholder="Sarah Johnson" className="modal-input" />
              </div>
              <div>
                <label className="block text-xs text-muted-foreground mb-1.5">Phone</label>
                <input value={newVendor.phone} onChange={e => setNewVendor(p => ({ ...p, phone: e.target.value }))} placeholder="+61 2 1000 1000" className="modal-input" />
              </div>
              <div className="col-span-2">
                <label className="block text-xs text-muted-foreground mb-1.5">Email</label>
                <input value={newVendor.email} onChange={e => setNewVendor(p => ({ ...p, email: e.target.value }))} placeholder="sarah@luxurylighting.com" className="modal-input" />
              </div>
            </div>
          </div>
        </SidePanel>
      )}

      <div className="space-y-5">
        <div>
          <h1 className="text-2xl font-semibold">Vendors</h1>
          <p className="text-muted-foreground text-sm mt-0.5">Your supplier and contractor database.</p>
        </div>

        {/* Toolbar */}
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex-1" />

          <div className="relative">
            <Search size={16} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
            <input type="text" placeholder="Search vendors..." value={search} onChange={e => setSearch(e.target.value)}
              className="pl-8 pr-3 h-8 text-sm border border-border rounded-lg bg-background w-52 placeholder:text-muted-foreground outline-none focus:border-foreground/30 transition-colors" />
            {search && <button onClick={() => setSearch('')} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"><X size={14} /></button>}
          </div>

          <div className="relative">
            <button onClick={() => setShowFilterMenu(!showFilterMenu)}
              className={`relative toolbar-icon-btn ${categoryFilter !== 'All Categories' ? 'toolbar-icon-btn-active' : ''}`}>
              <Filter size={18} />
            </button>
            {showFilterMenu && (
              <>
                <div className="fixed inset-0 z-20" onClick={() => setShowFilterMenu(false)} />
                <div className="absolute right-0 mt-1 w-64 bg-popover border border-border rounded-xl shadow-lg z-30 py-2">
                  <p className="px-3 py-1 text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">Category</p>
                  {CATEGORIES.map(cat => (
                    <button key={cat} onClick={() => { setCategoryFilter(cat); setShowFilterMenu(false); }}
                      className={`filter-item ${categoryFilter === cat ? 'filter-item-active' : 'filter-item-inactive'}`}>
                      {cat}{categoryFilter === cat && <Check size={13} />}
                    </button>
                  ))}
                  {categoryFilter !== 'All Categories' && (
                    <div className="border-t border-border/40 px-3 pt-2 pb-1">
                      <button onClick={() => { setCategoryFilter('All Categories'); setShowFilterMenu(false); }} className="text-xs text-muted-foreground hover:text-foreground">Clear Filters</button>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>

          <button onClick={() => setShowAddPanel(true)} className="btn-primary">
            + Add Vendor
          </button>
        </div>

        {filtered.length === 0 ? (
          <EmptyState icon="store" description={search || categoryFilter !== 'All Categories' ? 'Try adjusting your search or filters.' : 'Add your first vendor.'} action={{ label: '+ Add Vendor', onClick: () => setShowAddPanel(true) }} />
        ) : (
          <div className="bg-card border border-border rounded-xl overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border bg-muted/30">
                  <th className="table-header text-left">Vendor</th>
                  <th className="table-header text-left">Category</th>
                  <th className="table-header text-left">Contact</th>
                  <th className="table-header text-left">Phone</th>
                  <th className="table-header text-left">Discount</th>
                  <th className="table-header text-left">Status</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(vendor => (
                  <tr key={vendor.id} className="hover:bg-muted/20 cursor-pointer border-b border-border/50 last:border-b-0">
                    <td className="table-cell">
                      <p className="font-medium">{vendor.name}</p>
                      <p className="text-xs text-muted-foreground">{vendor.email}</p>
                    </td>
                    <td className="table-cell text-muted-foreground">{vendor.category}</td>
                    <td className="table-cell text-muted-foreground">{vendor.contact}</td>
                    <td className="table-cell text-muted-foreground">{vendor.phone}</td>
                    <td className="table-cell text-muted-foreground">{vendor.discount}</td>
                    <td className="table-cell">
                      <span className={`text-xs px-2 py-0.5 rounded-full ${vendor.status === 'Active' ? 'bg-green-50 text-green-700' : 'bg-muted text-muted-foreground'}`}>
                        {vendor.status}
                      </span>
                    </td>
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
