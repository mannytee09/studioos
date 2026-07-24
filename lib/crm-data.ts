// ─── Types ───────────────────────────────────────────────────────────────────

export type LeadStatus = 'New Enquiry' | 'Discovery Call' | 'Proposal Sent' | 'Won' | 'Lost';
export type ProjectType = 'Residential' | 'Commercial' | 'Hospitality' | 'Retail' | 'Multi Residential';
export type LeadSource = 'Website' | 'Instagram' | 'Referral' | 'Returning Client' | 'Builder' | 'Architect' | 'Other';
export type ClientStatus = 'Active' | 'Inactive' | 'VIP';

export interface LeadContact {
  firstName: string;
  lastName: string;
  company: string;
  email: string;
  phone: string;
  address: string;
  preferredContact: 'Email' | 'Phone' | 'SMS';
}

export interface TimelineEvent {
  id: string;
  date: string;
  type: 'created' | 'call' | 'meeting' | 'email' | 'status' | 'note' | 'task' | 'invoice';
  title: string;
  description?: string;
}

export interface Note {
  id: string;
  content: string;
  author: string;
  createdAt: string;
}

export type TaskStatus = 'To do' | 'In Progress' | 'Waiting' | 'Done';

export interface Task {
  id: string;
  title: string;
  completed: boolean;
  dueDate?: string;
  status?: TaskStatus;
  phase?: string;
  description?: string;
}

export interface Lead {
  id: string;
  // contact
  firstName: string;
  lastName: string;
  company: string;
  email: string;
  phone: string;
  address: string;
  preferredContact: 'Email' | 'Phone' | 'SMS';
  // project
  projectName: string;
  projectType: ProjectType;
  estimatedBudget: number;
  expectedStartDate: string;
  // studio
  leadSource: LeadSource;
  assignedDesigner: string;
  status: LeadStatus;
  nextFollowUp: string;
  createdAt: string;
  pinned: boolean;
  // detail
  notes: Note[];
  timeline: TimelineEvent[];
  tasks: Task[];
}

export interface ClientContact {
  id: string;
  name: string;
  position: string;
  email: string;
  phone: string;
  isPrimary: boolean;
}

export interface ClientProject {
  id: string;
  name: string;
  phase: string;
  status: 'Active' | 'Completed' | 'On Hold' | 'Planned';
  budget: number;
}

export interface Client {
  id: string;
  company: string;
  primaryContact: string;
  email: string;
  phone: string;
  address: string;
  website: string;
  assignedDesigner: string;
  status: ClientStatus;
  clientSince: string;
  lastContact: string;
  projectType: ProjectType;
  pinned: boolean;
  // relations
  contacts: ClientContact[];
  projects: ClientProject[];
  notes: Note[];
  timeline: TimelineEvent[];
  // billing placeholder
  billingAddress?: string;
  taxNumber?: string;
}

// ─── Mock Leads ──────────────────────────────────────────────────────────────

