export type ActividadTipo =
  | 'seleccion_multiple'
  | 'relacion_conceptos'
  | 'memoria'
  | 'ordenar_secuencia'
  | 'ubicar_en_mapa';

export interface Actividad {
  id: string;
  tema_id: string;
  tipo: ActividadTipo;
  title: string;
  config: ActividadConfig;
  publicada: boolean;
  orden: number;
  created_at: string;
  updated_at: string;
}

export interface ActividadIntento {
  id: string;
  user_id: string;
  actividad_id: string;
  respuestas: Record<string, unknown>;
  puntuacion: number;
  completado_at: string;
}

// Config por tipo
export interface ConfigSeleccionMultiple {
  pregunta: string;
  opciones: { texto: string; correcta: boolean }[];
  multiple?: boolean; // si true, puede haber varias correctas
}

export interface ConfigRelacionConceptos {
  instruccion?: string;
  columnas: { izquierda: string; derecha: string }[];
}

export interface ConfigMemoria {
  parejas: { concepto: string; definicion: string }[];
}

export interface ConfigOrdenarSecuencia {
  instruccion?: string;
  items: string[]; // en orden correcto
}

export interface ConfigUbicarEnMapa {
  imagenUrl: string;
  zonas: { id: string; etiqueta: string; x: number; y: number }[];
  elementos: { id: string; etiqueta: string; zonaCorrectaId: string }[];
}

export type ActividadConfig =
  | ConfigSeleccionMultiple
  | ConfigRelacionConceptos
  | ConfigMemoria
  | ConfigOrdenarSecuencia
  | ConfigUbicarEnMapa;
