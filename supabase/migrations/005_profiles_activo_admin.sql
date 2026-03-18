-- Columna activo para desactivar usuarios sin borrarlos
alter table public.profiles
  add column if not exists activo boolean not null default true;

-- Admin puede actualizar cualquier perfil (editar nombre, rol, desactivar)
create policy "Admin puede actualizar perfiles"
  on public.profiles for update to authenticated
  using (
    exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin')
  )
  with check (
    exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin')
  );
