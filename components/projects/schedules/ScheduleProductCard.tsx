'use client';

import { useState, useCallback, useRef } from 'react';
import {
  ScheduleProduct, ScheduleSection, ProductStatus, ProductFlag,
  productStatusConfig, flagConfig, PRODUCT_STATUSES, PRODUCT_FLAGS,
} from '@/lib/schedules-data';
import { DynamicIcon } from '@/lib/icons';
import { GripVertical, Plus, Image as ImageIcon, ExternalLink, ChevronDown, Check, Ellipsis as MoreHorizontal, ChevronLeft } from 'lucide-react';

interface ScheduleProductCardProps {
  product: ScheduleProduct;
  sections: ScheduleSection[];
  selected: boolean;
  onSelect: (id: string, checked: boolean) => void;
  onUpdate: (updated: ScheduleProduct) => void;
  onDelete: () => void;
  onDuplicate: () => void;
  onAddBelow: () => void;
  onMoveToSection: (sectionId: string) => void;
  onArchive: () => void;
  onAddFlag: (flag: ProductFlag) => void;
  onOpenPanel: () => void;
  dragHandleProps?: React.HTMLAttributes<HTMLElement>;
}

type EditableField = keyof ScheduleProduct;

function useInlineEdit(product: ScheduleProduct, onUpdate: (p: ScheduleProduct) => void) {
  const [editField, setEditField] = useState<EditableField | null>(null);
  const [editValue, setEditValue] = useState('');

  const startEdit = useCallback((field: EditableField, value: string) => {
    setEditField(field);
    setEditValue(value);
  }, []);

  const commitEdit = useCallback(() => {
    if (!editField) return;
    onUpdate({ ...product, [editField]: editValue });
    setEditField(null);
  }, [editField, editValue, product, onUpdate]);

  const cancelEdit = useCallback(() => setEditField(null), []);

  return { editField, editValue, setEditValue, startEdit, commitEdit, cancelEdit };
}

interface CellProps {
  label: string;
  field: EditableField;
  value: string;
  numericOnly?: boolean;
  editField: EditableField | null;
  editValue: string;
  setEditValue: (v: string) => void;
  startEdit: (f: EditableField, v: string) => void;
  commitEdit: () => void;
  cancelEdit: () => void;
  className?: string;
}

function Cell({ label, field, value, numericOnly, editField, editValue, setEditValue, startEdit, commitEdit, cancelEdit, className = '' }: CellProps) {
  const isEditing = editField === field;

  const handleChange = (v: string) => {
    if (numericOnly && !/^[\d.]*$/.test(v)) return;
    setEditValue(v);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') commitEdit();
    if (e.key === 'Escape') cancelEdit();
  };

  return (
    <div className={`flex flex-col min-w-0 ${className}`} onClick={() => !isEditing && startEdit(field, value)}>
      <span className="text-[9px] font-medium text-muted-foreground/60 uppercase tracking-wider mb-0.5 truncate leading-none">{label}</span>
      {isEditing ? (
        <input
          autoFocus
          value={editValue}
          onChange={(e) => handleChange(e.target.value)}
          onBlur={commitEdit}
          onKeyDown={handleKeyDown}
          className="text-[11px] text-foreground bg-muted border border-border/60 rounded px-1.5 py-0.5 outline-none w-full leading-tight"
          onClick={(e) => e.stopPropagation()}
        />
      ) : (
        <span className="text-[11px] text-foreground cursor-text leading-tight truncate min-h-[14px] hover:text-foreground/80">
          {value || <span className="text-muted-foreground/40">—</span>}
        </span>
      )}
    </div>
  );
}

