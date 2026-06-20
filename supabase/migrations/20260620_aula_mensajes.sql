-- Chat del aula en vivo (Realtime)
CREATE TABLE IF NOT EXISTS public.aula_mensajes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  cuerpo text NOT NULL CHECK (char_length(trim(cuerpo)) > 0),
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_aula_mensajes_created ON public.aula_mensajes(created_at DESC);

ALTER TABLE public.aula_mensajes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS aula_mensajes_select ON public.aula_mensajes;
CREATE POLICY aula_mensajes_select ON public.aula_mensajes
  FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS aula_mensajes_insert ON public.aula_mensajes;
CREATE POLICY aula_mensajes_insert ON public.aula_mensajes
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
