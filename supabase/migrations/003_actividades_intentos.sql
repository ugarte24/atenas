-- Tipos: seleccion_multiple, relacion_conceptos, memoria, ordenar_secuencia, ubicar_en_mapa
create table public.actividades (
  id uuid primary key default gen_random_uuid(),
  tema_id uuid not null references public.temas (id) on delete cascade,
  tipo text not null check (tipo in (
    'seleccion_multiple',
    'relacion_conceptos',
    'memoria',
    'ordenar_secuencia',
    'ubicar_en_mapa'
  )),
  title text not null,
  config jsonb not null default '{}',
  publicada boolean not null default false,
  orden int not null default 0,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create trigger actividades_updated_at
  before update on public.actividades
  for each row execute function public.set_updated_at();

alter table public.actividades enable row level security;

create policy "Actividades visibles para autenticados"
  on public.actividades for select to authenticated using (true);

create policy "Docente y admin pueden gestionar actividades"
  on public.actividades for all to authenticated
  using (exists (select 1 from public.profiles p where p.id = auth.uid() and p.role in ('admin', 'docente')))
  with check (exists (select 1 from public.profiles p where p.id = auth.uid() and p.role in ('admin', 'docente')));

-- Intentos: respuestas del estudiante y puntuación
create table public.actividad_intentos (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  actividad_id uuid not null references public.actividades (id) on delete cascade,
  respuestas jsonb not null default '{}',
  puntuacion int not null default 0,
  completado_at timestamptz default now(),
  constraint actividad_intentos_user_actividad_unique unique (user_id, actividad_id)
);

alter table public.actividad_intentos enable row level security;

-- El usuario solo ve/inserta/actualiza sus propios intentos
create policy "Usuario ve sus intentos"
  on public.actividad_intentos for select to authenticated
  using (auth.uid() = user_id);

create policy "Usuario inserta sus intentos"
  on public.actividad_intentos for insert to authenticated
  with check (auth.uid() = user_id);

create policy "Usuario actualiza sus intentos"
  on public.actividad_intentos for update to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- Docente y admin pueden leer todos los intentos (para ver progreso)
create policy "Docente y admin ven todos los intentos"
  on public.actividad_intentos for select to authenticated
  using (
    exists (select 1 from public.profiles p where p.id = auth.uid() and p.role in ('admin', 'docente'))
  );
