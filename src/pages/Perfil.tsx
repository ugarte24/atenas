import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Award,
  ChevronRight,
  Flame,
  Lock,
  Mail,
  Shield,
  Star,
  Target,
  Trophy,
  TrendingUp,
  User,
  AlertTriangle,
  Pencil,
} from 'lucide-react';
import { useAuthContext } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { useEstudianteDashboard } from '../hooks/useEstudianteDashboard';
import { useLogrosUsuario } from '../hooks/useLogrosUsuario';
import { useActividadReciente } from '../hooks/useActividadReciente';
import { islaDesdeOrdenUnidadSafe } from '../lib/mundoUnidadMap';
import { PageHeader } from '../components/ui/PageHeader';
import { Input } from '../components/ui/Input';
import { ProgressBar } from '../components/ui/ProgressBar';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Alert } from '../components/ui/Alert';
import { SkeletonLines } from '../components/ui/Skeleton';
import { Form, FormBody, FormFooter } from '../components/ui/Form';
import { FormModal } from '../components/ui/FormModal';
import { RecentActivityList } from '../components/progress/RecentActivityList';
import { cn } from '../components/ui/cn';
import type { UserRole } from '../types';

type Tab = 'datos' | 'progreso';

function iniciales(nombre: string): string {
  return nombre
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? '')
    .join('');
}

