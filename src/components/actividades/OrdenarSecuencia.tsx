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
  const [draggingPos, setDraggingPos] = useState<number | null>(null);

  const move = (from: number, to: number) => {
    if (enviado || disabled) return;
    const newOrden = [...orden];
    const [removed] = newOrden.splice(from, 1);
    newOrden.splice(to, 0, removed);
    setOrden(newOrden);
  };

  const handleDragStart = (pos: number) => {
    if (enviado || disabled) return;
    setDraggingPos(pos);
  };

  const handleDrop = (targetPos: number) => {
    if (enviado || disabled || draggingPos === null || draggingPos === targetPos) return;
    move(draggingPos, targetPos);
    setDraggingPos(null);
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
      {config.instruccion && <p className="text-atenas-muted">{config.instruccion}</p>}
      <p className="font-medium">Arrastra y suelta los elementos en el orden correcto.</p>
      <ul className="space-y-2">
        {orden.map((itemIdx, pos) => (
          <li
            key={pos}
            className={`flex items-center gap-2 rounded-lg transition ${
              draggingPos === pos ? 'opacity-60' : ''
            }`}
            draggable={!enviado && !disabled}
            onDragStart={() => handleDragStart(pos)}
            onDragEnd={() => setDraggingPos(null)}
            onDragOver={(e) => e.preventDefault()}
            onDrop={() => handleDrop(pos)}
          >
            <span className="text-atenas-muted w-6 cursor-grab" aria-hidden>
              ⋮⋮
            </span>
            <span className="text-atenas-muted w-6">{pos + 1}.</span>
            <span className="flex-1 p-3 rounded border bg-white cursor-grab active:cursor-grabbing">
              {config.items[itemIdx]}
            </span>
            {!enviado && !disabled && (
              <>
                <button
                  type="button"
                  onClick={() => move(pos, Math.max(0, pos - 1))}
                  className="px-2 py-1 text-atenas-muted hover:bg-atenas-mist rounded"
                  aria-label="Subir"
                >
                  ↑
                </button>
                <button
                  type="button"
                  onClick={() => move(pos, Math.min(orden.length - 1, pos + 1))}
                  className="px-2 py-1 text-atenas-muted hover:bg-atenas-mist rounded"
                  aria-label="Bajar"
                >
                  ↓
                </button>
              </>
            )}
            {enviado && itemIdx === pos && <span className="text-green-600">✓</span>}
            {enviado && itemIdx !== pos && (
              <span className="text-red-600 text-sm">✗ Correcto: {config.items[pos]}</span>
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
        <p className="text-lg font-medium text-atenas-ink">
          Puntuación: {puntuacion}% ({correctCount} de {total} en orden correcto)
        </p>
      )}
    </div>
  );
}
