import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { BookOpen } from 'lucide-react';
import { useUnidades } from '../hooks/useUnidades';
import { useAuthContext } from '../contexts/AuthContext';
import { progresoPorcentajeUnidad } from '../lib/progresoUnidad';
import { UnidadCard } from '../components/UnidadCard';
import { PageHeader } from '../components/ui/PageHeader';
import { EmptyState } from '../components/ui/EmptyState';
import { SkeletonCard } from '../components/ui/Skeleton';

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

  const esEstudiante = profile?.role === 'estudiante';
  const esDocenteOAdmin = profile?.role === 'docente' || profile?.role === 'admin';

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto">
        <PageHeader eyebrow="Plataforma ATENAS" title="Contenidos" />
        <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 list-none m-0 p-0">
          {[1, 2, 3].map((i) => (
            <li key={i}>
              <SkeletonCard />
            </li>
          ))}
        </ul>
      </div>
    );
  }

  if (error) {
    return (
      <p className="text-red-600 text-lg" role="alert">
        Algo salió mal. Vuelve a intentarlo.
      </p>
    );
  }

  return (
    <div className="max-w-6xl mx-auto pb-8">
      <PageHeader
        eyebrow="Plataforma ATENAS"
        title="Contenidos"
        description={
          esDocenteOAdmin
            ? undefined
            : 'Elige una unidad y sigue tu ruta: cada una tiene temas, actividades y retos para aprender Ciencias Sociales.'
        }
      />
      {esDocenteOAdmin && (
        <p className="text-atenas-muted -mt-4 mb-6 max-w-2xl text-sm sm:text-base">
          Vista previa del recorrido del alumno. Para{' '}
          <strong className="text-atenas-ink font-semibold">crear o editar</strong> contenido usa el{' '}
          <Link to="/docente/contenidos" className="text-atenas-ink font-semibold underline underline-offset-2">
            panel docente
          </Link>
          .
        </p>
      )}

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
        <EmptyState
          icon={<BookOpen className="w-8 h-8" />}
          title="Sin unidades"
          description={
            esDocenteOAdmin
              ? 'Aún no hay unidades cargadas. Créalas desde el panel docente.'
              : 'Aún no hay unidades. Tu profesor las publicará pronto.'
          }
        />
      )}
    </div>
  );
}