const ROL_LABEL: Record<UserRole, string> = {
  estudiante: 'Estudiante',
  docente: 'Docente',
  admin: 'Administrador',
};

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
  const [editDatosOpen, setEditDatosOpen] = useState(false);
  const [passwordModalOpen, setPasswordModalOpen] = useState(false);
  const esEstudiante = profile?.role === 'estudiante';
  const dash = useEstudianteDashboard(esEstudiante);
  const { logros: logrosUsuario, loading: loadingLogros } = useLogrosUsuario();
  const { items: recientes, loading: loadingRec } = useActividadReciente(5);
  const logrosDesbloqueados = logrosUsuario.filter((l) => l.unlocked);

  const porcentajeGlobal = useMemo(() => {
    if (dash.unidades.length === 0) return 0;
    const sum = dash.unidades.reduce((acc, u) => acc + u.porcentaje, 0);
    return Math.round(sum / dash.unidades.length);
  }, [dash.unidades]);

  const unidadesCompletas = useMemo(
    () => dash.unidades.filter((u) => u.porcentaje >= 100).length,
    [dash.unidades]
  );

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
    if (!error) setEditDatosOpen(false);
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
    setPasswordModalOpen(false);
  }

  const quickLinks = [
    {
      to: '/logros',
      label: 'Logros',
      value: logrosDesbloqueados.length,
      icon: Trophy,
      tone: 'from-violet-500/10 to-purple-500/5 border-violet-200/60 text-violet-700',
    },
    {
      to: '/certificados',
      label: 'Certificados',
      value: null,
      icon: Award,
      tone: 'from-amber-500/10 to-yellow-500/5 border-amber-200/60 text-amber-800',
    },
    {
      to: '/misiones',
      label: 'Misiones',
      value: null,
      icon: Target,
      tone: 'from-orange-500/10 to-amber-500/5 border-orange-200/60 text-orange-800',
    },
    {
      to: '/progreso',
      label: 'Progreso',
      value: `${porcentajeGlobal}%`,
      icon: TrendingUp,
      tone: 'from-emerald-500/10 to-teal-500/5 border-emerald-200/60 text-emerald-800',
    },
  ] as const;

  return (
    <div className="max-w-3xl mx-auto">
      <PageHeader
        title="Mi perfil"
        description="Administra tu cuenta y consulta tu avance en ATENAS."
      />

      <section
        className={cn(
          'mb-6 rounded-3xl border shadow-card overflow-hidden',
          esEstudiante
            ? 'border-atenas-mist-border bg-gradient-to-br from-sky-50/80 via-white to-atenas-mist/30'
            : 'border-atenas-mist-border bg-white'
        )}
        aria-label="Resumen del perfil"
      >
        <div className="p-5 sm:p-6">
          <div className="flex items-start gap-4">
            <div
              className={cn(
                'flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl text-xl font-bold shadow-md',
                esEstudiante
                  ? 'bg-gradient-to-br from-atenas-gold to-amber-500 text-atenas-ink'
                  : 'bg-gradient-to-br from-atenas-ink to-sky-800 text-white'
              )}
              aria-hidden
            >
              {iniciales(profile.full_name || profile.email) || '?'}
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2 mb-1">
                <Badge tone="muted" className="text-[10px] font-bold capitalize">
                  {ROL_LABEL[profile.role as UserRole] ?? profile.role}
                </Badge>
                {esEstudiante && !dash.loading && dash.nivel && (
                  <Badge tone="gold" className="text-[10px] font-bold">
                    Nivel {dash.nivel.nivel} · {dash.nivel.nombre}
                  </Badge>
                )}
              </div>
              <h2 className="text-xl font-bold text-atenas-ink leading-snug truncate">
                {profile.full_name || 'Sin nombre'}
              </h2>
              <p className="text-sm text-atenas-muted truncate mt-0.5">{profile.email}</p>
              {esEstudiante && !dash.loading && dash.nivel && (
                <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm">
                  <span className="font-bold text-atenas-ink tabular-nums flex items-center gap-1">
                    <Star className="w-4 h-4 text-atenas-gold fill-atenas-gold" aria-hidden />
                    {dash.xp.toLocaleString('es')} XP
                  </span>
                  <span className="text-atenas-muted flex items-center gap-1">
                    <Flame className="w-4 h-4 text-orange-500" aria-hidden />
                    {dash.racha} d de racha
                  </span>
                </div>
              )}
            </div>
          </div>

          {esEstudiante && !dash.loading && dash.nivel?.xpParaSiguiente != null && (
            <div className="mt-4 pt-4 border-t border-atenas-mist-border/80">
              <ProgressBar
                value={dash.nivel.progresoEnNivel}
                label={`${dash.nivel.xpEnNivel} / ${dash.nivel.xpParaSiguiente} XP al siguiente nivel`}
                showPercent
                size="sm"
                tone="gold"
              />
            </div>
          )}

          {esEstudiante && dash.loading && (
            <div className="mt-4 pt-4 border-t border-atenas-mist-border/80">
              <SkeletonLines lines={1} />
            </div>
          )}
        </div>

        {esEstudiante && (
          <div className="grid grid-cols-2 sm:grid-cols-4 border-t border-atenas-mist-border/80">
            {quickLinks.map(({ to, label, value, icon: Icon, tone }) => (
              <Link
                key={to}
                to={to}
                className={cn(
                  'flex flex-col items-center justify-center gap-1 px-3 py-4 min-h-touch transition-colors hover:bg-white/60 border-r last:border-r-0 border-atenas-mist-border/60 bg-gradient-to-b',
                  tone
                )}
              >
                <Icon className="w-5 h-5 shrink-0" aria-hidden />
                {value != null && (
                  <span className="text-lg font-bold tabular-nums leading-none">{value}</span>
                )}
                <span className="text-[11px] font-semibold">{label}</span>
              </Link>
            ))}
          </div>
        )}
      </section>

      {esEstudiante && (
        <div
          className="flex rounded-xl border border-atenas-mist-border bg-white p-1 mb-6 shadow-card"
          role="tablist"
          aria-label="Secciones del perfil"
        >
          {(
            [
              { id: 'datos' as const, label: 'Datos' },
              { id: 'progreso' as const, label: 'Progreso y logros' },
            ] as const
          ).map(({ id, label }) => (
            <button
              key={id}
              type="button"
              role="tab"
              id={`tab-${id}`}
              aria-selected={tab === id}
              aria-controls={`panel-${id}`}
              className={cn('profile-tab flex-1', tab === id ? 'profile-tab--active' : 'profile-tab--inactive')}
              onClick={() => setTab(id)}
            >
              {label}
            </button>
          ))}
        </div>
      )}

      {(!esEstudiante || tab === 'datos') && (
        <div id="panel-datos" role="tabpanel" aria-labelledby="tab-datos" className="space-y-4">
          <Card padding="lg">
            <div className="flex flex-wrap items-start justify-between gap-3 mb-5">
              <div className="flex items-center gap-2">
                <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-atenas-mist text-atenas-ink">
                  <User className="w-4 h-4" aria-hidden />
                </span>
                <div>
                  <h2 className="text-base font-bold text-atenas-ink">Información personal</h2>
                  <p className="text-xs text-atenas-muted">Datos visibles en tu cuenta</p>
                </div>
              </div>
              <Button
                type="button"
                variant="secondary"
                className="min-h-touch"
                onClick={() => {
                  setFullName(profile.full_name ?? '');
                  setMessage(null);
                  setEditDatosOpen(true);
                }}
              >
                <Pencil className="w-4 h-4 mr-1.5" aria-hidden />
                Editar datos
              </Button>
            </div>
            <dl className="space-y-4">
              <div>
                <dt className="text-xs font-medium text-atenas-muted mb-1">Correo</dt>
                <dd className="text-sm text-atenas-ink">{profile.email}</dd>
              </div>
              <div>
                <dt className="text-xs font-medium text-atenas-muted mb-1">Nombre completo</dt>
                <dd className="text-sm font-medium text-atenas-ink">{profile.full_name || '—'}</dd>
              </div>
              <div>
                <dt className="text-xs font-medium text-atenas-muted mb-1">Rol</dt>
                <dd>
                  <span className="badge-role capitalize">
                    {ROL_LABEL[profile.role as UserRole] ?? profile.role}
                  </span>
                </dd>
              </div>
            </dl>
            {message === 'ok' && (
              <Alert tone="success" className="mt-4">
                Perfil actualizado correctamente.
              </Alert>
            )}
            {message === 'error' && (
              <Alert tone="error" className="mt-4">
                No se pudo actualizar. Vuelve a intentarlo.
              </Alert>
            )}
          </Card>

          <Card padding="lg">
            <div className="flex flex-wrap items-start justify-between gap-3 mb-5">
              <div className="flex items-center gap-2">
                <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-atenas-mist text-atenas-ink">
                  <Shield className="w-4 h-4" aria-hidden />
                </span>
                <div>
                  <h2 className="text-base font-bold text-atenas-ink">Seguridad</h2>
                  <p className="text-xs text-atenas-muted">Cambia tu contraseña de acceso</p>
                </div>
              </div>
              <Button
                type="button"
                variant="secondary"
                className="min-h-touch"
                onClick={() => {
                  setNewPassword('');
                  setConfirmPassword('');
                  setPasswordMessage(null);
                  setPasswordError(null);
                  setPasswordModalOpen(true);
                }}
              >
                <Lock className="w-4 h-4 mr-1.5" aria-hidden />
                Cambiar contraseña
              </Button>
            </div>
            <p className="text-sm text-atenas-muted">
              Usa una contraseña segura de al menos 6 caracteres.
            </p>
            {passwordMessage === 'ok' && (
              <Alert tone="success" className="mt-4">
                Contraseña actualizada correctamente.
              </Alert>
            )}
          </Card>

          <FormModal
            open={editDatosOpen}
            onClose={() => setEditDatosOpen(false)}
            title="Editar información personal"
            description="Actualiza el nombre que aparece en tu cuenta."
            icon={<User className="w-5 h-5" />}
          >
            <Form onSubmit={handleSubmit}>
              <FormBody className="space-y-4">
                <Input
                  label="Correo"
                  id="email-modal"
                  type="email"
                  value={profile.email}
                  disabled
                  className="bg-atenas-mist text-atenas-muted cursor-not-allowed"
                />
                <Input
                  label="Nombre completo"
                  id="fullName-modal"
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                />
                <div className="flex items-center gap-2 rounded-xl bg-atenas-mist/60 border border-atenas-mist-border px-3 py-2.5">
                  <Mail className="w-4 h-4 text-atenas-muted shrink-0" aria-hidden />
                  <span className="text-sm text-atenas-muted">Rol:</span>
                  <span className="badge-role capitalize">
                    {ROL_LABEL[profile.role as UserRole] ?? profile.role}
                  </span>
                </div>
                {message === 'error' && (
                  <Alert tone="error">No se pudo actualizar. Vuelve a intentarlo.</Alert>
                )}
              </FormBody>
              <FormFooter>
                <Button type="button" variant="secondary" onClick={() => setEditDatosOpen(false)}>
                  Cancelar
                </Button>
                <Button type="submit" disabled={saving}>
                  {saving ? 'Guardando…' : 'Guardar cambios'}
                </Button>
              </FormFooter>
            </Form>
          </FormModal>

          <FormModal
            open={passwordModalOpen}
            onClose={() => setPasswordModalOpen(false)}
            title="Cambiar contraseña"
            description="Introduce y confirma tu nueva contraseña de acceso."
            icon={<Shield className="w-5 h-5" />}
          >
            <Form onSubmit={handlePasswordSubmit}>
              <FormBody className="space-y-4">
                <Input
                  label="Nueva contraseña"
                  id="newPassword-modal"
                  type="password"
                  autoComplete="new-password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                  minLength={6}
                />
                <Input
                  label="Confirmar contraseña"
                  id="confirmPassword-modal"
                  type="password"
                  autoComplete="new-password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  minLength={6}
                />
                {passwordError && <Alert tone="error">{passwordError}</Alert>}
                {passwordMessage === 'error' && !passwordError && (
                  <Alert tone="error">No se pudo cambiar la contraseña. Vuelve a intentarlo.</Alert>
                )}
              </FormBody>
              <FormFooter>
                <Button type="button" variant="secondary" onClick={() => setPasswordModalOpen(false)}>
                  Cancelar
                </Button>
                <Button type="submit" disabled={savingPassword}>
                  {savingPassword ? 'Guardando…' : 'Actualizar contraseña'}
                </Button>
              </FormFooter>
            </Form>
          </FormModal>
        </div>
      )}

      {esEstudiante && tab === 'progreso' && (
        <div id="panel-progreso" role="tabpanel" aria-labelledby="tab-progreso" className="space-y-4">
          {dash.rachaEnRiesgo && (
            <Alert tone="warning" className="flex items-start gap-2">
              <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5" aria-hidden />
              <div>
                <p className="font-semibold text-sm">¡No pierdas tu racha!</p>
                <p className="text-sm mt-0.5">
                  Llevas {dash.racha} días seguidos. Practica hoy para mantenerla.
                </p>
              </div>
            </Alert>
          )}

          {dash.loading && <SkeletonLines lines={3} />}
          {dash.error && (
            <Alert tone="error">No se pudo cargar tu progreso. Intenta recargar la página.</Alert>
          )}

          {!dash.loading && !dash.error && (
            <>
              <section className="grid grid-cols-3 gap-3" aria-label="Estadísticas de progreso">
                <div className="rounded-2xl border border-atenas-mist-border bg-white p-4 shadow-card text-center">
                  <p className="text-[10px] font-bold uppercase tracking-wide text-atenas-muted">Avance</p>
                  <p className="text-xl font-bold text-atenas-ink tabular-nums mt-1">{porcentajeGlobal}%</p>
                </div>
                <div className="rounded-2xl border border-atenas-mist-border bg-white p-4 shadow-card text-center">
                  <p className="text-[10px] font-bold uppercase tracking-wide text-atenas-muted">Unidades</p>
                  <p className="text-xl font-bold text-atenas-ink tabular-nums mt-1">
                    {unidadesCompletas}/{dash.unidades.length}
                  </p>
                </div>
                <div className="rounded-2xl border border-atenas-mist-border bg-white p-4 shadow-card text-center">
                  <p className="text-[10px] font-bold uppercase tracking-wide text-atenas-muted">Logros</p>
                  <p className="text-xl font-bold text-atenas-ink tabular-nums mt-1">
                    {loadingLogros ? '–' : logrosDesbloqueados.length}
                  </p>
                </div>
              </section>

              <Card padding="md">
                <div className="flex items-center justify-between gap-2 mb-4">
                  <h2 className="text-sm font-bold text-atenas-ink">Progreso por unidad</h2>
                  <Link
                    to="/progreso"
                    className="text-xs font-semibold text-atenas-blue hover:underline underline-offset-2"
                  >
                    Ver detalle
                  </Link>
                </div>
                {dash.unidades.length === 0 ? (
                  <p className="text-sm text-atenas-muted">
                    Aún no hay unidades publicadas con contenido.
                  </p>
                ) : (
                  <div className="space-y-3">
                    {dash.unidades.map((u, listIndex) => {
                      const isla = islaDesdeOrdenUnidadSafe(u.orden, listIndex);
                      const completada = u.porcentaje >= 100;
                      return (
                        <details
                          key={u.unidadId}
                          className={cn(
                            'rounded-2xl border overflow-hidden group',
                            completada
                              ? 'border-emerald-200/80 bg-emerald-50/30'
                              : 'border-atenas-mist-border bg-white'
                          )}
                        >
                          <summary className="px-4 py-3 cursor-pointer list-none flex items-center gap-3 hover:bg-atenas-mist/30 transition-colors">
                            <div className="min-w-0 flex-1">
                              <div className="flex flex-wrap items-center gap-2 mb-1">
                                <Badge tone="muted" className="text-[10px] font-bold">
                                  {isla.shortLabel}
                                </Badge>
                                {completada && (
                                  <Badge tone="success" className="text-[10px]">
                                    Completada
                                  </Badge>
                                )}
                              </div>
                              <p className="font-semibold text-sm text-atenas-ink truncate">{u.titulo}</p>
                            </div>
                            <span className="text-sm font-bold text-atenas-ink tabular-nums shrink-0">
                              {u.porcentaje}%
                            </span>
                            <ChevronRight className="w-4 h-4 text-atenas-muted shrink-0 group-open:rotate-90 transition-transform" aria-hidden />
                          </summary>
                          <div className="px-4 pb-4 pt-1 border-t border-atenas-mist-border/60 space-y-3">
                            <ProgressBar
                              value={u.porcentaje}
                              size="sm"
                              tone={completada ? 'success' : u.porcentaje > 0 ? 'gold' : 'blue'}
                            />
                            <ul className="space-y-2.5">
                              {u.temas.map((t) => (
                                <li key={t.temaId}>
                                  <div className="flex justify-between gap-2 mb-1 text-xs">
                                    <span className="text-atenas-ink font-medium truncate">{t.titulo}</span>
                                    <span className="text-atenas-muted shrink-0 tabular-nums">
                                      {t.totalItems === 0
                                        ? 'Sin ítems'
                                        : `${t.completados}/${t.totalItems}`}
                                    </span>
                                  </div>
                                  {t.totalItems > 0 && (
                                    <ProgressBar value={t.porcentaje} size="sm" tone="blue" />
                                  )}
                                </li>
                              ))}
                            </ul>
                            <Link
                              to={`/unidades/${u.unidadId}`}
                              className="inline-flex items-center gap-1 text-xs font-semibold text-atenas-blue hover:underline underline-offset-2"
                            >
                              Ir a la unidad
                              <ChevronRight className="w-3.5 h-3.5" aria-hidden />
                            </Link>
                          </div>
                        </details>
                      );
                    })}
                  </div>
                )}
              </Card>

              <Card padding="md">
                <div className="flex items-center justify-between gap-2 mb-4">
                  <h2 className="text-sm font-bold text-atenas-ink">Actividad reciente</h2>
                  <Link
                    to="/progreso"
                    className="text-xs font-semibold text-atenas-blue hover:underline underline-offset-2"
                  >
                    Ver todo
                  </Link>
                </div>
                <RecentActivityList items={recientes} loading={loadingRec} />
              </Card>

              <Card padding="md">
                <div className="flex items-center justify-between gap-2 mb-4">
                  <h2 className="text-sm font-bold text-atenas-ink">Logros desbloqueados</h2>
                  <Link
                    to="/logros"
                    className="text-xs font-semibold text-atenas-blue hover:underline underline-offset-2"
                  >
                    Ver todos
                  </Link>
                </div>
                {!loadingLogros && logrosDesbloqueados.length === 0 && (
                  <p className="text-sm text-atenas-muted">
                    Completa actividades y evaluaciones para desbloquear logros.
                  </p>
                )}
                {logrosDesbloqueados.length > 0 && (
                  <ul className="grid gap-3 sm:grid-cols-2">
                    {logrosDesbloqueados.slice(0, 4).map((l) => (
                      <li
                        key={l.id}
                        className="flex items-start gap-3 rounded-xl border border-amber-200/60 bg-gradient-to-br from-amber-50/80 to-white p-3"
                      >
                        <div
                          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-atenas-gold to-amber-500 text-sm font-bold text-atenas-ink shadow-sm"
                          aria-hidden
                        >
                          {l.icon || '⭐'}
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-semibold text-atenas-ink leading-snug">{l.title}</p>
                          {l.description && (
                            <p className="text-xs text-atenas-muted mt-0.5 line-clamp-2">{l.description}</p>
                          )}
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </Card>
            </>
          )}
        </div>
      )}

      {!esEstudiante && (
        <Card padding="lg">
          <h2 className="text-base font-bold text-atenas-ink mb-2">Progreso y logros</h2>
          <p className="text-sm text-atenas-muted">
            El progreso detallado y los logros están disponibles para cuentas de estudiante.
          </p>
        </Card>
      )}
    </div>
  );
}
