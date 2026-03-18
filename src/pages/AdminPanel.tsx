import { useState, useEffect, useMemo } from 'react';
import { supabase } from '../lib/supabase';
import { useProfiles } from '../hooks/useProfiles';
import { useUnidades } from '../hooks/useUnidades';
import type { Profile, UserRole, Unidad } from '../types';

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
          ? 'Unidades asignadas al docente. Si no marca ninguna, el docente verá todas las unidades.'
          : 'Sin unidades marcadas: el docente verá todas las unidades (comportamiento por defecto).'
      );
    } catch (e) {
      onError(e instanceof Error ? e.message : 'Error al guardar asignaciones (¿ejecutaste la migración SQL?)');
    } finally {
      setLoadingAsig(false);
    }
  }

  if (!docentes.length || !unidades.length) return null;

  return (
    <section className="card p-5 mb-8 border border-slate-200" aria-labelledby="asig-doc-h">
      <h2 id="asig-doc-h" className="font-semibold text-slate-900 mb-2">
        Docente — unidades visibles en Contenidos
      </h2>
      <p className="text-sm text-slate-600 mb-4">
        Si no asignas ninguna unidad a un docente, verá todas. Si marcas al menos una, solo verá esas.
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
          <fieldset className="border border-slate-200 rounded-lg p-3 mb-4">
            <legend className="text-sm font-medium px-1">Unidades</legend>
            <ul className="space-y-2 list-none m-0 p-0 max-h-48 overflow-y-auto">
              {unidades.map((u) => (
                <li key={u.id}>
                  <label className="flex items-center gap-2 text-slate-800 cursor-pointer">
                    <input
                      type="checkbox"
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
          <button
            type="button"
            className="btn-primary"
            disabled={loadingAsig}
            onClick={guardar}
          >
            {loadingAsig ? 'Guardando…' : 'Guardar asignaciones'}
          </button>
        </>
      )}
    </section>
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
        text: 'Usuario creado. Puede iniciar sesión con ese correo y contraseña. Si en Supabase está activada la confirmación de correo, el usuario deberá confirmar primero.',
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
          ? 'Límite de solicitudes alcanzado. Supabase permite pocos registros por minuto. Espera 1-2 minutos y vuelve a intentar.'
          : msg || 'Error al crear el usuario',
      });
    }
  }

  function startEdit(p: Profile) {
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

  if (loading) return <p className="text-slate-600">Cargando usuarios...</p>;
  if (error) return <p className="text-red-600">{error}</p>;

  return (
    <div className="px-1 sm:px-0">
      <h1 className="text-page-title font-bold text-slate-900 mb-2">Gestión de usuarios</h1>
      <p className="text-slate-600 mb-4 sm:mb-6 text-sm sm:text-base">
        Dar de alta estudiantes y docentes. Solo el administrador puede editar roles y desactivar cuentas.
      </p>

      {stats && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
          <div className="card p-4 border border-slate-200">
            <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">Estudiantes activos</p>
            <p className="text-2xl font-bold text-slate-900 mt-1">{stats.estudiantesActivos}</p>
          </div>
          <div className="card p-4 border border-slate-200">
            <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">Intentos hoy</p>
            <p className="text-2xl font-bold text-[#003366] mt-1">{stats.intentosHoy}</p>
            <p className="text-xs text-slate-500 mt-0.5">Actividades + evaluaciones</p>
          </div>
          <div className="card p-4 border border-slate-200">
            <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">Intentos (7 días)</p>
            <p className="text-2xl font-bold text-[#009975] mt-1">{stats.intentosSemana}</p>
          </div>
        </div>
      )}

      {message && (
        <div
          className={`mb-6 p-4 rounded-xl border ${
            message.type === 'ok'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
              : 'bg-red-50 border-red-200 text-red-900'
          }`}
          role="status"
        >
          {message.text}
        </div>
      )}

      <div className="flex flex-col lg:flex-row flex-wrap gap-3 mb-6">
        <input
          type="search"
          placeholder="Buscar nombre o email…"
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          className="input-field flex-1 min-w-[200px] max-w-md"
          aria-label="Buscar usuarios"
        />
        <select
          value={filtroRol}
          onChange={(e) => setFiltroRol(e.target.value as '' | UserRole)}
          className="input-field max-w-[180px]"
          aria-label="Filtrar por rol"
        >
          <option value="">Todos los roles</option>
          <option value="estudiante">Estudiante</option>
          <option value="docente">Docente</option>
          <option value="admin">Admin</option>
        </select>
        <select
          value={filtroActivo}
          onChange={(e) => setFiltroActivo(e.target.value as typeof filtroActivo)}
          className="input-field max-w-[180px]"
          aria-label="Filtrar por estado"
        >
          <option value="todos">Activos e inactivos</option>
          <option value="activo">Solo activos</option>
          <option value="inactivo">Solo inactivos</option>
        </select>
        <select
          value={unidadActividadId}
          onChange={(e) => setUnidadActividadId(e.target.value)}
          className="input-field flex-1 min-w-[220px] max-w-md"
          aria-label="Filtrar por actividad en unidad"
        >
          <option value="">Cualquier unidad (sin filtrar por contenido)</option>
          {unidades.map((u) => (
            <option key={u.id} value={u.id}>
              Con actividad en: {u.title}
            </option>
          ))}
        </select>
      </div>
      <p className="text-xs text-slate-500 mb-4">
        El filtro por unidad muestra usuarios que completaron al menos una actividad o evaluación de esa
        unidad.
      </p>

      <AsignarDocenteUnidades
        docentes={profiles.filter((p) => p.role === 'docente')}
        unidades={unidades}
        onGuardado={(text) => setMessage({ type: 'ok', text })}
        onError={(text) => setMessage({ type: 'error', text })}
      />

      {creating ? (
        <form onSubmit={handleCreate} className="mb-8 card p-5 sm:p-6 space-y-4 max-w-md">
          <h3 className="font-semibold text-slate-900">Nuevo usuario</h3>
          <p className="text-sm text-slate-500">
            Si aparece &quot;límite de solicitudes&quot;, espera 1-2 minutos; Supabase limita los registros por
            minuto.
          </p>
          <input
            type="email"
            value={formEmail}
            onChange={(e) => setFormEmail(e.target.value)}
            placeholder="Correo electrónico"
            className="input-field"
            required
          />
          <input
            type="password"
            value={formPassword}
            onChange={(e) => setFormPassword(e.target.value)}
            placeholder="Contraseña temporal"
            className="input-field"
            required
            minLength={6}
          />
          <input
            value={formFullName}
            onChange={(e) => setFormFullName(e.target.value)}
            placeholder="Nombre completo"
            className="input-field"
            required
          />
          <select
            value={formRole}
            onChange={(e) => setFormRole(e.target.value as UserRole)}
            className="input-field"
          >
            <option value="estudiante">Estudiante</option>
            <option value="docente">Docente</option>
            <option value="admin">Administrador</option>
          </select>
          <div className="flex gap-3 pt-2">
            <button type="submit" className="btn-primary">
              Crear usuario
            </button>
            <button type="button" onClick={() => setCreating(false)} className="btn-secondary">
              Cancelar
            </button>
          </div>
        </form>
      ) : (
        <button type="button" onClick={() => setCreating(true)} className="btn-primary mb-6">
          + Dar de alta usuario
        </button>
      )}

      <p className="text-sm text-slate-600 mb-2">
        Mostrando <strong>{profilesFiltrados.length}</strong> de {profiles.length} usuarios
      </p>

      <div className="overflow-x-auto rounded-xl border border-slate-200 shadow-card -mx-1 sm:mx-0">
        <table className="w-full border-collapse bg-white table-mobile min-w-[600px]">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200">
              <th className="px-3 sm:px-4 py-2.5 sm:py-3 text-left text-xs sm:text-sm font-semibold text-slate-800">
                Nombre
              </th>
              <th className="px-3 sm:px-4 py-2.5 sm:py-3 text-left text-xs sm:text-sm font-semibold text-slate-800 hidden sm:table-cell">
                Email
              </th>
              <th className="px-3 sm:px-4 py-2.5 sm:py-3 text-left text-xs sm:text-sm font-semibold text-slate-800">
                Rol
              </th>
              <th className="px-3 sm:px-4 py-2.5 sm:py-3 text-left text-xs sm:text-sm font-semibold text-slate-800">
                Estado
              </th>
              <th className="px-3 sm:px-4 py-2.5 sm:py-3 text-left text-xs sm:text-sm font-semibold text-slate-800">
                Acciones
              </th>
            </tr>
          </thead>
          <tbody>
            {profilesFiltrados.map((p) => (
              <tr
                key={p.id}
                className={`border-b border-slate-100 last:border-0 ${p.activo === false ? 'bg-slate-50/80' : ''}`}
              >
                <td className="px-3 sm:px-4 py-2.5 sm:py-3">
                  {editingId === p.id ? (
                    <form
                      onSubmit={(e) => handleUpdate(e, p.id)}
                      className="flex flex-wrap items-center gap-2"
                    >
                      <input
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        className="input-field py-2 text-sm max-w-[160px] sm:max-w-[180px]"
                        required
                      />
                      <select
                        value={editRole}
                        onChange={(e) => setEditRole(e.target.value as UserRole)}
                        className="input-field py-2 text-sm max-w-[120px] sm:max-w-[140px]"
                      >
                        <option value="estudiante">Estudiante</option>
                        <option value="docente">Docente</option>
                        <option value="admin">Admin</option>
                      </select>
                      <button type="submit" className="btn-primary py-2 text-sm">
                        Guardar
                      </button>
                      <button
                        type="button"
                        onClick={() => setEditingId(null)}
                        className="btn-secondary py-2 text-sm"
                      >
                        Cancelar
                      </button>
                    </form>
                  ) : (
                    <span className="font-medium text-slate-900 text-sm">{p.full_name}</span>
                  )}
                  {editingId !== p.id && (
                    <span className="sm:hidden block text-xs text-slate-500 mt-0.5 truncate max-w-[200px]">
                      {p.email}
                    </span>
                  )}
                </td>
                <td className="px-3 sm:px-4 py-2.5 sm:py-3 text-slate-600 text-xs sm:text-sm hidden sm:table-cell">
                  {p.email}
                </td>
                <td className="px-3 sm:px-4 py-2.5 sm:py-3 capitalize text-slate-700 text-sm">{p.role}</td>
                <td className="px-3 sm:px-4 py-2.5 sm:py-3">
                  {p.activo === false ? (
                    <span className="badge bg-red-100 text-red-800">Desactivado</span>
                  ) : (
                    <span className="badge bg-emerald-100 text-emerald-800">Activo</span>
                  )}
                </td>
                <td className="px-3 sm:px-4 py-2.5 sm:py-3">
                  {editingId !== p.id && (
                    <div className="flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() => startEdit(p)}
                        className="text-sm font-medium hover:underline text-[#003366]"
                      >
                        Editar
                      </button>
                      <button
                        type="button"
                        onClick={() => handleToggleActivo(p.id, p.activo !== false)}
                        className={`text-sm font-medium ${
                          p.activo === false
                            ? 'text-emerald-700 hover:text-emerald-800'
                            : 'text-red-700 hover:text-red-800'
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

      {profiles.length === 0 && !creating && (
        <p className="text-slate-500 mt-6">No hay usuarios. Da de alta el primero con el botón anterior.</p>
      )}
      {profiles.length > 0 && profilesFiltrados.length === 0 && (
        <p className="text-slate-500 mt-4 text-sm">Ningún usuario coincide con los filtros.</p>
      )}
    </div>
  );
}
