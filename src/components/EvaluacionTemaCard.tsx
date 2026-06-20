import { Link } from 'react-router-dom';
import type { Evaluacion } from '../types';
import type { EvaluacionResumenAlumno } from '../hooks/useResumenEvaluacionesUsuario';
import { formatMaxIntentos } from '../hooks/useResumenEvaluacionesUsuario';
import { Badge } from './ui/Badge';
import { cn } from './ui/cn';

type Props = {
  evaluacion: Evaluacion;
  resumen?: EvaluacionResumenAlumno;
  loadingResumen?: boolean;
  className?: string;
};

export function EvaluacionTemaCard({ evaluacion, resumen, loadingResumen, className }: Props) {
  const maxLabel = formatMaxIntentos(evaluacion.max_intentos);
  const ilimitado = maxLabel === 'Ilimitados';
  const intentos = resumen?.intentos ?? 0;
  const agotado =
    !ilimitado &&
    evaluacion.max_intentos != null &&
    evaluacion.max_intentos > 0 &&
    intentos >= evaluacion.max_intentos;

  return (
    <Link
      to={`/evaluaciones/${evaluacion.id}`}
      className={cn(
        'block p-4 rounded-xl border border-atenas-mist-border bg-white shadow-card card-hover',
        className
      )}
    >
      <div className="flex flex-wrap items-start justify-between gap-2">
        <span className="text-xs font-semibold uppercase text-atenas-ink">Cuestionario</span>
        {loadingResumen ? (
          <span className="text-[10px] text-atenas-muted">Cargando…</span>
        ) : resumen?.aprobadoAlguna ? (
          <Badge tone="success" className="text-[10px]">
            Aprobado
          </Badge>
        ) : intentos > 0 ? (
          <Badge tone="muted" className="text-[10px]">
            En progreso
          </Badge>
        ) : null}
      </div>
      <h3 className="font-bold text-atenas-ink mt-1">{evaluacion.title}</h3>
      <dl className="mt-3 grid grid-cols-2 gap-x-3 gap-y-1 text-xs">
        <div>
          <dt className="text-atenas-muted">Tu mejor nota</dt>
          <dd className="font-bold text-atenas-ink tabular-nums">
            {loadingResumen ? '–' : resumen?.mejorPuntuacion != null ? `${resumen.mejorPuntuacion}%` : '—'}
          </dd>
        </div>
        <div>
          <dt className="text-atenas-muted">Intentos</dt>
          <dd className="font-bold text-atenas-ink tabular-nums">
            {loadingResumen
              ? '–'
              : ilimitado
                ? intentos > 0
                  ? `${intentos} (ilimitados)`
                  : 'Ilimitados'
                : `${intentos} / ${maxLabel}`}
          </dd>
        </div>
        <div className="col-span-2">
          <dt className="text-atenas-muted">Para aprobar</dt>
          <dd className="font-semibold text-atenas-ink">{evaluacion.umbral_aprobado}%</dd>
        </div>
      </dl>
      {agotado && (
        <p className="mt-2 text-[11px] text-amber-800 font-medium">Máximo de intentos alcanzado</p>
      )}
    </Link>
  );
}
