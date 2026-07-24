'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { formatBudget } from '@/lib/crm-data';
import { useCrm } from '@/lib/crm-context';
import { useActivity } from '@/lib/activity-context';
import { LeadStatusBadge } from '@/components/crm/StatusBadge';
import { Timeline } from '@/components/crm/Timeline';
import { NotesPanel } from '@/components/crm/NotesPanel';
import { TaskList } from '@/components/crm/TaskList';
import { DetailSection, DetailField } from '@/components/crm/DetailSection';
import { DeleteLeadDialog } from '@/components/crm/DeleteLeadDialog';
import { Search, Calendar, Mail, Phone, MapPin, MessageSquare } from 'lucide-react';

interface Props {
  params: { id: string };
}

export default function LeadDetailPage({ params }: Props) {
  const { id } = params;
  const router = useRouter();
  const { leads, deleteLead } = useCrm();
  const { addActivity } = useActivity();
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const lead = leads.find((l) => l.id === id);

  const handleDelete = () => {
    deleteLead(id);
    setShowDeleteDialog(false);
    addActivity({ title: 'Lead Deleted', description: `${lead?.firstName} ${lead?.lastName} has been removed`, icon: 'delete', source: 'Contacts' });
    router.push('/crm/leads');
  };

  if (!lead) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <Search size={48} className="text-muted-foreground mb-3" />
        <h2 className="font-medium text-lg mb-1">Lead not found</h2>
        <Link href="/crm/leads" className="notion-button text-muted-foreground mt-2">
          Back to Leads
        </Link>
      </div>
    );
  }

  return (
    <>
    {showDeleteDialog && (
      <DeleteLeadDialog
        leadName={`${lead.firstName} ${lead.lastName}`}
        onConfirm={handleDelete}
        onCancel={() => setShowDeleteDialog(false)}
      />
    )}
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">{lead.firstName} {lead.lastName}</h1>
          <p className="text-muted-foreground text-sm mt-0.5">{lead.company} · {lead.projectName}</p>
        </div>

        <div className="flex items-center gap-2 flex-shrink-0">
          <button className="notion-button border border-border text-sm">
            Duplicate
          </button>
          <button className="notion-button border border-border text-sm">
            Archive
          </button>
          <button className="notion-button border border-border text-sm">
            Edit
          </button>
          <button onClick={() => setShowDeleteDialog(true)} className="notion-button border border-border text-sm hover:text-red-600">
            Delete
          </button>
          <button className="notion-button bg-green-600 text-white hover:bg-green-700 text-sm">
            Convert to Client
          </button>
        </div>
      </div>

      {/* Status bar */}
      <div className="flex items-center gap-3">
        <LeadStatusBadge status={lead.status} withDot />
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <span className="flex items-center gap-1.5">
            <Calendar size={14} />
            Created {lead.createdAt}
          </span>
          <span className="flex items-center gap-1.5">
            <Calendar size={14} />
            Follow-up {lead.nextFollowUp}
          </span>
        </div>
      </div>

      {/* Content grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Left column */}
        <div className="lg:col-span-1 space-y-4">
          <DetailSection>
            <div className="grid grid-cols-1 gap-3">
              <DetailField label="Status" value={<LeadStatusBadge status={lead.status} />} />
              <DetailField label="Budget" value={formatBudget(lead.estimatedBudget)} />
              <DetailField label="Project Type" value={lead.projectType} />
              <DetailField label="Expected Start" value={lead.expectedStartDate} />
              <DetailField label="Lead Source" value={lead.leadSource} />
              <DetailField label="Assigned Designer" value={lead.assignedDesigner} />
            </div>
          </DetailSection>

          <DetailSection>
            <div className="space-y-3">
              <a href={`mailto:${lead.email}`} className="flex items-center gap-2 text-sm hover:underline">
                <Mail size={16} className="text-muted-foreground" />
                <span>{lead.email}</span>
              </a>
              <a href={`tel:${lead.phone}`} className="flex items-center gap-2 text-sm hover:underline">
                <Phone size={16} className="text-muted-foreground" />
                <span>{lead.phone}</span>
              </a>
              <div className="flex items-start gap-2 text-sm">
                <MapPin size={16} className="text-muted-foreground flex-shrink-0 mt-0.5" />
                <span className="text-muted-foreground">{lead.address}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <MessageSquare size={16} className="text-muted-foreground" />
                <span className="text-muted-foreground">Preferred: {lead.preferredContact}</span>
              </div>
            </div>
          </DetailSection>
        </div>

        {/* Right columns */}
        <div className="lg:col-span-2 space-y-4">
          <DetailSection action={{ label: '+ Task', onClick: () => {} }}>
            <TaskList tasks={lead.tasks} />
          </DetailSection>

          <DetailSection>
            <NotesPanel notes={lead.notes} />
          </DetailSection>

          <DetailSection>
            <Timeline events={[...lead.timeline].reverse()} />
          </DetailSection>
        </div>
      </div>
    </div>
    </>
  );
}
