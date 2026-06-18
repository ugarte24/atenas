import { useState, useEffect, useCallback, useRef } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import type { PreguntaEvaluacion } from '../types';
import { Button } from './ui/Button';
import { Card } from './ui/Card';

export type FeedbackEvaluacion = 'completo' | 'errores_sin_solucion' | 'solo_nota';

type Props = {
  preguntas: PreguntaEvaluacion[];
  umbralAprobado: number;
  onSubmit: (
    respuestas: Record<string, unknown>,
    puntuacion: number,
    aprobado: boolean,
    tiempoSegundos?: number
  ) => void | Promise<void>;
  disabled?: boolean;
  /** completo: muestra respuesta correcta si falló; errores_sin_solucion: solo "incorrecto"; solo_nota: sin detalle por pregunta */
  feedback: FeedbackEvaluacion;
  /** Temporizador en minutos (0 = desactivado) */
  minutosExamen?: number;
  /** Notifica el paso actual (1-based) para barra de progreso externa */
  onStepChange?: (step: number, total: number) => void;
};

export function Cuestionario({
  preguntas,
  umbralAprobado,
  onSubmit,
  disabled,
  feedback,
  minutosExamen = 0,
  onStepChange,
}: Props) {
  const [respuestas, setRespuestas] = useState<Record<number, number>>({});
  const [currentIndex, setCurrentIndex] = useState(0);
  const [enviado, setEnviado] = useState(false);
  const [puntuacion, setPuntuacion] = useState(0);
  const [aprobado, setAprobado] = useState(false);
  const [segRestantes, setSegRestantes] = useState<number | null>(
    minutosExamen > 0 ? minutosExamen * 60 : null
  );
  const startedAtRef = useRef(Date.now());

  const total = preguntas.length;
  const esUltima = currentIndex >= total - 1;
  const preguntaActual = preguntas[currentIndex];
  const respondidaActual = respuestas[currentIndex] !== undefined;

  useEffect(() => {
    onStepChange?.(currentIndex + 1, total);
  }, [currentIndex, total, onStepChange]);

  const enviarAutomatico = useCallback(async () => {
    if (enviado || disabled) return;
    const tiempoSegundos = Math.max(1, Math.round((Date.now() - startedAtRef.current) / 1000));
    if (total === 0) {
      setEnviado(true);
      await Promise.resolve(onSubmit({}, 0, false, tiempoSegundos));
      return;
    }
    let aciertos = 0;
    const detalle: Record<string, number> = {};
    preguntas.forEach((p, i) => {
      const sel = respuestas[i];
      detalle[String(i)] = sel ?? -1;
      if (sel !== undefined && p.opciones[sel]?.correcta) aciertos++;
    });
    const puntuacionFinal = Math.round((aciertos / total) * 100);
    const aprobadoFinal = puntuacionFinal >= umbralAprobado;
    setPuntuacion(puntuacionFinal);
    setAprobado(aprobadoFinal);
    setEnviado(true);
    await Promise.resolve(
      onSubmit({ respuestas: detalle }, puntuacionFinal, aprobadoFinal, tiempoSegundos)
    );
  }, [enviado, disabled, preguntas, respuestas, total, umbralAprobado, onSubmit]);

  useEffect(() => {
    if (segRestantes == null || segRestantes <= 0 || enviado) return;
    const t = window.setInterval(() => {
      setSegRestantes((s) => {
        if (s === null || s <= 1) {
          window.clearInterval(t);
          void enviarAutomatico();
          return 0;
        }
        return s - 1;
      });
    }, 1000);
    return () => window.clearInterval(t);
  }, [segRestantes, enviado, enviarAutomatico]);

  const handleSelect = (opcionIdx: number) => {
    if (enviado || disabled) return;
    setRespuestas((prev) => ({ ...prev, [currentIndex]: opcionIdx }));
  };

  const handleAnterior = () => {
    if (currentIndex > 0) setCurrentIndex((i) => i - 1);
  };

  const handleSiguiente = () => {
    if (!respondidaActual || esUltima) return;
    setCurrentIndex((i) => i + 1);
  };

  const handleSubmit = () => {
    if (enviado || disabled || !respondidaActual) return;
    if (!esUltima) {
      setCurrentIndex((i) => i + 1);
      return;
    }
    enviarAutomatico();
  };

  const fmtTiempo = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m}:${sec.toString().padStart(2, '0')}`;
  };

  if (total === 0) {
    return (
      <p className="text-atenas-muted-strong text-lg" role="status">
        Esta evaluación aún no tiene preguntas.
      </p>
    );
  }

  return (
    <div className="space-y-5">
      {segRestantes != null && segRestantes > 0 && !enviado && (
        <div
          className="p-3 sm:p-4 rounded-xl border-2 border-amber-300 bg-amber-50 text-amber-950 font-semibold text-center shadow-card"
          role="timer"
          aria-live="polite"
          aria-atomic="true"
        >
          Tiempo restante: {fmtTiempo(segRestantes)}
        </div>
      )}

      {!enviado && preguntaActual ? (
        <>
          <Card padding="md" className="border-atenas-mist-border">
            <p className="text-xs font-semibold uppercase tracking-wide text-atenas-muted mb-2">
              Pregunta {currentIndex + 1} de {total}
            </p>
            <h2 className="text-lg sm:text-xl font-bold text-atenas-ink leading-snug mb-5">
              {preguntaActual.enunciado}
            </h2>
            <ul
              className="space-y-3 list-none m-0 p-0"
              role="radiogroup"
              aria-label={`Opciones de la pregunta ${currentIndex + 1}`}
            >
              {preguntaActual.opciones.map((op, opcionIdx) => (
                <li key={opcionIdx}>
                  <button
                    type="button"
                    role="radio"
                    aria-checked={respuestas[currentIndex] === opcionIdx}
                    onClick={() => handleSelect(opcionIdx)}
                    disabled={disabled}
                    className={`w-full text-left px-4 py-4 min-h-touch rounded-xl border-2 transition text-base disabled:opacity-70 ${
                      respuestas[currentIndex] === opcionIdx
                        ? 'border-atenas-ink bg-atenas-mist text-atenas-ink'
                        : 'border-atenas-mist-border bg-white hover:border-atenas-ink/40 text-atenas-ink'
                    }`}
                  >
                    {op.texto}
                  </button>
                </li>
              ))}
            </ul>
          </Card>

          <div className="flex flex-col-reverse sm:flex-row sm:items-center sm:justify-between gap-3 pt-1 pb-safe">
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={handleAnterior}
              disabled={disabled || currentIndex === 0}
              className="inline-flex items-center justify-center gap-2 w-full sm:w-auto"
            >
              <ChevronLeft className="w-4 h-4" aria-hidden />
              Anterior
            </Button>

            {esUltima ? (
              <Button
                type="button"
                onClick={handleSubmit}
                disabled={disabled || !respondidaActual}
                fullWidth
                className="sm:w-auto sm:min-w-[12rem]"
              >
                Enviar evaluación
              </Button>
            ) : (
              <Button
                type="button"
                onClick={handleSiguiente}
                disabled={disabled || !respondidaActual}
                fullWidth
                className="sm:w-auto sm:min-w-[12rem] inline-flex items-center justify-center gap-2"
              >
                Siguiente
                <ChevronRight className="w-4 h-4" aria-hidden />
              </Button>
            )}
          </div>

          <p className="text-center text-xs text-atenas-muted">
            {Object.keys(respuestas).length} de {total} respondidas
          </p>
        </>
      ) : enviado ? (
        <div className="space-y-5">
          <div
            className={`p-6 rounded-xl border-2 ${
              aprobado
                ? 'bg-emerald-50 border-emerald-300 text-emerald-950'
                : 'bg-amber-50 border-amber-300 text-amber-950'
            }`}
            role="status"
          >
            <h3 className="text-xl font-bold">
              {aprobado ? 'Aprobado' : 'No alcanzaste el umbral'}
            </h3>
            <p className="mt-2 text-base">
              Tu puntuación: <strong>{puntuacion}%</strong> (mínimo para aprobar: {umbralAprobado}%)
            </p>
          </div>

          {feedback === 'solo_nota' ? (
            <p className="text-atenas-muted text-sm">
              En modo examen no se muestra el detalle por pregunta.
            </p>
          ) : (
            <>
              <h4 className="font-semibold text-atenas-ink text-lg">Revisión</h4>
              {preguntas.map((p, preguntaIdx) => {
                const sel = respuestas[preguntaIdx];
                const correcta = sel !== undefined && p.opciones[sel]?.correcta;
                const indiceCorrecto = p.opciones.findIndex((o) => o.correcta);
                const textoCorrecto =
                  indiceCorrecto >= 0 ? p.opciones[indiceCorrecto]?.texto : null;
                const textoElegido = sel !== undefined ? p.opciones[sel]?.texto : null;
                return (
                  <Card
                    key={preguntaIdx}
                    padding="sm"
                    className={
                      correcta
                        ? 'border-2 border-emerald-400 bg-emerald-50/80'
                        : 'border-2 border-red-300 bg-red-50/80'
                    }
                  >
                    <p className="font-medium text-atenas-ink">
                      {preguntaIdx + 1}. {p.enunciado}
                    </p>
                    <div className="text-sm mt-2 space-y-1 text-atenas-muted-strong">
                      {correcta ? (
                        <>
                          <p className="text-emerald-800 font-medium">Correcto.</p>
                          {textoCorrecto && (
                            <p>
                              Respuesta correcta: <strong className="text-atenas-ink">{textoCorrecto}</strong>
                            </p>
                          )}
                        </>
                      ) : feedback === 'errores_sin_solucion' ? (
                        <>
                          <p className="text-red-900 font-medium">Incorrecto.</p>
                          {textoElegido && (
                            <p>
                              Tu respuesta: <strong className="text-atenas-ink">{textoElegido}</strong>
                            </p>
                          )}
                        </>
                      ) : (
                        <>
                          <p className="text-red-900 font-medium">Incorrecto.</p>
                          {textoElegido && (
                            <p>
                              Tu respuesta: <strong className="text-atenas-ink">{textoElegido}</strong>
                            </p>
                          )}
                          {textoCorrecto && (
                            <p className="text-amber-900">
                              La respuesta correcta es:{' '}
                              <strong className="text-atenas-ink">{textoCorrecto}</strong>
                            </p>
                          )}
                        </>
                      )}
                    </div>
                  </Card>
                );
              })}
            </>
          )}
        </div>
      ) : null}
    </div>
  );
}
