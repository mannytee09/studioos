'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useSettings } from '@/lib/settings-context';
import { Settings, LogOut } from 'lucide-react';

export function UserMenu() {
  const { settings } = useSettings();
  const fullName = `${settings.firstName} ${settings.lastName}`.trim();
  const initial = settings.firstName.charAt(0).toUpperCase();
  const [open, setOpen] = useState(false);
  const [showLogoutDialog, setShowLogoutDialog] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    const key = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false); };
    document.addEventListener('mousedown', handler);
    document.addEventListener('keydown', key);
    return () => {
      document.removeEventListener('mousedown', handler);
      document.removeEventListener('keydown', key);
    };
  }, []);

  const handleLogout = () => {
    setShowLogoutDialog(false);
    window.location.href = '/';
  };

  return (
    <>
      {showLogoutDialog && <LogoutDialog onConfirm={handleLogout} onCancel={() => setShowLogoutDialog(false)} />}

      <div className="relative" ref={ref}>
        <button
          onClick={() => setOpen(!open)}
          className="w-9 h-9 rounded-lg bg-muted border border-border flex items-center justify-center transition-colors hover:bg-muted/80 flex-shrink-0"

        >
          <span className="text-sm font-semibold text-foreground select-none">{initial}</span>
        </button>

        {open && (
          <div className="absolute right-0 top-full mt-2 w-64 bg-popover border border-border rounded-xl shadow-xl z-50 overflow-hidden">
            {/* User info */}
            <div className="px-4 py-3 border-b border-border">
              <p className="text-sm font-medium truncate">{fullName}</p>
              <p className="text-xs text-muted-foreground truncate">{settings.email}</p>
            </div>

            {/* Menu items */}
            <div className="py-1">
              <Link
                href="/settings"
                onClick={() => setOpen(false)}
                className="flex items-center gap-2.5 px-4 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
              >
                <Settings size={16} />
                Account Settings
              </Link>
              <button
                onClick={() => { setOpen(false); setShowLogoutDialog(true); }}
                className="flex items-center gap-2.5 px-4 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-muted transition-colors w-full text-left"
              >
                <LogOut size={16} />
                Sign Out
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  );
}

function LogoutDialog({ onConfirm, onCancel }: { onConfirm: () => void; onCancel: () => void }) {
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center" onClick={onCancel}>
      <div className="absolute inset-0 bg-black/20" />
      <div
        className="relative bg-card border border-border rounded-2xl shadow-2xl p-6 max-w-sm w-full mx-4 z-10"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center mb-4">
          <LogOut size={20} className="text-muted-foreground" />
        </div>
        <h3 className="font-semibold mb-1">Sign out of StudioOS?</h3>
        <p className="text-sm text-muted-foreground mb-5">You will be redirected to the login screen.</p>
        <div className="flex items-center gap-2 justify-end">
          <button onClick={onCancel} className="notion-button border border-border">Cancel</button>
          <button onClick={onConfirm} className="notion-button bg-foreground text-background hover:bg-foreground/90">Sign Out</button>
        </div>
      </div>
    </div>
  );
}
