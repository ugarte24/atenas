import { useMemo, useState } from 'react';
import { useProgresoEstudiantes } from '../../hooks/useProgresoEstudiantes';
import { descargarCsv } from '../../lib/exportCsv';

export default function DocenteProgreso() {
  const { estudiantes, loading, error } = useProgresoEstudiantes();
  const [busqueda, setBusqueda] = useState('');

  const filtrados = useMemo(() => {
    const q = busqueda.trim().toLowerCase();
    if (!q) return estudiantes;
    return estudiantes.filter(
      (e) =>
        e.full_name.toLowerCase().includes(q) ||
        e.email.toLowerCase().includes(q)
    );
  }, [estudiantes, busqueda]);

  function exportarCsv() {
    const rows = [
      [
        'Nombre',
        'Email',
        'Actividades',
        'Prom. actividades %',
        'Evaluaciones',
        'Prom. evaluaciones %',
        'Logros estimados',
      ],
      ...filtrados.map((e) => [
        e.full_name,
        e.email,
        String(e.actividadesCompletadas),
        String(e.promedioActividades),
        String(e.evaluacionesCompletadas),
        String(e.promedioEvaluaciones),
        String(e.logrosEstimados),
      ]),
    ];
    descargarCsv(rows, 'progreso-estudiantes.csv');
  }

  if (loading) return <p className="text-slate-600">Cargando progreso...</p>;
  if (error) return <p className="text-red-600">{error}</p>;

  return (
    <div>
      <h2 className="text-xl font-bold text-slate-900 mb-2">Progreso de estudiantes</h2>
      <p className="text-slate-600 text-sm mb-4">
        Resumen de actividades y evaluaciones realizadas por cada estudiante.
      </p>
      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <input
          type="search"
          placeholder="Buscar por nombre o correo…"
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          className="input-field flex-1 max-w-md"
          aria-label="Buscar estudiantes"
        />
        <button
          type="button"
          onClick={exportarCsv}
          className="btn-secondary shrink-0"
          disabled={filtrados.length === 0}
        >
          Exportar CSV
        </button>
      </div>
      <div className="overflow-x-auto rounded-xl border border-slate-200 shadow-card -mx-1 sm:mx-0">
        <table
          className="w-full border-collapse bg-white table-mobile min-w-[640px]"
          aria-describedby="tabla-progreso-desc"
        >
          <caption id="tabla-progreso-desc" className="sr-only">
            Progreso de estudiantes: actividades completadas, promedios y evaluaciones distintas completadas
          </caption>
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200">
              <th scope="col" className="px-3 sm:px-4 py-2.5 sm:py-3 text-left text-xs sm:text-sm font-semibold text-slate-800">
                Estudiante
              </th>
              <th scope="col" className="px-3 sm:px-4 py-2.5 sm:py-3 text-left text-xs sm:text-sm font-semibold text-slate-800 hidden md:table-cell">
                Email
              </th>
              <th scope="col" className="px-2 sm:px-4 py-2.5 sm:py-3 text-center text-xs sm:text-sm font-semibold text-slate-800">
                Act.
              </th>
              <th scope="col" className="px-2 sm:px-4 py-2.5 sm:py-3 text-center text-xs sm:text-sm font-semibold text-slate-800">
                Prom.A
              </th>
              <th scope="col" className="px-2 sm:px-4 py-2.5 sm:py-3 text-center text-xs sm:text-sm font-semibold text-slate-800">
                Eval.
              </th>
              <th scope="col" className="px-2 sm:px-4 py-2.5 sm:py-3 text-center text-xs sm:text-sm font-semibold text-slate-800">
                Prom.E
              </th>
              <th scope="col" className="px-2 sm:px-4 py-2.5 sm:py-3 text-center text-xs sm:text-sm font-semibold text-slate-800">
                Logros
              </th>
            </tr>
          </thead>
          <tbody>
            {filtrados.map((e) => (
              <tr key={e.user_id} className="border-b border-slate-100 last:border-0 hover:bg-slate-50/50">
                <td className="px-3 sm:px-4 py-2.5 sm:py-3 font-medium text-slate-900 text-sm">
                  {e.full_name}
                  <span className="md:hidden block text-xs text-slate-500 font-normal mt-0.5 truncate max-w-[200px]">
                    {e.email}
                  </span>
                </td>
                <td className="px-3 sm:px-4 py-2.5 sm:py-3 text-slate-600 text-xs sm:text-sm hidden md:table-cell">
                  {e.email}
                </td>
                <td className="px-2 sm:px-4 py-2.5 sm:py-3 text-center text-sm">{e.actividadesCompletadas}</td>
                <td className="px-2 sm:px-4 py-2.5 sm:py-3 text-center text-sm">{e.promedioActividades}%</td>
                <td className="px-2 sm:px-4 py-2.5 sm:py-3 text-center text-sm">{e.evaluacionesCompletadas}</td>
                <td className="px-2 sm:px-4 py-2.5 sm:py-3 text-center text-sm">{e.promedioEvaluaciones}%</td>
                <td className="px-2 sm:px-4 py-2.5 sm:py-3 text-center text-sm">
                  {e.logrosEstimados > 0 ? '⭐'.repeat(e.logrosEstimados) : '—'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {estudiantes.length === 0 && (
        <p className="text-slate-500 mt-6">No hay estudiantes registrados.</p>
      )}
      {estudiantes.length > 0 && filtrados.length === 0 && (
        <p className="text-slate-500 mt-4 text-sm">Ningún resultado para la búsqueda.</p>
      )}
    </div>
  );
}
