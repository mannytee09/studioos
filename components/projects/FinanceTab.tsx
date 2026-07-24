'use client';

import { useState, useMemo, useRef, useEffect, useCallback } from 'react';
import { Search, Plus, FileDown, Trash2, Receipt, TrendingUp, FileText, CircleAlert as AlertCircle, ChevronDown, Check, SeparatorHorizontal } from 'lucide-react';
import { Project, Invoice, InvoiceLineItem, formatBudget } from '@/lib/projects-data';
import { useCrm } from '@/lib/crm-context';
import { SidePanel, useCoordinatedClose } from '@/components/ui/SidePanel';
import { DatePicker } from '@/components/ui/DatePicker';
import { InvoicePreview, InvoicePreviewData } from '@/components/projects/InvoicePreview';

interface FinanceTabProps {
  project: Project;
  onUpdateInvoices?: (invoices: Invoice[]) => void;
}

type InvoiceFilter = 'Paid' | 'Unpaid' | 'Overdue' | 'Issued' | 'Draft';
const invoiceFilters: InvoiceFilter[] = ['Paid', 'Unpaid', 'Overdue', 'Issued', 'Draft'];

const statusBadgeColors: Record<string, string> = {
  Paid: 'bg-green-50 text-green-700 border border-green-200',
  Unpaid: 'bg-amber-50 text-amber-700 border border-amber-200',
  Overdue: 'bg-red-50 text-red-700 border border-red-200',
  Issued: 'bg-blue-50 text-blue-700 border border-blue-200',
  Draft: 'bg-gray-100 text-gray-600 border border-gray-200',
};

interface LineItem { id: string; description: string; hours: string; rate: string; isPageBreak?: boolean; }

function emptyLine(): LineItem { return { id: `li-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`, description: '', hours: '', rate: '' }; }
function toISODate(d: Date): string { return d.toISOString().slice(0, 10); }
function lineAmount(l: LineItem): number {
  const h = parseFloat(l.hours) || 0;
  const r = parseFloat(String(l.rate).replace(/[^0-9.]/g, '')) || 0;
  return h * r;
}
function fmtDate(iso: string): string {
  if (!iso) return '';
  const d = new Date(iso);
  if (isNaN(d.getTime())) return iso;
  return d.toLocaleDateString('en-AU', { day: 'numeric', month: 'short', year: 'numeric' });
}

// Format hours as 0.00
function fmtHours(v: string): string {
  const n = parseFloat(v);
  if (isNaN(n)) return '';
  return n.toFixed(2);
}
// Format rate as $0.00
function fmtRate(v: string): string {
  const n = parseFloat(v);
  if (isNaN(n)) return '';
  return `$${n.toFixed(2)}`;
}

