import type {
  ActividadTipo,
  ConfigSeleccionMultiple,
  ConfigRelacionConceptos,
  ConfigMemoria,
  ConfigOrdenarSecuencia,
  ConfigUbicarEnMapa,
} from '../types';

/** JSON de ejemplo por tipo (evita duplicar en formularios docente). */
export const EJEMPLO_CONFIG_ACTIVIDAD: Record<ActividadTipo, string> = {
  seleccion_multiple: JSON.stringify(
    {
      pregunta: '¿Cuál es la capital de Perú?',
      opciones: [
        { texto: 'Lima', correcta: true },
        { texto: 'Cusco', correcta: false },
        { texto: 'Arequipa', correcta: false },
      ],
      multiple: false,
    } as ConfigSeleccionMultiple,
    null,
    2
  ),
  relacion_conceptos: JSON.stringify(
    {
      instruccion: 'Relaciona cada concepto con su definición.',
      columnas: [
        { izquierda: 'Democracia', derecha: 'Gobierno del pueblo' },
        { izquierda: 'República', derecha: 'Estado sin monarca' },
      ],
    } as ConfigRelacionConceptos,
    null,
    2
  ),
  memoria: JSON.stringify(
    {
      parejas: [
        { concepto: 'Continente', definicion: 'Gran extensión de tierra' },
        { concepto: 'Océano', definicion: 'Gran masa de agua salada' },
      ],
    } as ConfigMemoria,
    null,
    2
  ),
  ordenar_secuencia: JSON.stringify(
    {
      instruccion: 'Ordena los eventos cronológicamente.',
      items: ['Independencia', 'Constitución', 'Guerra civil'],
    } as ConfigOrdenarSecuencia,
    null,
    2
  ),
  ubicar_en_mapa: JSON.stringify(
    {
      imagenUrl: 'https://ejemplo.com/mapa.png',
      zonas: [
        { id: 'z1', etiqueta: 'Norte', x: 50, y: 20 },
        { id: 'z2', etiqueta: 'Sur', x: 50, y: 80 },
      ],
      elementos: [{ id: 'e1', etiqueta: 'Lima', zonaCorrectaId: 'z1' }],
    } as ConfigUbicarEnMapa,
    null,
    2
  ),
};
