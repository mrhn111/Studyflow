import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../store/AppContext';
import MaterialIcon from '../components/ui/MaterialIcon';

function fmtTime(iso: string) {
  return new Date(iso).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
}

export default function Library() {
  const { subjects, notes, saveNote } = useApp();
  const navigate = useNavigate();

  const [selectedId, setSelectedId] = useState<string | null>(subjects[0]?.id ?? null);
  const [content, setContent] = useState('');
  const [lastSaved, setLastSaved] = useState<string | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Load note when subject changes
  useEffect(() => {
    if (!selectedId) return;
    const note = notes.find(n => n.subjectId === selectedId);
    setContent(note?.content ?? '');
    setLastSaved(note?.updatedAt ?? null);
  }, [selectedId]);

  // Auto-save with 1s debounce
  useEffect(() => {
    if (!selectedId) return;
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      saveNote(selectedId, content);
      setLastSaved(new Date().toISOString());
    }, 1000);
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, [content, selectedId]);

  if (subjects.length === 0) {
    return (
      <div className="max-w-2xl mx-auto px-6 py-12 flex flex-col items-center justify-center min-h-[60vh] text-center gap-4">
        <MaterialIcon name="menu_book" className="text-outline" size={48} />
        <h2 className="font-display font-bold text-xl text-on-surface">No subjects yet</h2>
        <p className="text-on-surface-variant text-sm">Add subjects in Settings to start taking notes.</p>
        <button
          onClick={() => navigate('/settings')}
          className="mt-2 px-5 py-2.5 bg-primary text-on-primary rounded-full text-sm font-bold shadow-btn hover:shadow-btn-hover hover:-translate-y-0.5 transition-all duration-200"
        >
          Go to Settings
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto flex flex-col md:flex-row min-h-[calc(100vh-5rem)] md:min-h-[calc(100vh-4rem)]">
      {/* Subject list — left panel */}
      <aside className="md:w-56 flex-shrink-0 border-b md:border-b-0 md:border-r border-outline-variant/25 px-4 py-6 md:py-8 flex flex-col gap-0.5">
        <p className="font-display italic text-[11px] text-on-surface-variant/55 uppercase tracking-[0.14em] mb-3 px-2">Subjects</p>
        {subjects.map(sub => {
          const hasNote = notes.some(n => n.subjectId === sub.id && n.content.trim());
          return (
            <button
              key={sub.id}
              onClick={() => setSelectedId(sub.id)}
              className={`w-full text-left flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all duration-150 ${
                selectedId === sub.id
                  ? 'bg-primary/10 text-primary font-semibold'
                  : 'text-on-surface-variant font-medium hover:bg-surface-container-low hover:text-on-surface'
              }`}
            >
              <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: sub.color }} />
              <span className="flex-1 truncate">{sub.name}</span>
              {hasNote && <span className="w-1.5 h-1.5 rounded-full bg-primary flex-shrink-0" />}
            </button>
          );
        })}
      </aside>

      {/* Notes editor — right panel */}
      <main className="flex-1 flex flex-col px-4 md:px-8 py-6 md:py-8 gap-4">
        {selectedId ? (
          <>
            <div className="flex items-center justify-between">
              <h2 className="font-display font-bold text-xl text-on-surface">
                {subjects.find(s => s.id === selectedId)?.name ?? 'Notes'}
              </h2>
              {lastSaved && (
                <span className="text-xs text-on-surface-variant/60 font-medium">
                  Saved {fmtTime(lastSaved)}
                </span>
              )}
            </div>
            <textarea
              value={content}
              onChange={e => setContent(e.target.value)}
              placeholder="Start typing your notes here..."
              className="flex-1 min-h-[400px] bg-surface-container-low border border-outline-variant/25 rounded-2xl px-5 py-4 text-sm text-on-surface placeholder:text-outline/50 resize-none focus:outline-none focus:ring-2 focus:ring-primary/20 leading-7 shadow-card"
            />
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-on-surface-variant text-sm">
            Select a subject to view or edit notes.
          </div>
        )}
      </main>
    </div>
  );
}
