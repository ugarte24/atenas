import { useState, useEffect, useMemo } from 'react';
import {
  Activity,
  BookOpen,
  GraduationCap,
  Plus,
  Search,
  UserCog,
  Users,
  UserX,
} from 'lucide-react';
import { PageHeader } from '../components/ui/PageHeader';
import { StatCard } from '../components/ui/StatCard';
import { SkeletonLines } from '../components/ui/Skeleton';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Card } from '../components/ui/Card';
import { Alert } from '../components/ui/Alert';
import { EmptyState } from '../components/ui/EmptyState';
import { supabase } from '../lib/supabase';
import { useProfiles } from '../hooks/useProfiles';
import { useUnidades } from '../hooks/useUnidades';
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
    <Card padding="md" className="mb-6">
      <h2 className="text-base font-bold text-atenas-ink mb-1">Asignar unidades a docentes</h2>
      <p className="text-sm text-atenas-muted mb-4">
        Si no marcas ninguna unidad, el docente verá todas. Si marcas al menos una, solo verá esas.
      </p>
      <label htmlFor="asig-docente-sel" className="label">
        Docente
      </label>
      <select
        id="asig-docente-sel"
        className="input-field max-w-md mb-4"
        value={selDoc}
        onChange={(e) => setSelDoc(e.target.value)}
      >
        <option value="">— Elegir docente —</option>
        {docentes.map((d) => (
          <option key={d.id} value={d.id}>
            {d.full_name} ({d.email})
          </option>
        ))}
      </select>
      {selDoc && (
        <>
          <fieldset className="border border-atenas-mist-border rounded-xl p-3 mb-4 bg-atenas-page/50">
            <legend className="text-sm font-medium px-1 text-atenas-ink">Unidades visibles</legend>
            <ul className="space-y-2 list-none m-0 p-0 max-h-48 overflow-y-auto scrollbar-nav-hide">
              {unidades.map((u) => (
                <li key={u.id}>
                  <label className="flex items-center gap-2 text-atenas-ink cursor-pointer text-sm min-h-touch">
                    <input
                      type="checkbox"
                      className="rounded border-atenas-mist-border"
                      checked={checks[u.id] === true}
                      onChange={(e) =>
                        setChecks((prev) => ({ ...prev, [u.id]: e.target.checked }))
                      }
                    />
                    {u.title}
                  </label>
                </li>
              ))}
            </ul>
          </fieldset>
          <Button type="button" disabled={loadingAsig} onClick={guardar}>
            {loadingAsig ? 'Guardando…' : 'Guardar asignaciones'}
          </Button>
        </>
      )}
    </Card>
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
      <Card padding="md" className="border-atenas-blue/20 ring-1 ring-atenas-blue/10">
        <form onSubmit={onSubmitEdit} className="space-y-3">
          <p className="text-sm font-semibold text-atenas-ink">Editar usuario</p>
          <input
            value={editName}
            onChange={(e) => onEditName(e.target.value)}
            className="input-field"
            required
            aria-label="Nombre"
          />
          <select
            value={editRole}
            onChange={(e) => onEditRole(e.target.value as UserRole)}
            className="input-field"
            aria-label="Rol"
          >
            <option value="estudiante">Estudiante</option>
            <option value="docente">Docente</option>
            <option value="admin">Administrador</option>
          </select>
          <div className="flex flex-wrap gap-2">
            <Button type="submit">Guardar</Button>
            <Button type="button" variant="secondary" onClick={onCancelEdit}>
              Cancelar
            </Button>
          </div>
        </form>
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
          <div className="mt-2">
            <Badge tone={inactivo ? 'muted' : 'success'}>{inactivo ? 'Desactivado' : 'Activo'}</Badge>
          </div>
        </div>
      </div>
      <div className="flex flex-wrap gap-2 mt-4 pt-3 border-t border-atenas-mist-border">
        <Button type="button" variant="secondary" className="text-sm px-3" onClick={onStartEdit}>
          Editar
        </Button>
        <Button
          type="button"
          variant={inactivo ? 'primary' : 'danger'}
          className="text-sm px-3"
          onClick={onToggleActivo}
        >
          {inactivo ? 'Activar' : 'Desactivar'}
        </Button>
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
        <PageHeader title="Gestión de usuarios" description="Alta, roles y estado de cuentas." />
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
        title="Gestión de usuarios"
        description="Dar de alta estudiantes y docentes. Edita roles y activa o desactiva cuentas."
        actions={
          !creating ? (
            <Button
              type="button"
              className="inline-flex items-center gap-1.5"
              onClick={() => {
                setEditingId(null);
                setCreating(true);
              }}
            >
              <Plus className="w-4 h-4" aria-hidden />
              Nuevo usuario
            </Button>
          ) : undefined
        }
      />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        <StatCard
          label="Estudiantes activos"
          value={stats?.estudiantesActivos ?? '—'}
          icon={<GraduationCap className="w-5 h-5 text-atenas-blue" />}
        />
        <StatCard
          label="Docentes"
          value={resumenRoles.docentes}
          hint={`${resumenRoles.total} usuarios total`}
          icon={<UserCog className="w-5 h-5 text-atenas-gold" />}
        />
        <StatCard
          label="Intentos hoy"
          value={stats?.intentosHoy ?? '—'}
          hint="Actividades + evaluaciones"
          icon={<Activity className="w-5 h-5 text-atenas-success" />}
        />
        <StatCard
          label="Intentos (7 días)"
          value={stats?.intentosSemana ?? '—'}
          icon={<BookOpen className="w-5 h-5 text-violet-600" />}
        />
      </div>

      {message && (
        <Alert tone={message.type === 'ok' ? 'success' : 'error'} className="mb-6">
          {message.text}
        </Alert>
      )}

      {creating && (
        <Card padding="md" className="mb-6 border-atenas-success/20 ring-1 ring-atenas-success/10">
          <form onSubmit={handleCreate} className="space-y-4 max-w-lg">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h2 className="text-base font-bold text-atenas-ink">Nuevo usuario</h2>
                <p className="text-sm text-atenas-muted mt-1">
                  Supabase puede limitar registros por minuto. Si falla, espera un momento.
                </p>
              </div>
              <Button type="button" variant="secondary" onClick={() => setCreating(false)}>
                Cancelar
              </Button>
            </div>
            <div>
              <label htmlFor="nu-email" className="label">
                Correo
              </label>
              <input
                id="nu-email"
                type="email"
                value={formEmail}
                onChange={(e) => setFormEmail(e.target.value)}
                placeholder="correo@ejemplo.com"
                className="input-field"
                required
              />
            </div>
            <div>
              <label htmlFor="nu-pass" className="label">
                Contraseña temporal
              </label>
              <input
                id="nu-pass"
                type="password"
                value={formPassword}
                onChange={(e) => setFormPassword(e.target.value)}
                placeholder="Mínimo 6 caracteres"
                className="input-field"
                required
                minLength={6}
              />
            </div>
            <div>
              <label htmlFor="nu-name" className="label">
                Nombre completo
              </label>
              <input
                id="nu-name"
                value={formFullName}
                onChange={(e) => setFormFullName(e.target.value)}
                placeholder="Nombre y apellidos"
                className="input-field"
                required
              />
            </div>
            <div>
              <label htmlFor="nu-role" className="label">
                Rol
              </label>
              <select
                id="nu-role"
                value={formRole}
                onChange={(e) => setFormRole(e.target.value as UserRole)}
                className="input-field"
              >
                <option value="estudiante">Estudiante</option>
                <option value="docente">Docente</option>
                <option value="admin">Administrador</option>
              </select>
            </div>
            <Button type="submit">Crear usuario</Button>
          </form>
        </Card>
      )}

      <AsignarDocenteUnidades
        docentes={profiles.filter((p) => p.role === 'docente')}
        unidades={unidades}
        onGuardado={(text) => setMessage({ type: 'ok', text })}
        onError={(text) => setMessage({ type: 'error', text })}
      />

      <div className="mb-5 space-y-3">
        <div className="relative max-w-md">
          <Search
            className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-atenas-muted pointer-events-none"
            aria-hidden
          />
          <Input
            type="search"
            placeholder="Buscar nombre o correo…"
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            aria-label="Buscar usuarios"
            className="pl-9"
          />
        </div>

        <div
          className="flex gap-1 p-1 rounded-xl bg-atenas-mist border border-atenas-mist-border overflow-x-auto scrollbar-nav-hide"
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
              className={`segment-tab shrink-0 ${filtroRol === key ? 'segment-tab--active' : 'segment-tab--inactive'}`}
              onClick={() => setFiltroRol(key)}
            >
              {label}
            </button>
          ))}
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <select
            value={filtroActivo}
            onChange={(e) => setFiltroActivo(e.target.value as typeof filtroActivo)}
            className="input-field max-w-xs text-sm min-h-touch"
            aria-label="Filtrar por estado"
          >
            <option value="todos">Activos e inactivos</option>
            <option value="activo">Solo activos</option>
            <option value="inactivo">Solo inactivos</option>
          </select>
          <select
            value={unidadActividadId}
            onChange={(e) => setUnidadActividadId(e.target.value)}
            className="input-field flex-1 text-sm min-h-touch"
            aria-label="Filtrar por actividad en unidad"
          >
            <option value="">Todas las unidades</option>
            {unidades.map((u) => (
              <option key={u.id} value={u.id}>
                Con actividad en: {u.title}
              </option>
            ))}
          </select>
        </div>

        {hayFiltros && (
          <div className="flex flex-wrap items-center gap-3 text-xs text-atenas-muted">
            <span>
              Mostrando {profilesFiltrados.length} de {profiles.length} usuarios
            </span>
            <button type="button" className="font-semibold text-atenas-ink underline" onClick={limpiarFiltros}>
              Limpiar filtros
            </button>
          </div>
        )}
      </div>

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

          <div className="hidden md:block overflow-x-auto rounded-xl border border-atenas-mist-border shadow-card">
            <table className="w-full border-collapse bg-white table-mobile">
              <thead>
                <tr className="bg-atenas-mist border-b border-atenas-mist-border">
                  <th className="px-4 py-3 text-left text-sm font-semibold text-atenas-ink">Usuario</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-atenas-ink">Rol</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-atenas-ink">Estado</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-atenas-ink">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {profilesFiltrados.map((p) => (
                  <tr
                    key={p.id}
                    className={`border-b border-atenas-mist last:border-0 ${p.activo === false ? 'bg-atenas-mist/50' : ''}`}
                  >
                    <td className="px-4 py-3">
                      {editingId === p.id ? (
                        <form
                          onSubmit={(e) => handleUpdate(e, p.id)}
                          className="flex flex-wrap items-center gap-2"
                        >
                          <input
                            value={editName}
                            onChange={(e) => setEditName(e.target.value)}
                            className="input-field py-2 text-sm max-w-[180px]"
                            required
                          />
                          <select
                            value={editRole}
                            onChange={(e) => setEditRole(e.target.value as UserRole)}
                            className="input-field py-2 text-sm max-w-[140px]"
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
                            className="w-9 h-9 rounded-lg bg-atenas-sidebar text-white text-xs font-bold flex items-center justify-center shrink-0"
                            aria-hidden
                          >
                            {iniciales(p.full_name)}
                          </div>
                          <div className="min-w-0">
                            <p className="font-semibold text-atenas-ink truncate">{p.full_name}</p>
                            <p className="text-xs text-atenas-muted truncate">{p.email}</p>
                          </div>
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <Badge tone={rolBadgeTone(p.role)}>{ROL_LABEL[p.role]}</Badge>
                    </td>
                    <td className="px-4 py-3">
                      <Badge tone={p.activo === false ? 'muted' : 'success'}>
                        {p.activo === false ? 'Desactivado' : 'Activo'}
                      </Badge>
                    </td>
                    <td className="px-4 py-3">
                      {editingId !== p.id && (
                        <div className="flex flex-wrap gap-2">
                          <button
                            type="button"
                            onClick={() => startEdit(p)}
                            className="text-sm font-medium text-atenas-ink hover:underline"
                          >
                            Editar
                          </button>
                          <button
                            type="button"
                            onClick={() => handleToggleActivo(p.id, p.activo !== false)}
                            className={`text-sm font-medium ${
                              p.activo === false
                                ? 'text-emerald-700 hover:underline'
                                : 'text-red-700 hover:underline'
                            }`}
                          >
                            {p.activo === false ? 'Activar' : 'Desactivar'}
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}
