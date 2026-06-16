import { PageHeader } from '../components/ui/PageHeader';
import { Users, MessageCircle, Radio } from 'lucide-react';

/** Vista placeholder de aula en vivo (Fase G — sin backend Realtime aún) */
export default function AulaEnVivo() {
  return (
    <div className="max-w-4xl mx-auto">
      <PageHeader
        title="Aula en vivo"
        description="Sesiones sincrónicas con tu docente. Próximamente con chat y preguntas en tiempo real."
      />

      <div className="rounded-2xl border border-atenas-mist-border bg-atenas-sidebar text-white overflow-hidden shadow-elevated">
        <div className="flex items-center gap-2 px-4 py-3 border-b border-white/10">
          <Radio className="w-4 h-4 text-red-400 animate-pulse" aria-hidden />
          <span className="text-sm font-semibold">Demo · Sin sesión activa</span>
        </div>

        <div className="grid md:grid-cols-[1fr_16rem] gap-0">
          <div className="p-6 min-h-[280px] flex flex-col items-center justify-center bg-gradient-to-b from-atenas-sidebar to-[#001a40] text-center">
            <img src="/mascot-owl.svg" alt="" className="w-24 h-24 mb-4 opacity-80" />
            <p className="text-blue-100 max-w-sm">
              Cuando tu docente inicie una clase en vivo, verás aquí las preguntas, el chat y el progreso grupal.
            </p>
            <div className="mt-6 rounded-2xl bg-white/10 border border-white/20 p-5 max-w-md w-full text-left">
              <p className="text-sm font-bold mb-3">Pregunta del docente (ejemplo)</p>
              <p className="text-sm text-blue-100 mb-4">¿En qué año se fundó la República de Bolivia?</p>
              <button type="button" disabled className="btn-primary w-full opacity-50 cursor-not-allowed">
                Enviar respuesta
              </button>
            </div>
          </div>

          <aside className="border-t md:border-t-0 md:border-l border-white/10 p-4 space-y-4 bg-black/20">
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wide text-blue-200 mb-2 flex items-center gap-1">
                <Users className="w-4 h-4" /> Participantes
              </h3>
              <p className="text-sm text-blue-100/80">Conectados cuando haya sesión activa</p>
            </div>
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wide text-blue-200 mb-2 flex items-center gap-1">
                <MessageCircle className="w-4 h-4" /> Chat en vivo
              </h3>
              <p className="text-sm text-blue-100/80">Disponible en una próxima versión</p>
            </div>
          </aside>
        </div>

        <div className="px-4 py-3 border-t border-white/10 flex items-center gap-4 text-sm">
          <span className="text-blue-200">Progreso de la clase</span>
          <div className="flex-1 h-2 rounded-full bg-white/15 overflow-hidden">
            <div className="h-full w-0 bg-atenas-success rounded-full" />
          </div>
          <span className="text-atenas-gold font-bold">+0 XP</span>
        </div>
      </div>
    </div>
  );
}
