import { useParams, useNavigate } from 'react-router-dom';
import { useEffect, useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle2 } from 'lucide-react';
import { useEvaluacion } from '../hooks/useEvaluacion';
import { useEvaluacionIntento } from '../hooks/useEvaluacionIntento';
import { Cuestionario, type FeedbackEvaluacion } from '../components/Cuestionario';
import { ParchmentLayout, ParchmentFooter } from '../components/layout/ParchmentLayout';
import { useAuthContext } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { formatMaxIntentos } from '../hooks/useResumenEvaluacionesUsuario';
import { useMotionSafe } from '../hooks/useMotionSafe';
import { ConfettiBurst } from '../components/motion/ConfettiBurst';

export default function EvaluacionView() {
  const { evaluacionId } = useParams<{ evaluacionId: string }>();
  const navigate = useNavigate();
  const { user } = useAuthContext();
  const { reduceMotion, spring } = useMotionSafe();
  const { evaluacion, loading, error } = useEvaluacion(evaluacionId ?? null);
  const { guardarIntento, saving, error: saveErr, clearError } = useEvaluacionIntento(evaluacionId ?? null);
  const [sesion, setSesion] = useState(0);
  const [preguntaActual, setPreguntaActual] = useState(1);
  const [intentosCount, setIntentosCount] = useState(0);
  const [mejorPuntuacion, setMejorPuntuacion] = useState<number | null>(null);
  const [yaAprobado, setYaAprobado] = useState(false);
  const [ultimoGuardadoOk, setUltimoGuardadoOk] = useState(false);
  const [ultimoIntentoAprobado, setUltimoIntentoAprobado] = useState(false);
  const [tickIntentos, setTickIntentos] = useState(0);

  const maxIntentos = evaluacion?.max_intentos ?? null;
  const ilimitado = maxIntentos == null || maxIntentos <= 0;
  const agotado = !ilimitado && maxIntentos != null && intentosCount >= maxIntentos;
  /** Bloqueo al entrar: ya aprobó o agotó intentos (salvo que acaba de terminar y debe ver resultado) */
  const soloBloqueoInicial = (yaAprobado || agotado) && !ultimoGuardadoOk;
  const puedeReintentar =
    !yaAprobado &&
    !ultimoIntentoAprobado &&
    (ilimitado || (maxIntentos != null && intentosCount < maxIntentos));

  useEffect(() => {
    if (!user || !evaluacionId) return;
    let cancelled = false;
    (async () => {
      const { data, error: e } = await supabase
        .from('evaluacion_intentos')
        .select('puntuacion, aprobado')
        .eq('user_id', user.id)
        .eq('evaluacion_id', evaluacionId);
      if (cancelled || e) return;
      const rows = (data ?? []) as { puntuacion: number; aprobado: boolean }[];
      setIntentosCount(rows.length);
      if (rows.length) {
        setMejorPuntuacion(Math.max(...rows.map((r) => r.puntuacion)));
        setYaAprobado(rows.some((r) => r.aprobado));
      } else {
        setMejorPuntuacion(null);
        setYaAprobado(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [user, evaluacionId, sesion, tickIntentos]);

  const handleSubmit = useCallback(
    async (
      respuestas: Record<string, unknown>,
      puntuacion: number,
      aprobado: boolean,
      tiempoSegundos?: number
    ) => {
      const ok = await guardarIntento(respuestas, puntuacion, aprobado, tiempoSegundos);
      setUltimoGuardadoOk(ok);
      setUltimoIntentoAprobado(aprobado);
      if (ok) setTickIntentos((t) => t + 1);
    },
    [guardarIntento]
  );

  if (loading || !evaluacion) {
    return (
      <p className="text-atenas-muted-strong" role="status">
        Cargando evaluación...
      </p>
    );
  }
  if (error) {
    return <p className="text-red-800 font-medium">{error}</p>;
  }
  if (!evaluacion.publicada) {
    return (
      <div className="card p-6 max-w-md">
        <p className="text-atenas-muted-strong">Esta evaluación no está publicada.</p>
        <button type="button" onClick={() => navigate(-1)} className="btn-secondary mt-4">
          Volver
        </button>
      </div>
    );
  }

  const preguntas = Array.isArray(evaluacion.preguntas) ? evaluacion.preguntas : [];
  const modoExamen = evaluacion.modo_examen === true;
  const feedback: FeedbackEvaluacion = modoExamen
    ? 'solo_nota'
    : evaluacion.ocultar_respuesta_correcta === true
      ? 'errores_sin_solucion'
      : 'completo';

  return (
    <div className="max-w-lg mx-auto px-1 sm:px-0 pb-24">
      <button
        type="button"
        onClick={() => navigate(-1)}
        className="text-sm font-semibold mb-4 min-h-touch flex items-center rounded-xl px-3 -ml-2 text-atenas-ink hover:bg-atenas-mist"
      >
        ← Volver al tema
      </button>

      {saveErr && (
        <div className="mb-4 p-4 rounded-xl bg-red-50 border-2 border-red-300 text-red-900 text-sm" role="alert">
          {saveErr}
          <button type="button" className="underline ml-2" onClick={clearError}>
            Cerrar
          </button>
        </div>
      )}

      {soloBloqueoInicial ? (
        <div className="card p-6 relative overflow-hidden">
          {yaAprobado && (
            <ConfettiBurst className="pointer-events-none absolute inset-0 overflow-hidden z-0" />
          )}
          <motion.div
            className="relative z-10"
            initial={reduceMotion ? false : { opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={spring}
          >
            {yaAprobado ? (
              <>
                <motion.div
                  initial={reduceMotion ? false : { scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={spring}
                >
                  <CheckCircle2 className="w-12 h-12 text-emerald-600 mb-3" aria-hidden />
                </motion.div>
                <p className="text-emerald-900 font-semibold text-lg">Evaluación completada</p>
                <p className="text-atenas-muted-strong mt-2">
                  Ya aprobaste esta evaluación.
                  {mejorPuntuacion != null && (
                    <>
                      {' '}
                      Tu mejor nota: <strong>{mejorPuntuacion}%</strong>.
                    </>
                  )}
                </p>
              </>
            ) : (
              <p className="text-atenas-muted-strong">
                Has alcanzado el máximo de intentos para esta evaluación.
                {mejorPuntuacion != null && (
                  <>
                    {' '}
                    Tu mejor resultado fue <strong>{mejorPuntuacion}%</strong>.
                  </>
                )}
              </p>
            )}
            <button type="button" onClick={() => navigate(-1)} className="btn-secondary mt-4">
              Volver al tema
            </button>
          </motion.div>
        </div>
      ) : (
        <ParchmentLayout
          title={evaluacion.title}
          subtitle={evaluacion.descripcion ?? undefined}
          step={preguntaActual}
          totalSteps={preguntas.length}
          footer={
            <ParchmentFooter
              step={preguntaActual}
              totalSteps={preguntas.length}
              progress={preguntas.length ? Math.round((preguntaActual / preguntas.length) * 100) : 0}
            />
          }
        >
          <p className="text-sm text-amber-900/80 mb-5">
            Para aprobar: <strong>{evaluacion.umbral_aprobado}%</strong>
            {' · '}
            Intentos:{' '}
            {ilimitado
              ? intentosCount > 0
                ? `${intentosCount} (ilimitados)`
                : formatMaxIntentos(maxIntentos)
              : `${intentosCount}/${maxIntentos}`}
          </p>
          {intentosCount > 0 && !ultimoGuardadoOk && !yaAprobado && (
            <div className="mb-5 p-4 rounded-xl border border-sky-200 bg-sky-50 text-sm text-sky-950">
              Llevas {intentosCount} {intentosCount === 1 ? 'intento' : 'intentos'}.
              {mejorPuntuacion != null && (
                <>
                  {' '}
                  Tu mejor nota: <strong>{mejorPuntuacion}%</strong>.
                </>
              )}
              {!ilimitado && maxIntentos != null && (
                <>
                  {' '}
                  Te {maxIntentos - intentosCount === 1 ? 'queda' : 'quedan'}{' '}
                  <strong>{maxIntentos - intentosCount}</strong>{' '}
                  {maxIntentos - intentosCount === 1 ? 'intento' : 'intentos'}.
                </>
              )}
            </div>
          )}
          {modoExamen && (
            <p className="text-sm font-medium text-amber-900 mb-4 bg-amber-100/50 border border-amber-200 rounded-lg px-3 py-2">
              Modo examen activo.
            </p>
          )}
          <Cuestionario
            key={sesion}
            preguntas={preguntas}
            umbralAprobado={evaluacion.umbral_aprobado}
            onSubmit={handleSubmit}
            disabled={saving}
            feedback={feedback}
            minutosExamen={modoExamen ? (evaluacion.minutos_limite ?? 30) : 0}
            onStepChange={(step) => setPreguntaActual(step)}
          />
          {ultimoGuardadoOk && puedeReintentar && (
            <div className="mt-6 pt-4 border-t border-amber-200/50">
              <button
                type="button"
                className="btn-secondary"
                onClick={() => {
                  setUltimoGuardadoOk(false);
                  setUltimoIntentoAprobado(false);
                  clearError();
                  setPreguntaActual(1);
                  setSesion((s) => s + 1);
                }}
              >
                Hacer otro intento
              </button>
            </div>
          )}
        </ParchmentLayout>
      )}
    </div>
  );
}
