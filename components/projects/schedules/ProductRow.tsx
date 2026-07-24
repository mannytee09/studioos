'use client';

import { useState, useRef } from 'react';
import {
  ScheduleProduct, ScheduleSection, ProductStatus, ProductFlag,
  productStatusConfig, flagConfig, createEmptyProduct,
} from '@/lib/schedules-data';
import { ProductDetailsModal } from './ProductDetailsModal';
import { StatusDropdown } from './ProductDetailsModal';
import { DynamicIcon } from '@/lib/icons';
import { GripVertical, Plus, Image as ImageIcon, ExternalLink, Ellipsis as MoreHorizontal, Check, ChevronLeft } from 'lucide-react';

interface ProductRowProps {
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
  onCopyToProject: () => void;
  onAddFlag: (flag: ProductFlag) => void;
  isDragging?: boolean;
  dragHandleProps?: React.HTMLAttributes<HTMLElement>;
}

type InlineField =
  | 'name' | 'brand' | 'supplier' | 'docCode' | 'description'
  | 'width' | 'length' | 'height' | 'depth' | 'colour' | 'finish' | 'material'
  | 'quantity' | 'leadTime';

export function ProductRow({
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
  onCopyToProject,
  onAddFlag,
  dragHandleProps,
}: ProductRowProps) {
  const [hovered, setHovered] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [showFlagMenu, setShowFlagMenu] = useState(false);
  const [showMoveMenu, setShowMoveMenu] = useState(false);
  const [editField, setEditField] = useState<InlineField | null>(null);
  const [editValue, setEditValue] = useState('');
  const menuRef = useRef<HTMLDivElement>(null);

  const startEdit = (field: InlineField, current: string) => {
    setEditField(field);
    setEditValue(current);
  };

  const commitEdit = () => {
    if (!editField) return;
    onUpdate({ ...product, [editField]: editValue });
    setEditField(null);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') commitEdit();
    if (e.key === 'Escape') setEditField(null);
  };

  const displayVal = (v: string) => v || '—';

  const InlineCell = ({
    field, value, label, className = '',
  }: {
    field: InlineField; value: string; label: string; className?: string;
  }) => {
    if (editField === field) {
      return (
        <input
          autoFocus
          value={editValue}
          onChange={(e) => setEditValue(e.target.value)}
          onBlur={commitEdit}
          onKeyDown={handleKeyDown}
          className={`bg-muted border border-border rounded px-1.5 py-0.5 text-xs outline-none w-full ${className}`}
        />
      );
    }
    return (
      <div
        onClick={() => startEdit(field, value)}
        className="cursor-text group/cell"

      >
        <span className={`text-xs font-medium truncate block max-w-[120px] ${value ? 'text-foreground' : 'text-muted-foreground'}`}>
          {displayVal(value)}
        </span>
        <span className="text-[10px] text-muted-foreground/70">{label}</span>
      </div>
    );
  };

  const flags = product.flags ?? [];

  return (
    <>
      {showDetails && (
        <ProductDetailsModal
          product={product}
          onClose={() => setShowDetails(false)}
          onSave={(updated) => onUpdate(updated)}
        />
      )}

      <div
        className={`relative flex items-stretch border-b border-border/50 last:border-b-0 transition-colors ${
          selected ? 'bg-blue-50/50 dark:bg-blue-900/10' : hovered ? 'bg-muted/30' : ''
        }`}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => { setHovered(false); setShowMenu(false); }}
      >
        {/* Left hover controls */}
        <div className={`flex flex-col items-center justify-center gap-1 pl-1 pr-2 flex-shrink-0 transition-opacity ${hovered || selected ? 'opacity-100' : 'opacity-0'}`}>
          <input
            type="checkbox"
            checked={selected}
            onChange={(e) => onSelect(product.id, e.target.checked)}
            className="w-3.5 h-3.5 rounded border-border cursor-pointer accent-foreground"
          />
          <span
            className="text-muted-foreground cursor-grab active:cursor-grabbing inline-flex"
            {...dragHandleProps}
          >
            <GripVertical size={14} />
          </span>
          <button
            onClick={onAddBelow}
            className="hover:text-foreground text-muted-foreground transition-colors"
          >
            <Plus size={14} />
          </button>
        </div>

        {/* Image */}
        <div className="flex-shrink-0 w-14 h-14 my-2 mr-2 rounded-lg overflow-hidden bg-muted border border-border/50 self-center">
          {product.imageUrl ? (
            <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <ImageIcon size={20} className="text-muted-foreground/40" />
            </div>
          )}
        </div>

        {/* Description block */}
        <div className="w-44 flex-shrink-0 py-2 pr-3 self-center">
          <div className="flex items-center gap-1 mb-1">
            <span className="text-[10px] text-muted-foreground/60 uppercase tracking-wide">Product Description</span>
            <button
              onClick={() => setShowDetails(true)}
              className="opacity-0 group-hover:opacity-100 hover:text-foreground text-muted-foreground transition-all"
            >
              <ExternalLink size={11} />
            </button>
          </div>

          {/* Name */}
          {editField === 'name' ? (
            <input
              autoFocus
              value={editValue}
              onChange={(e) => setEditValue(e.target.value)}
              onBlur={commitEdit}
              onKeyDown={handleKeyDown}
              className="bg-muted border border-border rounded px-1.5 py-0.5 text-xs font-medium outline-none w-full mb-0.5"
            />
          ) : (
            <p
              onClick={() => startEdit('name', product.name)}
              className="text-xs font-medium text-foreground cursor-text truncate mb-0.5 leading-snug"

            >
              {product.name || 'Untitled Product'}
            </p>
          )}

          {/* Brand */}
          {editField === 'brand' ? (
            <input
              autoFocus
              value={editValue}
              onChange={(e) => setEditValue(e.target.value)}
              onBlur={commitEdit}
              onKeyDown={handleKeyDown}
              className="bg-muted border border-border rounded px-1.5 py-0.5 text-xs outline-none w-full mb-0.5"
            />
          ) : (
            <p
              onClick={() => startEdit('brand', product.brand)}
              className="text-xs text-muted-foreground cursor-text truncate"

            >
              {product.brand || 'Brand'}
            </p>
          )}

          <span className="text-[10px] text-muted-foreground/60 uppercase tracking-wide mt-1 block">Product Details</span>

          {/* DOC code */}
          <div className="flex items-center gap-1.5 mt-0.5">
            {editField === 'docCode' ? (
              <input
                autoFocus
                value={editValue}
                onChange={(e) => setEditValue(e.target.value)}
                onBlur={commitEdit}
                onKeyDown={handleKeyDown}
                className="bg-muted border border-border rounded px-1 py-0.5 text-[10px] outline-none w-16"
              />
            ) : (
              <span
                onClick={() => startEdit('docCode', product.docCode)}
                className="text-[10px] text-muted-foreground cursor-text bg-muted/60 px-1 py-0.5 rounded uppercase tracking-wide"
              >
                {product.docCode || 'DOC'}
              </span>
            )}
            {editField === 'supplier' ? (
              <input
                autoFocus
                value={editValue}
                onChange={(e) => setEditValue(e.target.value)}
                onBlur={commitEdit}
                onKeyDown={handleKeyDown}
                className="bg-muted border border-border rounded px-1 py-0.5 text-[10px] outline-none flex-1"
              />
            ) : (
              <span
                onClick={() => startEdit('supplier', product.supplier)}
                className="text-[10px] text-muted-foreground cursor-text truncate"
              >
                {product.supplier || 'Supplier'}
              </span>
            )}
          </div>

          {/* Flags */}
          {flags.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-1.5">
              {flags.map((flag) => (
                <span key={flag} className={`text-[9px] px-1.5 py-0.5 rounded font-medium ${flagConfig[flag].color}`}>
                  {flag}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Specs grid */}
        <div className="flex items-center gap-3 flex-1 py-2 min-w-0">
          <InlineCell field="width"    value={product.width}    label="Width (mm)"  />
          <InlineCell field="length"   value={product.length}   label="Length (mm)" />
          <InlineCell field="height"   value={product.height}   label="Height (mm)" />
          <InlineCell field="depth"    value={product.depth}    label="Depth (mm)"  />
          <InlineCell field="colour"   value={product.colour}   label="Colour"      />
          <InlineCell field="finish"   value={product.finish}   label="Finish"      />
          <InlineCell field="material" value={product.material} label="Material"    />
          <InlineCell field="quantity" value={product.quantity} label="Qty"         />
          <InlineCell field="leadTime" value={product.leadTime} label="Lead time"   />
        </div>

        {/* Right: status + actions */}
        <div className={`flex flex-col items-end justify-center gap-1.5 py-2 pr-3 pl-2 flex-shrink-0 transition-opacity`}>
          {/* Supplier on right */}
          {product.supplier && (
            <p className="text-xs text-muted-foreground text-right truncate max-w-[120px]">{product.supplier}</p>
          )}

          {/* Status */}
          <StatusDropdown
            value={product.status}
            onChange={(s) => onUpdate({ ...product, status: s })}
          />

          {/* Details + ⋯ */}
          <div className={`flex items-center gap-1.5 transition-opacity ${hovered ? 'opacity-100' : 'opacity-0'}`}>
            <button
              onClick={() => setShowDetails(true)}
              className="text-xs px-2.5 py-1 border border-border rounded-lg hover:bg-muted transition-colors font-medium"
            >
              Details
            </button>

            {/* Three-dot menu */}
            <div className="relative" ref={menuRef}>
              <button
                onClick={() => setShowMenu(!showMenu)}
                className="w-7 h-7 flex items-center justify-center hover:bg-muted rounded-lg transition-colors text-muted-foreground"
              >
                <MoreHorizontal size={16} />
              </button>

              {showMenu && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setShowMenu(false)} />
                  <div className="absolute right-0 mt-1 w-64 bg-popover border border-border rounded-xl shadow-lg z-20 py-1">
                    <MenuItem icon="flag" label="Add Flag" onClick={() => { setShowMenu(false); setShowFlagMenu(true); }} />
                    <MenuItem icon="archive" label="Archive" onClick={() => { setShowMenu(false); onArchive(); }} />
                    <MenuItem icon="content_copy" label="Duplicate" onClick={() => { setShowMenu(false); onDuplicate(); }} />
                    <MenuItem icon="file_copy" label="Copy To Project" onClick={() => { setShowMenu(false); onCopyToProject(); }} />
                    <div className="relative">
                      <MenuItem
                        icon="drive_file_move"
                        label="Move To Section"
                        onClick={() => setShowMoveMenu(!showMoveMenu)}
                        chevron
                      />
                      {showMoveMenu && sections.length > 0 && (
                        <div className="absolute right-full top-0 mr-1 w-48 bg-popover border border-border rounded-xl shadow-lg z-30 py-1">
                          {sections.map((sec) => (
                            <button
                              key={sec.id}
                              onClick={() => { setShowMenu(false); setShowMoveMenu(false); onMoveToSection(sec.id); }}
                              className="w-full px-3 py-2 text-sm text-left hover:bg-muted transition-colors text-muted-foreground"
                            >
                              {sec.name}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                    <div className="border-t border-border my-1" />
                    <MenuItem icon="delete_outline" label="Remove From Schedule" onClick={() => { setShowMenu(false); onDelete(); }} danger />
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Flag submenu */}
        {showFlagMenu && (
          <div className="absolute right-10 top-0 mt-1 w-48 bg-popover border border-border rounded-xl shadow-lg z-30 py-1">
            <p className="px-3 py-1.5 text-xs font-medium text-muted-foreground border-b border-border mb-1">Add Flag</p>
            {(['Urgent', 'Client Review', 'Awaiting Supplier', 'Order Required', 'Site Confirmation'] as ProductFlag[]).map((flag) => (
              <button
                key={flag}
                onClick={() => { onAddFlag(flag); setShowFlagMenu(false); }}
                className="flex items-center justify-between w-full px-3 py-2 text-sm hover:bg-muted transition-colors"
              >
                {flag}
                {flags.includes(flag) && (
                  <Check size={12} className="text-green-600" />
                )}
              </button>
            ))}
            <button onClick={() => setShowFlagMenu(false)} className="w-full px-3 py-1.5 text-xs text-muted-foreground hover:bg-muted border-t border-border mt-1 transition-colors">
              Cancel
            </button>
          </div>
        )}
      </div>
    </>
  );
}

function MenuItem({
  icon, label, onClick, danger, chevron,
}: {
  icon: string; label: string; onClick: () => void; danger?: boolean; chevron?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-2.5 w-full px-3 py-2 text-sm hover:bg-muted transition-colors text-left ${
        danger ? 'text-red-500 hover:text-red-600' : 'text-muted-foreground hover:text-foreground'
      }`}
    >
      <span className="flex-shrink-0"><DynamicIcon name={icon} size={16} /></span>
      <span className="flex-1">{label}</span>
      {chevron && <ChevronLeft size={14} />}
    </button>
  );
}
