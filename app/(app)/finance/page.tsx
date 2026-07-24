'use client';

import { useState, useMemo, useEffect, useRef } from 'react';
import { ChevronDown, Check, TrendingUp, FileText, CircleAlert as AlertCircle, X } from 'lucide-react';
import { SidePanel } from '@/components/ui/SidePanel';
import { SelectDropdown } from '@/components/projects/SelectDropdown';
import { DatePicker } from '@/components/ui/DatePicker';

function formatCurrency(amount: number): string {
  return `A$${amount.toLocaleString('en-AU')}`;
}

const monthOptions = [
  { label: 'Current Month', value: 'current' },
  { label: 'Last Month', value: 'last' },
  { label: 'Last 3 Months', value: '3m' },
  { label: 'Last 6 Months', value: '6m' },
  { label: 'This Year', value: 'year' },
];

const allInvoices = [
  { id: 'INV-001', client: 'James & Sarah Mitchell', project: 'Hampton Residence', amount: 15000, outstanding: 0, status: 'Paid', issued: new Date(2024, 10, 1), due: new Date(2024, 10, 15) },
  { id: 'INV-002', client: 'Michael Chen', project: 'Urban Loft Project', amount: 8500, outstanding: 8500, status: 'Pending', issued: new Date(2024, 10, 15), due: new Date(2024, 10, 30) },
  { id: 'INV-003', client: 'TechCorp Inc.', project: 'Modern Office Space', amount: 22000, outstanding: 22000, status: 'Overdue', issued: new Date(2024, 9, 20), due: new Date(2024, 10, 5) },
  { id: 'INV-004', client: 'Alexandra Thompson', project: 'Coastal Villa Renovation', amount: 12750, outstanding: 0, status: 'Paid', issued: new Date(2024, 9, 30), due: new Date(2024, 10, 14) },
  { id: 'INV-005', client: 'Victoria Lee', project: 'Penthouse Suite', amount: 5000, outstanding: 5000, status: 'Upcoming', issued: new Date(2024, 10, 18), due: new Date(2024, 11, 5) },
  { id: 'INV-006', client: 'Emma Collins', project: 'Boutique Hotel Lobby', amount: 18000, outstanding: 18000, status: 'Pending', issued: new Date(2024, 8, 15), due: new Date(2024, 8, 30) },
  { id: 'INV-007', client: 'James & Sarah Mitchell', project: 'Hampton Residence', amount: 48000, outstanding: 0, status: 'Paid', issued: new Date(2024, 7, 1), due: new Date(2024, 7, 15) },
  { id: 'INV-008', client: 'Alexandra Thompson', project: 'Coastal Villa Renovation', amount: 72000, outstanding: 0, status: 'Paid', issued: new Date(2024, 8, 1), due: new Date(2024, 8, 15) },
];

const statusColors: Record<string, string> = {
  Paid: 'bg-green-50 text-green-700',
  Pending: 'bg-amber-50 text-amber-700',
  Overdue: 'bg-red-50 text-red-700',
  Upcoming: 'bg-blue-50 text-blue-700',
  Draft: 'bg-muted text-muted-foreground',
};

const statusFilters = ['All', 'Pending', 'Paid', 'Overdue', 'Upcoming'];

function formatDate(d: Date): string {
  return d.toLocaleDateString('en-AU', { day: 'numeric', month: 'short', year: 'numeric' });
}

function getDateRange(filter: string): { start: Date; end: Date } {
  const now = new Date();
  switch (filter) {
    case 'current':
      return { start: new Date(now.getFullYear(), now.getMonth(), 1), end: new Date(now.getFullYear(), now.getMonth() + 1, 0) };
    case 'last':
      return { start: new Date(now.getFullYear(), now.getMonth() - 1, 1), end: new Date(now.getFullYear(), now.getMonth(), 0) };
    case '3m':
      return { start: new Date(now.getFullYear(), now.getMonth() - 3, 1), end: new Date(now.getFullYear(), now.getMonth() + 1, 0) };
    case '6m':
      return { start: new Date(now.getFullYear(), now.getMonth() - 6, 1), end: new Date(now.getFullYear(), now.getMonth() + 1, 0) };
    case 'year':
      return { start: new Date(now.getFullYear(), 0, 1), end: new Date(now.getFullYear(), 11, 31) };
    default:
      return { start: new Date(now.getFullYear(), now.getMonth(), 1), end: new Date(now.getFullYear(), now.getMonth() + 1, 0) };
  }
}

