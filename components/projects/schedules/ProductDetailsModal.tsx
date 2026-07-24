'use client';

import { useState } from 'react';
import {
  ScheduleProduct, ProductStatus, ProductFlag,
  PRODUCT_STATUSES, PRODUCT_FLAGS, productStatusConfig, flagConfig,
} from '@/lib/schedules-data';
import { X, Image as ImageIcon, Plus, Check, Paperclip, Eye, FileImage, ChevronDown } from 'lucide-react';

interface ProductDetailsModalProps {
  product: ScheduleProduct;
  onClose: () => void;
  onSave: (updated: ScheduleProduct) => void;
}

type Tab = 'General' | 'Specifications' | 'Commercial' | 'Notes & Files';

export function ProductDetailsModal({ product, onClose, onSave }: ProductDetailsModalProps) {
  const [form, setForm] = useState<ScheduleProduct>({ ...product });
  const [tab, setTab] = useState<Tab>('General');
  const [showFlagMenu, setShowFlagMenu] = useState(false);

  const set = (field: keyof ScheduleProduct, value: string | ProductStatus | ProductFlag[]) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const toggleFlag = (flag: ProductFlag) => {
    const current = form.flags;
    const updated = current.includes(flag)
      ? current.filter((f) => f !== flag)
      : [...current, flag];
    set('flags', updated);
  };

  const handleSave = () => {
    onSave(form);
    onClose();
  };

  const tabs: Tab[] = ['General', 'Specifications', 'Commercial', 'Notes & Files'];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-card border border-border rounded-2xl shadow-xl w-full max-w-2xl max-h-[92vh] flex flex-col mx-4 overflow-hidden">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border flex-shrink-0">
          <div className="flex-1 min-w-0">
            <input
              value={form.name}
              onChange={(e) => set('name', e.target.value)}
              className="font-semibold text-base bg-transparent outline-none w-full placeholder:text-muted-foreground"
              placeholder="Product name"
            />
            {form.docCode && (
              <p className="text-xs text-muted-foreground mt-0.5">{form.docCode}</p>
            )}
          </div>
          <div className="flex items-center gap-2 flex-shrink-0 ml-3">
            {/* Status */}
            <StatusDropdown
              value={form.status}
              onChange={(s) => set('status', s)}
            />
            <button onClick={onClose} className="p-1.5 hover:bg-muted rounded-lg">
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-border flex-shrink-0 px-6">
          {tabs.map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors flex-shrink-0 -mb-px ${
                tab === t
                  ? 'border-foreground text-foreground'
                  : 'border-transparent text-muted-foreground hover:text-foreground'
              }`}
            >
              {t}
            </button>
          ))}
        </div>

        {/* Body */}
        <div className="flex flex-1 min-h-0 overflow-hidden">
          {/* Left: image + flags */}
          <div className="w-48 flex-shrink-0 border-r border-border p-4 space-y-4 overflow-y-auto">
            {/* Image placeholder */}
            <div>
              <label className="text-xs text-muted-foreground block mb-2">Product Image</label>
              <div className="aspect-square w-full rounded-xl border border-border bg-muted flex flex-col items-center justify-center gap-1.5 cursor-pointer hover:bg-muted/80 transition-colors relative overflow-hidden">
                {form.imageUrl ? (
                  <img src={form.imageUrl} alt={form.name} className="w-full h-full object-cover" />
                ) : (
                  <>
                    <ImageIcon size={28} className="text-muted-foreground" />
                    <span className="text-xs text-muted-foreground text-center px-2">Click to add image</span>
                  </>
                )}
              </div>
              {form.imageUrl && (
                <button
                  onClick={() => set('imageUrl', '')}
                  className="text-xs text-muted-foreground hover:text-red-500 mt-1.5 transition-colors"
                >
                  Remove image
                </button>
              )}
            </div>

            {/* Flags */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs text-muted-foreground">Flags</label>
                <button
                  onClick={() => setShowFlagMenu(!showFlagMenu)}
                  className="p-0.5 hover:bg-muted rounded transition-colors"
                >
                  <Plus size={14} className="text-muted-foreground" />
                </button>
              </div>

              {showFlagMenu && (
                <div className="mb-2 bg-popover border border-border rounded-lg shadow-md py-1 z-10">
                  {PRODUCT_FLAGS.map((flag) => (
                    <button
                      key={flag}
                      onClick={() => toggleFlag(flag)}
                      className="flex items-center justify-between w-full px-3 py-1.5 text-xs hover:bg-muted transition-colors"
                    >
                      {flag}
                      {form.flags.includes(flag) && (
                        <Check size={12} className="text-green-600" />
                      )}
                    </button>
                  ))}
                  <button
                    onClick={() => setShowFlagMenu(false)}
                    className="w-full px-3 py-1.5 text-xs text-muted-foreground hover:bg-muted transition-colors border-t border-border mt-1 pt-1"
                  >
                    Done
                  </button>
                </div>
              )}

              <div className="space-y-1">
                {form.flags.map((flag) => (
                  <div key={flag} className={`flex items-center justify-between px-2 py-1 rounded text-xs ${flagConfig[flag].color}`}>
                    <span>{flag}</span>
                    <button onClick={() => toggleFlag(flag)}>
                      <X size={11} />
                    </button>
                  </div>
                ))}
                {form.flags.length === 0 && (
                  <p className="text-xs text-muted-foreground italic">No flags</p>
                )}
              </div>
            </div>
          </div>

          {/* Right: tab content */}
          <div className="flex-1 overflow-y-auto p-5 space-y-4 modal-scroll">
            {tab === 'General' && (
              <div className="space-y-3">
                <FormRow label="Product Name">
                  <ModalInput value={form.name} onChange={(v) => set('name', v)} placeholder="Product name" />
                </FormRow>
                <FormRow label="Description">
                  <textarea
                    value={form.description}
                    onChange={(e) => set('description', e.target.value)}
                    rows={3}
                    placeholder="Brief description"
                    className="modal-input resize-none"
                  />
                </FormRow>
                <div className="grid grid-cols-2 gap-3">
                  <FormRow label="DOC Code">
                    <ModalInput value={form.docCode} onChange={(v) => set('docCode', v)} placeholder="FF-001" />
                  </FormRow>
                  <FormRow label="Brand">
                    <ModalInput value={form.brand} onChange={(v) => set('brand', v)} placeholder="Brand" />
                  </FormRow>
                  <FormRow label="Supplier">
                    <ModalInput value={form.supplier} onChange={(v) => set('supplier', v)} placeholder="Supplier" />
                  </FormRow>
                  <FormRow label="Manufacturer">
                    <ModalInput value={form.manufacturer} onChange={(v) => set('manufacturer', v)} placeholder="Manufacturer" />
                  </FormRow>
                  <FormRow label="Product URL" className="col-span-2">
                    <ModalInput value={form.productUrl} onChange={(v) => set('productUrl', v)} placeholder="https://" />
                  </FormRow>
                </div>
              </div>
            )}

            {tab === 'Specifications' && (
              <div className="grid grid-cols-2 gap-3">
                <FormRow label="Width (mm)">
                  <ModalInput value={form.width} onChange={(v) => set('width', v)} placeholder="—" />
                </FormRow>
                <FormRow label="Length (mm)">
                  <ModalInput value={form.length} onChange={(v) => set('length', v)} placeholder="—" />
                </FormRow>
                <FormRow label="Height (mm)">
                  <ModalInput value={form.height} onChange={(v) => set('height', v)} placeholder="—" />
                </FormRow>
                <FormRow label="Depth (mm)">
                  <ModalInput value={form.depth} onChange={(v) => set('depth', v)} placeholder="—" />
                </FormRow>
                <FormRow label="Weight (kg)">
                  <ModalInput value={form.weight} onChange={(v) => set('weight', v)} placeholder="—" />
                </FormRow>
                <FormRow label="Colour">
                  <ModalInput value={form.colour} onChange={(v) => set('colour', v)} placeholder="—" />
                </FormRow>
                <FormRow label="Finish">
                  <ModalInput value={form.finish} onChange={(v) => set('finish', v)} placeholder="—" />
                </FormRow>
                <FormRow label="Material">
                  <ModalInput value={form.material} onChange={(v) => set('material', v)} placeholder="—" />
                </FormRow>
              </div>
            )}

            {tab === 'Commercial' && (
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <FormRow label="Unit Cost (A$)">
                    <ModalInput value={form.unitCost} onChange={(v) => set('unitCost', v)} placeholder="0.00" type="number" />
                  </FormRow>
                  <FormRow label="Quantity">
                    <ModalInput value={form.quantity} onChange={(v) => set('quantity', v)} placeholder="1" type="number" />
                  </FormRow>
                  <FormRow label="Lead Time">
                    <ModalInput value={form.leadTime} onChange={(v) => set('leadTime', v)} placeholder="e.g. 8 weeks" />
                  </FormRow>
                </div>

                {/* Procurement placeholder */}
                <div className="mt-4 p-4 rounded-xl border border-dashed border-border bg-muted/30">
                  <p className="text-xs font-medium text-muted-foreground mb-1">Procurement (Coming Soon)</p>
                  <p className="text-xs text-muted-foreground">Purchase orders, supplier quotes and tracking will be available here in a future update.</p>
                </div>
              </div>
            )}

            {tab === 'Notes & Files' && (
              <div className="space-y-4">
                <FormRow label="Notes">
                  <textarea
                    value={form.notes}
                    onChange={(e) => set('notes', e.target.value)}
                    rows={5}
                    placeholder="Internal notes, client instructions, special requirements..."
                    className="modal-input resize-none"
                  />
                </FormRow>

                {/* Attachments placeholder */}
                <div>
                  <label className="text-xs text-muted-foreground block mb-2">Attachments</label>
                  <div className="border border-dashed border-border rounded-xl p-6 flex flex-col items-center gap-2 text-muted-foreground hover:bg-muted/30 transition-colors cursor-pointer">
                    <Paperclip size={24} />
                    <p className="text-sm">Drop files here or click to upload</p>
                    <p className="text-xs">PDF, images, CAD files supported</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-border flex-shrink-0">
          <div className="flex items-center gap-2">
            <button onClick={() => {}} className="notion-button border border-border text-sm">
              <Eye size={15} />
              Preview Spec Sheet
            </button>
            <button onClick={() => {}} className="notion-button border border-border text-sm">
              <FileImage size={15} />
              Export Spec Sheet
            </button>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={onClose} className="notion-button border border-border text-sm">Cancel</button>
            <button onClick={handleSave} className="notion-button bg-foreground text-background hover:bg-foreground/90 text-sm">
              Save
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function ModalInput({
  value, onChange, placeholder, type = 'text',
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  type?: string;
}) {
  return (
    <input
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="modal-input"
    />
  );
}

function FormRow({ label, children, className }: { label: string; children: React.ReactNode; className?: string }) {
  return (
    <div className={className}>
      <label className="block text-xs text-muted-foreground mb-1.5">{label}</label>
      {children}
    </div>
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
        className={`flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full font-medium transition-colors ${cfg.color}`}
      >
        <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot} flex-shrink-0`} />
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
                  <span className={`w-2 h-2 rounded-full ${c.dot} flex-shrink-0`} />
                  <span>{s}</span>
                  {value === s && (
                    <Check size={12} className="ml-auto" />
                  )}
                </button>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
