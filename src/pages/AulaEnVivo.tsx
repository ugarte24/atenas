import { PageHeader } from '../components/ui/PageHeader';
import { Badge } from '../components/ui/Badge';
import { Users, MessageCircle, Radio, Construction } from 'lucide-react';

/** Vista placeholder de aula en vivo (Fase G — sin backend Realtime aún) */
export default function AulaEnVivo() {
  return (
    <div className="max-w-4xl mx-auto">
      <PageHeader
        title="Aula en vivo"
        description="Sesiones sincrónicas con tu docente. Esta función está en desarrollo."
      />

      <div className="mb-6 rounded-2xl border border-amber-200 bg-amber-50 p-4 flex items-start gap-3 shadow-card">
        <Construction className="w-6 h-6 text-amber-700 shrink-0 mt-0.5" aria-hidden />
        <div>
          <p className="font-bold text-amber-950 flex items-center gap-2">
            Próximamente
            <Badge tone="warning">En desarrollo</Badge>
          </p>
          <p className="text-sm text-amber-900 mt-1">
            El aula en vivo permitirá chat, preguntas del docente y progreso grupal en tiempo real.
            Por ahora puedes seguir estudiando en tus unidades y temas.
          </p>
        </div>
      </div>

      <div className="rounded-2xl border border-atenas-mist-border bg-atenas-sidebar text-white overflow-hidden shadow-elevated opacity-90">
        <div className="flex items-center gap-2 px-4 py-3 border-b border-white/10">
          <Radio className="w-4 h-4 text-red-400" aria-hidden />
          <span className="text-sm font-semibold">Vista previa · Sin sesión activa</span>
        </div>

        <div className="grid md:grid-cols-[1fr_16rem] gap-0">
          <div className="p-6 min-h-[240px] flex flex-col items-center justify-center bg-gradient-to-b from-atenas-sidebar to-[#001a40] text-center">
            <img src="/mascot-owl.svg" alt="" className="w-24 h-24 mb-4 opacity-60" />
            <p className="text-blue-100 max-w-sm text-sm">
              Cuando tu docente inicie una clase en vivo, verás aquí las preguntas, el chat y el progreso grupal.
            </p>
          </div>

          <aside className="border-t md:border-t-0 md:border-l border-white/10 p-4 space-y-4 bg-black/20">
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wide text-blue-200 mb-2 flex items-center gap-1">
                <Users className="w-4 h-4" /> Participantes
              </h3>
              <p className="text-sm text-blue-100/80">Disponible en una próxima versión</p>
            </div>
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wide text-blue-200 mb-2 flex items-center gap-1">
                <MessageCircle className="w-4 h-4" /> Chat en vivo
              </h3>
              <p className="text-sm text-blue-100/80">Disponible en una próxima versión</p>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
