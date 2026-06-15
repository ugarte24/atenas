-- =============================================================================
-- ATENAS · Datos ficticios de demostración (NO incluidos en seed_contenido_curricular)
-- =============================================================================
-- Añade: usuarios demo, recursos multimedia, mensajes de foro, logros extra,
-- progreso por tema, intentos de actividades/evaluaciones y un micro-quiz.
--
-- REQUISITOS PREVIOS:
--   1) Migraciones aplicadas (incl. 20260615_*).
--   2) seed_contenido_curricular.sql ya ejecutado (unidades/temas/actividades base).
--
-- CÓMO EJECUTAR:
--   Supabase Dashboard → SQL Editor → pegar y Run (rol postgres).
--
-- USUARIOS DEMO (contraseña para todos: DemoAtenas2026!)
--   alumno.demo1@atenas.test  · Lucía Mendoza   (estudiante · avanzada)
--   alumno.demo2@atenas.test  · Mateo Rivas     (estudiante · principiante)
--   alumno.demo3@atenas.test  · Sofía Torres    (estudiante · intermedia)
--   docente.demo@atenas.test  · Carmen Ortega   (docente)
--
-- Idempotente: ON CONFLICT DO NOTHING / DO UPDATE donde aplica.
-- Para eliminar todo el demo: ver bloque ROLLBACK al final (comentado).
-- =============================================================================

CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- ---------------------------------------------------------------------------
-- UUIDs fijos del demo (prefijo eeee / ffff / aa90 / aa91 / aa92 / dddd9)
-- ---------------------------------------------------------------------------
-- Estudiantes: eeee0001…0003 · Docente: eeee0004…0004
-- Recursos:    ffff0001…0012
-- Logros extra: aa900001…002
-- Mensajes:    aa910001…006
-- Intentos:    aa920001…019
-- Micro-quiz:  dddd9001…0001 (evaluación extra, no está en seed curricular)

-- ---------------------------------------------------------------------------
-- 1) USUARIOS EN AUTH + PERFILES
-- ---------------------------------------------------------------------------
DO $$
DECLARE
  u RECORD;
  pwd text := crypt('DemoAtenas2026!', gen_salt('bf'));
BEGIN
  FOR u IN
    SELECT *
    FROM (VALUES
      ('eeee0001-0000-4000-8000-000000000001'::uuid, 'alumno.demo1@atenas.test', 'Lucía Mendoza',   'estudiante'),
      ('eeee0002-0000-4000-8000-000000000002'::uuid, 'alumno.demo2@atenas.test', 'Mateo Rivas',     'estudiante'),
      ('eeee0003-0000-4000-8000-000000000003'::uuid, 'alumno.demo3@atenas.test', 'Sofía Torres',    'estudiante'),
      ('eeee0004-0000-4000-8000-000000000004'::uuid, 'docente.demo@atenas.test', 'Carmen Ortega',   'docente')
    ) AS t(id, email, full_name, role)
  LOOP
    INSERT INTO auth.users (
      instance_id, id, aud, role, email, encrypted_password,
      email_confirmed_at, last_sign_in_at,
      raw_app_meta_data, raw_user_meta_data,
      created_at, updated_at,
      confirmation_token, email_change, email_change_token_new, recovery_token
    )
    VALUES (
      '00000000-0000-0000-0000-000000000000',
      u.id,
      'authenticated',
      'authenticated',
      u.email,
      pwd,
      NOW(), NOW(),
      jsonb_build_object('provider', 'email', 'providers', jsonb_build_array('email')),
      '{}'::jsonb,
      NOW(), NOW(),
      '', '', '', ''
    )
    ON CONFLICT (id) DO NOTHING;

    INSERT INTO auth.identities (
      id, user_id, identity_data, provider, provider_id,
      last_sign_in_at, created_at, updated_at
    )
    VALUES (
      u.id,
      u.id,
      jsonb_build_object('sub', u.id::text, 'email', u.email),
      'email',
      u.email,
      NOW(), NOW(), NOW()
    )
    ON CONFLICT (provider, provider_id) DO NOTHING;

    INSERT INTO public.profiles (id, email, full_name, role, activo)
    VALUES (u.id, u.email, u.full_name, u.role, true)
    ON CONFLICT (id) DO UPDATE
      SET email = EXCLUDED.email,
          full_name = EXCLUDED.full_name,
          role = EXCLUDED.role,
          activo = true;
  END LOOP;
