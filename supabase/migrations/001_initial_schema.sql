-- Perfiles: extensión de auth.users con rol (estudiante | docente | admin)
create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  email text not null,
  full_name text not null,
  role text not null check (role in ('estudiante', 'docente', 'admin')),
  avatar_url text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Trigger para actualizar updated_at
create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger profiles_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();

-- RLS perfiles
alter table public.profiles enable row level security;

-- Todos los autenticados pueden leer perfiles (para listados docente/admin)
create policy "Perfiles son visibles para autenticados"
  on public.profiles for select
  to authenticated
  using (true);

-- Solo el propio usuario puede actualizar su perfil (nombre, avatar)
create policy "Usuario puede actualizar su perfil"
  on public.profiles for update
  to authenticated
  using (auth.uid() = id)
  with check (auth.uid() = id);

-- Solo admin puede insertar perfiles (alta de usuarios se hace desde app + Edge Function o service role)
-- Para simplificar Fase 1: permitimos que docente y admin inserten (desde dashboard con service role o con función)
create policy "Admin y docente pueden insertar perfiles"
  on public.profiles for insert
  to authenticated
  with check (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.role in ('admin', 'docente')
    )
  );

-- Unidades (contenidos educativos)
create table public.unidades (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  orden int not null default 0,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create trigger unidades_updated_at
  before update on public.unidades
  for each row execute function public.set_updated_at();

alter table public.unidades enable row level security;

-- Estudiantes solo lectura en unidades publicadas (por ahora todas visibles)
create policy "Unidades visibles para autenticados"
  on public.unidades for select to authenticated using (true);

create policy "Docente y admin pueden gestionar unidades"
  on public.unidades for all
  to authenticated
  using (
    exists (select 1 from public.profiles p where p.id = auth.uid() and p.role in ('admin', 'docente'))
  )
  with check (
    exists (select 1 from public.profiles p where p.id = auth.uid() and p.role in ('admin', 'docente'))
  );

-- Temas (por unidad)
create table public.temas (
  id uuid primary key default gen_random_uuid(),
  unidad_id uuid not null references public.unidades (id) on delete cascade,
  title text not null,
  content text,
  orden int not null default 0,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create trigger temas_updated_at
  before update on public.temas
  for each row execute function public.set_updated_at();

alter table public.temas enable row level security;

create policy "Temas visibles para autenticados"
  on public.temas for select to authenticated using (true);

create policy "Docente y admin pueden gestionar temas"
  on public.temas for all to authenticated
  using (exists (select 1 from public.profiles p where p.id = auth.uid() and p.role in ('admin', 'docente')))
  with check (exists (select 1 from public.profiles p where p.id = auth.uid() and p.role in ('admin', 'docente')));

-- Recursos (imagen, mapa, video por tema)
create table public.recursos (
  id uuid primary key default gen_random_uuid(),
  tema_id uuid not null references public.temas (id) on delete cascade,
  tipo text not null check (tipo in ('imagen', 'mapa', 'video')),
  url text not null,
  title text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create trigger recursos_updated_at
  before update on public.recursos
  for each row execute function public.set_updated_at();

alter table public.recursos enable row level security;

create policy "Recursos visibles para autenticados"
  on public.recursos for select to authenticated using (true);

create policy "Docente y admin pueden gestionar recursos"
  on public.recursos for all to authenticated
  using (exists (select 1 from public.profiles p where p.id = auth.uid() and p.role in ('admin', 'docente')))
  with check (exists (select 1 from public.profiles p where p.id = auth.uid() and p.role in ('admin', 'docente')));

-- Función para crear perfil al registrarse (si en el futuro se usa signUp)
-- Por ahora los usuarios se crean desde el panel; el primer usuario admin puede crearse manualmente en Supabase Dashboard o con un seed.
comment on table public.profiles is 'Perfiles de usuario con rol: estudiante, docente, admin. Alta solo por docente/admin.';
