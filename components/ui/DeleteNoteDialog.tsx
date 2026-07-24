'use client';

import { Trash2 } from 'lucide-react';

interface DeleteNoteDialogProps {
  onConfirm: () => void;
  onCancel: () => void;
}

export function DeleteNoteDialog({ onConfirm, onCancel }: DeleteNoteDialogProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/20" onClick={onCancel} />
      <div className="relative bg-card border border-border rounded-2xl shadow-xl w-full max-w-sm mx-4 overflow-hidden">
        <div className="px-6 py-5">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-full bg-red-50 flex items-center justify-center">
              <Trash2 size={20} className="text-red-600" />
            </div>
            <h3 className="font-semibold">Delete Note</h3>
          </div>
          <p className="text-sm text-muted-foreground">
            Delete this note?
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            This action cannot be undone.
          </p>
        </div>

        <div className="flex items-center justify-end gap-2 px-6 py-4 border-t border-border bg-muted/20">
          <button onClick={onCancel} className="notion-button border border-border text-sm">
            Cancel
          </button>
          <button onClick={onConfirm} className="notion-button bg-red-600 text-white hover:bg-red-700 text-sm">
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}
