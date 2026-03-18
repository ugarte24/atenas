import { useState } from 'react';
import type { ConfigRelacionConceptos } from '../../types';

type Props = {
  config: ConfigRelacionConceptos;
  onSubmit: (respuestas: Record<string, unknown>, puntuacion: number) => void;
  disabled?: boolean;
};

export function RelacionConceptos({ config, onSubmit, disabled }: Props) {
  const [selectedLeft, setSelectedLeft] = useState<number | null>(null);
  const [pairs, setPairs] = useState<Record<number, number>>({});
  const [enviado, setEnviado] = useState(false);

  const shuffle = (arr: number[]) => [...arr].sort(() => Math.random() - 0.5);
  const [ordenDerecha] = useState(() => shuffle(config.columnas.map((_, i) => i)));

  const handleLeftClick = (izqIdx: number) => {
    if (enviado || disabled || pairs[izqIdx] !== undefined) return;
    setSelectedLeft(selectedLeft === izqIdx ? null : izqIdx);
  };

  const handleRightClick = (derPos: number) => {
    if (enviado || disabled || selectedLeft === null) return;
    if (Object.values(pairs).includes(derPos)) return;
    setPairs((prev) => ({ ...prev, [selectedLeft]: derPos }));
    setSelectedLeft(null);
  };

  const total = config.columnas.length;
  const correctCount = total
    ? Object.entries(pairs).filter(([izq, derPos]) => ordenDerecha[derPos] === Number(izq)).length
    : 0;
  const puntuacion = total ? Math.round((correctCount / total) * 100) : 0;

  const handleSubmit = () => {
    if (enviado || disabled || Object.keys(pairs).length !== total) return;
    setEnviado(true);
    onSubmit({ pairs, ordenDerecha }, puntuacion);
  };

  return (
    <div className="space-y-4">
      {config.instruccion && <p className="text-slate-600">{config.instruccion}</p>}
      <p className="font-medium">Relaciona cada concepto con su definición.</p>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          {config.columnas.map((col, i) => (
            <button
              key={i}
              type="button"
              onClick={() => handleLeftClick(i)}
              disabled={enviado || disabled}
              className={`w-full text-left p-3 rounded-lg border-2 transition ${
                selectedLeft === i
                  ? 'border-primary-500 bg-primary-50'
                  : pairs[i] !== undefined
                    ? 'border-slate-300 bg-slate-50'
                    : 'border-slate-200 hover:border-primary-300'
              }`}
            >
              {col.izquierda}
            </button>
          ))}
        </div>
        <div className="space-y-2">
          {ordenDerecha.map((colIdx, pos) => (
            <button
              key={pos}
              type="button"
              onClick={() => handleRightClick(pos)}
              disabled={enviado || disabled}
              className={`w-full text-left p-3 rounded-lg border-2 transition ${
                Object.values(pairs).includes(pos)
                  ? 'border-slate-300 bg-slate-50'
                  : 'border-slate-200 hover:border-primary-300'
              }`}
            >
              {config.columnas[colIdx].derecha}
            </button>
          ))}
        </div>
      </div>
      {!enviado && (
        <button
          type="button"
          onClick={handleSubmit}
          disabled={disabled || Object.keys(pairs).length !== total}
          className="btn-primary disabled:opacity-50"
        >
          Enviar
        </button>
      )}
      {enviado && (
        <p className="text-lg font-medium text-slate-900">
          Puntuación: {puntuacion}% ({correctCount} de {total} correctas)
        </p>
      )}
    </div>
  );
}