// ── Status dropdown (shared) ─────────────────────────────────────────────────
function StatusDropdown({ value, onChange }: { value: Invoice['status']; onChange: (s: Invoice['status']) => void }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
      >
        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusBadgeColors[value] || 'bg-muted text-muted-foreground'}`}>{value}</span>
        <ChevronDown size={14} className="text-muted-foreground" />
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-20" onClick={() => setOpen(false)} />
          <div className="absolute right-0 mt-1 bg-popover border border-border rounded-xl shadow-lg z-50 py-1 overflow-hidden min-w-32">
            {(['Draft', 'Issued', 'Paid', 'Unpaid', 'Overdue'] as Invoice['status'][]).map(s => (
              <button
                key={s}
                onClick={() => { onChange(s); setOpen(false); }}
                className="flex items-center justify-between w-full px-4 py-2 text-sm text-left hover:bg-muted transition-colors whitespace-nowrap"
              >
                <span className={value === s ? 'text-foreground font-medium' : 'text-muted-foreground'}>{s}</span>
                {value === s && <Check size={14} />}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

// ── Status dropdown for table cells (renders above the container via portal) ──
function StatusCellDropdown({ value, onChange }: { value: Invoice['status']; onChange: (s: Invoice['status']) => void }) {
  const [open, setOpen] = useState(false);
  const [rect, setRect] = useState<DOMRect | null>(null);
  const btnRef = useRef<HTMLButtonElement>(null);

  const handleToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!open && btnRef.current) setRect(btnRef.current.getBoundingClientRect());
    setOpen(!open);
  };

  return (
    <div className="relative">
      <button
        ref={btnRef}
        onClick={handleToggle}
        className="flex items-center gap-1 text-xs px-2 py-0.5 rounded-full font-medium transition-colors hover:opacity-80"
        style={statusBadgeColors[value] ? undefined : undefined}
      >
        <span className={`px-2 py-0.5 rounded-full ${statusBadgeColors[value] || 'bg-muted text-muted-foreground'}`}>{value}</span>
        <ChevronDown size={12} className="text-muted-foreground" />
      </button>
      {open && rect && (
        <>
          <div className="fixed inset-0 z-[70]" onClick={(e) => { e.stopPropagation(); setOpen(false); }} />
          <div
            className="fixed z-[71] bg-popover border border-border rounded-xl shadow-lg py-1 overflow-hidden min-w-32"
            style={{ top: rect.bottom + 4, left: rect.left }}
          >
            {(['Draft', 'Issued', 'Paid', 'Unpaid', 'Overdue'] as Invoice['status'][]).map(s => (
              <button
                key={s}
                onClick={(e) => { e.stopPropagation(); onChange(s); setOpen(false); }}
                className="flex items-center justify-between w-full px-4 py-2 text-sm text-left hover:bg-muted transition-colors whitespace-nowrap"
              >
                <span className={value === s ? 'text-foreground font-medium' : 'text-muted-foreground'}>{s}</span>
                {value === s && <Check size={14} />}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

// ── Client dropdown ──────────────────────────────────────────────────────────
interface ClientDropdownProps {
  value: string;
  onChange: (clientId: string, clientName: string, address1: string, address2: string, address3: string) => void;
  clients: { id: string; company: string; primaryContact: string; address: string }[];
}
function ClientDropdown({ value, onChange, clients }: ClientDropdownProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const btnRef = useRef<HTMLButtonElement>(null);
  const [rect, setRect] = useState<DOMRect | null>(null);

  const filtered = useMemo(() => {
    const q = query.toLowerCase();
    if (!q) return clients;
    return clients.filter(c => c.company.toLowerCase().includes(q) || c.primaryContact.toLowerCase().includes(q));
  }, [clients, query]);

  const handleToggle = () => {
    if (!open && btnRef.current) setRect(btnRef.current.getBoundingClientRect());
    setOpen(!open);
  };

  // Parse a client address string into 3 lines
  const parseAddress = (addr: string): [string, string, string] => {
    if (!addr) return ['', '', ''];
    const parts = addr.split(',').map(s => s.trim()).filter(Boolean);
    if (parts.length >= 3) {
      return [parts[0], parts[1], parts.slice(2).join(', ')];
    } else if (parts.length === 2) {
      return [parts[0], parts[1], ''];
    } else if (parts.length === 1) {
      return [parts[0], '', ''];
    }
    return [addr, '', ''];
  };

  return (
    <div className="relative">
      <button
        ref={btnRef}
        onClick={handleToggle}
        className="modal-input flex items-center justify-between w-full text-left"
      >
        <span className={value ? 'text-foreground' : 'text-muted-foreground'}>{value || 'Select a client...'}</span>
        <ChevronDown size={15} className="text-muted-foreground flex-shrink-0" />
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-20" onClick={() => { setOpen(false); setQuery(''); }} />
          <div className="absolute left-0 right-0 mt-1 bg-popover border border-border rounded-xl shadow-lg z-50 py-1 overflow-hidden max-h-64 flex flex-col">
            <div className="px-2 pb-1.5 flex-shrink-0">
              <div className="relative">
                <Search size={13} className="absolute left-2 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
                <input
                  autoFocus
                  value={query}
                  onChange={e => setQuery(e.target.value)}
                  placeholder="Search clients..."
                  className="w-full pl-7 pr-2 h-8 text-sm border border-border rounded-lg bg-background outline-none focus:border-foreground/30"
                />
              </div>
            </div>
            <div className="overflow-y-auto modal-scroll flex-1">
              {filtered.length === 0 ? (
                <p className="px-3 py-3 text-sm text-muted-foreground text-center">No clients found</p>
              ) : (
                filtered.map(c => (
                  <button
                    key={c.id}
                    onClick={() => {
                      const [a1, a2, a3] = parseAddress(c.address);
                      onChange(c.id, c.company, a1, a2, a3);
                      setOpen(false);
                      setQuery('');
                    }}
                    className="flex items-center justify-between w-full px-3 py-2 text-sm text-left hover:bg-muted transition-colors"
                  >
                    <div className="min-w-0">
                      <p className="font-medium text-foreground truncate">{c.company}</p>
                      <p className="text-xs text-muted-foreground truncate">{c.primaryContact}</p>
                    </div>
                    {value === c.company && <Check size={14} className="text-muted-foreground flex-shrink-0" />}
                  </button>
                ))
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

// ── Shared invoice form fields ───────────────────────────────────────────────

interface InvoiceFormFieldsProps {
  invoiceDate: string;
  setInvoiceDate: (v: string) => void;
  invoiceNumber: string;
  setInvoiceNumber: (v: string) => void;
  clientName: string;
  setClientName: (v: string) => void;
  clientAddress1: string;
  setClientAddress1: (v: string) => void;
  clientAddress2: string;
  setClientAddress2: (v: string) => void;
  clientAddress3: string;
  setClientAddress3: (v: string) => void;
  companyName: string;
  setCompanyName: (v: string) => void;
  companyAddress: string;
  setCompanyAddress: (v: string) => void;
  companySuburb: string;
  setCompanySuburb: (v: string) => void;
  abn: string;
  setAbn: (v: string) => void;
  accountHolder: string;
  setAccountHolder: (v: string) => void;
  bsb: string;
  setBsb: (v: string) => void;
  accountNo: string;
  setAccountNo: (v: string) => void;
  bankName: string;
  setBankName: (v: string) => void;
  bicSwift: string;
  setBicSwift: (v: string) => void;
  referenceDesc: string;
  setReferenceDesc: (v: string) => void;
  dueDate: string;
  setDueDate: (v: string) => void;
  dueOnReceipt: boolean;
  setDueOnReceipt: (v: boolean) => void;
  status: Invoice['status'];
  setStatus: (s: Invoice['status']) => void;
  lines: LineItem[];
  setLines: React.Dispatch<React.SetStateAction<LineItem[]>>;
  notes: string;
  setNotes: (v: string) => void;
  subtotal: number;
  clients: { id: string; company: string; primaryContact: string; address: string }[];
}

function InvoiceFormFields(props: InvoiceFormFieldsProps) {
  const {
    invoiceDate, setInvoiceDate, invoiceNumber, setInvoiceNumber,
    clientName, setClientName,
    clientAddress1, setClientAddress1, clientAddress2, setClientAddress2, clientAddress3, setClientAddress3,
    companyName, setCompanyName, companyAddress, setCompanyAddress, companySuburb, setCompanySuburb,
    abn, setAbn,
    accountHolder, setAccountHolder, bsb, setBsb, accountNo, setAccountNo, bankName, setBankName, bicSwift, setBicSwift,
    referenceDesc, setReferenceDesc,
    dueDate, setDueDate, dueOnReceipt, setDueOnReceipt,
    status, setStatus,
    lines, setLines,
    notes, setNotes,
    subtotal,
    clients,
  } = props;

  const addLine = () => setLines(prev => [...prev, emptyLine()]);
  const addPageBreak = () => setLines(prev => [...prev, { ...emptyLine(), isPageBreak: true, description: 'Page Break' }]);
  const removeLine = (id: string) => setLines(prev => prev.filter(l => l.id !== id));
  const updateLine = (id: string, field: keyof LineItem, value: string) =>
    setLines(prev => prev.map(l => l.id === id ? { ...l, [field]: value } : l));

  // Build combined address string for preview
  const combinedAddress = [clientAddress1, clientAddress2, clientAddress3].filter(Boolean).join('\n');

  const handleClientSelect = (clientId: string, name: string, a1: string, a2: string, a3: string) => {
    setClientName(name);
    setClientAddress1(a1);
    setClientAddress2(a2);
    setClientAddress3(a3);
  };

  return (
    <div className="px-6 py-5 space-y-6">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-xs text-muted-foreground mb-1.5">Invoice Date *</label>
          <DatePicker value={invoiceDate ? fmtDate(invoiceDate) : ''} onChange={(v) => { const d = new Date(v); if (!isNaN(d.getTime())) setInvoiceDate(toISODate(d)); }} placeholder="Select date" />
        </div>
        <div>
          <label className="block text-xs text-muted-foreground mb-1.5">Invoice Number *</label>
          <input value={invoiceNumber} onChange={e => setInvoiceNumber(e.target.value)} placeholder="YY001.001" className="modal-input" />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-3">
          <div>
            <label className="block text-xs font-semibold text-foreground mb-1.5">Bill To *</label>
            <ClientDropdown value={clientName} onChange={handleClientSelect} clients={clients} />
            <div className="mt-2 space-y-2">
              <input value={clientAddress1} onChange={e => setClientAddress1(e.target.value)} placeholder="Address Line 1" className="modal-input" />
              <input value={clientAddress2} onChange={e => setClientAddress2(e.target.value)} placeholder="Address Line 2" className="modal-input" />
              <input value={clientAddress3} onChange={e => setClientAddress3(e.target.value)} placeholder="Address Line 3 (Country, State, Code)" className="modal-input" />
            </div>
          </div>
        </div>
        <div className="space-y-2">
          <label className="block text-xs font-semibold text-foreground mb-1.5">Company Information</label>
          <input value={companyName} onChange={e => setCompanyName(e.target.value)} placeholder="Company name" className="modal-input" />
          <input value={companyAddress} onChange={e => setCompanyAddress(e.target.value)} placeholder="Address" className="modal-input" />
          <input value={companySuburb} onChange={e => setCompanySuburb(e.target.value)} placeholder="Suburb State Postcode, Australia" className="modal-input" />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="block text-xs font-semibold text-foreground mb-1.5">Payment Information</label>
          <input value={accountHolder} onChange={e => setAccountHolder(e.target.value)} placeholder="Account Holder" className="modal-input" />
          <div className="grid grid-cols-2 gap-2">
            <input value={bsb} onChange={e => setBsb(e.target.value)} placeholder="BSB" className="modal-input" />
            <input value={accountNo} onChange={e => setAccountNo(e.target.value)} placeholder="Account No" className="modal-input" />
          </div>
          <input value={bankName} onChange={e => setBankName(e.target.value)} placeholder="Bank Name" className="modal-input" />
          <input value={bicSwift} onChange={e => setBicSwift(e.target.value)} placeholder="BIC/SWIFT Code" className="modal-input" />
        </div>
        <div>
          <label className="block text-xs font-semibold text-foreground mb-1.5">ABN</label>
          <input value={abn} onChange={e => setAbn(e.target.value)} placeholder="12 345 678 910" className="modal-input" />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-semibold text-foreground mb-1.5">Reference Description</label>
          <input value={referenceDesc} onChange={e => setReferenceDesc(e.target.value)} placeholder="Reference Description" className="modal-input" />
        </div>
        <div>
          <label className="block text-xs font-semibold text-foreground mb-1.5">Due Date</label>
          <div className="flex items-center gap-2 mb-2">
            <input type="checkbox" id="on-receipt" checked={dueOnReceipt} onChange={e => setDueOnReceipt(e.target.checked)} className="rounded" />
            <label htmlFor="on-receipt" className="text-sm text-muted-foreground">Upon Receipt</label>
          </div>
          {!dueOnReceipt && (
            <DatePicker value={dueDate ? fmtDate(dueDate) : ''} onChange={(v) => { const d = new Date(v); if (!isNaN(d.getTime())) setDueDate(toISODate(d)); }} placeholder="Select date" />
          )}
        </div>
      </div>

      <div>
        <label className="block text-xs font-semibold text-foreground mb-2">Line Items</label>
        <div className="border border-border rounded-xl overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="bg-muted/30 border-b border-border">
                <th className="text-left text-xs text-muted-foreground font-medium px-3 py-2">Description</th>
                <th className="text-right text-xs text-muted-foreground font-medium px-3 py-2 w-20">Hours</th>
                <th className="text-right text-xs text-muted-foreground font-medium px-3 py-2 w-28">Hourly Rate AUD</th>
                <th className="text-right text-xs text-muted-foreground font-medium px-3 py-2 w-28">Amount AUD</th>
                <th className="w-8" />
              </tr>
            </thead>
            <tbody>
              {lines.map(line =>
                line.isPageBreak ? (
                  <tr key={line.id} className="border-b border-border/40 last:border-b-0 bg-muted/20">
                    <td colSpan={4} className="px-3 py-2.5 text-center">
                      <span className="text-xs text-muted-foreground font-medium tracking-wide">Page Break</span>
                    </td>
                    <td className="px-2 py-2.5">
                      <button onClick={() => removeLine(line.id)} className="text-muted-foreground hover:text-red-500 transition-colors">
                        <Trash2 size={13} />
                      </button>
                    </td>
                  </tr>
                ) : (
                  <tr key={line.id} className="border-b border-border/40 last:border-b-0">
                    <td className="px-3 py-2">
                      <input value={line.description} onChange={e => updateLine(line.id, 'description', e.target.value)} placeholder="Description" className="w-full text-sm outline-none bg-transparent" />
                    </td>
                    <td className="px-3 py-2">
                      <input
                        type="text"
                        value={line.hours}
                        onChange={e => updateLine(line.id, 'hours', e.target.value)}
                        onBlur={e => updateLine(line.id, 'hours', fmtHours(e.target.value))}
                        placeholder="0.00"
                        className="w-full text-sm text-right outline-none bg-transparent"
                      />
                    </td>
                    <td className="px-3 py-2">
                      <input
                        type="text"
                        value={line.rate}
                        onChange={e => updateLine(line.id, 'rate', e.target.value)}
                        onBlur={e => updateLine(line.id, 'rate', fmtRate(e.target.value))}
                        placeholder="$0.00"
                        className="w-full text-sm text-right outline-none bg-transparent"
                      />
                    </td>
                    <td className="px-3 py-2 text-right text-sm">${lineAmount(line).toFixed(2)}</td>
                    <td className="px-2 py-2">
                      {lines.length > 1 && (
                        <button onClick={() => removeLine(line.id)} className="text-muted-foreground hover:text-red-500 transition-colors">
                          <Trash2 size={13} />
                        </button>
                      )}
                    </td>
                  </tr>
                )
              )}
            </tbody>
          </table>
          <div className="px-3 py-2 border-t border-border/40 flex items-center gap-4">
            <button onClick={addLine} className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors">
              <Plus size={13} />
              Add line item
            </button>
            <button onClick={addPageBreak} className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors">
              <SeparatorHorizontal size={13} />
              Add page break
            </button>
          </div>
        </div>

        <div className="flex justify-end mt-3">
          <div className="w-56 space-y-1.5">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Subtotal</span>
              <span>${subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm font-semibold border-t border-border pt-1.5">
              <span>TOTAL AUD</span>
              <span>${subtotal.toFixed(2)}</span>
            </div>
          </div>
        </div>
      </div>

      <div>
        <label className="block text-xs font-semibold text-foreground mb-1.5">Notes</label>
        <textarea value={notes} onChange={e => setNotes(e.target.value)} placeholder="Additional notes..." rows={3} className="modal-input resize-none" />
      </div>
    </div>
  );
}

// ── Build live preview data from form state ──────────────────────────────────
function buildPreviewData(p: {
  invoiceNumber: string; clientName: string; clientAddress1: string; clientAddress2: string; clientAddress3: string;
  companyName: string; companyAddress: string; companySuburb: string;
  abn: string; accountHolder: string; bsb: string; accountNo: string;
  bankName: string; bicSwift: string; referenceDesc: string;
  invoiceDate: string; dueOnReceipt: boolean; dueDate: string;
  status: Invoice['status']; lines: LineItem[]; notes: string; subtotal: number;
}): InvoicePreviewData {
  const combinedAddress = [p.clientAddress1, p.clientAddress2, p.clientAddress3].filter(Boolean).join('\n');
  return {
    number: p.invoiceNumber,
    clientName: p.clientName,
    clientAddress: combinedAddress,
    companyName: p.companyName,
    companyAddress: p.companyAddress,
    companySuburb: p.companySuburb,
    abn: p.abn,
    accountHolder: p.accountHolder,
    bsb: p.bsb,
    accountNo: p.accountNo,
    bankName: p.bankName,
    bicSwift: p.bicSwift,
    referenceDesc: p.referenceDesc,
    issuedDate: p.invoiceDate ? fmtDate(p.invoiceDate) : '',
    dueDate: p.dueOnReceipt ? 'Upon Receipt' : (p.dueDate ? fmtDate(p.dueDate) : ''),
    status: p.status,
    lineItems: p.lines.map(l => ({ id: l.id, description: l.description, hours: l.hours, rate: l.rate, isPageBreak: l.isPageBreak })),
    notes: p.notes,
    amount: p.subtotal,
  };
}

// ── Parse saved clientAddress (multi-line) back into 3 fields ─────────────────
function parseSavedAddress(addr: string): [string, string, string] {
  if (!addr) return ['', '', ''];
  const lines = addr.split('\n').map(s => s.trim()).filter(Boolean);
  if (lines.length >= 3) return [lines[0], lines[1], lines.slice(2).join(', ')];
  if (lines.length === 2) return [lines[0], lines[1], ''];
  if (lines.length === 1) return [lines[0], '', ''];
  return [addr, '', ''];
}

// ── Add Invoice Panel (SidePanel + floating preview) ─────────────────────────
interface AddInvoicePanelProps {
  project: Project;
  clients: { id: string; company: string; primaryContact: string; address: string }[];
  onClose: () => void;
  onSave: (inv: Invoice) => void;
}

function AddInvoicePanel({ project, clients, onClose, onSave }: AddInvoicePanelProps) {
  const [invoiceDate, setInvoiceDate] = useState('');
  const [invoiceNumber, setInvoiceNumber] = useState('');
  const [clientName, setClientName] = useState('');
  const [clientAddress1, setClientAddress1] = useState('');
  const [clientAddress2, setClientAddress2] = useState('');
  const [clientAddress3, setClientAddress3] = useState('');
  const [companyName, setCompanyName] = useState('ergonome studio');
  const [companyAddress, setCompanyAddress] = useState('');
  const [companySuburb, setCompanySuburb] = useState('');
  const [abn, setAbn] = useState('');
  const [accountHolder, setAccountHolder] = useState('');
  const [bsb, setBsb] = useState('');
  const [accountNo, setAccountNo] = useState('');
  const [bankName, setBankName] = useState('');
  const [bicSwift, setBicSwift] = useState('');
  const [referenceDesc, setReferenceDesc] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [dueOnReceipt, setDueOnReceipt] = useState(false);
  const [status, setStatus] = useState<Invoice['status']>('Issued');
  const [lines, setLines] = useState<LineItem[]>([emptyLine()]);
  const [notes, setNotes] = useState('');

  const subtotal = useMemo(() => lines.reduce((s, l) => s + lineAmount(l), 0), [lines]);

  const previewData = useMemo(() => buildPreviewData({
    invoiceNumber, clientName, clientAddress1, clientAddress2, clientAddress3, companyName, companyAddress, companySuburb,
    abn, accountHolder, bsb, accountNo, bankName, bicSwift, referenceDesc,
    invoiceDate, dueOnReceipt, dueDate, status, lines, notes, subtotal,
  }), [invoiceNumber, clientName, clientAddress1, clientAddress2, clientAddress3, companyName, companyAddress, companySuburb, abn, accountHolder, bsb, accountNo, bankName, bicSwift, referenceDesc, invoiceDate, dueOnReceipt, dueDate, status, lines, notes, subtotal]);

  const canSave = invoiceDate && invoiceNumber && clientName;

  const { closingExtension, closingPanel, handleClose } = useCoordinatedClose(onClose);

  const handleExportPDF = () => setTimeout(() => window.print(), 400);

  const combinedAddress = [clientAddress1, clientAddress2, clientAddress3].filter(Boolean).join('\n');

  const handleSave = () => {
    if (!canSave) return;
    const inv: Invoice = {
      id: `inv-${Date.now()}`,
      number: invoiceNumber,
      clientName,
      clientAddress: combinedAddress,
      amount: subtotal,
      issuedDate: fmtDate(invoiceDate),
      dueDate: dueOnReceipt ? 'Upon Receipt' : (dueDate ? fmtDate(dueDate) : ''),
      status,
      companyName,
      companyAddress,
      companySuburb,
      abn,
      accountHolder,
      bsb,
      accountNo,
      bankName,
      bicSwift,
      referenceDesc,
      lineItems: lines.map(l => ({ id: l.id, description: l.description, hours: l.hours, rate: l.rate, isPageBreak: l.isPageBreak })),
      notes,
    };
    onSave(inv);
  };

  return (
    <>
      <SidePanel
        title="New Invoice"
        subtitle={project.name}
        onClose={handleClose}
        closing={closingPanel}
        closingExtension={closingExtension}
        width="min(42vw, 640px)"
        headerExtra={
          <div className="ml-auto pt-0.5">
            <StatusDropdown value={status} onChange={setStatus} />
          </div>
        }
        extension={
          <>
            <div className="flex items-start justify-between gap-3 px-6 pt-4 pb-3 border-b border-border flex-shrink-0 print:hidden">
              <div className="min-w-0 pt-0.5">
                <h2 className="font-semibold text-base leading-none">Live Preview</h2>
                <p className="text-xs text-muted-foreground mt-1 truncate">{previewData.number || 'Invoice'} · {previewData.clientName || '—'}</p>
              </div>
            </div>
            <div className="flex-1 min-h-0 modal-scroll flex items-center justify-center p-6">
              <InvoicePreview data={previewData} showNavigation />
            </div>
            <div className="flex items-center justify-between px-6 py-4 border-t border-border bg-card flex-shrink-0 print:hidden">
              <span className="text-xs text-muted-foreground">A4 Portrait</span>
            </div>
          </>
        }
        footer={
          <>
            <button onClick={handleExportPDF} className="notion-button border border-border">
              <FileDown size={15} /> Export PDF
            </button>
            <div className="flex gap-2">
              <button onClick={handleClose} className="notion-button border border-border">Cancel</button>
              <button onClick={handleSave} disabled={!canSave} className="btn-primary disabled:opacity-40 disabled:cursor-not-allowed">
                Create Invoice
              </button>
            </div>
          </>
        }
      >
        <InvoiceFormFields
          invoiceDate={invoiceDate} setInvoiceDate={setInvoiceDate}
          invoiceNumber={invoiceNumber} setInvoiceNumber={setInvoiceNumber}
          clientName={clientName} setClientName={setClientName}
          clientAddress1={clientAddress1} setClientAddress1={setClientAddress1}
          clientAddress2={clientAddress2} setClientAddress2={setClientAddress2}
          clientAddress3={clientAddress3} setClientAddress3={setClientAddress3}
          companyName={companyName} setCompanyName={setCompanyName}
          companyAddress={companyAddress} setCompanyAddress={setCompanyAddress}
          companySuburb={companySuburb} setCompanySuburb={setCompanySuburb}
          abn={abn} setAbn={setAbn}
          accountHolder={accountHolder} setAccountHolder={setAccountHolder}
          bsb={bsb} setBsb={setBsb}
          accountNo={accountNo} setAccountNo={setAccountNo}
          bankName={bankName} setBankName={setBankName}
          bicSwift={bicSwift} setBicSwift={setBicSwift}
          referenceDesc={referenceDesc} setReferenceDesc={setReferenceDesc}
          dueDate={dueDate} setDueDate={setDueDate}
          dueOnReceipt={dueOnReceipt} setDueOnReceipt={setDueOnReceipt}
          status={status} setStatus={setStatus}
          lines={lines} setLines={setLines}
          notes={notes} setNotes={setNotes}
          subtotal={subtotal}
          clients={clients}
        />
      </SidePanel>
    </>
  );
}

// ── Edit Invoice Panel (same full form as Add, pre-filled) ───────────────────
interface EditInvoicePanelProps {
  invoice: Invoice;
  clients: { id: string; company: string; primaryContact: string; address: string }[];
  onClose: () => void;
  onSave: (inv: Invoice) => void;
}

function EditInvoicePanel({ invoice, clients, onClose, onSave }: EditInvoicePanelProps) {
  const [invoiceDate, setInvoiceDate] = useState('');
  const [invoiceNumber, setInvoiceNumber] = useState(invoice.number);
  const [clientName, setClientName] = useState(invoice.clientName);
  const [parsedAddr] = useState(() => parseSavedAddress(invoice.clientAddress || ''));
  const [clientAddress1, setClientAddress1] = useState(parsedAddr[0]);
  const [clientAddress2, setClientAddress2] = useState(parsedAddr[1]);
  const [clientAddress3, setClientAddress3] = useState(parsedAddr[2]);
  const [companyName, setCompanyName] = useState(invoice.companyName || 'ergonome studio');
  const [companyAddress, setCompanyAddress] = useState(invoice.companyAddress || '');
  const [companySuburb, setCompanySuburb] = useState(invoice.companySuburb || '');
  const [abn, setAbn] = useState(invoice.abn || '');
  const [accountHolder, setAccountHolder] = useState(invoice.accountHolder || '');
  const [bsb, setBsb] = useState(invoice.bsb || '');
  const [accountNo, setAccountNo] = useState(invoice.accountNo || '');
  const [bankName, setBankName] = useState(invoice.bankName || '');
  const [bicSwift, setBicSwift] = useState(invoice.bicSwift || '');
  const [referenceDesc, setReferenceDesc] = useState(invoice.referenceDesc || '');
  const [dueDate, setDueDate] = useState('');
  const [dueOnReceipt, setDueOnReceipt] = useState(false);
  const [status, setStatus] = useState<Invoice['status']>(invoice.status);
  const [lines, setLines] = useState<LineItem[]>(
    invoice.lineItems && invoice.lineItems.length > 0
      ? invoice.lineItems.map(l => ({ id: l.id, description: l.description, hours: l.hours, rate: l.rate, isPageBreak: l.isPageBreak }))
      : [emptyLine()]
  );
  const [notes, setNotes] = useState(invoice.notes || '');

  useEffect(() => {
    if (invoice.issuedDate) {
      const d = new Date(invoice.issuedDate);
      if (!isNaN(d.getTime())) setInvoiceDate(toISODate(d));
    }
    if (invoice.dueDate) {
      if (invoice.dueDate === 'Upon Receipt') {
        setDueOnReceipt(true);
      } else {
        const d = new Date(invoice.dueDate);
        if (!isNaN(d.getTime())) setDueDate(toISODate(d));
      }
    }
  }, [invoice.issuedDate, invoice.dueDate]);

  const subtotal = useMemo(() => lines.reduce((s, l) => s + lineAmount(l), 0), [lines]);

  const previewData = useMemo(() => buildPreviewData({
    invoiceNumber, clientName, clientAddress1, clientAddress2, clientAddress3, companyName, companyAddress, companySuburb,
    abn, accountHolder, bsb, accountNo, bankName, bicSwift, referenceDesc,
    invoiceDate, dueOnReceipt, dueDate, status, lines, notes, subtotal,
  }), [invoiceNumber, clientName, clientAddress1, clientAddress2, clientAddress3, companyName, companyAddress, companySuburb, abn, accountHolder, bsb, accountNo, bankName, bicSwift, referenceDesc, invoiceDate, dueOnReceipt, dueDate, status, lines, notes, subtotal]);

  const { closingExtension, closingPanel, handleClose } = useCoordinatedClose(onClose);

  const handleExportPDF = () => setTimeout(() => window.print(), 400);

  const combinedAddress = [clientAddress1, clientAddress2, clientAddress3].filter(Boolean).join('\n');

  const handleSave = () => {
    onSave({
      ...invoice,
      number: invoiceNumber,
      clientName,
      clientAddress: combinedAddress,
      amount: subtotal,
      issuedDate: invoiceDate ? fmtDate(invoiceDate) : invoice.issuedDate,
      dueDate: dueOnReceipt ? 'Upon Receipt' : (dueDate ? fmtDate(dueDate) : invoice.dueDate),
      status,
      companyName,
      companyAddress,
      companySuburb,
      abn,
      accountHolder,
      bsb,
      accountNo,
      bankName,
      bicSwift,
      referenceDesc,
      lineItems: lines.map(l => ({ id: l.id, description: l.description, hours: l.hours, rate: l.rate, isPageBreak: l.isPageBreak })),
      notes,
    });
  };

  return (
    <>
      <SidePanel
        title="Edit Invoice"
        subtitle={invoice.number}
        onClose={handleClose}
        closing={closingPanel}
        closingExtension={closingExtension}
        width="min(42vw, 640px)"
        headerExtra={
          <div className="ml-auto pt-0.5">
            <StatusDropdown value={status} onChange={setStatus} />
          </div>
        }
        extension={
          <>
            <div className="flex items-start justify-between gap-3 px-6 pt-4 pb-3 border-b border-border flex-shrink-0 print:hidden">
              <div className="min-w-0 pt-0.5">
                <h2 className="font-semibold text-base leading-none">Live Preview</h2>
                <p className="text-xs text-muted-foreground mt-1 truncate">{previewData.number || 'Invoice'} · {previewData.clientName || '—'}</p>
              </div>
            </div>
            <div className="flex-1 min-h-0 modal-scroll flex items-center justify-center p-6">
              <InvoicePreview data={previewData} showNavigation />
            </div>
            <div className="flex items-center justify-between px-6 py-4 border-t border-border bg-card flex-shrink-0 print:hidden">
              <span className="text-xs text-muted-foreground">A4 Portrait</span>
            </div>
          </>
        }
        footer={
          <>
            <button onClick={handleExportPDF} className="notion-button border border-border">
              <FileDown size={15} /> Export PDF
            </button>
            <div className="flex gap-2">
              <button onClick={handleClose} className="notion-button border border-border">Cancel</button>
              <button onClick={handleSave} className="btn-primary">Save Changes</button>
            </div>
          </>
        }
      >
        <InvoiceFormFields
          invoiceDate={invoiceDate} setInvoiceDate={setInvoiceDate}
          invoiceNumber={invoiceNumber} setInvoiceNumber={setInvoiceNumber}
          clientName={clientName} setClientName={setClientName}
          clientAddress1={clientAddress1} setClientAddress1={setClientAddress1}
          clientAddress2={clientAddress2} setClientAddress2={setClientAddress2}
          clientAddress3={clientAddress3} setClientAddress3={setClientAddress3}
          companyName={companyName} setCompanyName={setCompanyName}
          companyAddress={companyAddress} setCompanyAddress={setCompanyAddress}
          companySuburb={companySuburb} setCompanySuburb={setCompanySuburb}
          abn={abn} setAbn={setAbn}
          accountHolder={accountHolder} setAccountHolder={setAccountHolder}
          bsb={bsb} setBsb={setBsb}
          accountNo={accountNo} setAccountNo={setAccountNo}
          bankName={bankName} setBankName={setBankName}
          bicSwift={bicSwift} setBicSwift={setBicSwift}
          referenceDesc={referenceDesc} setReferenceDesc={setReferenceDesc}
          dueDate={dueDate} setDueDate={setDueDate}
          dueOnReceipt={dueOnReceipt} setDueOnReceipt={setDueOnReceipt}
          status={status} setStatus={setStatus}
          lines={lines} setLines={setLines}
          notes={notes} setNotes={setNotes}
          subtotal={subtotal}
          clients={clients}
        />
      </SidePanel>
    </>
  );
}

// ── Main FinanceTab ──────────────────────────────────────────────────────────
export function FinanceTab({ project, onUpdateInvoices }: FinanceTabProps) {
  const { clients } = useCrm();
  const [activeFilter, setActiveFilter] = useState<InvoiceFilter>('Issued');
  const [search, setSearch] = useState('');
  const [showAddPanel, setShowAddPanel] = useState(false);
  const [editInvoice, setEditInvoice] = useState<Invoice | null>(null);

  const [invoices, setInvoices] = useState<Invoice[]>(project.invoices || []);

  // Map CRM clients to a simplified shape for the dropdown
  const clientOptions = useMemo(() => clients.map(c => ({
    id: c.id,
    company: c.company,
    primaryContact: c.primaryContact,
    address: c.address,
  })), [clients]);

  const totalEarnings = useMemo(() => invoices.filter(i => i.status === 'Paid').reduce((s, i) => s + i.amount, 0), [invoices]);
  const paidCount = useMemo(() => invoices.filter(i => i.status === 'Paid').length, [invoices]);
  const totalIssued = useMemo(() => invoices.reduce((s, i) => s + i.amount, 0), [invoices]);
  const issuedCount = invoices.length;
  const overdueTotal = useMemo(() => invoices.filter(i => i.status === 'Overdue').reduce((s, i) => s + i.amount, 0), [invoices]);
  const overdueCount = useMemo(() => invoices.filter(i => i.status === 'Overdue').length, [invoices]);

  const filteredInvoices = useMemo(() => {
    const q = search.toLowerCase();
    return invoices.filter(i => {
      const matchFilter = i.status === activeFilter;
      const matchSearch = !search || i.number.toLowerCase().includes(q) || i.clientName.toLowerCase().includes(q);
      return matchFilter && matchSearch;
    });
  }, [invoices, activeFilter, search]);

  const handleAddInvoice = (inv: Invoice) => {
    const updated = [inv, ...invoices];
    setInvoices(updated);
    onUpdateInvoices?.(updated);
    setShowAddPanel(false);
    setActiveFilter(inv.status as InvoiceFilter);
  };

  const handleDeleteInvoice = (id: string) => {
    const updated = invoices.filter(i => i.id !== id);
    setInvoices(updated);
    onUpdateInvoices?.(updated);
  };

  const handleStatusChange = (id: string, newStatus: Invoice['status']) => {
    const updated = invoices.map(i => i.id === id ? { ...i, status: newStatus } : i);
    setInvoices(updated);
    onUpdateInvoices?.(updated);
  };

  const handleSaveEdit = (inv: Invoice) => {
    const updated = invoices.map(i => i.id === inv.id ? inv : i);
    setInvoices(updated);
    onUpdateInvoices?.(updated);
    setEditInvoice(null);
  };

  const handleExportPDF = () => setTimeout(() => window.print(), 400);

  return (
    <div className="space-y-5">
      {showAddPanel && (
        <AddInvoicePanel project={project} clients={clientOptions} onClose={() => setShowAddPanel(false)} onSave={handleAddInvoice} />
      )}
      {editInvoice && (
        <EditInvoicePanel invoice={editInvoice} clients={clientOptions} onClose={() => setEditInvoice(null)} onSave={handleSaveEdit} />
      )}

      {/* Top 3 KPI cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="kpi-card flex items-center gap-4">
          <div className="w-11 h-11 rounded-xl bg-muted flex items-center justify-center flex-shrink-0">
            <TrendingUp size={20} className="text-muted-foreground" />
          </div>
          <div className="min-w-0">
            <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide">Total Project Earnings</p>
            <p className="text-xl font-semibold mt-0.5 truncate">{formatBudget(totalEarnings)}</p>
            <p className="text-xs text-muted-foreground mt-0.5">{paidCount} paid invoice{paidCount !== 1 ? 's' : ''}</p>
          </div>
        </div>

        <div className="kpi-card flex items-center gap-4">
          <div className="w-11 h-11 rounded-xl bg-muted flex items-center justify-center flex-shrink-0">
            <FileText size={20} className="text-muted-foreground" />
          </div>
          <div className="min-w-0">
            <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide">Total Invoices Issued</p>
            <p className="text-xl font-semibold mt-0.5 truncate">{formatBudget(totalIssued)}</p>
            <p className="text-xs text-muted-foreground mt-0.5">{issuedCount} invoice{issuedCount !== 1 ? 's' : ''} issued</p>
          </div>
        </div>

        <div className="kpi-card flex items-center gap-4">
          <div className="w-11 h-11 rounded-xl bg-muted flex items-center justify-center flex-shrink-0">
            <AlertCircle size={20} className="text-muted-foreground" />
          </div>
          <div className="min-w-0">
            <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide">Total Overdue Invoices</p>
            <p className="text-xl font-semibold mt-0.5 truncate">{formatBudget(overdueTotal)}</p>
            <p className="text-xs text-muted-foreground mt-0.5">{overdueCount} overdue invoice{overdueCount !== 1 ? 's' : ''}</p>
          </div>
        </div>
      </div>

      {/* Invoice list section */}
      <div className="space-y-3">
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex border border-border rounded-lg overflow-hidden">
            {invoiceFilters.map((f, i) => (
              <button
                key={f}
                onClick={() => setActiveFilter(f)}
                className={`h-8 px-3 text-sm font-medium transition-colors ${i > 0 ? 'border-l border-border' : ''} ${activeFilter === f ? 'bg-foreground text-background' : 'text-muted-foreground hover:text-foreground hover:bg-muted'}`}
              >
                {f}
              </button>
            ))}
          </div>

          <div className="flex-1" />

          <div className="relative">
            <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
            <input
              type="text"
              placeholder="Search invoices..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="pl-8 pr-3 h-8 text-sm border border-border rounded-lg bg-background w-48 placeholder:text-muted-foreground outline-none focus:border-foreground/30 transition-colors"
            />
          </div>

          <button onClick={() => setShowAddPanel(true)} className="btn-primary">
            <Plus size={15} />
            Add New Invoice
          </button>
        </div>

        <div className="card-base overflow-hidden">
          {filteredInvoices.length === 0 ? (
            <div className="text-center py-12">
              <Receipt size={32} className="text-muted-foreground/30 mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">
                {invoices.length === 0 ? 'No invoices for this project yet' : `No ${activeFilter.toLowerCase()} invoices`}
              </p>
            </div>
          ) : (
            <table className="w-full">
              <thead>
                <tr className="border-b border-border bg-muted/30">
                  <th className="table-header text-left" style={{ width: '16.6%' }}>Invoice #</th>
                  <th className="table-header text-left" style={{ width: '16.6%' }}>Client</th>
                  <th className="table-header text-left" style={{ width: '16.6%' }}>Amount</th>
                  <th className="table-header text-left" style={{ width: '16.6%' }}>Issued</th>
                  <th className="table-header text-left" style={{ width: '16.6%' }}>Due</th>
                  <th className="table-header text-left" style={{ width: '16.6%' }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {filteredInvoices.map(inv => (
                  <tr
                    key={inv.id}
                    onClick={() => setEditInvoice(inv)}
                    className="group/inv hover:bg-muted/20 transition-colors border-b border-border/40 last:border-b-0 cursor-pointer"
                  >
                    <td className="table-cell"><p className="font-medium text-sm">{inv.number}</p></td>
                    <td className="table-cell text-muted-foreground text-sm">{inv.clientName}</td>
                    <td className="table-cell font-medium text-sm">{formatBudget(inv.amount)}</td>
                    <td className="table-cell text-muted-foreground text-sm">{inv.issuedDate}</td>
                    <td className="table-cell text-muted-foreground text-sm">{inv.dueDate}</td>
                    <td className="table-cell" onClick={(e) => e.stopPropagation()}>
                      <StatusCellDropdown
                        value={inv.status}
                        onChange={(newStatus) => handleStatusChange(inv.id, newStatus)}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
