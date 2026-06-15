import { useCallback, useEffect, useRef } from 'react';
import { supabase } from '../lib/supabase';
import { useAuthContext } from '../contexts/AuthContext';

const HEARTBEAT_MS = 30_000;

async function acumularTiempo(userId: string, temaId: string, segundos: number) {
  if (segundos <= 0) return;
  const { data } = await supabase
    .from('progreso_tema')
    .select('porcentaje, completado, tiempo_estudio_segundos')
    .eq('user_id', userId)
    .eq('tema_id', temaId)
    .maybeSingle();

  const prev = (data as { tiempo_estudio_segundos?: number } | null)?.tiempo_estudio_segundos ?? 0;
  const row = data as { porcentaje?: number; completado?: boolean } | null;

  await supabase.from('progreso_tema').upsert(
    {
      user_id: userId,
      tema_id: temaId,
      porcentaje: row?.porcentaje ?? 0,
      completado: row?.completado ?? false,
      tiempo_estudio_segundos: prev + segundos,
    },
    { onConflict: 'user_id,tema_id' }
  );
}

/** Registra tiempo de estudio mientras el estudiante permanece en un tema. */
export function useTiempoEstudio(temaId: string | null) {
  const { user, profile } = useAuthContext();
  const lastVisibleAt = useRef<number | null>(null);
  const pendingRef = useRef(0);

  const flush = useCallback(
    async (extraSeconds = 0) => {
      if (!user || profile?.role !== 'estudiante' || !temaId) return;
      const total = pendingRef.current + extraSeconds;
      pendingRef.current = 0;
      if (total > 0) await acumularTiempo(user.id, temaId, total);
    },
    [user, profile?.role, temaId]
  );

  useEffect(() => {
    if (!temaId || profile?.role !== 'estudiante' || !user) return;

    const markVisible = () => {
      if (document.visibilityState === 'visible') {
        lastVisibleAt.current = Date.now();
      } else if (lastVisibleAt.current != null) {
        const delta = Math.floor((Date.now() - lastVisibleAt.current) / 1000);
        lastVisibleAt.current = null;
        if (delta > 0) pendingRef.current += delta;
        void flush();
      }
    };

    lastVisibleAt.current = Date.now();

    const interval = window.setInterval(() => {
      if (document.visibilityState !== 'visible' || lastVisibleAt.current == null) return;
      const now = Date.now();
      const delta = Math.floor((now - lastVisibleAt.current) / 1000);
      lastVisibleAt.current = now;
      if (delta > 0) pendingRef.current += delta;
      if (pendingRef.current >= 30) void flush();
    }, HEARTBEAT_MS);

    document.addEventListener('visibilitychange', markVisible);
    const onPageHide = () => {
      if (lastVisibleAt.current != null) {
        const delta = Math.floor((Date.now() - lastVisibleAt.current) / 1000);
        lastVisibleAt.current = null;
        if (delta > 0) pendingRef.current += delta;
      }
      void flush();
    };
    window.addEventListener('pagehide', onPageHide);

    return () => {
      window.clearInterval(interval);
      document.removeEventListener('visibilitychange', markVisible);
      window.removeEventListener('pagehide', onPageHide);
      if (lastVisibleAt.current != null) {
        const delta = Math.floor((Date.now() - lastVisibleAt.current) / 1000);
        if (delta > 0) pendingRef.current += delta;
      }
      void flush();
    };
  }, [temaId, profile?.role, user, flush]);
}
