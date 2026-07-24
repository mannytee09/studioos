'use client';

import { useState } from 'react';
import { useDesigners } from '@/lib/designer-context';
import { X } from 'lucide-react';

interface AddDesignerModalProps {
  onClose: () => void;
  onAdded: (name: string) => void;
}

export function AddDesignerModal({ onClose, onAdded }: AddDesignerModalProps) {
  const { addDesigner } = useDesigners();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');

  const handleSave = () => {
    if (!name.trim()) return;
    addDesigner(name.trim());
    onAdded(name.trim());
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center">
      <div className="absolute inset-0 bg-black/20" onClick={onClose} />
      <div className="relative bg-card border border-border rounded-2xl shadow-xl w-full max-w-sm mx-4 overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-border">
          <h3 className="font-semibold text-sm">Add New Designer</h3>
          <button onClick={onClose} className="p-1 hover:bg-muted rounded-lg">
            <X size={16} />
          </button>
        </div>

        <div className="px-5 py-4 space-y-3">
          <div>
            <label className="block text-xs text-muted-foreground mb-1.5">
              Designer Name <span className="text-red-400">*</span>
            </label>
            <input
              autoFocus
              value={name}
              onChange={(e) => setName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSave()}
              placeholder="Anna Kim"
              className="modal-input"
            />
          </div>
          <div>
            <label className="block text-xs text-muted-foreground mb-1.5">Email Address</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="anna@studio.com"
              className="modal-input"
            />
          </div>
          <div>
            <label className="block text-xs text-muted-foreground mb-1.5">Phone Number</label>
            <input
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+61 400 000 000"
              className="modal-input"
            />
          </div>
        </div>

        <div className="flex items-center justify-end gap-2 px-5 py-4 border-t border-border">
          <button onClick={onClose} className="notion-button border border-border text-sm">Cancel</button>
          <button
            onClick={handleSave}
            disabled={!name.trim()}
            className="notion-button bg-foreground text-background hover:bg-foreground/90 text-sm disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Save Designer
          </button>
        </div>
      </div>
    </div>
  );
}
