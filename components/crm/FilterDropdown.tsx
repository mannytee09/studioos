'use client';

import { useState, useRef, useEffect } from 'react';
import { DynamicIcon } from '@/lib/icons';
import { ChevronDown, Check } from 'lucide-react';

interface FilterDropdownProps {
  label: string;
  value: string;
  options: string[];
  onChange: (value: string) => void;
  icon?: string;
}

export function FilterDropdown({ label, value, options, onChange, icon = 'filter_list' }: FilterDropdownProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const hasValue = value !== options[0];

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(!open)}
        className={`notion-button border gap-1.5 text-sm transition-colors ${
          hasValue ? 'border-foreground/30 bg-muted text-foreground' : 'border-border text-muted-foreground'
        }`}
      >
        <DynamicIcon name={icon} size={15} />
        <span className="max-w-[140px] truncate">{hasValue ? value : label}</span>
        <ChevronDown size={14} />
      </button>

      {open && (
        <div className="absolute left-0 mt-1 w-64 bg-popover border border-border rounded-xl shadow-lg z-30 py-1">
          {options.map((opt) => (
            <button
              key={opt}
              onClick={() => { onChange(opt); setOpen(false); }}
              className={`flex items-center justify-between w-full px-4 py-2 text-sm text-left hover:bg-muted transition-colors whitespace-nowrap ${
                value === opt ? 'text-foreground font-medium' : 'text-muted-foreground'
              }`}
            >
              {opt}
              {value === opt && (
                <Check size={14} />
              )}
            </button>
          ))}
          {hasValue && (
            <div className="border-t border-border/40 px-4 pt-2 pb-1">
              <button
                onClick={() => { onChange(options[0]); setOpen(false); }}
                className="text-xs text-muted-foreground hover:text-foreground"
              >
                Clear Filters
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
