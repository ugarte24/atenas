-- ============================================================
-- ATENAS: Crear perfil de usuario ADMINISTRADOR
-- ============================================================
-- Ejecutar este script en Supabase: SQL Editor > New query > Pegar y Run
--
-- PASO 1 (en Supabase Dashboard):
--    Authentication > Users > Add user
--    Crear usuario con el mismo EMAIL que uses abajo (ej: admin@tu-dominio.com)
--    y una contraseña segura. Guarda la contraseña para iniciar sesión.
--
-- PASO 2:
--    Cambia 'admin@ejemplo.com' por el email del usuario que creaste en el paso 1.
--    Opcional: cambia 'Administrador' por el nombre que quieras.
--
-- PASO 3:
--    Ejecuta este script (Run). Si el usuario existe en Auth, se creará su perfil como admin.
-- ============================================================

-- Opción A: Crear perfil admin buscando por email del usuario en Auth
-- (Reemplaza el email por el que usaste al dar de alta al usuario)
INSERT INTO public.profiles (id, email, full_name, role)
SELECT id, email, 'Administrador', 'admin'
FROM auth.users
WHERE email = 'admin@ejemplo.com'
  AND NOT EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.users.id);

-- Si prefieres usar el UUID del usuario directamente (lo ves en Authentication > Users):
-- INSERT INTO public.profiles (id, email, full_name, role)
-- VALUES (
--   'PEGA-AQUI-EL-UUID-DEL-USUARIO',
--   'admin@ejemplo.com',
--   'Administrador',
--   'admin'
-- )
-- ON CONFLICT (id) DO UPDATE SET role = 'admin', full_name = 'Administrador';
