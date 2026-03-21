import { useState } from 'react';
import { useAuthContext } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { useEstudianteDashboard } from '../hooks/useEstudianteDashboard';
import type { UserRole } from '../types';

type Tab = 'datos' | 'progreso';

export default function Perfil() {
  const { profile } = useAuthContext();
  const [tab, setTab] = useState<Tab>('datos');
  const [fullName, setFullName] = useState(profile?.full_name ?? '');
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<'ok' | 'error' | null>(null);
  const esEstudiante = profile?.role === 'estudiante';
  const dash = useEstudianteDashboard(esEstudiante);

  if (!profile) return null;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!profile) return;
    setSaving(true);
    setMessage(null);
    const { error } = await supabase
      .from('profiles')
      .update({ full_name: fullName })
      .eq('id', profile.id);
    setSaving(false);
    setMessage(error ? 'error' : 'ok');
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6 px-1 sm:px-0">
      <h1 className="text-page-title font-bold text-atenas-ink">Mi perfil</h1>

      {esEstudiante && (
        <div
          className="flex rounded-xl border border-atenas-mist-border bg-white p-1 shadow-card"
          role="tablist"
          aria-label="Secciones del perfil"
        >
          <button
            type="button"
            role="tab"
            id="tab-datos"
            aria-selected={tab === 'datos'}
            aria-controls="panel-datos"
            className={`profile-tab ${
              tab === 'datos' ? 'profile-tab--active' : 'profile-tab--inactive'
            }`}
            onClick={() => setTab('datos')}
          >
            Datos
          </button>
          <button
            type="button"
            role="tab"
            id="tab-progreso"
            aria-selected={tab === 'progreso'}
            aria-controls="panel-progreso"
            className={`profile-tab ${
              tab === 'progreso' ? 'profile-tab--active' : 'profile-tab--inactive'
            }`}
            onClick={() => setTab('progreso')}
          >
            Progreso y logros
          </button>
        </div>
      )}

      {(!esEstudiante || tab === 'datos') && (
        <div
          id="panel-datos"
          role="tabpanel"
          aria-labelledby="tab-datos"
          className="card p-5 sm:p-8"
        >
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label htmlFor="email" className="label">
                Correo
              </label>
              <input
                id="email"
                type="email"
                value={profile.email}
                disabled
                className="input-field bg-atenas-mist text-atenas-muted cursor-not-allowed"
              />
            </div>
            <div>
              <label htmlFor="fullName" className="label">
                Nombre completo
              </label>
              <input
                id="fullName"
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="input-field"
              />
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-atenas-muted">Rol:</span>
              <span className="badge-role capitalize">{(profile.role as UserRole)}</span>
            </div>
            {message === 'ok' && (
              <p className="text-emerald-700 text-sm font-medium">Perfil actualizado correctamente.</p>
            )}
            {message === 'error' && (
              <p className="text-red-700 text-sm font-medium">No se pudo actualizar. Vuelve a intentarlo.</p>
            )}
            <button type="submit" disabled={saving} className="btn-primary disabled:opacity-50">
              {saving ? 'Guardando...' : 'Guardar cambios'}
            </button>
          </form>
        </div>
      )}

      {esEstudiante && tab === 'progreso' && (
        <div
          id="panel-progreso"
          role="tabpanel"
          aria-labelledby="tab-progreso"
          className="space-y-6"
        >
          {dash.rachaEnRiesgo && (
            <div
              className="rounded-xl border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-950"
              role="status"
            >
              <strong>¡No pierdas tu racha!</strong> Llevas <strong>{dash.racha} días</strong> seguidos.
              Practica hoy para mantenerla.
            </div>
          )}

          <div className="card p-5 sm:p-8 space-y-4">
            <h2 className="font-semibold text-atenas-ink text-lg">Nivel y experiencia</h2>
            {dash.loading && <p className="text-atenas-muted text-sm">Cargando…</p>}
            {dash.error && <p className="text-red-600 text-sm">{dash.error}</p>}
            {!dash.loading && !dash.error && (
              <>
                <div className="flex flex-wrap items-end gap-4">
                  <div
                    className="w-16 h-16 rounded-2xl flex items-center justify-center text-white text-2xl font-bold shrink-0 bg-emerald-500"
                    aria-hidden
                  >
                    {dash.nivel.nivel}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm text-atenas-muted">Nivel {dash.nivel.nivel}</p>
                    <p className="font-bold text-atenas-ink text-lg">{dash.nivel.nombre}</p>
                    <p className="text-xs text-atenas-muted mt-0.5">{dash.xp} XP total</p>
                  </div>
                </div>
                {dash.nivel.xpParaSiguiente != null && (
                  <div>
                    <div className="flex justify-between text-xs text-atenas-muted mb-1">
                      <span>Progreso al siguiente nivel</span>
                      <span>{dash.nivel.progresoEnNivel}%</span>
                    </div>
                    <div
                      className="h-3 rounded-full bg-atenas-mist overflow-hidden ring-1 ring-atenas-mist-border/50"
                      role="progressbar"
                      aria-valuenow={dash.nivel.progresoEnNivel}
                      aria-valuemin={0}
                      aria-valuemax={100}
                      aria-label="Progreso de nivel"
                    >
                      <div
                        className="h-full rounded-full transition-all bg-navy"
                        style={{
                          width: `${dash.nivel.progresoEnNivel}%`,
                        }}
                      />
                    </div>
                  </div>
                )}
                <p className="text-sm text-atenas-muted-strong">
                  <strong className="text-emerald-500">Racha:</strong> {dash.racha} día{dash.racha !== 1 ? 's' : ''}{' '}
                  seguido{dash.racha !== 1 ? 's' : ''} con actividad
                </p>
              </>
            )}
          </div>

          <div className="card p-5 sm:p-8">
            <h2 className="font-semibold text-atenas-ink text-lg mb-4">Progreso por unidad</h2>
            {!dash.loading &&
              dash.unidades.map((u) => (
                <details
                  key={u.unidadId}
                  className="mb-4 last:mb-0 border border-atenas-mist-border rounded-xl overflow-hidden"
                >
                  <summary className="px-4 py-3 bg-atenas-mist cursor-pointer font-medium text-atenas-ink list-none flex flex-wrap items-center gap-3">
                    <span className="flex-1 min-w-[120px]">{u.titulo}</span>
                    <span className="text-sm text-atenas-muted">{u.porcentaje}% del tema</span>
                  </summary>
                  <div className="px-4 py-3 space-y-3 border-t border-atenas-mist">
                    <div
                      className="h-2 rounded-full bg-atenas-mist overflow-hidden"
                      aria-hidden
                    >
                      <div
                        className="h-full rounded-full bg-emerald-600"
                        style={{ width: `${u.porcentaje}%` }}
                      />
                    </div>
                    <ul className="space-y-2">
                      {u.temas.map((t) => (
                        <li key={t.temaId} className="text-sm">
                          <div className="flex justify-between gap-2 mb-1">
                            <span className="text-atenas-ink">{t.titulo}</span>
                            <span className="text-atenas-muted shrink-0">
                              {t.totalItems === 0
                                ? 'Sin ítems publicados'
                                : `${t.completados}/${t.totalItems} ítems`}
                            </span>
                          </div>
                          {t.totalItems > 0 && (
                            <div className="h-1.5 rounded-full bg-atenas-mist overflow-hidden">
                              <div
                                className="h-full rounded-full bg-navy/70"
                                style={{ width: `${t.porcentaje}%` }}
                              />
                            </div>
                          )}
                        </li>
                      ))}
                    </ul>
                  </div>
                </details>
              ))}
            {!dash.loading && dash.unidades.length === 0 && (
              <p className="text-atenas-muted text-sm">Aún no hay unidades publicadas con contenido.</p>
            )}
          </div>

          <div className="card p-5 sm:p-8">
            <h2 className="font-semibold text-atenas-ink text-lg mb-3">Lo último que hiciste</h2>
            {!dash.loading && dash.timeline.length === 0 && (
              <p className="text-atenas-muted text-sm">Cuando completes actividades o evaluaciones aparecerán aquí.</p>
            )}
            <ol className="space-y-3 border-l-2 border-atenas-mist-border pl-4 ml-1">
              {dash.timeline.map((ev) => (
                <li key={ev.id} className="relative">
                  <span
                    className="absolute -left-[21px] top-1.5 w-2.5 h-2.5 rounded-full bg-emerald-500"
                    aria-hidden
                  />
                  <p className="text-sm font-medium text-atenas-ink">
                    {ev.tipo === 'actividad' ? 'Actividad' : 'Evaluación'}: {ev.titulo}
                  </p>
                  <p className="text-xs text-atenas-muted">
                    {ev.etiqueta} ·{' '}
                    {new Date(ev.fechaIso).toLocaleString('es-PE', {
                      dateStyle: 'medium',
                      timeStyle: 'short',
                    })}
                  </p>
                </li>
              ))}
            </ol>
          </div>

          <div className="card p-5 sm:p-8">
            <h2 className="font-semibold text-atenas-ink text-lg mb-2">Logros</h2>
            {!dash.loading && dash.logros.length === 0 && (
              <p className="text-atenas-muted text-sm">
                Completa actividades y evaluaciones para desbloquear logros.
              </p>
            )}
            {dash.logros.length > 0 && (
              <ul className="mt-2 grid gap-3 sm:grid-cols-2">
                {dash.logros.map((l) => (
                  <li key={l.id} className="flex items-start gap-3 rounded-xl bg-atenas-mist p-3 border border-atenas-mist-border">
                    <div
                      className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 text-white text-sm font-bold bg-emerald-500"
                      aria-hidden
                    >
                      ⭐
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-atenas-ink">{l.titulo}</p>
                      <p className="text-xs text-atenas-muted mt-0.5">{l.descripcion}</p>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}

      {!esEstudiante && (
        <div className="card p-5 sm:p-8">
          <h2 className="font-semibold text-atenas-ink mb-2">Logros</h2>
          <p className="text-atenas-muted text-sm">
            Los logros y el progreso detallado están disponibles para cuentas de estudiante.
          </p>
        </div>
      )}
    </div>
  );
}
