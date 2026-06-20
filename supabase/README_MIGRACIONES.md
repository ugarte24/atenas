# Migraciones ATENAS

## Migraciones PRD v1.0 (2026-06-15)

Ejecutar tras el resto de migraciones:

1. `20260615_unidades_publicada.sql` — columna `publicada` en unidades + RLS estudiante.
2. `20260615_recursos_tipos_ampliados.sql` — tipos texto, pdf, audio + columna `contenido`.
3. `20260615_evaluacion_intentos_tiempo.sql` — `tiempo_segundos`, `numero_intento`, `minutos_limite`.
4. `20260615_progreso_tema_tiempo_estudio.sql` — `tiempo_estudio_segundos` en `progreso_tema`.
5. `20260615_rls_profiles_admin_activo.sql` — solo admin inserta perfiles; intentos solo si activo.

Trazabilidad completa: [`docs/PRD_TRAZABILIDAD.md`](../docs/PRD_TRAZABILIDAD.md).

## Orden recomendado

1. `migrations/20250318_atenas_features.sql` — columnas, tablas, **intentos múltiples en evaluaciones**.
2. **`migrations/20250319_rls_docente_unidad_tema_mensajes.sql`** — RLS en `docente_unidad` y `tema_mensajes`.
3. Migraciones PRD v1.0 (20260615_*).
4. `migrations/20260620_tema_notas.sql` — notas de lección sincronizadas.
5. `migrations/20260620_aula_mensajes.sql` — chat del aula en vivo.
6. `migrations/20260620_achievements_activo.sql` — columna `activo` en logros.

En Supabase: **SQL Editor** → ejecutar en orden (o `supabase db push`).

Sin la migración 1, fallarán columnas nuevas en `evaluaciones` y el modelo de intentos. Si al enviar una evaluación aparece *"intento único por evaluación"*, falta el paso 1.

### Verificación post-migración (evaluaciones)

Tras ejecutar `20250318_atenas_features.sql`, comprueba que la PK de `evaluacion_intentos` ya no sea `(user_id, evaluacion_id)`:

```sql
SELECT conname, pg_get_constraintdef(oid)
FROM pg_constraint
WHERE conrelid = 'public.evaluacion_intentos'::regclass;
```

Debe existir una PK sobre la columna `id` (uuid), no solo user_id + evaluacion_id.

## Seed de contenido (unidades, temas, actividades, evaluaciones)

Tras aplicar todas las migraciones, puedes cargar datos de ejemplo del currículo 6.º Primaria:

1. Abre **Supabase → SQL Editor**.
2. Pega y ejecuta el archivo **`seed_contenido_curricular.sql`** (raíz `supabase/`).

Incluye **7 unidades**, **21 temas** (prerequisito en cadena por unidad), **21 actividades** publicadas (`seleccion_multiple`) y **21 evaluaciones** publicadas (3 preguntas cada una). Es **idempotente** (`ON CONFLICT DO NOTHING`).

## RLS implementado

### `docente_unidad`

| Operación | Quién |
|-----------|--------|
| **SELECT** | Admin (todas las filas) o docente (solo sus asignaciones `docente_id = auth.uid()`). |
| **INSERT / UPDATE / DELETE** | Solo **admin** (panel de asignación docente ↔ unidades). |

Los estudiantes no tienen política: no leen esta tabla (correcto).

### `tema_mensajes`

| Operación | Quién |
|-----------|--------|
| **SELECT** | **Admin**: todos. **Estudiante**: todos los mensajes (foro por tema). **Docente**: si tiene filas en `docente_unidad`, solo mensajes de temas de esas unidades; si **no** tiene asignaciones, todos los temas (misma regla que en la app). |
| **INSERT** | Cualquier autenticado, solo como sí mismo (`user_id = auth.uid()`). |
| **UPDATE** | Solo el autor del mensaje. |
| **DELETE** | Autor del mensaje **o** admin. |

### `evaluacion_intentos`

Las políticas existentes (insert/select propio, docente/admin ven intentos) siguen válidas con varios intentos por evaluación. No hace falta cambiar RLS salvo que quieras restringir UPDATE (si pasáis a solo INSERT por intento).

## PWA

En producción (HTTPS) el cliente registra `/sw.js`. El manifest declara `favicon.png` y `favicon.svg` (PWA / pestaña del navegador).
