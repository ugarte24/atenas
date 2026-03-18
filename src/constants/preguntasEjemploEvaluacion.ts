import type { PreguntaEvaluacion } from '../types';

export const PREGUNTAS_EJEMPLO_EVALUACION: PreguntaEvaluacion[] = [
  {
    enunciado: '¿Cuál es la capital de Perú?',
    opciones: [
      { texto: 'Lima', correcta: true },
      { texto: 'Cusco', correcta: false },
      { texto: 'Arequipa', correcta: false },
    ],
  },
  {
    enunciado: '¿En qué siglo se declaró la independencia de Perú?',
    opciones: [
      { texto: 'XVIII', correcta: false },
      { texto: 'XIX', correcta: true },
      { texto: 'XX', correcta: false },
    ],
  },
];
