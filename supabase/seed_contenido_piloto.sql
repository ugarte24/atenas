/*
 * ATENAS - Contenido piloto enriquecido (3 temas, uno por isla)
 * Ejecutar TODO este archivo en Supabase SQL Editor (rol postgres).
 * Requiere: seed_contenido_curricular.sql ya ejecutado.
 * Idempotente: ON CONFLICT DO UPDATE.
 */

-- ---------------------------------------------------------------------------
-- 1) Contenido HTML enriquecido (3 temas piloto)
-- ---------------------------------------------------------------------------
UPDATE public.temas SET content = $html$
<h3>La Tierra, nuestro hogar</h3>
<p>La Tierra tiene forma aproximadamente esférica. Este hecho nos ayuda a entender mapas, zonas horarias y la distribución de climas y paisajes en el planeta.</p>
<h3>Movimientos principales</h3>
<ul>
  <li><strong>Rotación:</strong> la Tierra gira sobre sí misma en unas 24 horas. Produce el día y la noche.</li>
  <li><strong>Traslación:</strong> la Tierra orbita alrededor del Sol en unos 365 días. Explica las estaciones del año.</li>
</ul>
<blockquote>Observar estos movimientos es el primer paso para leer mapas y comprender cómo nos organizamos en el territorio — como en las comunidades del Abya Yala.</blockquote>
$html$
WHERE id = 'bbbb0001-0000-4000-8000-000000000001'::uuid;

UPDATE public.temas SET content = $html$
<h3>Europa en el mapa</h3>
<p>Europa es un continente con gran diversidad de relieves, climas y países. Conocer su mapa físico y político nos ayuda a entender la organización territorial de muchas sociedades.</p>
<h3>Grandes unidades de relieve</h3>
<ul>
  <li><strong>Alpes y Pirineos:</strong> cordilleras que marcan fronteras naturales.</li>
  <li><strong>Llanuras y mesetas:</strong> espacios de población y actividad económica.</li>
  <li><strong>Costas y mares:</strong> rutas de intercambio histórico y cultural.</li>
</ul>
<p>En tu recorrido por la <em>Isla 2 · Organización</em>, este tema conecta geografía europea con la idea de cómo los pueblos organizan su territorio.</p>
$html$
WHERE id = 'bbbb0003-0000-4000-8000-000000000001'::uuid;

UPDATE public.temas SET content = $html$
<h3>España en el siglo XIX</h3>
<p>El siglo XIX fue un periodo de grandes cambios políticos y sociales en España y en Europa. Comprender este contexto nos ayuda a entender procesos de contacto, conflicto y transformación — temas centrales de la <em>Isla 3 · Invasión europea</em>.</p>
<h3>Ideas clave</h3>
<ul>
  <li>Revoluciones liberales y nuevas formas de gobierno.</li>
  <li>Industrialización y cambios en la vida cotidiana.</li>
  <li>Movimientos independentistas y reconfiguración de imperios.</li>
</ul>
<blockquote>Estudiar la historia reciente nos permite reflexionar sobre convivencia, derechos y participación ciudadana hoy.</blockquote>
$html$
WHERE id = 'bbbb0006-0000-4000-8000-000000000001'::uuid;

-- UUIDs piloto (solo hex 0-9/a-f): recursos ffffa00x · micro-quiz dddda00x
-- ---------------------------------------------------------------------------
-- 2) Recursos (1 por tema piloto)
-- ---------------------------------------------------------------------------
INSERT INTO public.recursos (id, tema_id, tipo, url, title, contenido)
VALUES
  ('ffffa001-0000-4000-8000-000000000001'::uuid, 'bbbb0001-0000-4000-8000-000000000001'::uuid,
   'imagen',
   'https://upload.wikimedia.org/wikipedia/commons/thumb/9/97/The_Earth_seen_from_Apollo_17.jpg/640px-The_Earth_seen_from_Apollo_17.jpg',
   'La Tierra desde el espacio', NULL),
  ('ffffa002-0000-4000-8000-000000000001'::uuid, 'bbbb0003-0000-4000-8000-000000000001'::uuid,
   'imagen',
   'https://upload.wikimedia.org/wikipedia/commons/thumb/8/80/World_map_-_low_resolution.svg/1280px-World_map_-_low_resolution.svg.png',
   'Mapa de referencia: Europa y el mundo', NULL),
  ('ffffa003-0000-4000-8000-000000000001'::uuid, 'bbbb0006-0000-4000-8000-000000000001'::uuid,
   'texto', '',
   'Línea de tiempo (resumen)',
   '1808–1814: Guerra de la Independencia. 1868: Revolución gloriosa. 1873–1874: Primera República. 1898: fin del imperio colonial español en América y Filipinas.')
