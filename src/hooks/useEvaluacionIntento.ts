import { useCallback, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useAuthContext } from '../contexts/AuthContext';

export function useEvaluacionIntento(evaluacionId: string | null) {
  const { user } = useAuthContext();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const guardarIntento = useCallback(
    async (
      respuestas: Record<string, unknown>,
      puntuacion: number,
      aprobado: boolean
    ): Promise<boolean> => {
      if (!user || !evaluacionId) return false;
      setSaving(true);
      setError(null);
      try {
        const { error: e } = await supabase.from('evaluacion_intentos').insert({
          user_id: user.id,
          evaluacion_id: evaluacionId,
          respuestas,
          puntuacion,
          aprobado,
          completado_at: new Date().toISOString(),
        });
        if (e) {
          const msg = e.message ?? '';
          if (
            msg.includes('duplicate') ||
            msg.includes('unique') ||
            msg.includes('23505')
          ) {
            setError(
              'Tu base aún tiene un intento único por evaluación. Ejecuta la migración en supabase/migrations/20250318_atenas_features.sql para permitir varios intentos.'
            );
          } else {
            setError(msg);
          }
          return false;
        }
        return true;
      } finally {
        setSaving(false);
      }
    },
    [user, evaluacionId]
  );

  return { guardarIntento, saving, error, clearError: () => setError(null) };
}
