import { ReactNode } from 'react';

interface DetailSectionProps {
  title?: string;
  children: ReactNode;
  action?: {
    label: string;
    icon?: string;
    onClick: () => void;
  };
  editAction?: () => void;
}

export function DetailSection({ title, children, action, editAction }: DetailSectionProps) {
  const hasHeader = title || action || editAction;
  return (
    <div className="bg-card border border-border rounded-xl p-5 card-base group relative">
      {hasHeader && (
        <div className={`flex items-center justify-between ${title ? 'mb-4' : 'mb-0'}`}>
          {title && <h3 className="font-medium text-sm">{title}</h3>}
          <div className="flex items-center gap-2">
            {editAction && (
              <button
                onClick={editAction}
                className="opacity-0 group-hover:opacity-100 flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-all"
              >
                Edit
              </button>
            )}
            {action && (
              <button
                onClick={action.onClick}
                className="notion-button text-muted-foreground text-xs"
              >
                {action.label}
              </button>
            )}
          </div>
        </div>
      )}
      {children}
    </div>
  );
}

interface DetailFieldProps {
  label: string;
  value: string | number | ReactNode;
}

export function DetailField({ label, value }: DetailFieldProps) {
  return (
    <div className="flex flex-col gap-0.5">
      <span className="text-xs text-muted-foreground">{label}</span>
      <span className="text-sm">{value}</span>
    </div>
  );
}
