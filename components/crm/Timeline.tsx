import { TimelineEvent, timelineIconConfig } from '@/lib/crm-data';
import { DynamicIcon } from '@/lib/icons';

interface TimelineProps {
  events: TimelineEvent[];
}

export function Timeline({ events }: TimelineProps) {
  if (events.length === 0) {
    return <p className="text-sm text-muted-foreground py-4 text-center">No activity yet.</p>;
  }

  return (
    <div className="space-y-0">
      {events.map((event, idx) => {
        const cfg = timelineIconConfig[event.type];
        const isLast = idx === events.length - 1;
        return (
          <div key={event.id} className="flex gap-3">
            {/* Icon + line */}
            <div className="flex flex-col items-center">
              <div className={`w-8 h-8 rounded-full bg-muted flex items-center justify-center flex-shrink-0 ${cfg.color}`}>
                <DynamicIcon name={cfg.icon} size={15} />
              </div>
              {!isLast && <div className="w-px flex-1 bg-border mt-1 mb-1" />}
            </div>
            {/* Content */}
            <div className={`pb-4 ${isLast ? '' : ''}`}>
              <div className="flex items-baseline gap-2">
                <p className="text-sm font-medium">{event.title}</p>
                <span className="text-xs text-muted-foreground">{event.date}</span>
              </div>
              {event.description && (
                <p className="text-xs text-muted-foreground mt-0.5">{event.description}</p>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
