import { leadStatusConfig, clientStatusConfig, LeadStatus, ClientStatus } from '@/lib/crm-data';

interface LeadStatusBadgeProps {
  status: LeadStatus;
  withDot?: boolean;
}

export function LeadStatusBadge({ status, withDot }: LeadStatusBadgeProps) {
  const cfg = leadStatusConfig[status];
  return (
    <span className={`inline-flex items-center gap-1.5 text-xs px-2.5 py-0.5 rounded-full font-medium ${cfg.color}`}>
      {withDot && <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />}
      {status}
    </span>
  );
}

interface ClientStatusBadgeProps {
  status: ClientStatus;
}

export function ClientStatusBadge({ status }: ClientStatusBadgeProps) {
  const cfg = clientStatusConfig[status];
  return (
    <span className={`inline-flex items-center text-xs px-2.5 py-0.5 rounded-full font-medium ${cfg.color}`}>
      {status}
    </span>
  );
}
