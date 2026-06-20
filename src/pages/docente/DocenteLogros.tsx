import { PageHeader } from '../../components/ui/PageHeader';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Alert } from '../../components/ui/Alert';
import { SkeletonLines } from '../../components/ui/Skeleton';
import { useAchievementsAdmin } from '../../hooks/useAchievementsAdmin';

export default function DocenteLogros() {
  const { items, loading, error, setActivo } = useAchievementsAdmin();

  return (
    <div>
      <PageHeader
        title="Logros e insignias"
        description="Activa o desactiva logros del catálogo y consulta cuántos estudiantes los han desbloqueado."
      />

      {error && (
        <Alert tone="error" className="mb-4">
          {error}
        </Alert>
      )}

      {loading ? (
        <SkeletonLines lines={4} />
      ) : items.length === 0 ? (
        <Card className="p-6 text-sm text-atenas-muted">No hay logros en la base de datos. Ejecuta las migraciones de gamificación.</Card>
      ) : (
        <ul className="space-y-3">
          {items.map((a) => (
            <li key={a.id}>
              <Card className="p-4 flex flex-col sm:flex-row sm:items-center gap-3 justify-between">
                <div className="flex gap-3 items-start min-w-0">
                  <span className="text-2xl shrink-0" aria-hidden>
                    {a.icon}
                  </span>
                  <div className="min-w-0">
                    <p className="font-bold text-atenas-ink">{a.title}</p>
                    {a.description && <p className="text-sm text-atenas-muted mt-0.5">{a.description}</p>}
                    <p className="text-xs text-atenas-muted mt-1">
                      Slug: {a.slug} · {a.desbloqueos} desbloqueo{a.desbloqueos === 1 ? '' : 's'}
                    </p>
                  </div>
                </div>
                <Button
                  type="button"
                  variant={a.activo ? 'secondary' : 'primary'}
                  size="sm"
                  className="shrink-0"
                  onClick={() => void setActivo(a.id, !a.activo)}
                >
                  {a.activo ? 'Desactivar' : 'Activar'}
                </Button>
              </Card>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
