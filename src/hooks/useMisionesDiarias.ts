import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useAuthContext } from '../contexts/AuthContext';

export type MisionDiaria = {
  id: string;
  titulo: string;
  progreso: number;
  total: number;
  xp: number;
};

function inicioDiaLocal(): string {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d.toISOString();
}

function finDiaLocal(): string {
  const d = new Date();
  d.setHours(23, 59, 59, 999);
  return d.toISOString();
}

export function useMisionesDiarias() {
  const { user, profile } = useAuthContext();
  const [misiones, setMisiones] = useState<MisionDiaria[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user || profile?.role !== 'estudiante') {
      setMisiones([]);
      setLoading(false);
      return;
    }

    let cancel = false;

    void (async () => {
      setLoading(true);
      const desde = inicioDiaLocal();
      const hasta = finDiaLocal();

      const [progresoRes, intentosRes] = await Promise.all([
        supabase
          .from('progreso_tema')
          .select('tema_id')
          .eq('user_id', user.id)
          .gte('updated_at', desde)
          .lte('updated_at', hasta),
        supabase
          .from('actividad_intentos')
          .select('id')
          .eq('user_id', user.id)
          .gte('completado_at', desde)
          .lte('completado_at', hasta),
      ]);

      if (cancel) return;

      const temasHoy = new Set(
        ((progresoRes.data ?? []) as { tema_id: string }[]).map((r) => r.tema_id)
      ).size;
      const actividadesHoy = (intentosRes.data ?? []).length;

      setMisiones([
        {
          id: 'd1',
          titulo: 'Estudia al menos 1 tema hoy',
          progreso: temasHoy >= 1 ? 1 : 0,
          total: 1,
          xp: 50,
        },
        {
          id: 'd2',
          titulo: 'Completa una actividad',
          progreso: actividadesHoy >= 1 ? 1 : 0,
          total: 1,
          xp: 30,
        },
      ]);
      setLoading(false);
    })();

    return () => {
      cancel = true;
    };
  }, [user, profile?.role]);

  return { misiones, loading };
}
