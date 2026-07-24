'use client';

import { Archive } from 'lucide-react';

interface ArchiveDialogProps {
  projectName: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export function ArchiveDialog({ projectName, onConfirm, onCancel }: ArchiveDialogProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/20" onClick={onCancel} />
      <div className="relative bg-card border border-border rounded-2xl shadow-xl w-full max-w-sm mx-4 overflow-hidden">
        <div className="px-6 py-5">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-full bg-amber-50 flex items-center justify-center">
              <Archive size={20} className="text-amber-600" />
            </div>
            <h3 className="font-semibold">Archive Project</h3>
          </div>
          <p className="text-sm text-muted-foreground">
            Are you sure you want to archive <span className="font-medium text-foreground">{projectName}</span>?
          </p>
          <p className="text-xs text-muted-foreground mt-2">
            Archived projects can be viewed by filtering for Archived status.
          </p>
        </div>

        <div className="flex items-center justify-end gap-2 px-6 py-4 border-t border-border bg-muted/20">
          <button onClick={onCancel} className="notion-button border border-border text-sm">
            Cancel
          </button>
          <button onClick={onConfirm} className="notion-button bg-slate-600 text-white hover:bg-slate-700 text-sm">
            Archive
          </button>
        </div>
      </div>
    </div>
  );
}
