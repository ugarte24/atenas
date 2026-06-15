-- Tipos de recurso ampliados (PRD Módulo 5): texto, pdf, imagen, video, audio (+ mapa)

ALTER TABLE public.recursos
  ADD COLUMN IF NOT EXISTS contenido text;

ALTER TABLE public.recursos DROP CONSTRAINT IF EXISTS recursos_tipo_check;

ALTER TABLE public.recursos
  ADD CONSTRAINT recursos_tipo_check
  CHECK (tipo IN ('texto', 'pdf', 'imagen', 'mapa', 'video', 'audio'));
