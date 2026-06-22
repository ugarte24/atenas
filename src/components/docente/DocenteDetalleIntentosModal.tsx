import { useEffect, useState, useRef } from 'react';
import { supabase } from '../../lib/supabase';
import { formatTiempoEstudio } from '../../lib/formatTiempo';
import {
  DataTable,
  DataTableBody,
  DataTableHead,
  DataTableRow,
  DataTableShell,
  DataTableTd,
  DataTableTh,
  TableCellStack,
} from '../ui/DataTable';

type Fila = {
  user_id: string;
  full_name: string;
  email: string;
  puntuacion: number;
  completado_at: string | null;
  aprobado?: boolean;
  tiempo_segundos?: number | null;
  numero_intento?: number | null;
};

type Props = {
  tipo: 'actividad' | 'evaluacion';
  itemId: string;
  titulo: string;
  onClose: () => void;
};

export function DocenteDetalleIntentosModal({ tipo, itemId, titulo, onClose }: Props) {
  const closeRef = useRef<HTMLButtonElement>(null);
  const [filas, setFilas] = useState<Fila[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      setErr(null);
      try {
        if (tipo === 'actividad') {
          const { data, error } = await supabase
            .from('actividad_intentos')
            .select('user_id, puntuacion, completado_at')
            .eq('actividad_id', itemId)
            .order('completado_at', { ascending: false });
          if (error) throw error;
          const rows = (data ?? []) as {
            user_id: string;
            puntuacion: number;
            completado_at: string | null;
          }[];
          const ids = [...new Set(rows.map((r) => r.user_id))];
          const map = new Map<string, { full_name: string; email: string }>();
          if (ids.length) {
            const { data: profs, error: e2 } = await supabase
              .from('profiles')
              .select('id, full_name, email')
              .in('id', ids);
            if (e2) throw e2;
            for (const p of (profs ?? []) as { id: string; full_name: string; email: string }[]) {
              map.set(p.id, { full_name: p.full_name, email: p.email });
            }
          }
          if (!cancelled) {
            setFilas(
              rows.map((r) => ({
                ...r,
                full_name: map.get(r.user_id)?.full_name ?? '—',
                email: map.get(r.user_id)?.email ?? '—',
              }))
            );
          }
        } else {
          const { data, error } = await supabase
            .from('evaluacion_intentos')
            .select('user_id, puntuacion, aprobado, completado_at, tiempo_segundos, numero_intento')
            .eq('evaluacion_id', itemId)
            .order('completado_at', { ascending: false });
          if (error) throw error;
          const rows = (data ?? []) as {
            user_id: string;
            puntuacion: number;
            aprobado: boolean;
            completado_at: string | null;
            tiempo_segundos?: number | null;
            numero_intento?: number | null;
          }[];
          const ids = [...new Set(rows.map((r) => r.user_id))];
          const map = new Map<string, { full_name: string; email: string }>();
          if (ids.length) {
            const { data: profs, error: e2 } = await supabase
              .from('profiles')
              .select('id, full_name, email')
              .in('id', ids);
            if (e2) throw e2;
            for (const p of (profs ?? []) as { id: string; full_name: string; email: string }[]) {
              map.set(p.id, { full_name: p.full_name, email: p.email });
            }
          }
          if (!cancelled) {
            setFilas(
              rows.map((r) => ({
                ...r,
                full_name: map.get(r.user_id)?.full_name ?? '—',
                email: map.get(r.user_id)?.email ?? '—',
                aprobado: r.aprobado,
              }))
            );
          }
        }
      } catch (e) {
        if (!cancelled) setErr(e instanceof Error ? e.message : 'Error');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [tipo, itemId]);

  useEffect(() => {
    const t = window.setTimeout(() => closeRef.current?.focus(), 50);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose();
    }
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onClose]);

  function exportarCsv() {
    const sep = ';';
    const head =
      tipo === 'evaluacion'
        ? ['Nombre', 'Email', 'Intento', 'Nota %', 'Tiempo', 'Aprobado', 'Fecha']
        : ['Nombre', 'Email', 'Nota %', 'Fecha'];
    const lines = [head.join(sep)];
    for (const f of filas) {
      const fecha = f.completado_at
        ? new Date(f.completado_at).toLocaleString('es-PE')
        : '';
      if (tipo === 'evaluacion') {
        lines.push(
          [
            f.full_name,
            f.email,
            f.numero_intento != null ? String(f.numero_intento) : '—',
            String(f.puntuacion),
            f.tiempo_segundos != null ? formatTiempoEstudio(f.tiempo_segundos) : '—',
            f.aprobado ? 'Sí' : 'No',
            fecha,
          ]
            .map((c) => `"${String(c).replace(/"/g, '""')}"`)
            .join(sep)
        );
      } else {
        lines.push(
          [f.full_name, f.email, String(f.puntuacion), fecha]
            .map((c) => `"${String(c).replace(/"/g, '""')}"`)
            .join(sep)
        );
      }
    }
    const blob = new Blob(['\ufeff' + lines.join('\n')], { type: 'text/csv;charset=utf-8' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `${tipo}-${titulo.slice(0, 40).replace(/[^\w\s-]/g, '')}.csv`;
    a.click();
    URL.revokeObjectURL(a.href);
  }

  return (
    <div
      className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center p-0 sm:p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="detalle-intentos-titulo"
    >
      <button
        type="button"
        className="absolute inset-0 bg-atenas-ink/50 min-h-full w-full cursor-default border-0"
        aria-label="Cerrar"
        onClick={onClose}
      />
      <div
        className="relative bg-white rounded-t-3xl sm:rounded-xl shadow-elevated w-full max-w-3xl max-h-[90vh] flex flex-col z-10 pb-safe"
        tabIndex={-1}
      >
        <div className="flex items-center justify-between gap-3 px-3 sm:px-4 py-3 border-b border-atenas-mist-border shrink-0">
          <h2 id="detalle-intentos-titulo" className="text-base font-bold text-atenas-ink truncate pr-2">
            Intentos: {titulo}
          </h2>
          <div className="flex gap-2 shrink-0">
            {filas.length > 0 && (
              <button type="button" onClick={exportarCsv} className="btn-secondary text-sm py-2 px-3">
                CSV
              </button>
            )}
            <button
              ref={closeRef}
              type="button"
              onClick={onClose}
              className="btn-secondary text-sm py-2 px-3"
            >
              Cerrar
            </button>
          </div>
        </div>
        <div className="overflow-auto flex-1 p-3 sm:p-4">
          {loading && <p className="text-atenas-muted text-sm">Cargando…</p>}
          {err && <p className="text-red-600 text-sm">{err}</p>}
          {!loading && !err && filas.length === 0 && (
            <p className="text-atenas-muted text-sm">Ningún alumno ha completado aún.</p>
          )}
          {!loading && filas.length > 0 && (
            <DataTableShell>
              <DataTable>
                <DataTableHead>
                  <DataTableRow>
                    <DataTableTh>Alumno</DataTableTh>
                    {tipo === 'evaluacion' && <DataTableTh align="center">Intento</DataTableTh>}
                    <DataTableTh align="center">Nota</DataTableTh>
                    {tipo === 'evaluacion' && (
                      <>
                        <DataTableTh align="center">Tiempo</DataTableTh>
                        <DataTableTh align="center">Aprobado</DataTableTh>
                      </>
                    )}
                    <DataTableTh>Fecha</DataTableTh>
                  </DataTableRow>
                </DataTableHead>
                <DataTableBody>
                  {filas.map((f, i) => (
                    <DataTableRow key={`${f.user_id}-${i}`}>
                      <DataTableTd>
                        <TableCellStack primary={f.full_name} secondary={f.email} />
                      </DataTableTd>
                      {tipo === 'evaluacion' && (
                        <DataTableTd align="center" className="tabular-nums">
                          {f.numero_intento ?? '—'}
                        </DataTableTd>
                      )}
                      <DataTableTd align="center">
                        <span className="font-semibold tabular-nums">{f.puntuacion}%</span>
                      </DataTableTd>
                      {tipo === 'evaluacion' && (
                        <>
                          <DataTableTd align="center" className="text-xs whitespace-nowrap">
                            {f.tiempo_segundos != null
                              ? formatTiempoEstudio(f.tiempo_segundos)
                              : '—'}
                          </DataTableTd>
                          <DataTableTd align="center">
                            {f.aprobado ? (
                              <span className="badge border bg-emerald-50 text-emerald-800 border-emerald-200">
                                Sí
                              </span>
                            ) : (
                              <span className="badge border bg-atenas-page text-atenas-muted border-atenas-mist-border">
                                No
                              </span>
                            )}
                          </DataTableTd>
                        </>
                      )}
                      <DataTableTd className="text-xs text-atenas-muted whitespace-nowrap">
                        {f.completado_at
                          ? new Date(f.completado_at).toLocaleString('es-PE', {
                              dateStyle: 'short',
                              timeStyle: 'short',
                            })
                          : '—'}
                      </DataTableTd>
                    </DataTableRow>
                  ))}
                </DataTableBody>
              </DataTable>
            </DataTableShell>
          )}
        </div>
      </div>
    </div>
  );
}
