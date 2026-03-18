import type { ActividadTipo } from '../types';

export type PlantillaActividad = {
  id: string;
  label: string;
  tipo: ActividadTipo;
  tituloSugerido: string;
  configJson: string;
};

export const PLANTILLAS_ACTIVIDADES: PlantillaActividad[] = [
  {
    id: 'sm_capital',
    label: 'Selección múltiple · Capital de país',
    tipo: 'seleccion_multiple',
    tituloSugerido: 'Capital de un país',
    configJson: JSON.stringify(
      {
        pregunta: '¿Cuál es la capital de Bolivia?',
        opciones: [
          { texto: 'La Paz / Sucre', correcta: true },
          { texto: 'Santa Cruz', correcta: false },
          { texto: 'Cochabamba', correcta: false },
        ],
        multiple: false,
      },
      null,
      2
    ),
  },
  {
    id: 'sm_continente',
    label: 'Selección múltiple · Continentes',
    tipo: 'seleccion_multiple',
    tituloSugerido: 'Continentes',
    configJson: JSON.stringify(
      {
        pregunta: '¿Cuál de los siguientes es un continente?',
        opciones: [
          { texto: 'África', correcta: true },
          { texto: 'Brasil', correcta: false },
          { texto: 'Océano Pacífico', correcta: false },
        ],
        multiple: false,
      },
      null,
      2
    ),
  },
  {
    id: 'sm_convivencia',
    label: 'Selección múltiple · Convivencia escolar',
    tipo: 'seleccion_multiple',
    tituloSugerido: 'Convivencia y respeto',
    configJson: JSON.stringify(
      {
        pregunta: '¿Qué acción favorece la convivencia en el aula?',
        opciones: [
          { texto: 'Escuchar las ideas de los demás', correcta: true },
          { texto: 'Burlarse de un compañero', correcta: false },
          { texto: 'Ignorar las normas del grupo', correcta: false },
        ],
        multiple: false,
      },
      null,
      2
    ),
  },
  {
    id: 'rel_sociales',
    label: 'Relación de conceptos · Ciencias Sociales',
    tipo: 'relacion_conceptos',
    tituloSugerido: 'Relaciona conceptos básicos',
    configJson: JSON.stringify(
      {
        instruccion: 'Relaciona cada concepto con su definición.',
        columnas: [
          { izquierda: 'Estado', derecha: 'Organización política de un país' },
          { izquierda: 'Territorio', derecha: 'Superficie que ocupa un país' },
          { izquierda: 'Población', derecha: 'Conjunto de habitantes' },
        ],
      },
      null,
      2
    ),
  },
  {
    id: 'mem_geo',
    label: 'Memoria · Geografía',
    tipo: 'memoria',
    tituloSugerido: 'Memoria: pares geográficos',
    configJson: JSON.stringify(
      {
        parejas: [
          { concepto: 'Océano Pacífico', definicion: 'El océano más grande' },
          { concepto: 'Cordillera', definicion: 'Cadena de montañas' },
          { concepto: 'Río', definicion: 'Curso de agua natural' },
        ],
      },
      null,
      2
    ),
  },
  {
    id: 'orden_historia',
    label: 'Ordenar secuencia · Hechos históricos',
    tipo: 'ordenar_secuencia',
    tituloSugerido: 'Ordena los hechos en el tiempo',
    configJson: JSON.stringify(
      {
        instruccion: 'Ordena de más antiguo a más reciente.',
        items: ['Descubrimiento de América', 'Independencia de Bolivia', 'Constitución actual'],
      },
      null,
      2
    ),
  },
  {
    id: 'mapa_depto',
    label: 'Ubicar en mapa · Departamentos (plantilla)',
    tipo: 'ubicar_en_mapa',
    tituloSugerido: 'Ubica en el mapa',
    configJson: JSON.stringify(
      {
        imagenUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b3/Bolivia_departments_named.png/400px-Bolivia_departments_named.png',
        zonas: [
          { id: 'norte', etiqueta: 'Norte', x: 50, y: 15 },
          { id: 'sur', etiqueta: 'Sur', x: 50, y: 85 },
        ],
        elementos: [
          { id: 'e1', etiqueta: 'La Paz', zonaCorrectaId: 'norte' },
        ],
      },
      null,
      2
    ),
  },
];
