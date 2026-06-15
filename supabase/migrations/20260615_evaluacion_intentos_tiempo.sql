-- Tiempo y número de intento en evaluaciones (PRD Módulo 7)

ALTER TABLE public.evaluaciones
  ADD COLUMN IF NOT EXISTS minutos_limite integer;

ALTER TABLE public.evaluacion_intentos
  ADD COLUMN IF NOT EXISTS tiempo_segundos integer,
  ADD COLUMN IF NOT EXISTS numero_intento integer;

-- Intentos inmutables para estudiantes
DROP POLICY IF EXISTS "Usuario actualiza sus intentos de evaluación" ON public.evaluacion_intentos;

-- Límite de intentos en BD (opcional pero recomendado)
CREATE OR REPLACE FUNCTION public.check_evaluacion_max_intentos()
RETURNS trigger AS $$
DECLARE
  max_i integer;
  cnt integer;
BEGIN
  SELECT max_intentos INTO max_i FROM public.evaluaciones WHERE id = NEW.evaluacion_id;
  IF max_i IS NOT NULL THEN
    SELECT count(*) INTO cnt
    FROM public.evaluacion_intentos
    WHERE user_id = NEW.user_id AND evaluacion_id = NEW.evaluacion_id;
    IF cnt >= max_i THEN
      RAISE EXCEPTION 'max_intentos alcanzado para esta evaluación';
    END IF;
  END IF;
  IF NEW.numero_intento IS NULL THEN
    SELECT coalesce(max(numero_intento), 0) + 1 INTO NEW.numero_intento
    FROM public.evaluacion_intentos
    WHERE user_id = NEW.user_id AND evaluacion_id = NEW.evaluacion_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_eval_intentos_max ON public.evaluacion_intentos;
CREATE TRIGGER trg_eval_intentos_max
  BEFORE INSERT ON public.evaluacion_intentos
  FOR EACH ROW EXECUTE FUNCTION public.check_evaluacion_max_intentos();
