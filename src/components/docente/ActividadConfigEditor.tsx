import { useState } from 'react';
import type {
  ActividadTipo,
  ActividadConfig,
  ConfigSeleccionMultiple,
  ConfigRelacionConceptos,
  ConfigMemoria,
  ConfigOrdenarSecuencia,
  ConfigUbicarEnMapa,
} from '../../types';

type Props = {
  tipo: ActividadTipo;
  value: ActividadConfig;
  onChange: (c: ActividadConfig) => void;
  idPrefix?: string;
};

export function ActividadConfigEditor({ tipo, value, onChange, idPrefix = 'cfg' }: Props) {
  if (tipo === 'seleccion_multiple') {
    const c = value as ConfigSeleccionMultiple;
    const opciones = c.opciones ?? [];
    return (
      <div className="space-y-4" role="group" aria-labelledby={`${idPrefix}-sm-title`}>
        <p id={`${idPrefix}-sm-title`} className="sr-only">
          Configuración de selección múltiple
        </p>
        <div>
          <label htmlFor={`${idPrefix}-pregunta`} className="label">
            Pregunta
          </label>
          <input
            id={`${idPrefix}-pregunta`}
            className="input-field"
            value={c.pregunta ?? ''}
            onChange={(e) => onChange({ ...c, pregunta: e.target.value })}
          />
        </div>
        <fieldset>
          <legend className="label">Opciones (marca la correcta)</legend>
          <ul className="space-y-2 list-none m-0 p-0">
            {opciones.map((op, i) => (
              <li key={i} className="flex flex-wrap gap-2 items-center">
                <input
                  type="radio"
                  name={`${idPrefix}-correcta`}
                  checked={op.correcta}
                  onChange={() => {
                    const next = opciones.map((o, j) => ({ ...o, correcta: j === i }));
                    onChange({ ...c, opciones: next });
                  }}
                  aria-label={`Respuesta correcta: opción ${i + 1}`}
                />
                <input
                  className="input-field flex-1 min-w-[160px]"
                  value={op.texto}
                  onChange={(e) => {
                    const next = [...opciones];
                    next[i] = { ...next[i]!, texto: e.target.value };
                    onChange({ ...c, opciones: next });
                  }}
                  aria-label={`Texto opción ${i + 1}`}
                />
                <button
                  type="button"
                  className="text-sm text-red-700 min-h-touch px-2"
                  onClick={() =>
                    onChange({ ...c, opciones: opciones.filter((_, j) => j !== i) })
                  }
                >
                  Quitar
                </button>
              </li>
            ))}
          </ul>
          <button
            type="button"
            className="btn-secondary text-sm mt-2"
            onClick={() =>
              onChange({
                ...c,
                opciones: [...opciones, { texto: '', correcta: opciones.length === 0 }],
              })
            }
          >
            + Opción
          </button>
        </fieldset>
        <label className="flex items-center gap-2 text-sm text-slate-800">
          <input
            type="checkbox"
            checked={c.multiple === true}
            onChange={(e) => onChange({ ...c, multiple: e.target.checked })}
          />
          Varios correctas (opcional)
        </label>
      </div>
    );
  }

  if (tipo === 'memoria') {
    const c = value as ConfigMemoria;
    const parejas = c.parejas ?? [];
    return (
      <div className="space-y-4" role="group" aria-labelledby={`${idPrefix}-mem-title`}>
        <p id={`${idPrefix}-mem-title`} className="sr-only">
          Parejas memoria
        </p>
        {parejas.map((p, i) => (
          <div key={i} className="flex flex-col sm:flex-row gap-2 border border-slate-200 rounded-lg p-3">
            <input
              className="input-field flex-1"
              placeholder="Concepto"
              value={p.concepto}
              onChange={(e) => {
                const n = [...parejas];
                n[i] = { ...n[i]!, concepto: e.target.value };
                onChange({ ...c, parejas: n });
              }}
              aria-label={`Pareja ${i + 1} concepto`}
            />
            <input
              className="input-field flex-1"
              placeholder="Definición"
              value={p.definicion}
              onChange={(e) => {
                const n = [...parejas];
                n[i] = { ...n[i]!, definicion: e.target.value };
                onChange({ ...c, parejas: n });
              }}
              aria-label={`Pareja ${i + 1} definición`}
            />
            <button
              type="button"
              className="text-red-700 text-sm min-h-touch"
              onClick={() => onChange({ ...c, parejas: parejas.filter((_, j) => j !== i) })}
            >
              Quitar
            </button>
          </div>
        ))}
        <button
          type="button"
          className="btn-secondary text-sm"
          onClick={() =>
            onChange({ ...c, parejas: [...parejas, { concepto: '', definicion: '' }] })
          }
        >
          + Pareja
        </button>
      </div>
    );
  }

  if (tipo === 'relacion_conceptos') {
    const c = value as ConfigRelacionConceptos;
    const columnas = c.columnas ?? [];
    return (
      <div className="space-y-4">
        <div>
          <label htmlFor={`${idPrefix}-rel-ins`} className="label">
            Instrucción (opcional)
          </label>
          <input
            id={`${idPrefix}-rel-ins`}
            className="input-field"
            value={c.instruccion ?? ''}
            onChange={(e) => onChange({ ...c, instruccion: e.target.value })}
          />
        </div>
        {columnas.map((col, i) => (
          <div key={i} className="flex flex-col sm:flex-row gap-2">
            <input
              className="input-field flex-1"
              placeholder="Izquierda"
              value={col.izquierda}
              onChange={(e) => {
                const n = [...columnas];
                n[i] = { ...n[i]!, izquierda: e.target.value };
                onChange({ ...c, columnas: n });
              }}
            />
            <input
              className="input-field flex-1"
              placeholder="Derecha"
              value={col.derecha}
              onChange={(e) => {
                const n = [...columnas];
                n[i] = { ...n[i]!, derecha: e.target.value };
                onChange({ ...c, columnas: n });
              }}
            />
            <button
              type="button"
              className="text-red-700 text-sm"
              onClick={() => onChange({ ...c, columnas: columnas.filter((_, j) => j !== i) })}
            >
              Quitar
            </button>
          </div>
        ))}
        <button
          type="button"
          className="btn-secondary text-sm"
          onClick={() =>
            onChange({ ...c, columnas: [...columnas, { izquierda: '', derecha: '' }] })
          }
        >
          + Par
        </button>
      </div>
    );
  }

  if (tipo === 'ordenar_secuencia') {
    const c = value as ConfigOrdenarSecuencia;
    const items = c.items ?? [];
    return (
      <div className="space-y-4">
        <div>
          <label htmlFor={`${idPrefix}-ord-ins`} className="label">
            Instrucción (opcional)
          </label>
          <input
            id={`${idPrefix}-ord-ins`}
            className="input-field"
            value={c.instruccion ?? ''}
            onChange={(e) => onChange({ ...c, instruccion: e.target.value })}
          />
        </div>
        <p className="text-xs text-slate-600">
          Orden correcto: primero arriba, último abajo.
        </p>
        {items.map((it, i) => (
          <div key={i} className="flex gap-2 items-center">
            <span className="text-slate-500 w-6">{i + 1}.</span>
            <input
              className="input-field flex-1"
              value={it}
              onChange={(e) => {
                const n = [...items];
                n[i] = e.target.value;
                onChange({ ...c, items: n });
              }}
            />
            <button
              type="button"
              disabled={i === 0}
              className="min-h-touch px-2 border rounded disabled:opacity-30"
              onClick={() => {
                const n = [...items];
                [n[i - 1], n[i]] = [n[i]!, n[i - 1]!];
                onChange({ ...c, items: n });
              }}
              aria-label="Subir"
            >
              ↑
            </button>
            <button
              type="button"
              disabled={i >= items.length - 1}
              className="min-h-touch px-2 border rounded disabled:opacity-30"
              onClick={() => {
                const n = [...items];
                [n[i + 1], n[i]] = [n[i]!, n[i + 1]!];
                onChange({ ...c, items: n });
              }}
              aria-label="Bajar"
            >
              ↓
            </button>
            <button
              type="button"
              className="text-red-700 text-sm"
              onClick={() => onChange({ ...c, items: items.filter((_, j) => j !== i) })}
            >
              Quitar
            </button>
          </div>
        ))}
        <button
          type="button"
          className="btn-secondary text-sm"
          onClick={() => onChange({ ...c, items: [...items, ''] })}
        >
          + Ítem
        </button>
      </div>
    );
  }

  if (tipo === 'ubicar_en_mapa') {
    const c = value as ConfigUbicarEnMapa;
    const zonas = c.zonas ?? [];
    const elementos = c.elementos ?? [];
    return (
      <div className="space-y-4">
        <div>
          <label htmlFor={`${idPrefix}-map-url`} className="label">
            URL imagen del mapa
          </label>
          <input
            id={`${idPrefix}-map-url`}
            className="input-field"
            value={c.imagenUrl ?? ''}
            onChange={(e) => onChange({ ...c, imagenUrl: e.target.value })}
          />
        </div>
        <fieldset className="border border-slate-200 rounded-lg p-3">
          <legend className="text-sm font-medium px-1">Zonas</legend>
          {zonas.map((z, i) => (
            <div key={z.id || i} className="flex flex-wrap gap-2 mb-2 items-center">
              <input className="input-field w-24" placeholder="id" value={z.id} readOnly />
              <input
                className="input-field flex-1 min-w-[100px]"
                placeholder="Etiqueta"
                value={z.etiqueta}
                onChange={(e) => {
                  const n = [...zonas];
                  n[i] = { ...n[i]!, etiqueta: e.target.value };
                  onChange({ ...c, zonas: n });
                }}
              />
              <button
                type="button"
                className="text-red-700 text-sm"
                onClick={() => {
                  const nid = z.id;
                  onChange({
                    ...c,
                    zonas: zonas.filter((_, j) => j !== i),
                    elementos: elementos.filter((el) => el.zonaCorrectaId !== nid),
                  });
                }}
              >
                Quitar
              </button>
            </div>
          ))}
          <button
            type="button"
            className="btn-secondary text-sm"
            onClick={() => {
              const id = `z${Date.now()}`;
              onChange({ ...c, zonas: [...zonas, { id, etiqueta: '', x: 50, y: 50 }] });
            }}
          >
            + Zona
          </button>
        </fieldset>
        <fieldset className="border border-slate-200 rounded-lg p-3">
          <legend className="text-sm font-medium px-1">Elementos a ubicar</legend>
          {elementos.map((el, i) => (
            <div key={el.id || i} className="flex flex-wrap gap-2 mb-2">
              <input
                className="input-field flex-1 min-w-[120px]"
                placeholder="Etiqueta"
                value={el.etiqueta}
                onChange={(e) => {
                  const n = [...elementos];
                  n[i] = { ...n[i]!, etiqueta: e.target.value };
                  onChange({ ...c, elementos: n });
                }}
              />
              <select
                className="input-field max-w-[180px]"
                value={el.zonaCorrectaId}
                onChange={(e) => {
                  const n = [...elementos];
                  n[i] = { ...n[i]!, zonaCorrectaId: e.target.value };
                  onChange({ ...c, elementos: n });
                }}
                aria-label="Zona correcta"
              >
                <option value="">Zona correcta…</option>
                {zonas.map((z) => (
                  <option key={z.id} value={z.id}>
                    {z.etiqueta || z.id}
                  </option>
                ))}
              </select>
              <button
                type="button"
                className="text-red-700 text-sm"
                onClick={() =>
                  onChange({ ...c, elementos: elementos.filter((_, j) => j !== i) })
                }
              >
                Quitar
              </button>
            </div>
          ))}
          <button
            type="button"
            className="btn-secondary text-sm"
            onClick={() =>
              onChange({
                ...c,
                elementos: [
                  ...elementos,
                  { id: `e${Date.now()}`, etiqueta: '', zonaCorrectaId: zonas[0]?.id ?? '' },
                ],
              })
            }
          >
            + Elemento
          </button>
        </fieldset>
      </div>
    );
  }

  return null;
}

