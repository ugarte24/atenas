import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useAuthContext } from '../contexts/AuthContext';
import { EmptyState } from './ui/EmptyState';
import { Button } from './ui/Button';
import { Textarea } from './ui/Input';
import { Alert } from './ui/Alert';
import { Card } from './ui/Card';
import { MessageCircle } from 'lucide-react';

type Msg = {
  id: string;
  cuerpo: string;
  created_at: string;
  user_id: string;
  profiles: { full_name: string } | null;
};

export function TemaMensajes({ temaId }: { temaId: string }) {
  const { user, profile } = useAuthContext();
  const [lista, setLista] = useState<Msg[]>([]);
  const [cuerpo, setCuerpo] = useState('');
  const [loading, setLoading] = useState(true);
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function cargar() {
    setLoading(true);
    setError(null);
    const { data, error: e } = await supabase
      .from('tema_mensajes')
      .select('id, cuerpo, created_at, user_id')
      .eq('tema_id', temaId)
      .order('created_at', { ascending: false })
      .limit(50);
    if (e || !data) {
      setError('No se pudieron cargar los mensajes.');
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
        user_id: r.user_id,
        profiles: { full_name: map.get(r.user_id) ?? 'Usuario' },
      }))
    );
    setLoading(false);
  }

  useEffect(() => {
    void cargar();
  }, [temaId]);

  async function enviar(e: React.FormEvent) {
    e.preventDefault();
    if (!user || !cuerpo.trim()) return;
    setEnviando(true);
    setError(null);
    const { error: e2 } = await supabase.from('tema_mensajes').insert({
      tema_id: temaId,
      user_id: user.id,
      cuerpo: cuerpo.trim(),
    });
    setEnviando(false);
    if (e2) {
      setError('No se pudo enviar el mensaje. Inténtalo de nuevo.');
      return;
    }
    setCuerpo('');
    void cargar();
  }

  if (!user) return null;

  const esDocenteOAdmin = profile?.role === 'docente' || profile?.role === 'admin';

  return (
    <Card padding="md" className="border border-atenas-mist-border" aria-labelledby="tema-msj-h">
      <h2 id="tema-msj-h" className="text-lg font-bold text-atenas-ink mb-1">
        Foro del tema
      </h2>
      <p className="text-sm text-atenas-muted mb-4">
        {esDocenteOAdmin
          ? 'Comparte avisos o responde dudas de quienes cursan este tema.'
          : 'Pregunta dudas o comparte ideas con tus compañeros y docentes.'}
      </p>

      {error && (
        <Alert tone="error" className="mb-4">
          {error}
        </Alert>
      )}

      <form onSubmit={enviar} className="flex flex-col gap-2 mb-6">
        <Textarea
          id="tema-msj-input"
          label="Tu mensaje"
          value={cuerpo}
          onChange={(e) => setCuerpo(e.target.value)}
          placeholder="Escribe un mensaje…"
          maxLength={2000}
          rows={3}
        />
        <Button type="submit" disabled={enviando || !cuerpo.trim()} className="self-start shrink-0">
          {enviando ? 'Enviando…' : 'Enviar'}
        </Button>
      </form>

      {loading ? (
        <p className="text-atenas-muted text-sm">Cargando mensajes…</p>
      ) : lista.length === 0 ? (
        <EmptyState
          icon={<MessageCircle className="w-8 h-8" />}
          title="Sin mensajes aún"
          description="Sé el primero en comentar en este tema."
          className="p-6"
        />
      ) : (
        <ul className="space-y-3 list-none m-0 p-0">
          {lista.map((m) => (
            <li
              key={m.id}
              className="border border-atenas-mist-border rounded-xl p-3 bg-atenas-page/80"
            >
              <p className="text-sm font-medium text-atenas-ink">
                {m.profiles?.full_name ?? 'Usuario'}
                {m.user_id === user.id && (
                  <span className="text-xs text-atenas-muted font-normal ml-1">(tú)</span>
                )}
                <span className="text-atenas-muted font-normal ml-2">
                  {new Date(m.created_at).toLocaleString('es-PE', {
                    dateStyle: 'short',
                    timeStyle: 'short',
                  })}
                </span>
              </p>
              <p className="text-atenas-ink mt-1 text-sm whitespace-pre-wrap">{m.cuerpo}</p>
            </li>
          ))}
        </ul>
      )}
    </Card>
  );
}
