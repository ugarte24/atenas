import { Link, useParams, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { useUnidad } from '../hooks/useUnidad';
import { useTemas } from '../hooks/useTemas';
import { useAuthContext } from '../contexts/AuthContext';
import { usuarioCumplePrerequisitoTema } from '../lib/prerequisitoTema';
import { progresoPorcentajeUnidad } from '../lib/progresoUnidad';
import { UnidadHero } from '../components/UnidadHero';
import { UnidadMediaBlock } from '../components/UnidadMediaBlock';
import { UnidadIntroExtended } from '../components/UnidadIntroExtended';
import { resolveAccentColor } from '../lib/unidadVisual';
import { buildCertificadoPrintDocument } from '../lib/certificadoPrintHtml';

export default function UnidadTemas() {
  const { unidadId } = useParams<{ unidadId: string }>();
  const navigate = useNavigate();
  const { user, profile } = useAuthContext();
  const nombreEstudiante = profile?.full_name ?? 'Estudiante';
  const { unidad, loading: loadingUnidad } = useUnidad(unidadId ?? null);
  const { temas, loading } = useTemas(unidadId ?? null);
  const [bloqueoTema, setBloqueoTema] = useState<Record<string, boolean>>({});
  const [pctUnidad, setPctUnidad] = useState<number | null>(null);

  useEffect(() => {
    if (!user || profile?.role !== 'estudiante' || !temas.length) {
      setBloqueoTema({});
      return;
    }
    let cancel = false;
    void (async () => {
      const next: Record<string, boolean> = {};
      for (const t of temas) {
        if (!t.prerequisito_tema_id) next[t.id] = false;
        else {
          const ok = await usuarioCumplePrerequisitoTema(user.id, t.prerequisito_tema_id);
          if (cancel) return;
          next[t.id] = !ok;
        }
      }
      if (!cancel) setBloqueoTema(next);
    })();
    return () => {
      cancel = true;
    };
  }, [user, profile?.role, temas]);

  useEffect(() => {
    if (!user || profile?.role !== 'estudiante' || !unidadId) {
      setPctUnidad(null);
      return;
    }
    let c = false;
    progresoPorcentajeUnidad(user.id, unidadId).then((p) => {
      if (!c) setPctUnidad(p);
    });
    return () => {
      c = true;
    };
  }, [user, profile?.role, unidadId, temas.length]);

  if (loadingUnidad || !unidad) {
    return <p className="text-atenas-muted text-lg">Cargando...</p>;
  }

  const umbralCert = unidad.certificado_umbral_pct;
  const mostrarCert =
    profile?.role === 'estudiante' &&
    umbralCert != null &&
    umbralCert > 0 &&
    pctUnidad != null &&
    pctUnidad >= umbralCert;

  const accent = resolveAccentColor(unidad.accent_color);
  const heroIndex = unidad.orden ?? 0;

  return (
    <div>
      <button
        type="button"
        onClick={() => navigate('/unidades')}
        className="text-sm font-semibold mb-4 min-h-touch flex items-center rounded-xl px-3 -ml-2 transition-colors text-atenas-ink hover:bg-atenas-mist focus:outline-none focus-visible:ring-2 focus-visible:ring-atenas-ink focus-visible:ring-offset-2"
      >
        ← Volver a unidades
      </button>

      <UnidadHero unidad={unidad} listIndex={heroIndex}>
        {profile?.role === 'estudiante' && pctUnidad != null && (
          <p className="relative text-white/95 text-sm mt-3 font-medium">
            Tu progreso en la unidad: <strong>{pctUnidad}%</strong>
          </p>
        )}
      </UnidadHero>

      <UnidadMediaBlock coverVideoUrl={unidad.cover_video_url} className="mb-8" />

      <UnidadIntroExtended text={unidad.intro_extended} />

      {mostrarCert && (
        <div className="mb-6">
          <button
            type="button"
            className="btn-primary"
            onClick={() => {
              const w = window.open('', '_blank');
              if (!w) return;
              w.document.write(
                buildCertificadoPrintDocument({
                  nombreEstudiante: nombreEstudiante,
                  tituloUnidad: unidad.title,
                  porcentajeUnidad: pctUnidad ?? 0,
                  umbralCertificado: umbralCert ?? 0,
                })
              );
              w.document.close();
            }}
          >
            Descargar o imprimir certificado
          </button>
        </div>
      )}

      {loading ? (
        <p className="text-atenas-muted text-lg">Cargando temas...</p>
      ) : (
        <ul className="space-y-3 list-none m-0 p-0">
          {temas.map((t, i) => {
            const bloqueado = bloqueoTema[t.id] === true;
            return (
              <li key={t.id}>
                {bloqueado ? (
                  <div
                    className="flex items-center gap-4 p-5 rounded-2xl border-2 border-atenas-mist-border bg-atenas-mist/80 opacity-95"
                    aria-disabled="true"
                  >
                    <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 bg-slate-500 text-white font-bold">
                      {i + 1}
                    </div>
                    <div>
                      <h2 className="text-lg font-bold text-atenas-muted-strong">{t.title}</h2>
                      <p className="text-sm text-atenas-muted mt-1">
                        Completa el tema anterior para desbloquear.
                      </p>
                    </div>
                  </div>
                ) : (
                  <Link
                    to={`/temas/${t.id}`}
                    className="flex items-center gap-4 p-5 rounded-2xl focus:outline-none focus-visible:ring-2 focus-visible:ring-atenas-ink focus-visible:ring-offset-2 border-2 border-atenas-mist-border bg-white shadow-card hover:shadow-card-hover transition-shadow"
                  >
                    <div
                      className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 text-white font-bold text-lg"
                      style={{ backgroundColor: accent }}
                    >
                      {i + 1}
                    </div>
                    <h2 className="text-lg font-bold text-atenas-ink">{t.title}</h2>
                  </Link>
                )}
              </li>
            );
          })}
        </ul>
      )}

      {temas.length === 0 && !loading && (
        <div className="rounded-2xl border border-atenas-mist-border bg-atenas-card p-8 text-center shadow-card">
          <p className="text-atenas-muted text-lg">No hay temas en esta unidad todavía.</p>
        </div>
      )}
    </div>
  );
}