export function ActividadConfigJsonToggle({
  config,
  onApplyJson,
}: {
  config: ActividadConfig;
  onApplyJson: (c: ActividadConfig) => void;
}) {
  const [open, setOpen] = useState(false);
  const [text, setText] = useState(JSON.stringify(config, null, 2));
  const [err, setErr] = useState<string | null>(null);

  return (
    <div className="border border-slate-200 rounded-lg p-3">
      <button
        type="button"
        className="text-sm font-medium text-[#003366]"
        onClick={() => {
          setOpen((o) => !o);
          setText(JSON.stringify(config, null, 2));
          setErr(null);
        }}
        aria-expanded={open}
      >
        {open ? 'Ocultar' : 'Avanzado: editar JSON'}
      </button>
      {open && (
        <div className="mt-3 space-y-2">
          <label htmlFor="act-json-ta" className="sr-only">
            JSON de configuración
          </label>
          <textarea
            id="act-json-ta"
            className="input-field font-mono text-sm min-h-[160px]"
            value={text}
            onChange={(e) => setText(e.target.value)}
          />
          {err && <p className="text-red-700 text-sm">{err}</p>}
          <button
            type="button"
            className="btn-secondary text-sm"
            onClick={() => {
              try {
                const p = JSON.parse(text || '{}') as ActividadConfig;
                onApplyJson(p);
                setErr(null);
              } catch {
                setErr('JSON no válido');
              }
            }}
          >
            Aplicar JSON
          </button>
        </div>
      )}
    </div>
  );
}
