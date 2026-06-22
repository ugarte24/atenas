-- Registro de certificados emitidos (verificación pública por ID / QR).

CREATE TABLE IF NOT EXISTS public.certificados_emitidos (
  id text PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES auth.users (id) ON DELETE CASCADE,
  unidad_id uuid NOT NULL REFERENCES public.unidades (id) ON DELETE CASCADE,
  nombre_estudiante text NOT NULL,
  titulo_unidad text NOT NULL,
  porcentaje integer NOT NULL CHECK (porcentaje >= 0 AND porcentaje <= 100),
  emitido_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS certificados_emitidos_user_unidad_idx
  ON public.certificados_emitidos (user_id, unidad_id);

ALTER TABLE public.certificados_emitidos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "certificados_emitidos_select_public"
  ON public.certificados_emitidos
  FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "certificados_emitidos_insert_estudiante"
  ON public.certificados_emitidos
  FOR INSERT
  TO authenticated
  WITH CHECK (
    user_id = auth.uid()
    AND EXISTS (
      SELECT 1
      FROM public.profiles p
      WHERE p.id = auth.uid()
        AND p.role = 'estudiante'
    )
  );

CREATE POLICY "certificados_emitidos_update_own"
  ON public.certificados_emitidos
  FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());
