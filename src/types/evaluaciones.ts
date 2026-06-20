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
  minutos_limite?: number | null;
  /** Si true, no se muestra la opción correcta al fallar */
  ocultar_respuesta_correcta?: boolean;
  /** Legacy: evaluaciones marcadas como micro-quiz en BD (ya no se muestran aparte) */
  es_micro_quiz?: boolean;
  /** Legacy: ubicación del micro-quiz en la vista de tema */
  micro_ubicacion?: string;
}

export interface EvaluacionIntento {
  id: string;
  user_id: string;
  evaluacion_id: string;
  respuestas: Record<string, unknown>;
  puntuacion: number;
  aprobado: boolean;
  completado_at: string;
  tiempo_segundos?: number | null;
  numero_intento?: number | null;
}
