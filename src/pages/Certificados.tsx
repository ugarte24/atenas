import { useMemo, useState } from 'react';
import { useUnidades } from '../hooks/useUnidades';
import { useAuthContext } from '../contexts/AuthContext';
import { useMisionesAlumno } from '../hooks/useMisiones';
import { progresoPorcentajeUnidad } from '../lib/progresoUnidad';
import { useEffect } from 'react';
import { PageHeader } from '../components/ui/PageHeader';
import { SkeletonLines } from '../components/ui/Skeleton';
import { Award, Download } from 'lucide-react';
import { tituloUnidadConOrden } from '../lib/unidadTitulo';

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

  async function descargar(titulo: string, pct: number, umbral: number) {
    const { downloadCertificadoPdf } = await import('../lib/certificadoPdf');
    await downloadCertificadoPdf({
      nombreEstudiante: profile?.full_name ?? 'Estudiante',
      tituloUnidad: titulo,
      porcentajeUnidad: pct,
      umbralCertificado: umbral,
    });
  }

  return (
    <div className="max-w-2xl mx-auto">
      <PageHeader title="Certificados" description="Obtén certificados al completar unidades con el umbral requerido." />

      {(loading || loadingPct) && <SkeletonLines lines={3} />}

      {!loading && !loadingPct && (
        <div className="space-y-5">
          {publicadas.map((u) => {
            const st = certs[u.id];
            const umbral = u.certificado_umbral_pct ?? 70;
            const titulo = tituloUnidadConOrden(u.orden, u.title);
            const m = misiones.find((x) => x.id === u.id);
            const eligible = st?.eligible ?? false;

            return (
              <article key={u.id} className="rounded-2xl border-2 border-amber-200/80 bg-gradient-to-br from-amber-50 to-white p-6 shadow-card">
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
                    <button
                      type="button"
                      onClick={() => descargar(titulo, st!.pct, umbral)}
                      className="btn-primary flex items-center gap-2 text-sm"
                    >
                      <Download className="w-4 h-4" aria-hidden />
                      Descargar PDF
                    </button>
                  </div>
                ) : (
                  <p className="mt-4 text-sm text-amber-800 font-medium">Completa la unidad para desbloquear el certificado.</p>
                )}
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}
