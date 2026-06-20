import { useParams, useNavigate } from 'react-router-dom';
import { useState, useMemo } from 'react';
import { useActividad } from '../hooks/useActividad';
import { useIntento } from '../hooks/useIntento';
import { useGamificacionEstudiante } from '../hooks/useGamificacionEstudiante';
import { nivelDesdeXp } from '../lib/gamificacion';
import {
  SeleccionMultiple,
  RelacionConceptos,
  Memoria,
  OrdenarSecuencia,
  UbicarEnMapa,
} from '../components/actividades';
import { ParchmentLayout, ParchmentFooter } from '../components/layout/ParchmentLayout';
import { ResultScreen } from '../components/gamification/ResultScreen';
import { LevelUpModal } from '../components/gamification/LevelUpModal';
import { SkeletonLines } from '../components/ui/Skeleton';
import { Alert } from '../components/ui/Alert';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { useMascotVisitorContext } from '../contexts/MascotVisitorContext';
import type { ActividadConfig } from '../types';

export default function ActividadView() {
  const { actividadId } = useParams<{ actividadId: string }>();
  const navigate = useNavigate();
  const { actividad, loading, error } = useActividad(actividadId ?? null);
  const { guardarIntento, saving } = useIntento(actividadId ?? null);
  const { puntos } = useGamificacionEstudiante();
  const { triggerTip } = useMascotVisitorContext();
  const [resultado, setResultado] = useState<{ puntuacion: number } | null>(null);
  const [nivelAnterior] = useState(() => nivelDesdeXp(puntos).nivel);
  const [showLevelUp, setShowLevelUp] = useState(false);

  const nivelActual = useMemo(() => nivelDesdeXp(puntos + (resultado?.puntuacion ?? 0)), [puntos, resultado]);

  const handleSubmit = async (respuestas: Record<string, unknown>, puntuacion: number) => {
    await guardarIntento(respuestas, puntuacion);
    setResultado({ puntuacion });
    triggerTip('post_actividad');
    if (nivelActual.nivel > nivelAnterior) setShowLevelUp(true);
  };

  if (loading || !actividad) {
    return (
      <div className="max-w-2xl mx-auto">
        <SkeletonLines lines={5} />
      </div>
    );
  }
  if (error) {
    return (
      <div className="max-w-md mx-auto space-y-4">
        <Alert tone="error">{error}</Alert>
        <Button type="button" variant="secondary" onClick={() => navigate(-1)}>
          Volver
        </Button>
      </div>
    );
  }
  if (!actividad.publicada) {
    return (
      <Card padding="md" className="max-w-md mx-auto">
        <p className="text-atenas-muted">Esta actividad no está publicada.</p>
        <Button type="button" variant="secondary" className="mt-4" onClick={() => navigate(-1)}>
          Volver
        </Button>
      </Card>
    );
  }

  if (resultado) {
    return (
      <>
        <ResultScreen
          titulo="¡Actividad completada!"
          puntuacion={resultado.puntuacion}
          maxPuntuacion={100}
          onContinuar={() => navigate(-1)}
        />
        <LevelUpModal
          open={showLevelUp}
          xpTotal={puntos + resultado.puntuacion}
          onClose={() => setShowLevelUp(false)}
        />
      </>
    );
  }

  const config = actividad.config as ActividadConfig;

  return (
    <div className="max-w-2xl mx-auto pb-safe">
      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={() => navigate(-1)}
        className="-ml-2 mb-4"
      >
        ← Volver al tema
      </Button>
      <ParchmentLayout
        title={actividad.title}
        subtitle={actividad.tipo.replace(/_/g, ' ')}
        step={1}
        totalSteps={1}
        footer={<ParchmentFooter step={1} totalSteps={1} progress={50} />}
      >
        {actividad.tipo === 'seleccion_multiple' && (
          <SeleccionMultiple
            config={config as import('../types').ConfigSeleccionMultiple}
            onSubmit={handleSubmit}
            disabled={saving}
          />
        )}
        {actividad.tipo === 'relacion_conceptos' && (
          <RelacionConceptos
            config={config as import('../types').ConfigRelacionConceptos}
            onSubmit={handleSubmit}
            disabled={saving}
          />
        )}
        {actividad.tipo === 'memoria' && (
          <Memoria
            config={config as import('../types').ConfigMemoria}
            onSubmit={handleSubmit}
            disabled={saving}
          />
        )}
        {actividad.tipo === 'ordenar_secuencia' && (
          <OrdenarSecuencia
            config={config as import('../types').ConfigOrdenarSecuencia}
            onSubmit={handleSubmit}
            disabled={saving}
          />
        )}
        {actividad.tipo === 'ubicar_en_mapa' && (
          <UbicarEnMapa
            config={config as import('../types').ConfigUbicarEnMapa}
            onSubmit={handleSubmit}
            disabled={saving}
          />
        )}
      </ParchmentLayout>
    </div>
  );
}
