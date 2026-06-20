import { useCallback, useEffect, useRef, useState } from 'react';
import { useLocation } from 'react-router-dom';
import {
  getLastShownAt,
  isMascotRouteBlocked,
  isMascotStudentWelcomeRoute,
  markRachaTipShown,
  markShownNow,
  MASCOT_AUTO_DISMISS_MS,
  MASCOT_EVENT_COOLDOWN_MS,
  MASCOT_FIRST_SHOW_MS,
  MASCOT_MIN_INTERVAL_MS,
  MASCOT_TIMER_INTERVAL_MS,
  pickMascotTip,
  wasRachaTipShownThisSession,
  type MascotTipReason,
} from '../lib/mascotVisitorTips';

type Options = {
  enabled: boolean;
  rachaEnRiesgo?: boolean;
};

type PendingTip = {
  reason: MascotTipReason;
  customMessage?: string;
  isEvent?: boolean;
};

export function useMascotVisitor({ enabled, rachaEnRiesgo = false }: Options) {
  const { pathname } = useLocation();
  const [visible, setVisible] = useState(false);
  const [message, setMessage] = useState('');
  const pausedRef = useRef(false);
  const pendingRef = useRef<PendingTip | null>(null);
  const dismissTimerRef = useRef<number | null>(null);

  const clearDismissTimer = useCallback(() => {
    if (dismissTimerRef.current != null) {
      window.clearTimeout(dismissTimerRef.current);
      dismissTimerRef.current = null;
    }
  }, []);

  const dismiss = useCallback(() => {
    clearDismissTimer();
    setVisible(false);
    pausedRef.current = false;
  }, [clearDismissTimer]);

  const scheduleDismiss = useCallback(() => {
    clearDismissTimer();
    dismissTimerRef.current = window.setTimeout(() => {
      if (!pausedRef.current) setVisible(false);
    }, MASCOT_AUTO_DISMISS_MS);
  }, [clearDismissTimer]);

  const canShowNow = useCallback(
    (isEvent: boolean) => {
      if (!enabled || isMascotRouteBlocked(pathname)) return false;
      const last = getLastShownAt();
      const minGap = isEvent ? MASCOT_EVENT_COOLDOWN_MS : MASCOT_MIN_INTERVAL_MS;
      return Date.now() - last >= minGap;
    },
    [enabled, pathname]
  );

  const showTip = useCallback(
    (reason: MascotTipReason, customMessage?: string) => {
      if (!enabled) return;
      const text = customMessage ?? pickMascotTip(reason);
      setMessage(text);
      setVisible(true);
      pausedRef.current = false;
      markShownNow();
      if (reason === 'racha_en_riesgo') markRachaTipShown();
      scheduleDismiss();
    },
    [enabled, scheduleDismiss]
  );

  const tryShow = useCallback(
    (pending: PendingTip) => {
      if (!canShowNow(!!pending.isEvent)) {
        pendingRef.current = pending;
        return;
      }
      pendingRef.current = null;
      showTip(pending.reason, pending.customMessage);
    },
    [canShowNow, showTip]
  );

  const triggerTip = useCallback(
    (reason: MascotTipReason, customMessage?: string) => {
      const isEvent = reason === 'post_actividad' || reason === 'post_evaluacion_aprobada';
      if (isMascotRouteBlocked(pathname)) {
        pendingRef.current = { reason, customMessage, isEvent };
        return;
      }
      tryShow({ reason, customMessage, isEvent });
    },
    [pathname, tryShow]
  );

  useEffect(() => {
    if (!enabled || !pendingRef.current || isMascotRouteBlocked(pathname)) return;
    tryShow(pendingRef.current);
  }, [enabled, pathname, tryShow]);

  useEffect(() => {
    if (!enabled || visible) return;
    if (!isMascotStudentWelcomeRoute(pathname)) return;
    if (rachaEnRiesgo && !wasRachaTipShownThisSession() && canShowNow(false)) {
      tryShow({ reason: 'racha_en_riesgo' });
    }
  }, [enabled, visible, pathname, rachaEnRiesgo, canShowNow, tryShow]);

  useEffect(() => {
    if (!enabled) return;

    const firstTimer = window.setTimeout(() => {
      if (isMascotRouteBlocked(pathname)) return;
      if (canShowNow(false)) {
        tryShow({ reason: 'timer' });
      }
    }, MASCOT_FIRST_SHOW_MS);

    const interval = window.setInterval(() => {
      if (document.visibilityState !== 'visible') return;
      if (isMascotRouteBlocked(pathname)) return;
      if (canShowNow(false)) {
        tryShow({ reason: 'timer' });
      }
    }, MASCOT_TIMER_INTERVAL_MS);

    return () => {
      window.clearTimeout(firstTimer);
      window.clearInterval(interval);
    };
  }, [enabled, pathname, canShowNow, tryShow]);

  useEffect(() => {
    return () => clearDismissTimer();
  }, [clearDismissTimer]);

  const onPointerEnter = useCallback(() => {
    pausedRef.current = true;
    clearDismissTimer();
  }, [clearDismissTimer]);

  const onPointerLeave = useCallback(() => {
    pausedRef.current = false;
    scheduleDismiss();
  }, [scheduleDismiss]);

  return {
    visible,
    message,
    dismiss,
    triggerTip,
    onPointerEnter,
    onPointerLeave,
  };
}
