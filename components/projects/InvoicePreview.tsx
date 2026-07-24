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

export type PreviewLine = { id: string; description: string; hours: string; rate: string; isPageBreak?: boolean };

// ── Pagination (shared by preview + open-in-new-window) ──────────────────────
export function paginateInvoice(data: InvoicePreviewData): {
  pages: PreviewLine[][];
  totals: { subtotal: number; total: number };
} {
  const raw: PreviewLine[] = data.lineItems && data.lineItems.length > 0
    ? data.lineItems
    : [{ id: 'default', description: data.referenceDesc || 'Design services', hours: '', rate: '' }];

  const subtotal = raw.reduce((s, l) => s + lineAmount(l.hours, l.rate), 0);
  const total = subtotal || (data.amount ?? 0);

  const pages: PreviewLine[][] = [];
  let current: PreviewLine[] = [];
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
}

// ── A4 scaling hook ──────────────────────────────────────────────────────────
function useA4Scale(containerRef: React.RefObject<HTMLDivElement>) {
  const [scale, setScale] = useState(1);
  useLayoutEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const compute = () => {
      const w = el.clientWidth - 4;
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
  lines: PreviewLine[];
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
  lines: PreviewLine[];
  pageIdx: number;
  totalPages: number;
  totals: { subtotal: number; total: number };
}
const InvoicePage = memo(function InvoicePage({ data, lines, pageIdx, totalPages, totals }: InvoicePageProps) {
  const isFirst = pageIdx === 0;
  const isLast = pageIdx === totalPages - 1;
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
  /** When true (uncontrolled), shows < > navigation arrows below the preview. */
  showNavigation?: boolean;
  /** When true, renders all pages at full A4 size stacked vertically (no scaling). */
  fullSize?: boolean;
  /** Controlled current page index. Requires onPageChange. */
  controlledPage?: number;
  /** Page change handler for externally-controlled navigation. */
  onPageChange?: (page: number) => void;
}

export const InvoicePreview = memo(function InvoicePreview({ data, showToolbar, onExportPDF, showNavigation, fullSize, controlledPage, onPageChange }: InvoicePreviewProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const adaptiveScale = useA4Scale(containerRef);
  const scale = fullSize ? 1 : adaptiveScale;
  const [internalPage, setInternalPage] = useState(0);

  const handlePrint = useCallback(() => {
    onExportPDF?.();
  }, [onExportPDF]);

  const { pages, totals } = useMemo(() => paginateInvoice(data), [data]);

  const totalPages = pages.length;
  const isControlled = controlledPage !== undefined && !!onPageChange;
  const safePage = isControlled
    ? Math.min(controlledPage!, Math.max(totalPages - 1, 0))
    : Math.min(internalPage, Math.max(totalPages - 1, 0));
  const singlePageView = !fullSize && (showNavigation || isControlled) && totalPages > 1;
  const showInternalNav = !fullSize && showNavigation && totalPages > 1 && !isControlled;

  const scaledHeight = A4_HEIGHT_PX * scale;

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

      <div ref={containerRef} className="flex-1 print:overflow-visible print:bg-white" style={{ overflowY: singlePageView ? 'hidden' : 'auto' }}>
        <div className={`flex flex-col items-center ${singlePageView ? 'justify-center h-full' : 'gap-6 py-6'} print:py-0 print:gap-0 print:justify-start`}>
          {pages.map((pageLines, idx) => (
            <div
              key={idx}
              className="invoice-page-shell overflow-hidden print:shadow-none print:rounded-none"
              style={{
                width: A4_WIDTH_PX * scale,
                flexShrink: 0,
                borderRadius: 0,
                boxShadow: '0 1px 3px rgba(0,0,0,0.08), 0 8px 24px rgba(0,0,0,0.12)',
                display: singlePageView && idx !== safePage ? 'none' : undefined,
                ...(fullSize ? { height: A4_HEIGHT_PX } : { height: scaledHeight }),
              }}
            >
              <div
                style={{
                  width: A4_WIDTH_PX,
                  height: A4_HEIGHT_PX,
                  transform: scale === 1 ? undefined : `scale(${scale})`,
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

      {showInternalNav && (
        <div className="flex items-center gap-2 px-6 py-4 border-t border-border flex-shrink-0 print:hidden">
          <button
            onClick={() => setInternalPage(p => Math.max(0, p - 1))}
            disabled={safePage === 0}
            className="w-7 h-7 rounded-lg border border-border flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
          >
            <ChevronLeft size={15} />
          </button>
          <span className="text-xs text-muted-foreground font-medium tabular-nums">
            {safePage + 1} / {totalPages}
          </span>
          <button
            onClick={() => setInternalPage(p => Math.min(totalPages - 1, p + 1))}
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

// ── Open in new window: standalone A4 HTML document ──────────────────────────
function escapeHtml(s: string): string {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}
function esc(s: string | undefined): string {
  return escapeHtml(s || '');
}

const STANDALONE_CSS = `
*{box-sizing:border-box}
body{margin:0;background:#e9e7e2;font-family:'Poppins',system-ui,-apple-system,sans-serif;color:#1c1917;-webkit-font-smoothing:antialiased;padding:24px 0}
.page{width:210mm;min-height:297mm;padding:18mm 16mm;background:#FDF9F5;margin:0 auto 10mm;box-shadow:0 1px 3px rgba(0,0,0,.08),0 8px 24px rgba(0,0,0,.12);display:flex;flex-direction:column;border-radius:2px}
.header{display:flex;align-items:flex-start;justify-content:space-between;margin-bottom:32px}
.brand{display:flex;align-items:center;gap:10px}
.logo{width:40px;height:40px;border-radius:8px;object-fit:cover}
.company{font-size:14px;font-weight:600;line-height:1.1;color:#1c1917}
.abn{font-size:10px;color:#78716c}
.title{font-size:30px;font-weight:600;letter-spacing:-.02em;color:#1c1917;margin:0}
.details{display:grid;grid-template-columns:1fr 1fr;gap:32px;margin-bottom:32px}
.label{font-size:10px;font-weight:600;text-transform:uppercase;letter-spacing:.05em;color:#78716c;margin:0 0 6px}
.value{font-size:14px;color:#1c1917;margin:0}
.value-med{font-size:14px;font-weight:500;line-height:1.3;color:#1c1917;margin:0}
.muted{color:#78716c}
.muted-sm{font-size:12px;color:#78716c;line-height:1.5;margin:2px 0 0;white-space:pre-line}
.meta-grid{display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-top:20px}
table{width:100%;border-collapse:collapse;margin-bottom:24px}
thead th{text-align:left;font-size:10px;font-weight:600;text-transform:uppercase;letter-spacing:.05em;color:#78716c;padding:10px 0;border-bottom:2px solid rgba(28,25,23,.2)}
thead th.right{text-align:right}
tbody td{padding:12px 0;font-size:14px;border-bottom:1px solid rgba(28,25,23,.1);color:#1c1917}
tbody tr:last-child td{border-bottom:none}
td.right{text-align:right}
td.muted{color:#78716c}
td.bold{font-weight:500}
.totals{display:flex;justify-content:flex-end;margin-bottom:32px}
.totals-inner{width:256px}
.totals-row{display:flex;justify-content:space-between;font-size:14px;padding:2px 0}
.totals-total{display:flex;justify-content:space-between;font-size:16px;font-weight:600;border-top:2px solid rgba(28,25,23,.2);padding-top:8px;margin-top:2px}
.notes{margin-bottom:16px}
.notes-body{font-size:12px;color:#78716c;line-height:1.5;margin:0}
.footer{border-top:1px solid rgba(28,25,23,.15);padding-top:20px;margin-top:auto;text-align:center}
.footer p{font-size:10px;color:#78716c;line-height:1.5;margin:0}
.pagenum{font-size:9px;color:#78716c;text-align:center;padding-top:8px}
@media print{body{background:#fff;padding:0}.page{box-shadow:none;margin:0;border-radius:0}@page{size:A4;margin:0}.page{break-after:page}.page:last-child{break-after:auto}}
`;

function pageToHtml(data: InvoicePreviewData, lines: PreviewLine[], idx: number, total: number, totals: { subtotal: number; total: number }): string {
  const isFirst = idx === 0;
  const isLast = idx === total - 1;
  const visible = lines.filter(l => !l.isPageBreak);

  const headerHtml = isFirst ? `
    <div class="header">
      <div class="brand">
        <img class="logo" src="${window.location.origin}/logo.png" alt="Logo" />
        <div>
          <p class="company">${esc(data.companyName || 'ergonome studio')}</p>
          ${data.abn ? `<p class="abn">ABN: ${esc(data.abn)}</p>` : ''}
        </div>
      </div>
      <h1 class="title">Invoice</h1>
    </div>` : '';

  const detailsHtml = isFirst ? `
    <div class="details">
      <div>
        <p class="label">Bill To</p>
        <p class="value-med">${esc(data.clientName || '—')}</p>
        ${data.clientAddress ? `<p class="muted-sm">${esc(data.clientAddress)}</p>` : ''}
        <div class="meta-grid">
          <div><p class="label">Invoice Number</p><p class="value">${esc(data.number || '—')}</p></div>
          <div><p class="label">Invoice Date</p><p class="value">${esc(data.issuedDate || '—')}</p></div>
          <div><p class="label">Due Date</p><p class="value">${esc(data.dueDate || '—')}</p></div>
          <div><p class="label">Reference</p><p class="value">${esc(data.referenceDesc || '—')}</p></div>
        </div>
      </div>
      <div>
        <p class="label">From</p>
        <p class="value-med">${esc(data.companyName || 'ergonome studio')}</p>
        ${data.companyAddress ? `<p class="muted-sm">${esc(data.companyAddress)}</p>` : ''}
        ${data.companySuburb ? `<p class="muted-sm">${esc(data.companySuburb)}</p>` : ''}
        ${data.abn ? `<p class="muted-sm" style="margin-top:4px">ABN: ${esc(data.abn)}</p>` : ''}
        <p class="label" style="margin-top:20px">Payment Details</p>
        ${data.accountHolder ? `<p class="muted-sm">Account Holder: ${esc(data.accountHolder)}</p>` : ''}
        ${data.bankName ? `<p class="muted-sm">Bank: ${esc(data.bankName)}</p>` : ''}
        <div style="display:flex;gap:16px">
          ${data.bsb ? `<p class="muted-sm">BSB: ${esc(data.bsb)}</p>` : ''}
          ${data.accountNo ? `<p class="muted-sm">Account: ${esc(data.accountNo)}</p>` : ''}
        </div>
        ${data.bicSwift ? `<p class="muted-sm">BIC/SWIFT: ${esc(data.bicSwift)}</p>` : ''}
      </div>
    </div>` : '';

  const rowsHtml = visible.map((line, i) => {
    const amt = lineAmount(line.hours, line.rate);
    return `<tr${i < visible.length - 1 ? '' : ''}>
      <td>${esc(line.description || '—')}</td>
      <td class="right muted">${esc(line.hours || '—')}</td>
      <td class="right muted">${line.rate ? esc(String(line.rate)) : '—'}</td>
      <td class="right bold">${fmtMoney(amt)}</td>
    </tr>`;
  }).join('\n');

  const tableHtml = `
    <table>
      <thead><tr>
        <th>Description</th>
        <th class="right">Hours</th>
        <th class="right">Rate AUD</th>
        <th class="right">Amount AUD</th>
      </tr></thead>
      <tbody>${rowsHtml}</tbody>
    </table>`;

  const totalsHtml = isLast ? `
    <div class="totals"><div class="totals-inner">
      <div class="totals-row"><span class="muted">Subtotal</span><span>${fmtMoney(totals.subtotal)}</span></div>
      <div class="totals-row"><span class="muted">Tax (GST)</span><span>$0.00</span></div>
      <div class="totals-total"><span>TOTAL AUD</span><span>${fmtMoney(totals.total)}</span></div>
    </div></div>` : '';

  const notesHtml = isLast && data.notes ? `
    <div class="notes">
      <p class="label">Notes</p>
      <p class="notes-body">${esc(data.notes)}</p>
    </div>` : '';

  const footerHtml = isLast ? `
    <div class="footer">
      <p>Thank you for your business. Payment is due ${esc(data.dueDate || 'upon receipt')}.<br/>Please include invoice number ${esc(data.number || '—')} in payment reference.</p>
    </div>` : '';

  const pageNumHtml = total > 1 ? `<div class="pagenum">Page ${idx + 1} of ${total}</div>` : '';

  return `<div class="page">${headerHtml}${detailsHtml}${tableHtml}${totalsHtml}${notesHtml}${footerHtml}${pageNumHtml}</div>`;
}

export function openInvoiceInNewWindow(data: InvoicePreviewData) {
  const { pages, totals } = paginateInvoice(data);
  const body = pages.map((lines, idx) => pageToHtml(data, lines, idx, pages.length, totals)).join('\n');
  const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Invoice ${esc(data.number || '')}</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600&display=swap" rel="stylesheet">
<style>${STANDALONE_CSS}</style>
</head>
<body>
${body}
</body>
</html>`;
  const w = window.open('', '_blank', 'width=860,height=1040');
  if (!w) return;
  w.document.open();
  w.document.write(html);
  w.document.close();
}
