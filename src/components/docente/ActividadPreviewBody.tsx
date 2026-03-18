import {
  SeleccionMultiple,
  RelacionConceptos,
  Memoria,
  OrdenarSecuencia,
  UbicarEnMapa,
} from '../actividades';
import type { Actividad, ActividadConfig, ConfigSeleccionMultiple, ConfigRelacionConceptos, ConfigMemoria, ConfigOrdenarSecuencia, ConfigUbicarEnMapa } from '../../types';

const noop = () => {};

type Props = {
  actividad: Actividad;
};

export function ActividadPreviewBody({ actividad }: Props) {
  const config = actividad.config as ActividadConfig;

  switch (actividad.tipo) {
    case 'seleccion_multiple':
      return (
        <SeleccionMultiple
          config={config as ConfigSeleccionMultiple}
          onSubmit={noop}
        />
      );
    case 'relacion_conceptos':
      return (
        <RelacionConceptos
          config={config as ConfigRelacionConceptos}
          onSubmit={noop}
        />
      );
    case 'memoria':
      return <Memoria config={config as ConfigMemoria} onSubmit={noop} />;
    case 'ordenar_secuencia':
      return (
        <OrdenarSecuencia
          config={config as ConfigOrdenarSecuencia}
          onSubmit={noop}
        />
      );
    case 'ubicar_en_mapa':
      return (
        <UbicarEnMapa
          config={config as ConfigUbicarEnMapa}
          onSubmit={noop}
        />
      );
    default:
      return (
        <p className="text-slate-600">Tipo de actividad no reconocido para vista previa.</p>
      );
  }
}
