import { useEffect, useState, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import type { Evaluacion } from '../types';
import { useAuthContext } from '../contexts/AuthContext';
import { useEvaluacionIntento } from '../hooks/useEvaluacionIntento';
import { Cuestionario, type FeedbackEvaluacion } from './Cuestionario';

type Props = {
  evaluacion: Evaluacion;
  /**
   * Si el docente marcó la micro-ubicación como `inicio`, esto ayuda a mostrar el card en el lugar esperado.
   */
  defaultCollapsed?: boolean;
};

export function MicroQuizCard({ evaluacion, defaultCollapsed = true }: Props) {
  const { user } = useAuthContext();
  const { guardarIntento, saving, error: saveErr, clearError } = useEvaluacionIntento(evaluacion.id);

  const [abierto, setAbierto] = useState(!defaultCollapsed);
  const [sesion, setSesion] = useState(0);
  const [intentosCount, setIntentosCount] = useState(0);
  const [mejorPuntuacion, setMejorPuntuacion] = useState<number | null>(null);
  const [ultimoGuardadoOk, setUltimoGuardadoOk] = useState(false);
  const [tickIntentos, setTickIntentos] = useState(0);

  const maxIntentos = evaluacion.max_intentos ?? null;
  const ilimitado = maxIntentos == null || maxIntentos <= 0;
  const agotado = !ilimitado && maxIntentos != null && intentosCount >= maxIntentos;
  const soloBloqueoInicial = agotado && !ultimoGuardadoOk;

  useEffect(() => {
    if (!user) return;
    let cancelled = false;
    void (async () => {
      const { data, error: e } = await supabase
        .from('evaluacion_intentos')
        .select('puntuacion')
        .eq('user_id', user.id)
        .eq('evaluacion_id', evaluacion.id);
      if (cancelled || e) return;
      const rows = (data ?? []) as { puntuacion: number }[];
      setIntentosCount(rows.length);
      if (rows.length) setMejorPuntuacion(Math.max(...rows.map((r) => r.puntuacion)));
      else setMejorPuntuacion(null);
    })();
    return () => {
      cancelled = true;
    };
  }, [user, evaluacion.id, sesion, tickIntentos]);

  const handleSubmit = useCallback(
    async (respuestas: Record<string, unknown>, puntuacion: number, aprobado: boolean) => {
      const ok = await guardarIntento(respuestas, puntuacion, aprobado);
      setUltimoGuardadoOk(ok);
      if (ok) setTickIntentos((t) => t + 1);
    },
    [guardarIntento]
  );

  const modoExamen = evaluacion.modo_examen === true;
  const feedback: FeedbackEvaluacion = modoExamen
    ? 'solo_nota'
    : evaluacion.ocultar_respuesta_correcta === true
      ? 'errores_sin_solucion'
      : 'completo';

  if (!evaluacion.publicada) return null;

  return (
    <section className="card p-4 sm:p-5 border border-[#003366]/20 bg-white">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <h3 className="text-lg font-bold text-slate-900">Reto rápido</h3>
          <p className="text-sm text-slate-600 mt-1 line-clamp-2">{evaluacion.title}</p>
          {evaluacion.descripcion ? <p className="text-xs text-slate-500 mt-1">{evaluacion.descripcion}</p> : null}
        </div>
        <button
          type="button"
          onClick={() => setAbierto((v) => !v)}
          className="btn-secondary min-h-touch px-3"
        >
          {abierto ? 'Cerrar' : 'Responder'}
        </button>
      </div>

      <div className="mt-4">
        {saveErr ? (
          <div
            className="mb-4 p-3 rounded-xl bg-red-50 border-2 border-red-300 text-red-900 text-sm"
            role="alert"
          >
            {saveErr}
            <button type="button" className="underline ml-2" onClick={clearError}>
              Cerrar
            </button>
          </div>
        ) : null}

        {!abierto ? (
          <div className="text-sm text-slate-700">
            {ilimitado ? (
              <span>Cuando quieras, responde y mejora tu puntaje.</span>
            ) : agotado ? (
              <span>
                Has llegado al máximo de intentos. {mejorPuntuacion != null ? `Mejor: ${mejorPuntuacion}%` : ''}
              </span>
            ) : (
              <span>
                Intentos: <strong>{intentosCount}</strong> / <strong>{maxIntentos}</strong>.
              </span>
            )}
          </div>
        ) : soloBloqueoInicial ? (
          <div className="p-4 border border-slate-200 rounded-xl bg-slate-50">
            <p className="text-slate-800 font-semibold">Máximo de intentos alcanzado</p>
            {mejorPuntuacion != null ? (
              <p className="text-sm text-slate-700 mt-1">
                Tu mejor resultado fue <strong>{mejorPuntuacion}%</strong>.
              </p>
            ) : (
              <p className="text-sm text-slate-700 mt-1">Aún no tienes resultados guardados.</p>
            )}
          </div>
        ) : (
          <div className="card p-4 sm:p-5 border border-slate-200 bg-white">
            <div className="mb-3 text-sm text-slate-700">
              Para aprobar necesitas al menos <strong>{evaluacion.umbral_aprobado}%</strong>.
              {!ilimitado ? (
                <>
                  {' '}
                  Intentos permitidos: <strong>{maxIntentos}</strong>. Llevas{' '}
                  <strong>{intentosCount}</strong>.
                </>
              ) : null}
              {modoExamen ? (
                <div className="mt-2 text-amber-900 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2 font-medium">
                  Modo examen: tiempo limitado y sin detalle de respuestas al terminar.
                </div>
              ) : null}
            </div>

            <Cuestionario
              key={sesion}
              preguntas={Array.isArray(evaluacion.preguntas) ? evaluacion.preguntas : []}
              umbralAprobado={evaluacion.umbral_aprobado}
              onSubmit={handleSubmit}
              disabled={saving}
              feedback={feedback}
              minutosExamen={modoExamen ? 30 : 0}
            />

            {ultimoGuardadoOk && (ilimitado || intentosCount < maxIntentos!) ? (
              <div className="mt-6 pt-4 border-t border-slate-200">
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={() => {
                    setUltimoGuardadoOk(false);
                    clearError();
                    setSesion((s) => s + 1);
                  }}
                >
                  Hacer otro intento
                </button>
              </div>
            ) : null}
          </div>
        )}
      </div>
    </section>
  );
}