export const mockLeads: Lead[] = [
  {
    id: 'lead-1',
    firstName: 'Sophie',
    lastName: 'Williams',
    company: 'Williams Family',
    email: 'sophie.williams@email.com',
    phone: '+61 402 111 222',
    address: '12 Harbour View Drive, Mosman NSW 2088',
    preferredContact: 'Email',
    projectName: 'Mosman Beach House',
    projectType: 'Residential',
    estimatedBudget: 180000,
    expectedStartDate: 'Feb 2025',
    leadSource: 'Instagram',
    assignedDesigner: 'Ellie S.',
    status: 'New Enquiry',
    nextFollowUp: 'Dec 22, 2024',
    createdAt: 'Dec 15, 2024',
    pinned: false,
    notes: [
      { id: 'n1', content: 'Client is interested in a full renovation of a 4-bedroom beach house. Mentioned a preference for coastal contemporary style with neutral tones and natural materials.', author: 'Ellie S.', createdAt: 'Dec 15, 2024' },
    ],
    timeline: [
      { id: 't1', date: 'Dec 15, 2024', type: 'created', title: 'Lead Created', description: 'Enquiry received via Instagram DM' },
      { id: 't2', date: 'Dec 16, 2024', type: 'email', title: 'Initial email sent', description: 'Welcome email and intake form sent to Sophie' },
    ],
    tasks: [
      { id: 'tk1', title: 'Send intake questionnaire', completed: true, dueDate: 'Dec 16, 2024' },
      { id: 'tk2', title: 'Schedule discovery call', completed: false, dueDate: 'Dec 22, 2024' },
      { id: 'tk3', title: 'Prepare mood board examples', completed: false, dueDate: 'Dec 24, 2024' },
    ],
  },
  {
    id: 'lead-2',
    firstName: 'David',
    lastName: 'Harrison',
    company: 'Harrison Group',
    email: 'david@harrisongroup.com',
    phone: '+61 411 333 444',
    address: '5/88 Collins Street, Melbourne VIC 3000',
    preferredContact: 'Phone',
    projectName: 'Melbourne Penthouse Interior',
    projectType: 'Residential',
    estimatedBudget: 350000,
    expectedStartDate: 'Mar 2025',
    leadSource: 'Referral',
    assignedDesigner: 'Ellie S.',
    status: 'Discovery Call',
    nextFollowUp: 'Dec 28, 2024',
    createdAt: 'Dec 10, 2024',
    pinned: false,
    notes: [
      { id: 'n2', content: 'High-end penthouse renovation. David is particular about finishes and wants bespoke cabinetry throughout. Referred by the Mitchells.', author: 'Ellie S.', createdAt: 'Dec 10, 2024' },
      { id: 'n3', content: 'Discovery call completed. Client confirmed scope and timeline. Very motivated to proceed.', author: 'Ellie S.', createdAt: 'Dec 18, 2024' },
    ],
    timeline: [
      { id: 't3', date: 'Dec 10, 2024', type: 'created', title: 'Lead Created', description: 'Referral from James Mitchell' },
      { id: 't4', date: 'Dec 12, 2024', type: 'call', title: 'Intro phone call', description: '15-minute call to understand project scope' },
      { id: 't5', date: 'Dec 18, 2024', type: 'meeting', title: 'Discovery Call Completed', description: '60-minute Zoom with David and his PA' },
    ],
    tasks: [
      { id: 'tk4', title: 'Send follow-up email with next steps', completed: true, dueDate: 'Dec 19, 2024' },
      { id: 'tk5', title: 'Prepare initial fee proposal', completed: false, dueDate: 'Dec 28, 2024' },
    ],
  },
  {
    id: 'lead-3',
    firstName: 'Emma',
    lastName: 'Collins',
    company: 'Luxe Hotels Group',
    email: 'emma.collins@luxehotels.com',
    phone: '+61 420 555 666',
    address: '100 Crown Street, Surry Hills NSW 2010',
    preferredContact: 'Email',
    projectName: 'Sydney Boutique Hotel Lobby',
    projectType: 'Hospitality',
    estimatedBudget: 520000,
    expectedStartDate: 'Apr 2025',
    leadSource: 'Architect',
    assignedDesigner: 'Ellie S.',
    status: 'Proposal Sent',
    nextFollowUp: 'Jan 5, 2025',
    createdAt: 'Nov 28, 2024',
    pinned: false,
    notes: [
      { id: 'n4', content: 'Large-scale hospitality project. Emma needs full concept through to FF&E. Referred by architect Tom Reid.', author: 'Ellie S.', createdAt: 'Nov 28, 2024' },
    ],
    timeline: [
      { id: 't6', date: 'Nov 28, 2024', type: 'created', title: 'Lead Created', description: 'Referred by architect Tom Reid' },
      { id: 't7', date: 'Dec 2, 2024', type: 'meeting', title: 'Site visit completed', description: 'Visited the hotel site with Emma' },
      { id: 't8', date: 'Dec 10, 2024', type: 'email', title: 'Proposal Sent', description: 'Comprehensive design proposal emailed' },
    ],
    tasks: [
      { id: 'tk6', title: 'Follow up on proposal', completed: false, dueDate: 'Jan 5, 2025' },
    ],
  },
  {
    id: 'lead-4',
    firstName: 'Robert',
    lastName: 'Miller',
    company: 'Miller Properties',
    email: 'rob@millerproperties.com.au',
    phone: '+61 433 777 888',
    address: '22 Toorak Road, Toorak VIC 3142',
    preferredContact: 'Phone',
    projectName: 'Toorak Luxury Apartment',
    projectType: 'Residential',
    estimatedBudget: 220000,
    expectedStartDate: 'Jun 2025',
    leadSource: 'Website',
    assignedDesigner: 'Ellie S.',
    status: 'New Enquiry',
    nextFollowUp: 'Dec 23, 2024',
    createdAt: 'Dec 14, 2024',
    pinned: false,
    notes: [],
    timeline: [
      { id: 't9', date: 'Dec 14, 2024', type: 'created', title: 'Lead Created', description: 'Form submitted via website contact page' },
    ],
    tasks: [
      { id: 'tk7', title: 'Call Robert to discuss project', completed: false, dueDate: 'Dec 23, 2024' },
    ],
  },
  {
    id: 'lead-5',
    firstName: 'Jennifer',
    lastName: 'Adams',
    company: 'Adams & Co',
    email: 'jennifer.adams@adamsco.com',
    phone: '+61 455 999 000',
    address: '8 Paddington Lane, Paddington NSW 2021',
    preferredContact: 'Email',
    projectName: 'Paddington Terrace Home Office',
    projectType: 'Commercial',
    estimatedBudget: 75000,
    expectedStartDate: 'Jan 2025',
    leadSource: 'Instagram',
    assignedDesigner: 'Ellie S.',
    status: 'Discovery Call',
    nextFollowUp: 'Dec 30, 2024',
    createdAt: 'Dec 5, 2024',
    pinned: false,
    notes: [
      { id: 'n5', content: 'Boutique law firm wanting a sophisticated home office conversion. Looking for a calm, professional aesthetic.', author: 'Ellie S.', createdAt: 'Dec 5, 2024' },
    ],
    timeline: [
      { id: 't10', date: 'Dec 5, 2024', type: 'created', title: 'Lead Created', description: 'DM on Instagram' },
      { id: 't11', date: 'Dec 12, 2024', type: 'meeting', title: 'Discovery Call', description: '45-minute call with Jennifer' },
    ],
    tasks: [
      { id: 'tk8', title: 'Send space planning options', completed: false, dueDate: 'Dec 30, 2024' },
    ],
  },
  {
    id: 'lead-6',
    firstName: 'Thomas',
    lastName: 'Green',
    company: 'Greenfield Developments',
    email: 'thomas@greenfielddev.com.au',
    phone: '+61 416 222 333',
    address: '45 James Street, Fortitude Valley QLD 4006',
    preferredContact: 'Phone',
    projectName: 'Fortitude Valley Garden Villa',
    projectType: 'Residential',
    estimatedBudget: 140000,
    expectedStartDate: 'May 2025',
    leadSource: 'Builder',
    assignedDesigner: 'Ellie S.',
    status: 'Won',
    nextFollowUp: '-',
    createdAt: 'Nov 10, 2024',
    pinned: false,
    notes: [
      { id: 'n6', content: 'Thomas signed the design agreement on Dec 1. Project starts May 2025. Builder referral from Pacific Constructions.', author: 'Ellie S.', createdAt: 'Dec 1, 2024' },
    ],
    timeline: [
      { id: 't12', date: 'Nov 10, 2024', type: 'created', title: 'Lead Created', description: 'Referred by Pacific Constructions' },
      { id: 't13', date: 'Nov 18, 2024', type: 'meeting', title: 'Site Visit', description: 'Met Thomas at the property' },
      { id: 't14', date: 'Dec 1, 2024', type: 'status', title: 'Lead Won', description: 'Design agreement signed' },
    ],
    tasks: [
      { id: 'tk9', title: 'Convert to client', completed: false },
      { id: 'tk10', title: 'Set up project in system', completed: false },
    ],
  },
];

