import { useState } from 'react';
import { useAuthContext } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { useEstudianteDashboard } from '../hooks/useEstudianteDashboard';
import { useLogrosUsuario } from '../hooks/useLogrosUsuario';
import { PageHeader } from '../components/ui/PageHeader';
import { Input } from '../components/ui/Input';
import { ProgressBar } from '../components/ui/ProgressBar';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Alert } from '../components/ui/Alert';
import { Link } from 'react-router-dom';
import { Lock } from 'lucide-react';
import type { UserRole } from '../types';

type Tab = 'datos' | 'progreso';

export default function Perfil() {
  const { profile } = useAuthContext();
  const [tab, setTab] = useState<Tab>('datos');
  const [fullName, setFullName] = useState(profile?.full_name ?? '');
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<'ok' | 'error' | null>(null);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [savingPassword, setSavingPassword] = useState(false);
  const [passwordMessage, setPasswordMessage] = useState<'ok' | 'error' | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const esEstudiante = profile?.role === 'estudiante';
  const dash = useEstudianteDashboard(esEstudiante);
  const { logros: logrosUsuario, loading: loadingLogros } = useLogrosUsuario();
  const logrosDesbloqueados = logrosUsuario.filter((l) => l.unlocked);

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

  async function handlePasswordSubmit(e: React.FormEvent) {
    e.preventDefault();
    setPasswordMessage(null);
    setPasswordError(null);

    if (newPassword.length < 6) {
      setPasswordError('La contraseña debe tener al menos 6 caracteres.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordError('Las contraseñas no coinciden.');
      return;
    }

    setSavingPassword(true);
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    setSavingPassword(false);

    if (error) {
      setPasswordMessage('error');
      setPasswordError(error.message);
      return;
    }

    setPasswordMessage('ok');
    setNewPassword('');
    setConfirmPassword('');
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6 px-1 sm:px-0">
      <PageHeader title="Mi perfil" description="Actualiza tus datos y revisa tu progreso." />

      {esEstudiante && !dash.loading && (
        <div className="atenas-sidebar-panel rounded-2xl p-6 mb-6 shadow-elevated">
          <div className="flex flex-wrap items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-atenas-gold border-2 border-amber-300 flex items-center justify-center text-2xl font-bold text-atenas-ink">
              {dash.nivel.nivel}
            </div>
            <div className="flex-1 min-w-[200px]">
              <p className="font-bold text-lg text-white">{profile.full_name}</p>
              <p className="sidebar-muted text-sm font-medium">
                Nivel {dash.nivel.nivel} · {dash.nivel.nombre}
              </p>
              <p className="text-atenas-gold text-sm font-bold mt-1">{dash.xp} XP</p>
              {dash.nivel.xpParaSiguiente != null && (
                <div className="mt-2">
                  <ProgressBar value={dash.nivel.progresoEnNivel} size="sm" tone="gold" />
                </div>
              )}
            </div>
            <div className="flex gap-2 text-center text-sm">
              <Link to="/logros" className="rounded-xl bg-white/15 px-4 py-2 hover:bg-white/25 min-h-touch flex flex-col justify-center">
                <span className="font-bold text-atenas-gold">{logrosDesbloqueados.length}</span>
                <span className="sidebar-muted text-xs font-medium">Logros</span>
              </Link>
              <Link to="/certificados" className="rounded-xl bg-white/15 px-4 py-2 hover:bg-white/25 min-h-touch flex flex-col justify-center">
                <span className="font-bold text-lg" aria-hidden>📜</span>
                <span className="sidebar-muted text-xs font-medium">Certificados</span>
              </Link>
              <Link to="/misiones" className="rounded-xl bg-white/15 px-4 py-2 hover:bg-white/25 min-h-touch flex flex-col justify-center">
                <span className="font-bold text-lg" aria-hidden>🎯</span>
                <span className="sidebar-muted text-xs font-medium">Misiones</span>
              </Link>
            </div>
          </div>
        </div>
      )}

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
        >
          <Card padding="lg">
          <form onSubmit={handleSubmit} className="space-y-5">
            <Input
              label="Correo"
              id="email"
              type="email"
              value={profile.email}
              disabled
              className="bg-atenas-mist text-atenas-muted cursor-not-allowed"
            />
            <Input
              label="Nombre completo"
              id="fullName"
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
            />
            <div className="flex items-center gap-2">
              <span className="text-sm text-atenas-muted">Rol:</span>
              <span className="badge-role capitalize">{(profile.role as UserRole)}</span>
            </div>
            {message === 'ok' && (
              <Alert tone="success">Perfil actualizado correctamente.</Alert>
            )}
            {message === 'error' && (
              <Alert tone="error">No se pudo actualizar. Vuelve a intentarlo.</Alert>
            )}
            <Button type="submit" disabled={saving}>
              {saving ? 'Guardando...' : 'Guardar cambios'}
            </Button>
          </form>
          </Card>

          <Card padding="lg" className="mt-4">
            <h2 className="text-lg font-bold text-atenas-ink mb-1 flex items-center gap-2">
              <Lock className="w-5 h-5 shrink-0" aria-hidden />
              Cambiar contraseña
            </h2>
            <p className="text-sm text-atenas-muted mb-4">
              Elige una contraseña nueva de al menos 6 caracteres.
            </p>
            <form onSubmit={handlePasswordSubmit} className="space-y-4">
              <Input
                label="Nueva contraseña"
                id="newPassword"
                type="password"
                autoComplete="new-password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
                minLength={6}
              />
              <Input
                label="Confirmar contraseña"
                id="confirmPassword"
                type="password"
                autoComplete="new-password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                minLength={6}
              />
              {passwordError && <Alert tone="error">{passwordError}</Alert>}
              {passwordMessage === 'ok' && (
                <Alert tone="success">Contraseña actualizada correctamente.</Alert>
              )}
              {passwordMessage === 'error' && !passwordError && (
                <Alert tone="error">No se pudo cambiar la contraseña. Vuelve a intentarlo.</Alert>
              )}
              <Button type="submit" disabled={savingPassword}>
                {savingPassword ? 'Guardando...' : 'Actualizar contraseña'}
              </Button>
            </form>
          </Card>
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

          <Card padding="lg" className="space-y-4">
            <h2 className="text-lg font-bold text-atenas-ink">Nivel y experiencia</h2>
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
          </Card>

          <Card padding="lg">
            <h2 className="text-lg font-bold text-atenas-ink mb-4">Progreso por unidad</h2>
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
          </Card>

          <Card padding="lg">
            <h2 className="text-lg font-bold text-atenas-ink mb-3">Lo último que hiciste</h2>
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
          </Card>

          <Card padding="lg">
            <h2 className="text-lg font-bold text-atenas-ink mb-2">Logros</h2>
            {!loadingLogros && logrosDesbloqueados.length === 0 && (
              <p className="text-atenas-muted text-sm">
                Completa actividades y evaluaciones para desbloquear logros.
              </p>
            )}
            {logrosDesbloqueados.length > 0 && (
              <ul className="mt-2 grid gap-3 sm:grid-cols-2">
                {logrosDesbloqueados.map((l) => (
                  <li key={l.id} className="flex items-start gap-3 rounded-xl bg-atenas-mist p-3 border border-atenas-mist-border">
                    <div
                      className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 text-white text-sm font-bold bg-emerald-500"
                      aria-hidden
                    >
                      {l.icon || '⭐'}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-atenas-ink">{l.title}</p>
                      <p className="text-xs text-atenas-muted mt-0.5">{l.description ?? ''}</p>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </Card>
        </div>
      )}

      {!esEstudiante && (
        <Card padding="lg">
          <h2 className="text-lg font-bold text-atenas-ink mb-2">Logros</h2>
          <p className="text-atenas-muted text-sm">
            Los logros y el progreso detallado están disponibles para cuentas de estudiante.
          </p>
        </Card>
      )}
    </div>
  );
}
