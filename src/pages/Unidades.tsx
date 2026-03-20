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

  if (loading) return <p className="text-slate-600 text-lg">Cargando unidades...</p>;
  if (error) return <p className="text-red-600 text-lg">Algo salió mal. Vuelve a intentarlo.</p>;

  const esEstudiante = profile?.role === 'estudiante';

  return (
    <div className="max-w-6xl mx-auto pb-8">
      <section className="mb-8 rounded-3xl bg-gradient-to-r from-[#C6F7D0] via-[#FFE9A9] to-[#C9E7FF] shadow-lg px-5 py-6 sm:px-8 sm:py-7 relative overflow-hidden">
        <div className="absolute -right-8 -top-8 w-36 h-36 rounded-full bg-white/40" />
        <div className="relative">
          <p className="text-sm font-semibold text-slate-700">Plataforma ATENAS</p>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1">Contenidos</h1>
          <p className="text-slate-700 mt-2 max-w-xl">
            Elige una unidad y sigue tu ruta: cada una tiene temas, actividades y retos para aprender Ciencias
            Sociales.
          </p>
        </div>
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
        <div className="rounded-3xl border-2 border-dashed border-slate-200 bg-slate-50 p-12 text-center">
          <p className="text-4xl mb-3" aria-hidden>
            📚
          </p>
          <p className="text-slate-600 text-lg">Aún no hay unidades. Tu profesor las publicará pronto.</p>
        </div>
      )}
    </div>
  );
}
