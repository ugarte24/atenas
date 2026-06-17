import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { useAuthContext } from '../../contexts/AuthContext';
import { MessageCircle } from 'lucide-react';

type Msg = {
  id: string;
  cuerpo: string;
  profiles: { full_name: string } | null;
};

type Props = {
  temaId: string;
  compact?: boolean;
  onOpenForum?: () => void;
};

export function LessonForumWidget({ temaId, compact, onOpenForum }: Props) {
  const { user, profile } = useAuthContext();
  const [lista, setLista] = useState<Msg[]>([]);
  const [cuerpo, setCuerpo] = useState('');
  const [loading, setLoading] = useState(true);
  const [enviando, setEnviando] = useState(false);

  async function cargar() {
    setLoading(true);
    const { data, error } = await supabase
      .from('tema_mensajes')
      .select('id, cuerpo, created_at, user_id')
      .eq('tema_id', temaId)
      .order('created_at', { ascending: false })
      .limit(compact ? 3 : 10);
    if (error || !data) {
      setLista([]);
      setLoading(false);
      return;
    }
    const ids = [...new Set(data.map((r: { user_id: string }) => r.user_id))];
    const { data: profs } = await supabase.from('profiles').select('id, full_name').in('id', ids);
    const map = new Map((profs ?? []).map((p: { id: string; full_name: string }) => [p.id, p.full_name]));
    setLista(
      (data as { id: string; cuerpo: string; user_id: string }[]).map((r) => ({
        id: r.id,
        cuerpo: r.cuerpo,
        profiles: { full_name: map.get(r.user_id) ?? 'Usuario' },
      }))
    );
    setLoading(false);
  }

  useEffect(() => {
    void cargar();
  }, [temaId, compact]);

  async function enviar(e: React.FormEvent) {
    e.preventDefault();
    if (!user || !cuerpo.trim()) return;
    setEnviando(true);
    const { error } = await supabase.from('tema_mensajes').insert({
      tema_id: temaId,
      user_id: user.id,
      cuerpo: cuerpo.trim(),
    });
    setEnviando(false);
    if (!error) {
      setCuerpo('');
      void cargar();
    }
  }

  if (!user) return null;

  const avatars = lista.slice(0, 3).map((m) => m.profiles?.full_name?.[0]?.toUpperCase() ?? '?');

  return (
    <div className="rounded-2xl border border-atenas-mist-border bg-white p-4 shadow-card">
      <h3 className="text-sm font-bold text-atenas-ink mb-3 flex items-center gap-2">
        <MessageCircle className="w-4 h-4 text-atenas-blue" aria-hidden />
        Pregunta al foro
      </h3>

      {loading ? (
        <p className="text-xs text-atenas-muted">Cargando…</p>
      ) : lista.length > 0 ? (
        <ul className="space-y-2 mb-3 list-none m-0 p-0">
          {lista.slice(0, compact ? 2 : 5).map((m) => (
            <li key={m.id} className="text-xs text-atenas-muted-strong">
              <span className="font-semibold text-atenas-ink">{m.profiles?.full_name}: </span>
              {m.cuerpo.length > 80 ? `${m.cuerpo.slice(0, 80)}…` : m.cuerpo}
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-xs text-atenas-muted mb-3">Sé el primero en participar.</p>
      )}

      {avatars.length > 0 && (
        <div className="flex -space-x-2 mb-3">
          {avatars.map((a, i) => (
            <span
              key={i}
              className="w-8 h-8 rounded-full bg-atenas-sidebar text-white text-xs font-bold flex items-center justify-center border-2 border-white"
            >
              {a}
            </span>
          ))}
        </div>
      )}

      {profile?.role === 'estudiante' && !compact && (
        <form onSubmit={enviar} className="flex gap-2">
          <input
            type="text"
            value={cuerpo}
            onChange={(e) => setCuerpo(e.target.value)}
            placeholder="Escribe tu pregunta…"
            className="flex-1 text-sm rounded-xl border border-atenas-mist-border px-3 py-2 min-h-touch"
            maxLength={500}
          />
          <button type="submit" disabled={enviando || !cuerpo.trim()} className="btn-primary text-sm px-4 py-2 min-h-touch">
            Enviar
          </button>
        </form>
      )}

      {compact && onOpenForum && (
        <button
          type="button"
          onClick={onOpenForum}
          className="text-xs font-semibold text-atenas-blue hover:underline min-h-touch"
        >
          Ir al foro de este tema
        </button>
      )}

      {profile?.role !== 'estudiante' && (
        <Link to={`/temas/${temaId}`} className="text-xs font-semibold text-atenas-blue hover:underline">
          Ver foro completo
        </Link>
      )}
    </div>
  );
}
