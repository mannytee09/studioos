'use client';

import { Pin } from 'lucide-react';

interface PinButtonProps {
  pinned: boolean;
  onToggle: (e: React.MouseEvent) => void;
}

export function PinButton({ pinned, onToggle }: PinButtonProps) {
  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onToggle(e);
  };

  return (
    <button
      onClick={handleClick}

      className={`
        w-7 h-7 flex items-center justify-center rounded
        border transition-colors cursor-pointer flex-shrink-0
        ${pinned
          ? 'bg-white border-neutral-200 dark:bg-neutral-800 dark:border-neutral-700'
          : 'bg-white border-neutral-200 dark:bg-neutral-900 dark:border-neutral-800'
        }
        hover:bg-neutral-50 hover:border-neutral-300 dark:hover:bg-neutral-700 dark:hover:border-neutral-600
      `}
    >
      {pinned ? (
        <Pin size={14} style={{ color: '#333333' }} fill="currentColor" />
      ) : (
        <Pin size={14} style={{ color: '#888888' }} />
      )}
    </button>
  );
}
