'use client';

import { useState, useMemo, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useProjects } from '@/lib/projects-context';
import { useCrm } from '@/lib/crm-context';
import { SidePanel } from '@/components/ui/SidePanel';
import { DynamicIcon } from '@/lib/icons';
import { Search, X, ChevronRight, SearchX } from 'lucide-react';

interface SearchResult {
  id: string;
  label: string;
  subtitle: string;
  href: string;
  icon: string;
  category: string;
}

export function GlobalSearch({ onClose }: { onClose: () => void }) {
  const { projects } = useProjects();
  const { clients, leads } = useCrm();
  const [query, setQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const results = useMemo<SearchResult[]>(() => {
    if (!query.trim()) return [];
    const q = query.toLowerCase();

    const projectResults: SearchResult[] = projects
      .filter(p => p.name.toLowerCase().includes(q) || p.address.toLowerCase().includes(q) || p.currentPhase.toLowerCase().includes(q))
      .map(p => ({
        id: `proj-${p.id}`,
        label: p.name,
        subtitle: `${p.currentPhase} · ${p.status}`,
        href: `/projects/${p.id}`,
        icon: 'folder',
        category: 'Projects',
      }));

    const clientResults: SearchResult[] = clients
      .filter(c => c.primaryContact.toLowerCase().includes(q) || c.company.toLowerCase().includes(q) || c.email.toLowerCase().includes(q))
      .map(c => ({
        id: `client-${c.id}`,
        label: c.primaryContact,
        subtitle: `${c.company} · Client`,
        href: `/crm/clients/${c.id}`,
        icon: 'business_center',
        category: 'Clients',
      }));

    const leadResults: SearchResult[] = leads
      .filter(l => `${l.firstName} ${l.lastName}`.toLowerCase().includes(q) || l.company.toLowerCase().includes(q) || l.email.toLowerCase().includes(q))
      .map(l => ({
        id: `lead-${l.id}`,
        label: `${l.firstName} ${l.lastName}`,
        subtitle: `${l.company} · Lead`,
        href: `/crm/leads/${l.id}`,
        icon: 'person',
        category: 'Leads',
      }));

    return [...projectResults, ...clientResults, ...leadResults];
  }, [query, projects, clients, leads]);

  const grouped = useMemo(() => {
    const map: Record<string, SearchResult[]> = {};
    results.forEach(r => {
      if (!map[r.category]) map[r.category] = [];
      map[r.category].push(r);
    });
    return map;
  }, [results]);

  return (
    <SidePanel onClose={onClose}>
      <div className="px-6 py-5">
        {/* Search Bar */}
        <div className="relative mb-5">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Search projects, clients, leads..."
            className="modal-input pl-10"
          />
          {query && (
            <button onClick={() => setQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
              <X size={16} />
            </button>
          )}
        </div>

        {/* Results */}
        {!query.trim() ? (
          <div className="text-center py-12">
            <div className="w-14 h-14 rounded-2xl bg-muted flex items-center justify-center mx-auto mb-3">
              <Search size={28} className="text-muted-foreground" />
            </div>
            <p className="text-sm text-muted-foreground">Start typing to search across StudioOS</p>
          </div>
        ) : results.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-14 h-14 rounded-2xl bg-muted flex items-center justify-center mx-auto mb-3">
              <SearchX size={28} className="text-muted-foreground" />
            </div>
            <p className="text-sm text-muted-foreground">No results for "{query}"</p>
          </div>
        ) : (
          <div className="space-y-5">
            {Object.entries(grouped).map(([category, items]) => (
              <div key={category}>
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2 px-1">{category}</p>
                <div className="space-y-0.5">
                  {items.map(r => (
                    <Link
                      key={r.id}
                      href={r.href}
                      onClick={onClose}
                      className="flex items-center gap-3 px-2 py-2.5 rounded-lg hover:bg-muted/50 transition-colors group"
                    >
                      <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center flex-shrink-0">
                        <DynamicIcon name={r.icon} size={16} className="text-muted-foreground" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{r.label}</p>
                        <p className="text-xs text-muted-foreground truncate">{r.subtitle}</p>
                      </div>
                      <ChevronRight size={16} className="text-muted-foreground/30 group-hover:text-muted-foreground transition-colors" />
                    </Link>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </SidePanel>
  );
}
