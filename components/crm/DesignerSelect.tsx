'use client';

import { useState, useRef, useEffect } from 'react';
import { useDesigners } from '@/lib/designer-context';
import { AddDesignerModal } from './AddDesignerModal';
import { ChevronDown, Check, Plus } from 'lucide-react';

interface DesignerSelectProps {
  value: string;
  onChange: (value: string) => void;
}

export function DesignerSelect({ value, onChange }: DesignerSelectProps) {
  const { designers } = useDesigners();
  const [open, setOpen] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <>
      {showAddModal && (
        <AddDesignerModal
          onClose={() => setShowAddModal(false)}
          onAdded={(name) => { onChange(name); setOpen(false); }}
        />
      )}

      <div className="relative" ref={ref}>
        <button
          type="button"
          onClick={() => setOpen(!open)}
          className="modal-input flex items-center justify-between gap-2 text-left"
        >
          <span className={value ? 'text-foreground' : 'text-muted-foreground'}>
            {value || 'Select designer'}
          </span>
          <ChevronDown size={16} className="text-muted-foreground flex-shrink-0" />
        </button>

        {open && (
          <div className="absolute left-0 right-0 mt-1 bg-popover border border-border rounded-xl shadow-lg z-50 py-1 max-h-52 overflow-y-auto">
            {designers.map((d) => (
              <button
                key={d}
                type="button"
                onClick={() => { onChange(d); setOpen(false); }}
                className={`flex items-center justify-between w-full px-4 py-2 text-sm text-left hover:bg-muted transition-colors ${
                  value === d ? 'font-medium text-foreground' : 'text-muted-foreground'
                }`}
              >
                {d}
                {value === d && (
                  <Check size={14} />
                )}
              </button>
            ))}
            <div className="border-t border-border mt-1 pt-1">
              <button
                type="button"
                onClick={() => { setOpen(false); setShowAddModal(true); }}
                className="flex items-center gap-2 w-full px-4 py-2 text-sm text-left text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
              >
                <Plus size={15} />
                Add New Designer
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
