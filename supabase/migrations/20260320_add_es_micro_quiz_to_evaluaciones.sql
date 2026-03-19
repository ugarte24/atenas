-- Micro-quiz: algunos cuestionarios se muestran como preguntas cortas en la vista de tema.

ALTER TABLE public.evaluaciones
  ADD COLUMN IF NOT EXISTS es_micro_quiz boolean NOT NULL DEFAULT false;

ALTER TABLE public.evaluaciones
  ADD COLUMN IF NOT EXISTS micro_ubicacion text NOT NULL DEFAULT 'post_contenido';

