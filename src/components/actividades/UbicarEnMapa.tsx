import { useState } from 'react';
import type { ConfigUbicarEnMapa } from '../../types';

type Props = {
  config: ConfigUbicarEnMapa;
  onSubmit: (respuestas: Record<string, unknown>, puntuacion: number) => void;
  disabled?: boolean;
};

export function UbicarEnMapa({ config, onSubmit, disabled }: Props) {
  const [colocaciones, setColocaciones] = useState<Record<string, string>>({});
  const [enviado, setEnviado] = useState(false);
  const [dragging, setDragging] = useState<string | null>(null);

  const handleDragStart = (elementoId: string) => {
    if (enviado || disabled) return;
    setDragging(elementoId);
  };

  const handleDrop = (zonaId: string) => {
    if (enviado || disabled || !dragging) return;
    setColocaciones((prev) => ({ ...prev, [dragging]: zonaId }));
    setDragging(null);
  };

  const total = config.elementos.length;
  const correctas = total
    ? config.elementos.filter((e) => colocaciones[e.id] === e.zonaCorrectaId).length
    : 0;
  const puntuacion = total ? Math.round((correctas / total) * 100) : 0;

  const handleSubmit = () => {
    if (enviado || disabled || Object.keys(colocaciones).length !== total) return;
    setEnviado(true);
    onSubmit({ colocaciones }, puntuacion);
  };

  return (
    <div className="space-y-4">
      <p className="font-medium">Arrastra cada etiqueta a su zona correcta en el mapa.</p>
      <div className="relative inline-block max-w-full">
        <img
          src={config.imagenUrl}
          alt="Mapa"
          className="max-w-full rounded-lg border"
        />
        {config.zonas.map((z) => (
          <div
            key={z.id}
            onDragOver={(e) => e.preventDefault()}
            onDrop={() => handleDrop(z.id)}
            className="absolute border-2 border-dashed border-slate-400 rounded p-1 min-w-[60px] text-center text-sm bg-white/80"
            style={{ left: `${z.x}%`, top: `${z.y}%`, transform: 'translate(-50%, -50%)' }}
          >
            {z.etiqueta}
          </div>
        ))}
      </div>
      <div className="flex flex-wrap gap-2">
        {config.elementos.map((el) => (
          <span
            key={el.id}
            draggable={!enviado && !disabled}
            onDragStart={() => handleDragStart(el.id)}
            onDragEnd={() => setDragging(null)}
            className={`px-3 py-2 rounded border bg-white ${
              colocaciones[el.id] ? 'opacity-75' : 'cursor-grab'
            } ${dragging === el.id ? 'opacity-50' : ''}`}
          >
            {el.etiqueta}
          </span>
        ))}
      </div>
      <p className="text-sm text-slate-500">
        Colocados: {Object.keys(colocaciones).length} / {total}
      </p>
      {!enviado && (
        <button
          type="button"
          onClick={handleSubmit}
          disabled={disabled || Object.keys(colocaciones).length !== total}
          className="btn-primary disabled:opacity-50"
        >
          Enviar
        </button>
      )}
      {enviado && (
        <p className="text-lg font-medium text-slate-900">
          Puntuación: {puntuacion}% ({correctas} de {total} correctas)
        </p>
      )}
    </div>
  );
}
