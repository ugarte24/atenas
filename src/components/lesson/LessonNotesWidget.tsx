import { useEffect, useState } from 'react';
import { Pencil } from 'lucide-react';

const STORAGE_KEY = 'atenas-notas-tema';

function loadNotes(temaId: string): string {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return '';
    const map = JSON.parse(raw) as Record<string, string>;
    return map[temaId] ?? '';
  } catch {
    return '';
  }
}

function saveNotes(temaId: string, text: string) {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const map = raw ? (JSON.parse(raw) as Record<string, string>) : {};
    map[temaId] = text;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(map));
  } catch {
    /* ignore */
  }
}

type Props = {
  temaId: string;
  compact?: boolean;
};

export function LessonNotesWidget({ temaId, compact }: Props) {
  const [text, setText] = useState('');
  const [editing, setEditing] = useState(false);

  useEffect(() => {
    setText(loadNotes(temaId));
  }, [temaId]);

  function handleBlur() {
    saveNotes(temaId, text);
    setEditing(false);
  }

  return (
    <div className="rounded-2xl border border-amber-200 bg-amber-50/80 p-4 shadow-card">
      <div className="flex items-center justify-between gap-2 mb-2">
        <h3 className="text-sm font-bold text-amber-950">Mis notas</h3>
        <button
          type="button"
          onClick={() => setEditing(true)}
          className="p-1.5 rounded-lg text-amber-800 hover:bg-amber-100 min-h-touch min-w-touch flex items-center justify-center"
          aria-label="Editar notas"
        >
          <Pencil className="w-4 h-4" />
        </button>
      </div>
      {editing || !text ? (
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          onBlur={handleBlur}
          placeholder="Escribe tus apuntes sobre este tema…"
          rows={compact ? 3 : 5}
          className="w-full text-sm text-amber-950 bg-white/60 border border-amber-200 rounded-xl p-3 resize-none focus:outline-none focus:ring-2 focus:ring-amber-400/50"
          autoFocus={editing}
        />
      ) : (
        <p className="text-sm text-amber-900 whitespace-pre-wrap leading-relaxed">{text}</p>
      )}
    </div>
  );
}
