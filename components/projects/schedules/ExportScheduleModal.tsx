'use client';

import { useState } from 'react';
import { Schedule, ScheduleProduct } from '@/lib/schedules-data';
import { SidePanel } from '@/components/ui/SidePanel';
import { Eye, Download, LoaderCircle } from 'lucide-react';

interface ExportScheduleModalProps {
  schedule: Schedule;
  selectedProducts?: string[];
  onClose: () => void;
}

const DEFAULT_FIELDS = [
  'Product Description',
  'Product Details',
  'Doc Code',
  'Colour',
  'Finish',
  'Material',
  'Dimensions',
] as const;

const OPTIONAL_FIELDS = [
  'Brand Details',
  'Supplier Details',
  'Product URL',
  'Order Information',
  'Important Information',
  'Notes',
  'Product RRP',
  'Product Client Price',
  'Total Schedule Value',
] as const;

type FieldName = typeof DEFAULT_FIELDS[number] | typeof OPTIONAL_FIELDS[number];

export function ExportScheduleModal({
  schedule,
  selectedProducts = [],
  onClose,
}: ExportScheduleModalProps) {
  const [selectedFields, setSelectedFields] = useState<Set<FieldName>>(
    new Set(DEFAULT_FIELDS)
  );
  const [exporting, setExporting] = useState(false);

  const toggleFieldSet = (field: FieldName) => {
    setSelectedFields(prev => {
      const next = new Set(prev);
      if (next.has(field)) next.delete(field);
      else next.add(field);
      return next;
    });
  };

  const handlePreview = () => {
    const allProducts = schedule.sections.flatMap(s => s.products);
    const products = selectedProducts.length > 0
      ? allProducts.filter(p => selectedProducts.includes(p.id))
      : allProducts;

    const fields = Array.from(selectedFields);
    const win = window.open('', '_blank');
    if (!win) return;

    const fieldToValue = (p: ScheduleProduct, field: FieldName): string => {
      switch (field) {
        case 'Product Description': return p.description || p.name || '';
        case 'Product Details': return `${p.productType || ''} ${p.sku || ''}`.trim();
        case 'Doc Code': return p.docCode || '';
        case 'Colour': return p.colour || '';
        case 'Finish': return p.finish || '';
        case 'Material': return p.material || '';
        case 'Dimensions': return [p.width, p.length, p.height, p.depth].filter(Boolean).join(' × ') + ' mm';
        case 'Brand Details': return p.brand || '';
        case 'Supplier Details': return p.supplier || '';
        case 'Product URL': return p.productUrl || '';
        case 'Order Information': return `Qty: ${p.quantity || '1'}, Lead: ${p.leadTime || '—'}`;
        case 'Important Information': return p.importantInfo || '';
        case 'Notes': return p.notes || '';
        case 'Product RRP': return p.unitCost || '—';
        case 'Product Client Price': return p.unitCost || '—';
        case 'Total Schedule Value': return '';
        default: return '';
      }
    };

    const rowsHtml = products.map((p, i) => {
      const cells = fields.map(f => `<td style="padding:6px 10px;border:1px solid #ddd;">${fieldToValue(p, f) || '—'}</td>`).join('');
      return `<tr>${cells}</tr>`;
    }).join('');

    const totalValue = products.reduce((s, p) => s + parseFloat(p.unitCost || '0') * parseFloat(p.quantity || '1'), 0);

    win.document.write(`
      <html><head><title>${schedule.name} — Preview</title>
      <style>body{font-family:Arial,sans-serif;padding:32px;}h1{font-size:20px;margin-bottom:4px;}p.sub{color:#666;font-size:13px;margin-bottom:20px;}table{width:100%;border-collapse:collapse;font-size:12px;}th{background:#f5f5f5;padding:6px 10px;border:1px solid #ddd;text-align:left;font-size:11px;}.total{margin-top:16px;font-weight:bold;}</style>
      </head><body>
      <h1>${schedule.name}</h1>
      <p class="sub">${products.length} products · Generated ${new Date().toLocaleDateString('en-AU')}</p>
      <table><thead><tr>${fields.map(f => `<th>${f}</th>`).join('')}</tr></thead><tbody>${rowsHtml}</tbody></table>
      ${selectedFields.has('Total Schedule Value') ? `<p class="total">Total Schedule Value: A$${totalValue.toLocaleString('en-AU', { minimumFractionDigits: 2 })}</p>` : ''}
      </body></html>
    `);
    win.document.close();
  };

  const handleDownload = async () => {
    setExporting(true);
    handlePreview();
    setTimeout(() => {
      setExporting(false);
      onClose();
    }, 500);
  };

  const FieldCheckbox = ({ field, default: isDefault }: { field: FieldName; default?: boolean }) => (
    <label className="flex items-center gap-2.5 cursor-pointer py-1.5">
      <input
        type="checkbox"
        checked={selectedFields.has(field)}
        onChange={() => toggleFieldSet(field)}
        className="w-4 h-4 rounded border-border accent-foreground"
      />
      <span className="text-sm">{field}</span>
      {isDefault && <span className="text-[10px] text-muted-foreground/60 ml-auto">Default</span>}
    </label>
  );

  return (
    <SidePanel
      subtitle={schedule.name}
      onClose={onClose}
      footer={
        <>
          <div />
          <div className="flex gap-2">
            <button
              onClick={handlePreview}
              className="flex items-center gap-1.5 px-4 py-2 text-sm border border-border rounded-lg hover:bg-muted transition-colors"
            >
              <Eye size={16} />
              Preview PDF
            </button>
            <button
              onClick={handleDownload}
              disabled={exporting}
              className="flex items-center gap-1.5 px-4 py-2 text-sm bg-foreground text-background rounded-lg hover:bg-foreground/90 transition-colors font-medium disabled:opacity-50"
            >
              {exporting ? (
                <>
                  <LoaderCircle size={16} className="animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Download size={16} />
                  Download PDF
                </>
              )}
            </button>
          </div>
        </>
      }
    >
      <div className="px-6 py-5 space-y-6">
        {/* Default fields */}
        <div>
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">Default Fields</p>
          <div className="space-y-0.5">
            {DEFAULT_FIELDS.map(f => <FieldCheckbox key={f} field={f} default />)}
          </div>
        </div>

        {/* Optional fields */}
        <div>
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">Optional Fields</p>
          <div className="space-y-0.5">
            {OPTIONAL_FIELDS.map(f => <FieldCheckbox key={f} field={f} />)}
          </div>
        </div>

        {/* Summary */}
        <div className="border-t border-border pt-4">
          <p className="text-xs text-muted-foreground">
            {selectedFields.size} field{selectedFields.size !== 1 ? 's' : ''} selected · {selectedProducts.length > 0 ? selectedProducts.length : schedule.sections.flatMap(s => s.products).length} products
          </p>
        </div>
      </div>
    </SidePanel>
  );
}
