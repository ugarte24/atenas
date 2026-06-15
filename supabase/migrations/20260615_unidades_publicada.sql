-- Publicar/despublicar unidades (PRD Módulo 3)

ALTER TABLE public.unidades
  ADD COLUMN IF NOT EXISTS publicada boolean NOT NULL DEFAULT true;

-- ========== UNIDADES ==========
DROP POLICY IF EXISTS "Unidades visibles para autenticados" ON public.unidades;

CREATE POLICY "Estudiantes ven solo unidades publicadas"
  ON public.unidades
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid() AND p.role = 'estudiante'
    )
    AND publicada = true
  );

-- Docente/admin: política FOR ALL existente en 001_initial_schema.sql

-- ========== TEMAS (listado con candados solo en unidades publicadas) ==========
DROP POLICY IF EXISTS "Temas visibles para autenticados (listado candados)" ON public.temas;

CREATE POLICY "Estudiantes ven temas de unidades publicadas"
  ON public.temas
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid() AND p.role = 'estudiante'
    )
    AND EXISTS (
      SELECT 1 FROM public.unidades u
      WHERE u.id = public.temas.unidad_id AND u.publicada = true
    )
  );

-- ========== ACTIVIDADES ==========
DROP POLICY IF EXISTS "Estudiantes ven solo actividades publicadas" ON public.actividades;

CREATE POLICY "Estudiantes ven solo actividades publicadas"
  ON public.actividades
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid() AND p.role = 'estudiante'
    )
    AND publicada = true
    AND EXISTS (
      SELECT 1
      FROM public.temas t
      JOIN public.unidades u ON u.id = t.unidad_id
      WHERE t.id = public.actividades.tema_id AND u.publicada = true
    )
  );

-- ========== EVALUACIONES ==========
DROP POLICY IF EXISTS "Estudiantes ven solo evaluaciones publicadas" ON public.evaluaciones;

CREATE POLICY "Estudiantes ven solo evaluaciones publicadas"
  ON public.evaluaciones
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid() AND p.role = 'estudiante'
    )
    AND publicada = true
    AND EXISTS (
      SELECT 1
      FROM public.temas t
      JOIN public.unidades u ON u.id = t.unidad_id
      WHERE t.id = public.evaluaciones.tema_id AND u.publicada = true
    )
  );

-- ========== RECURSOS ==========
DROP POLICY IF EXISTS "Estudiantes ven recursos de temas desbloqueados" ON public.recursos;

CREATE POLICY "Estudiantes ven recursos de temas desbloqueados"
  ON public.recursos
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid() AND p.role = 'estudiante'
    )
    AND EXISTS (
      SELECT 1
      FROM public.temas t
      JOIN public.unidades u ON u.id = t.unidad_id
      WHERE t.id = public.recursos.tema_id
        AND u.publicada = true
        AND (
          t.prerequisito_tema_id IS NULL
          OR (
            NOT EXISTS (
              SELECT 1
              FROM public.actividades a
              WHERE a.tema_id = t.prerequisito_tema_id
                AND a.publicada = true
                AND NOT EXISTS (
                  SELECT 1 FROM public.actividad_intentos ai
                  WHERE ai.user_id = auth.uid() AND ai.actividad_id = a.id
                )
            )
            AND NOT EXISTS (
              SELECT 1
              FROM public.evaluaciones e
              WHERE e.tema_id = t.prerequisito_tema_id
                AND e.publicada = true
                AND NOT EXISTS (
                  SELECT 1 FROM public.evaluacion_intentos ei
                  WHERE ei.user_id = auth.uid() AND ei.evaluacion_id = e.id
                )
            )
          )
        )
    )
  );
