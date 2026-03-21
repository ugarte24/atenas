import { useEffect, useState } from 'react';
import { useUnidades } from '../hooks/useUnidades';
import { useAuthContext } from '../contexts/AuthContext';
import { progresoPorcentajeUnidad } from '../lib/progresoUnidad';
import { UnidadCard } from '../components/UnidadCard';

export default function Unidades() {
  const { user, profile } = useAuthContext();
  const { unidades, loading, error } = useUnidades();
  const [pctByUnit, setPctByUnit] = useState<Record<string, number>>({});

  useEffect(() => {
    if (!user || profile?.role !== 'estudiante' || unidades.length === 0) {
      setPctByUnit({});
      return;
    }
    let cancel = false;
    void (async () => {
      const entries = await Promise.all(
        unidades.map(async (u) => {
          const p = await progresoPorcentajeUnidad(user.id, u.id);
          return [u.id, p] as const;
        })
      );
      if (!cancel) setPctByUnit(Object.fromEntries(entries));
    })();
    return () => {
      cancel = true;
    };
  }, [user, profile?.role, unidades]);

  if (loading) return <p className="text-atenas-muted text-lg">Cargando unidades...</p>;
  if (error) return <p className="text-red-600 text-lg">Algo salió mal. Vuelve a intentarlo.</p>;

  const esEstudiante = profile?.role === 'estudiante';

  return (
    <div className="max-w-6xl mx-auto pb-8">
      <section className="mb-8 border-b border-atenas-mist-border pb-6">
        <p className="text-sm font-semibold text-atenas-muted">Plataforma ATENAS</p>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-atenas-ink mt-1">Contenidos</h1>
        <p className="text-atenas-muted mt-2 max-w-xl text-sm sm:text-base">
          Elige una unidad y sigue tu ruta: cada una tiene temas, actividades y retos para aprender Ciencias
          Sociales.
        </p>
      </section>

      <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 list-none m-0 p-0">
        {unidades.map((u, i) => (
          <li key={u.id}>
            <UnidadCard
              unidad={u}
              listIndex={i}
              progressPct={esEstudiante ? (pctByUnit[u.id] ?? null) : undefined}
            />
          </li>
        ))}
      </ul>

      {unidades.length === 0 && (
        <div className="rounded-2xl border-2 border-dashed border-atenas-mist-border bg-atenas-card p-12 text-center shadow-card">
          <p className="text-4xl mb-3" aria-hidden>
            📚
          </p>
          <p className="text-atenas-muted text-lg">Aún no hay unidades. Tu profesor las publicará pronto.</p>
        </div>
      )}
    </div>
  );
}
