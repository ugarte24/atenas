import { useParams, useNavigate } from 'react-router-dom';
import { useActividad } from '../hooks/useActividad';
import { useIntento } from '../hooks/useIntento';
import {
  SeleccionMultiple,
  RelacionConceptos,
  Memoria,
  OrdenarSecuencia,
  UbicarEnMapa,
} from '../components/actividades';
import type { ActividadConfig } from '../types';

export default function ActividadView() {
  const { actividadId } = useParams<{ actividadId: string }>();
  const navigate = useNavigate();
  const { actividad, loading, error } = useActividad(actividadId ?? null);
  const { guardarIntento, saving } = useIntento(actividadId ?? null);

  const handleSubmit = (respuestas: Record<string, unknown>, puntuacion: number) => {
    guardarIntento(respuestas, puntuacion);
  };

  if (loading || !actividad) {
    return <p className="text-slate-600">Cargando actividad...</p>;
  }
  if (error) {
    return <p className="text-red-600">{error}</p>;
  }
  if (!actividad.publicada) {
    return (
      <div className="card p-6 max-w-md">
        <p className="text-slate-600">Esta actividad no está publicada.</p>
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="btn-secondary mt-4"
        >
          Volver
        </button>
      </div>
    );
  }

  const config = actividad.config as ActividadConfig;

  return (
    <div className="max-w-2xl mx-auto">
      <button
        type="button"
        onClick={() => navigate(-1)}
        className="text-sm font-medium mb-4 min-h-touch flex items-center rounded-lg px-2 -ml-2 transition-colors hover:bg-[#e6edf5]"
 style={{ color: '#003366' }}
      >
        ← Volver al tema
      </button>
      <h1 className="text-page-title font-bold text-slate-900 mb-6">{actividad.title}</h1>
      <div className="card p-6">
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
      </div>
    </div>
  );
}
