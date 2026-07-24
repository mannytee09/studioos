'use client';

import { useState, useRef, useEffect } from 'react';
import { useCrm } from '@/lib/crm-context';
import { ChevronDown, Search, Check } from 'lucide-react';

interface ClientSelectProps {
  value: string;
  onChange: (clientId: string) => void;
  onAddNew?: () => void;
}

export function ClientSelect({ value, onChange, onAddNew }: ClientSelectProps) {
  const { clients } = useCrm();
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filtered = clients.filter((c) => {
    const q = search.toLowerCase();
    return (
      c.primaryContact.toLowerCase().includes(q) ||
      c.company.toLowerCase().includes(q)
    );
  });

  const selected = clients.find((c) => c.id === value);

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="modal-input flex items-center justify-between gap-2 text-left"
      >
        <span className={selected ? 'text-foreground' : 'text-muted-foreground'}>
          {selected ? `${selected.primaryContact} (${selected.company})` : 'Select client'}
        </span>
        <ChevronDown size={16} className="text-muted-foreground flex-shrink-0" />
      </button>

      {open && (
        <div className="absolute left-0 right-0 mt-1 bg-popover border border-border rounded-xl shadow-lg z-50 overflow-hidden">
          <div className="p-2 border-b border-border">
            <div className="flex items-center gap-2 px-2 py-1.5 bg-muted rounded-lg">
              <Search size={14} className="text-muted-foreground" />
              <input
                autoFocus
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search clients..."
                className="bg-transparent outline-none text-sm flex-1 placeholder:text-muted-foreground"
              />
            </div>
          </div>

          <div className="max-h-48 overflow-y-auto py-1">
            {filtered.length === 0 ? (
              <p className="text-xs text-muted-foreground text-center py-3">No clients found</p>
            ) : (
              filtered.map((client) => (
                <button
                  key={client.id}
                  type="button"
                  onClick={() => { onChange(client.id); setOpen(false); setSearch(''); }}
                  className={`flex items-center justify-between w-full px-4 py-2 text-sm text-left hover:bg-muted transition-colors ${
                    value === client.id ? 'font-medium text-foreground' : 'text-muted-foreground'
                  }`}
                >
                  <div>
                    <p>{client.primaryContact}</p>
                    <p className="text-xs text-muted-foreground">{client.company}</p>
                  </div>
                  {value === client.id && (
                    <Check size={14} />
                  )}
                </button>
              ))
            )}
          </div>

        </div>
      )}
    </div>
  );
}
