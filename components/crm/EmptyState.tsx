import { DynamicIcon } from '@/lib/icons';

interface EmptyStateProps {
  icon: string;
  title?: string;
  description: string;
  action?: {
    label: string;
    onClick: () => void;
  };
}

export function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="w-14 h-14 rounded-2xl bg-muted flex items-center justify-center mb-4">
        <DynamicIcon name={icon} size={28} className="text-muted-foreground" />
      </div>
      {title && <h3 className="font-medium text-base mb-1">{title}</h3>}
      <p className="text-sm text-muted-foreground max-w-xs">{description}</p>
      {action && (
        <button
          onClick={action.onClick}
          className="notion-button bg-foreground text-background hover:bg-foreground/90 mt-4"
        >
          {action.label}
        </button>
      )}
    </div>
  );
}
