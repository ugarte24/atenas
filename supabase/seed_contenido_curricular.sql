-- =============================================================================
-- ATENAS · Seed de contenido curricular (Ciencias Sociales 6.º Primaria)
-- =============================================================================
-- Carga: unidades (con portada, vídeo, color, intro y tema visual), temas
-- (prerequisito en cadena por unidad), 1 actividad publicada y 1 evaluación
-- publicada por tema.
--
-- Cómo ejecutar:
--   1) Supabase Dashboard → SQL Editor → pegar y ejecutar (rol postgres: ignora RLS).
--   2) O: psql conectado al proyecto.
--
-- Idempotencia: ON CONFLICT (id) DO NOTHING (re-ejecutar no duplica filas).
-- Para vaciar y volver a cargar: borrar en orden hijo→padre o TRUNCATE CASCADE
-- (solo en desarrollo).
-- =============================================================================

-- UUIDs fijos (referencias estables)
-- Unidades: aaaa0001 … aaaa0007
-- Temas:    bbbb0001-…-0001/002/003 por unidad (u1→0001, u2→0002, …)
-- Actividades: cccc0001 … cccc0021
-- Evaluaciones: dddd0001 … dddd0021

-- ---------------------------------------------------------------------------
-- UNIDADES
-- ---------------------------------------------------------------------------
INSERT INTO public.unidades (
  id, title, description, orden, certificado_umbral_pct,
  cover_image_url, cover_video_url, accent_color, intro_extended, visual_theme
)
VALUES
  ('aaaa0001-0000-4000-8000-000000000001'::uuid, 'Unidad 1 · El planeta Tierra y su representación',
   'Forma de la Tierra, mapas y climas. Contenido de ejemplo para ATENAS.', 1, 70,
   'https://upload.wikimedia.org/wikipedia/commons/thumb/9/97/The_Earth_seen_from_Apollo_17.jpg/1280px-The_Earth_seen_from_Apollo_17.jpg',
   'https://www.youtube.com/watch?v=th79sDCAh0Q',
   '#0B5394',
   'Conocerás la forma de la Tierra, la rotación y la traslación, cómo leer mapas con escala y coordenadas, y las grandes zonas climáticas. Cada tema incluye actividades y una evaluación corta.',
   NULL),
  ('aaaa0002-0000-4000-8000-000000000001'::uuid, 'Unidad 2 · España: relieve, ríos y clima',
   'Relieve, hidrografía y climas de España.', 2, 70,
   'https://images.unsplash.com/photo-1583422409516-2895a77efded?w=1200&q=80',
   'https://www.youtube.com/watch?v=Qq1TbP2OqRk',
   '#009975',
   'Estudiarás el relieve peninsular, las vertientes hidrográficas y los climas de España, relacionando paisaje y actividades humanas. Practica con mapas físicos y climáticos en cada tema.',
   NULL),
  ('aaaa0003-0000-4000-8000-000000000001'::uuid, 'Unidad 3 · Europa y la Unión Europea',
   'Europa física y política; UE y ciudadanía.', 3, 70,
   'https://images.unsplash.com/photo-1467269204594-9661b134dd2b?w=1200&q=80',
   'https://www.youtube.com/watch?v=iecjWKviIvo',
   '#003399',
   'Trabajarás el mapa físico y político de Europa, las instituciones de la Unión Europea y la ciudadanía europea. Reflexionarás sobre derechos y convivencia en el espacio común.',
   'europa'),
  ('aaaa0004-0000-4000-8000-000000000001'::uuid, 'Unidad 4 · La población y las actividades económicas',
   'Población, sectores económicos y globalización.', 4, 70,
   'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=1200&q=80',
   'https://www.youtube.com/watch?v=TDw7Obp5RS8',
   '#2E7D32',
   'Analizarás distribución de la población, pirámides de edad, sectores económicos y efectos de la globalización. Relacionarás datos con el entorno y el consumo responsable.',
   NULL),
  ('aaaa0005-0000-4000-8000-000000000001'::uuid, 'Unidad 5 · Historia: de la Prehistoria a la Edad Moderna (repaso)',
   'Síntesis histórica y patrimonio en España.', 5, 70,
   'https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?w=1200&q=80',
   'https://www.youtube.com/watch?v=NKdHlkolGBM',
   '#6D4C41',
   'Repasarás etapas desde la Prehistoria hasta la Edad Moderna y el patrimonio histórico en España. Construirás una línea del tiempo coherente con ejemplos de monumentos y cultura material.',
   'historia'),
  ('aaaa0006-0000-4000-8000-000000000001'::uuid, 'Unidad 6 · Historia contemporánea de España',
   'Siglo XIX, Guerra Civil, Transición y democracia.', 6, 70,
   'https://images.unsplash.com/photo-1529107386315-e1a2ed48a620?w=1200&q=80',
   'https://www.youtube.com/watch?v=ofMR4HhaqBQ',
   '#C62828',
   'Estudiarás procesos del siglo XIX, la Guerra Civil, la dictadura, la Transición y la Constitución de 1978, hasta la organización territorial del Estado autonómico y la participación ciudadana.',
   'historia'),
  ('aaaa0007-0000-4000-8000-000000000001'::uuid, 'Unidad 7 · Convivencia, derechos y participación',
   'Derechos, igualdad y participación ciudadana.', 7, 70,
   'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=1200&q=80',
   'https://www.youtube.com/watch?v=mMJ6Yy0N-I8',
   '#00897B',
   'Reflexionarás sobre derechos de la infancia, igualdad, diversidad, mediación y participación en el centro y en el barrio. Conectarás normas, valores y acciones cotidianas de convivencia.',
   'ciudadania')
