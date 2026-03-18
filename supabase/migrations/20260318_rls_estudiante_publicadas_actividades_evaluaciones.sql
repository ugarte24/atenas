-- Estudiante solo debe ver actividades/evaluaciones publicadas.
-- Docente/Admin deben poder ver borradores y publicadas.

-- ACTIVIDADES
DROP POLICY IF EXISTS "Actividades visibles para autenticados" ON public.actividades;

CREATE POLICY "Estudiantes ven solo actividades publicadas"
  ON public.actividades
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1
      FROM public.profiles p
      WHERE p.id = auth.uid()
        AND p.role = 'estudiante'
    )
    AND publicada = true
  );

-- EVALUACIONES
DROP POLICY IF EXISTS "Evaluaciones visibles para autenticados" ON public.evaluaciones;

CREATE POLICY "Estudiantes ven solo evaluaciones publicadas"
  ON public.evaluaciones
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1
      FROM public.profiles p
      WHERE p.id = auth.uid()
        AND p.role = 'estudiante'
    )
    AND publicada = true
  );

