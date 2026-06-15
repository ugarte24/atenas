-- Gestión de usuarios solo admin (PRD Módulo 2); bloquear intentos si perfil inactivo

DROP POLICY IF EXISTS "Admin y docente pueden insertar perfiles" ON public.profiles;

CREATE POLICY "Solo admin puede insertar perfiles"
  ON public.profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid() AND p.role = 'admin'
    )
  );

-- Helper: usuario activo
CREATE OR REPLACE FUNCTION public.usuario_activo()
RETURNS boolean AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.id = auth.uid() AND coalesce(p.activo, true) = true
  );
$$ LANGUAGE sql STABLE SECURITY DEFINER;

-- Bloquear INSERT de intentos si inactivo
DROP POLICY IF EXISTS "Usuario inserta sus intentos" ON public.actividad_intentos;
CREATE POLICY "Usuario activo inserta intentos de actividad"
  ON public.actividad_intentos
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id AND public.usuario_activo());

DROP POLICY IF EXISTS "Usuario inserta sus intentos de evaluación" ON public.evaluacion_intentos;
CREATE POLICY "Usuario activo inserta intentos de evaluación"
  ON public.evaluacion_intentos
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id AND public.usuario_activo());
