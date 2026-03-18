-- Ejecutar en Supabase SQL Editor si algo falla por nombre de constraint, ajustar manualmente.
-- 1) Evaluaciones: reintentos, modo examen, feedback sin revelar correcta
ALTER TABLE public.evaluaciones
  ADD COLUMN IF NOT EXISTS max_intentos integer,
  ADD COLUMN IF NOT EXISTS modo_examen boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS ocultar_respuesta_correcta boolean DEFAULT false;

COMMENT ON COLUMN public.evaluaciones.max_intentos IS 'NULL = ilimitado';

-- 2) Temas: prerequisito (debe completar tema anterior)
ALTER TABLE public.temas
  ADD COLUMN IF NOT EXISTS prerequisito_tema_id uuid REFERENCES public.temas(id);

-- 3) Unidad: umbral para certificado (NULL = desactivado)
ALTER TABLE public.unidades
  ADD COLUMN IF NOT EXISTS certificado_umbral_pct integer;

-- 4) Docente solo ve unidades asignadas (si no hay filas, ve todas)
CREATE TABLE IF NOT EXISTS public.docente_unidad (
  docente_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  unidad_id uuid NOT NULL REFERENCES public.unidades(id) ON DELETE CASCADE,
  PRIMARY KEY (docente_id, unidad_id)
);

-- 5) Mensajes por tema
CREATE TABLE IF NOT EXISTS public.tema_mensajes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tema_id uuid NOT NULL REFERENCES public.temas(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  cuerpo text NOT NULL CHECK (char_length(trim(cuerpo)) > 0),
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_tema_mensajes_tema ON public.tema_mensajes(tema_id);

-- 6) Múltiples intentos en evaluaciones (quitar PK compuesta user_id+evaluacion_id)
ALTER TABLE public.evaluacion_intentos
  ADD COLUMN IF NOT EXISTS id uuid DEFAULT gen_random_uuid();

UPDATE public.evaluacion_intentos SET id = gen_random_uuid() WHERE id IS NULL;

DO $$
DECLARE
  r record;
BEGIN
  FOR r IN
    SELECT conname
    FROM pg_constraint
    WHERE conrelid = 'public.evaluacion_intentos'::regclass
      AND contype = 'p'
  LOOP
    EXECUTE format('ALTER TABLE public.evaluacion_intentos DROP CONSTRAINT %I', r.conname);
  END LOOP;
END $$;

ALTER TABLE public.evaluacion_intentos ALTER COLUMN id SET NOT NULL;

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