END $$;

-- Docente demo asignada a unidades 1–3 (opcional)
INSERT INTO public.docente_unidad (docente_id, unidad_id)
VALUES
  ('eeee0004-0000-4000-8000-000000000004'::uuid, 'aaaa0001-0000-4000-8000-000000000001'::uuid),
  ('eeee0004-0000-4000-8000-000000000004'::uuid, 'aaaa0002-0000-4000-8000-000000000001'::uuid),
  ('eeee0004-0000-4000-8000-000000000004'::uuid, 'aaaa0003-0000-4000-8000-000000000001'::uuid)
ON CONFLICT DO NOTHING;

-- ---------------------------------------------------------------------------
-- 2) LOGROS EXTRA (no están en la migración gamificación por defecto)
-- ---------------------------------------------------------------------------
INSERT INTO public.achievements (id, slug, title, description, icon, orden)
VALUES
  ('aa900001-0000-4000-8000-000000000001'::uuid,
   'map-reader', 'Lector de mapas',
   'Completa actividades sobre escala y coordenadas.', '🗺️', 10),
  ('aa900002-0000-4000-8000-000000000002'::uuid,
   'climate-watch', 'Observador del clima',
   'Domina los temas de zonas climáticas.', '🌤️', 11)
ON CONFLICT (slug) DO NOTHING;

-- ---------------------------------------------------------------------------
-- 3) RECURSOS (texto, imagen, mapa, vídeo, audio, pdf) — no existen en seed curricular
-- ---------------------------------------------------------------------------
INSERT INTO public.recursos (id, tema_id, tipo, url, title, contenido)
VALUES
  -- Tema 1.1 Tierra
  ('ffff0001-0000-4000-8000-000000000001'::uuid, 'bbbb0001-0000-4000-8000-000000000001'::uuid,
   'texto', '', 'Resumen: la Tierra en movimiento',
   'La Tierra gira sobre sí misma (rotación) en unas 24 horas y orbita alrededor del Sol (traslación) en unos 365 días. Estos movimientos explican el día y la noche, y las estaciones.'),
  ('ffff0002-0000-4000-8000-000000000001'::uuid, 'bbbb0001-0000-4000-8000-000000000001'::uuid,
   'imagen', 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/97/The_Earth_seen_from_Apollo_17.jpg/640px-The_Earth_seen_from_Apollo_17.jpg',
   'La Tierra desde el espacio', NULL),
  ('ffff0003-0000-4000-8000-000000000001'::uuid, 'bbbb0001-0000-4000-8000-000000000001'::uuid,
   'video', 'https://www.youtube.com/watch?v=th79sDCAh0Q',
   'Vídeo: movimientos de la Tierra', NULL),
  -- Tema 1.2 Mapas
  ('ffff0004-0000-4000-8000-000000000001'::uuid, 'bbbb0001-0000-4000-8000-000000000002'::uuid,
   'mapa', 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/80/World_map_-_low_resolution.svg/1280px-World_map_-_low_resolution.svg.png',
   'Mapa político mundial (referencia)', NULL),
  ('ffff0005-0000-4000-8000-000000000001'::uuid, 'bbbb0001-0000-4000-8000-000000000002'::uuid,
   'pdf', 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
   'Ficha PDF de práctica (demo)', NULL),
  ('ffff0006-0000-4000-8000-000000000001'::uuid, 'bbbb0001-0000-4000-8000-000000000002'::uuid,
   'audio', 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
   'Audio guía: leyenda del mapa (demo)', NULL),
  -- Tema 1.3 Climas
  ('ffff0007-0000-4000-8000-000000000001'::uuid, 'bbbb0001-0000-4000-8000-000000000003'::uuid,
   'texto', '', 'Zonas climáticas',
   'Ecuador, trópicos, templadas y polares: cada zona tiene temperaturas y precipitaciones características que modelan paisajes y formas de vida.'),
  ('ffff0008-0000-4000-8000-000000000001'::uuid, 'bbbb0002-0000-4000-8000-000000000001'::uuid,
   'imagen', 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&q=80',
   'Relieve montañoso (demo)', NULL),
  -- Tema 2.1 España relieve
  ('ffff0009-0000-4000-8000-000000000001'::uuid, 'bbbb0002-0000-4000-8000-000000000001'::uuid,
   'texto', '', 'La Meseta y las cordilleras',
   'La Península Ibérica combina altiplanicies interiores, cordilleras costeras y llanuras litorales.'),
  ('ffff0010-0000-4000-8000-000000000002'::uuid, 'bbbb0003-0000-4000-8000-000000000001'::uuid,
   'video', 'https://www.youtube.com/watch?v=iecjWKviIvo',
   'Vídeo: mapa de Europa (demo)', NULL),
  ('ffff0011-0000-4000-8000-000000000003'::uuid, 'bbbb0007-0000-4000-8000-000000000001'::uuid,
   'texto', '', 'Derechos de la infancia (demo)',
   'Todos los niños y niñas tienen derecho a la educación, la salud y la participación. La convivencia escolar protege estos derechos.'),
  ('ffff0012-0000-4000-8000-000000000004'::uuid, 'bbbb0007-0000-4000-8000-000000000002'::uuid,
   'audio', 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3',
   'Podcast breve: igualdad y diversidad (demo)', NULL)
