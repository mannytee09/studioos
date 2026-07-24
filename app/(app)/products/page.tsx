'use client';

import { useState, useMemo, useRef, useEffect } from 'react';
import { SidePanel } from '@/components/ui/SidePanel';
import { EmptyState } from '@/components/crm/EmptyState';
import { useActivity } from '@/lib/activity-context';
import { DynamicIcon } from '@/lib/icons';
import {
  Search, X, Link as LinkIcon, Sparkles, LoaderCircle,
  CheckCircle2, Package, LayoutGrid, Rows3, type LucideIcon,
} from 'lucide-react';

interface Product {
  id: string;
  name: string;
  collection: string;
  vendor: string;
  price: number;
  unit: string;
  leadTime: string;
  status: 'Available' | 'Discontinued' | 'On Order';
  imageIndex: number;
  url?: string;
}

const COLLECTIONS = ['Furniture', 'Lighting', 'Finishes', 'Textiles', 'Decor', 'Hardware', 'Appliances'];

const mockProducts: Product[] = [
  { id: 'p1', name: 'Velvet Lounge Chair', collection: 'Furniture', vendor: 'Artisan Furniture Co.', price: 1850, unit: 'each', leadTime: '6-8 weeks', status: 'Available', imageIndex: 0 },
  { id: 'p2', name: 'Brass Pendant Light', collection: 'Lighting', vendor: 'Luxury Lighting Co.', price: 720, unit: 'each', leadTime: '3-4 weeks', status: 'Available', imageIndex: 1 },
  { id: 'p3', name: 'Linen Drapery Fabric', collection: 'Textiles', vendor: 'Premium Fabrics Ltd', price: 145, unit: 'per metre', leadTime: '1-2 weeks', status: 'Available', imageIndex: 2 },
  { id: 'p4', name: 'Marble Wall Tile', collection: 'Finishes', vendor: 'Stone & Tile World', price: 220, unit: 'per sqm', leadTime: '2-3 weeks', status: 'Available', imageIndex: 3 },
  { id: 'p5', name: 'Walnut Coffee Table', collection: 'Furniture', vendor: 'Bespoke Cabinetry', price: 2400, unit: 'each', leadTime: '8-10 weeks', status: 'On Order', imageIndex: 4 },
  { id: 'p6', name: 'Brushed Brass Handle', collection: 'Hardware', vendor: 'Elite Hardware', price: 45, unit: 'each', leadTime: '1 week', status: 'Available', imageIndex: 5 },
  { id: 'p7', name: 'Ceramic Vase Set', collection: 'Decor', vendor: 'Coastal Decor Studio', price: 180, unit: 'set', leadTime: '2 weeks', status: 'Available', imageIndex: 0 },
  { id: 'p8', name: 'LED Strip Light Kit', collection: 'Lighting', vendor: 'Nordic Light House', price: 320, unit: 'kit', leadTime: '1-2 weeks', status: 'Discontinued', imageIndex: 1 },
];

const coverGradients = [
  'from-stone-200 to-stone-300',
  'from-amber-100 to-amber-200',
  'from-neutral-200 to-neutral-300',
  'from-zinc-200 to-zinc-300',
  'from-stone-300 to-stone-400',
  'from-slate-200 to-slate-300',
];

const collectionIcons: Record<string, LucideIcon> = {
  Furniture: Package,
  Lighting: Package,
  Finishes: Package,
  Textiles: Package,
  Decor: Package,
  Hardware: Package,
  Appliances: Package,
};

const statusColors: Record<string, string> = {
  Available: 'bg-green-50 text-green-700',
  Discontinued: 'bg-red-50 text-red-600',
  'On Order': 'bg-amber-50 text-amber-700',
};

