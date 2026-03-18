-- RLS: docente_unidad, tema_mensajes
-- Ejecutar después de 20250318_atenas_features.sql (tablas creadas).
-- Idempotente: elimina políticas con el mismo nombre si existen.

-- ========== docente_unidad ==========
ALTER TABLE public.docente_unidad ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS docente_unidad_select_asignado ON public.docente_unidad;
CREATE POLICY docente_unidad_select_asignado
  ON public.docente_unidad
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role = 'admin')
    OR docente_id = auth.uid()
  );

DROP POLICY IF EXISTS docente_unidad_admin_escritura ON public.docente_unidad;
CREATE POLICY docente_unidad_admin_escritura
  ON public.docente_unidad
  FOR ALL
  TO authenticated
  USING (EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role = 'admin'))
  WITH CHECK (EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role = 'admin'));

COMMENT ON TABLE public.docente_unidad IS 'Asignación docente↔unidad. Lectura: admin o el propio docente. Escritura: solo admin.';

-- ========== tema_mensajes ==========
ALTER TABLE public.tema_mensajes ENABLE ROW LEVEL SECURITY;

-- Lectura: admin (todo); estudiante (todos los temas); docente con asignaciones solo temas de sus unidades;
-- docente sin filas en docente_unidad = igual que la app (ve todas las unidades) → lee todos los mensajes.
DROP POLICY IF EXISTS tema_mensajes_select ON public.tema_mensajes;
CREATE POLICY tema_mensajes_select
  ON public.tema_mensajes
  FOR SELECT
  TO authenticated
  USING (
    (SELECT p.role FROM public.profiles p WHERE p.id = auth.uid() LIMIT 1) = 'admin'
    OR (SELECT p.role FROM public.profiles p WHERE p.id = auth.uid() LIMIT 1) = 'estudiante'
    OR (
      (SELECT p.role FROM public.profiles p WHERE p.id = auth.uid() LIMIT 1) = 'docente'
      AND (
        NOT EXISTS (SELECT 1 FROM public.docente_unidad du WHERE du.docente_id = auth.uid())
        OR EXISTS (
          SELECT 1
          FROM public.temas t
          INNER JOIN public.docente_unidad du
            ON du.unidad_id = t.unidad_id AND du.docente_id = auth.uid()
          WHERE t.id = tema_mensajes.tema_id
        )
      )
    )
  );

DROP POLICY IF EXISTS tema_mensajes_insert ON public.tema_mensajes;
CREATE POLICY tema_mensajes_insert
  ON public.tema_mensajes
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS tema_mensajes_update_propio ON public.tema_mensajes;
CREATE POLICY tema_mensajes_update_propio
  ON public.tema_mensajes
  FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS tema_mensajes_delete_propio ON public.tema_mensajes;
CREATE POLICY tema_mensajes_delete_propio
  ON public.tema_mensajes
  FOR DELETE
  TO authenticated
  USING (user_id = auth.uid());

DROP POLICY IF EXISTS tema_mensajes_delete_admin ON public.tema_mensajes;
CREATE POLICY tema_mensajes_delete_admin
  ON public.tema_mensajes
  FOR DELETE
  TO authenticated
  USING (EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role = 'admin'));

COMMENT ON TABLE public.tema_mensajes IS 'Mensajes por tema. Lectura según rol y asignación docente. Escritura como usuario autenticado.';
