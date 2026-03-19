import { Link, useParams, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { useTema } from '../hooks/useTema';
import { useRecursos } from '../hooks/useRecursos';
import { useActividades } from '../hooks/useActividades';
import { useEvaluaciones } from '../hooks/useEvaluaciones';
import { useAuthContext } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { usuarioCumplePrerequisitoTema } from '../lib/prerequisitoTema';
import { TemaMensajes } from '../components/TemaMensajes';
import { MicroQuizCard } from '../components/MicroQuizCard';

type ProgresoTema = {
  total: number;
  completadas: number;
};

export default function TemaView() {
  const { temaId } = useParams<{ temaId: string }>();
  const navigate = useNavigate();
  const { user, profile, loading: authLoading } = useAuthContext();
  const esEstudiante = profile?.role === 'estudiante';
  const { tema, loading: loadingTema } = useTema(temaId ?? null);
  const [progreso, setProgreso] = useState<ProgresoTema | null>(null);
  const [loadingProgreso, setLoadingProgreso] = useState(false);
  const [prereqOk, setPrereqOk] = useState(true);
  const [prereqResolved, setPrereqResolved] = useState(false);

  const temaIdContenido = (() => {
    if (!temaId) return null;
    if (!tema) return null;
    // Si no tiene prerequisito, puede cargarse contenido inmediatamente.
    if (!tema.prerequisito_tema_id) return temaId;
    // Si tiene prerequisito, cargamos contenido solo cuando ya verificamos el prerequisito.
    if (prereqResolved && prereqOk) return temaId;
    return null;
  })();

  const { recursos, loading: loadingRecursos } = useRecursos(temaIdContenido);
  const { actividades, loading: loadingActividades } = useActividades(temaIdContenido);
  const { evaluaciones, loading: loadingEvaluaciones } = useEvaluaciones(temaIdContenido);

  const microQuizEvaluacion =
    !loadingEvaluaciones && Array.isArray(evaluaciones)
      ? evaluaciones.find((e) => e.publicada && e.es_micro_quiz === true)
      : null;

  useEffect(() => {
    let cancelled = false;

    async function calcularProgreso() {
      if (!temaId || !user) {
        setProgreso(null);
        return;
      }
      try {
        setLoadingProgreso(true);
        // Obtener IDs de actividades y evaluaciones publicadas de este tema
        const [actsRes, evalsRes] = await Promise.all([
          supabase.from('actividades').select('id').eq('tema_id', temaId).eq('publicada', true),
          supabase.from('evaluaciones').select('id').eq('tema_id', temaId).eq('publicada', true),
        ]);
        if (cancelled) return;
        if (actsRes.error) throw actsRes.error;
        if (evalsRes.error) throw evalsRes.error;
        const actividadIds = (actsRes.data ?? []).map((a: { id: string }) => a.id);
        const evaluacionIds = (evalsRes.data ?? []).map((e: { id: string }) => e.id);
        const total = actividadIds.length + evaluacionIds.length;
        if (!total) {
          setProgreso(null);
          return;
        }
        const [intActRes, intEvalRes] = await Promise.all([
          actividadIds.length
            ? supabase
                .from('actividad_intentos')
                .select('actividad_id')
                .eq('user_id', user.id)
                .in('actividad_id', actividadIds)
            : Promise.resolve({ data: [], error: null } as { data: unknown[] | null; error: null }),
          evaluacionIds.length
            ? supabase
                .from('evaluacion_intentos')
                .select('evaluacion_id')
                .eq('user_id', user.id)
                .in('evaluacion_id', evaluacionIds)
            : Promise.resolve({ data: [], error: null } as { data: unknown[] | null; error: null }),
        ]);
        if (cancelled) return;
        if (intActRes.error) throw intActRes.error;
        if (intEvalRes.error) throw intEvalRes.error;
        const completadasAct = new Set(
          ((intActRes.data ?? []) as { actividad_id: string }[]).map((i) => i.actividad_id)
        ).size;
        const completadasEval = new Set(
          ((intEvalRes.data ?? []) as { evaluacion_id: string }[]).map((i) => i.evaluacion_id)
        ).size;
        setProgreso({ total, completadas: completadasAct + completadasEval });
      } catch {
        if (!cancelled) {
          setProgreso(null);
        }
      } finally {
        if (!cancelled) setLoadingProgreso(false);
      }
    }

    calcularProgreso();
    return () => {
      cancelled = true;
    };
  }, [temaId, user]);

  useEffect(() => {
    if (!user || !tema?.prerequisito_tema_id) {
      setPrereqOk(true);
      setPrereqResolved(true);
      return;
    }
    let c = false;
    setPrereqResolved(false);
    usuarioCumplePrerequisitoTema(user.id, tema.prerequisito_tema_id).then((ok) => {
      if (!c) {
        setPrereqOk(ok);
        setPrereqResolved(true);
      }
    });
    return () => {
      c = true;
    };
  }, [user, tema?.prerequisito_tema_id, tema?.id]);

  if (loadingTema || !tema) {
    return <p className="text-slate-600 text-lg">Cargando...</p>;
  }
  if (authLoading || !profile) {
    return <p className="text-slate-600 text-lg">Cargando perfil...</p>;
  }

  if (tema.prerequisito_tema_id && !prereqResolved) {
    return <p className="text-slate-800">Comprobando acceso al tema…</p>;
  }
  if (!prereqOk && tema.prerequisito_tema_id) {
    return (
      <div className="max-w-lg">
        <button
          type="button"
          onClick={() => navigate(`/unidades/${tema.unidad_id}`)}
          className="text-sm font-medium mb-4 min-h-touch text-[#003366]"
        >
          ← Volver a la unidad
        </button>
        <div className="card p-6 border-2 border-amber-300 bg-amber-50">
          <h1 className="text-xl font-bold text-amber-950">Tema bloqueado</h1>
          <p className="text-amber-900 mt-2">
            Debes completar todas las actividades y evaluaciones publicadas del tema anterior antes
            de acceder a este contenido.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <button
        type="button"
        onClick={() => navigate(`/unidades/${tema.unidad_id}`)}
        className="text-sm font-medium mb-4 min-h-touch flex items-center rounded-lg px-2 -ml-2 transition-colors hover:bg-[#e6edf5]"
        style={{ color: '#003366' }}
      >
        ← Volver a la unidad
      </button>
      <h1 className="text-page-title font-bold text-slate-900 mb-6">{tema.title}</h1>

      {microQuizEvaluacion && microQuizEvaluacion.micro_ubicacion === 'inicio' && esEstudiante ? (
        <div className="mb-8">
          <MicroQuizCard evaluacion={microQuizEvaluacion} defaultCollapsed />
        </div>
      ) : null}

      {progreso && (
        <div className="card p-4 mb-6 flex items-center justify-between gap-4">
          <div>
            <p className="text-sm text-slate-600">
              Progreso en este tema:&nbsp;
              <span className="font-semibold text-slate-900">
                {progreso.completadas} de {progreso.total} actividades/evaluaciones
              </span>
            </p>
          </div>
          <div className="flex-1 max-w-xs">
            <div className="w-full h-3 rounded-full bg-slate-200 overflow-hidden">
              <div
                className="h-full rounded-full"
                style={{
                  width: `${Math.round((progreso.completadas / progreso.total) * 100)}%`,
                  backgroundColor: '#009975',
                }}
              />
            </div>
            {loadingProgreso ? (
              <p className="text-[11px] text-slate-500 mt-1">Calculando progreso...</p>
            ) : (
              <p className="text-[11px] text-slate-500 mt-1">
                {Math.round((progreso.completadas / progreso.total) * 100)}% completado
              </p>
            )}
          </div>
        </div>
      )}

      {tema.content && (
        <div className="card p-6 mb-8">
          <div className="whitespace-pre-wrap text-slate-700 leading-relaxed text-base">{tema.content}</div>
        </div>
      )}

      {loadingRecursos ? (
        <p className="text-slate-600 text-lg">Cargando recursos...</p>
      ) : recursos.length > 0 ? (
        <section className="mb-10">
          <h2 className="text-lg font-semibold text-slate-900 mb-4">Recursos</h2>
          <ul className="space-y-4">
            {recursos.map((r) => (
              <li key={r.id} className="card p-5">
                {r.title && <h3 className="font-medium text-slate-900 mb-2">{r.title}</h3>}
                {r.tipo === 'imagen' && (
                  <img src={r.url} alt={r.title ?? ''} className="max-w-full rounded-lg mt-2" />
                )}
                {r.tipo === 'mapa' && (
                  <img src={r.url} alt={r.title ?? 'Mapa'} className="max-w-full rounded-lg mt-2" />
                )}
                {r.tipo === 'video' && (
                  <video src={r.url} controls className="max-w-full rounded-lg mt-2" />
                )}
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {loadingActividades ? (
        <p className="text-slate-600 mt-8">Cargando actividades...</p>
      ) : actividades.filter((a) => a.publicada).length > 0 ? (
        <section className="mt-10">
          <h2 className="text-lg font-semibold text-slate-900 mb-4">Actividades</h2>
          <ul className="space-y-3">
            {actividades
              .filter((a) => a.publicada)
              .map((a) => (
                <li key={a.id}>
                  <Link
                    to={`/actividades/${a.id}`}
                    className="block p-4 card-hover rounded-xl focus:outline-none focus:ring-2 focus:ring-[#003366] focus:ring-offset-2"
                  >
                    <span className="text-sm font-medium capitalize" style={{ color: '#009975' }}>
                      {a.tipo.replace(/_/g, ' ')}
                    </span>
                    <h3 className="font-bold text-slate-900 mt-1">{a.title}</h3>
                  </Link>
                </li>
              ))}
          </ul>
        </section>
      ) : null}

      {microQuizEvaluacion && microQuizEvaluacion.micro_ubicacion !== 'inicio' && esEstudiante ? (
        <div className="mt-10">
          <MicroQuizCard evaluacion={microQuizEvaluacion} defaultCollapsed />
        </div>
      ) : null}

      {loadingEvaluaciones ? (
        <p className="text-slate-600 mt-8">Cargando evaluaciones...</p>
      ) : evaluaciones.filter((e) => e.publicada).length > 0 ? (
        <section className="mt-10">
          <h2 className="text-lg font-semibold text-slate-900 mb-4">Evaluaciones</h2>
          <ul className="space-y-3">
            {(esEstudiante
              ? evaluaciones.filter((e) => e.publicada && e.es_micro_quiz !== true)
              : evaluaciones.filter((e) => e.publicada)
            )
              .map((e) => (
                <li key={e.id}>
                  <Link
                    to={`/evaluaciones/${e.id}`}
                    className="block p-4 card-hover rounded-xl focus:outline-none focus:ring-2 focus:ring-[#003366] focus:ring-offset-2"
                  >
                    <span className="text-sm font-medium" style={{ color: '#009975' }}>Cuestionario</span>
                    <h3 className="font-bold text-slate-900 mt-1">{e.title}</h3>
                    {e.descripcion && (
                      <p className="text-slate-600 text-sm mt-1">{e.descripcion}</p>
                    )}
                  </Link>
                </li>
              ))}
          </ul>
        </section>
      ) : null}

      {esEstudiante ? null : <TemaMensajes temaId={tema.id} />}
    </div>
  );
}
