import { useParams, useNavigate } from 'react-router-dom';
import { useEffect, useState, useCallback } from 'react';
import { useEvaluacion } from '../hooks/useEvaluacion';
import { useEvaluacionIntento } from '../hooks/useEvaluacionIntento';
import { Cuestionario, type FeedbackEvaluacion } from '../components/Cuestionario';
import { useAuthContext } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';

export default function EvaluacionView() {
  const { evaluacionId } = useParams<{ evaluacionId: string }>();
  const navigate = useNavigate();
  const { user } = useAuthContext();
  const { evaluacion, loading, error } = useEvaluacion(evaluacionId ?? null);
  const { guardarIntento, saving, error: saveErr, clearError } = useEvaluacionIntento(evaluacionId ?? null);
  const [sesion, setSesion] = useState(0);
  const [intentosCount, setIntentosCount] = useState(0);
  const [mejorPuntuacion, setMejorPuntuacion] = useState<number | null>(null);
  const [ultimoGuardadoOk, setUltimoGuardadoOk] = useState(false);
  const [tickIntentos, setTickIntentos] = useState(0);

  const maxIntentos = evaluacion?.max_intentos ?? null;
  const ilimitado = maxIntentos == null || maxIntentos <= 0;
  const agotado = !ilimitado && maxIntentos != null && intentosCount >= maxIntentos;
  /** Sin intentos al entrar (no mostrar bloqueo si acaba de terminar y debe ver resultado) */
  const soloBloqueoInicial = agotado && !ultimoGuardadoOk;

  useEffect(() => {
    if (!user || !evaluacionId) return;
    let cancelled = false;
    (async () => {
      const { data, error: e } = await supabase
        .from('evaluacion_intentos')
        .select('puntuacion')
        .eq('user_id', user.id)
        .eq('evaluacion_id', evaluacionId);
      if (cancelled || e) return;
      const rows = (data ?? []) as { puntuacion: number }[];
      setIntentosCount(rows.length);
      if (rows.length) {
        setMejorPuntuacion(Math.max(...rows.map((r) => r.puntuacion)));
      } else {
        setMejorPuntuacion(null);
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
      aprobado: boolean
    ) => {
      const ok = await guardarIntento(respuestas, puntuacion, aprobado);
      setUltimoGuardadoOk(ok);
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
    <div className="max-w-2xl mx-auto px-1 sm:px-0">
      <button
        type="button"
        onClick={() => navigate(-1)}
        className="text-sm font-semibold mb-4 min-h-touch flex items-center rounded-xl px-3 -ml-2 transition-colors text-atenas-ink hover:bg-atenas-mist focus:outline-none focus-visible:ring-2 focus-visible:ring-atenas-ink focus-visible:ring-offset-2"
      >
        ← Volver al tema
      </button>
      <div className="mb-6">
        <h1 className="text-page-title font-bold text-atenas-ink">{evaluacion.title}</h1>
        {evaluacion.descripcion && (
          <p className="text-atenas-muted-strong mt-1">{evaluacion.descripcion}</p>
        )}
        <p className="text-sm text-atenas-muted-strong mt-1">
          Para aprobar necesitas al menos <strong>{evaluacion.umbral_aprobado}%</strong>.
        </p>
        {!ilimitado && (
          <p className="text-sm text-atenas-muted-strong mt-1">
            Intentos permitidos: <strong>{maxIntentos}</strong>. Llevas <strong>{intentosCount}</strong>.
          </p>
        )}
        {mejorPuntuacion != null && (
          <p className="text-sm text-atenas-muted-strong mt-1">
            Tu mejor nota hasta ahora: <strong>{mejorPuntuacion}%</strong>
          </p>
        )}
        {modoExamen && (
          <p className="text-sm font-medium text-amber-900 mt-2 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
            Modo examen: tiempo limitado y sin detalle de respuestas al terminar.
          </p>
        )}
      </div>

      {saveErr && (
        <div
          className="mb-4 p-4 rounded-xl bg-red-50 border-2 border-red-300 text-red-900 text-sm"
          role="alert"
        >
          {saveErr}
          <button type="button" className="underline ml-2" onClick={clearError}>
            Cerrar
          </button>
        </div>
      )}

      {soloBloqueoInicial ? (
        <div className="card p-6">
          <p className="text-atenas-muted-strong">
            Has alcanzado el máximo de intentos para esta evaluación.
            {mejorPuntuacion != null && (
              <>
                {' '}
                Tu mejor resultado fue <strong>{mejorPuntuacion}%</strong>.
              </>
            )}
          </p>
          <button type="button" onClick={() => navigate(-1)} className="btn-secondary mt-4">
            Volver al tema
          </button>
        </div>
      ) : (
        <div className="card p-6">
          <Cuestionario
            key={sesion}
            preguntas={preguntas}
            umbralAprobado={evaluacion.umbral_aprobado}
            onSubmit={handleSubmit}
            disabled={saving}
            feedback={feedback}
            minutosExamen={modoExamen ? 30 : 0}
          />
          {ultimoGuardadoOk && (ilimitado || intentosCount < maxIntentos!) && (
            <div className="mt-6 pt-4 border-t border-atenas-mist-border">
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
          )}
        </div>
      )}
    </div>
  );
}
