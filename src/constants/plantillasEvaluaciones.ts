import type { PreguntaEvaluacion } from '../types';

export type PlantillaEvaluacion = {
  id: string;
  label: string;
  tituloSugerido: string;
  descripcionSugerida?: string;
  umbral: number;
  preguntas: PreguntaEvaluacion[];
};

const P3_GEO: PreguntaEvaluacion[] = [
  {
    enunciado: '¿Qué es un mapa?',
    opciones: [
      { texto: 'Representación gráfica de un territorio', correcta: true },
      { texto: 'Solo un dibujo decorativo', correcta: false },
      { texto: 'Lista de nombres de ciudades', correcta: false },
    ],
  },
  {
    enunciado: '¿Cuál es un ejemplo de recurso natural?',
    opciones: [
      { texto: 'El agua', correcta: true },
      { texto: 'Un edificio', correcta: false },
      { texto: 'Un autobús', correcta: false },
    ],
  },
  {
    enunciado: 'La diversidad cultural se refiere a…',
    opciones: [
      { texto: 'Variedad de costumbres y lenguas', correcta: true },
      { texto: 'Solo la comida', correcta: false },
      { texto: 'Solo el clima', correcta: false },
    ],
  },
];

const P5_HIST: PreguntaEvaluacion[] = [
  ...P3_GEO,
  {
    enunciado: 'Una fuente histórica primaria puede ser…',
    opciones: [
      { texto: 'Un documento escrito en la época', correcta: true },
      { texto: 'Un resumen hecho hoy por un alumno', correcta: false },
      { texto: 'Una película de ficción', correcta: false },
    ],
  },
  {
    enunciado: 'La independencia implica generalmente…',
    opciones: [
      { texto: 'Dejar de depender de otra potencia', correcta: true },
      { texto: 'Cambiar solo el nombre del país', correcta: false },
      { texto: 'Eliminar las escuelas', correcta: false },
    ],
  },
];

const P7_COMPLETO: PreguntaEvaluacion[] = [
  ...P5_HIST,
  {
    enunciado: 'La participación ciudadana incluye…',
    opciones: [
      { texto: 'Votar y expresar opiniones de forma respetuosa', correcta: true },
      { texto: 'Solo obedecer sin opinar', correcta: false },
      { texto: 'Evitar todo debate', correcta: false },
    ],
  },
  {
    enunciado: 'Un símbolo patrio en muchos países es…',
    opciones: [
      { texto: 'La bandera', correcta: true },
      { texto: 'Un juguete', correcta: false },
      { texto: 'Un edificio cualquiera', correcta: false },
    ],
  },
];

export const PLANTILLAS_EVALUACIONES: PlantillaEvaluacion[] = [
  {
    id: 'quiz3_geo',
    label: 'Quiz corto (3 preguntas) · Geografía y sociedad',
    tituloSugerido: 'Evaluación: conceptos básicos',
    descripcionSugerida: 'Tres preguntas de repaso.',
    umbral: 60,
    preguntas: P3_GEO,
  },
  {
    id: 'quiz5_hist',
    label: 'Quiz medio (5 preguntas) · Geografía e historia',
    tituloSugerido: 'Evaluación: geografía e historia',
    descripcionSugerida: 'Cinco preguntas de repaso.',
    umbral: 70,
    preguntas: P5_HIST,
  },
  {
    id: 'quiz3_estricto',
    label: 'Quiz corto · Umbral 80%',
    tituloSugerido: 'Evaluación (exigente)',
    umbral: 80,
    preguntas: P3_GEO,
  },
  {
    id: 'quiz7_unidad',
    label: 'Quiz largo (7 preguntas) · Repaso de unidad',
    tituloSugerido: 'Evaluación de unidad',
    descripcionSugerida: 'Siete preguntas: geografía, historia y ciudadanía.',
    umbral: 65,
    preguntas: P7_COMPLETO,
  },
];
