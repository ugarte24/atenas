import { useMisionesAlumno } from '../hooks/useMisiones';

export default function Progreso() {
  const { misiones, loading, error } = useMisionesAlumno();

  return (
    <div className="max-w-xl mx-auto">
      <header className="mb-6">
        <h1 className="text-2xl font-extrabold text-slate-900">Tu progreso</h1>
        <p className="text-sm text-slate-600">
          Revisa cómo avanzas en las unidades y niveles del Abya Yala.
        </p>
      </header>

      {loading && <p className="text-sm text-slate-600">Cargando progreso…</p>}
      {error && !loading && (
        <p className="text-sm text-red-600">No se pudo cargar tu progreso.</p>
      )}

      {!loading && !error && misiones.length === 0 && (
        <p className="text-sm text-slate-600">
          Aún no tienes progreso registrado. Cuando completes actividades, lo verás aquí.
        </p>
      )}

      {!loading && !error && misiones.length > 0 && (
        <div className="space-y-4">
          {misiones.map((m) => {
            const porcentaje = m.totalPasos
              ? Math.round((m.pasosCompletados / m.totalPasos) * 100)
              : 0;
            return (
              <article
                key={m.id}
                className="card p-4 flex flex-col gap-2 bg-gradient-to-r from-[#E5F9F0] via-white to-[#E5D4FF]"
              >
                <div>
                  <h2 className="text-sm font-semibold text-slate-900">{m.titulo}</h2>
                  {m.descripcion && (
                    <p className="mt-0.5 text-xs text-slate-700 line-clamp-2">
                      {m.descripcion}
                    </p>
                  )}
                </div>
                <div>
                  <div className="w-full h-3 rounded-full bg-slate-200 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-emerald-500 transition-all"
                      style={{ width: `${porcentaje}%` }}
                    />
                  </div>
                  <p className="mt-1 text-[11px] text-slate-600 text-right">
                    {m.pasosCompletados} de {m.totalPasos} pasos · {porcentaje}% completado
                  </p>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}