ON CONFLICT (id) DO UPDATE SET
  tema_id = EXCLUDED.tema_id,
  tipo = EXCLUDED.tipo,
  url = EXCLUDED.url,
  title = EXCLUDED.title,
  contenido = EXCLUDED.contenido;

-- ---------------------------------------------------------------------------
-- 3) Micro-quiz publicado (1 por tema piloto)
-- ---------------------------------------------------------------------------
INSERT INTO public.evaluaciones (
  id, tema_id, title, preguntas, publicada, max_intentos, modo_examen,
  es_micro_quiz, micro_ubicacion
)
VALUES
  ('dddda001-0000-4000-8000-000000000001'::uuid, 'bbbb0001-0000-4000-8000-000000000001'::uuid,
   'Micro-quiz: movimientos de la Tierra',
   '[{"enunciado":"¿Qué movimiento produce el día y la noche?","opciones":[{"texto":"La rotación","correcta":true},{"texto":"La traslación","correcta":false}]},{"enunciado":"¿Cuánto dura aproximadamente una traslación completa?","opciones":[{"texto":"Unos 365 días","correcta":true},{"texto":"Unas 24 horas","correcta":false}]}]'::jsonb,
   true, 2, false, true, 'post_contenido'),
  ('dddda002-0000-4000-8000-000000000001'::uuid, 'bbbb0003-0000-4000-8000-000000000001'::uuid,
   'Micro-quiz: relieve europeo',
   '[{"enunciado":"Los Alpes son principalmente…","opciones":[{"texto":"Una cordillera montañosa","correcta":true},{"texto":"Un desierto","correcta":false}]},{"enunciado":"Leer el mapa físico de Europa ayuda a…","opciones":[{"texto":"Entender relieve y distribución del territorio","correcta":true},{"texto":"Solo memorizar nombres de ríos","correcta":false}]}]'::jsonb,
   true, 2, false, true, 'post_contenido'),
  ('dddda003-0000-4000-8000-000000000001'::uuid, 'bbbb0006-0000-4000-8000-000000000001'::uuid,
   'Micro-quiz: siglo XIX',
   '[{"enunciado":"El siglo XIX en España incluye procesos de…","opciones":[{"texto":"Cambio político y social","correcta":true},{"texto":"Estabilidad sin transformaciones","correcta":false}]},{"enunciado":"Estudiar este periodo nos ayuda a…","opciones":[{"texto":"Comprender la sociedad actual","correcta":true},{"texto":"Ignorar la convivencia presente","correcta":false}]}]'::jsonb,
   true, 2, false, true, 'post_contenido')
ON CONFLICT (id) DO UPDATE SET
  tema_id = EXCLUDED.tema_id,
  title = EXCLUDED.title,
  preguntas = EXCLUDED.preguntas,
  publicada = EXCLUDED.publicada,
  es_micro_quiz = EXCLUDED.es_micro_quiz,
  micro_ubicacion = EXCLUDED.micro_ubicacion;

-- ---------------------------------------------------------------------------
-- 4) visual_theme en unidades (refuerzo narrativa híbrida)
-- ---------------------------------------------------------------------------
UPDATE public.unidades SET visual_theme = 'abya_yala' WHERE orden IN (1, 2);
UPDATE public.unidades SET visual_theme = 'europa' WHERE orden IN (3, 4);
UPDATE public.unidades SET visual_theme = 'historia' WHERE orden = 5;
UPDATE public.unidades SET visual_theme = 'historia' WHERE orden IN (6, 7);
