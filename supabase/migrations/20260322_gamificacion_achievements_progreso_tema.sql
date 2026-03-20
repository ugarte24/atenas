-- Gamificación: logros en BD + progreso por tema (extensible)

create table if not exists public.achievements (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null,
  description text,
  icon text not null default '🏅',
  orden int not null default 0
);

alter table public.achievements enable row level security;

create policy "Achievements visibles para autenticados"
  on public.achievements for select to authenticated using (true);

-- Solo admin/docente gestionan catálogo (opcional)
create policy "Admin y docente gestionan achievements"
  on public.achievements for all to authenticated
  using (exists (select 1 from public.profiles p where p.id = auth.uid() and p.role in ('admin', 'docente')))
  with check (exists (select 1 from public.profiles p where p.id = auth.uid() and p.role in ('admin', 'docente')));

insert into public.achievements (slug, title, description, icon, orden)
values
  ('nature', 'Defensor de la naturaleza', 'Completa actividades sobre convivencia y naturaleza.', '🌳', 1),
  ('explorer', 'Explorador del Abya Yala', 'Termina al menos una misión/unidad completa.', '🧭', 2),
  ('historian', 'Historiador', 'Completa todas las misiones disponibles.', '📜', 3)
on conflict (slug) do nothing;

create table if not exists public.user_achievements (
  user_id uuid not null references auth.users (id) on delete cascade,
  achievement_id uuid not null references public.achievements (id) on delete cascade,
  unlocked_at timestamptz not null default now(),
  primary key (user_id, achievement_id)
);

create index if not exists idx_user_achievements_user on public.user_achievements (user_id);

alter table public.user_achievements enable row level security;

create policy "Usuario ve sus logros desbloqueados"
  on public.user_achievements for select to authenticated
  using (auth.uid() = user_id);

create policy "Usuario registra sus logros"
  on public.user_achievements for insert to authenticated
  with check (auth.uid() = user_id);

create policy "Docente y admin ven logros de estudiantes"
  on public.user_achievements for select to authenticated
  using (exists (select 1 from public.profiles p where p.id = auth.uid() and p.role in ('admin', 'docente')));

-- Progreso por tema (sincronización opcional desde la app)
create table if not exists public.progreso_tema (
  user_id uuid not null references auth.users (id) on delete cascade,
  tema_id uuid not null references public.temas (id) on delete cascade,
  porcentaje int not null default 0 check (porcentaje >= 0 and porcentaje <= 100),
  completado boolean not null default false,
  updated_at timestamptz not null default now(),
  primary key (user_id, tema_id)
);

create index if not exists idx_progreso_tema_user on public.progreso_tema (user_id);

alter table public.progreso_tema enable row level security;

create policy "Usuario gestiona su progreso por tema"
  on public.progreso_tema for all to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Docente y admin leen progreso por tema"
  on public.progreso_tema for select to authenticated
  using (exists (select 1 from public.profiles p where p.id = auth.uid() and p.role in ('admin', 'docente')));

drop trigger if exists progreso_tema_updated_at on public.progreso_tema;

create trigger progreso_tema_updated_at
  before update on public.progreso_tema
  for each row execute function public.set_updated_at();
