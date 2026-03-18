import { useState, useEffect, useCallback } from 'react';
import type { PreguntaEvaluacion } from '../types';

export type FeedbackEvaluacion = 'completo' | 'errores_sin_solucion' | 'solo_nota';

type Props = {
  preguntas: PreguntaEvaluacion[];
  umbralAprobado: number;
  onSubmit: (
    respuestas: Record<string, unknown>,
    puntuacion: number,
    aprobado: boolean
  ) => void | Promise<void>;
  disabled?: boolean;
  /** completo: muestra respuesta correcta si falló; errores_sin_solucion: solo "incorrecto"; solo_nota: sin detalle por pregunta */
  feedback: FeedbackEvaluacion;
  /** Temporizador en minutos (0 = desactivado) */
  minutosExamen?: number;
};

export function Cuestionario({
  preguntas,
  umbralAprobado,
  onSubmit,
  disabled,
  feedback,
  minutosExamen = 0,
}: Props) {
  const [respuestas, setRespuestas] = useState<Record<number, number>>({});
  const [enviado, setEnviado] = useState(false);
  const [puntuacion, setPuntuacion] = useState(0);
  const [aprobado, setAprobado] = useState(false);
  const [segRestantes, setSegRestantes] = useState<number | null>(
    minutosExamen > 0 ? minutosExamen * 60 : null
  );

  const enviarAutomatico = useCallback(async () => {
    if (enviado || disabled) return;
    const total = preguntas.length;
    if (total === 0) {
      setEnviado(true);
      await Promise.resolve(onSubmit({}, 0, false));
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
    await Promise.resolve(onSubmit({ respuestas: detalle }, puntuacionFinal, aprobadoFinal));
  }, [enviado, disabled, preguntas, respuestas, umbralAprobado, onSubmit]);

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

  const handleSelect = (preguntaIdx: number, opcionIdx: number) => {
    if (enviado || disabled) return;
    setRespuestas((prev) => ({ ...prev, [preguntaIdx]: opcionIdx }));
  };

  const handleSubmit = () => {
    if (enviado || disabled) return;
    enviarAutomatico();
  };

  const todasRespondidas =
    preguntas.length > 0 &&
    preguntas.every((_, i) => respuestas[i] !== undefined);

  if (preguntas.length === 0) {
    return (
      <p className="text-slate-800 text-lg" role="status">
        Esta evaluación aún no tiene preguntas.
      </p>
    );
  }

  const fmtTiempo = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m}:${sec.toString().padStart(2, '0')}`;
  };

  return (
    <div className="space-y-6">
      {segRestantes != null && segRestantes > 0 && !enviado && (
        <div
          className="p-4 rounded-xl border-2 border-amber-300 bg-amber-50 text-amber-950 font-semibold text-center"
          role="timer"
          aria-live="polite"
          aria-atomic="true"
        >
          Tiempo restante: {fmtTiempo(segRestantes)}
        </div>
      )}

      {!enviado ? (
        <>
          {preguntas.map((p, preguntaIdx) => (
            <fieldset
              key={preguntaIdx}
              className="card p-5 sm:p-6 border border-slate-200"
            >
              <legend className="font-semibold text-slate-900 mb-4 text-lg px-1">
                Pregunta {preguntaIdx + 1} de {preguntas.length}: {p.enunciado}
              </legend>
              <ul className="space-y-3 list-none m-0 p-0" role="radiogroup" aria-labelledby={`q-${preguntaIdx}-legend`}>
                <span id={`q-${preguntaIdx}-legend`} className="sr-only">
                  Opciones para pregunta {preguntaIdx + 1}
                </span>
                {p.opciones.map((op, opcionIdx) => (
                  <li key={opcionIdx}>
                    <button
                      type="button"
                      role="radio"
                      aria-checked={respuestas[preguntaIdx] === opcionIdx}
                      onClick={() => handleSelect(preguntaIdx, opcionIdx)}
                      disabled={disabled}
                      className={`w-full text-left px-4 py-4 min-h-touch rounded-xl border-2 transition text-base disabled:opacity-70 ${
                        respuestas[preguntaIdx] === opcionIdx
                          ? 'border-[#003366] bg-[#e6edf5] text-slate-900'
                          : 'border-slate-300 bg-white hover:border-[#003366]/50 text-slate-900'
                      }`}
                    >
                      {op.texto}
                    </button>
                  </li>
                ))}
              </ul>
            </fieldset>
          ))}
          <button
            type="button"
            onClick={handleSubmit}
            disabled={disabled || !todasRespondidas}
            className="btn-primary w-full sm:w-auto min-h-touch px-8 py-4 text-lg disabled:opacity-50"
          >
            Enviar evaluación
          </button>
        </>
      ) : (
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
            <p className="text-slate-700 text-sm">
              En modo examen no se muestra el detalle por pregunta.
            </p>
          ) : (
            <>
              <h4 className="font-semibold text-slate-900 text-lg">Revisión</h4>
              {preguntas.map((p, preguntaIdx) => {
                const sel = respuestas[preguntaIdx];
                const correcta = sel !== undefined && p.opciones[sel]?.correcta;
                const indiceCorrecto = p.opciones.findIndex((o) => o.correcta);
                return (
                  <div
                    key={preguntaIdx}
                    className={`p-4 rounded-xl border-2 ${
                      correcta
                        ? 'border-emerald-400 bg-emerald-50/80'
                        : 'border-red-300 bg-red-50/80'
                    }`}
                  >
                    <p className="font-medium text-slate-900">
                      {preguntaIdx + 1}. {p.enunciado}
                    </p>
                    <p className="text-sm mt-2 text-slate-800">
                      {correcta ? (
                        <span className="text-emerald-800 font-medium">Correcto.</span>
                      ) : feedback === 'errores_sin_solucion' ? (
                        <span className="text-red-900 font-medium">Incorrecto.</span>
                      ) : (
                        <span className="text-amber-900">
                          La respuesta correcta es:{' '}
                          {indiceCorrecto >= 0 ? p.opciones[indiceCorrecto].texto : '—'}
                        </span>
                      )}
                    </p>
                  </div>
                );
              })}
            </>
          )}
        </div>
      )}
    </div>
  );
}
