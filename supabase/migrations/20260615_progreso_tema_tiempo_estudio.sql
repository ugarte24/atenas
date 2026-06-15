-- Tiempo de estudio por tema (PRD Módulos 8-9)

ALTER TABLE public.progreso_tema
  ADD COLUMN IF NOT EXISTS tiempo_estudio_segundos integer NOT NULL DEFAULT 0;
