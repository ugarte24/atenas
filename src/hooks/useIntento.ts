import { useCallback, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useAuthContext } from '../contexts/AuthContext';

export function useIntento(actividadId: string | null) {
  const { user } = useAuthContext();
  const [saving, setSaving] = useState(false);

  const guardarIntento = useCallback(
    async (respuestas: Record<string, unknown>, puntuacion: number) => {
      if (!user || !actividadId) return;
      setSaving(true);
      try {
        await supabase.from('actividad_intentos').upsert(
          {
            user_id: user.id,
            actividad_id: actividadId,
            respuestas,
            puntuacion,
            completado_at: new Date().toISOString(),
          },
          { onConflict: 'user_id,actividad_id' }
        );
      } finally {
        setSaving(false);
      }
    },
    [user, actividadId]
  );

  return { guardarIntento, saving };
}