export default function FinancePage() {
  const [monthFilter, setMonthFilter] = useState('year');
  const [showMonthMenu, setShowMonthMenu] = useState(false);
  const [statusFilter, setStatusFilter] = useState('All');
  const monthMenuRef = useRef<HTMLDivElement>(null);
  const [invoices, setInvoices] = useState(allInvoices);
  const [editingInvoice, setEditingInvoice] = useState<typeof allInvoices[0] | null>(null);
  const [showNewPanel, setShowNewPanel] = useState(false);
  const [newInvoice, setNewInvoice] = useState({ id: '', client: '', project: '', amount: 0, outstanding: 0, status: 'Draft', issued: new Date(), due: new Date() });

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (monthMenuRef.current && !monthMenuRef.current.contains(e.target as Node)) setShowMonthMenu(false);
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const dateRange = getDateRange(monthFilter);

  const filteredInvoices = useMemo(() => {
    return invoices.filter((inv) => {
      if (statusFilter !== 'All' && inv.status !== statusFilter) return false;
      return inv.issued >= dateRange.start && inv.issued <= dateRange.end;
    });
  }, [invoices, statusFilter, dateRange]);

  const totalRevenue = allInvoices.filter(i => i.status === 'Paid').reduce((s, i) => s + i.amount, 0);
  const paidCount = allInvoices.filter(i => i.status === 'Paid').length;
  const totalIssued = allInvoices.reduce((s, i) => s + i.amount, 0);
  const issuedCount = allInvoices.length;
  const overdueTotal = allInvoices.filter(i => i.status === 'Overdue').reduce((s, i) => s + i.outstanding, 0);
  const overdueCount = allInvoices.filter(i => i.status === 'Overdue').length;

  const selectedMonth = monthOptions.find(m => m.value === monthFilter);

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Invoices</h1>
        <button onClick={() => setShowNewPanel(true)} className="btn-primary">Create Invoice</button>
      </div>

      {/* KPI Cards — 3 columns */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="kpi-card flex items-center gap-4">
          <div className="w-11 h-11 rounded-xl bg-muted flex items-center justify-center flex-shrink-0">
            <TrendingUp size={20} className="text-muted-foreground" />
          </div>
          <div className="min-w-0">
            <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide">Total Project Earnings</p>
            <p className="text-xl font-semibold mt-0.5 truncate">{formatCurrency(totalRevenue)}</p>
            <p className="text-xs text-muted-foreground mt-0.5">{paidCount} paid invoice{paidCount !== 1 ? 's' : ''}</p>
          </div>
        </div>

        <div className="kpi-card flex items-center gap-4">
          <div className="w-11 h-11 rounded-xl bg-muted flex items-center justify-center flex-shrink-0">
            <FileText size={20} className="text-muted-foreground" />
          </div>
          <div className="min-w-0">
            <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide">Total Invoices Issued</p>
            <p className="text-xl font-semibold mt-0.5 truncate">{formatCurrency(totalIssued)}</p>
            <p className="text-xs text-muted-foreground mt-0.5">{issuedCount} invoice{issuedCount !== 1 ? 's' : ''} issued</p>
          </div>
        </div>

        <div className="kpi-card flex items-center gap-4">
          <div className="w-11 h-11 rounded-xl bg-muted flex items-center justify-center flex-shrink-0">
            <AlertCircle size={20} className="text-muted-foreground" />
          </div>
          <div className="min-w-0">
            <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide">Total Overdue Invoices</p>
            <p className="text-xl font-semibold mt-0.5 truncate">{formatCurrency(overdueTotal)}</p>
            <p className="text-xs text-muted-foreground mt-0.5">{overdueCount} overdue invoice{overdueCount !== 1 ? 's' : ''}</p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-1">
          {statusFilters.map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`px-3 h-8 text-sm rounded-lg transition-colors ${
                statusFilter === s ? 'bg-foreground text-background font-medium' : 'text-muted-foreground hover:bg-muted'
              }`}
            >
              {s}
            </button>
          ))}
        </div>

        <div ref={monthMenuRef} className="relative">
          <button
            onClick={() => setShowMonthMenu(!showMonthMenu)}
            className="notion-button border border-border gap-1.5"
          >
            {selectedMonth?.label}
            <ChevronDown size={14} />
          </button>
          {showMonthMenu && (
            <div className="absolute right-0 mt-1 w-52 bg-popover border border-border rounded-xl shadow-lg z-20 py-1">
              {monthOptions.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => { setMonthFilter(opt.value); setShowMonthMenu(false); }}
                  className={`flex items-center justify-between w-full px-4 py-2 text-sm text-left hover:bg-muted transition-colors ${
                    monthFilter === opt.value ? 'text-foreground font-medium' : 'text-muted-foreground'
                  }`}
                >
                  {opt.label}
                  {monthFilter === opt.value && <Check size={14} />}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Invoice table */}
      <div className="card-base overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border bg-muted/30">
              <th className="table-header text-left">Invoice</th>
              <th className="table-header text-left">Project</th>
              <th className="table-header text-left">Client</th>
              <th className="table-header text-left">Issued</th>
              <th className="table-header text-right">Total</th>
              <th className="table-header text-right">Outstanding</th>
              <th className="table-header text-left">Due</th>
              <th className="table-header text-left">Status</th>
            </tr>
          </thead>
          <tbody>
            {filteredInvoices.map((invoice) => (
              <tr key={invoice.id} onClick={() => setEditingInvoice(invoice)} className="hover:bg-muted/20 cursor-pointer border-b border-border/50 last:border-b-0 transition-colors">
                <td className="table-cell font-medium">{invoice.id}</td>
                <td className="table-cell text-muted-foreground">{invoice.project}</td>
                <td className="table-cell text-muted-foreground">{invoice.client}</td>
                <td className="table-cell text-muted-foreground">{formatDate(invoice.issued)}</td>
                <td className="table-cell text-right font-medium">{formatCurrency(invoice.amount)}</td>
                <td className="table-cell text-right text-muted-foreground">{formatCurrency(invoice.outstanding)}</td>
                <td className="table-cell text-muted-foreground">{formatDate(invoice.due)}</td>
                <td className="table-cell">
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusColors[invoice.status] ?? 'bg-muted text-muted-foreground'}`}>
                    {invoice.status}
                  </span>
                </td>
              </tr>
            ))}
            {filteredInvoices.length === 0 && (
              <tr>
                <td colSpan={8} className="table-cell text-center text-muted-foreground py-12">
                  No invoices match the selected filters.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      {/* Edit Invoice Side Panel */}
      {editingInvoice && (
        <SidePanel
          title="Edit Invoice"
          subtitle={editingInvoice.id}
          onClose={() => setEditingInvoice(null)}
          footer={
            <>
              <div />
              <div className="flex gap-2">
                <button onClick={() => setEditingInvoice(null)} className="notion-button border border-border">Cancel</button>
                <button
                  onClick={() => {
                    setInvoices(prev => prev.map(i => i.id === editingInvoice.id ? editingInvoice : i));
                    setEditingInvoice(null);
                  }}
                  className="btn-primary"
                >
                  Save
                </button>
              </div>
            </>
          }
        >
          <div className="px-6 py-5 space-y-4">
            <div>
              <label className="block text-xs text-muted-foreground mb-1.5">Invoice ID</label>
              <input value={editingInvoice.id} onChange={e => setEditingInvoice({ ...editingInvoice, id: e.target.value })} className="modal-input" />
            </div>
            <div>
              <label className="block text-xs text-muted-foreground mb-1.5">Client</label>
              <input value={editingInvoice.client} onChange={e => setEditingInvoice({ ...editingInvoice, client: e.target.value })} className="modal-input" />
            </div>
            <div>
              <label className="block text-xs text-muted-foreground mb-1.5">Project</label>
              <input value={editingInvoice.project} onChange={e => setEditingInvoice({ ...editingInvoice, project: e.target.value })} className="modal-input" />
            </div>
            <div>
              <label className="block text-xs text-muted-foreground mb-1.5">Status</label>
              <SelectDropdown
                value={editingInvoice.status}
                options={['Draft', 'Pending', 'Paid', 'Overdue', 'Upcoming']}
                onChange={(v) => setEditingInvoice({ ...editingInvoice, status: v })}
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-muted-foreground mb-1.5">Amount</label>
                <input type="number" value={editingInvoice.amount} onChange={e => setEditingInvoice({ ...editingInvoice, amount: parseFloat(e.target.value) || 0 })} className="modal-input" />
              </div>
              <div>
                <label className="block text-xs text-muted-foreground mb-1.5">Outstanding</label>
                <input type="number" value={editingInvoice.outstanding} onChange={e => setEditingInvoice({ ...editingInvoice, outstanding: parseFloat(e.target.value) || 0 })} className="modal-input" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-muted-foreground mb-1.5">Issued Date</label>
                <DatePicker value={formatDate(editingInvoice.issued)} onChange={(v) => { const d = new Date(v); if (!isNaN(d.getTime())) setEditingInvoice({ ...editingInvoice, issued: d }); }} />
              </div>
              <div>
                <label className="block text-xs text-muted-foreground mb-1.5">Due Date</label>
                <DatePicker value={formatDate(editingInvoice.due)} onChange={(v) => { const d = new Date(v); if (!isNaN(d.getTime())) setEditingInvoice({ ...editingInvoice, due: d }); }} />
              </div>
            </div>
          </div>
        </SidePanel>
      )}

      {/* New Invoice Side Panel */}
      {showNewPanel && (
        <SidePanel
          title="New Invoice"
          onClose={() => setShowNewPanel(false)}
          footer={
            <>
              <div />
              <div className="flex gap-2">
                <button onClick={() => setShowNewPanel(false)} className="notion-button border border-border">Cancel</button>
                <button
                  onClick={() => {
                    if (!newInvoice.client) return;
                    const inv = { ...newInvoice, id: `INV-${String(invoices.length + 1).padStart(3, '0')}` };
                    setInvoices(prev => [...prev, inv]);
                    setShowNewPanel(false);
                    setNewInvoice({ id: '', client: '', project: '', amount: 0, outstanding: 0, status: 'Draft', issued: new Date(), due: new Date() });
                  }}
                  className="btn-primary"
                >
                  Create Invoice
                </button>
              </div>
            </>
          }
        >
          <div className="px-6 py-5 space-y-4">
            <div>
              <label className="block text-xs text-muted-foreground mb-1.5">Client *</label>
              <input value={newInvoice.client} onChange={e => setNewInvoice({ ...newInvoice, client: e.target.value })} placeholder="Client name" className="modal-input" />
            </div>
            <div>
              <label className="block text-xs text-muted-foreground mb-1.5">Project</label>
              <input value={newInvoice.project} onChange={e => setNewInvoice({ ...newInvoice, project: e.target.value })} placeholder="Project name" className="modal-input" />
            </div>
            <div>
              <label className="block text-xs text-muted-foreground mb-1.5">Status</label>
              <SelectDropdown
                value={newInvoice.status}
                options={['Draft', 'Pending', 'Paid', 'Overdue', 'Upcoming']}
                onChange={(v) => setNewInvoice({ ...newInvoice, status: v })}
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-muted-foreground mb-1.5">Amount</label>
                <input type="number" value={newInvoice.amount} onChange={e => setNewInvoice({ ...newInvoice, amount: parseFloat(e.target.value) || 0 })} className="modal-input" />
              </div>
              <div>
                <label className="block text-xs text-muted-foreground mb-1.5">Outstanding</label>
                <input type="number" value={newInvoice.outstanding} onChange={e => setNewInvoice({ ...newInvoice, outstanding: parseFloat(e.target.value) || 0 })} className="modal-input" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-muted-foreground mb-1.5">Issued Date</label>
                <DatePicker value={formatDate(newInvoice.issued)} onChange={(v) => { const d = new Date(v); if (!isNaN(d.getTime())) setNewInvoice({ ...newInvoice, issued: d }); }} />
              </div>
              <div>
                <label className="block text-xs text-muted-foreground mb-1.5">Due Date</label>
                <DatePicker value={formatDate(newInvoice.due)} onChange={(v) => { const d = new Date(v); if (!isNaN(d.getTime())) setNewInvoice({ ...newInvoice, due: d }); }} />
              </div>
            </div>
          </div>
        </SidePanel>
      )}
    </div>
  );
}
