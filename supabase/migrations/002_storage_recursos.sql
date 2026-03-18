-- Bucket para recursos educativos (imágenes, mapas, vídeos)
insert into storage.buckets (id, name, public)
values ('recursos', 'recursos', true)
on conflict (id) do nothing;

-- Lectura: cualquier autenticado puede ver
create policy "Recursos visibles para autenticados"
  on storage.objects for select
  to authenticated
  using (bucket_id = 'recursos');

-- Subida y eliminación: solo docente y admin
create policy "Docente y admin pueden subir recursos"
  on storage.objects for insert
  to authenticated
  with check (
    bucket_id = 'recursos'
    and exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.role in ('docente', 'admin')
    )
  );

create policy "Docente y admin pueden actualizar recursos"
  on storage.objects for update
  to authenticated
  using (
    bucket_id = 'recursos'
    and exists (select 1 from public.profiles p where p.id = auth.uid() and p.role in ('docente', 'admin'))
  );

create policy "Docente y admin pueden eliminar recursos"
  on storage.objects for delete
  to authenticated
  using (
    bucket_id = 'recursos'
    and exists (select 1 from public.profiles p where p.id = auth.uid() and p.role in ('docente', 'admin'))
  );
