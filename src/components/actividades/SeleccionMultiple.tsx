import { useState } from 'react';
import type { ConfigSeleccionMultiple } from '../../types';

type Props = {
  config: ConfigSeleccionMultiple;
  onSubmit: (respuestas: Record<string, unknown>, puntuacion: number) => void;
  disabled?: boolean;
};

export function SeleccionMultiple({ config, onSubmit, disabled }: Props) {
  const [seleccion, setSeleccion] = useState<number[]>([]);
  const [enviado, setEnviado] = useState(false);

  const toggle = (idx: number) => {
    if (enviado || disabled) return;
    if (config.multiple) {
      setSeleccion((prev) =>
        prev.includes(idx) ? prev.filter((i) => i !== idx) : [...prev, idx]
      );
    } else {
      setSeleccion([idx]);
    }
  };

  const correctas = config.opciones
    .map((o, i) => (o.correcta ? i : -1))
    .filter((i) => i >= 0);
  const maxPuntos = correctas.length || 1;
  const aciertos = seleccion.filter((i) => config.opciones[i].correcta).length;
  const fallos = seleccion.filter((i) => !config.opciones[i].correcta).length;
  const puntuacion = config.multiple
    ? Math.max(0, aciertos - fallos)
    : (seleccion.length === 1 && config.opciones[seleccion[0]].correcta ? 100 : 0);

  const handleSubmit = () => {
    if (enviado || disabled) return;
    setEnviado(true);
    const puntos = config.multiple ? Math.round((Math.max(0, aciertos - fallos) / maxPuntos) * 100) : puntuacion;
    onSubmit({ seleccion }, puntos);
  };

  return (
    <div className="space-y-4">
      <p className="text-lg font-medium text-slate-900">{config.pregunta}</p>
      <ul className="space-y-2">
        {config.opciones.map((op, idx) => (
          <li key={idx}>
            <button
              type="button"
              onClick={() => toggle(idx)}
              disabled={enviado || disabled}
              className={`w-full text-left px-4 py-3 rounded-lg border-2 transition ${
                !enviado
                  ? seleccion.includes(idx)
                    ? 'border-primary-500 bg-primary-50'
                    : 'border-slate-200 hover:border-primary-300'
                  : config.opciones[idx].correcta
                    ? 'border-green-600 bg-green-50'
                    : seleccion.includes(idx)
                      ? 'border-red-500 bg-red-50'
                      : 'border-slate-200'
              }`}
            >
              {op.texto}
              {enviado && config.opciones[idx].correcta && (
                <span className="ml-2 text-green-600">✓ Correcta</span>
              )}
              {enviado && seleccion.includes(idx) && !config.opciones[idx].correcta && (
                <span className="ml-2 text-red-600">✗ Incorrecta</span>
              )}
            </button>
          </li>
        ))}
      </ul>
      {!enviado && (
        <button
          type="button"
          onClick={handleSubmit}
          disabled={disabled || seleccion.length === 0}
          className="btn-primary disabled:opacity-50"
        >
          Enviar respuesta
        </button>
      )}
    </div>
  );
}
