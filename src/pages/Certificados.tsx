import { useMemo, useState } from 'react';
import { useUnidades } from '../hooks/useUnidades';
import { useAuthContext } from '../contexts/AuthContext';
import { useMisionesAlumno } from '../hooks/useMisiones';
import { progresoPorcentajeUnidad } from '../lib/progresoUnidad';
import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { PageHeader } from '../components/ui/PageHeader';
import { SkeletonLines } from '../components/ui/Skeleton';
import { EmptyState } from '../components/ui/EmptyState';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Award, ExternalLink } from 'lucide-react';
import { tituloUnidadConOrden } from '../lib/unidadTitulo';
import { openCertificadoEnVentana } from '../lib/certificadoVentana';

type CertState = Record<string, { pct: number; eligible: boolean }>;

export default function Certificados() {
  const { user, profile } = useAuthContext();
  const { unidades, loading } = useUnidades();
  const { misiones } = useMisionesAlumno();
  const [certs, setCerts] = useState<CertState>({});
  const [loadingPct, setLoadingPct] = useState(true);

  const publicadas = useMemo(() => unidades.filter((u) => u.publicada !== false), [unidades]);

  useEffect(() => {
    if (!user || profile?.role !== 'estudiante') {
      setLoadingPct(false);
      return;
    }
    let c = false;
    void (async () => {
      const next: CertState = {};
      for (const u of publicadas) {
        const umbral = u.certificado_umbral_pct ?? 0;
        const pct = await progresoPorcentajeUnidad(user.id, u.id);
        if (c) return;
        next[u.id] = { pct, eligible: umbral > 0 && pct >= umbral };
      }
      if (!c) {
        setCerts(next);
        setLoadingPct(false);
      }
    })();
    return () => {
      c = true;
    };
  }, [user, profile?.role, publicadas]);

  async function abrirCertificado(titulo: string, pct: number, umbral: number) {
    try {
      await openCertificadoEnVentana({
        nombreEstudiante: profile?.full_name ?? 'Estudiante',
        tituloUnidad: titulo,
        porcentajeUnidad: pct,
        umbralCertificado: umbral,
      });
    } catch (e) {
      console.error(e);
      window.alert(
        e instanceof Error && e.message.includes('emergentes')
          ? e.message
          : 'No se pudo abrir el certificado. Intenta de nuevo.'
      );
    }
  }

  return (
    <div className="max-w-2xl mx-auto">
      <PageHeader title="Certificados" description="Obtén certificados al completar unidades con el umbral requerido." />

      {(loading || loadingPct) && <SkeletonLines lines={3} />}

      {!loading && !loadingPct && publicadas.length === 0 && (
        <EmptyState
          icon={<Award className="w-8 h-8" />}
          title="Sin certificados disponibles"
          description="Cuando haya unidades publicadas con umbral de certificado, aparecerán aquí."
          action={
            <Link to="/unidades" className="btn-secondary inline-flex text-sm">
              Ver unidades
            </Link>
          }
        />
      )}

      {!loading && !loadingPct && publicadas.length > 0 && (
        <div className="space-y-5">
          {publicadas.map((u) => {
            const st = certs[u.id];
            const umbral = u.certificado_umbral_pct ?? 70;
            const titulo = tituloUnidadConOrden(u.orden, u.title);
            const m = misiones.find((x) => x.id === u.id);
            const eligible = st?.eligible ?? false;

            return (
              <Card key={u.id} padding="lg" className="border-2 border-amber-200/80 bg-gradient-to-br from-amber-50 to-white">
                <div className="flex gap-4">
                  <Award className="w-12 h-12 text-amber-600 shrink-0" aria-hidden />
                  <div className="flex-1 min-w-0">
                    <h2 className="font-bold text-atenas-ink">{titulo}</h2>
                    <p className="text-sm text-atenas-muted mt-1">
                      Progreso: {st?.pct ?? 0}% · Umbral: {umbral}%
                    </p>
                    {m && (
                      <p className="text-xs text-atenas-muted mt-1">
                        {m.pasosCompletados}/{m.totalPasos} temas
                      </p>
                    )}
                  </div>
                </div>

                {eligible ? (
                  <div className="mt-4 flex flex-wrap gap-2">
                    <Button
                      type="button"
                      size="sm"
                      onClick={() => abrirCertificado(titulo, st!.pct, umbral)}
                      className="inline-flex items-center gap-2"
                    >
                      <ExternalLink className="w-4 h-4" aria-hidden />
                      Ver certificado
                    </Button>
                  </div>
                ) : (
                  <p className="mt-4 text-sm text-amber-800 font-medium">Completa la unidad para desbloquear el certificado.</p>
                )}
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
