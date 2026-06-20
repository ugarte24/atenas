-- Permite ocultar logros del catálogo estudiante sin borrarlos
ALTER TABLE public.achievements
  ADD COLUMN IF NOT EXISTS activo boolean NOT NULL DEFAULT true;