// ─── Mock Clients ─────────────────────────────────────────────────────────────

export const mockClients: Client[] = [
  {
    id: 'client-1',
    company: 'Mitchell Residence',
    primaryContact: 'James Mitchell',
    email: 'james.mitchell@email.com',
    phone: '+61 412 100 200',
    address: '24 Balmoral Avenue, Mosman NSW 2088',
    website: '',
    assignedDesigner: 'Ellie S.',
    status: 'VIP',
    clientSince: 'Jan 2024',
    lastContact: 'Dec 18, 2024',
    projectType: 'Residential',
    pinned: false,
    contacts: [
      { id: 'cc1', name: 'James Mitchell', position: 'Primary Contact', email: 'james.mitchell@email.com', phone: '+61 412 100 200', isPrimary: true },
      { id: 'cc2', name: 'Sarah Mitchell', position: 'Secondary Contact', email: 'sarah.mitchell@email.com', phone: '+61 413 100 200', isPrimary: false },
    ],
    projects: [
      { id: 'p1', name: 'Hampton Residence', phase: 'Design Development', status: 'Active', budget: 320000 },
      { id: 'p2', name: 'Beach House Refresh', phase: 'Completed', status: 'Completed', budget: 85000 },
    ],
    notes: [
      { id: 'cn1', content: 'James and Sarah are fantastic clients. Always responsive and make quick decisions. Prefer email for non-urgent updates and phone for urgent matters.', author: 'Ellie S.', createdAt: 'Jan 15, 2024' },
      { id: 'cn2', content: 'Discussed possible extension to master bedroom in 2025. Keep in mind for next project conversation.', author: 'Ellie S.', createdAt: 'Dec 10, 2024' },
    ],
    timeline: [
      { id: 'ct1', date: 'Jan 2024', type: 'created', title: 'Client Since', description: 'Design agreement signed for Hampton Residence' },
      { id: 'ct2', date: 'Mar 2024', type: 'meeting', title: 'Concept Presentation', description: 'Presented concept designs for master suite' },
      { id: 'ct3', date: 'Aug 2024', type: 'invoice', title: 'Invoice Sent', description: 'INV-0012 — $48,000 milestone payment' },
      { id: 'ct4', date: 'Dec 18, 2024', type: 'call', title: 'Progress Call', description: 'Discussed kitchen selections and timeline' },
    ],
  },
  {
    id: 'client-2',
    company: 'Chen Living',
    primaryContact: 'Michael Chen',
    email: 'michael.chen@chenliving.com',
    phone: '+61 411 500 600',
    address: '14/22 Clarence Street, Sydney NSW 2000',
    website: 'chenliving.com',
    assignedDesigner: 'Ellie S.',
    status: 'Active',
    clientSince: 'Mar 2024',
    lastContact: 'Dec 12, 2024',
    projectType: 'Residential',
    pinned: false,
    contacts: [
      { id: 'cc3', name: 'Michael Chen', position: 'Director', email: 'michael.chen@chenliving.com', phone: '+61 411 500 600', isPrimary: true },
    ],
    projects: [
      { id: 'p3', name: 'Urban Loft Project', phase: 'Concept Design', status: 'Active', budget: 180000 },
    ],
    notes: [
      { id: 'cn3', content: 'Michael is very decisive. Prefers minimalist Japanese-inspired aesthetic. Loves Japandi style furniture.', author: 'Ellie S.', createdAt: 'Mar 20, 2024' },
    ],
    timeline: [
      { id: 'ct5', date: 'Mar 2024', type: 'created', title: 'Client Since', description: 'Design agreement signed' },
      { id: 'ct6', date: 'Jun 2024', type: 'meeting', title: 'Design Workshop', description: 'Full-day concept workshop at the loft' },
      { id: 'ct7', date: 'Dec 12, 2024', type: 'email', title: 'Concept Deck Sent', description: 'Emailed updated concept presentation' },
    ],
  },
  {
    id: 'client-3',
    company: 'Thompson Interiors',
    primaryContact: 'Alexandra Thompson',
    email: 'alex@thompsoninteriors.com.au',
    phone: '+61 422 700 800',
    address: '3 Oceanview Terrace, Bondi NSW 2026',
    website: 'thompsoninteriors.com.au',
    assignedDesigner: 'Ellie S.',
    status: 'Active',
    clientSince: 'Jun 2024',
    lastContact: 'Dec 20, 2024',
    projectType: 'Residential',
    pinned: false,
    contacts: [
      { id: 'cc4', name: 'Alexandra Thompson', position: 'Owner', email: 'alex@thompsoninteriors.com.au', phone: '+61 422 700 800', isPrimary: true },
      { id: 'cc5', name: 'Mark Thompson', position: 'Co-Owner', email: 'mark@thompsoninteriors.com.au', phone: '+61 423 700 800', isPrimary: false },
    ],
    projects: [
      { id: 'p4', name: 'Coastal Villa Renovation', phase: 'Construction Documentation', status: 'Active', budget: 480000 },
    ],
    notes: [
      { id: 'cn4', content: 'Alex is a former architect, so she has strong opinions on space planning. Always read the drawings carefully before presenting.', author: 'Ellie S.', createdAt: 'Jun 5, 2024' },
    ],
    timeline: [
      { id: 'ct8', date: 'Jun 2024', type: 'created', title: 'Client Since', description: 'Agreement signed for Coastal Villa' },
      { id: 'ct9', date: 'Sep 2024', type: 'invoice', title: 'Invoice Sent', description: 'INV-0018 — $72,000 design phase' },
      { id: 'ct10', date: 'Dec 20, 2024', type: 'meeting', title: 'Contractor Meeting', description: 'Attended contractor meeting on site' },
    ],
  },
  {
    id: 'client-4',
    company: 'TechCorp Inc.',
    primaryContact: 'Ryan Park',
    email: 'ryan.park@techcorp.io',
    phone: '+61 433 900 111',
    address: '78 Miller Street, North Sydney NSW 2060',
    website: 'techcorp.io',
    assignedDesigner: 'Ellie S.',
    status: 'Active',
    clientSince: 'Sep 2024',
    lastContact: 'Dec 15, 2024',
    projectType: 'Commercial',
    pinned: false,
    contacts: [
      { id: 'cc6', name: 'Ryan Park', position: 'Head of Operations', email: 'ryan.park@techcorp.io', phone: '+61 433 900 111', isPrimary: true },
      { id: 'cc7', name: 'Lisa Wong', position: 'Office Manager', email: 'lisa.wong@techcorp.io', phone: '+61 434 900 111', isPrimary: false },
    ],
    projects: [
      { id: 'p5', name: 'Modern Office Space', phase: 'Schematic Design', status: 'Active', budget: 290000 },
    ],
    notes: [
      { id: 'cn5', content: 'Fast-paced tech company. Decision-making is quick. Ryan is the main contact but check with Lisa for scheduling.', author: 'Ellie S.', createdAt: 'Sep 10, 2024' },
    ],
    timeline: [
      { id: 'ct11', date: 'Sep 2024', type: 'created', title: 'Client Since', description: 'Agreement signed for office project' },
      { id: 'ct12', date: 'Nov 2024', type: 'meeting', title: 'Schematic Design Review', description: 'Presented floor plan options to the team' },
    ],
  },
  {
    id: 'client-5',
    company: 'Lee Family',
    primaryContact: 'Victoria Lee',
    email: 'victoria.lee@email.com',
    phone: '+61 445 222 333',
    address: '55 Notting Hill Boulevard, Double Bay NSW 2028',
    website: '',
    assignedDesigner: 'Ellie S.',
    status: 'Active',
    clientSince: 'Oct 2024',
    lastContact: 'Dec 8, 2024',
    projectType: 'Residential',
    pinned: false,
    contacts: [
      { id: 'cc8', name: 'Victoria Lee', position: 'Primary Contact', email: 'victoria.lee@email.com', phone: '+61 445 222 333', isPrimary: true },
    ],
    projects: [
      { id: 'p6', name: 'Penthouse Suite', phase: 'Discovery', status: 'Planned', budget: 620000 },
    ],
    notes: [],
    timeline: [
      { id: 'ct13', date: 'Oct 2024', type: 'created', title: 'Client Since', description: 'Converted from lead — Won via Instagram referral' },
    ],
  },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

export const DESIGNERS = ['Ellie S.', 'Anna K.', 'James P.'];

export const PROJECT_TYPES: ProjectType[] = ['Residential', 'Commercial', 'Hospitality', 'Retail', 'Multi Residential'];

export const LEAD_SOURCES: LeadSource[] = ['Website', 'Instagram', 'Referral', 'Returning Client', 'Builder', 'Architect', 'Other'];

export const LEAD_STATUSES: LeadStatus[] = ['New Enquiry', 'Discovery Call', 'Proposal Sent', 'Won', 'Lost'];

export const CLIENT_STATUSES: ClientStatus[] = ['Active', 'Inactive', 'VIP'];

export function formatBudget(amount: number): string {
  return `$${amount.toLocaleString()}`;
}

export const leadStatusConfig: Record<LeadStatus, { color: string; dot: string }> = {
  'New Enquiry':    { color: 'bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400',   dot: 'bg-blue-500' },
  'Discovery Call': { color: 'bg-amber-50 text-amber-700 dark:bg-amber-900/20 dark:text-amber-400', dot: 'bg-amber-500' },
  'Proposal Sent':  { color: 'bg-purple-50 text-purple-700 dark:bg-purple-900/20 dark:text-purple-400', dot: 'bg-purple-500' },
  'Won':            { color: 'bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400', dot: 'bg-green-500' },
  'Lost':           { color: 'bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-400', dot: 'bg-red-400' },
};

export const clientStatusConfig: Record<ClientStatus, { color: string }> = {
  'Active': { color: 'bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400' },
  'Inactive': { color: 'bg-muted text-muted-foreground' },
  'VIP': { color: 'bg-amber-50 text-amber-700 dark:bg-amber-900/20 dark:text-amber-400' },
};

export const timelineIconConfig: Record<TimelineEvent['type'], { icon: string; color: string }> = {
  created:  { icon: 'add_circle',      color: 'text-blue-500' },
  call:     { icon: 'phone',           color: 'text-green-500' },
  meeting:  { icon: 'groups',          color: 'text-purple-500' },
  email:    { icon: 'email',           color: 'text-amber-500' },
  status:   { icon: 'flag',            color: 'text-green-600' },
  note:     { icon: 'sticky_note_2',   color: 'text-gray-500' },
  task:     { icon: 'task_alt',        color: 'text-blue-400' },
  invoice:  { icon: 'receipt',         color: 'text-orange-500' },
};
