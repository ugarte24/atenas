import { useState, useMemo } from 'react';
import type { ConfigOrdenarSecuencia } from '../../types';

type Props = {
  config: ConfigOrdenarSecuencia;
  onSubmit: (respuestas: Record<string, unknown>, puntuacion: number) => void;
  disabled?: boolean;
};

export function OrdenarSecuencia({ config, onSubmit, disabled }: Props) {
  const [orden, setOrden] = useState<number[]>(() =>
    config.items.map((_, i) => i).sort(() => Math.random() - 0.5)
  );
  const [enviado, setEnviado] = useState(false);

  const move = (from: number, to: number) => {
    if (enviado || disabled) return;
    const newOrden = [...orden];
    const [removed] = newOrden.splice(from, 1);
    newOrden.splice(to, 0, removed);
    setOrden(newOrden);
  };

  const correctCount = useMemo(
    () => orden.filter((val, pos) => val === pos).length,
    [orden]
  );
  const total = config.items.length;
  const puntuacion = total ? Math.round((correctCount / total) * 100) : 0;

  const handleSubmit = () => {
    if (enviado || disabled) return;
    setEnviado(true);
    onSubmit({ orden }, puntuacion);
  };

  return (
    <div className="space-y-4">
      {config.instruccion && <p className="text-slate-600">{config.instruccion}</p>}
      <p className="font-medium">Ordena los elementos en el orden correcto.</p>
      <ul className="space-y-2">
        {orden.map((itemIdx, pos) => (
          <li key={pos} className="flex items-center gap-2">
            <span className="text-slate-500 w-6">{pos + 1}.</span>
            <span className="flex-1 p-3 rounded border bg-white">{config.items[itemIdx]}</span>
            {!enviado && !disabled && (
              <>
                <button
                  type="button"
                  onClick={() => move(pos, Math.max(0, pos - 1))}
                  className="px-2 py-1 text-slate-600 hover:bg-slate-100 rounded"
                  aria-label="Subir"
                >
                  ↑
                </button>
                <button
                  type="button"
                  onClick={() => move(pos, Math.min(orden.length - 1, pos + 1))}
                  className="px-2 py-1 text-slate-600 hover:bg-slate-100 rounded"
                  aria-label="Bajar"
                >
                  ↓
                </button>
              </>
            )}
            {enviado && itemIdx === pos && (
              <span className="text-green-600">✓</span>
            )}
            {enviado && itemIdx !== pos && (
              <span className="text-red-600">✗ Correcto: {config.items[pos]}</span>
            )}
          </li>
        ))}
      </ul>
      {!enviado && (
        <button
          type="button"
          onClick={handleSubmit}
          disabled={disabled}
          className="btn-primary disabled:opacity-50"
        >
          Enviar orden
        </button>
      )}
      {enviado && (
        <p className="text-lg font-medium text-slate-900">
          Puntuación: {puntuacion}% ({correctCount} de {total} en orden correcto)
        </p>
      )}
    </div>
  );
}
