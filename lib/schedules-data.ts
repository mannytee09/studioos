// ─── Types ───────────────────────────────────────────────────────────────────

export type ProductStatus = 'Draft' | 'Pending Approval' | 'Approved' | 'Ordered' | 'Installed' | 'Archived';

export type ProductFlag = 'Urgent' | 'Client Review' | 'Awaiting Supplier' | 'Order Required' | 'Site Confirmation';

export interface ScheduleProduct {
  id: string;
  // General
  name: string;
  description: string;
  docCode: string;
  brand: string;
  supplier: string;
  manufacturer: string;
  productType: string;
  productUrl: string;
  sku: string;
  // Specifications
  width: string;
  length: string;
  height: string;
  depth: string;
  weight: string;
  thickness: string;
  material: string;
  finish: string;
  colour: string;
  // Commercial
  unitCost: string;
  quantity: string;
  leadTime: string;
  // Documentation
  importantInfo: string;
  notes: string;
  internalNotes: string;
  imageUrl: string;
  // Status & flags
  status: ProductStatus;
  flags: ProductFlag[];
  order: number;
}

export interface ScheduleSection {
  id: string;
  name: string;
  products: ScheduleProduct[];
  collapsed: boolean;
  order: number;
}

export interface Schedule {
  id: string;
  projectId: string;
  name: string;
  sections: ScheduleSection[];
  createdAt: string;
  updatedAt: string;
}

// ─── Constants ───────────────────────────────────────────────────────────────

export const PRODUCT_STATUSES: ProductStatus[] = [
  'Draft', 'Pending Approval', 'Approved', 'Ordered', 'Installed', 'Archived',
];

export const PRODUCT_FLAGS: ProductFlag[] = [
  'Urgent', 'Client Review', 'Awaiting Supplier', 'Order Required', 'Site Confirmation',
];

export const SCHEDULE_TEMPLATES = [
  'Furniture Schedule',
  'Decorative Lighting Schedule',
  'Door Hardware Schedule',
  'Sanitaryware Schedule',
  'Equipment Schedule',
  'Material References',
  'Blinds & Drapery Schedule',
];

