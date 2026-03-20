-- Campos visuales y multimedia opcionales para unidades (lista / detalle estilo Home)

ALTER TABLE public.unidades
  ADD COLUMN IF NOT EXISTS cover_image_url text NULL;

ALTER TABLE public.unidades
  ADD COLUMN IF NOT EXISTS cover_video_url text NULL;

ALTER TABLE public.unidades
  ADD COLUMN IF NOT EXISTS accent_color text NULL;

ALTER TABLE public.unidades
  ADD COLUMN IF NOT EXISTS intro_extended text NULL;

ALTER TABLE public.unidades
  ADD COLUMN IF NOT EXISTS visual_theme text NULL;

COMMENT ON COLUMN public.unidades.cover_image_url IS 'URL de imagen de portada (público o Storage).';
COMMENT ON COLUMN public.unidades.cover_video_url IS 'URL de vídeo (YouTube/Vimeo watch o embed, o URL directa a archivo).';
COMMENT ON COLUMN public.unidades.accent_color IS 'Color hex para acentos UI, ej. #009975.';
COMMENT ON COLUMN public.unidades.intro_extended IS 'Texto largo multilínea para la ficha de unidad.';
COMMENT ON COLUMN public.unidades.visual_theme IS 'Preset visual opcional: abya_yala, europa, default, etc.';
