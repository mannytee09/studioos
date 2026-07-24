'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  ScheduleProduct, ProductStatus, ProductFlag,
  PRODUCT_STATUSES, PRODUCT_FLAGS, productStatusConfig, flagConfig,
} from '@/lib/schedules-data';
import { ChevronUp, ChevronDown, X, Image as ImageIcon, ImagePlus, Check } from 'lucide-react';

interface ProductSidePanelProps {
  product: ScheduleProduct;
  onClose: () => void;
  onSave: (updated: ScheduleProduct) => void;
  onNavigatePrev?: () => void;
  onNavigateNext?: () => void;
  hasPrev?: boolean;
  hasNext?: boolean;
}

export function ProductSidePanel({
  product,
  onClose,
  onSave,
  onNavigatePrev,
  onNavigateNext,
  hasPrev,
  hasNext,
}: ProductSidePanelProps) {
  const [form, setForm] = useState<ScheduleProduct>({ ...product });
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    setForm({ ...product });
  }, [product.id]);

  useEffect(() => {
    const t = requestAnimationFrame(() => setVisible(true));
    return () => cancelAnimationFrame(t);
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') handleClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleClose = () => {
    setVisible(false);
    setTimeout(onClose, 280);
  };

  const set = useCallback(<K extends keyof ScheduleProduct>(field: K, value: ScheduleProduct[K]) => {
    setForm(prev => {
      const next = { ...prev, [field]: value };
      onSave(next);
      return next;
    });
  }, [onSave]);

  const toggleFlag = (flag: ProductFlag) => {
    const updated = form.flags.includes(flag)
      ? form.flags.filter(f => f !== flag)
      : [...form.flags, flag];
    set('flags', updated);
  };

  const handleDone = () => {
    onSave(form);
    handleClose();
  };

  return (
    <>
      {/* Frosted overlay — no blur, semi-transparent */}
      <div
        className={`fixed inset-0 z-40 bg-black/20 transition-opacity duration-280 ${visible ? 'opacity-100' : 'opacity-0'}`}
        onClick={handleClose}
      />

      {/* Panel */}
      <div
        className={`fixed top-0 right-0 bottom-0 z-50 bg-card border-l border-border shadow-2xl flex flex-col transition-transform duration-280 ease-out`}
        style={{
          width: 'min(45vw, 900px)',
          minWidth: 720,
          transform: visible ? 'translateX(0)' : 'translateX(100%)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border flex-shrink-0">
          <div className="flex-1 min-w-0 mr-4">
            <input
              value={form.name}
              onChange={(e) => set('name', e.target.value)}
              className="text-base font-semibold bg-transparent outline-none w-full placeholder:text-muted-foreground text-foreground"
              placeholder="Product name"
            />
            <p className="text-xs text-muted-foreground mt-0.5 uppercase tracking-wide">
              {form.docCode || 'No doc code'}
            </p>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <StatusDropdown value={form.status} onChange={(s) => set('status', s)} />
            {(hasPrev || hasNext) && (
              <div className="flex items-center border border-border rounded-lg overflow-hidden">
                <button onClick={onNavigatePrev} disabled={!hasPrev} className="p-1.5 hover:bg-muted transition-colors disabled:opacity-30">
                  <ChevronUp size={16} />
                </button>
                <div className="w-px h-4 bg-border" />
                <button onClick={onNavigateNext} disabled={!hasNext} className="p-1.5 hover:bg-muted transition-colors disabled:opacity-30">
                  <ChevronDown size={16} />
                </button>
              </div>
            )}
            <button onClick={handleClose} className="p-1.5 hover:bg-muted rounded-lg transition-colors">
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Scrollable body */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-6 space-y-8">

            {/* Section: Image */}
            <section>
              <SectionHeading>Image</SectionHeading>
              <div className="flex gap-3 flex-wrap">
                {form.imageUrl && (
                  <div className="relative rounded-xl overflow-hidden border border-border flex-shrink-0" style={{ width: 160, height: 120 }}>
                    <img src={form.imageUrl} alt={form.name} className="w-full h-full object-cover" />
                    <button
                      onClick={() => set('imageUrl', '')}
                      className="absolute top-1.5 right-1.5 w-6 h-6 bg-black/50 text-white rounded-full flex items-center justify-center hover:bg-black/70 transition-colors"
                    >
                      <X size={13} />
                    </button>
                  </div>
                )}
                <label
                  className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-border bg-muted/30 hover:bg-muted/60 cursor-pointer transition-colors flex-shrink-0 gap-2"
                  style={{ width: form.imageUrl ? 100 : 160, height: 120 }}
                >
                  <span className="text-muted-foreground">
                    {form.imageUrl ? <ImagePlus size={20} /> : <ImageIcon size={26} />}
                  </span>
                  <span className="text-xs text-muted-foreground text-center leading-tight px-2">
                    {form.imageUrl ? 'Add more' : 'Add image'}
                  </span>
                  <input
                    type="file"
                    accept="image/*"
                    className="sr-only"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) set('imageUrl', URL.createObjectURL(file));
                    }}
                  />
                </label>
              </div>
            </section>

            {/* Section: Product Details */}
            <section>
              <SectionHeading>Product Details</SectionHeading>
              <div className="divide-y divide-border/50">
                <PanelRow label="DOC Code">
                  <PanelInput value={form.docCode} onChange={v => set('docCode', v.toUpperCase())} placeholder="e.g. FF-001" className="uppercase tracking-wide" />
                </PanelRow>
                <PanelRow label="Product Description">
                  <textarea
                    value={form.description}
                    onChange={(e) => set('description', e.target.value)}
                    placeholder="Describe the product..."
                    rows={2}
                    className="w-full text-sm bg-transparent outline-none placeholder:text-muted-foreground resize-none text-foreground leading-relaxed"
                  />
                </PanelRow>
                <PanelRow label="Product Type / Location">
                  <PanelInput value={form.productType} onChange={v => set('productType', v)} placeholder="e.g. Dining Chair / Dining Room" />
                </PanelRow>
                <PanelRow label="Product Name">
                  <PanelInput value={form.name} onChange={v => set('name', v)} placeholder="Product name" />
                </PanelRow>
                <PanelRow label="Brand">
                  <PanelInput value={form.brand} onChange={v => set('brand', v)} placeholder="Brand" />
                </PanelRow>
                <PanelRow label="Product Code / SKU">
                  <PanelInput value={form.sku} onChange={v => set('sku', v)} placeholder="SKU-001" />
                </PanelRow>
                <PanelRow label="Supplier Company">
                  <PanelInput value={form.supplier} onChange={v => set('supplier', v)} placeholder="Supplier name" />
                </PanelRow>
                <PanelRow label="Product URL">
                  <PanelInput value={form.productUrl} onChange={v => set('productUrl', v)} placeholder="https://" />
                </PanelRow>
                <PanelRow label="Quantity">
                  <PanelInput value={form.quantity} onChange={v => set('quantity', v)} placeholder="1" type="number" />
                </PanelRow>
              </div>
            </section>

            {/* Section: Product Specifications */}
            <section>
              <SectionHeading>Product Specifications</SectionHeading>
              <div className="divide-y divide-border/50">
                <PanelRow label="Material">
                  <PanelInput value={form.material} onChange={v => set('material', v)} placeholder="—" />
                </PanelRow>
                <PanelRow label="Finish">
                  <PanelInput value={form.finish} onChange={v => set('finish', v)} placeholder="—" />
                </PanelRow>
                <PanelRow label="Colour">
                  <PanelInput value={form.colour} onChange={v => set('colour', v)} placeholder="—" />
                </PanelRow>
                <PanelRow label="Length (mm)">
                  <PanelInput value={form.length} onChange={v => set('length', v)} placeholder="—" type="number" />
                </PanelRow>
                <PanelRow label="Height (mm)">
                  <PanelInput value={form.height} onChange={v => set('height', v)} placeholder="—" type="number" />
                </PanelRow>
                <PanelRow label="Depth (mm)">
                  <PanelInput value={form.depth} onChange={v => set('depth', v)} placeholder="—" type="number" />
                </PanelRow>
                <PanelRow label="Thickness (mm)">
                  <PanelInput value={form.thickness} onChange={v => set('thickness', v)} placeholder="—" type="number" />
                </PanelRow>
                <PanelRow label="Width (mm)">
                  <PanelInput value={form.width} onChange={v => set('width', v)} placeholder="—" type="number" />
                </PanelRow>
                <PanelRow label="Lead Time">
                  <PanelInput value={form.leadTime} onChange={v => set('leadTime', v)} placeholder="e.g. 8 weeks" />
                </PanelRow>
                <PanelRow label="Unit Cost (A$)">
                  <PanelInput value={form.unitCost} onChange={v => set('unitCost', v)} placeholder="0.00" type="number" />
                </PanelRow>
              </div>
            </section>

            {/* Section: Important Information */}
            <section>
              <SectionHeading>Important Information</SectionHeading>
              <textarea
                value={form.importantInfo}
                onChange={(e) => set('importantInfo', e.target.value)}
                placeholder="Add any important information here."
                rows={3}
                className="w-full text-sm border border-border rounded-xl px-4 py-3 bg-background placeholder:text-muted-foreground outline-none focus:border-foreground/30 resize-none transition-colors text-foreground leading-relaxed"
              />
            </section>

            {/* Section: Notes */}
            <section>
              <SectionHeading>Notes</SectionHeading>
              <textarea
                value={form.notes}
                onChange={(e) => set('notes', e.target.value)}
                placeholder="Add any additional notes here."
                rows={3}
                className="w-full text-sm border border-border rounded-xl px-4 py-3 bg-background placeholder:text-muted-foreground outline-none focus:border-foreground/30 resize-none transition-colors text-foreground leading-relaxed"
              />
            </section>

            {/* Section: Internal Notes */}
            <section>
              <SectionHeading>Internal Notes</SectionHeading>
              <p className="text-xs text-muted-foreground mb-2.5">Visible to your team only.</p>
              <textarea
                value={form.internalNotes}
                onChange={(e) => set('internalNotes', e.target.value)}
                placeholder="Add any internal notes here."
                rows={3}
                className="w-full text-sm border border-border rounded-xl px-4 py-3 bg-background placeholder:text-muted-foreground outline-none focus:border-foreground/30 resize-none transition-colors text-foreground leading-relaxed"
              />
            </section>

            {/* Section: Flags */}
            <section>
              <SectionHeading>Flags</SectionHeading>
              <div className="flex flex-wrap gap-2">
                {PRODUCT_FLAGS.map(flag => {
                  const active = form.flags.includes(flag);
                  return (
                    <button
                      key={flag}
                      onClick={() => toggleFlag(flag)}
                      className={`flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full border transition-colors ${
                        active ? flagConfig[flag].color : 'border-border text-muted-foreground hover:border-muted-foreground/50 hover:text-foreground'
                      }`}
                    >
                      {active && <Check size={11} />}
                      {flag}
                    </button>
                  );
                })}
              </div>
            </section>

          </div>
        </div>

        {/* Fixed footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-border bg-card flex-shrink-0">
          <div className="flex items-center gap-2">
            <button className="notion-button border border-border text-sm">Preview Spec Sheet</button>
            <button className="notion-button border border-border text-sm">Export Spec Sheet</button>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={onClose} className="notion-button border border-border text-sm">Cancel</button>
            <button onClick={handleDone} className="notion-button bg-foreground text-background hover:bg-foreground/90 text-sm">
              Save
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

function SectionHeading({ children }: { children: React.ReactNode }) {
  return (
    <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-4">{children}</h3>
  );
}

function PanelRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-start gap-4 py-3 min-h-[44px]">
      <span className="text-xs text-muted-foreground w-44 flex-shrink-0 pt-0.5 leading-tight">{label}</span>
      <div className="flex-1 min-w-0">{children}</div>
    </div>
  );
}

function PanelInput({
  value, onChange, placeholder, type = 'text', className = '',
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  type?: string;
  className?: string;
}) {
  return (
    <input
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className={`w-full text-sm bg-transparent outline-none placeholder:text-muted-foreground text-foreground border-b border-transparent focus:border-border/60 transition-colors py-0.5 ${className}`}
    />
  );
}

export function StatusDropdown({
  value, onChange,
}: {
  value: ProductStatus;
  onChange: (s: ProductStatus) => void;
}) {
  const [open, setOpen] = useState(false);
  const cfg = productStatusConfig[value];

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className={`flex items-center gap-1.5 text-xs px-2.5 py-1.5 rounded-full font-medium transition-colors ${cfg.color}`}
      >
        <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${cfg.dot}`} />
        {value}
        <ChevronDown size={12} />
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="absolute right-0 mt-1 w-44 bg-popover border border-border rounded-xl shadow-lg z-20 py-1">
            {PRODUCT_STATUSES.map((s) => {
              const c = productStatusConfig[s];
              return (
                <button
                  key={s}
                  onClick={() => { onChange(s); setOpen(false); }}
                  className="flex items-center gap-2 w-full px-3 py-2 text-sm hover:bg-muted transition-colors text-left"
                >
                  <span className={`w-2 h-2 rounded-full flex-shrink-0 ${c.dot}`} />
                  <span>{s}</span>
                  {value === s && <Check size={12} className="ml-auto" />}
                </button>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
