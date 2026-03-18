-- Estudiante solo debe ver temas/recursos desbloqueados por prerequisito.
-- Docente/Admin ven todo (borradores incluidos).

-- ========== TEMAS ==========
DROP POLICY IF EXISTS "Temas visibles para autenticados" ON public.temas;

CREATE POLICY "Estudiantes ven temas desbloqueados"
  ON public.temas
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid()
        AND p.role = 'estudiante'
    )
    AND (
      prerequisito_tema_id IS NULL
      OR (
        NOT EXISTS (
          SELECT 1
          FROM public.actividades a
          WHERE a.tema_id = public.temas.prerequisito_tema_id
            AND a.publicada = true
            AND NOT EXISTS (
              SELECT 1
              FROM public.actividad_intentos ai
              WHERE ai.user_id = auth.uid()
                AND ai.actividad_id = a.id
            )
        )
        AND
        NOT EXISTS (
          SELECT 1
          FROM public.evaluaciones e
          WHERE e.tema_id = public.temas.prerequisito_tema_id
            AND e.publicada = true
            AND NOT EXISTS (
              SELECT 1
              FROM public.evaluacion_intentos ei
              WHERE ei.user_id = auth.uid()
                AND ei.evaluacion_id = e.id
            )
        )
      )
    )
  );

-- ========== RECURSOS ==========
DROP POLICY IF EXISTS "Recursos visibles para autenticados" ON public.recursos;

CREATE POLICY "Estudiantes ven recursos de temas desbloqueados"
  ON public.recursos
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid()
        AND p.role = 'estudiante'
    )
    AND EXISTS (
      SELECT 1
      FROM public.temas t
      WHERE t.id = public.recursos.tema_id
        AND (
          t.prerequisito_tema_id IS NULL
          OR (
            NOT EXISTS (
              SELECT 1
              FROM public.actividades a
              WHERE a.tema_id = t.prerequisito_tema_id
                AND a.publicada = true
                AND NOT EXISTS (
                  SELECT 1
                  FROM public.actividad_intentos ai
                  WHERE ai.user_id = auth.uid()
                    AND ai.actividad_id = a.id
                )
            )
            AND
            NOT EXISTS (
              SELECT 1
              FROM public.evaluaciones e
              WHERE e.tema_id = t.prerequisito_tema_id
                AND e.publicada = true
                AND NOT EXISTS (
                  SELECT 1
                  FROM public.evaluacion_intentos ei
                  WHERE ei.user_id = auth.uid()
                    AND ei.evaluacion_id = e.id
                )
            )
          )
        )
    )
  );