type AddType = 'product' | 'url' | 'collection' | null;

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>(mockProducts);
  const { addActivity } = useActivity();
  const [search, setSearch] = useState('');
  const [activeCollection, setActiveCollection] = useState<string | null>(null);
  const [showFilterMenu, setShowFilterMenu] = useState(false);
  const [showAddDropdown, setShowAddDropdown] = useState(false);
  const [addType, setAddType] = useState<AddType>(null);
  const [view, setView] = useState<'grid' | 'table'>('grid');

  const addDropdownRef = useRef<HTMLDivElement>(null);

  const [newProduct, setNewProduct] = useState({ name: '', collection: 'Furniture', vendor: '', price: '', unit: 'each', leadTime: '' });
  const [newCollection, setNewCollection] = useState('');
  const [urlInput, setUrlInput] = useState('');
  const [urlFetching, setUrlFetching] = useState(false);
  const [urlFetched, setUrlFetched] = useState(false);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (addDropdownRef.current && !addDropdownRef.current.contains(e.target as Node)) setShowAddDropdown(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return products.filter(p => {
      const matchSearch = !search || p.name.toLowerCase().includes(q) || p.vendor.toLowerCase().includes(q) || p.collection.toLowerCase().includes(q);
      return matchSearch;
    });
  }, [products, search]);

  // Group products by collection for the landing view
  const collectionGroups = useMemo(() => {
    const map: Record<string, Product[]> = {};
    filtered.forEach(p => {
      if (!map[p.collection]) map[p.collection] = [];
      map[p.collection].push(p);
    });
    return COLLECTIONS
      .filter(c => map[c]?.length > 0)
      .map(c => ({ collection: c, products: map[c] }));
  }, [filtered]);

  // Products within active collection
  const activeCollectionProducts = useMemo(() => {
    if (!activeCollection) return [];
    return filtered.filter(p => p.collection === activeCollection);
  }, [filtered, activeCollection]);

  const handleAddProduct = () => {
    if (!newProduct.name) return;
    const created: Product = {
      id: `p-${Date.now()}`,
      name: newProduct.name,
      collection: newProduct.collection,
      vendor: newProduct.vendor || 'Unassigned',
      price: parseInt(newProduct.price.replace(/[^0-9]/g, '')) || 0,
      unit: newProduct.unit,
      leadTime: newProduct.leadTime || 'TBC',
      status: 'Available',
      imageIndex: Math.floor(Math.random() * coverGradients.length),
    };
    setProducts(prev => [created, ...prev]);
    addActivity({
      title: 'Product Added',
      description: `"${newProduct.name}" added to the product library`,
      icon: 'bookmark_add',
      source: 'Products',
    });
    setNewProduct({ name: '', collection: 'Furniture', vendor: '', price: '', unit: 'each', leadTime: '' });
    setAddType(null);
  };

  const handleAddCollection = () => {
    if (!newCollection.trim()) return;
    addActivity({
      title: 'Collection Added',
      description: `"${newCollection}" collection created`,
      icon: 'folder',
      source: 'Products',
    });
    setNewCollection('');
    setAddType(null);
  };

  const handleFetchDetails = () => {
    if (!urlInput.trim()) return;
    setUrlFetching(true);
    // Simulate AI fetch
    setTimeout(() => {
      setUrlFetching(false);
      setUrlFetched(true);
      setNewProduct({
        name: 'Tanya 2-Seater Sofa',
        collection: 'Furniture',
        vendor: 'Kave Home',
        price: '1290',
        unit: 'each',
        leadTime: '4-6 weeks',
      });
    }, 1800);
  };

  const handleAddUrlProduct = () => {
    if (!newProduct.name) return;
    const created: Product = {
      id: `p-${Date.now()}`,
      name: newProduct.name,
      collection: newProduct.collection,
      vendor: newProduct.vendor || 'Unassigned',
      price: parseInt(newProduct.price.replace(/[^0-9]/g, '')) || 0,
      unit: newProduct.unit,
      leadTime: newProduct.leadTime || 'TBC',
      status: 'Available',
      imageIndex: Math.floor(Math.random() * coverGradients.length),
      url: urlInput,
    };
    setProducts(prev => [created, ...prev]);
    addActivity({
      title: 'Product Added from URL',
      description: `"${newProduct.name}" added to the product library`,
      icon: 'bookmark_add',
      source: 'Products',
    });
    setNewProduct({ name: '', collection: 'Furniture', vendor: '', price: '', unit: 'each', leadTime: '' });
    setUrlInput('');
    setUrlFetched(false);
    setAddType(null);
  };

  const openAddType = (type: AddType) => {
    setAddType(type);
    setShowAddDropdown(false);
  };

  const closePanel = () => {
    setAddType(null);
    setUrlInput('');
    setUrlFetched(false);
    setNewProduct({ name: '', collection: 'Furniture', vendor: '', price: '', unit: 'each', leadTime: '' });
  };

  // ── Collection card view (landing) ──────────────────────────────────────────
  const renderCollectionCards = () => {
    if (collectionGroups.length === 0) {
      return (
        <EmptyState
          icon="inventory_2"
          description={search ? 'Try adjusting your search.' : 'Add your first product to the library.'}
        />
      );
    }
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {collectionGroups.map(({ collection, products: items }) => (
          <div
            key={collection}
            onClick={() => setActiveCollection(collection)}
            className="card-base card-hover p-5 cursor-pointer"
          >
            <div className="flex items-start justify-between mb-3">
              <div className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center">
                {(() => { const Icon = collectionIcons[collection] ?? Package; return <Icon size={20} className="text-foreground" />; })()}
              </div>
              <span className="text-xs text-muted-foreground">{items.length} items</span>
            </div>
            <p className="font-medium text-sm">{collection}</p>
            <p className="text-xs text-muted-foreground mt-0.5 truncate">
              {items.slice(0, 2).map(p => p.name).join(', ')}{items.length > 2 ? '…' : ''}
            </p>
          </div>
        ))}
      </div>
    );
  };

  // ── Products within a collection ────────────────────────────────────────────
  const renderProducts = () => {
    if (activeCollectionProducts.length === 0) {
      return (
        <EmptyState
          icon="inventory_2"
          description="Add a product to this collection."
        />
      );
    }
    if (view === 'grid') {
      return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {activeCollectionProducts.map(product => (
            <div key={product.id} className="card-base card-hover overflow-hidden cursor-pointer">
              <div className={`h-32 bg-gradient-to-br ${coverGradients[product.imageIndex]} flex items-center justify-center`}>
                <Package size={40} className="text-foreground/30" />
              </div>
              <div className="p-4 space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <p className="font-medium text-sm truncate">{product.name}</p>
                  <span className={`text-[10px] px-1.5 py-0.5 rounded-full whitespace-nowrap ${statusColors[product.status]}`}>{product.status}</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">{product.collection}</span>
                  <span className="font-medium">A${product.price.toLocaleString('en-AU')}/{product.unit}</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground truncate">{product.vendor}</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">Lead Time</span>
                  <span>{product.leadTime}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      );
    }
    return (
      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border bg-muted/30">
              <th className="table-header text-left">Product</th>
              <th className="table-header text-left">Collection</th>
              <th className="table-header text-left">Vendor</th>
              <th className="table-header text-right">Price</th>
              <th className="table-header text-left">Lead Time</th>
              <th className="table-header text-left">Status</th>
            </tr>
          </thead>
          <tbody>
            {activeCollectionProducts.map(product => (
              <tr key={product.id} className="hover:bg-muted/20 cursor-pointer border-b border-border/50 last:border-b-0">
                <td className="table-cell"><p className="font-medium">{product.name}</p></td>
                <td className="table-cell text-muted-foreground">{product.collection}</td>
                <td className="table-cell text-muted-foreground">{product.vendor}</td>
                <td className="table-cell text-right text-muted-foreground">A${product.price.toLocaleString('en-AU')}/{product.unit}</td>
                <td className="table-cell text-muted-foreground">{product.leadTime}</td>
                <td className="table-cell"><span className={`text-xs px-2 py-0.5 rounded-full ${statusColors[product.status]}`}>{product.status}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  const showCollectionCards = !activeCollection && !search;

  return (
    <>
      {/* ── Add Product side panel ── */}
      {addType === 'product' && (
        <SidePanel title="Add Product" subtitle="Add a product to your library" onClose={closePanel} footer={
          <><div /><div className="flex gap-2">
            <button onClick={closePanel} className="notion-button border border-border">Cancel</button>
            <button onClick={handleAddProduct} className="btn-primary">Add Product</button>
          </div></>
        }>
          <div className="px-6 py-5 space-y-4">
            <div>
              <label className="block text-xs text-muted-foreground mb-1.5">Product Name *</label>
              <input value={newProduct.name} onChange={e => setNewProduct(p => ({ ...p, name: e.target.value }))} placeholder="Velvet Lounge Chair" className="modal-input" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-muted-foreground mb-1.5">Collection</label>
                <select value={newProduct.collection} onChange={e => setNewProduct(p => ({ ...p, collection: e.target.value }))} className="modal-input">
                  {COLLECTIONS.map(c => <option key={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs text-muted-foreground mb-1.5">Vendor</label>
                <input value={newProduct.vendor} onChange={e => setNewProduct(p => ({ ...p, vendor: e.target.value }))} placeholder="Artisan Furniture Co." className="modal-input" />
              </div>
              <div>
                <label className="block text-xs text-muted-foreground mb-1.5">Price (A$)</label>
                <input value={newProduct.price} onChange={e => setNewProduct(p => ({ ...p, price: e.target.value }))} placeholder="1850" className="modal-input" />
              </div>
              <div>
                <label className="block text-xs text-muted-foreground mb-1.5">Unit</label>
                <input value={newProduct.unit} onChange={e => setNewProduct(p => ({ ...p, unit: e.target.value }))} placeholder="each" className="modal-input" />
              </div>
              <div className="col-span-2">
                <label className="block text-xs text-muted-foreground mb-1.5">Lead Time</label>
                <input value={newProduct.leadTime} onChange={e => setNewProduct(p => ({ ...p, leadTime: e.target.value }))} placeholder="6-8 weeks" className="modal-input" />
              </div>
            </div>
          </div>
        </SidePanel>
      )}

      {/* ── Product from URL side panel ── */}
      {addType === 'url' && (
        <SidePanel onClose={closePanel} footer={
          <><div /><div className="flex gap-2">
            <button onClick={closePanel} className="notion-button border border-border">Cancel</button>
            {urlFetched ? (
              <button onClick={handleAddUrlProduct} className="btn-primary">Add product</button>
            ) : (
              <button onClick={handleFetchDetails} disabled={urlFetching || !urlInput.trim()} className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed">
                {urlFetching ? 'Fetching…' : 'Fetch details'}
              </button>
            )}
          </div></>
        }>
          <div className="px-6 py-5 space-y-5">
            {!urlFetched && (
              <>
                <div>
                  <p className="text-sm text-muted-foreground leading-relaxed mb-4">
                    Provide a product detail URL from any e-shop, for example:
                  </p>
                  <p className="text-xs text-muted-foreground/80 bg-muted/40 rounded-lg px-3 py-2 break-all leading-relaxed">
                    https://kavehome.com/en/en/p/tanya-2-seater-sofa-upholstered-in-dark-grey-183-cm-fsc-mix-credit
                  </p>
                </div>
                <div>
                  <label className="block text-xs text-muted-foreground mb-1.5">Product URL</label>
                  <div className="relative">
                    <LinkIcon size={16} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
                    <input
                      type="url"
                      value={urlInput}
                      onChange={e => setUrlInput(e.target.value)}
                      placeholder="https://…"
                      className="modal-input pl-8"
                    />
                  </div>
                </div>
                <div className="flex items-start gap-2 p-3 rounded-lg bg-muted/30">
                  <Sparkles size={16} className="text-muted-foreground flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-xs font-medium text-foreground">AI-powered details</p>
                    <p className="text-xs text-muted-foreground mt-0.5">Get more product details automatically with AI. Details may be inaccurate.</p>
                  </div>
                </div>
              </>
            )}

            {urlFetching && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground py-4">
                <LoaderCircle size={18} className="animate-spin" />
                Fetching product details…
              </div>
            )}

            {urlFetched && (
              <div className="space-y-4">
                <div className="flex items-start gap-2 p-3 rounded-lg bg-green-50 border border-green-200">
                  <CheckCircle2 size={16} className="text-green-600 flex-shrink-0 mt-0.5" />
                  <p className="text-xs text-green-700">Details fetched successfully. You can edit them below before adding.</p>
                </div>
                <div>
                  <label className="block text-xs text-muted-foreground mb-1.5">Product Name *</label>
                  <input value={newProduct.name} onChange={e => setNewProduct(p => ({ ...p, name: e.target.value }))} className="modal-input" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs text-muted-foreground mb-1.5">Collection</label>
                    <select value={newProduct.collection} onChange={e => setNewProduct(p => ({ ...p, collection: e.target.value }))} className="modal-input">
                      {COLLECTIONS.map(c => <option key={c}>{c}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs text-muted-foreground mb-1.5">Vendor</label>
                    <input value={newProduct.vendor} onChange={e => setNewProduct(p => ({ ...p, vendor: e.target.value }))} className="modal-input" />
                  </div>
                  <div>
                    <label className="block text-xs text-muted-foreground mb-1.5">Price (A$)</label>
                    <input value={newProduct.price} onChange={e => setNewProduct(p => ({ ...p, price: e.target.value }))} className="modal-input" />
                  </div>
                  <div>
                    <label className="block text-xs text-muted-foreground mb-1.5">Unit</label>
                    <input value={newProduct.unit} onChange={e => setNewProduct(p => ({ ...p, unit: e.target.value }))} className="modal-input" />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-xs text-muted-foreground mb-1.5">Lead Time</label>
                    <input value={newProduct.leadTime} onChange={e => setNewProduct(p => ({ ...p, leadTime: e.target.value }))} className="modal-input" />
                  </div>
                </div>
              </div>
            )}
          </div>
        </SidePanel>
      )}

      {/* ── Add Collection side panel ── */}
      {addType === 'collection' && (
        <SidePanel onClose={closePanel} footer={
          <><div /><div className="flex gap-2">
            <button onClick={closePanel} className="notion-button border border-border">Cancel</button>
            <button onClick={handleAddCollection} className="btn-primary">Add Collection</button>
          </div></>
        }>
          <div className="px-6 py-5 space-y-4">
            <div>
              <label className="block text-xs text-muted-foreground mb-1.5">Collection Name *</label>
              <input value={newCollection} onChange={e => setNewCollection(e.target.value)} placeholder="e.g. Outdoor Furniture" className="modal-input" />
            </div>
          </div>
        </SidePanel>
      )}

      <div className="space-y-5">
        <div>
          <h1 className="text-2xl font-semibold">Products</h1>
          <p className="text-muted-foreground text-sm mt-0.5">Your custom product library for schedules and procurement.</p>
        </div>

        {/* Toolbar */}
        <div className="flex items-center gap-2 flex-wrap">
          {activeCollection && !search && (
            <div className="flex border border-border rounded-lg overflow-hidden">
              <button
                onClick={() => setActiveCollection(null)}
                className="h-8 px-3 text-sm text-muted-foreground hover:bg-muted/50 transition-colors flex items-center gap-1.5"
              >
                All Collections
              </button>
            </div>
          )}

          <div className="flex-1" />

          <div className="relative">
            <Search size={16} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
            <input type="text" placeholder="Search products..." value={search} onChange={e => setSearch(e.target.value)}
              className="pl-8 pr-3 h-8 text-sm border border-border rounded-lg bg-background w-52 placeholder:text-muted-foreground outline-none focus:border-foreground/30 transition-colors" />
            {search && <button onClick={() => setSearch('')} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"><X size={14} /></button>}
          </div>

          {!showCollectionCards && (
            <div className="flex border border-border rounded-lg overflow-hidden">
              <button onClick={() => setView('grid')} className={`w-8 h-8 flex items-center justify-center transition-colors ${view === 'grid' ? 'bg-foreground text-background' : 'text-muted-foreground hover:bg-muted/50'}`}>
                <LayoutGrid size={18} />
              </button>
              <button onClick={() => setView('table')} className={`w-8 h-8 flex items-center justify-center border-l border-border transition-colors ${view === 'table' ? 'bg-foreground text-background' : 'text-muted-foreground hover:bg-muted/50'}`}>
                <Rows3 size={18} />
              </button>
            </div>
          )}

          {/* Add New dropdown */}
          <div className="relative" ref={addDropdownRef}>
            <button onClick={() => setShowAddDropdown(!showAddDropdown)} className="btn-primary">
              + Add New
            </button>
            {showAddDropdown && (
              <>
                <div className="fixed inset-0 z-20" onClick={() => setShowAddDropdown(false)} />
                <div className="absolute right-0 mt-1 w-48 bg-popover border border-border rounded-xl shadow-lg z-30 py-2 overflow-hidden">
                  <button onClick={() => openAddType('product')} className="filter-item filter-item-inactive">
                    <Package size={15} />
                    Product
                  </button>
                  <button onClick={() => openAddType('url')} className="filter-item filter-item-inactive">
                    <LinkIcon size={15} />
                    Product from URL
                  </button>
                  <button onClick={() => openAddType('collection')} className="filter-item filter-item-inactive">
                    <Package size={15} />
                    Collection
                  </button>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Content */}
        {showCollectionCards ? (
          renderCollectionCards()
        ) : activeCollection && !search ? (
          <>
            <p className="text-sm font-medium">{activeCollection} <span className="text-muted-foreground font-normal">· {activeCollectionProducts.length} products</span></p>
            {renderProducts()}
          </>
        ) : (
          // Search results view
          filtered.length === 0 ? (
            <EmptyState icon="inventory_2" description="Try adjusting your search." />
          ) : view === 'grid' ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {filtered.map(product => (
                <div key={product.id} className="card-base card-hover overflow-hidden cursor-pointer">
                  <div className={`h-32 bg-gradient-to-br ${coverGradients[product.imageIndex]} flex items-center justify-center`}>
                    <Package size={40} className="text-foreground/30" />
                  </div>
                  <div className="p-4 space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <p className="font-medium text-sm truncate">{product.name}</p>
                      <span className={`text-[10px] px-1.5 py-0.5 rounded-full whitespace-nowrap ${statusColors[product.status]}`}>{product.status}</span>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-muted-foreground">{product.collection}</span>
                      <span className="font-medium">A${product.price.toLocaleString('en-AU')}/{product.unit}</span>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-muted-foreground truncate">{product.vendor}</span>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-muted-foreground">Lead Time</span>
                      <span>{product.leadTime}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-card border border-border rounded-xl overflow-hidden">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border bg-muted/30">
                    <th className="table-header text-left">Product</th>
                    <th className="table-header text-left">Collection</th>
                    <th className="table-header text-left">Vendor</th>
                    <th className="table-header text-right">Price</th>
                    <th className="table-header text-left">Lead Time</th>
                    <th className="table-header text-left">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map(product => (
                    <tr key={product.id} className="hover:bg-muted/20 cursor-pointer border-b border-border/50 last:border-b-0">
                      <td className="table-cell"><p className="font-medium">{product.name}</p></td>
                      <td className="table-cell text-muted-foreground">{product.collection}</td>
                      <td className="table-cell text-muted-foreground">{product.vendor}</td>
                      <td className="table-cell text-right text-muted-foreground">A${product.price.toLocaleString('en-AU')}/{product.unit}</td>
                      <td className="table-cell text-muted-foreground">{product.leadTime}</td>
                      <td className="table-cell"><span className={`text-xs px-2 py-0.5 rounded-full ${statusColors[product.status]}`}>{product.status}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )
        )}
      </div>
    </>
  );
}
