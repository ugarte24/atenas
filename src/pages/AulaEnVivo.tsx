import { useState } from 'react';
import { PageHeader } from '../components/ui/PageHeader';
import { Badge } from '../components/ui/Badge';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Textarea } from '../components/ui/Input';
import { Alert } from '../components/ui/Alert';
import { EmptyState } from '../components/ui/EmptyState';
import { useAulaEnVivo } from '../hooks/useAulaEnVivo';
import { useAulaMeetUrl } from '../hooks/useAulaMeetUrl';
import { useAuthContext } from '../contexts/AuthContext';
import { MessageCircle, Radio, Users } from 'lucide-react';

export default function AulaEnVivo() {
  const { profile } = useAuthContext();
  const { mensajes, loading, error, enviando, enviar } = useAulaEnVivo();
  const { meetUrl, loading: loadingMeet } = useAulaMeetUrl();
  const [texto, setTexto] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const ok = await enviar(texto);
    if (ok) setTexto('');
  }

  const participantes = new Set(mensajes.map((m) => m.user_id)).size;

  return (
    <div className="max-w-4xl mx-auto pb-safe">
      <PageHeader
        title="Aula en vivo"
        description="Chat grupal en tiempo real con tu clase. La videollamada se integrará en una próxima versión."
      />

      <div className="mb-6 rounded-2xl border border-amber-200 bg-amber-50 p-4 flex items-start gap-3 shadow-card">
        <Radio className="w-6 h-6 text-amber-700 shrink-0 mt-0.5" aria-hidden />
        <div>
          <p className="font-bold text-amber-950 flex items-center gap-2">
            Chat en vivo
            <Badge tone="success">Activo</Badge>
          </p>
          <p className="text-sm text-amber-900 mt-1">
            Escribe preguntas o comentarios. Los mensajes se actualizan automáticamente.
            {profile?.role === 'docente' && ' Como docente, guía la conversación desde aquí.'}
          </p>
        </div>
      </div>

      <div className="grid md:grid-cols-[1fr_14rem] gap-4">
        <Card padding="md" className="flex flex-col min-h-[320px]">
          {error && (
            <Alert tone="warning" className="mb-4">
              {error}
            </Alert>
          )}

          <div className="flex-1 overflow-y-auto space-y-3 mb-4 max-h-[360px]">
            {loading ? (
              <p className="text-sm text-atenas-muted">Cargando chat…</p>
            ) : mensajes.length === 0 ? (
              <EmptyState
                icon={<MessageCircle className="w-8 h-8" />}
                title="Chat vacío"
                description="Inicia la conversación con una pregunta o saludo."
                className="p-4"
              />
            ) : (
              mensajes.map((m) => (
                <div key={m.id} className="rounded-xl border border-atenas-mist-border bg-atenas-page/80 p-3">
                  <p className="text-xs font-semibold text-atenas-ink">
                    {m.authorName}
                    <span className="text-atenas-muted font-normal ml-2">
                      {new Date(m.created_at).toLocaleTimeString('es-PE', {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </p>
                  <p className="text-sm text-atenas-muted-strong mt-1 whitespace-pre-wrap">{m.cuerpo}</p>
                </div>
              ))
            )}
          </div>

          <form onSubmit={handleSubmit} className="space-y-3 border-t border-atenas-mist-border pt-4">
            <Textarea
              label="Tu mensaje"
              value={texto}
              onChange={(e) => setTexto(e.target.value)}
              rows={3}
              placeholder="Escribe aquí…"
              maxLength={1000}
            />
            <Button type="submit" disabled={enviando || !texto.trim()} fullWidth>
              {enviando ? 'Enviando…' : 'Enviar mensaje'}
            </Button>
          </form>
        </Card>

        <aside className="space-y-4">
          <Card padding="md">
            <h3 className="text-xs font-bold uppercase tracking-wide text-atenas-muted mb-2 flex items-center gap-1">
              <Users className="w-4 h-4" /> Participantes
            </h3>
            <p className="text-2xl font-bold text-atenas-ink">{participantes}</p>
            <p className="text-xs text-atenas-muted mt-1">Con al menos un mensaje en esta sesión.</p>
          </Card>
          <Card padding="md" className="bg-atenas-sidebar text-white border-0">
            <p className="text-xs font-bold uppercase tracking-wide text-blue-200 mb-2">Videollamada</p>
            {loadingMeet ? (
              <p className="text-sm text-blue-100/90">Cargando enlace…</p>
            ) : meetUrl ? (
              <a
                href={meetUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex mt-2 rounded-xl bg-white text-atenas-ink px-4 py-2 text-sm font-bold min-h-touch"
              >
                Unirse a la clase
              </a>
            ) : (
              <p className="text-sm text-blue-100/90">
                El docente configurará el enlace Meet/Jitsi desde el panel.
              </p>
            )}
          </Card>
        </aside>
      </div>
    </div>
  );
}