ON CONFLICT (id) DO NOTHING;

-- ---------------------------------------------------------------------------
-- 4) MICRO-QUIZ EXTRA (evaluación ficticia, no duplica las del seed)
-- ---------------------------------------------------------------------------
INSERT INTO public.evaluaciones (
  id, tema_id, title, descripcion, umbral_aprobado, preguntas,
  publicada, orden, es_micro_quiz, micro_ubicacion, max_intentos
)
VALUES (
  'dddd9001-0000-4000-8000-000000000001'::uuid,
  'bbbb0001-0000-4000-8000-000000000001'::uuid,
  'Reto rápido · ¿Geógrafo o astrónomo?',
  'Pregunta única de repaso (demo).',
  70,
  '[
    {"enunciado":"¿Qué movimiento de la Tierra dura aproximadamente 24 horas?","opciones":[
      {"texto":"Rotación","correcta":true},
      {"texto":"Traslación","correcta":false},
      {"texto":"Precesión","correcta":false}
    ]}
  ]'::jsonb,
  true, 99, true, 'inicio', 5
)
ON CONFLICT (id) DO NOTHING;

-- ---------------------------------------------------------------------------
-- 5) MENSAJES DE FORO (tema 1.1)
-- ---------------------------------------------------------------------------
INSERT INTO public.tema_mensajes (id, tema_id, user_id, cuerpo, created_at)
VALUES
  ('aa910001-0000-4000-8000-000000000001'::uuid,
   'bbbb0001-0000-4000-8000-000000000001'::uuid,
   'eeee0001-0000-4000-8000-000000000001'::uuid,
   '¿Alguien me explica la diferencia entre rotación y traslación con un ejemplo del día a día?',
   NOW() - INTERVAL '3 days'),
  ('aa910002-0000-4000-8000-000000000002'::uuid,
   'bbbb0001-0000-4000-8000-000000000001'::uuid,
   'eeee0004-0000-4000-8000-000000000004'::uuid,
   'Rotación = el planeta gira sobre sí mismo (día/noche). Traslación = orbita alrededor del Sol (estaciones).',
   NOW() - INTERVAL '3 days' + INTERVAL '2 hours'),
  ('aa910003-0000-4000-8000-000000000003'::uuid,
   'bbbb0001-0000-4000-8000-000000000001'::uuid,
   'eeee0002-0000-4000-8000-000000000002'::uuid,
   'Gracias profe, ahora lo entiendo mejor 👍',
   NOW() - INTERVAL '2 days'),
  ('aa910004-0000-4000-8000-000000000004'::uuid,
   'bbbb0001-0000-4000-8000-000000000002'::uuid,
   'eeee0003-0000-4000-8000-000000000003'::uuid,
   'La escala 1:50.000 significa que 1 cm en el mapa son 500 m en la realidad, ¿correcto?',
   NOW() - INTERVAL '1 day'),
  ('aa910005-0000-4000-8000-000000000005'::uuid,
   'bbbb0001-0000-4000-8000-000000000002'::uuid,
   'eeee0004-0000-4000-8000-000000000004'::uuid,
   '¡Exacto! Siempre revisa la unidad que indica la escala (m, km).',
   NOW() - INTERVAL '1 day' + INTERVAL '1 hour'),
  ('aa910006-0000-4000-8000-000000000006'::uuid,
   'bbbb0007-0000-4000-8000-000000000001'::uuid,
   'eeee0001-0000-4000-8000-000000000001'::uuid,
   'En el cole estamos preparando un mural sobre derechos de la infancia. ¿Ideas?',
   NOW() - INTERVAL '5 hours')