export function ScheduleProductCard({
  product,
  sections,
  selected,
  onSelect,
  onUpdate,
  onDelete,
  onDuplicate,
  onAddBelow,
  onMoveToSection,
  onArchive,
  onAddFlag,
  onOpenPanel,
  dragHandleProps,
}: ScheduleProductCardProps) {
  const [hovered, setHovered] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [showMoveMenu, setShowMoveMenu] = useState(false);
  const [showStatusMenu, setShowStatusMenu] = useState(false);
  const [showFlagMenu, setShowFlagMenu] = useState(false);

  const { editField, editValue, setEditValue, startEdit, commitEdit, cancelEdit } = useInlineEdit(product, onUpdate);
  const statusCfg = productStatusConfig[product.status];
  const cellProps = { editField, editValue, setEditValue, startEdit, commitEdit, cancelEdit };

  return (
    <div
      className={`relative group/card bg-card border border-border rounded-xl shadow-sm hover:shadow-md transition-all duration-150 mx-4 mb-2.5 ${
        selected ? 'ring-2 ring-foreground/20 border-foreground/30' : ''
      }`}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => { setHovered(false); setShowMenu(false); setShowMoveMenu(false); }}
    >
      {/* Hover controls strip — left edge */}
      <div
        className={`absolute left-0 top-0 bottom-0 flex flex-col items-center justify-center gap-1.5 w-7 rounded-l-xl transition-opacity duration-150 ${
          hovered || selected ? 'opacity-100' : 'opacity-0'
        }`}
      >
        <input
          type="checkbox"
          checked={selected}
          onChange={(e) => onSelect(product.id, e.target.checked)}
          className="w-3.5 h-3.5 rounded border-border cursor-pointer accent-foreground"
          onClick={(e) => e.stopPropagation()}
        />
        <span
          {...dragHandleProps}
          className="text-muted-foreground/50 cursor-grab active:cursor-grabbing select-none hover:text-muted-foreground transition-colors"
        >
          <GripVertical size={14} />
        </span>
        <button
          onClick={(e) => { e.stopPropagation(); onAddBelow(); }}
          className="text-muted-foreground/50 hover:text-foreground transition-colors"
        >
          <Plus size={13} />
        </button>
      </div>

      {/* Main card content */}
      <div className={`flex items-stretch transition-all duration-150 ${hovered || selected ? 'pl-7' : 'pl-3'}`}>

        {/* Col 1: Image */}
        <div className="flex-shrink-0 flex items-center py-3 pr-3">
          <div
            className="w-16 h-16 rounded-lg overflow-hidden bg-muted border border-border/50 cursor-pointer hover:opacity-90 transition-opacity flex-shrink-0"
            onClick={onOpenPanel}
          >
            {product.imageUrl ? (
              <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <ImageIcon size={22} className="text-muted-foreground/25" />
              </div>
            )}
          </div>
        </div>

        {/* Cols 2–9: Grid */}
        <div className="flex-1 min-w-0 grid grid-rows-2 py-2 pr-3 gap-y-2.5">

          {/* ── ROW 1 ── */}
          <div className="grid gap-x-4 items-start" style={{ gridTemplateColumns: '1fr 1fr 1fr 1fr 1fr 1fr 1fr 1fr' }}>
            {/* Col 2 R1: Product Description */}
            <Cell label="Product Description" field="description" value={product.description} {...cellProps} />
            {/* Col 3 R1: DOC Code (spans both rows visually via row-span trick — we repeat in row 2) */}
            <Cell label="Doc Code" field="docCode" value={product.docCode} {...cellProps} />
            {/* Col 4 R1: Product Name / Brand */}
            <div className="flex flex-col min-w-0">
              <span className="text-[9px] font-medium text-muted-foreground/60 uppercase tracking-wider mb-0.5 leading-none">Product Name</span>
              <div
                className="flex items-center gap-1"
                onClick={() => editField !== 'name' && startEdit('name', product.name)}
              >
                {editField === 'name' ? (
                  <input
                    autoFocus
                    value={editValue}
                    onChange={(e) => setEditValue(e.target.value)}
                    onBlur={commitEdit}
                    onKeyDown={(e) => { if (e.key === 'Enter') commitEdit(); if (e.key === 'Escape') cancelEdit(); }}
                    className="text-[11px] font-medium text-foreground bg-muted border border-border/60 rounded px-1.5 py-0.5 outline-none w-full leading-tight"
                    onClick={(e) => e.stopPropagation()}
                  />
                ) : (
                  <span className="text-[11px] font-medium text-foreground cursor-text truncate leading-tight">
                    {product.name || <span className="text-muted-foreground/40">Untitled Product</span>}
                  </span>
                )}
                <button
                  onClick={(e) => { e.stopPropagation(); onOpenPanel(); }}
                  className="opacity-0 group-hover/card:opacity-100 transition-opacity flex-shrink-0"
                >
                  <ExternalLink size={11} className="text-muted-foreground/50 hover:text-muted-foreground" />
                </button>
              </div>
            </div>
            {/* Col 5 R1: Material */}
            <Cell label="Material" field="material" value={product.material} {...cellProps} />
            {/* Col 6 R1: Length */}
            <Cell label="Length (mm)" field="length" value={product.length} numericOnly {...cellProps} />
            {/* Col 7 R1: Depth */}
            <Cell label="Depth (mm)" field="depth" value={product.depth} numericOnly {...cellProps} />
            {/* Col 8 R1: Product URL — always shown, non-editable, linked to side menu URL */}
            <div className="flex flex-col min-w-0">
              <span className="text-[9px] font-medium text-muted-foreground/60 uppercase tracking-wider mb-0.5 leading-none">Product URL</span>
              {product.productUrl ? (
                <a
                  href={product.productUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={(e) => e.stopPropagation()}
                  className="text-[11px] text-foreground hover:text-muted-foreground transition-colors truncate leading-tight"
                >
                  Product Link
                </a>
              ) : (
                <span className="text-[11px] text-muted-foreground/40 truncate leading-tight">—</span>
              )}
            </div>
            {/* Col 9 R1: Important Info / Notes */}
            <Cell label="Notes" field="notes" value={product.notes} {...cellProps} />
          </div>

          {/* ── ROW 2 ── */}
          <div className="grid gap-x-4 items-start" style={{ gridTemplateColumns: '1fr 1fr 1fr 1fr 1fr 1fr 1fr 1fr' }}>
            {/* Col 2 R2: Product Type / Location */}
            <Cell label="Type / Location" field="productType" value={product.productType} {...cellProps} />
            {/* Col 3 R2: Brand */}
            <Cell label="Brand" field="brand" value={product.brand} {...cellProps} />
            {/* Col 4 R2: Finish */}
            <Cell label="Finish" field="finish" value={product.finish} {...cellProps} />
            {/* Col 5 R2: Product Code / SKU */}
            <Cell label="Product Code" field="sku" value={product.sku} {...cellProps} />
            {/* Col 6 R2: Height */}
            <Cell label="Height (mm)" field="height" value={product.height} numericOnly {...cellProps} />
            {/* Col 7 R2: Thickness */}
            <Cell label="Thickness (mm)" field="thickness" value={product.thickness} numericOnly {...cellProps} />
            {/* Col 8 R2: Quantity */}
            <Cell label="Quantity" field="quantity" value={product.quantity} numericOnly {...cellProps} />
            {/* Col 9 R2: Internal Notes */}
            <Cell label="Internal Notes" field="internalNotes" value={product.internalNotes} {...cellProps} />
          </div>
        </div>

        {/* Right edge: Status + Actions */}
        <div className="flex-shrink-0 flex flex-col items-end justify-between py-2.5 pr-3 pl-2 min-w-[130px] border-l border-border/30 ml-1">
          {/* Status pill */}
          <div className="relative">
            <button
              onClick={(e) => { e.stopPropagation(); setShowStatusMenu(!showStatusMenu); }}
              className={`flex items-center gap-1.5 text-[11px] px-2.5 py-1 rounded-full font-medium transition-colors ${statusCfg.color}`}
            >
              <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${statusCfg.dot}`} />
              {product.status}
              <ChevronDown size={11} />
            </button>
            {showStatusMenu && (
              <>
                <div className="fixed inset-0 z-30" onClick={() => setShowStatusMenu(false)} />
                <div className="absolute right-0 mt-1 w-44 bg-popover border border-border rounded-xl shadow-lg z-40 py-1">
                  {PRODUCT_STATUSES.map((s) => {
                    const c = productStatusConfig[s];
                    return (
                      <button
                        key={s}
                        onClick={() => { onUpdate({ ...product, status: s }); setShowStatusMenu(false); }}
                        className="flex items-center gap-2 w-full px-3 py-1.5 text-xs hover:bg-muted transition-colors text-left"
                      >
                        <span className={`w-2 h-2 rounded-full flex-shrink-0 ${c.dot}`} />
                        {s}
                        {product.status === s && <Check size={12} className="ml-auto" />}
                      </button>
                    );
                  })}
                </div>
              </>
            )}
          </div>

          {/* Flags */}
          {product.flags && product.flags.length > 0 && (
            <div className="flex flex-wrap gap-1 justify-end mt-1">
              {product.flags.slice(0, 2).map(flag => (
                <span key={flag} className={`text-[9px] px-1.5 py-0.5 rounded font-medium ${flagConfig[flag].color}`}>
                  {flag}
                </span>
              ))}
              {product.flags.length > 2 && (
                <span className="text-[9px] px-1.5 py-0.5 rounded font-medium bg-muted text-muted-foreground">
                  +{product.flags.length - 2}
                </span>
              )}
            </div>
          )}

          {/* Action buttons on hover */}
          <div className={`flex items-center gap-1 mt-auto transition-opacity duration-150 ${hovered ? 'opacity-100' : 'opacity-0'}`}>
            <button
              onClick={(e) => { e.stopPropagation(); onOpenPanel(); }}
              className="text-[11px] px-2.5 py-1 border border-border rounded-lg hover:bg-muted transition-colors font-medium text-foreground"
            >
              Details
            </button>
            {/* More menu */}
            <div className="relative">
              <button
                onClick={(e) => { e.stopPropagation(); setShowMenu(!showMenu); }}
                className="w-7 h-7 flex items-center justify-center hover:bg-muted rounded-lg transition-colors text-muted-foreground"
              >
                <MoreHorizontal size={16} />
              </button>
              {showMenu && (
                <>
                  <div className="fixed inset-0 z-30" onClick={() => setShowMenu(false)} />
                  <div className="absolute right-0 mt-1 w-64 bg-popover border border-border rounded-xl shadow-lg z-40 py-1">
                    <MenuBtn icon="open_in_new" label="Open Details" onClick={() => { setShowMenu(false); onOpenPanel(); }} />
                    <MenuBtn icon="content_copy" label="Duplicate" onClick={() => { setShowMenu(false); onDuplicate(); }} />
                    <MenuBtn icon="add" label="Add Product Below" onClick={() => { setShowMenu(false); onAddBelow(); }} />
                    {/* Flag submenu */}
                    <div className="relative">
                      <MenuBtn icon="flag" label="Add Flag" onClick={() => setShowFlagMenu(!showFlagMenu)} chevron />
                      {showFlagMenu && (
                        <>
                          <div className="fixed inset-0 z-40" onClick={() => setShowFlagMenu(false)} />
                          <div className="absolute right-full top-0 mr-1 w-48 bg-popover border border-border rounded-xl shadow-lg z-50 py-1">
                            {PRODUCT_FLAGS.map((flag) => (
                              <button
                                key={flag}
                                onClick={() => { onAddFlag(flag); setShowFlagMenu(false); setShowMenu(false); }}
                                className="flex items-center justify-between w-full px-3 py-1.5 text-xs hover:bg-muted transition-colors text-left"
                              >
                                {flag}
                                {product.flags?.includes(flag) && (
                                  <Check size={12} className="text-green-600" />
                                )}
                              </button>
                            ))}
                          </div>
                        </>
                      )}
                    </div>
                    {/* Move to section */}
                    <div className="relative">
                      <MenuBtn icon="drive_file_move" label="Move To Section" onClick={() => setShowMoveMenu(!showMoveMenu)} chevron />
                      {showMoveMenu && sections.length > 0 && (
                        <>
                          <div className="fixed inset-0 z-40" onClick={() => setShowMoveMenu(false)} />
                          <div className="absolute right-full top-0 mr-1 w-48 bg-popover border border-border rounded-xl shadow-lg z-50 py-1">
                            {sections.map((sec) => (
                              <button
                                key={sec.id}
                                onClick={() => { setShowMenu(false); setShowMoveMenu(false); onMoveToSection(sec.id); }}
                                className="w-full px-3 py-1.5 text-xs text-left hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
                              >
                                {sec.name}
                              </button>
                            ))}
                          </div>
                        </>
                      )}
                    </div>
                    <MenuBtn icon="archive" label="Archive" onClick={() => { setShowMenu(false); onArchive(); }} />
                    <div className="border-t border-border my-1" />
                    <MenuBtn icon="delete_outline" label="Remove from Schedule" onClick={() => { setShowMenu(false); onDelete(); }} danger />
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function MenuBtn({
  icon, label, onClick, danger, chevron,
}: {
  icon: string; label: string; onClick: () => void; danger?: boolean; chevron?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-2.5 w-full px-3 py-1.5 text-xs hover:bg-muted transition-colors text-left ${
        danger ? 'text-red-500 hover:text-red-600' : 'text-muted-foreground hover:text-foreground'
      }`}
    >
      <span className="flex-shrink-0"><DynamicIcon name={icon} size={15} /></span>
      <span className="flex-1">{label}</span>
      {chevron && <ChevronLeft size={13} />}
    </button>
  );
}
