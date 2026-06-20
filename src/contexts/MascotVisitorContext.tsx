import { createContext, useContext, type ReactNode } from 'react';
import { useAuthContext } from './AuthContext';
import { useEstudianteDashboard } from '../hooks/useEstudianteDashboard';
import { useMascotVisitor } from '../hooks/useMascotVisitor';
import type { MascotTipReason } from '../lib/mascotVisitorTips';

type MascotVisitorContextValue = {
  triggerTip: (reason: MascotTipReason, customMessage?: string) => void;
  visible: boolean;
  message: string;
  dismiss: () => void;
  onPointerEnter: () => void;
  onPointerLeave: () => void;
};

const MascotVisitorContext = createContext<MascotVisitorContextValue | null>(null);

export function MascotVisitorProvider({ children }: { children: ReactNode }) {
  const { profile } = useAuthContext();
  const esEstudiante = profile?.role === 'estudiante';
  const dash = useEstudianteDashboard(esEstudiante);
  const visitor = useMascotVisitor({
    enabled: esEstudiante,
    rachaEnRiesgo: dash.rachaEnRiesgo,
  });

  return (
    <MascotVisitorContext.Provider value={visitor}>{children}</MascotVisitorContext.Provider>
  );
}

export function useMascotVisitorContext(): MascotVisitorContextValue {
  const ctx = useContext(MascotVisitorContext);
  if (!ctx) {
    return {
      triggerTip: () => {},
      visible: false,
      message: '',
      dismiss: () => {},
      onPointerEnter: () => {},
      onPointerLeave: () => {},
    };
  }
  return ctx;
}
