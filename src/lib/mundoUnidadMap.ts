export type MundoIsla = {
  id: 1 | 2 | 3;
  label: string;
  shortLabel: string;
  subtitle: string;
  gradient: string;
};

const MUNDOS: MundoIsla[] = [
  {
    id: 1,
    label: 'Isla 1 · Convivencia',
    shortLabel: 'Isla 1',
    subtitle: 'Principios y convivencia',
    gradient: 'from-emerald-500/90 to-teal-600/90',
  },
  {
    id: 2,
    label: 'Isla 2 · Organización',
    shortLabel: 'Isla 2',
    subtitle: 'Organización y territorio',
    gradient: 'from-sky-500/90 to-blue-600/90',
  },
  {
    id: 3,
    label: 'Isla 3 · Invasión europea',
    shortLabel: 'Isla 3',
    subtitle: 'Contacto e historia reciente',
    gradient: 'from-amber-500/90 to-orange-600/90',
  },
];

/** Orden curricular de unidad (1–7) → isla gamificada (1–3) */
export function islaDesdeOrdenUnidad(orden: number): MundoIsla {
  if (orden <= 2) return MUNDOS[0]!;
  if (orden <= 5) return MUNDOS[1]!;
  return MUNDOS[2]!;
}

export function islaDesdeOrdenUnidadSafe(orden: number | null | undefined, fallbackIndex = 0): MundoIsla {
  const num = typeof orden === 'number' && orden > 0 ? orden : fallbackIndex + 1;
  return islaDesdeOrdenUnidad(num);
}

export { MUNDOS };
