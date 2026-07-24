'use client';

import { useEffect, useState, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';

interface SidePanelProps {
  title?: string;
  subtitle?: string;
  onClose: () => void;
  children: React.ReactNode;
  footer?: React.ReactNode;
  width?: string;
  headerExtra?: React.ReactNode;
  /** When true, triggers the exit animation. Parent should call onClose after the animation duration. */
  closing?: boolean;
  /** Optional extension panel rendered to the left, separated by a dashed divider. */
  extension?: React.ReactNode;
  /** Width of the extension panel (when provided). */
  extensionWidth?: string;
  /** When true, animates the extension panel out before the main panel. */
  closingExtension?: boolean;
}

const ANIM_MS = 350;

export function SidePanel({
  title, subtitle, onClose, children, footer,
  width = 'min(45vw, 820px)',
  headerExtra,
  extension,
  extensionWidth = 'min(38vw, 560px)',
  closingExtension = false,
  closing = false,
}: SidePanelProps) {
  const [visible, setVisible] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  useEffect(() => {
    if (!mounted) return;
    const r1 = requestAnimationFrame(() => {
      const r2 = requestAnimationFrame(() => setVisible(true));
      return () => cancelAnimationFrame(r2);
    });
    return () => cancelAnimationFrame(r1);
  }, [mounted]);

  useEffect(() => {
    if (closing) setVisible(false);
  }, [closing]);

  useEffect(() => {
    if (closingExtension) setVisible(false);
  }, [closingExtension]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') handleClose(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  const handleClose = useCallback(() => {
    setVisible(false);
    setTimeout(onClose, ANIM_MS);
  }, [onClose]);

  if (!mounted) return null;

  const hasExtension = !!extension;

  return createPortal(
    <>
      {/* Frosted glass overlay */}
      <div
        className={`fixed inset-0 z-40 transition-opacity ease-in-out ${visible ? 'opacity-100' : 'opacity-0'}`}
        style={{ background: 'rgba(220,218,212,0.55)', backdropFilter: 'blur(2px)', WebkitBackdropFilter: 'blur(2px)', transitionDuration: `${ANIM_MS}ms` }}
        onClick={handleClose}
      />
      {/* Combined panel container: extension + main panel side by side */}
      <div
        className="fixed top-0 right-0 bottom-0 z-50 flex ease-in-out"
        style={{
          transform: visible ? 'translateX(0)' : 'translateX(100%)',
          transition: `transform ${ANIM_MS}ms ease-in-out`,
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Extension panel (left) */}
        {hasExtension && (
          <div
            className="bg-card border-r border-dashed border-muted-foreground/30 shadow-2xl flex flex-col ease-in-out"
            style={{
              width: extensionWidth,
              minWidth: 400,
              transform: visible ? 'translateX(0)' : 'translateX(40px)',
              opacity: visible ? 1 : 0,
              transition: `transform ${ANIM_MS}ms ease-in-out, opacity ${ANIM_MS}ms ease-in-out`,
            }}
          >
            {extension}
          </div>
        )}

        {/* Main panel (right) */}
        <div
          className="bg-card border-l border-border shadow-2xl flex flex-col ease-in-out"
          style={{ width, minWidth: 480 }}
        >
          {/* Header */}
          <div className="flex items-start justify-between gap-3 px-6 pt-4 pb-3 border-b border-border flex-shrink-0">
            <div className="min-w-0 pt-0.5">
              {title && <h2 className="font-semibold text-base leading-none">{title}</h2>}
              {subtitle && <p className={`text-xs text-muted-foreground ${title ? 'mt-1' : 'mt-0'}`}>{subtitle}</p>}
            </div>
            {headerExtra}
            <button onClick={handleClose} className="p-1.5 hover:bg-muted rounded-lg transition-colors -mt-0.5 flex-shrink-0">
              <X size={18} className="text-muted-foreground" />
            </button>
          </div>

          {/* Body */}
          <div className="flex-1 min-h-0 modal-scroll">
            {children}
          </div>

          {/* Footer */}
          {footer && (
            <div className="flex items-center justify-between px-6 py-4 border-t border-border bg-card flex-shrink-0">
              {footer}
            </div>
          )}
        </div>
      </div>
    </>,
    document.body,
  );
}

/**
 * Coordinates a two-step exit: first the extension/preview panel slides out,
 * then the main side panel slides out, then onClose unmounts everything.
 */
export function useCoordinatedClose(onClose: () => void) {
  const [closingExtension, setClosingExtension] = useState(false);
  const [closingPanel, setClosingPanel] = useState(false);

  const handleClose = useCallback(() => {
    setClosingExtension(true);
    setTimeout(() => {
      setClosingPanel(true);
      setTimeout(() => {
        onClose();
      }, ANIM_MS);
    }, ANIM_MS);
  }, [onClose]);

  return { closingExtension, closingPanel, handleClose };
}
