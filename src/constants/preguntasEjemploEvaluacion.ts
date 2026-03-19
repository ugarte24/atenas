import type { PreguntaEvaluacion } from '../types';

export const PREGUNTAS_EJEMPLO_EVALUACION: PreguntaEvaluacion[] = [
  {
    enunciado: '¿Qué valor significa “ayudarse entre todos” en la comunidad?',
    opciones: [
      { texto: 'Solidaridad (ayni/minka)', correcta: true },
      { texto: 'Individualismo (cada uno por su cuenta)', correcta: false },
      { texto: 'Competencia sin reglas', correcta: false },
    ],
  },
  {
    enunciado: '¿Qué busca el equilibrio en el uso de recursos?',
    opciones: [
      { texto: 'Tomar solo lo necesario', correcta: true },
      { texto: 'Gastar sin pensar', correcta: false },
      { texto: 'Acumular sin compartir', correcta: false },
    ],
  },
];