ON CONFLICT (id) DO NOTHING;

-- ---------------------------------------------------------------------------
-- 6) INTENTOS DE ACTIVIDADES (puntuaciones y fechas para gamificación)
-- ---------------------------------------------------------------------------
INSERT INTO public.actividad_intentos (id, user_id, actividad_id, respuestas, puntuacion, completado_at)
VALUES
  -- Lucía: unidad 1 completa + actividad 2.1
  ('aa920001-0000-4000-8000-000000000001'::uuid, 'eeee0001-0000-4000-8000-000000000001'::uuid,
   'cccc0001-0000-4000-8000-000000000001'::uuid, '{"respuesta":0}'::jsonb, 100, NOW() - INTERVAL '2 days'),
  ('aa920002-0000-4000-8000-000000000002'::uuid, 'eeee0001-0000-4000-8000-000000000001'::uuid,
   'cccc0002-0000-4000-8000-000000000001'::uuid, '{"respuesta":0}'::jsonb, 100, NOW() - INTERVAL '1 day'),
  ('aa920003-0000-4000-8000-000000000003'::uuid, 'eeee0001-0000-4000-8000-000000000001'::uuid,
   'cccc0003-0000-4000-8000-000000000001'::uuid, '{"respuesta":0}'::jsonb, 100, NOW()),
  ('aa920004-0000-4000-8000-000000000004'::uuid, 'eeee0001-0000-4000-8000-000000000001'::uuid,
   'cccc0004-0000-4000-8000-000000000001'::uuid, '{"respuesta":0}'::jsonb, 85, NOW()),
  -- Mateo: solo tema 1.1
  ('aa920005-0000-4000-8000-000000000005'::uuid, 'eeee0002-0000-4000-8000-000000000002'::uuid,
   'cccc0001-0000-4000-8000-000000000001'::uuid, '{"respuesta":0}'::jsonb, 70, NOW() - INTERVAL '1 day'),
  -- Sofía: unidad 1 actividades + 2.1
  ('aa920006-0000-4000-8000-000000000006'::uuid, 'eeee0003-0000-4000-8000-000000000003'::uuid,
   'cccc0001-0000-4000-8000-000000000001'::uuid, '{"respuesta":0}'::jsonb, 90, NOW() - INTERVAL '3 days'),
  ('aa920007-0000-4000-8000-000000000007'::uuid, 'eeee0003-0000-4000-8000-000000000003'::uuid,
   'cccc0002-0000-4000-8000-000000000001'::uuid, '{"respuesta":0}'::jsonb, 80, NOW() - INTERVAL '2 days'),
  ('aa920008-0000-4000-8000-000000000008'::uuid, 'eeee0003-0000-4000-8000-000000000003'::uuid,
   'cccc0003-0000-4000-8000-000000000001'::uuid, '{"respuesta":0}'::jsonb, 95, NOW() - INTERVAL '1 day'),
  ('aa920009-0000-4000-8000-000000000009'::uuid, 'eeee0003-0000-4000-8000-000000000003'::uuid,
   'cccc0004-0000-4000-8000-000000000001'::uuid, '{"respuesta":0}'::jsonb, 75, NOW())
ON CONFLICT (id) DO NOTHING;