ON CONFLICT (id) DO NOTHING;

-- ---------------------------------------------------------------------------
-- TEMAS (prerequisito: cadena dentro de cada unidad; primer tema sin prereq)
-- ---------------------------------------------------------------------------
INSERT INTO public.temas (id, unidad_id, title, content, orden, prerequisito_tema_id)
VALUES
  -- Unidad 1
  ('bbbb0001-0000-4000-8000-000000000001'::uuid, 'aaaa0001-0000-4000-8000-000000000001'::uuid,
   'T1.1 · La forma de la Tierra y sus movimientos',
   '<p>Introducción a la forma esférica de la Tierra, rotación y traslación (contenido de ejemplo).</p>', 1, NULL),
  ('bbbb0001-0000-4000-8000-000000000002'::uuid, 'aaaa0001-0000-4000-8000-000000000001'::uuid,
   'T1.2 · Los mapas: escala, símbolos y coordenadas',
   '<p>Lectura de mapas: escala, leyenda y coordenadas básicas.</p>', 2, 'bbbb0001-0000-4000-8000-000000000001'::uuid),
  ('bbbb0001-0000-4000-8000-000000000003'::uuid, 'aaaa0001-0000-4000-8000-000000000001'::uuid,
   'T1.3 · Zonas climáticas y paisajes de la Tierra',
   '<p>Climas principales y paisajes asociados.</p>', 3, 'bbbb0001-0000-4000-8000-000000000002'::uuid),
  -- Unidad 2
  ('bbbb0002-0000-4000-8000-000000000001'::uuid, 'aaaa0002-0000-4000-8000-000000000001'::uuid,
   'T2.1 · El relieve de España y sus unidades principales',
   '<p>Mesetas, cordilleras y costas.</p>', 1, NULL),
  ('bbbb0002-0000-4000-8000-000000000002'::uuid, 'aaaa0002-0000-4000-8000-000000000001'::uuid,
   'T2.2 · Ríos y vertientes hidrográficas',
   '<p>Cuencas y vertientes atlántica y mediterránea.</p>', 2, 'bbbb0002-0000-4000-8000-000000000001'::uuid),
  ('bbbb0002-0000-4000-8000-000000000003'::uuid, 'aaaa0002-0000-4000-8000-000000000001'::uuid,
   'T2.3 · Climas y paisajes de España',
   '<p>Climas mediterráneo, oceánico y otros.</p>', 3, 'bbbb0002-0000-4000-8000-000000000002'::uuid),
  -- Unidad 3
  ('bbbb0003-0000-4000-8000-000000000001'::uuid, 'aaaa0003-0000-4000-8000-000000000001'::uuid,
   'T3.1 · El mapa físico y político de Europa',
   '<p>Grandes unidades de relieve y países.</p>', 1, NULL),
  ('bbbb0003-0000-4000-8000-000000000002'::uuid, 'aaaa0003-0000-4000-8000-000000000001'::uuid,
   'T3.2 · La Unión Europea: instituciones y países miembros',
   '<p>UE: instituciones y ampliación.</p>', 2, 'bbbb0003-0000-4000-8000-000000000001'::uuid),
  ('bbbb0003-0000-4000-8000-000000000003'::uuid, 'aaaa0003-0000-4000-8000-000000000001'::uuid,
   'T3.3 · La ciudadanía europea y los derechos fundamentales',
   '<p>Derechos y deberes en el espacio europeo.</p>', 3, 'bbbb0003-0000-4000-8000-000000000002'::uuid),
  -- Unidad 4
  ('bbbb0004-0000-4000-8000-000000000001'::uuid, 'aaaa0004-0000-4000-8000-000000000001'::uuid,
   'T4.1 · Población: distribución, movimientos migratorios y pirámides de edad',
   '<p>Estructura poblacional y migraciones.</p>', 1, NULL),
  ('bbbb0004-0000-4000-8000-000000000002'::uuid, 'aaaa0004-0000-4000-8000-000000000001'::uuid,
   'T4.2 · Sectores económicos: primario, secundario y terciario',
   '<p>Actividades económicas y empleo.</p>', 2, 'bbbb0004-0000-4000-8000-000000000001'::uuid),
  ('bbbb0004-0000-4000-8000-000000000003'::uuid, 'aaaa0004-0000-4000-8000-000000000001'::uuid,
   'T4.3 · Globalización, comercio y consumo responsable',
   '<p>Interdependencia y sostenibilidad.</p>', 3, 'bbbb0004-0000-4000-8000-000000000002'::uuid),
  -- Unidad 5
  ('bbbb0005-0000-4000-8000-000000000001'::uuid, 'aaaa0005-0000-4000-8000-000000000001'::uuid,
   'T5.1 · De la Prehistoria a la Edad Antigua (resumen)',
   '<p>Introducción histórica general.</p>', 1, NULL),
  ('bbbb0005-0000-4000-8000-000000000002'::uuid, 'aaaa0005-0000-4000-8000-000000000001'::uuid,
   'T5.2 · Edad Media y Edad Moderna (resumen)',
   '<p>Continuidad y cambios en Europa y España.</p>', 2, 'bbbb0005-0000-4000-8000-000000000001'::uuid),
  ('bbbb0005-0000-4000-8000-000000000003'::uuid, 'aaaa0005-0000-4000-8000-000000000001'::uuid,
   'T5.3 · Patrimonio histórico y cultural en España',
   '<p>Bienes culturales y patrimonio mundial.</p>', 3, 'bbbb0005-0000-4000-8000-000000000002'::uuid),
  -- Unidad 6
  ('bbbb0006-0000-4000-8000-000000000001'::uuid, 'aaaa0006-0000-4000-8000-000000000001'::uuid,
   'T6.1 · Del siglo XIX a la Guerra Civil (visión general)',
   '<p>Contexto político y social.</p>', 1, NULL),
  ('bbbb0006-0000-4000-8000-000000000002'::uuid, 'aaaa0006-0000-4000-8000-000000000001'::uuid,
   'T6.2 · Dictadura, Transición y Constitución de 1978',
   '<p>Memoria democrática y marco constitucional.</p>', 2, 'bbbb0006-0000-4000-8000-000000000001'::uuid),
  ('bbbb0006-0000-4000-8000-000000000003'::uuid, 'aaaa0006-0000-4000-8000-000000000001'::uuid,
   'T6.3 · España democrática: organización territorial y autonomías',
   '<p>Estado de las autonomías y participación.</p>', 3, 'bbbb0006-0000-4000-8000-000000000002'::uuid),
  -- Unidad 7
  ('bbbb0007-0000-4000-8000-000000000001'::uuid, 'aaaa0007-0000-4000-8000-000000000001'::uuid,
   'T7.1 · Derechos de la infancia y ciudadanía activa',
   '<p>Convención y participación.</p>', 1, NULL),
  ('bbbb0007-0000-4000-8000-000000000002'::uuid, 'aaaa0007-0000-4000-8000-000000000001'::uuid,
   'T7.2 · Igualdad, diversidad y prevención de conflictos',
   '<p>Respeto y mediación.</p>', 2, 'bbbb0007-0000-4000-8000-000000000001'::uuid),
  ('bbbb0007-0000-4000-8000-000000000003'::uuid, 'aaaa0007-0000-4000-8000-000000000001'::uuid,
   'T7.3 · Participación en la vida escolar y local',
   '<p>Asociaciones y vida comunitaria.</p>', 3, 'bbbb0007-0000-4000-8000-000000000002'::uuid)
