import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useAuthContext } from '../contexts/AuthContext';

type Msg = {
  id: string;
  cuerpo: string;
  created_at: string;
  profiles: { full_name: string } | null;
};

export function TemaMensajes({ temaId }: { temaId: string }) {
  const { user } = useAuthContext();
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
      .limit(50);
    if (error || !data) {
      setLista([]);
      setLoading(false);
      return;
    }
    const ids = [...new Set(data.map((r: { user_id: string }) => r.user_id))];
    const { data: profs } = await supabase.from('profiles').select('id, full_name').in('id', ids);
    const map = new Map((profs ?? []).map((p: { id: string; full_name: string }) => [p.id, p.full_name]));
    setLista(
      (data as { id: string; cuerpo: string; created_at: string; user_id: string }[]).map((r) => ({
        id: r.id,
        cuerpo: r.cuerpo,
        created_at: r.created_at,
        profiles: { full_name: map.get(r.user_id) ?? 'Usuario' },
      }))
    );
    setLoading(false);
  }

  useEffect(() => {
    cargar();
  }, [temaId]);

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
      cargar();
    }
  }

  if (!user) return null;

  return (
    <section className="mt-10 card p-5 border border-slate-200" aria-labelledby="tema-msj-h">
      <h2 id="tema-msj-h" className="text-lg font-semibold text-slate-900 mb-3">
        Mensajes del tema
      </h2>
      <p className="text-sm text-slate-600 mb-4">
        Docentes y estudiantes pueden dejar un mensaje visible para quienes cursan este tema.
      </p>
      <form onSubmit={enviar} className="flex flex-col sm:flex-row gap-2 mb-6">
        <label htmlFor="tema-msj-input" className="sr-only">
          Escribe tu mensaje
        </label>
        <input
          id="tema-msj-input"
          className="input-field flex-1"
          value={cuerpo}
          onChange={(e) => setCuerpo(e.target.value)}
          placeholder="Escribe un mensaje…"
          maxLength={2000}
        />
        <button type="submit" className="btn-primary shrink-0" disabled={enviando || !cuerpo.trim()}>
          {enviando ? 'Enviando…' : 'Enviar'}
        </button>
      </form>
      {loading ? (
        <p className="text-slate-600 text-sm">Cargando mensajes…</p>
      ) : lista.length === 0 ? (
        <p className="text-slate-500 text-sm">Aún no hay mensajes.</p>
      ) : (
        <ul className="space-y-3 list-none m-0 p-0">
          {lista.map((m) => (
            <li
              key={m.id}
              className="border border-slate-200 rounded-lg p-3 bg-slate-50/80"
            >
              <p className="text-sm font-medium text-slate-900">
                {m.profiles?.full_name ?? 'Usuario'}
                <span className="text-slate-500 font-normal ml-2">
                  {new Date(m.created_at).toLocaleString('es-PE', {
                    dateStyle: 'short',
                    timeStyle: 'short',
                  })}
                </span>
              </p>
              <p className="text-slate-800 mt-1 text-sm whitespace-pre-wrap">{m.cuerpo}</p>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