-- ---------------------------------------------------------------------------
-- 7) INTENTOS DE EVALUACIONES
-- ---------------------------------------------------------------------------
INSERT INTO public.evaluacion_intentos (
  id, user_id, evaluacion_id, respuestas, puntuacion, aprobado,
  completado_at, tiempo_segundos, numero_intento
)
VALUES
  -- Lucía: evals unidad 1 + 2.1
  ('aa920011-0000-4000-8000-000000000011'::uuid, 'eeee0001-0000-4000-8000-000000000001'::uuid,
   'dddd0001-0000-4000-8000-000000000001'::uuid, '{"respuestas":{"0":0,"1":0,"2":0}}'::jsonb,
   100, true, NOW() - INTERVAL '2 days', 420, 1),
  ('aa920012-0000-4000-8000-000000000012'::uuid, 'eeee0001-0000-4000-8000-000000000001'::uuid,
   'dddd0002-0000-4000-8000-000000000001'::uuid, '{"respuestas":{"0":0,"1":0,"2":0}}'::jsonb,
   100, true, NOW() - INTERVAL '1 day', 380, 1),
  ('aa920013-0000-4000-8000-000000000013'::uuid, 'eeee0001-0000-4000-8000-000000000001'::uuid,
   'dddd0003-0000-4000-8000-000000000001'::uuid, '{"respuestas":{"0":0,"1":0,"2":0}}'::jsonb,
   90, true, NOW(), 510, 1),
  ('aa920014-0000-4000-8000-000000000014'::uuid, 'eeee0001-0000-4000-8000-000000000001'::uuid,
   'dddd0004-0000-4000-8000-000000000001'::uuid, '{"respuestas":{"0":0,"1":1,"2":0}}'::jsonb,
   75, true, NOW(), 600, 1),
  -- Mateo: eval 1.1 (no aprobó a la primera — segundo intento ficticio si max permite; aquí 1 intento)
  ('aa920015-0000-4000-8000-000000000015'::uuid, 'eeee0002-0000-4000-8000-000000000002'::uuid,
   'dddd0001-0000-4000-8000-000000000001'::uuid, '{"respuestas":{"0":0,"1":1,"2":0}}'::jsonb,
   65, false, NOW() - INTERVAL '1 day', 720, 1),
  -- Sofía: evals unidad 1
  ('aa920016-0000-4000-8000-000000000016'::uuid, 'eeee0003-0000-4000-8000-000000000003'::uuid,
   'dddd0001-0000-4000-8000-000000000001'::uuid, '{"respuestas":{"0":0,"1":0,"2":0}}'::jsonb,
   85, true, NOW() - INTERVAL '3 days', 450, 1),
  ('aa920017-0000-4000-8000-000000000017'::uuid, 'eeee0003-0000-4000-8000-000000000003'::uuid,
   'dddd0002-0000-4000-8000-000000000001'::uuid, '{"respuestas":{"0":0,"1":0,"2":0}}'::jsonb,
   80, true, NOW() - INTERVAL '2 days', 390, 1),
  ('aa920018-0000-4000-8000-000000000018'::uuid, 'eeee0003-0000-4000-8000-000000000003'::uuid,
   'dddd0003-0000-4000-8000-000000000001'::uuid, '{"respuestas":{"0":0,"1":0,"2":0}}'::jsonb,
   88, true, NOW() - INTERVAL '1 day', 405, 1),
  -- Micro-quiz demo
  ('aa920019-0000-4000-8000-000000000019'::uuid, 'eeee0001-0000-4000-8000-000000000001'::uuid,
   'dddd9001-0000-4000-8000-000000000001'::uuid, '{"respuestas":{"0":0}}'::jsonb,
   100, true, NOW() - INTERVAL '2 days', 45, 1)
ON CONFLICT (id) DO NOTHING;