ON CONFLICT (id) DO NOTHING;

-- ---------------------------------------------------------------------------
-- ACTIVIDADES (1 por tema · selección múltiple · publicada)
-- ---------------------------------------------------------------------------
INSERT INTO public.actividades (id, tema_id, tipo, title, config, publicada, orden)
VALUES
  ('cccc0001-0000-4000-8000-000000000001'::uuid, 'bbbb0001-0000-4000-8000-000000000001'::uuid, 'seleccion_multiple',
   'Actividad: forma de la Tierra', '{"pregunta":"¿Qué movimiento de la Tierra produce el día y la noche?","opciones":[{"texto":"Rotación","correcta":true},{"texto":"Traslación","correcta":false},{"texto":"Nutación","correcta":false}],"multiple":false}'::jsonb, true, 1),
  ('cccc0002-0000-4000-8000-000000000001'::uuid, 'bbbb0001-0000-4000-8000-000000000002'::uuid, 'seleccion_multiple',
   'Actividad: mapas', '{"pregunta":"En un mapa, ¿qué indica la escala?","opciones":[{"texto":"La relación entre distancia en el mapa y la realidad","correcta":true},{"texto":"Solo la altitud","correcta":false},{"texto":"El clima","correcta":false}],"multiple":false}'::jsonb, true, 1),
  ('cccc0003-0000-4000-8000-000000000001'::uuid, 'bbbb0001-0000-4000-8000-000000000003'::uuid, 'seleccion_multiple',
   'Actividad: climas', '{"pregunta":"Las zonas climáticas se relacionan principalmente con…","opciones":[{"texto":"La latitud y la circulación atmosférica","correcta":true},{"texto":"Solo la longitud","correcta":false},{"texto":"Únicamente el relieve local","correcta":false}],"multiple":false}'::jsonb, true, 1),
  ('cccc0004-0000-4000-8000-000000000001'::uuid, 'bbbb0002-0000-4000-8000-000000000001'::uuid, 'seleccion_multiple',
   'Actividad: relieve de España', '{"pregunta":"La Meseta Central es…","opciones":[{"texto":"Una gran superficie elevada en el interior de la Península","correcta":true},{"texto":"Un océano","correcta":false},{"texto":"Un río","correcta":false}],"multiple":false}'::jsonb, true, 1),
  ('cccc0005-0000-4000-8000-000000000001'::uuid, 'bbbb0002-0000-4000-8000-000000000002'::uuid, 'seleccion_multiple',
   'Actividad: ríos', '{"pregunta":"¿Qué es una vertiente hidrográfica?","opciones":[{"texto":"La zona que drena hacia un mismo océano o mar","correcta":true},{"texto":"Solo la desembocadura","correcta":false},{"texto":"El nacimiento del río","correcta":false}],"multiple":false}'::jsonb, true, 1),
  ('cccc0006-0000-4000-8000-000000000001'::uuid, 'bbbb0002-0000-4000-8000-000000000003'::uuid, 'seleccion_multiple',
   'Actividad: climas de España', '{"pregunta":"El clima mediterráneo en España se caracteriza por…","opciones":[{"texto":"Veranos secos e inviernos suaves","correcta":true},{"texto":"Lluvia constante todo el año","correcta":false},{"texto":"Nieve permanente","correcta":false}],"multiple":false}'::jsonb, true, 1),
  ('cccc0007-0000-4000-8000-000000000001'::uuid, 'bbbb0003-0000-4000-8000-000000000001'::uuid, 'seleccion_multiple',
   'Actividad: Europa', '{"pregunta":"Los Alpes son principalmente…","opciones":[{"texto":"Una gran cordillera montañosa","correcta":true},{"texto":"Un desierto","correcta":false},{"texto":"Un lago único","correcta":false}],"multiple":false}'::jsonb, true, 1),
  ('cccc0008-0000-4000-8000-000000000001'::uuid, 'bbbb0003-0000-4000-8000-000000000002'::uuid, 'seleccion_multiple',
   'Actividad: Unión Europea', '{"pregunta":"La UE es principalmente…","opciones":[{"texto":"Un proyecto de integración política y económica","correcta":true},{"texto":"Un solo país","correcta":false},{"texto":"Una alianza militar exclusiva","correcta":false}],"multiple":false}'::jsonb, true, 1),
  ('cccc0009-0000-4000-8000-000000000001'::uuid, 'bbbb0003-0000-4000-8000-000000000003'::uuid, 'seleccion_multiple',
   'Actividad: ciudadanía europea', '{"pregunta":"La ciudadanía europea complementa…","opciones":[{"texto":"La nacionalidad del Estado miembro","correcta":true},{"texto":"Solo el pasaporte mundial","correcta":false},{"texto":"La residencia en Asia","correcta":false}],"multiple":false}'::jsonb, true, 1),
  ('cccc0010-0000-4000-8000-000000000001'::uuid, 'bbbb0004-0000-4000-8000-000000000001'::uuid, 'seleccion_multiple',
   'Actividad: población', '{"pregunta":"La pirámide de población muestra…","opciones":[{"texto":"La estructura por edades y sexos","correcta":true},{"texto":"Solo el clima","correcta":false},{"texto":"Solo el PIB","correcta":false}],"multiple":false}'::jsonb, true, 1),
  ('cccc0011-0000-4000-8000-000000000001'::uuid, 'bbbb0004-0000-4000-8000-000000000002'::uuid, 'seleccion_multiple',
   'Actividad: sectores económicos', '{"pregunta":"El sector primario se basa en…","opciones":[{"texto":"Actividades que extraen recursos de la naturaleza","correcta":true},{"texto":"Solo servicios","correcta":false},{"texto":"Solo industria","correcta":false}],"multiple":false}'::jsonb, true, 1),
  ('cccc0012-0000-4000-8000-000000000001'::uuid, 'bbbb0004-0000-4000-8000-000000000003'::uuid, 'seleccion_multiple',
   'Actividad: globalización', '{"pregunta":"La globalización implica…","opciones":[{"texto":"Mayor interconexión entre países y mercados","correcta":true},{"texto":"Aislamiento total","correcta":false},{"texto":"Eliminar el comercio","correcta":false}],"multiple":false}'::jsonb, true, 1),
  ('cccc0013-0000-4000-8000-000000000001'::uuid, 'bbbb0005-0000-4000-8000-000000000001'::uuid, 'seleccion_multiple',
   'Actividad: Prehistoria', '{"pregunta":"La Prehistoria es el periodo…","opciones":[{"texto":"Anterior a la escritura","correcta":true},{"texto":"Posterior a Internet","correcta":false},{"texto":"Solo el siglo XX","correcta":false}],"multiple":false}'::jsonb, true, 1),
  ('cccc0014-0000-4000-8000-000000000001'::uuid, 'bbbb0005-0000-4000-8000-000000000002'::uuid, 'seleccion_multiple',
   'Actividad: Edad Media', '{"pregunta":"En la Edad Media destacó una organización social llamada…","opciones":[{"texto":"Feudalismo (en términos generales)","correcta":true},{"texto":"Globalización digital","correcta":false},{"texto":"Revolución industrial plena","correcta":false}],"multiple":false}'::jsonb, true, 1),
  ('cccc0015-0000-4000-8000-000000000001'::uuid, 'bbbb0005-0000-4000-8000-000000000003'::uuid, 'seleccion_multiple',
   'Actividad: patrimonio', '{"pregunta":"El patrimonio histórico puede incluir…","opciones":[{"texto":"Monumentos y bienes culturales","correcta":true},{"texto":"Solo productos de consumo","correcta":false},{"texto":"Solo mapas meteorológicos","correcta":false}],"multiple":false}'::jsonb, true, 1),
  ('cccc0016-0000-4000-8000-000000000001'::uuid, 'bbbb0006-0000-4000-8000-000000000001'::uuid, 'seleccion_multiple',
   'Actividad: siglo XIX', '{"pregunta":"En el siglo XIX en España hubo…","opciones":[{"texto":"Transformaciones políticas y sociales importantes","correcta":true},{"texto":"Cero cambios","correcta":false},{"texto":"Solo la Edad Media","correcta":false}],"multiple":false}'::jsonb, true, 1),
  ('cccc0017-0000-4000-8000-000000000001'::uuid, 'bbbb0006-0000-4000-8000-000000000002'::uuid, 'seleccion_multiple',
   'Actividad: Transición', '{"pregunta":"La Constitución de 1978 es…","opciones":[{"texto":"La norma suprema del ordenamiento español","correcta":true},{"texto":"Un folleto sin valor","correcta":false},{"texto":"Solo una ley municipal","correcta":false}],"multiple":false}'::jsonb, true, 1),
  ('cccc0018-0000-4000-8000-000000000001'::uuid, 'bbbb0006-0000-4000-8000-000000000003'::uuid, 'seleccion_multiple',
   'Actividad: autonomías', '{"pregunta":"España es…","opciones":[{"texto":"Un Estado social y democrático de Derecho","correcta":true},{"texto":"Una monarquía absoluta sin leyes","correcta":false},{"texto":"Una colonia","correcta":false}],"multiple":false}'::jsonb, true, 1),
  ('cccc0019-0000-4000-8000-000000000001'::uuid, 'bbbb0007-0000-4000-8000-000000000001'::uuid, 'seleccion_multiple',
   'Actividad: derechos de la infancia', '{"pregunta":"Los derechos de la infancia buscan…","opciones":[{"texto":"Proteger y promover el desarrollo de niños y niñas","correcta":true},{"texto":"Eliminar la educación","correcta":false},{"texto":"Solo obligaciones sin derechos","correcta":false}],"multiple":false}'::jsonb, true, 1),
  ('cccc0020-0000-4000-8000-000000000001'::uuid, 'bbbb0007-0000-4000-8000-000000000002'::uuid, 'seleccion_multiple',
   'Actividad: igualdad', '{"pregunta":"La igualdad de trato implica…","opciones":[{"texto":"No discriminación y respeto a la diversidad","correcta":true},{"texto":"Trato arbitrario","correcta":false},{"texto":"Exclusión de opiniones","correcta":false}],"multiple":false}'::jsonb, true, 1),
  ('cccc0021-0000-4000-8000-000000000001'::uuid, 'bbbb0007-0000-4000-8000-000000000003'::uuid, 'seleccion_multiple',
   'Actividad: participación', '{"pregunta":"Participar en la vida escolar puede incluir…","opciones":[{"texto":"Consejo escolar, propuestas y debates","correcta":true},{"texto":"Solo imposiciones sin diálogo","correcta":false},{"texto":"Prohibir la participación","correcta":false}],"multiple":false}'::jsonb, true, 1)
