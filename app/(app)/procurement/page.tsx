'use client';

import { useState, useMemo } from 'react';
import { Search, X, Filter, Check } from 'lucide-react';

const categories = ['All Vendors', 'Furniture', 'Lighting', 'Finishes', 'Textiles', 'Plumbing', 'Appliances', 'Decor', 'Artwork', 'Materials', 'Hardware'];

const allVendors = [
  { id: '1', name: 'Luxury Lighting Co.', category: 'Lighting', contact: 'Sarah Johnson', email: 'sarah@luxurylighting.com', phone: '+1 555-100-1000', discount: '15%', status: 'Active' },
  { id: '2', name: 'Premium Fabrics Ltd', category: 'Textiles', contact: 'Mike Brown', email: 'mike@premiumfabrics.com', phone: '+1 555-200-2000', discount: '10%', status: 'Active' },
  { id: '3', name: 'Artisan Furniture Co.', category: 'Furniture', contact: 'Emma Davis', email: 'emma@artisanfurniture.com', phone: '+1 555-300-3000', discount: '20%', status: 'Active' },
  { id: '4', name: 'Stone & Tile World', category: 'Finishes', contact: 'John Smith', email: 'john@stonetile.com', phone: '+1 555-400-4000', discount: '12%', status: 'Active' },
  { id: '5', name: 'Elite Hardware', category: 'Hardware', contact: 'Lisa Chen', email: 'lisa@elitehardware.com', phone: '+1 555-500-5000', discount: '8%', status: 'Inactive' },
  { id: '6', name: 'Coastal Decor Studio', category: 'Decor', contact: 'Anna White', email: 'anna@coastaldecor.com', phone: '+1 555-600-6000', discount: '5%', status: 'Active' },
  { id: '7', name: 'Bespoke Cabinetry', category: 'Furniture', contact: 'James Park', email: 'james@bespokecab.com', phone: '+1 555-700-7000', discount: '18%', status: 'Active' },
  { id: '8', name: 'Nordic Light House', category: 'Lighting', contact: 'Sven Lars', email: 'sven@nordiclight.com', phone: '+1 555-800-8000', discount: '11%', status: 'Active' },
];

export default function VendorLibraryPage() {
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All Vendors');
  const [showFilterMenu, setShowFilterMenu] = useState(false);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return allVendors.filter(v => {
      const matchCat = categoryFilter === 'All Vendors' || v.category === categoryFilter;
      const matchSearch = !search || v.name.toLowerCase().includes(q) || v.category.toLowerCase().includes(q) || v.contact.toLowerCase().includes(q);
      return matchCat && matchSearch;
    });
  }, [search, categoryFilter]);

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-semibold">Vendor Library</h1>
        <p className="text-muted-foreground text-sm mt-0.5">Your supplier and contractor database</p>
      </div>

      {/* Toolbar */}
      <div className="flex items-center gap-2 flex-wrap">
        <div className="flex-1" />

        <div className="relative">
          <Search size={16} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
          <input
            type="text"
            placeholder="Search vendors..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-8 pr-3 h-8 text-sm border border-border rounded-lg bg-background w-52 placeholder:text-muted-foreground outline-none focus:border-foreground/30 transition-colors"
          />
          {search && (
            <button onClick={() => setSearch('')} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
              <X size={14} />
            </button>
          )}
        </div>

        <div className="relative">
          <button
            onClick={() => setShowFilterMenu(!showFilterMenu)}
            className={`relative toolbar-icon-btn ${categoryFilter !== 'All Vendors' ? 'toolbar-icon-btn-active' : ''}`}
          >
            <Filter size={18} />
          </button>
          {showFilterMenu && (
            <>
              <div className="fixed inset-0 z-20" onClick={() => setShowFilterMenu(false)} />
              <div className="absolute right-0 mt-1 w-64 bg-popover border border-border rounded-xl shadow-lg z-30 py-1 overflow-hidden">
                <div className="max-h-64 overflow-y-auto dropdown-scroll">
                  {categories.map((cat) => (
                    <button
                      key={cat}
                      onClick={() => { setCategoryFilter(cat); setShowFilterMenu(false); }}
                      className={`flex items-center justify-between w-full px-3 py-2 text-sm text-left hover:bg-muted transition-colors ${
                        categoryFilter === cat ? 'text-foreground font-medium' : 'text-muted-foreground'
                      }`}
                    >
                      {cat}
                      {categoryFilter === cat && (
                        <Check size={14} />
                      )}
                    </button>
                  ))}
                </div>
                {categoryFilter !== 'All Vendors' && (
                  <div className="border-t border-border/40 px-3 pt-2 pb-1">
                    <button onClick={() => { setCategoryFilter('All Vendors'); setShowFilterMenu(false); }} className="text-xs text-muted-foreground hover:text-foreground">Clear Filters</button>
                  </div>
                )}
              </div>
            </>
          )}
        </div>

        <button className="btn-primary">
          Add Vendor
        </button>
      </div>

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
            {filtered.map((vendor) => (
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
                  <span className={`text-xs px-2 py-0.5 rounded-full ${
                    vendor.status === 'Active'
                      ? 'bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400'
                      : 'bg-muted text-muted-foreground'
                  }`}>
                    {vendor.status}
                  </span>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={6} className="table-cell text-center text-muted-foreground py-10">
                  No vendors match your search.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
