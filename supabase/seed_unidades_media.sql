-- =============================================================================
-- ATENAS · Rellena portada, vídeo, color, intro ampliada y tema visual
-- =============================================================================
-- Ejecutar en SQL Editor (Dashboard Supabase) o psql DESPUÉS de las migraciones
-- y del seed de contenido (o sobre una BD que ya tenga filas en `unidades`).
--
-- Idempotente: sobrescribe siempre estos campos para los UUIDs fijos del seed
-- y para la unidad con orden = 8 (Abya Yala / mundo actual).
-- Vídeos en español (audio/narración) de canales educativos públicos.
-- =============================================================================

UPDATE public.unidades SET
  cover_image_url = 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/97/The_Earth_seen_from_Apollo_17.jpg/1280px-The_Earth_seen_from_Apollo_17.jpg',
  cover_video_url = 'https://www.youtube.com/watch?v=th79sDCAh0Q',
  accent_color = '#0B5394',
  intro_extended = 'Conocerás la forma de la Tierra, la rotación y la traslación, cómo leer mapas con escala y coordenadas, y las grandes zonas climáticas. Cada tema incluye actividades y una evaluación corta.',
  visual_theme = NULL
WHERE id = 'aaaa0001-0000-4000-8000-000000000001'::uuid;

UPDATE public.unidades SET
  cover_image_url = 'https://images.unsplash.com/photo-1583422409516-2895a77efded?w=1200&q=80',
  cover_video_url = 'https://www.youtube.com/watch?v=Qq1TbP2OqRk',
  accent_color = '#009975',
  intro_extended = 'Estudiarás el relieve peninsular, las vertientes hidrográficas y los climas de España, relacionando paisaje y actividades humanas. Practica con mapas físicos y climáticos en cada tema.',
  visual_theme = NULL
WHERE id = 'aaaa0002-0000-4000-8000-000000000001'::uuid;

UPDATE public.unidades SET
  cover_image_url = 'https://images.unsplash.com/photo-1467269204594-9661b134dd2b?w=1200&q=80',
  cover_video_url = 'https://www.youtube.com/watch?v=iecjWKviIvo',
  accent_color = '#003399',
  intro_extended = 'Trabajarás el mapa físico y político de Europa, las instituciones de la Unión Europea y la ciudadanía europea. Reflexionarás sobre derechos y convivencia en el espacio común.',
  visual_theme = 'europa'
WHERE id = 'aaaa0003-0000-4000-8000-000000000001'::uuid;

UPDATE public.unidades SET
  cover_image_url = 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=1200&q=80',
  cover_video_url = 'https://www.youtube.com/watch?v=TDw7Obp5RS8',
  accent_color = '#2E7D32',
  intro_extended = 'Analizarás distribución de la población, pirámides de edad, sectores económicos y efectos de la globalización. Relacionarás datos con el entorno y el consumo responsable.',
  visual_theme = NULL
WHERE id = 'aaaa0004-0000-4000-8000-000000000001'::uuid;

UPDATE public.unidades SET
  cover_image_url = 'https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?w=1200&q=80',
  cover_video_url = 'https://www.youtube.com/watch?v=NKdHlkolGBM',
  accent_color = '#6D4C41',
  intro_extended = 'Repasarás etapas desde la Prehistoria hasta la Edad Moderna y el patrimonio histórico en España. Construirás una línea del tiempo coherente con ejemplos de monumentos y cultura material.',
  visual_theme = 'historia'
WHERE id = 'aaaa0005-0000-4000-8000-000000000001'::uuid;

UPDATE public.unidades SET
  cover_image_url = 'https://images.unsplash.com/photo-1529107386315-e1a2ed48a620?w=1200&q=80',
  cover_video_url = 'https://www.youtube.com/watch?v=ofMR4HhaqBQ',
  accent_color = '#C62828',
  intro_extended = 'Estudiarás procesos del siglo XIX, la Guerra Civil, la dictadura, la Transición y la Constitución de 1978, hasta la organización territorial del Estado autonómico y la participación ciudadana.',
  visual_theme = 'historia'
WHERE id = 'aaaa0006-0000-4000-8000-000000000001'::uuid;

UPDATE public.unidades SET
  cover_image_url = 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=1200&q=80',
  cover_video_url = 'https://www.youtube.com/watch?v=mMJ6Yy0N-I8',
  accent_color = '#00897B',
  intro_extended = 'Reflexionarás sobre derechos de la infancia, igualdad, diversidad, mediación y participación en el centro y en el barrio. Conectarás normas, valores y acciones cotidianas de convivencia.',
  visual_theme = 'ciudadania'
WHERE id = 'aaaa0007-0000-4000-8000-000000000001'::uuid;

-- Unidad 8 (currículo Abya Yala / mundo actual): aplica si existe fila con orden 8
-- (p. ej. «Abya Yala y mundo actual» creada en docente o migración aparte).
UPDATE public.unidades SET
  cover_image_url = 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=1200&q=80',
  cover_video_url = 'https://www.youtube.com/watch?v=oNpJSqZwGoE',
  accent_color = '#00695C',
  intro_extended = 'Explorarás perspectivas del Abya Yala y su diálogo con el mundo actual: territorios, culturas, colonialidad y desafíos globales. Integrarás miradas locales y planetarias en cada tema.',
  visual_theme = 'abya_yala'
WHERE orden = 8;
