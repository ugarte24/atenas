export interface PreguntaEvaluacion {
  enunciado: string;
  opciones: { texto: string; correcta: boolean }[];
}

export interface Evaluacion {
  id: string;
  tema_id: string;
  title: string;
  descripcion: string | null;
  umbral_aprobado: number;
  preguntas: PreguntaEvaluacion[];
  publicada: boolean;
  orden: number;
  created_at: string;
  updated_at: string;
  /** null/undefined = ilimitado */
  max_intentos?: number | null;
  modo_examen?: boolean;
  /** Si true, no se muestra la opción correcta al fallar */
  ocultar_respuesta_correcta?: boolean;
}

export interface EvaluacionIntento {
  id: string;
  user_id: string;
  evaluacion_id: string;
  respuestas: Record<string, unknown>;
  puntuacion: number;
  aprobado: boolean;
  completado_at: string;
}
