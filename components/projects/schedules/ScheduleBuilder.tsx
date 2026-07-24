'use client';

import { useState, useMemo, useCallback } from 'react';
import {
  Schedule, ScheduleSection as ScheduleSectionType, ScheduleProduct,
  ProductFlag, createEmptyProduct, createEmptySection, productStatusConfig,
} from '@/lib/schedules-data';
import { ScheduleSection } from './ScheduleSection';
import { ExportScheduleModal } from './ExportScheduleModal';
import { Search, X, Filter, ArrowUpDown, Check, ChevronDown, Plus, Table, Eye } from 'lucide-react';

interface ScheduleBuilderProps {
  schedule: Schedule;
  onChange: (schedule: Schedule) => void;
  onBack?: () => void;
  onNewSchedule?: () => void;
}

const SORT_OPTIONS = [
  { label: 'None', value: 'none' },
  { label: 'Order Reference', value: 'orderRef' },
  { label: 'Doc Code', value: 'docCode' },
  { label: 'Brand', value: 'brand' },
  { label: 'Supplier', value: 'supplier' },
  { label: 'Status', value: 'status' },
  { label: 'Product Description', value: 'description' },
  { label: 'Product Details', value: 'details' },
];

export function ScheduleBuilder({ schedule, onChange, onBack, onNewSchedule }: ScheduleBuilderProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('none');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [selectedProducts, setSelectedProducts] = useState<string[]>([]);
  const [showExportModal, setShowExportModal] = useState(false);
  const [showSortMenu, setShowSortMenu] = useState(false);
  const [showBulkMenu, setShowBulkMenu] = useState(false);
  const [viewMode, setViewMode] = useState<'summary' | 'financial'>('summary');
  const [sectionFilter, setSectionFilter] = useState('all');
  const [showSectionMenu, setShowSectionMenu] = useState(false);

  // Drag state
  const [dragProductId, setDragProductId] = useState<string | null>(null);
  const [dragSectionId, setDragSectionId] = useState<string | null>(null);
  const [dragOverProductId, setDragOverProductId] = useState<string | null>(null);

  const updateSchedule = useCallback((updater: (draft: Schedule) => void) => {
    const draft: Schedule = JSON.parse(JSON.stringify(schedule));
    updater(draft);
    onChange(draft);
  }, [schedule, onChange]);

  // ── Product handlers ───────────────────────────────────────────────────────

  const handleSelectProduct = useCallback((id: string, checked: boolean) => {
    setSelectedProducts(prev => checked ? [...prev, id] : prev.filter(p => p !== id));
  }, []);

  const handleUpdateProduct = useCallback((productId: string, updated: ScheduleProduct) => {
    updateSchedule(draft => {
      draft.sections = draft.sections.map(sec => ({
        ...sec,
        products: sec.products.map(p => p.id === productId ? updated : p),
      }));
    });
  }, [updateSchedule]);

  const handleDeleteProduct = useCallback((productId: string) => {
    updateSchedule(draft => {
      draft.sections = draft.sections.map(sec => ({
        ...sec,
        products: sec.products.filter(p => p.id !== productId),
      }));
    });
    setSelectedProducts(prev => prev.filter(id => id !== productId));
  }, [updateSchedule]);

  const handleDuplicateProduct = useCallback((productId: string) => {
    updateSchedule(draft => {
      draft.sections = draft.sections.map(sec => {
        const idx = sec.products.findIndex(p => p.id === productId);
        if (idx === -1) return sec;
        const copy: ScheduleProduct = {
          ...sec.products[idx],
          id: `prod-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
          name: sec.products[idx].name ? `${sec.products[idx].name} (Copy)` : '',
          order: idx + 1,
        };
        const products = [...sec.products];
        products.splice(idx + 1, 0, copy);
        return { ...sec, products: products.map((p, i) => ({ ...p, order: i })) };
      });
    });
  }, [updateSchedule]);

  const handleAddProductBelow = useCallback((productId: string) => {
    updateSchedule(draft => {
      draft.sections = draft.sections.map(sec => {
        const idx = sec.products.findIndex(p => p.id === productId);
        if (idx === -1) return sec;
        const products = [...sec.products];
        products.splice(idx + 1, 0, createEmptyProduct(idx + 1));
        return { ...sec, products: products.map((p, i) => ({ ...p, order: i })) };
      });
    });
  }, [updateSchedule]);

  const handleAddProduct = useCallback((sectionId: string) => {
    updateSchedule(draft => {
      const sec = draft.sections.find(s => s.id === sectionId);
      if (sec) sec.products.push(createEmptyProduct(sec.products.length));
    });
  }, [updateSchedule]);

  const handleMoveProductToSection = useCallback((productId: string, targetSectionId: string) => {
    updateSchedule(draft => {
      let moved: ScheduleProduct | null = null;
      draft.sections = draft.sections.map(sec => {
        const product = sec.products.find(p => p.id === productId);
        if (product) {
          moved = { ...product };
          return { ...sec, products: sec.products.filter(p => p.id !== productId) };
        }
        return sec;
      });
      if (moved) {
        const product = moved;
        draft.sections = draft.sections.map(sec => {
          if (sec.id === targetSectionId) return { ...sec, products: [...sec.products, product] };
          return sec;
        });
      }
    });
  }, [updateSchedule]);

  const handleArchiveProduct = useCallback((productId: string) => {
    updateSchedule(draft => {
      draft.sections = draft.sections.map(sec => ({
        ...sec,
        products: sec.products.map(p => p.id === productId ? { ...p, status: 'Archived' as const } : p),
      }));
    });
  }, [updateSchedule]);

  const handleAddFlagToProduct = useCallback((productId: string, flag: ProductFlag) => {
    updateSchedule(draft => {
      draft.sections = draft.sections.map(sec => ({
        ...sec,
        products: sec.products.map(p => {
          if (p.id !== productId) return p;
          const flags = p.flags.includes(flag) ? p.flags.filter(f => f !== flag) : [...p.flags, flag];
          return { ...p, flags };
        }),
      }));
    });
  }, [updateSchedule]);

  // ── Section handlers ───────────────────────────────────────────────────────

  const handleToggleCollapse = useCallback((sectionId: string) => {
    updateSchedule(draft => {
      draft.sections = draft.sections.map(sec =>
        sec.id === sectionId ? { ...sec, collapsed: !sec.collapsed } : sec
      );
    });
  }, [updateSchedule]);

  const handleRenameSection = useCallback((sectionId: string, name: string) => {
    updateSchedule(draft => {
      draft.sections = draft.sections.map(sec =>
        sec.id === sectionId ? { ...sec, name } : sec
      );
    });
  }, [updateSchedule]);

  const handleDeleteSection = useCallback((sectionId: string) => {
    updateSchedule(draft => {
      draft.sections = draft.sections.filter(sec => sec.id !== sectionId);
    });
  }, [updateSchedule]);

  const handleAddSection = useCallback(() => {
    updateSchedule(draft => {
      draft.sections.push(createEmptySection(draft.sections.length));
    });
  }, [updateSchedule]);

  const handleMoveSectionUp = useCallback((sectionId: string) => {
    updateSchedule(draft => {
      const idx = draft.sections.findIndex(s => s.id === sectionId);
      if (idx <= 0) return;
      [draft.sections[idx - 1], draft.sections[idx]] = [draft.sections[idx], draft.sections[idx - 1]];
      draft.sections = draft.sections.map((s, i) => ({ ...s, order: i }));
    });
  }, [updateSchedule]);

  const handleMoveSectionDown = useCallback((sectionId: string) => {
    updateSchedule(draft => {
      const idx = draft.sections.findIndex(s => s.id === sectionId);
      if (idx >= draft.sections.length - 1) return;
      [draft.sections[idx], draft.sections[idx + 1]] = [draft.sections[idx + 1], draft.sections[idx]];
      draft.sections = draft.sections.map((s, i) => ({ ...s, order: i }));
    });
  }, [updateSchedule]);

  // ── Drag and Drop ─────────────────────────────────────────────────────────

  const handleDragStart = useCallback((e: React.DragEvent, productId: string, sectionId: string) => {
    setDragProductId(productId);
    setDragSectionId(sectionId);
    e.dataTransfer.effectAllowed = 'move';
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent, productId: string, sectionId: string) => {
    e.preventDefault();
    setDragOverProductId(productId);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent, targetProductId: string, targetSectionId: string) => {
    e.preventDefault();
    if (!dragProductId || dragProductId === targetProductId) {
      setDragProductId(null); setDragSectionId(null); setDragOverProductId(null);
      return;
    }
    updateSchedule(draft => {
      let movedProduct: ScheduleProduct | null = null;
      draft.sections = draft.sections.map(sec => {
        const idx = sec.products.findIndex(p => p.id === dragProductId);
        if (idx === -1) return sec;
        movedProduct = { ...sec.products[idx] };
        return { ...sec, products: sec.products.filter(p => p.id !== dragProductId) };
      });
      if (!movedProduct) return;
      const product = movedProduct;
      draft.sections = draft.sections.map(sec => {
        if (sec.id !== targetSectionId) return sec;
        const idx = sec.products.findIndex(p => p.id === targetProductId);
        if (idx === -1) return sec;
        const products = [...sec.products];
        products.splice(idx, 0, product);
        return { ...sec, products: products.map((p, i) => ({ ...p, order: i })) };
      });
    });
    setDragProductId(null); setDragSectionId(null); setDragOverProductId(null);
  }, [dragProductId, updateSchedule]);

  // Drop onto a section (end of section or empty section) — enables cross-section moves
  const handleDropOnSection = useCallback((e: React.DragEvent, targetSectionId: string) => {
    e.preventDefault();
    if (!dragProductId) {
      setDragProductId(null); setDragSectionId(null); setDragOverProductId(null);
      return;
    }
    if (dragSectionId === targetSectionId) {
      setDragProductId(null); setDragSectionId(null); setDragOverProductId(null);
      return;
    }
    updateSchedule(draft => {
      let movedProduct: ScheduleProduct | null = null;
      draft.sections = draft.sections.map(sec => {
        const idx = sec.products.findIndex(p => p.id === dragProductId);
        if (idx === -1) return sec;
        movedProduct = { ...sec.products[idx] };
        return { ...sec, products: sec.products.filter(p => p.id !== dragProductId) };
      });
      if (!movedProduct) return;
      const product = movedProduct;
      draft.sections = draft.sections.map(sec => {
        if (sec.id !== targetSectionId) return sec;
        return { ...sec, products: [...sec.products, product].map((p, i) => ({ ...p, order: i })) };
      });
    });
    setDragProductId(null); setDragSectionId(null); setDragOverProductId(null);
  }, [dragProductId, dragSectionId, updateSchedule]);

  const [dragOverSectionId, setDragOverSectionId] = useState<string | null>(null);

  const handleDragEnd = useCallback(() => {
    setDragProductId(null); setDragSectionId(null); setDragOverProductId(null);
  }, []);

  // ── Stats ──────────────────────────────────────────────────────────────────

  // ── Filtered sections ──────────────────────────────────────────────────────

  const displaySections = useMemo(() => {
    return schedule.sections
      .filter(sec => sectionFilter === 'all' || sec.id === sectionFilter)
      .map(sec => {
      if (!searchQuery) return sec;
      const products = sec.products.filter(p => {
        const q = searchQuery.toLowerCase();
        return [p.name, p.brand, p.supplier, p.docCode, p.description, p.productType, p.sku, p.material, p.finish, p.notes]
          .some(v => v?.toLowerCase().includes(q));
      });
      return { ...sec, products };
    }).filter(sec => {
      if (!searchQuery) return true;
      return sec.products.length > 0;
    });
  }, [schedule.sections, searchQuery, sortBy, sortOrder, sectionFilter]);

  const allFilteredProducts = displaySections.flatMap(s => s.products);

  return (
    <div>
      {/* ── Toolbar — matches landing page position: All left, search/sort/new right ── */}
      <div className="flex items-center gap-2">
        {onBack && (
          <button
            onClick={onBack}
            className="h-8 px-3 text-sm border border-border rounded-lg text-muted-foreground hover:bg-muted/50 hover:text-foreground transition-colors"
          >
            All Schedules
          </button>
        )}

        <div className="flex-1" />

        {/* Search */}
        <div className="relative flex-shrink-0">
          <Search size={16} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
          <input
            type="text"
            placeholder="Search products..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-8 pr-3 h-8 text-sm border border-border rounded-lg bg-background w-52 placeholder:text-muted-foreground outline-none focus:border-foreground/30 transition-colors"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              <X size={14} />
            </button>
          )}
        </div>

        {/* Sort — icon only */}
        <div className="relative">
          <button
            onClick={() => setShowSortMenu(!showSortMenu)}
            className="toolbar-icon-btn"
          >
            <ArrowUpDown size={18} />
          </button>
          {showSortMenu && (
            <>
              <div className="fixed inset-0 z-20" onClick={() => setShowSortMenu(false)} />
              <div className="absolute right-0 mt-1 w-64 bg-popover border border-border rounded-xl shadow-lg z-30 py-2 overflow-hidden">
                <p className="px-3 py-1 text-xs font-medium text-muted-foreground uppercase tracking-wide">Sort By</p>
                {SORT_OPTIONS.map(opt => (
                  <button
                    key={opt.value}
                    onClick={() => { setSortBy(opt.value); setShowSortMenu(false); }}
                    className={`filter-item ${sortBy === opt.value ? 'filter-item-active' : 'filter-item-inactive'}`}
                  >
                    {opt.label}
                    {sortBy === opt.value && <Check size={13} />}
                  </button>
                ))}
                <div className="border-t border-border/40 my-1" />
                <button
                  onClick={() => { setSortOrder('asc'); setShowSortMenu(false); }}
                  className={`filter-item ${sortOrder === 'asc' ? 'filter-item-active' : 'filter-item-inactive'}`}
                >
                  Ascending
                  {sortOrder === 'asc' && <Check size={13} />}
                </button>
                <button
                  onClick={() => { setSortOrder('desc'); setShowSortMenu(false); }}
                  className={`filter-item ${sortOrder === 'desc' ? 'filter-item-active' : 'filter-item-inactive'}`}
                >
                  Descending
                  {sortOrder === 'desc' && <Check size={13} />}
                </button>
              </div>
            </>
          )}
        </div>

        {/* Bulk actions */}
        {selectedProducts.length > 0 && (
          <div className="relative">
            <button
              onClick={() => setShowBulkMenu(!showBulkMenu)}
              className="flex items-center gap-1.5 h-8 px-3 text-sm border border-border rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
            >
              {selectedProducts.length} selected
              <ChevronDown size={14} />
            </button>
            {showBulkMenu && (
              <>
                <div className="fixed inset-0 z-20" onClick={() => setShowBulkMenu(false)} />
                <div className="absolute right-0 mt-1 w-64 bg-popover border border-border rounded-xl shadow-lg z-30 py-1">
                  <p className="px-3 py-1.5 text-xs font-medium text-muted-foreground">Bulk Actions</p>
                  <button onClick={() => { selectedProducts.forEach(id => { const p = allFilteredProducts.find(p => p.id === id); if (p) handleUpdateProduct(id, { ...p, status: 'Approved' }); }); setShowBulkMenu(false); }} className="w-full px-3 py-2 text-sm text-left hover:bg-muted transition-colors text-muted-foreground hover:text-foreground">Change Status</button>
                  <button className="w-full px-3 py-2 text-sm text-left hover:bg-muted transition-colors text-muted-foreground hover:text-foreground">Copy to Project</button>
                  <button onClick={() => { setShowExportModal(true); setShowBulkMenu(false); }} className="w-full px-3 py-2 text-sm text-left hover:bg-muted transition-colors text-muted-foreground hover:text-foreground">Export PDF Schedule</button>
                  <div className="border-t border-border my-1" />
                  <button onClick={() => { selectedProducts.forEach(id => handleArchiveProduct(id)); setSelectedProducts([]); setShowBulkMenu(false); }} className="w-full px-3 py-2 text-sm text-left hover:bg-muted transition-colors text-muted-foreground hover:text-foreground">Archive Selected</button>
                  <button onClick={() => { selectedProducts.forEach(id => handleDeleteProduct(id)); setSelectedProducts([]); setShowBulkMenu(false); }} className="w-full px-3 py-2 text-sm text-left hover:bg-muted transition-colors text-red-500 hover:text-red-600">Remove Selected</button>
                  <div className="border-t border-border my-1" />
                  <button onClick={() => setSelectedProducts([])} className="w-full px-3 py-2 text-sm text-left hover:bg-muted transition-colors text-muted-foreground hover:text-foreground">Clear Selection</button>
                </div>
              </>
            )}
          </div>
        )}

        {/* New Schedule */}
        {onNewSchedule && (
          <button
            onClick={onNewSchedule}
            className="flex items-center gap-1.5 h-8 px-3 text-sm bg-foreground text-background rounded-lg hover:bg-foreground/90 transition-colors font-medium"
          >
            <Plus size={16} />
            New Schedule
          </button>
        )}
      </div>

      {/* ── Summary / Financial (left) + Filter / Preview / New Section (right) ── */}
      <div className="flex items-center gap-2 mt-3">
        {/* Left: Summary / Financial */}
        <div className="flex border border-border rounded-lg overflow-hidden">
          <button
            onClick={() => setViewMode('summary')}
            className={`h-8 px-3 text-sm transition-colors ${viewMode === 'summary' ? 'view-toggle-active' : 'text-muted-foreground hover:bg-muted/50'}`}
          >
            Summary
          </button>
          <button
            onClick={() => setViewMode('financial')}
            className={`h-8 px-3 text-sm border-l border-border transition-colors ${viewMode === 'financial' ? 'view-toggle-active' : 'text-muted-foreground hover:bg-muted/50'}`}
          >
            Financial
          </button>
        </div>

        <div className="flex-1" />

        {/* Right: Filter View Section */}
        <div className="relative">
          <button
            onClick={() => setShowSectionMenu(!showSectionMenu)}
            className={`relative toolbar-icon-btn ${sectionFilter !== 'all' ? 'toolbar-icon-btn-active' : ''}`}
          >
            <Filter size={18} />
          </button>
          {showSectionMenu && (
            <>
              <div className="fixed inset-0 z-20" onClick={() => setShowSectionMenu(false)} />
              <div className="absolute right-0 mt-1 w-64 bg-popover border border-border rounded-xl shadow-lg z-30 py-2 overflow-hidden">
                <p className="px-3 py-1 text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">View Section</p>
                <button
                  onClick={() => { setSectionFilter('all'); setShowSectionMenu(false); }}
                  className={`filter-item ${sectionFilter === 'all' ? 'filter-item-active' : 'filter-item-inactive'}`}
                >
                  All Sections
                  {sectionFilter === 'all' && <Check size={13} />}
                </button>
                {schedule.sections.map(sec => (
                  <button
                    key={sec.id}
                    onClick={() => { setSectionFilter(sec.id); setShowSectionMenu(false); }}
                    className={`filter-item ${sectionFilter === sec.id ? 'filter-item-active' : 'filter-item-inactive'}`}
                  >
                    {sec.name}
                    {sectionFilter === sec.id && <Check size={13} />}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Preview */}
        <button
          onClick={() => setShowExportModal(true)}
          className="flex items-center gap-1.5 h-8 px-3 text-sm border border-border rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
        >
          <Eye size={16} />
          Preview
        </button>

        {/* New Section */}
        <button
          onClick={handleAddSection}
          className="flex items-center gap-1.5 h-8 px-3 text-sm border border-border rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
        >
          <Plus size={16} />
          New Section
        </button>

        {/* Bulk actions — contextual, appears only when products are selected */}
        {selectedProducts.length > 0 && (
          <div className="relative">
            <button
              onClick={() => setShowBulkMenu(!showBulkMenu)}
              className="flex items-center gap-1.5 h-8 px-3 text-sm border border-border rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
            >
              {selectedProducts.length} selected
              <ChevronDown size={14} />
            </button>
            {showBulkMenu && (
              <>
                <div className="fixed inset-0 z-20" onClick={() => setShowBulkMenu(false)} />
                <div className="absolute right-0 mt-1 w-64 bg-popover border border-border rounded-lg shadow-lg z-30 py-1">
                  <p className="px-3 py-1.5 text-xs font-medium text-muted-foreground">Bulk Actions</p>
                  <button onClick={() => { selectedProducts.forEach(id => { const p = allFilteredProducts.find(p => p.id === id); if (p) handleUpdateProduct(id, { ...p, status: 'Approved' }); }); setShowBulkMenu(false); }} className="w-full px-3 py-2 text-sm text-left hover:bg-muted transition-colors text-muted-foreground hover:text-foreground">Change Status</button>
                  <button className="w-full px-3 py-2 text-sm text-left hover:bg-muted transition-colors text-muted-foreground hover:text-foreground">Copy to Project</button>
                  <button onClick={() => { setShowExportModal(true); setShowBulkMenu(false); }} className="w-full px-3 py-2 text-sm text-left hover:bg-muted transition-colors text-muted-foreground hover:text-foreground">Export PDF Schedule</button>
                  <div className="border-t border-border my-1" />
                  <button onClick={() => { selectedProducts.forEach(id => handleArchiveProduct(id)); setSelectedProducts([]); setShowBulkMenu(false); }} className="w-full px-3 py-2 text-sm text-left hover:bg-muted transition-colors text-muted-foreground hover:text-foreground">Archive Selected</button>
                  <button onClick={() => { selectedProducts.forEach(id => handleDeleteProduct(id)); setSelectedProducts([]); setShowBulkMenu(false); }} className="w-full px-3 py-2 text-sm text-left hover:bg-muted transition-colors text-red-500 hover:text-red-600">Remove Selected</button>
                  <div className="border-t border-border my-1" />
                  <button onClick={() => setSelectedProducts([])} className="w-full px-3 py-2 text-sm text-left hover:bg-muted transition-colors text-muted-foreground hover:text-foreground">Clear Selection</button>
                </div>
              </>
            )}
          </div>
        )}
      </div>

      {/* ── Schedule Content — sits directly on page ── */}
      <div className="pt-4 pb-8">
        {/* Financial Summary slim card — only in financial view */}
        {viewMode === 'financial' && (
          <div className="mb-4 mx-4 px-4 py-3 card-base sticky top-0 z-10">
            <h3 className="font-medium text-sm mb-3">Financial Summary</h3>
            <div className="flex items-start gap-8">
              <div>
                <p className="text-lg font-semibold leading-tight">{allFilteredProducts.length}</p>
                <p className="text-xs text-muted-foreground mt-0.5">Total Products</p>
              </div>
              <div>
                <p className="text-lg font-semibold leading-tight">A${allFilteredProducts.reduce((s, p) => s + parseFloat(p.unitCost || '0') * parseFloat(p.quantity || '1'), 0).toLocaleString('en-AU', { minimumFractionDigits: 2 })}</p>
                <p className="text-xs text-muted-foreground mt-0.5">Total Value</p>
              </div>
            </div>
          </div>
        )}
        {displaySections.map((section, sectionIndex) => (
          <ScheduleSection
            key={section.id}
            section={section}
            allSections={schedule.sections}
            selectedProducts={selectedProducts}
            onSelectProduct={handleSelectProduct}
            onUpdateProduct={handleUpdateProduct}
            onDeleteProduct={handleDeleteProduct}
            onDuplicateProduct={handleDuplicateProduct}
            onAddProductBelow={handleAddProductBelow}
            onAddProduct={() => handleAddProduct(section.id)}
            onMoveProductToSection={handleMoveProductToSection}
            onArchiveProduct={handleArchiveProduct}
            onAddFlagToProduct={handleAddFlagToProduct}
            onToggleCollapse={() => handleToggleCollapse(section.id)}
            onRenameSection={(name) => handleRenameSection(section.id, name)}
            onDeleteSection={() => handleDeleteSection(section.id)}
            onMoveUp={() => handleMoveSectionUp(section.id)}
            onMoveDown={() => handleMoveSectionDown(section.id)}
            canMoveUp={sectionIndex > 0}
            canMoveDown={sectionIndex < displaySections.length - 1}
            onDragStart={handleDragStart}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
            onDragEnd={handleDragEnd}
            dragOverProductId={dragOverProductId}
            onDropOnSection={handleDropOnSection}
            dragOverSectionId={dragOverSectionId}
            setDragOverSectionId={setDragOverSectionId}
          />
        ))}

        {/* Add section */}
        <div className="px-4 pt-4">
          <button
            onClick={handleAddSection}
            className="flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground border border-dashed border-border rounded-xl px-4 py-3 w-full justify-center hover:bg-muted/20 transition-all"
          >
            <Plus size={16} />
            Add Section
          </button>
        </div>

        {/* Empty state */}
        {schedule.sections.length === 0 && (
          <div className="text-center py-20 text-muted-foreground">
            <Table size={44} className="mb-3 block" />
            <p className="text-sm font-medium mb-1">No sections yet</p>
            <p className="text-xs mb-5">Add your first section to start building this schedule</p>
            <button
              onClick={handleAddSection}
              className="inline-flex items-center gap-2 px-4 py-2 bg-foreground text-background rounded-lg hover:bg-foreground/90 transition-colors font-medium text-sm"
            >
              <Plus size={18} />
              Add Section
            </button>
          </div>
        )}

        {displaySections.length === 0 && schedule.sections.length > 0 && searchQuery && (
          <div className="text-center py-12 text-muted-foreground">
            <p className="text-sm">No products match your filters</p>
            <button onClick={() => setSearchQuery('')} className="text-xs hover:underline mt-2">Clear search</button>
          </div>
        )}
      </div>

      {showExportModal && (
        <ExportScheduleModal
          schedule={schedule}
          selectedProducts={selectedProducts}
          onClose={() => setShowExportModal(false)}
        />
      )}
    </div>
  );
}
