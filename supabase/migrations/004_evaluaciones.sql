-- Evaluaciones (cuestionarios por tema)
create table public.evaluaciones (
  id uuid primary key default gen_random_uuid(),
  tema_id uuid not null references public.temas (id) on delete cascade,
  title text not null,
  descripcion text,
  umbral_aprobado int not null default 70 check (umbral_aprobado >= 0 and umbral_aprobado <= 100),
  preguntas jsonb not null default '[]',
  publicada boolean not null default false,
  orden int not null default 0,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create trigger evaluaciones_updated_at
  before update on public.evaluaciones
  for each row execute function public.set_updated_at();

alter table public.evaluaciones enable row level security;

create policy "Evaluaciones visibles para autenticados"
  on public.evaluaciones for select to authenticated using (true);

create policy "Docente y admin pueden gestionar evaluaciones"
  on public.evaluaciones for all to authenticated
  using (exists (select 1 from public.profiles p where p.id = auth.uid() and p.role in ('admin', 'docente')))
  with check (exists (select 1 from public.profiles p where p.id = auth.uid() and p.role in ('admin', 'docente')));

-- Intentos de evaluación (un intento por usuario por evaluación)
create table public.evaluacion_intentos (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  evaluacion_id uuid not null references public.evaluaciones (id) on delete cascade,
  respuestas jsonb not null default '{}',
  puntuacion int not null default 0,
  aprobado boolean not null default false,
  completado_at timestamptz default now(),
  constraint evaluacion_intentos_user_eval_unique unique (user_id, evaluacion_id)
);

alter table public.evaluacion_intentos enable row level security;

create policy "Usuario ve sus intentos de evaluación"
  on public.evaluacion_intentos for select to authenticated
  using (auth.uid() = user_id);

create policy "Usuario inserta sus intentos de evaluación"
  on public.evaluacion_intentos for insert to authenticated
  with check (auth.uid() = user_id);

create policy "Usuario actualiza sus intentos de evaluación"
  on public.evaluacion_intentos for update to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Docente y admin ven todos los intentos de evaluación"
  on public.evaluacion_intentos for select to authenticated
  using (exists (select 1 from public.profiles p where p.id = auth.uid() and p.role in ('admin', 'docente')));
