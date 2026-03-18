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
      <h1 className="text-page-title font-bold text-slate-900">Mi perfil</h1>

      {esEstudiante && (
        <div
          className="flex rounded-xl border border-slate-200 bg-white p-1 shadow-sm"
          role="tablist"
          aria-label="Secciones del perfil"
        >
          <button
            type="button"
            role="tab"
            id="tab-datos"
            aria-selected={tab === 'datos'}
            aria-controls="panel-datos"
            className={`flex-1 rounded-lg py-2.5 px-3 text-sm font-semibold transition-colors ${
              tab === 'datos' ? 'bg-[#003366] text-white' : 'text-slate-700 hover:bg-slate-50'
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
            className={`flex-1 rounded-lg py-2.5 px-3 text-sm font-semibold transition-colors ${
              tab === 'progreso' ? 'bg-[#003366] text-white' : 'text-slate-700 hover:bg-slate-50'
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
                className="input-field bg-slate-50 text-slate-600 cursor-not-allowed"
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
              <span className="text-sm text-slate-600">Rol:</span>
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
            <h2 className="font-semibold text-slate-900 text-lg">Nivel y experiencia</h2>
            {dash.loading && <p className="text-slate-600 text-sm">Cargando…</p>}
            {dash.error && <p className="text-red-600 text-sm">{dash.error}</p>}
            {!dash.loading && !dash.error && (
              <>
                <div className="flex flex-wrap items-end gap-4">
                  <div
                    className="w-16 h-16 rounded-2xl flex items-center justify-center text-white text-2xl font-bold shrink-0"
                    style={{ backgroundColor: '#009975' }}
                    aria-hidden
                  >
                    {dash.nivel.nivel}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm text-slate-600">Nivel {dash.nivel.nivel}</p>
                    <p className="font-bold text-slate-900 text-lg">{dash.nivel.nombre}</p>
                    <p className="text-xs text-slate-500 mt-0.5">{dash.xp} XP total</p>
                  </div>
                </div>
                {dash.nivel.xpParaSiguiente != null && (
                  <div>
                    <div className="flex justify-between text-xs text-slate-600 mb-1">
                      <span>Progreso al siguiente nivel</span>
                      <span>{dash.nivel.progresoEnNivel}%</span>
                    </div>
                    <div
                      className="h-3 rounded-full bg-slate-200 overflow-hidden"
                      role="progressbar"
                      aria-valuenow={dash.nivel.progresoEnNivel}
                      aria-valuemin={0}
                      aria-valuemax={100}
                      aria-label="Progreso de nivel"
                    >
                      <div
                        className="h-full rounded-full transition-all"
                        style={{
                          width: `${dash.nivel.progresoEnNivel}%`,
                          backgroundColor: '#003366',
                        }}
                      />
                    </div>
                  </div>
                )}
                <p className="text-sm text-slate-700">
                  <strong className="text-[#009975]">Racha:</strong> {dash.racha} día{dash.racha !== 1 ? 's' : ''}{' '}
                  seguido{dash.racha !== 1 ? 's' : ''} con actividad
                </p>
              </>
            )}
          </div>

          <div className="card p-5 sm:p-8">
            <h2 className="font-semibold text-slate-900 text-lg mb-4">Progreso por unidad</h2>
            {!dash.loading &&
              dash.unidades.map((u) => (
                <details
                  key={u.unidadId}
                  className="mb-4 last:mb-0 border border-slate-200 rounded-xl overflow-hidden"
                >
                  <summary className="px-4 py-3 bg-slate-50 cursor-pointer font-medium text-slate-900 list-none flex flex-wrap items-center gap-3">
                    <span className="flex-1 min-w-[120px]">{u.titulo}</span>
                    <span className="text-sm text-slate-600">{u.porcentaje}% del tema</span>
                  </summary>
                  <div className="px-4 py-3 space-y-3 border-t border-slate-100">
                    <div
                      className="h-2 rounded-full bg-slate-100 overflow-hidden"
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
                            <span className="text-slate-800">{t.titulo}</span>
                            <span className="text-slate-600 shrink-0">
                              {t.totalItems === 0
                                ? 'Sin ítems publicados'
                                : `${t.completados}/${t.totalItems} ítems`}
                            </span>
                          </div>
                          {t.totalItems > 0 && (
                            <div className="h-1.5 rounded-full bg-slate-100 overflow-hidden">
                              <div
                                className="h-full rounded-full bg-[#003366]/70"
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
              <p className="text-slate-600 text-sm">Aún no hay unidades publicadas con contenido.</p>
            )}
          </div>

          <div className="card p-5 sm:p-8">
            <h2 className="font-semibold text-slate-900 text-lg mb-3">Lo último que hiciste</h2>
            {!dash.loading && dash.timeline.length === 0 && (
              <p className="text-slate-600 text-sm">Cuando completes actividades o evaluaciones aparecerán aquí.</p>
            )}
            <ol className="space-y-3 border-l-2 border-slate-200 pl-4 ml-1">
              {dash.timeline.map((ev) => (
                <li key={ev.id} className="relative">
                  <span
                    className="absolute -left-[21px] top-1.5 w-2.5 h-2.5 rounded-full bg-[#009975]"
                    aria-hidden
                  />
                  <p className="text-sm font-medium text-slate-900">
                    {ev.tipo === 'actividad' ? 'Actividad' : 'Evaluación'}: {ev.titulo}
                  </p>
                  <p className="text-xs text-slate-600">
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
            <h2 className="font-semibold text-slate-900 text-lg mb-2">Logros</h2>
            {!dash.loading && dash.logros.length === 0 && (
              <p className="text-slate-600 text-sm">
                Completa actividades y evaluaciones para desbloquear logros.
              </p>
            )}
            {dash.logros.length > 0 && (
              <ul className="mt-2 grid gap-3 sm:grid-cols-2">
                {dash.logros.map((l) => (
                  <li key={l.id} className="flex items-start gap-3 rounded-xl bg-slate-50 p-3 border border-slate-100">
                    <div
                      className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 text-white text-sm font-bold"
                      style={{ backgroundColor: '#009975' }}
                      aria-hidden
                    >
                      ⭐
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-slate-900">{l.titulo}</p>
                      <p className="text-xs text-slate-600 mt-0.5">{l.descripcion}</p>
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
          <h2 className="font-semibold text-slate-900 mb-2">Logros</h2>
          <p className="text-slate-600 text-sm">
            Los logros y el progreso detallado están disponibles para cuentas de estudiante.
          </p>
        </div>
      )}
    </div>
  );
}
