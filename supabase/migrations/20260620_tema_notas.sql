-- Notas de lección por estudiante (sincronizadas entre dispositivos)
CREATE TABLE IF NOT EXISTS public.tema_notas (
  user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  tema_id uuid NOT NULL REFERENCES public.temas(id) ON DELETE CASCADE,
  contenido text NOT NULL DEFAULT '',
  updated_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, tema_id)
);

ALTER TABLE public.tema_notas ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS tema_notas_select_own ON public.tema_notas;
CREATE POLICY tema_notas_select_own ON public.tema_notas
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS tema_notas_insert_own ON public.tema_notas;
CREATE POLICY tema_notas_insert_own ON public.tema_notas
  FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS tema_notas_update_own ON public.tema_notas;
CREATE POLICY tema_notas_update_own ON public.tema_notas
  FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS tema_notas_delete_own ON public.tema_notas;
CREATE POLICY tema_notas_delete_own ON public.tema_notas
  FOR DELETE USING (auth.uid() = user_id);
