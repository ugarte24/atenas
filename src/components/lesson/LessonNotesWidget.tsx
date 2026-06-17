import { useEffect, useState } from 'react';
import { Pencil, Check } from 'lucide-react';

const STORAGE_PREFIX = 'atenas-notas-tema';

function storageKey(userId: string): string {
  return `${STORAGE_PREFIX}:${userId}`;
}

function loadNotes(userId: string, temaId: string): string {
  try {
    const raw = localStorage.getItem(storageKey(userId));
    if (!raw) return '';
    const map = JSON.parse(raw) as Record<string, string>;
    return map[temaId] ?? '';
  } catch {
    return '';
  }
}

function saveNotes(userId: string, temaId: string, text: string) {
  try {
    const raw = localStorage.getItem(storageKey(userId));
    const map = raw ? (JSON.parse(raw) as Record<string, string>) : {};
    map[temaId] = text;
    localStorage.setItem(storageKey(userId), JSON.stringify(map));
  } catch {
    /* ignore */
  }
}

type Props = {
  temaId: string;
  userId?: string | null;
  compact?: boolean;
};

export function LessonNotesWidget({ temaId, userId, compact }: Props) {
  const [text, setText] = useState('');
  const [editing, setEditing] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (!userId) {
      setText('');
      return;
    }
    setText(loadNotes(userId, temaId));
    setSaved(false);
  }, [temaId, userId]);

  function handleBlur() {
    if (userId) {
      saveNotes(userId, temaId, text);
      setSaved(true);
      window.setTimeout(() => setSaved(false), 2000);
    }
    setEditing(false);
  }

  if (!userId) {
    return (
      <div className="rounded-2xl border border-amber-200 bg-amber-50/80 p-4 shadow-card">
        <p className="text-sm text-amber-900">Inicia sesión para guardar notas.</p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-amber-200 bg-amber-50/80 p-4 shadow-card">
      <div className="flex items-center justify-between gap-2 mb-2">
        <h3 className="text-sm font-bold text-amber-950">Mis notas</h3>
        <div className="flex items-center gap-2">
          {saved && (
            <span className="text-[10px] font-semibold text-emerald-700 flex items-center gap-0.5">
              <Check className="w-3 h-3" aria-hidden />
              Guardado
            </span>
          )}
          {!compact && (
            <button
              type="button"
              onClick={() => setEditing((e) => !e)}
              className="text-xs font-semibold text-amber-900 hover:underline flex items-center gap-1 min-h-touch"
            >
              <Pencil className="w-3 h-3" aria-hidden />
              {editing ? 'Listo' : 'Editar'}
            </button>
          )}
        </div>
      </div>
      {compact && !editing ? (
        <button
          type="button"
          onClick={() => setEditing(true)}
          className="text-xs text-amber-900/80 text-left w-full min-h-touch"
        >
          {text || 'Toca para añadir una nota…'}
        </button>
      ) : (
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          onBlur={handleBlur}
          onFocus={() => setEditing(true)}
          rows={compact ? 3 : 6}
          placeholder="Escribe tus ideas, dudas o resumen…"
          className="w-full text-sm rounded-xl border border-amber-200 bg-white/90 px-3 py-2 resize-y min-h-[4rem] text-amber-950 placeholder:text-amber-700/50"
        />
      )}
    </div>
  );
}
