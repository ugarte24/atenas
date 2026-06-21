import { useEffect, useRef, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useAuthContext } from '../contexts/AuthContext';
import { useMapRewards } from './useMapRewards';
import { buildUnidadesMapHref } from '../lib/adventureMapDeepLinks';

export type MisionDiaria = {
  id: string;
  titulo: string;
  progreso: number;
  total: number;
  xp: number;
  targetUrl: string;
  completada: boolean;
  xpOtorgada: boolean;
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
  const isStudent = profile?.role === 'estudiante';
  const { awardMission, completedDailyKeys } = useMapRewards(isStudent);
  const [misiones, setMisiones] = useState<MisionDiaria[]>([]);
  const [loading, setLoading] = useState(true);
  const awardedRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    if (!user || !isStudent) {
      setMisiones([]);
      setLoading(false);
      return;
    }

    let cancel = false;

    void (async () => {
      setLoading(true);
      const desde = inicioDiaLocal();
      const hasta = finDiaLocal();

      const [progresoRes, intentosRes, temasRes] = await Promise.all([
        supabase
          .from('progreso_tema')
          .select('tema_id')
          .eq('user_id', user.id)
          .gte('updated_at', desde)
          .lte('updated_at', hasta),
        supabase
          .from('actividad_intentos')
          .select('id, actividad_id, actividades(tema_id)')
          .eq('user_id', user.id)
          .gte('completado_at', desde)
          .lte('completado_at', hasta),
        supabase.from('temas').select('id, unidad_id, orden').order('orden', { ascending: true }),
      ]);

      if (cancel) return;

      const temasHoy = new Set(
        ((progresoRes.data ?? []) as { tema_id: string }[]).map((r) => r.tema_id)
      ).size;
      const actividadesHoy = (intentosRes.data ?? []).length;

      let targetTemaUrl = buildUnidadesMapHref(1);
      const temasAll = (temasRes.data ?? []) as { id: string; unidad_id: string; orden: number }[];
      if (temasAll.length > 0) {
        const firstTema = temasAll[0]!;
        targetTemaUrl = `/temas/${firstTema.id}`;
      }

      let targetActividadUrl = buildUnidadesMapHref(1);
      const intentoRow = (intentosRes.data ?? [])[0] as
        | { actividad_id: string; actividades: { tema_id: string } | { tema_id: string }[] | null }
        | undefined;
      if (intentoRow) {
        targetActividadUrl = `/actividades/${intentoRow.actividad_id}`;
      } else {
        const { data: actPub } = await supabase
          .from('actividades')
          .select('id')
          .eq('publicada', true)
          .limit(1)
          .maybeSingle();
        if (actPub) targetActividadUrl = `/actividades/${(actPub as { id: string }).id}`;
      }

      const defs: Omit<MisionDiaria, 'completada' | 'xpOtorgada'>[] = [
        {
          id: 'd1',
          titulo: 'Estudia al menos 1 tema hoy',
          progreso: temasHoy >= 1 ? 1 : 0,
          total: 1,
          xp: 50,
          targetUrl: targetTemaUrl,
        },
        {
          id: 'd2',
          titulo: 'Completa una actividad',
          progreso: actividadesHoy >= 1 ? 1 : 0,
          total: 1,
          xp: 30,
          targetUrl: targetActividadUrl,
        },
      ];

      const next = defs.map((d) => {
        const completada = d.progreso >= d.total;
        const xpOtorgada = completedDailyKeys.has(d.id);
        return { ...d, completada, xpOtorgada };
      });

      setMisiones(next);
      setLoading(false);

      for (const m of next) {
        if (m.completada && !m.xpOtorgada && !awardedRef.current.has(m.id)) {
          awardedRef.current.add(m.id);
          void awardMission(m.id, m.xp);
        }
      }
    })();

    return () => {
      cancel = true;
    };
  }, [user, isStudent, completedDailyKeys, awardMission]);

  return { misiones, loading };
}
