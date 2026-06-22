import { useState, useEffect, useMemo } from 'react';
import {
  Activity,
  BookOpen,
  ChevronDown,
  GraduationCap,
  Pencil,
  Plus,
  Power,
  Search,
  UserCog,
  Users,
  UserX,
} from 'lucide-react';
import { PageHeader } from '../components/ui/PageHeader';
import { SkeletonLines } from '../components/ui/Skeleton';
import { Input, Select } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Card } from '../components/ui/Card';
import { Alert } from '../components/ui/Alert';
import { EmptyState } from '../components/ui/EmptyState';
import {
  DataTable,
  DataTableBody,
  DataTableHead,
  DataTableRow,
  DataTableShell,
  DataTableTd,
  DataTableTh,
  TableCellStack,
} from '../components/ui/DataTable';
import { Form, FormBody, FormFooter, FormGrid, FormHeader, FormSection } from '../components/ui/Form';
import { FormModal } from '../components/ui/FormModal';
import { supabase } from '../lib/supabase';
import { useProfiles } from '../hooks/useProfiles';
import { useUnidades } from '../hooks/useUnidades';
import { tituloUnidadFiltro, tituloUnidadFiltroCompleto } from '../lib/unidadTitulo';
import type { Profile, UserRole, Unidad } from '../types';

const ROL_LABEL: Record<UserRole, string> = {
  estudiante: 'Estudiante',
  docente: 'Docente',
  admin: 'Administrador',
};

function iniciales(nombre: string): string {
  return nombre
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? '')
    .join('');
}

function rolBadgeTone(role: UserRole): 'default' | 'gold' | 'warning' {
  if (role === 'admin') return 'warning';
  if (role === 'docente') return 'gold';
  return 'default';
}

function AsignarDocenteUnidades({
  docentes,
  unidades,
  onGuardado,
  onError,
}: {
  docentes: Profile[];
  unidades: Unidad[];
  onGuardado: (t: string) => void;
  onError: (t: string) => void;
}) {
  const [selDoc, setSelDoc] = useState('');
  const [checks, setChecks] = useState<Record<string, boolean>>({});
  const [loadingAsig, setLoadingAsig] = useState(false);

  useEffect(() => {
    if (!selDoc) {
      setChecks({});
      return;
    }
    let c = false;
    (async () => {
      const { data, error } = await supabase
        .from('docente_unidad')
        .select('unidad_id')
        .eq('docente_id', selDoc);
      if (c || error) return;
      const set = new Set((data ?? []).map((r: { unidad_id: string }) => r.unidad_id));
      const m: Record<string, boolean> = {};
      for (const u of unidades) m[u.id] = set.has(u.id);
      setChecks(m);
    })();
    return () => {
      c = true;
    };
  }, [selDoc, unidades]);

  async function guardar() {
    if (!selDoc) return;
    setLoadingAsig(true);
    try {
      await supabase.from('docente_unidad').delete().eq('docente_id', selDoc);
      const rows = Object.entries(checks)
        .filter(([, v]) => v)
        .map(([unidad_id]) => ({ docente_id: selDoc, unidad_id }));
      if (rows.length) {
        const { error } = await supabase.from('docente_unidad').insert(rows);
        if (error) throw error;
      }
      onGuardado(
        rows.length
          ? 'Unidades asignadas al docente.'
          : 'Sin unidades marcadas: el docente verá todas las unidades.'
      );
    } catch (e) {
      onError(e instanceof Error ? e.message : 'Error al guardar asignaciones');
    } finally {
      setLoadingAsig(false);
    }
  }

  if (!docentes.length || !unidades.length) return null;

  return (
    <details className="card mb-6 overflow-hidden group">
      <summary className="form-panel-header cursor-pointer list-none [&::-webkit-details-marker]:hidden flex items-center gap-3 select-none">
        <div className="shrink-0 w-10 h-10 rounded-xl bg-atenas-blue/10 text-atenas-blue flex items-center justify-center">
          <BookOpen className="w-5 h-5" aria-hidden />
        </div>
        <div className="flex-1 min-w-0 text-left">
          <h2 className="text-sm font-bold text-atenas-ink">Asignar unidades a docentes</h2>
          <p className="text-xs text-atenas-muted mt-0.5 leading-snug">
            Opcional — restringe qué unidades ve cada docente en Contenidos.
          </p>
        </div>
        <ChevronDown
          className="w-5 h-5 text-atenas-muted shrink-0 transition-transform group-open:rotate-180"
          aria-hidden
        />
      </summary>
      <FormBody className="border-t border-atenas-mist-border">
        <Select
          id="asig-docente-sel"
          label="Docente"
          hint="Elige el docente al que quieres restringir o liberar unidades."
          value={selDoc}
          onChange={(e) => setSelDoc(e.target.value)}
          className="max-w-xl"
        >
          <option value="">Seleccionar docente…</option>
          {docentes.map((d) => (
            <option key={d.id} value={d.id}>
              {d.full_name} · {d.email}
            </option>
          ))}
        </Select>
        {selDoc && (
          <FormSection
            boxed
            title="Unidades visibles"
            description="Marca las unidades que este docente podrá gestionar en Contenidos."
          >
            <ul className="form-check-list">
              {unidades.map((u) => (
                <li key={u.id}>
                  <label className="form-check-item">
                    <input
                      type="checkbox"
                      checked={checks[u.id] === true}
                      onChange={(e) =>
                        setChecks((prev) => ({ ...prev, [u.id]: e.target.checked }))
                      }
                    />
                    <span className="font-medium leading-snug">{u.title}</span>
                  </label>
                </li>
              ))}
            </ul>
          </FormSection>
        )}
      </FormBody>
      {selDoc && (
        <FormFooter className="border-t border-atenas-mist-border">
          <Button type="button" disabled={loadingAsig} onClick={guardar}>
            {loadingAsig ? 'Guardando…' : 'Guardar asignaciones'}
          </Button>
        </FormFooter>
      )}
    </details>
  );
}

