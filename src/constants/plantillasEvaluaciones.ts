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
    enunciado: '¿Qué valor refleja la vida en comunidad antes de la llegada europea?',
    opciones: [
      { texto: 'Solidaridad: ayudarse entre todos', correcta: true },
      { texto: 'Individualismo: cada uno por su cuenta', correcta: false },
      { texto: 'Competencia sin reglas', correcta: false },
    ],
  },
  {
    enunciado: 'En el Abya Yala, ¿qué se considera importante respetar en la vida cotidiana?',
    opciones: [
      { texto: 'La naturaleza y la tierra', correcta: true },
      { texto: 'Solo los objetos materiales', correcta: false },
      { texto: 'Únicamente el dinero', correcta: false },
    ],
  },
  {
    enunciado: '¿Qué busca el equilibrio al usar los recursos?',
    opciones: [
      { texto: 'Tomar solo lo necesario', correcta: true },
      { texto: 'Gastar sin pensar en el futuro', correcta: false },
      { texto: 'Acumular sin compartir', correcta: false },
    ],
  },
];

const P3_ORGANIZACION: PreguntaEvaluacion[] = [
  {
    enunciado: '¿Qué es un ayllu (en términos generales)?',
    opciones: [
      { texto: 'Una comunidad con organización propia', correcta: true },
      { texto: 'Un solo lugar sin vínculos entre familias', correcta: false },
      { texto: 'Un grupo sin normas ni acuerdos', correcta: false },
    ],
  },
  {
    enunciado: '¿Para qué sirven las decisiones y acuerdos comunitarios?',
    opciones: [
      { texto: 'Para organizar la vida de la comunidad', correcta: true },
      { texto: 'Para que cada persona decida sin conversar', correcta: false },
      { texto: 'Para eliminar toda regla', correcta: false },
    ],
  },
  {
    enunciado: '¿Qué rol suele existir en la organización comunitaria?',
    opciones: [
      { texto: 'Autoridades como curacas o líderes', correcta: true },
      { texto: 'Ningún liderazgo ni coordinación', correcta: false },
      { texto: 'Solo reglas individuales sin participación', correcta: false },
    ],
  },
];

const P3_INVASION: PreguntaEvaluacion[] = [
  {
    enunciado: '¿Qué generó, en general, la llegada europea a América?',
    opciones: [
      { texto: 'Conquista y cambios forzados', correcta: true },
      { texto: 'Cero conflictos y ningún cambio', correcta: false },
      { texto: 'Solo intercambio sin consecuencias', correcta: false },
    ],
  },
  {
    enunciado: '¿Qué es un impacto de la conquista sobre los pueblos?',
    opciones: [
      { texto: 'Pérdida de tierras o imposición de nuevas reglas', correcta: true },
      { texto: 'Todo queda igual que antes', correcta: false },
      { texto: 'No hay cambios en la vida diaria', correcta: false },
    ],
  },
  {
    enunciado: 'En este contexto, ¿a qué se refiere la explotación?',
    opciones: [
      { texto: 'Aprovechar el trabajo de otros sin igualdad', correcta: true },
      { texto: 'Compartir recursos con respeto y equilibrio', correcta: false },
      { texto: 'Organizar fiestas sin consecuencias', correcta: false },
    ],
  },
];

const P3_RESISTENCIA: PreguntaEvaluacion[] = [
  {
    enunciado: '¿Cómo se expresa la resistencia cultural?',
    opciones: [
      { texto: 'Mantener tradiciones, conocimientos y lengua', correcta: true },
      { texto: 'Olvidar lo propio para adaptarse sin recordar', correcta: false },
      { texto: 'Dejar de hablar y no enseñar a nadie', correcta: false },
    ],
  },
  {
    enunciado: '¿Por qué fue importante defender territorios y comunidades?',
    opciones: [
      { texto: 'Porque hacen parte de la identidad y la vida', correcta: true },
      { texto: 'Porque no tienen relación con las personas', correcta: false },
      { texto: 'Porque nadie dependía de ellos', correcta: false },
    ],
  },
  {
    enunciado: '¿Qué significa “continuidad histórica”?',
    opciones: [
      { texto: 'Que ideas y formas de vida perduran y cambian', correcta: true },
      { texto: 'Que nada cambia nunca', correcta: false },
      { texto: 'Que no existe el pasado', correcta: false },
    ],
  },
];

const P3_ACTUALIDAD: PreguntaEvaluacion[] = [
  {
    enunciado: '¿Cómo se reconocen los derechos indígenas en la vida diaria?',
    opciones: [
      { texto: 'Respetando cultura, lengua e identidad', correcta: true },
      { texto: 'Ignorando tradiciones para “integrar” a todos igual', correcta: false },
      { texto: 'Borrando la historia para empezar de cero', correcta: false },
    ],
  },
  {
    enunciado: '¿Qué significa recuperar cultura?',
    opciones: [
      { texto: 'Volver a practicar y valorar tradiciones', correcta: true },
      { texto: 'Eliminar lo aprendido antes', correcta: false },
      { texto: 'No enseñar nada a la siguiente generación', correcta: false },
    ],
  },
  {
    enunciado: '¿Qué valor ayuda a mantener equilibrio con el ambiente?',
    opciones: [
      { texto: 'Respeto a la naturaleza y uso responsable', correcta: true },
      { texto: 'Gastar sin pensar en el futuro', correcta: false },
      { texto: 'Usar recursos sin límites', correcta: false },
    ],
  },
];

export const PLANTILLAS_EVALUACIONES: PlantillaEvaluacion[] = [
  {
    id: 'micro_abya_convivencia',
    label: 'Micro-quiz (3 preguntas) · Convivencia Abya Yala',
    tituloSugerido: 'Evaluación: convivencia y valores',
    descripcionSugerida: 'Repaso de solidaridad, respeto a la naturaleza y equilibrio.',
    umbral: 60,
    preguntas: P3_GEO,
  },
  {
    id: 'micro_abya_organizacion',
    label: 'Micro-quiz (3 preguntas) · Organización Abya Yala',
    tituloSugerido: 'Evaluación: organización social',
    descripcionSugerida: 'Repaso sobre ayllu, acuerdos comunitarios y liderazgo.',
    umbral: 70,
    preguntas: P3_ORGANIZACION,
  },
  {
    id: 'micro_abya_invasion',
    label: 'Micro-quiz (3 preguntas) · Invasión europea',
    tituloSugerido: 'Evaluación: cambio y conflicto',
    descripcionSugerida: 'Repaso sobre conquista, impactos y explotación.',
    umbral: 60,
    preguntas: P3_INVASION,
  },
  {
    id: 'micro_abya_resistencia',
    label: 'Micro-quiz (3 preguntas) · Resistencia',
    tituloSugerido: 'Evaluación: resistencia cultural',
    descripcionSugerida: 'Repaso sobre continuidad histórica y defensa de lo propio.',
    umbral: 60,
    preguntas: P3_RESISTENCIA,
  },
  {
    id: 'micro_abya_actualidad',
    label: 'Micro-quiz (3 preguntas) · Actualidad',
    tituloSugerido: 'Evaluación: derechos y recuperación cultural',
    descripcionSugerida: 'Repaso sobre derechos indígenas, recuperación cultural y equilibrio.',
    umbral: 60,
    preguntas: P3_ACTUALIDAD,
  },
];
