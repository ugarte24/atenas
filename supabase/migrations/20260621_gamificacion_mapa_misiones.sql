-- Recompensas del mapa y misiones diarias (persistencia multi-dispositivo)

create table if not exists public.user_map_rewards (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  chest_id text not null,
  xp_bonus int not null default 0 check (xp_bonus >= 0),
  opened_at timestamptz not null default now(),
  unique (user_id, chest_id)
);

create index if not exists idx_user_map_rewards_user on public.user_map_rewards (user_id);

alter table public.user_map_rewards enable row level security;

create policy "Usuario ve sus recompensas de mapa"
  on public.user_map_rewards for select to authenticated
  using (auth.uid() = user_id);

create policy "Usuario registra recompensas de mapa"
  on public.user_map_rewards for insert to authenticated
  with check (auth.uid() = user_id);

create policy "Docente y admin ven recompensas de mapa"
  on public.user_map_rewards for select to authenticated
  using (exists (select 1 from public.profiles p where p.id = auth.uid() and p.role in ('admin', 'docente')));

-- Misiones diarias / semanales / especiales completadas con XP otorgado
create table if not exists public.user_daily_missions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  mission_key text not null,
  mission_date date not null default (timezone('utc', now()))::date,
  completed_at timestamptz not null default now(),
  xp_awarded int not null default 0 check (xp_awarded >= 0),
  unique (user_id, mission_key, mission_date)
);

create index if not exists idx_user_daily_missions_user on public.user_daily_missions (user_id, mission_date desc);

alter table public.user_daily_missions enable row level security;

create policy "Usuario ve sus misiones completadas"
  on public.user_daily_missions for select to authenticated
  using (auth.uid() = user_id);

create policy "Usuario registra misiones completadas"
  on public.user_daily_missions for insert to authenticated
  with check (auth.uid() = user_id);

create policy "Docente y admin ven misiones completadas"
  on public.user_daily_missions for select to authenticated
  using (exists (select 1 from public.profiles p where p.id = auth.uid() and p.role in ('admin', 'docente')));

-- Configuración del aula en vivo (enlace Meet/Jitsi)
create table if not exists public.aula_config (
  id int primary key default 1 check (id = 1),
  meet_url text,
  updated_at timestamptz not null default now(),
  updated_by uuid references auth.users (id) on delete set null
);

insert into public.aula_config (id, meet_url) values (1, null)
on conflict (id) do nothing;

alter table public.aula_config enable row level security;

create policy "Autenticados leen aula_config"
  on public.aula_config for select to authenticated using (true);

create policy "Docente y admin actualizan aula_config"
  on public.aula_config for all to authenticated
  using (exists (select 1 from public.profiles p where p.id = auth.uid() and p.role in ('admin', 'docente')))
  with check (exists (select 1 from public.profiles p where p.id = auth.uid() and p.role in ('admin', 'docente')));
