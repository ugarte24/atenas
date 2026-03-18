import { useState, useMemo } from 'react';
import type { ConfigMemoria } from '../../types';

type Props = {
  config: ConfigMemoria;
  onSubmit: (respuestas: Record<string, unknown>, puntuacion: number) => void;
  disabled?: boolean;
};

type Card = { id: number; text: string; pairId: number; flipped: boolean };

export function Memoria({ config, onSubmit, disabled }: Props) {
  const [enviado, setEnviado] = useState(false);
  const [intentos, setIntentos] = useState(0);
  const [aciertos, setAciertos] = useState(0);

  const cards = useMemo(() => {
    const list: Card[] = [];
    config.parejas.forEach((p, pairId) => {
      list.push({ id: pairId * 2, text: p.concepto, pairId, flipped: false });
      list.push({ id: pairId * 2 + 1, text: p.definicion, pairId, flipped: false });
    });
    return list.sort(() => Math.random() - 0.5);
  }, [config.parejas]);

  const [flippedIds, setFlippedIds] = useState<number[]>([]);
  const [matchedPairs, setMatchedPairs] = useState<Set<number>>(new Set());

  const handleFlip = (id: number) => {
    if (enviado || disabled || flippedIds.length >= 2 || flippedIds.includes(id)) return;
    const card = cards.find((c) => c.id === id);
    if (!card || matchedPairs.has(card.pairId)) return;

    const newFlipped = [...flippedIds, id];
    setFlippedIds(newFlipped);

    if (newFlipped.length === 2) {
      setIntentos((i) => i + 1);
      const [c1, c2] = [cards.find((c) => c.id === newFlipped[0]), cards.find((c) => c.id === newFlipped[1])];
      if (c1 && c2 && c1.pairId === c2.pairId) {
        setMatchedPairs((prev) => new Set([...prev, c1.pairId]));
        setAciertos((a) => a + 1);
      }
      setTimeout(() => setFlippedIds([]), 800);
    }
  };

  const totalPairs = config.parejas.length;
  const allMatched = totalPairs > 0 && matchedPairs.size === totalPairs;
  const puntuacion = totalPairs ? Math.round((matchedPairs.size / totalPairs) * 100) : 0;

  const handleSubmit = () => {
    if (!enviado && (allMatched || intentos >= totalPairs * 2)) {
      setEnviado(true);
      onSubmit({ matchedPairs: [...matchedPairs], intentos, aciertos }, puntuacion);
    }
  };

  return (
    <div className="space-y-4">
      <p className="text-slate-600">Encuentra las parejas. Haz clic en dos tarjetas.</p>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
        {cards.map((card) => {
          const show = flippedIds.includes(card.id) || matchedPairs.has(card.pairId);
          return (
            <button
              key={card.id}
              type="button"
              onClick={() => handleFlip(card.id)}
              disabled={enviado || disabled || matchedPairs.has(card.pairId)}
              className={`min-h-[80px] p-3 rounded-lg border-2 text-sm text-left transition ${
                show
                  ? 'border-primary-500 bg-white'
                  : 'border-slate-200 bg-primary-50 hover:border-primary-300'
              }`}
            >
              {show ? card.text : '?'}
            </button>
          );
        })}
      </div>
      <p className="text-sm text-slate-500">
        Aciertos: {matchedPairs.size} / {totalPairs} · Intentos: {intentos}
      </p>
      {!enviado && (allMatched || intentos >= totalPairs * 2) && (
        <button
          type="button"
          onClick={handleSubmit}
          className="btn-primary"
        >
          Terminar y ver puntuación
        </button>
      )}
      {enviado && (
        <p className="text-lg font-medium text-slate-900">Puntuación: {puntuacion}%</p>
      )}
    </div>
  );
}