export const productStatusConfig: Record<ProductStatus, { color: string; dot: string }> = {
  'Draft':            { color: 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400',       dot: 'bg-gray-400' },
  'Pending Approval': { color: 'bg-amber-50 text-amber-700 dark:bg-amber-900/20 dark:text-amber-400', dot: 'bg-amber-500' },
  'Approved':         { color: 'bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400', dot: 'bg-green-500' },
  'Ordered':          { color: 'bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400',     dot: 'bg-blue-500' },
  'Installed':        { color: 'bg-teal-50 text-teal-700 dark:bg-teal-900/20 dark:text-teal-400',     dot: 'bg-teal-500' },
  'Archived':         { color: 'bg-muted text-muted-foreground',                                       dot: 'bg-muted-foreground' },
};

export const flagConfig: Record<ProductFlag, { color: string }> = {
  'Urgent':             { color: 'bg-red-50 text-red-700 border border-red-200' },
  'Client Review':      { color: 'bg-blue-50 text-blue-700 border border-blue-200' },
  'Awaiting Supplier':  { color: 'bg-amber-50 text-amber-700 border border-amber-200' },
  'Order Required':     { color: 'bg-orange-50 text-orange-700 border border-orange-200' },
  'Site Confirmation':  { color: 'bg-purple-50 text-purple-700 border border-purple-200' },
};

// ─── Helpers ─────────────────────────────────────────────────────────────────

export function createEmptyProduct(order: number): ScheduleProduct {
  return {
    id: `prod-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    name: '',
    description: '',
    docCode: '',
    brand: '',
    supplier: '',
    manufacturer: '',
    productType: '',
    productUrl: '',
    sku: '',
    width: '',
    length: '',
    height: '',
    depth: '',
    weight: '',
    thickness: '',
    material: '',
    finish: '',
    colour: '',
    unitCost: '',
    quantity: '1',
    leadTime: '',
    importantInfo: '',
    notes: '',
    internalNotes: '',
    imageUrl: '',
    status: 'Draft',
    flags: [],
    order,
  };
}

export function createEmptySection(order: number): ScheduleSection {
  return {
    id: `sec-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    name: 'Untitled Section',
    products: [],
    collapsed: false,
    order,
  };
}

// ─── Mock Data ───────────────────────────────────────────────────────────────

export const mockSchedules: Schedule[] = [
  {
    id: 'sched-1',
    projectId: 'proj-1',
    name: 'Furniture Schedule',
    createdAt: 'Jan 20, 2024',
    updatedAt: 'Dec 18, 2024',
    sections: [
      {
        id: 'sec-1',
        name: 'Living & Dining',
        collapsed: false,
        order: 0,
        products: [
          {
            id: 'prod-1',
            name: 'Minotti Lawrence Sofa',
            description: '3-seater modular sofa in bouclé fabric',
            docCode: 'FF-001',
            brand: 'Minotti',
            supplier: 'Space Furniture',
            manufacturer: 'Minotti',
            productType: 'Sofa / Living Room',
            productUrl: '',
            sku: 'MIN-LAW-3S',
            width: '2800',
            length: '',
            height: '720',
            depth: '960',
            weight: '',
            thickness: '',
            material: 'Bouclé',
            finish: 'Natural White',
            colour: 'Cream',
            unitCost: '18500',
            quantity: '1',
            leadTime: '14 weeks',
            importantInfo: 'Custom fabric selected — confirm with client',
            notes: 'Custom fabric selected — confirm with client',
            internalNotes: '',
            imageUrl: 'https://images.pexels.com/photos/1350789/pexels-photo-1350789.jpeg?auto=compress&cs=tinysrgb&w=120&h=120&fit=crop',
            status: 'Approved',
            flags: ['Client Review'],
            order: 0,
          },
          {
            id: 'prod-2',
            name: 'Cassina LC10 Coffee Table',
            description: 'Low coffee table with glass top',
            docCode: 'FF-002',
            brand: 'Cassina',
            supplier: 'Living Edge',
            manufacturer: 'Cassina',
            productType: 'Coffee Table / Living Room',
            productUrl: '',
            sku: 'CAS-LC10',
            width: '1200',
            length: '600',
            height: '320',
            depth: '',
            weight: '',
            thickness: '12',
            material: 'Steel / Glass',
            finish: 'Chrome',
            colour: 'Silver',
            unitCost: '4200',
            quantity: '1',
            leadTime: '10 weeks',
            importantInfo: '',
            notes: '',
            internalNotes: '',
            imageUrl: 'https://images.pexels.com/photos/1571460/pexels-photo-1571460.jpeg?auto=compress&cs=tinysrgb&w=120&h=120&fit=crop',
            status: 'Pending Approval',
            flags: [],
            order: 1,
          },
          {
            id: 'prod-3',
            name: 'Vitra Eames Lounge Chair',
            description: 'Lounge chair and ottoman in walnut & leather',
            docCode: 'FF-003',
            brand: 'Vitra',
            supplier: 'Living Edge',
            manufacturer: 'Vitra',
            productType: 'Lounge Chair / Reading Nook',
            productUrl: '',
            sku: 'VIT-ELC-BK',
            width: '830',
            length: '',
            height: '850',
            depth: '840',
            weight: '',
            thickness: '',
            material: 'Walnut / Leather',
            finish: 'Oiled Walnut',
            colour: 'Black',
            unitCost: '9800',
            quantity: '2',
            leadTime: '12 weeks',
            importantInfo: 'Pair required for reading nook',
            notes: 'Pair required for reading nook',
            internalNotes: 'Check lead time — supplier confirmed 12 weeks only if ordered before March',
            imageUrl: 'https://images.pexels.com/photos/1884581/pexels-photo-1884581.jpeg?auto=compress&cs=tinysrgb&w=120&h=120&fit=crop',
            status: 'Approved',
            flags: [],
            order: 2,
          },
        ],
      },
      {
        id: 'sec-2',
        name: 'Master Bedroom',
        collapsed: false,
        order: 1,
        products: [
          {
            id: 'prod-4',
            name: 'B&B Italia Charles Bed',
            description: 'King size upholstered platform bed',
            docCode: 'FF-004',
            brand: 'B&B Italia',
            supplier: 'Space Furniture',
            manufacturer: 'B&B Italia',
            productType: 'Bed / Master Bedroom',
            productUrl: '',
            sku: 'BBI-CH-K',
            width: '2100',
            length: '2200',
            height: '900',
            depth: '',
            weight: '',
            thickness: '',
            material: 'Timber / Fabric',
            finish: 'Linen',
            colour: 'Warm Grey',
            unitCost: '12400',
            quantity: '1',
            leadTime: '16 weeks',
            importantInfo: '',
            notes: '',
            internalNotes: 'Awaiting supplier confirmation on lead time',
            imageUrl: 'https://images.pexels.com/photos/271624/pexels-photo-271624.jpeg?auto=compress&cs=tinysrgb&w=120&h=120&fit=crop',
            status: 'Draft',
            flags: ['Awaiting Supplier'],
            order: 0,
          },
        ],
      },
    ],
  },
  {
    id: 'sched-2',
    projectId: 'proj-1',
    name: 'Decorative Lighting Schedule',
    createdAt: 'Feb 5, 2024',
    updatedAt: 'Nov 20, 2024',
    sections: [
      {
        id: 'sec-3',
        name: 'Pendants & Chandeliers',
        collapsed: false,
        order: 0,
        products: [
          {
            id: 'prod-5',
            name: 'Flos Arco Floor Lamp',
            description: 'Iconic arc floor lamp with marble base',
            docCode: 'LT-001',
            brand: 'Flos',
            supplier: 'ECC Lighting',
            manufacturer: 'Flos',
            productType: 'Floor Lamp / Living Room',
            productUrl: '',
            sku: 'FLO-ARCO',
            width: '',
            length: '',
            height: '2500',
            depth: '',
            weight: '30',
            thickness: '',
            material: 'Marble / Steel',
            finish: 'Polished',
            colour: 'White / Chrome',
            unitCost: '3200',
            quantity: '1',
            leadTime: '8 weeks',
            importantInfo: 'Position over reading chair cluster',
            notes: 'Position over reading chair cluster',
            internalNotes: '',
            imageUrl: 'https://images.pexels.com/photos/1643383/pexels-photo-1643383.jpeg?auto=compress&cs=tinysrgb&w=120&h=120&fit=crop',
            status: 'Ordered',
            flags: [],
            order: 0,
          },
        ],
      },
    ],
  },
];
