'use client';

import { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import { Project } from '@/lib/projects-data';
import { Client } from '@/lib/crm-data';
import { useCrm } from '@/lib/crm-context';
import { useProjects } from '@/lib/projects-context';
import { useSettings } from '@/lib/settings-context';
import { useActivity } from '@/lib/activity-context';
import { NewProjectModal, NewProjectData } from '@/components/projects/NewProjectModal';
import { SidePanel } from '@/components/ui/SidePanel';
import { ProjectStatusBadge } from '@/components/projects/ProjectStatusBadge';
import { DynamicIcon } from '@/lib/icons';
import { ChevronRight, FolderOpen, History } from 'lucide-react';

function getGreeting(): string {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 18) return 'Good afternoon';
  return 'Good evening';
}

function parseDate(dateStr: string): Date {
  const d = new Date(dateStr);
  if (!isNaN(d.getTime())) return d;
  const parsed = new Date(dateStr.replace(/(\d+)(st|nd|rd|th)/, '$1'));
  if (!isNaN(parsed.getTime())) return parsed;
  return new Date(dateStr + ' 2024');
}

function timeAgo(ts: number): string {
  const diff = Date.now() - ts;
  const mins = Math.floor(diff / 60_000);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return `${days}d ago`;
}

export default function DashboardPage() {
  const { projects, addProject } = useProjects();
  const { clients, addClient } = useCrm();
  const { settings } = useSettings();
  const { activities, addActivity } = useActivity();
  const [showNewProject, setShowNewProject] = useState(false);
  const [showAddClient, setShowAddClient] = useState(false);
  const [showAddProduct, setShowAddProduct] = useState(false);
  const [showAddSupplier, setShowAddSupplier] = useState(false);
  const [showAllActivity, setShowAllActivity] = useState(false);
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  const [newClient, setNewClient] = useState({ name: '', company: '', email: '', phone: '' });
  const [newProduct, setNewProduct] = useState({ name: '', category: 'Furniture', vendor: '', price: '' });
  const [newSupplier, setNewSupplier] = useState({ name: '', category: 'Furniture', contact: '', email: '', phone: '' });

  // Recent projects (continue where you left off) — sorted by updatedAt desc
  const recentProjects = useMemo(() =>
    projects
      .filter(p => p.status !== 'Archived')
      .slice()
      .sort((a, b) => parseDate(b.updatedAt).getTime() - parseDate(a.updatedAt).getTime())
      .slice(0, 4)
      .map(p => ({ ...p, client: clients.find(c => c.id === p.clientId) })),
    [projects, clients]
  );

  // Recent activity — last 5 days from ActivityContext
  const now = new Date();
  const fiveDaysAgo = new Date(now); fiveDaysAgo.setDate(now.getDate() - 5);
  const fiveDaysAgoTs = fiveDaysAgo.getTime();

  const recentActivity = useMemo(() =>
    activities.filter(a => a.timestamp >= fiveDaysAgoTs),
    [activities, fiveDaysAgoTs]
  );

  const last30DaysActivity = useMemo(() => {
    const thirtyDaysAgo = new Date(now); thirtyDaysAgo.setDate(now.getDate() - 30);
    return activities.filter(a => a.timestamp >= thirtyDaysAgo.getTime());
  }, [activities, now]);

  const handleNewProject = (data: NewProjectData) => {
    const newProject: Project = {
      id: `proj-${Date.now()}`,
      name: data.name,
      clientId: data.clientId,
      address: data.address,
      projectType: data.projectType,
      description: data.description,
      currentPhase: data.currentPhase,
      phaseProgress: 0,
      status: data.status,
      estimatedBudget: parseInt(data.estimatedBudget.replace(/[^0-9]/g, '')) || 0,
      startDate: data.startDate,
      targetCompletion: data.targetCompletion,
      projectManager: data.projectManager,
      builder: data.builder || null,
      architect: data.architect || null,
      consultants: [],
      designTeam: [],
      siteNotes: data.siteNotes || null,
      pinned: false,
      coverIndex: 0,
      createdAt: new Date().toLocaleDateString('en-AU', { day: 'numeric', month: 'short', year: 'numeric' }),
      updatedAt: new Date().toLocaleDateString('en-AU', { day: 'numeric', month: 'short', year: 'numeric' }),
      progress: 0,
      team: { projectManager: data.projectManager || 'Ellie S.', leadDesigner: null, supportDesigner: null },
      notes: [],
      timeline: [],
      tasks: [],
    };
    addProject(newProject);
    addActivity({
      title: 'Project Created',
      description: `New project "${data.name}" created`,
      icon: 'create_new_folder',
      source: data.name,
    });
    setShowNewProject(false);
  };

  const handleAddClient = () => {
    if (!newClient.name) return;
    const created: Client = {
      id: `c-${Date.now()}`,
      primaryContact: newClient.name,
      company: newClient.company,
      email: newClient.email,
      phone: newClient.phone,
      address: '',
      projectType: 'Residential',
      status: 'Active',
      assignedDesigner: '',
      lastContact: new Date().toLocaleDateString('en-AU', { day: 'numeric', month: 'short', year: 'numeric' }),
      pinned: false,
      projects: [],
      contacts: [],
      notes: [],
      timeline: [],
      website: '',
      clientSince: new Date().toLocaleDateString('en-AU', { month: 'short', year: 'numeric' }),
    };
    addClient(created);
    addActivity({
      title: 'Client Added',
      description: `${newClient.name} added as a new client`,
      icon: 'person_add',
      source: 'Contacts',
    });
    setNewClient({ name: '', company: '', email: '', phone: '' });
    setShowAddClient(false);
  };

  const handleAddProduct = () => {
    if (!newProduct.name) return;
    addActivity({
      title: 'Product Added',
      description: `"${newProduct.name}" added to the product library`,
      icon: 'bookmark_add',
      source: 'Products Library',
    });
    setNewProduct({ name: '', category: 'Furniture', vendor: '', price: '' });
    setShowAddProduct(false);
  };

  const handleAddSupplier = () => {
    if (!newSupplier.name) return;
    addActivity({
      title: 'Supplier Added',
      description: `"${newSupplier.name}" added as a new supplier`,
      icon: 'local_shipping',
      source: 'Contacts',
    });
    setNewSupplier({ name: '', category: 'Furniture', contact: '', email: '', phone: '' });
    setShowAddSupplier(false);
  };

  const quickActions = [
    { icon: 'create_new_folder', heading: 'Create Project', description: 'Start a new project from scratch.', onClick: () => setShowNewProject(true) },
    { icon: 'bookmark_add', heading: 'Add Product', description: 'Add a new product to the library.', onClick: () => setShowAddProduct(true) },
    { icon: 'person_add', heading: 'Add Client', description: 'Add a new client.', onClick: () => setShowAddClient(true) },
    { icon: 'library_add', heading: 'Add Supplier', description: 'Add a new supplier.', onClick: () => setShowAddSupplier(true) },
  ];

  return (
    <>
      {showNewProject && <NewProjectModal onClose={() => setShowNewProject(false)} onSave={handleNewProject} />}

      {showAddClient && (
        <SidePanel title="Add Client" subtitle="Create a new client contact" onClose={() => setShowAddClient(false)} footer={
          <><div /><div className="flex gap-2">
            <button onClick={() => setShowAddClient(false)} className="notion-button border border-border">Cancel</button>
            <button onClick={handleAddClient} className="btn-primary">Add Client</button>
          </div></>
        }>
          <div className="px-6 py-5 space-y-4">
            <div>
              <label className="block text-xs text-muted-foreground mb-1.5">Full Name *</label>
              <input value={newClient.name} onChange={e => setNewClient(p => ({ ...p, name: e.target.value }))} placeholder="Sophie Williams" className="modal-input" />
            </div>
            <div>
              <label className="block text-xs text-muted-foreground mb-1.5">Company</label>
              <input value={newClient.company} onChange={e => setNewClient(p => ({ ...p, company: e.target.value }))} placeholder="Williams Family" className="modal-input" />
            </div>
            <div>
              <label className="block text-xs text-muted-foreground mb-1.5">Email</label>
              <input type="email" value={newClient.email} onChange={e => setNewClient(p => ({ ...p, email: e.target.value }))} placeholder="sophie@email.com" className="modal-input" />
            </div>
            <div>
              <label className="block text-xs text-muted-foreground mb-1.5">Phone</label>
              <input value={newClient.phone} onChange={e => setNewClient(p => ({ ...p, phone: e.target.value }))} placeholder="+61 400 000 000" className="modal-input" />
            </div>
          </div>
        </SidePanel>
      )}

      {showAddProduct && (
        <SidePanel title="Add Product" subtitle="Add a new product to the library" onClose={() => setShowAddProduct(false)} footer={
          <><div /><div className="flex gap-2">
            <button onClick={() => setShowAddProduct(false)} className="notion-button border border-border">Cancel</button>
            <button onClick={handleAddProduct} className="btn-primary">Add Product</button>
          </div></>
        }>
          <div className="px-6 py-5 space-y-4">
            <div>
              <label className="block text-xs text-muted-foreground mb-1.5">Product Name *</label>
              <input value={newProduct.name} onChange={e => setNewProduct(p => ({ ...p, name: e.target.value }))} placeholder="Velvet Lounge Chair" className="modal-input" />
            </div>
            <div>
              <label className="block text-xs text-muted-foreground mb-1.5">Category</label>
              <select value={newProduct.category} onChange={e => setNewProduct(p => ({ ...p, category: e.target.value }))} className="modal-input">
                {['Furniture', 'Lighting', 'Finishes', 'Textiles', 'Decor', 'Hardware', 'Appliances'].map(c => <option key={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs text-muted-foreground mb-1.5">Vendor</label>
              <input value={newProduct.vendor} onChange={e => setNewProduct(p => ({ ...p, vendor: e.target.value }))} placeholder="Artisan Furniture Co." className="modal-input" />
            </div>
            <div>
              <label className="block text-xs text-muted-foreground mb-1.5">Price (A$)</label>
              <input type="number" value={newProduct.price} onChange={e => setNewProduct(p => ({ ...p, price: e.target.value }))} placeholder="1850" className="modal-input" />
            </div>
          </div>
        </SidePanel>
      )}

      {showAddSupplier && (
        <SidePanel title="Add Supplier" subtitle="Add a new supplier to your network" onClose={() => setShowAddSupplier(false)} footer={
          <><div /><div className="flex gap-2">
            <button onClick={() => setShowAddSupplier(false)} className="notion-button border border-border">Cancel</button>
            <button onClick={handleAddSupplier} className="btn-primary">Add Supplier</button>
          </div></>
        }>
          <div className="px-6 py-5 space-y-4">
            <div>
              <label className="block text-xs text-muted-foreground mb-1.5">Company Name *</label>
              <input value={newSupplier.name} onChange={e => setNewSupplier(p => ({ ...p, name: e.target.value }))} placeholder="Luxury Lighting Co." className="modal-input" />
            </div>
            <div>
              <label className="block text-xs text-muted-foreground mb-1.5">Category</label>
              <select value={newSupplier.category} onChange={e => setNewSupplier(p => ({ ...p, category: e.target.value }))} className="modal-input">
                {['Furniture', 'Lighting', 'Finishes', 'Textiles', 'Plumbing', 'Appliances', 'Decor', 'Artwork', 'Materials', 'Hardware'].map(c => <option key={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs text-muted-foreground mb-1.5">Contact Person</label>
              <input value={newSupplier.contact} onChange={e => setNewSupplier(p => ({ ...p, contact: e.target.value }))} placeholder="Sarah Johnson" className="modal-input" />
            </div>
            <div>
              <label className="block text-xs text-muted-foreground mb-1.5">Email</label>
              <input type="email" value={newSupplier.email} onChange={e => setNewSupplier(p => ({ ...p, email: e.target.value }))} placeholder="sarah@luxurylighting.com" className="modal-input" />
            </div>
            <div>
              <label className="block text-xs text-muted-foreground mb-1.5">Phone</label>
              <input value={newSupplier.phone} onChange={e => setNewSupplier(p => ({ ...p, phone: e.target.value }))} placeholder="+61 2 1000 1000" className="modal-input" />
            </div>
          </div>
        </SidePanel>
      )}

      {showAllActivity && (
        <SidePanel subtitle="Last 30 days" onClose={() => setShowAllActivity(false)}>
          <div className="px-6 py-5">
            {last30DaysActivity.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">No activity in the last 30 days</p>
            ) : (
              <div className="space-y-0">
                {last30DaysActivity.map((item, i) => (
                  <div key={item.id} className={`flex items-start gap-3 py-3 ${i < last30DaysActivity.length - 1 ? 'border-b border-border/40' : ''}`}>
                    <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center flex-shrink-0">
                      <DynamicIcon name={item.icon} size={16} className="text-muted-foreground" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium leading-tight">{item.title}</p>
                      <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">{item.description}</p>
                      <p className="text-xs text-muted-foreground/60 mt-1">{item.source} · {mounted ? timeAgo(item.timestamp) : ''}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </SidePanel>
      )}

      <div className="space-y-8">
        {/* Greeting */}
        <div>
          <h1 className="text-2xl font-semibold">{mounted ? getGreeting() : 'Hello'}, {settings.firstName}</h1>
        </div>

        {/* Quick Actions — 2x2 grid */}
        <section>
          <h2 className="font-semibold mb-3">Quick Actions</h2>
          <div className="grid grid-cols-2 gap-3">
            {quickActions.map((action, i) => (
              <button key={i} onClick={action.onClick}
                className="card-base card-hover p-4 flex items-start gap-3 text-left w-full">
                {/* Icon in rounded square */}
                <div className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center flex-shrink-0">
                  <DynamicIcon name={action.icon} size={20} className="text-foreground" />
                </div>
                {/* Heading + description */}
                <div className="flex-1 min-w-0 pt-0.5">
                  <p className="text-sm font-medium">{action.heading}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{action.description}</p>
                </div>
                <ChevronRight size={18} className="text-muted-foreground/40 flex-shrink-0" />
              </button>
            ))}
          </div>
        </section>

        {/* Continue Where You Left Off */}
        <section>
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-semibold">Continue Where You Left Off</h2>
            <Link href="/projects" className="text-xs text-muted-foreground hover:text-foreground transition-colors">
              View All Projects
            </Link>
          </div>
          {recentProjects.length === 0 ? (
            <div className="card-base p-8 text-center">
              <span className="text-muted-foreground/40 block mb-2"><FolderOpen size={32} /></span>
              <p className="text-sm text-muted-foreground">No recent projects</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {recentProjects.map(project => (
                <div key={project.id} className="project-card p-4">
                  <Link href={`/projects/${project.id}`} className="block">
                    <div className="flex items-start justify-between gap-2 mb-3">
                      <div className="min-w-0 flex-1">
                        <p className="font-medium text-sm truncate">{project.name}</p>
                        <p className="text-xs text-muted-foreground truncate">{project.client?.primaryContact || 'Unknown'}</p>
                      </div>
                      <ProjectStatusBadge status={project.status} />
                    </div>
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-muted-foreground">Phase</span>
                        <span className="text-foreground">{project.currentPhase}</span>
                      </div>
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-muted-foreground">Updated</span>
                        <span className="text-foreground">{project.updatedAt}</span>
                      </div>
                    </div>
                    <div className="mt-3">
                      <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden">
                        <div className="h-full rounded-full transition-all" style={{ width: `${project.progress}%`, background: 'rgba(51,51,51,0.35)' }} />
                      </div>
                      <span className="text-xs text-muted-foreground mt-1 block">{project.progress}% complete</span>
                    </div>
                  </Link>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Recent Activity — Last 5 days */}
        <section>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-baseline gap-2">
              <h2 className="font-semibold">Recent Activity</h2>
              <span className="text-xs text-muted-foreground">Last 5 days</span>
            </div>
            <button onClick={() => setShowAllActivity(true)} className="text-xs text-muted-foreground hover:text-foreground transition-colors">
              View All
            </button>
          </div>
          <div className="card-base overflow-hidden">
            {recentActivity.length === 0 ? (
              <div className="text-center py-8">
                <span className="text-muted-foreground/40 block mb-2"><History size={32} /></span>
                <p className="text-sm text-muted-foreground">No activity in the last 5 days</p>
              </div>
            ) : (
              recentActivity.map((item, i) => (
                <div key={item.id} className={`flex items-start gap-3 px-5 py-3.5 hover:bg-muted/20 transition-colors ${i < recentActivity.length - 1 ? 'border-b border-border/40' : ''}`}>
                  <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center flex-shrink-0">
                    <DynamicIcon name={item.icon} size={16} className="text-muted-foreground" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium leading-tight">{item.title}</p>
                    <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">{item.description}</p>
                    <p className="text-xs text-muted-foreground/60 mt-1">{item.source} · {mounted ? timeAgo(item.timestamp) : ''}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </section>
      </div>
    </>
  );
}