type UsuarioCardProps = {
  profile: Profile;
  editing: boolean;
  editName: string;
  editRole: UserRole;
  onEditName: (v: string) => void;
  onEditRole: (v: UserRole) => void;
  onSubmitEdit: (e: React.FormEvent) => void;
  onCancelEdit: () => void;
  onStartEdit: () => void;
  onToggleActivo: () => void;
};

function UsuarioCard({
  profile: p,
  editing,
  editName,
  editRole,
  onEditName,
  onEditRole,
  onSubmitEdit,
  onCancelEdit,
  onStartEdit,
  onToggleActivo,
}: UsuarioCardProps) {
  const inactivo = p.activo === false;

  if (editing) {
    return (
      <Card padding="none" className="border-atenas-blue/25 ring-1 ring-atenas-blue/10 overflow-hidden">
        <Form onSubmit={onSubmitEdit}>
          <FormHeader title="Editar usuario" icon={<Pencil className="w-5 h-5" />} />
          <FormBody>
            <Input
              value={editName}
              onChange={(e) => onEditName(e.target.value)}
              label="Nombre"
              required
            />
            <Select
              value={editRole}
              onChange={(e) => onEditRole(e.target.value as UserRole)}
              label="Rol"
            >
              <option value="estudiante">Estudiante</option>
              <option value="docente">Docente</option>
              <option value="admin">Administrador</option>
            </Select>
          </FormBody>
          <FormFooter>
            <Button type="button" variant="secondary" onClick={onCancelEdit}>
              Cancelar
            </Button>
            <Button type="submit">Guardar</Button>
          </FormFooter>
        </Form>
      </Card>
    );
  }

  return (
    <Card padding="md" className={inactivo ? 'opacity-75 bg-atenas-mist/40' : undefined}>
      <div className="flex items-start gap-3">
        <div
          className="w-10 h-10 rounded-xl bg-atenas-sidebar text-white text-xs font-bold flex items-center justify-center shrink-0"
          aria-hidden
        >
          {iniciales(p.full_name)}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <p className="font-semibold text-atenas-ink leading-snug truncate">{p.full_name}</p>
            <Badge tone={rolBadgeTone(p.role)}>{ROL_LABEL[p.role]}</Badge>
          </div>
          <p className="text-xs text-atenas-muted truncate mt-0.5">{p.email}</p>
          <div className="mt-2.5 flex flex-wrap items-center justify-between gap-2">
            <Badge tone={inactivo ? 'muted' : 'success'}>{inactivo ? 'Desactivado' : 'Activo'}</Badge>
            <div className="flex items-center gap-1.5 shrink-0 ml-auto">
              <button
                type="button"
                onClick={onStartEdit}
                className="table-action-btn"
                title="Editar usuario"
                aria-label={`Editar ${p.full_name}`}
              >
                <Pencil aria-hidden />
              </button>
              <button
                type="button"
                onClick={onToggleActivo}
                className={
                  inactivo
                    ? 'table-action-btn table-action-btn--success'
                    : 'table-action-btn table-action-btn--danger'
                }
                title={inactivo ? 'Activar usuario' : 'Desactivar usuario'}
                aria-label={inactivo ? `Activar ${p.full_name}` : `Desactivar ${p.full_name}`}
              >
                <Power aria-hidden />
              </button>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}

export default function AdminPanel() {
  const { profiles, loading, error, refetch, updateProfile } = useProfiles(undefined, true);
  const { unidades } = useUnidades();
  const [creating, setCreating] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formEmail, setFormEmail] = useState('');
  const [formPassword, setFormPassword] = useState('');
  const [formFullName, setFormFullName] = useState('');
  const [formRole, setFormRole] = useState<UserRole>('estudiante');
  const [editName, setEditName] = useState('');
  const [editRole, setEditRole] = useState<UserRole>('estudiante');
  const [message, setMessage] = useState<{ type: 'ok' | 'error'; text: string } | null>(null);

  const [filtroRol, setFiltroRol] = useState<'' | UserRole>('');
  const [filtroActivo, setFiltroActivo] = useState<'todos' | 'activo' | 'inactivo'>('todos');
  const [busqueda, setBusqueda] = useState('');
  const [unidadActividadId, setUnidadActividadId] = useState('');
  const [userIdsEnUnidad, setUserIdsEnUnidad] = useState<Set<string> | null>(null);

  const [stats, setStats] = useState<{
    estudiantesActivos: number;
    intentosHoy: number;
    intentosSemana: number;
  } | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const now = new Date();
      const startDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const isoDay = startDay.toISOString();
      const startWeek = new Date(startDay);
      startWeek.setDate(startWeek.getDate() - 6);
      const isoWeek = startWeek.toISOString();
      try {
        const [{ count: ca }, { count: ce }, { count: wa }, { count: we }, estRes] =
          await Promise.all([
            supabase
              .from('actividad_intentos')
              .select('*', { count: 'exact', head: true })
              .gte('completado_at', isoDay),
            supabase
              .from('evaluacion_intentos')
              .select('*', { count: 'exact', head: true })
              .gte('completado_at', isoDay),
            supabase
              .from('actividad_intentos')
              .select('*', { count: 'exact', head: true })
              .gte('completado_at', isoWeek),
            supabase
              .from('evaluacion_intentos')
              .select('*', { count: 'exact', head: true })
              .gte('completado_at', isoWeek),
            supabase.from('profiles').select('activo').eq('role', 'estudiante'),
          ]);
        if (cancelled) return;
        const estudiantesActivos = (estRes.data ?? []).filter(
          (r: { activo?: boolean }) => r.activo !== false
        ).length;
        setStats({
          estudiantesActivos,
          intentosHoy: (ca ?? 0) + (ce ?? 0),
          intentosSemana: (wa ?? 0) + (we ?? 0),
        });
      } catch {
        if (!cancelled) setStats(null);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!unidadActividadId) {
      setUserIdsEnUnidad(null);
      return;
    }
    let cancelled = false;
    (async () => {
      const { data: temas, error: e1 } = await supabase
        .from('temas')
        .select('id')
        .eq('unidad_id', unidadActividadId);
      if (e1 || cancelled) return;
      const temaIds = (temas ?? []).map((t: { id: string }) => t.id);
      if (!temaIds.length) {
        setUserIdsEnUnidad(new Set());
        return;
      }
      const [{ data: acts }, { data: evs }] = await Promise.all([
        supabase.from('actividades').select('id').in('tema_id', temaIds),
        supabase.from('evaluaciones').select('id').in('tema_id', temaIds),
      ]);
      if (cancelled) return;
      const actIds = (acts ?? []).map((a: { id: string }) => a.id);
      const evalIds = (evs ?? []).map((x: { id: string }) => x.id);
      const users = new Set<string>();
      if (actIds.length) {
        const { data: ia } = await supabase.from('actividad_intentos').select('user_id').in('actividad_id', actIds);
        (ia ?? []).forEach((r: { user_id: string }) => users.add(r.user_id));
      }
      if (evalIds.length) {
        const { data: ie } = await supabase.from('evaluacion_intentos').select('user_id').in('evaluacion_id', evalIds);
        (ie ?? []).forEach((r: { user_id: string }) => users.add(r.user_id));
      }
      if (!cancelled) setUserIdsEnUnidad(users);
    })();
    return () => {
      cancelled = true;
    };
  }, [unidadActividadId]);

  const resumenRoles = useMemo(() => {
    const docentes = profiles.filter((p) => p.role === 'docente' && p.activo !== false).length;
    return { total: profiles.length, docentes };
  }, [profiles]);

  const profilesFiltrados = useMemo(() => {
    const q = busqueda.trim().toLowerCase();
    return profiles.filter((p) => {
      if (filtroRol && p.role !== filtroRol) return false;
      if (filtroActivo === 'activo' && p.activo === false) return false;
      if (filtroActivo === 'inactivo' && p.activo !== false) return false;
      if (q && !p.full_name.toLowerCase().includes(q) && !p.email.toLowerCase().includes(q)) return false;
      if (userIdsEnUnidad && !userIdsEnUnidad.has(p.id)) return false;
      return true;
    });
  }, [profiles, filtroRol, filtroActivo, busqueda, userIdsEnUnidad]);

  const hayFiltros =
    busqueda.trim() !== '' ||
    filtroRol !== '' ||
    filtroActivo !== 'todos' ||
    unidadActividadId !== '';

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setMessage(null);
    try {
      const { data, error: signUpError } = await supabase.auth.signUp({
        email: formEmail.trim(),
        password: formPassword,
        options: {
          data: { full_name: formFullName.trim(), role: formRole },
        },
      });
      if (signUpError) throw signUpError;
      if (!data.user) throw new Error('No se creó el usuario');

      const { error: profileError } = await supabase.from('profiles').insert({
        id: data.user.id,
        email: data.user.email ?? formEmail.trim(),
        full_name: formFullName.trim(),
        role: formRole,
      });
      if (profileError) throw profileError;
      setMessage({
        type: 'ok',
        text: 'Usuario creado. Puede iniciar sesión con ese correo y contraseña.',
      });
      setFormEmail('');
      setFormPassword('');
      setFormFullName('');
      setFormRole('estudiante');
      setCreating(false);
      refetch();
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      const isRateLimit =
        msg.toLowerCase().includes('rate limit') ||
        msg.toLowerCase().includes('too many requests') ||
        (err && typeof err === 'object' && 'status' in err && (err as { status?: number }).status === 429);
      setMessage({
        type: 'error',
        text: isRateLimit
          ? 'Límite de solicitudes alcanzado. Espera 1-2 minutos e intenta de nuevo.'
          : msg || 'Error al crear el usuario',
      });
    }
  }

  function startEdit(p: Profile) {
    setCreating(false);
    setEditingId(p.id);
    setEditName(p.full_name);
    setEditRole(p.role);
  }

  async function handleUpdate(e: React.FormEvent, id: string) {
    e.preventDefault();
    setMessage(null);
    try {
      await updateProfile(id, { full_name: editName.trim(), role: editRole });
      setMessage({ type: 'ok', text: 'Perfil actualizado.' });
      setEditingId(null);
      refetch();
    } catch (err) {
      setMessage({
        type: 'error',
        text: err instanceof Error ? err.message : 'Error al actualizar',
      });
    }
  }

  async function handleToggleActivo(id: string, activo: boolean) {
    setMessage(null);
    try {
      await updateProfile(id, { activo: !activo });
      setMessage({ type: 'ok', text: activo ? 'Usuario desactivado.' : 'Usuario activado.' });
      refetch();
    } catch (err) {
      setMessage({
        type: 'error',
        text: err instanceof Error ? err.message : 'Error al actualizar',
      });
    }
  }

  function limpiarFiltros() {
    setBusqueda('');
    setFiltroRol('');
    setFiltroActivo('todos');
    setUnidadActividadId('');
  }

  if (loading) {
    return (
      <div>
        <PageHeader
          variant="hero"
          eyebrow="Administración"
          title="Gestión de usuarios"
          description="Alta, roles y estado de cuentas."
          icon={<Users className="w-6 h-6" />}
        />
        <SkeletonLines lines={6} />
      </div>
    );
  }
  if (error) {
    return (
      <Alert tone="error" className="mt-4">
        {error}
      </Alert>
    );
  }

  return (
    <div>
      <PageHeader
        variant="hero"
        breadcrumbs={[
          { label: 'Administración', to: '/admin' },
          { label: 'Usuarios' },
        ]}
        icon={<Users className="w-6 h-6" />}
        title="Gestión de usuarios"
        description="Alta de cuentas, roles y acceso a la plataforma."
        actions={
          <Button
            type="button"
            variant="gold"
            className="inline-flex items-center justify-center gap-1.5 w-full sm:w-auto min-h-touch px-5 text-sm"
            onClick={() => {
              setEditingId(null);
              setFormEmail('');
              setFormPassword('');
              setFormFullName('');
              setFormRole('estudiante');
              setCreating(true);
            }}
          >
            <Plus className="w-4 h-4" aria-hidden />
            Nuevo usuario
          </Button>
        }
      />

      <div
        className="flex flex-wrap items-center gap-x-5 gap-y-2 mb-4 px-0.5 text-xs sm:text-sm text-atenas-muted"
        aria-label="Resumen de actividad"
      >
        <span className="inline-flex items-center gap-1.5">
          <GraduationCap className="w-4 h-4 text-atenas-blue shrink-0" aria-hidden />
          <span>
            <strong className="text-atenas-ink font-semibold tabular-nums">
              {stats?.estudiantesActivos ?? '—'}
            </strong>{' '}
            estudiantes activos
          </span>
        </span>
        <span className="hidden sm:inline text-atenas-mist-border" aria-hidden>
          ·
        </span>
        <span className="inline-flex items-center gap-1.5">
          <UserCog className="w-4 h-4 text-atenas-gold shrink-0" aria-hidden />
          <span>
            <strong className="text-atenas-ink font-semibold tabular-nums">{resumenRoles.docentes}</strong>{' '}
            docentes
          </span>
        </span>
        <span className="hidden sm:inline text-atenas-mist-border" aria-hidden>
          ·
        </span>
        <span className="inline-flex items-center gap-1.5">
          <Activity className="w-4 h-4 text-atenas-success shrink-0" aria-hidden />
          <span>
            <strong className="text-atenas-ink font-semibold tabular-nums">{stats?.intentosHoy ?? '—'}</strong>{' '}
            intentos hoy
          </span>
        </span>
        <span className="hidden md:inline text-atenas-mist-border" aria-hidden>
          ·
        </span>
        <span className="hidden md:inline-flex items-center gap-1.5">
          <BookOpen className="w-4 h-4 text-atenas-blue shrink-0" aria-hidden />
          <span>
            <strong className="text-atenas-ink font-semibold tabular-nums">{stats?.intentosSemana ?? '—'}</strong>{' '}
            en 7 días
          </span>
        </span>
      </div>

      {message && (
        <Alert tone={message.type === 'ok' ? 'success' : 'error'} className="mb-4">
          {message.text}
        </Alert>
      )}

      <FormModal
        open={creating}
        onClose={() => setCreating(false)}
        title="Nuevo usuario"
        description="Supabase puede limitar registros por minuto. Si falla, espera un momento e inténtalo de nuevo."
        icon={<Plus className="w-5 h-5" />}
      >
        <Form onSubmit={handleCreate}>
          <FormBody>
            <FormGrid>
              <Input
                id="nu-email"
                type="email"
                label="Correo"
                value={formEmail}
                onChange={(e) => setFormEmail(e.target.value)}
                placeholder="correo@ejemplo.com"
                required
              />
              <Input
                id="nu-pass"
                type="password"
                label="Contraseña temporal"
                value={formPassword}
                onChange={(e) => setFormPassword(e.target.value)}
                placeholder="Mínimo 6 caracteres"
                required
                minLength={6}
              />
            </FormGrid>
            <FormGrid>
              <Input
                id="nu-name"
                label="Nombre completo"
                value={formFullName}
                onChange={(e) => setFormFullName(e.target.value)}
                placeholder="Nombre y apellidos"
                required
              />
              <Select
                id="nu-role"
                label="Rol"
                value={formRole}
                onChange={(e) => setFormRole(e.target.value as UserRole)}
              >
                <option value="estudiante">Estudiante</option>
                <option value="docente">Docente</option>
                <option value="admin">Administrador</option>
              </Select>
            </FormGrid>
          </FormBody>
          <FormFooter>
            <Button type="button" variant="secondary" onClick={() => setCreating(false)}>
              Cancelar
            </Button>
            <Button type="submit">Crear usuario</Button>
          </FormFooter>
        </Form>
      </FormModal>

      <Card padding="sm" className="mb-4">
        <div className="flex flex-col gap-3">
          <div className="flex flex-col sm:flex-row sm:items-center gap-2">
            <div className="relative flex-1 min-w-0">
              <Search
                className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-atenas-muted pointer-events-none z-10"
                aria-hidden
              />
              <Input
                type="search"
                placeholder="Buscar por nombre o correo…"
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                aria-label="Buscar usuarios"
                className="pl-11"
              />
            </div>
            <div className="flex items-center justify-between sm:justify-end gap-2 shrink-0">
              <span className="text-xs text-atenas-muted whitespace-nowrap tabular-nums">
                <strong className="text-atenas-ink font-semibold">{profilesFiltrados.length}</strong>
                <span className="text-atenas-muted"> / {profiles.length}</span>
              </span>
              {hayFiltros && (
                <Button type="button" variant="secondary" className="text-xs px-3 py-2 min-h-0" onClick={limpiarFiltros}>
                  Limpiar
                </Button>
              )}
            </div>
          </div>

          <div
            className="flex gap-1 p-1 rounded-xl bg-atenas-page border border-atenas-mist-border overflow-x-auto scrollbar-nav-hide"
            role="tablist"
            aria-label="Filtrar por rol"
          >
            {(
              [
                ['', 'Todos'],
                ['estudiante', 'Estudiantes'],
                ['docente', 'Docentes'],
                ['admin', 'Admins'],
              ] as const
            ).map(([key, label]) => (
              <button
                key={key || 'all'}
                type="button"
                role="tab"
                aria-selected={filtroRol === key}
                className={`segment-tab shrink-0 flex-1 sm:flex-none min-w-[5rem] text-xs sm:text-sm ${filtroRol === key ? 'segment-tab--active' : 'segment-tab--inactive'}`}
                onClick={() => setFiltroRol(key)}
              >
                {label}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="flex flex-col min-w-0">
              <p id="filtro-estado-label" className="form-section-title mb-1.5 min-h-[1.25rem]">
                Estado
              </p>
              <Select
                value={filtroActivo}
                onChange={(e) => setFiltroActivo(e.target.value as typeof filtroActivo)}
                aria-labelledby="filtro-estado-label"
              >
                <option value="todos">Todos los estados</option>
                <option value="activo">Solo activos</option>
                <option value="inactivo">Solo inactivos</option>
              </Select>
            </div>
            <div className="flex flex-col min-w-0">
              <p id="filtro-unidad-label" className="form-section-title mb-1.5 min-h-[1.25rem]">
                Unidad con actividad
              </p>
              <Select
                id="filtro-unidad-actividad"
                value={unidadActividadId}
                onChange={(e) => setUnidadActividadId(e.target.value)}
                aria-labelledby="filtro-unidad-label"
              >
                <option value="">Todas las unidades</option>
                {unidades.map((u, index) => {
                  const completo = tituloUnidadFiltroCompleto(u.orden ?? 0, u.title, index);
                  const corto = tituloUnidadFiltro(u.orden ?? 0, u.title, index);
                  return (
                    <option key={u.id} value={u.id} title={completo}>
                      {corto}
                    </option>
                  );
                })}
              </Select>
            </div>
          </div>

          {hayFiltros && (
            <div className="flex justify-end">
              <Badge tone="default" className="text-[10px]">
                Filtros activos
              </Badge>
            </div>
          )}
        </div>
      </Card>

      {profiles.length === 0 && !creating ? (
        <EmptyState
          title="No hay usuarios"
          description="Crea el primer estudiante o docente con el botón Nuevo usuario."
          icon={<Users className="w-7 h-7 text-atenas-blue" />}
          action={
            <Button type="button" className="inline-flex items-center gap-1.5" onClick={() => setCreating(true)}>
              <Plus className="w-4 h-4" aria-hidden />
              Crear usuario
            </Button>
          }
        />
      ) : profilesFiltrados.length === 0 ? (
        <EmptyState
          title="Sin resultados"
          description="Ningún usuario coincide con los filtros aplicados."
          icon={<UserX className="w-7 h-7 text-atenas-muted" />}
          action={
            <Button type="button" variant="secondary" onClick={limpiarFiltros}>
              Limpiar filtros
            </Button>
          }
        />
      ) : (
        <>
          <div className="md:hidden space-y-3 mb-6">
            {profilesFiltrados.map((p) => (
              <UsuarioCard
                key={p.id}
                profile={p}
                editing={editingId === p.id}
                editName={editName}
                editRole={editRole}
                onEditName={setEditName}
                onEditRole={setEditRole}
                onSubmitEdit={(e) => void handleUpdate(e, p.id)}
                onCancelEdit={() => setEditingId(null)}
                onStartEdit={() => startEdit(p)}
                onToggleActivo={() => void handleToggleActivo(p.id, p.activo !== false)}
              />
            ))}
          </div>

          <div className="hidden md:block">
          <div className="flex items-center justify-between mb-2 px-0.5">
            <h2 className="text-sm font-bold text-atenas-ink">Usuarios</h2>
            <span className="text-xs text-atenas-muted tabular-nums">
              {profilesFiltrados.length} de {profiles.length}
            </span>
          </div>
          <DataTableShell className="mb-4">
            <DataTable>
              <DataTableHead>
                <DataTableRow>
                  <DataTableTh>Usuario</DataTableTh>
                  <DataTableTh>Rol</DataTableTh>
                  <DataTableTh>Estado</DataTableTh>
                  <DataTableTh align="right">Acciones</DataTableTh>
                </DataTableRow>
              </DataTableHead>
              <DataTableBody>
                {profilesFiltrados.map((p) => (
                  <DataTableRow key={p.id} className={p.activo === false ? 'opacity-75' : undefined}>
                    <DataTableTd>
                      {editingId === p.id ? (
                        <form
                          onSubmit={(e) => handleUpdate(e, p.id)}
                          className="flex flex-wrap items-center gap-2"
                        >
                          <input
                            value={editName}
                            onChange={(e) => setEditName(e.target.value)}
                            className="input-field input-field--compact max-w-[180px]"
                            required
                          />
                          <select
                            value={editRole}
                            onChange={(e) => setEditRole(e.target.value as UserRole)}
                            className="input-field input-field--compact max-w-[140px]"
                          >
                            <option value="estudiante">Estudiante</option>
                            <option value="docente">Docente</option>
                            <option value="admin">Admin</option>
                          </select>
                          <Button type="submit" size="sm">
                            Guardar
                          </Button>
                          <Button type="button" variant="secondary" size="sm" onClick={() => setEditingId(null)}>
                            Cancelar
                          </Button>
                        </form>
                      ) : (
                        <div className="flex items-center gap-3 min-w-[200px]">
                          <div
                            className="w-9 h-9 rounded-full bg-atenas-sidebar text-white text-xs font-bold flex items-center justify-center shrink-0"
                            aria-hidden
                          >
                            {iniciales(p.full_name)}
                          </div>
                          <TableCellStack primary={p.full_name} secondary={p.email} />
                        </div>
                      )}
                    </DataTableTd>
                    <DataTableTd>
                      <Badge tone={rolBadgeTone(p.role)}>{ROL_LABEL[p.role]}</Badge>
                    </DataTableTd>
                    <DataTableTd>
                      <Badge tone={p.activo === false ? 'muted' : 'success'}>
                        {p.activo === false ? 'Desactivado' : 'Activo'}
                      </Badge>
                    </DataTableTd>
                    <DataTableTd align="right">
                      {editingId !== p.id && (
                        <div className="table-actions">
                          <button
                            type="button"
                            onClick={() => startEdit(p)}
                            className="table-action-btn"
                            title="Editar usuario"
                            aria-label={`Editar ${p.full_name}`}
                          >
                            <Pencil aria-hidden />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleToggleActivo(p.id, p.activo !== false)}
                            className={
                              p.activo === false
                                ? 'table-action-btn table-action-btn--success'
                                : 'table-action-btn table-action-btn--danger'
                            }
                            title={p.activo === false ? 'Activar usuario' : 'Desactivar usuario'}
                            aria-label={
                              p.activo === false ? `Activar ${p.full_name}` : `Desactivar ${p.full_name}`
                            }
                          >
                            <Power aria-hidden />
                          </button>
                        </div>
                      )}
                    </DataTableTd>
                  </DataTableRow>
                ))}
              </DataTableBody>
            </DataTable>
          </DataTableShell>
          </div>
        </>
      )}

      <AsignarDocenteUnidades
        docentes={profiles.filter((p) => p.role === 'docente')}
        unidades={unidades}
        onGuardado={(text) => setMessage({ type: 'ok', text })}
        onError={(text) => setMessage({ type: 'error', text })}
      />
    </div>
  );
}
