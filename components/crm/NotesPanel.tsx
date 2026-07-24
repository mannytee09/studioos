'use client';

import { useState } from 'react';
import { Note } from '@/lib/crm-data';
import { DeleteNoteDialog } from '@/components/ui/DeleteNoteDialog';
import { Trash2, User } from 'lucide-react';

interface NotesPanelProps {
  notes: Note[];
  onNotesChange?: (notes: Note[]) => void;
}

export function NotesPanel({ notes: initialNotes, onNotesChange }: NotesPanelProps) {
  const [notes, setNotes] = useState<Note[]>(initialNotes);
  const [draft, setDraft] = useState('');
  const [focused, setFocused] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Note | null>(null);

  const addNote = () => {
    if (!draft.trim()) return;
    const newNote: Note = {
      id: `note-${Date.now()}`,
      content: draft.trim(),
      author: 'Ellie S.',
      createdAt: new Date().toLocaleDateString('en-AU', { day: 'numeric', month: 'short', year: 'numeric' }),
    };
    const updated = [newNote, ...notes];
    setNotes(updated);
    onNotesChange?.(updated);
    setDraft('');
    setFocused(false);
  };

  const deleteNote = (noteId: string) => {
    const updated = notes.filter((n) => n.id !== noteId);
    setNotes(updated);
    onNotesChange?.(updated);
    setDeleteTarget(null);
  };

  return (
    <>
      {deleteTarget && (
        <DeleteNoteDialog
          onConfirm={() => deleteNote(deleteTarget.id)}
          onCancel={() => setDeleteTarget(null)}
        />
      )}

      <div className="space-y-4">
        {/* Add note */}
        <div className={`border rounded-xl overflow-hidden transition-all ${focused ? 'border-foreground/30' : 'border-border'}`}>
          <textarea
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onFocus={() => setFocused(true)}
            placeholder="Add a note..."
            rows={focused ? 4 : 2}
            className="w-full px-4 py-3 text-sm bg-muted resize-none outline-none placeholder:text-muted-foreground"
          />
          {focused && (
            <div className="flex items-center justify-end gap-2 px-3 py-2 bg-muted border-t border-border">
              <button
                onClick={() => { setFocused(false); setDraft(''); }}
                className="notion-button text-muted-foreground text-xs"
              >
                Cancel
              </button>
              <button
                onClick={addNote}
                disabled={!draft.trim()}
                className="notion-button bg-foreground text-background hover:bg-foreground/90 text-xs disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Save Note
              </button>
            </div>
          )}
        </div>

        {/* Notes list */}
        {notes.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-4">No notes yet.</p>
        ) : (
          <div className="space-y-3">
            {notes.map((note) => (
              <div key={note.id} className="bg-card border border-border rounded-xl p-4 group">
                <div className="flex items-start justify-between gap-2">
                  <p className="text-sm leading-relaxed flex-1">{note.content}</p>
                  <button
                    onClick={() => setDeleteTarget(note)}
                    className="opacity-0 group-hover:opacity-100 p-1 hover:bg-muted rounded transition-colors"
                  >
                    <Trash2 size={16} className="text-muted-foreground hover:text-red-500" />
                  </button>
                </div>
                <div className="flex items-center gap-2 mt-3">
                  <div className="w-5 h-5 rounded-full bg-muted flex items-center justify-center">
                    <User size={12} />
                  </div>
                  <span className="text-xs text-muted-foreground">{note.author}</span>
                  <span className="text-xs text-muted-foreground">·</span>
                  <span className="text-xs text-muted-foreground">{note.createdAt}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
