-- Reparación: quitar UNIQUE (user_id, evaluacion_id) que impide varios intentos.
-- Ejecutar si ya corriste 20250318_atenas_features.sql y sigue el error "intento único".

ALTER TABLE public.evaluacion_intentos
  DROP CONSTRAINT IF EXISTS evaluacion_intentos_user_eval_unique;

DO $$
DECLARE
  r record;
BEGIN
  FOR r IN
    SELECT conname
    FROM pg_constraint
    WHERE conrelid = 'public.evaluacion_intentos'::regclass
      AND contype = 'u'
      AND pg_get_constraintdef(oid) ~ 'user_id'
      AND pg_get_constraintdef(oid) ~ 'evaluacion_id'
  LOOP
    EXECUTE format('ALTER TABLE public.evaluacion_intentos DROP CONSTRAINT %I', r.conname);
  END LOOP;
END $$;

-- Asegurar PK en id (por si faltó en migración anterior)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conrelid = 'public.evaluacion_intentos'::regclass
      AND contype = 'p'
  ) THEN
    ALTER TABLE public.evaluacion_intentos ADD PRIMARY KEY (id);
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_eval_intentos_user_eval
  ON public.evaluacion_intentos(user_id, evaluacion_id);