ON CONFLICT (id) DO NOTHING;

-- ---------------------------------------------------------------------------
-- EVALUACIONES (1 por tema · 3 preguntas · publicada)
-- ---------------------------------------------------------------------------
INSERT INTO public.evaluaciones (id, tema_id, title, descripcion, umbral_aprobado, preguntas, publicada, orden)
VALUES
  ('dddd0001-0000-4000-8000-000000000001'::uuid, 'bbbb0001-0000-4000-8000-000000000001'::uuid,
   'Evaluación: La Tierra y sus movimientos', 'Cuestionario corto (ejemplo).', 70,
   '[
     {"enunciado":"La Tierra tiene forma aproximadamente…","opciones":[{"texto":"Esférica","correcta":true},{"texto":"Cuadrada","correcta":false},{"texto":"Plana","correcta":false}]},
     {"enunciado":"La traslación produce, en términos generales…","opciones":[{"texto":"Las estaciones del año","correcta":true},{"texto":"El día y la noche","correcta":false},{"texto":"Las mareas","correcta":false}]},
     {"enunciado":"La rotación se produce aproximadamente en…","opciones":[{"texto":"24 horas","correcta":true},{"texto":"365 días","correcta":false},{"texto":"1 mes","correcta":false}]}
   ]'::jsonb, true, 1),
  ('dddd0002-0000-4000-8000-000000000001'::uuid, 'bbbb0001-0000-4000-8000-000000000002'::uuid,
   'Evaluación: Mapas', 'Cuestionario corto (ejemplo).', 70,
   '[
     {"enunciado":"La leyenda del mapa sirve para…","opciones":[{"texto":"Interpretar símbolos y colores","correcta":true},{"texto":"Borrar el mapa","correcta":false},{"texto":"Medir el tiempo","correcta":false}]},
     {"enunciado":"La escala permite…","opciones":[{"texto":"Relacionar distancias en el mapa y en la realidad","correcta":true},{"texto":"Solo medir temperaturas","correcta":false},{"texto":"Solo el relieve","correcta":false}]},
     {"enunciado":"Las coordenadas geográficas usan…","opciones":[{"texto":"Latitud y longitud","correcta":true},{"texto":"Solo colores","correcta":false},{"texto":"Solo el viento","correcta":false}]}
   ]'::jsonb, true, 1),
  ('dddd0003-0000-4000-8000-000000000001'::uuid, 'bbbb0001-0000-4000-8000-000000000003'::uuid,
   'Evaluación: Climas y paisajes', 'Cuestionario corto (ejemplo).', 70,
   '[
     {"enunciado":"La latitud influye en…","opciones":[{"texto":"La cantidad de radiación solar recibida","correcta":true},{"texto":"Solo el idioma","correcta":false},{"texto":"Solo el tráfico","correcta":false}]},
     {"enunciado":"La vegetación suele relacionarse con…","opciones":[{"texto":"Clima y suelo","correcta":true},{"texto":"Solo la música","correcta":false},{"texto":"Solo el deporte","correcta":false}]},
     {"enunciado":"Un climograma muestra…","opciones":[{"texto":"Temperatura y precipitaciones","correcta":true},{"texto":"Solo la población","correcta":false},{"texto":"Solo el PIB","correcta":false}]}
   ]'::jsonb, true, 1),
  ('dddd0004-0000-4000-8000-000000000001'::uuid, 'bbbb0002-0000-4000-8000-000000000001'::uuid,
   'Evaluación: Relieve de España', 'Cuestionario corto (ejemplo).', 70,
   '[
     {"enunciado":"La Meseta es…","opciones":[{"texto":"Una gran superficie elevada en el interior","correcta":true},{"texto":"Un océano","correcta":false},{"texto":"Un río","correcta":false}]},
     {"enunciado":"La cordillera pirenaica se sitúa…","opciones":[{"texto":"Al norte de la Península","correcta":true},{"texto":"Al sur de la Antártida","correcta":false},{"texto":"En el océano Índico","correcta":false}]},
     {"enunciado":"El relieve influye en…","opciones":[{"texto":"Clima y ríos","correcta":true},{"texto":"Solo la música","correcta":false},{"texto":"Solo la hora mundial","correcta":false}]}
   ]'::jsonb, true, 1),
  ('dddd0005-0000-4000-8000-000000000001'::uuid, 'bbbb0002-0000-4000-8000-000000000002'::uuid,
   'Evaluación: Ríos', 'Cuestionario corto (ejemplo).', 70,
   '[
     {"enunciado":"Un río es…","opciones":[{"texto":"Un curso natural de agua","correcta":true},{"texto":"Una montaña","correcta":false},{"texto":"Un desierto","correcta":false}]},
     {"enunciado":"La cuenca hidrográfica es…","opciones":[{"texto":"La zona que drena hacia un mismo sistema","correcta":true},{"texto":"Solo la desembocadura","correcta":false},{"texto":"Solo el cielo","correcta":false}]},
     {"enunciado":"La vertiente mediterránea vierte en general…","opciones":[{"texto":"Al mar Mediterráneo","correcta":true},{"texto":"Al océano Índico","correcta":false},{"texto":"Al mar Muerto","correcta":false}]}
   ]'::jsonb, true, 1),
  ('dddd0006-0000-4000-8000-000000000001'::uuid, 'bbbb0002-0000-4000-8000-000000000003'::uuid,
   'Evaluación: Climas de España', 'Cuestionario corto (ejemplo).', 70,
   '[
     {"enunciado":"El clima mediterráneo suele tener…","opciones":[{"texto":"Veranos secos","correcta":true},{"texto":"Nieve permanente en costa","correcta":false},{"texto":"Lluvia constante todo el año en todas partes","correcta":false}]},
     {"enunciado":"El clima oceánico en el norte suele ser…","opciones":[{"texto":"Más húmedo y moderado","correcta":true},{"texto":"Siempre desértico","correcta":false},{"texto":"Igual que el desierto del Sahara","correcta":false}]},
     {"enunciado":"La altitud puede…","opciones":[{"texto":"Enfriar la temperatura","correcta":true},{"texto":"Eliminar la gravedad","correcta":false},{"texto":"Cambiar el número de meses","correcta":false}]}
   ]'::jsonb, true, 1),
  ('dddd0007-0000-4000-8000-000000000001'::uuid, 'bbbb0003-0000-4000-8000-000000000001'::uuid,
   'Evaluación: Europa', 'Cuestionario corto (ejemplo).', 70,
   '[
     {"enunciado":"Europa es un continente…","opciones":[{"texto":"Del hemisferio norte","correcta":true},{"texto":"Sin países","correcta":false},{"texto":"Solo desierto","correcta":false}]},
     {"enunciado":"Los Alpes son…","opciones":[{"texto":"Una cordillera importante","correcta":true},{"texto":"Un lago único","correcta":false},{"texto":"Un río sin montañas","correcta":false}]},
     {"enunciado":"La Península Ibérica está en…","opciones":[{"texto":"Europa","correcta":true},{"texto":"Oceanía","correcta":false},{"texto":"Antártida","correcta":false}]}
   ]'::jsonb, true, 1),
  ('dddd0008-0000-4000-8000-000000000001'::uuid, 'bbbb0003-0000-4000-8000-000000000002'::uuid,
   'Evaluación: Unión Europea', 'Cuestionario corto (ejemplo).', 70,
   '[
     {"enunciado":"La UE tiene…","opciones":[{"texto":"Instituciones comunes","correcta":true},{"texto":"Un solo idioma obligatorio","correcta":false},{"texto":"Cero normas","correcta":false}]},
     {"enunciado":"Los Estados miembros…","opciones":[{"texto":"Comparten un marco político y económico","correcta":true},{"texto":"No tienen relación","correcta":false},{"texto":"Son todos el mismo país","correcta":false}]},
     {"enunciado":"La ampliación de la UE ha…","opciones":[{"texto":"Incorporado a nuevos Estados","correcta":true},{"texto":"Eliminado Europa","correcta":false},{"texto":"Prohibido el comercio","correcta":false}]}
   ]'::jsonb, true, 1),
  ('dddd0009-0000-4000-8000-000000000001'::uuid, 'bbbb0003-0000-4000-8000-000000000003'::uuid,
   'Evaluación: Ciudadanía europea', 'Cuestionario corto (ejemplo).', 70,
   '[
     {"enunciado":"La ciudadanía europea…","opciones":[{"texto":"Complementa la nacional","correcta":true},{"texto":"Reemplaza la nacionalidad","correcta":false},{"texto":"No existe","correcta":false}]},
     {"enunciado":"Los derechos fundamentales en la UE se relacionan con…","opciones":[{"texto":"Dignidad y libertad","correcta":true},{"texto":"Solo la deuda","correcta":false},{"texto":"Solo el deporte","correcta":false}]},
     {"enunciado":"La libre circulación es…","opciones":[{"texto":"Una libertad importante en el espacio UE","correcta":true},{"texto":"Imposible","correcta":false},{"texto":"Solo para vehículos","correcta":false}]}
   ]'::jsonb, true, 1),
  ('dddd0010-0000-4000-8000-000000000001'::uuid, 'bbbb0004-0000-4000-8000-000000000001'::uuid,
   'Evaluación: Población', 'Cuestionario corto (ejemplo).', 70,
   '[
     {"enunciado":"La densidad de población relaciona…","opciones":[{"texto":"Habitantes y superficie","correcta":true},{"texto":"Solo la altitud","correcta":false},{"texto":"Solo el viento","correcta":false}]},
     {"enunciado":"La migración es…","opciones":[{"texto":"Una movilidad de personas","correcta":true},{"texto":"Solo la lluvia","correcta":false},{"texto":"Solo el relieve","correcta":false}]},
     {"enunciado":"Las pirámides de edad muestran…","opciones":[{"texto":"Estructura por edades y sexos","correcta":true},{"texto":"Solo el clima","correcta":false},{"texto":"Solo el PIB","correcta":false}]}
   ]'::jsonb, true, 1),
  ('dddd0011-0000-4000-8000-000000000001'::uuid, 'bbbb0004-0000-4000-8000-000000000002'::uuid,
   'Evaluación: Sectores económicos', 'Cuestionario corto (ejemplo).', 70,
   '[
     {"enunciado":"El sector primario incluye…","opciones":[{"texto":"Agricultura y minería","correcta":true},{"texto":"Solo banca","correcta":false},{"texto":"Solo sanidad","correcta":false}]},
     {"enunciado":"El sector secundario transforma…","opciones":[{"texto":"Materias primas en productos industriales","correcta":true},{"texto":"Solo nubes","correcta":false},{"texto":"Solo el tiempo","correcta":false}]},
     {"enunciado":"El sector terciario ofrece…","opciones":[{"texto":"Servicios","correcta":true},{"texto":"Solo petróleo","correcta":false},{"texto":"Solo agricultura","correcta":false}]}
   ]'::jsonb, true, 1),
  ('dddd0012-0000-4000-8000-000000000001'::uuid, 'bbbb0004-0000-4000-8000-000000000003'::uuid,
   'Evaluación: Globalización', 'Cuestionario corto (ejemplo).', 70,
   '[
     {"enunciado":"La globalización implica…","opciones":[{"texto":"Mayor interdependencia","correcta":true},{"texto":"Aislamiento total","correcta":false},{"texto":"Eliminar el comercio","correcta":false}]},
     {"enunciado":"El comercio internacional…","opciones":[{"texto":"Intercambia bienes y servicios entre países","correcta":true},{"texto":"Solo existe en un país","correcta":false},{"texto":"Prohibe la economía","correcta":false}]},
     {"enunciado":"El consumo responsable busca…","opciones":[{"texto":"Sostenibilidad y respeto","correcta":true},{"texto":"Desperdicio constante","correcta":false},{"texto":"Solo comprar sin límites","correcta":false}]}
   ]'::jsonb, true, 1),
  ('dddd0013-0000-4000-8000-000000000001'::uuid, 'bbbb0005-0000-4000-8000-000000000001'::uuid,
   'Evaluación: Prehistoria y Antigüedad', 'Cuestionario corto (ejemplo).', 70,
   '[
     {"enunciado":"La escritura marca el inicio de…","opciones":[{"texto":"La Historia (en sentido amplio)","correcta":true},{"texto":"La Prehistoria","correcta":false},{"texto":"El futuro","correcta":false}]},
     {"enunciado":"La Prehistoria estudia…","opciones":[{"texto":"Sociedades sin escritura","correcta":true},{"texto":"Solo el siglo XXI","correcta":false},{"texto":"Solo el espacio","correcta":false}]},
     {"enunciado":"La Edad Antigua incluye…","opciones":[{"texto":"Grandes civilizaciones mediterráneas","correcta":true},{"texto":"Solo la Edad Media","correcta":false},{"texto":"Solo la Edad Contemporánea","correcta":false}]}
   ]'::jsonb, true, 1),
  ('dddd0014-0000-4000-8000-000000000001'::uuid, 'bbbb0005-0000-4000-8000-000000000002'::uuid,
   'Evaluación: Edad Media y Moderna', 'Cuestionario corto (ejemplo).', 70,
   '[
     {"enunciado":"La Edad Media se caracteriza, entre otras cosas, por…","opciones":[{"texto":"Una organización social compleja","correcta":true},{"texto":"Internet global","correcta":false},{"texto":"Solo democracia digital","correcta":false}]},
     {"enunciado":"La Edad Moderna incluye…","opciones":[{"texto":"Grandes cambios políticos y culturales","correcta":true},{"texto":"Solo Prehistoria","correcta":false},{"texto":"Solo el año 3000","correcta":false}]},
     {"enunciado":"Los reinos cristianos en la Península…","opciones":[{"texto":"Tuvieron un proceso histórico largo","correcta":true},{"texto":"Aparecieron ayer","correcta":false},{"texto":"No existieron","correcta":false}]}
   ]'::jsonb, true, 1),
  ('dddd0015-0000-4000-8000-000000000001'::uuid, 'bbbb0005-0000-4000-8000-000000000003'::uuid,
   'Evaluación: Patrimonio', 'Cuestionario corto (ejemplo).', 70,
   '[
     {"enunciado":"El patrimonio histórico…","opciones":[{"texto":"Puede ser material e inmaterial","correcta":true},{"texto":"Solo es comida","correcta":false},{"texto":"Solo el clima","correcta":false}]},
     {"enunciado":"La UNESCO puede declarar…","opciones":[{"texto":"Patrimonio de la Humanidad","correcta":true},{"texto":"Solo parques de atracciones","correcta":false},{"texto":"Solo mapas meteorológicos","correcta":false}]},
     {"enunciado":"La conservación busca…","opciones":[{"texto":"Proteger y transmitir valor cultural","correcta":true},{"texto":"Destruir monumentos","correcta":false},{"texto":"Ignorar el pasado","correcta":false}]}
   ]'::jsonb, true, 1),
  ('dddd0016-0000-4000-8000-000000000001'::uuid, 'bbbb0006-0000-4000-8000-000000000001'::uuid,
   'Evaluación: Siglo XIX y Guerra Civil', 'Cuestionario corto (ejemplo).', 70,
   '[
     {"enunciado":"El siglo XIX en España fue…","opciones":[{"texto":"Un periodo de grandes tensiones y cambios","correcta":true},{"texto":"Idéntico a la Prehistoria","correcta":false},{"texto":"Sin conflictos","correcta":false}]},
     {"enunciado":"La Guerra Civil (1936–1939) fue…","opciones":[{"texto":"Un conflicto bélico interno","correcta":true},{"texto":"Un festival","correcta":false},{"texto":"Una guerra lunar","correcta":false}]},
     {"enunciado":"La memoria histórica es…","opciones":[{"texto":"Un debate sobre el pasado y la reconciliación","correcta":true},{"texto":"Solo deporte","correcta":false},{"texto":"Solo clima","correcta":false}]}
   ]'::jsonb, true, 1),
  ('dddd0017-0000-4000-8000-000000000001'::uuid, 'bbbb0006-0000-4000-8000-000000000002'::uuid,
   'Evaluación: Transición y Constitución', 'Cuestionario corto (ejemplo).', 70,
   '[
     {"enunciado":"La Transición fue…","opciones":[{"texto":"Un proceso hacia la democracia","correcta":true},{"texto":"Una guerra lunar","correcta":false},{"texto":"Solo el siglo XV","correcta":false}]},
     {"enunciado":"La Constitución de 1978 establece…","opciones":[{"texto":"Derechos y libertades fundamentales","correcta":true},{"texto":"Solo deberes sin derechos","correcta":false},{"texto":"Eliminar el Estado","correcta":false}]},
     {"enunciado":"La monarquía parlamentaria en España…","opciones":[{"texto":"Se articula en la Constitución","correcta":true},{"texto":"No está regulada","correcta":false},{"texto":"Es igual que el Imperio romano","correcta":false}]}
   ]'::jsonb, true, 1),
  ('dddd0018-0000-4000-8000-000000000001'::uuid, 'bbbb0006-0000-4000-8000-000000000003'::uuid,
   'Evaluación: España democrática', 'Cuestionario corto (ejemplo).', 70,
   '[
     {"enunciado":"España es…","opciones":[{"texto":"Un Estado de autonomías","correcta":true},{"texto":"Un solo municipio sin leyes","correcta":false},{"texto":"Una colonia","correcta":false}]},
     {"enunciado":"Las autonomías tienen…","opciones":[{"texto":"Competencias normativas propias","correcta":true},{"texto":"Cero poder","correcta":false},{"texto":"Solo el tiempo","correcta":false}]},
     {"enunciado":"La participación ciudadana es…","opciones":[{"texto":"Una idea de la democracia representativa y directa","correcta":true},{"texto":"Imposible","correcta":false},{"texto":"Solo para robots","correcta":false}]}
   ]'::jsonb, true, 1),
  ('dddd0019-0000-4000-8000-000000000001'::uuid, 'bbbb0007-0000-4000-8000-000000000001'::uuid,
   'Evaluación: Derechos de la infancia', 'Cuestionario corto (ejemplo).', 70,
   '[
     {"enunciado":"Los derechos de la infancia buscan…","opciones":[{"texto":"Proteger el desarrollo","correcta":true},{"texto":"Eliminar la educación","correcta":false},{"texto":"Solo obligaciones","correcta":false}]},
     {"enunciado":"La participación infantil…","opciones":[{"texto":"Debe ser promovida","correcta":true},{"texto":"Debe prohibirse","correcta":false},{"texto":"Solo en adultos","correcta":false}]},
     {"enunciado":"La convención internacional…","opciones":[{"texto":"Reconoce derechos específicos","correcta":true},{"texto":"Elimina derechos","correcta":false},{"texto":"Solo habla del clima","correcta":false}]}
   ]'::jsonb, true, 1),
  ('dddd0020-0000-4000-8000-000000000001'::uuid, 'bbbb0007-0000-4000-8000-000000000002'::uuid,
   'Evaluación: Igualdad y diversidad', 'Cuestionario corto (ejemplo).', 70,
   '[
     {"enunciado":"La igualdad de trato implica…","opciones":[{"texto":"No discriminación","correcta":true},{"texto":"Discriminación arbitraria","correcta":false},{"texto":"Exclusión","correcta":false}]},
     {"enunciado":"La diversidad es…","opciones":[{"texto":"Una realidad social","correcta":true},{"texto":"Un problema","correcta":false},{"texto":"Algo ilegal","correcta":false}]},
     {"enunciado":"La mediación en conflictos…","opciones":[{"texto":"Busca acuerdos","correcta":true},{"texto":"Impone violencia","correcta":false},{"texto":"Prohibe el diálogo","correcta":false}]}
   ]'::jsonb, true, 1),
  ('dddd0021-0000-4000-8000-000000000001'::uuid, 'bbbb0007-0000-4000-8000-000000000003'::uuid,
   'Evaluación: Participación escolar', 'Cuestionario corto (ejemplo).', 70,
   '[
     {"enunciado":"El consejo escolar…","opciones":[{"texto":"Es un órgano de participación","correcta":true},{"texto":"No existe","correcta":false},{"texto":"Solo elige el clima","correcta":false}]},
     {"enunciado":"La participación requiere…","opciones":[{"texto":"Información y espacios de diálogo","correcta":true},{"texto":"Silencio total","correcta":false},{"texto":"Solo imposiciones","correcta":false}]},
     {"enunciado":"La vida local es…","opciones":[{"texto":"Un ámbito para la participación ciudadana","correcta":true},{"texto":"Solo la Luna","correcta":false},{"texto":"Imposible","correcta":false}]}
   ]'::jsonb, true, 1)
ON CONFLICT (id) DO NOTHING;

-- Fin del seed
