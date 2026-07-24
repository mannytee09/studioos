'use client';

import { memo, useMemo, useState, useLayoutEffect, useRef, useCallback } from 'react';
import { Printer, ChevronLeft, ChevronRight } from 'lucide-react';
import type { Invoice } from '@/lib/projects-data';

// ── A4 geometry ──────────────────────────────────────────────────────────────
// Real A4 portrait: 210mm × 297mm. We render at a fixed px size that preserves
// the 1:√2 aspect ratio, then scale the whole sheet down with CSS transform so
// it always fits its container while keeping the true page proportions.
const A4_WIDTH_PX = 794;   // ≈ 210mm @ 96dpi
const A4_HEIGHT_PX = 1123; // ≈ 297mm @ 96dpi
const A4_RATIO = A4_HEIGHT_PX / A4_WIDTH_PX;

// Lines that comfortably fit on one A4 page of this template before overflow.
const MAX_LINES_PER_PAGE = 14;

// ── Helpers ──────────────────────────────────────────────────────────────────
function lineAmount(hours: string, rate: string): number {
  const h = parseFloat(hours) || 0;
  const r = parseFloat(String(rate).replace(/[^0-9.]/g, '')) || 0;
  return h * r;
}
function fmtMoney(n: number): string {
  return `$${n.toLocaleString('en-AU', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export interface InvoicePreviewData {
  number: string;
  clientName: string;
  clientAddress?: string;
  companyName?: string;
  companyAddress?: string;
  companySuburb?: string;
  abn?: string;
  accountHolder?: string;
  bsb?: string;
  accountNo?: string;
  bankName?: string;
  bicSwift?: string;
  referenceDesc?: string;
  issuedDate: string;
  dueDate: string;
  status?: string;
  lineItems?: { id: string; description: string; hours: string; rate: string; isPageBreak?: boolean }[];
  notes?: string;
  amount?: number;
}

// ── A4 scaling hook ──────────────────────────────────────────────────────────
// Measures the container width and computes a uniform scale so the fixed-size
// A4 page fits the available width while preserving its aspect ratio.
function useA4Scale(containerRef: React.RefObject<HTMLDivElement>) {
  const [scale, setScale] = useState(1);
  useLayoutEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const compute = () => {
      const w = el.clientWidth - 4; // a hair of breathing room
      if (w > 0) setScale(Math.min(w / A4_WIDTH_PX, 1));
    };
    compute();
    const ro = new ResizeObserver(compute);
    ro.observe(el);
    return () => ro.disconnect();
  }, [containerRef]);
  return scale;
}

// ── Sub-components (each memoized; only re-renders when its slice changes) ───

const InvoiceHeader = memo(function InvoiceHeader({ data }: { data: InvoicePreviewData }) {
  return (
    <div className="flex items-start justify-between mb-8">
      <div className="flex items-center gap-2.5">
        <img src="/logo.png" alt="Logo" className="w-10 h-10 rounded-lg object-cover" />
        <div>
          <p className="text-sm font-semibold text-foreground leading-tight">{data.companyName || 'ergonome studio'}</p>
          {data.abn && <p className="text-[10px] text-muted-foreground">ABN: {data.abn}</p>}
        </div>
      </div>
      <h1 className="text-3xl font-semibold text-foreground tracking-tight">Invoice</h1>
    </div>
  );
});

const InvoiceDetails = memo(function InvoiceDetails({ data }: { data: InvoicePreviewData }) {
  return (
    <div className="grid grid-cols-2 gap-8 mb-8">
      {/* Left: Bill To + invoice meta */}
      <div className="space-y-5">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-1.5">Bill To</p>
          <p className="text-sm font-medium text-foreground leading-snug">{data.clientName || '—'}</p>
          {data.clientAddress && (
            <p className="text-xs text-muted-foreground whitespace-pre-line leading-relaxed mt-0.5">{data.clientAddress}</p>
          )}
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-1">Invoice Number</p>
            <p className="text-sm text-foreground">{data.number || '—'}</p>
          </div>
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-1">Invoice Date</p>
            <p className="text-sm text-foreground">{data.issuedDate || '—'}</p>
          </div>
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-1">Due Date</p>
            <p className="text-sm text-foreground">{data.dueDate || '—'}</p>
          </div>
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-1">Reference</p>
            <p className="text-sm text-foreground">{data.referenceDesc || '—'}</p>
          </div>
        </div>
      </div>

      {/* Right: From + Payment */}
      <div className="space-y-5">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-1.5">From</p>
          <p className="text-sm font-medium text-foreground leading-snug">{data.companyName || 'ergonome studio'}</p>
          {data.companyAddress && <p className="text-xs text-muted-foreground leading-relaxed">{data.companyAddress}</p>}
          {data.companySuburb && <p className="text-xs text-muted-foreground leading-relaxed">{data.companySuburb}</p>}
          {data.abn && <p className="text-xs text-muted-foreground leading-relaxed mt-0.5">ABN: {data.abn}</p>}
        </div>
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-1.5">Payment Details</p>
          {data.accountHolder && <p className="text-xs text-muted-foreground leading-relaxed">Account Holder: {data.accountHolder}</p>}
          {data.bankName && <p className="text-xs text-muted-foreground leading-relaxed">Bank: {data.bankName}</p>}
          <div className="flex gap-4">
            {data.bsb && <p className="text-xs text-muted-foreground leading-relaxed">BSB: {data.bsb}</p>}
            {data.accountNo && <p className="text-xs text-muted-foreground leading-relaxed">Account: {data.accountNo}</p>}
          </div>
          {data.bicSwift && <p className="text-xs text-muted-foreground leading-relaxed">BIC/SWIFT: {data.bicSwift}</p>}
        </div>
      </div>
    </div>
  );
});

interface InvoiceTableProps {
  lines: { id: string; description: string; hours: string; rate: string; isPageBreak?: boolean }[];
  showTotals: boolean;
  totals: { subtotal: number; total: number };
}
const InvoiceTable = memo(function InvoiceTable({ lines, showTotals, totals }: InvoiceTableProps) {
  return (
    <>
      <div className="mb-6">
        <table className="w-full">
          <thead>
            <tr className="border-b-2 border-foreground/20">
              <th className="text-left text-[10px] font-semibold uppercase tracking-wider text-muted-foreground py-2.5">Description</th>
              <th className="text-right text-[10px] font-semibold uppercase tracking-wider text-muted-foreground py-2.5 w-20">Hours</th>
              <th className="text-right text-[10px] font-semibold uppercase tracking-wider text-muted-foreground py-2.5 w-24">Rate AUD</th>
              <th className="text-right text-[10px] font-semibold uppercase tracking-wider text-muted-foreground py-2.5 w-24">Amount AUD</th>
            </tr>
          </thead>
          <tbody>
            {lines.filter(l => !l.isPageBreak).map((line, idx, visible) => {
              const amt = lineAmount(line.hours, line.rate);
              return (
                <tr key={line.id} className={idx < visible.length - 1 ? 'border-b border-foreground/10' : ''}>
                  <td className="py-3 text-sm text-foreground">{line.description || '—'}</td>
                  <td className="py-3 text-sm text-right text-muted-foreground">{line.hours || '—'}</td>
                  <td className="py-3 text-sm text-right text-muted-foreground">{line.rate ? `${line.rate}` : '—'}</td>
                  <td className="py-3 text-sm text-right font-medium text-foreground">{fmtMoney(amt)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {showTotals && (
        <div className="flex justify-end mb-8">
          <div className="w-64 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Subtotal</span>
              <span className="text-foreground">{fmtMoney(totals.subtotal)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Tax (GST)</span>
              <span className="text-foreground">$0.00</span>
            </div>
            <div className="flex justify-between text-base font-semibold border-t-2 border-foreground/20 pt-2">
              <span>TOTAL AUD</span>
              <span>{fmtMoney(totals.total)}</span>
            </div>
          </div>
        </div>
      )}
    </>
  );
});

const InvoiceNotes = memo(function InvoiceNotes({ data }: { data: InvoicePreviewData }) {
  if (!data.notes) return null;
  return (
    <div className="mb-4">
      <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-1">Notes</p>
      <p className="text-xs text-muted-foreground leading-relaxed">{data.notes}</p>
    </div>
  );
});

const InvoiceFooter = memo(function InvoiceFooter({ data }: { data: InvoicePreviewData }) {
  return (
    <div className="border-t border-foreground/15 pt-5 mt-auto">
      <p className="text-[10px] text-muted-foreground text-center leading-relaxed">
        Thank you for your business. Payment is due {data.dueDate || 'upon receipt'}.<br />
        Please include invoice number {data.number || '—'} in payment reference.
      </p>
    </div>
  );
});

// ── Single A4 page ───────────────────────────────────────────────────────────
interface InvoicePageProps {
  data: InvoicePreviewData;
  lines: { id: string; description: string; hours: string; rate: string; isPageBreak?: boolean }[];
  pageIdx: number;
  totalPages: number;
  totals: { subtotal: number; total: number };
}
const InvoicePage = memo(function InvoicePage({ data, lines, pageIdx, totalPages, totals }: InvoicePageProps) {
  const isFirst = pageIdx === 0;
  const isLast = pageIdx === totalPages - 1;
  // Header + details only on first page; totals + notes + footer only on last.
  return (
    <div className="invoice-page-bg flex flex-col" style={{ width: A4_WIDTH_PX, minHeight: A4_HEIGHT_PX, padding: '48px 56px', background: '#FDF9F5' }}>
      {isFirst && <InvoiceHeader data={data} />}
      {isFirst && <InvoiceDetails data={data} />}

      <InvoiceTable lines={lines} showTotals={isLast} totals={totals} />

      {isLast && <InvoiceNotes data={data} />}
      {isLast && <InvoiceFooter data={data} />}

      {totalPages > 1 && (
        <div className="text-[9px] text-muted-foreground text-center pt-2">
          Page {pageIdx + 1} of {totalPages}
        </div>
      )}
    </div>
  );
});

// ── Preview container with scaling + multi-page ──────────────────────────────
export interface InvoicePreviewProps {
  data: InvoicePreviewData;
  /** When true, renders the toolbar with an Export PDF button. */
  showToolbar?: boolean;
  /** Called when the user clicks Export PDF in the toolbar. */
  onExportPDF?: () => void;
  /** When true, shows < > navigation arrows below the preview for multi-page invoices. */
  showNavigation?: boolean;
}

export const InvoicePreview = memo(function InvoicePreview({ data, showToolbar, onExportPDF, showNavigation }: InvoicePreviewProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const scale = useA4Scale(containerRef);
  const [currentPage, setCurrentPage] = useState(0);

  const handlePrint = useCallback(() => {
    onExportPDF?.();
  }, [onExportPDF]);

  // Paginate line items into A4 pages, respecting manual page breaks.
  const { pages, totals } = useMemo(() => {
    const raw = data.lineItems && data.lineItems.length > 0
      ? data.lineItems
      : [{ id: 'default', description: data.referenceDesc || 'Design services', hours: '', rate: '' }];

    const subtotal = raw.reduce((s, l) => s + lineAmount(l.hours, l.rate), 0);
    const total = subtotal || (data.amount ?? 0);

    // Split into pages: auto-paginate at MAX_LINES_PER_PAGE, and force a new
    // page whenever a line item with isPageBreak=true is encountered.
    const pages: typeof raw[] = [];
    let current: typeof raw = [];
    for (const line of raw) {
      if (line.isPageBreak && current.length > 0) {
        pages.push(current);
        current = [];
      }
      current.push(line);
      if (current.length >= MAX_LINES_PER_PAGE) {
        pages.push(current);
        current = [];
      }
    }
    if (current.length > 0) pages.push(current);
    if (pages.length === 0) pages.push([]);
    return { pages, totals: { subtotal, total } };
  }, [data.lineItems, data.referenceDesc, data.amount]);

  const totalPages = pages.length;
  const scaledHeight = A4_HEIGHT_PX * scale;
  const showNav = showNavigation && totalPages > 1;
  const safePage = Math.min(currentPage, totalPages - 1);

  return (
    <div className="flex flex-col h-full">
      {showToolbar && (
        <div className="flex items-center justify-between px-5 py-3 border-b border-border flex-shrink-0 print:hidden">
          <div className="min-w-0">
            <p className="text-sm font-semibold truncate">{data.number || 'Invoice'}</p>
            <p className="text-xs text-muted-foreground truncate">{data.clientName}</p>
          </div>
          <button onClick={handlePrint} className="btn-primary">
            <Printer size={15} />
            Export PDF
          </button>
        </div>
      )}

      <div ref={containerRef} className="flex-1 print:overflow-visible print:bg-white" style={{ overflowY: totalPages > 1 ? 'auto' : 'hidden' }}>
        <div className={`flex flex-col items-center ${totalPages > 1 ? 'gap-6 py-6' : 'justify-center h-full'} print:py-0 print:gap-0 print:justify-start`}>
          {pages.map((pageLines, idx) => (
            <div
              key={idx}
              className="invoice-page-shell overflow-hidden print:shadow-none print:rounded-none"
              style={{
                width: A4_WIDTH_PX * scale,
                height: scaledHeight,
                flexShrink: 0,
                borderRadius: 0,
                boxShadow: '0 1px 3px rgba(0,0,0,0.08), 0 8px 24px rgba(0,0,0,0.12)',
                display: showNav && idx !== safePage ? 'none' : undefined,
              }}
            >
              <div
                style={{
                  width: A4_WIDTH_PX,
                  height: A4_HEIGHT_PX,
                  transform: `scale(${scale})`,
                  transformOrigin: 'top left',
                }}
              >
                <InvoicePage
                  data={data}
                  lines={pageLines}
                  pageIdx={idx}
                  totalPages={totalPages}
                  totals={totals}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {showNav && (
        <div className="flex items-center gap-2 px-6 py-4 border-t border-border flex-shrink-0 print:hidden">
          <button
            onClick={() => setCurrentPage(p => Math.max(0, p - 1))}
            disabled={safePage === 0}
            className="w-7 h-7 rounded-lg border border-border flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
          >
            <ChevronLeft size={15} />
          </button>
          <span className="text-xs text-muted-foreground font-medium tabular-nums">
            {safePage + 1} / {totalPages}
          </span>
          <button
            onClick={() => setCurrentPage(p => Math.min(totalPages - 1, p + 1))}
            disabled={safePage === totalPages - 1}
            className="w-7 h-7 rounded-lg border border-border flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
          >
            <ChevronRight size={15} />
          </button>
        </div>
      )}
    </div>
  );
});

// ── Convenience: convert an Invoice (saved) into preview data ────────────────
export function invoiceToPreviewData(inv: Invoice): InvoicePreviewData {
  return {
    number: inv.number,
    clientName: inv.clientName,
    clientAddress: inv.clientAddress,
    companyName: inv.companyName,
    companyAddress: inv.companyAddress,
    companySuburb: inv.companySuburb,
    abn: inv.abn,
    accountHolder: inv.accountHolder,
    bsb: inv.bsb,
    accountNo: inv.accountNo,
    bankName: inv.bankName,
    bicSwift: inv.bicSwift,
    referenceDesc: inv.referenceDesc,
    issuedDate: inv.issuedDate,
    dueDate: inv.dueDate,
    status: inv.status,
    lineItems: inv.lineItems,
    notes: inv.notes,
    amount: inv.amount,
  };
}