-- ---------------------------------------------------------------------------
-- 8) PROGRESO POR TEMA + TIEMPO DE ESTUDIO
-- ---------------------------------------------------------------------------
INSERT INTO public.progreso_tema (user_id, tema_id, porcentaje, completado, tiempo_estudio_segundos, updated_at)
VALUES
  -- Lucía
  ('eeee0001-0000-4000-8000-000000000001'::uuid, 'bbbb0001-0000-4000-8000-000000000001'::uuid, 100, true,  1840, NOW()),
  ('eeee0001-0000-4000-8000-000000000001'::uuid, 'bbbb0001-0000-4000-8000-000000000002'::uuid, 100, true,  1520, NOW()),
  ('eeee0001-0000-4000-8000-000000000001'::uuid, 'bbbb0001-0000-4000-8000-000000000003'::uuid, 100, true,  2100, NOW()),
  ('eeee0001-0000-4000-8000-000000000001'::uuid, 'bbbb0002-0000-4000-8000-000000000001'::uuid,  50, false,  620, NOW()),
  -- Mateo
  ('eeee0002-0000-4000-8000-000000000002'::uuid, 'bbbb0001-0000-4000-8000-000000000001'::uuid,  50, false,  480, NOW()),
  -- Sofía
  ('eeee0003-0000-4000-8000-000000000003'::uuid, 'bbbb0001-0000-4000-8000-000000000001'::uuid, 100, true,  1200, NOW()),
  ('eeee0003-0000-4000-8000-000000000003'::uuid, 'bbbb0001-0000-4000-8000-000000000002'::uuid, 100, true,  980, NOW()),
  ('eeee0003-0000-4000-8000-000000000003'::uuid, 'bbbb0001-0000-4000-8000-000000000003'::uuid, 100, true,  1100, NOW()),
  ('eeee0003-0000-4000-8000-000000000003'::uuid, 'bbbb0002-0000-4000-8000-000000000001'::uuid,  50, false,  340, NOW())
ON CONFLICT (user_id, tema_id) DO UPDATE
  SET porcentaje = EXCLUDED.porcentaje,
      completado = EXCLUDED.completado,
      tiempo_estudio_segundos = EXCLUDED.tiempo_estudio_segundos,
      updated_at = EXCLUDED.updated_at;

-- ---------------------------------------------------------------------------
-- 9) LOGROS DESBLOQUEADOS PARA ESTUDIANTES DEMO
-- ---------------------------------------------------------------------------
INSERT INTO public.user_achievements (user_id, achievement_id, unlocked_at)
SELECT u.user_id, a.id, NOW() - (u.n || ' days')::interval
FROM (VALUES
  ('eeee0001-0000-4000-8000-000000000001'::uuid, 'nature',    4),
  ('eeee0001-0000-4000-8000-000000000001'::uuid, 'explorer',  2),
  ('eeee0001-0000-4000-8000-000000000001'::uuid, 'map-reader',1),
  ('eeee0003-0000-4000-8000-000000000003'::uuid, 'nature',    3),
  ('eeee0003-0000-4000-8000-000000000003'::uuid, 'explorer',  1)
) AS u(user_id, slug, n)
JOIN public.achievements a ON a.slug = u.slug
ON CONFLICT DO NOTHING;

-- ---------------------------------------------------------------------------
-- Fin · datos ficticios cargados
-- ---------------------------------------------------------------------------
-- ROLLBACK MANUAL (solo desarrollo): descomentar y ejecutar por separado si necesitas limpiar.
--
-- DELETE FROM public.user_achievements WHERE user_id::text LIKE 'eeee000%';
-- DELETE FROM public.progreso_tema WHERE user_id::text LIKE 'eeee000%';
-- DELETE FROM public.evaluacion_intentos WHERE user_id::text LIKE 'eeee000%' OR id::text LIKE 'aa92001%';
-- DELETE FROM public.actividad_intentos WHERE user_id::text LIKE 'eeee000%' OR id::text LIKE 'aa92000%';
-- DELETE FROM public.tema_mensajes WHERE id::text LIKE 'aa91000%';
-- DELETE FROM public.evaluaciones WHERE id = 'dddd9001-0000-4000-8000-000000000001';
-- DELETE FROM public.recursos WHERE id::text LIKE 'ffff000%';
-- DELETE FROM public.achievements WHERE slug IN ('map-reader','climate-watch');
-- DELETE FROM public.docente_unidad WHERE docente_id = 'eeee0004-0000-4000-8000-000000000004';
-- DELETE FROM public.profiles WHERE id::text LIKE 'eeee000%';
-- DELETE FROM auth.identities WHERE user_id::text LIKE 'eeee000%';
-- DELETE FROM auth.users WHERE id::text LIKE 'eeee000%';
