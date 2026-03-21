# ATENAS

Aplicación web interactiva para fortalecer el aprendizaje de **Ciencias Sociales** en 6.º de Primaria. Permite a estudiantes acceder a contenidos, actividades interactivas y evaluaciones; a docentes gestionar contenidos y ver el progreso; y a administradores gestionar usuarios.

**Stack:** React + TypeScript + Vite + Tailwind CSS + Supabase (Auth, PostgreSQL, Storage).

---

## Índice

- [Requisitos y desarrollo local](#requisitos-y-desarrollo-local)
- [Configuración de Supabase](#configuración-de-supabase)
- [Primer uso: crear administrador](#primer-uso-crear-administrador)
- [Scripts y puerto](#scripts-y-puerto)
- [Roles y flujos](#roles-y-flujos)
- [Rutas de la aplicación](#rutas-de-la-aplicación)
- [Estructura del proyecto](#estructura-del-proyecto)
- [Resumen de fases implementadas](#resumen-de-fases-implementadas)
- [Portada y vídeo por unidad](#portada-y-vídeo-por-unidad)

---

## Requisitos y desarrollo local

- **Node.js** 18+
- **Cuenta** en [Supabase](https://supabase.com) (gratuita para desarrollo)

```bash
git clone <repo>
cd Atenas
npm install
```

Copia `.env.example` a `.env` y rellena las variables (ver siguiente sección). Luego aplica las migraciones en Supabase y crea el primer admin.

---

## Configuración de Supabase

1. Crea un proyecto en [Supabase](https://supabase.com) y anota la **Project URL** y la **anon public key** (Settings → API).

2. En la raíz del proyecto crea `.env`:
   ```
   VITE_SUPABASE_URL=https://tu-proyecto.supabase.co
   VITE_SUPABASE_ANON_KEY=tu-anon-key
   ```

3. En el panel de Supabase, **SQL Editor**, ejecuta las migraciones **en este orden** (copia y pega el contenido de cada archivo):

   | Orden | Archivo | Descripción |
   |-------|---------|-------------|
   | 1 | `supabase/migrations/001_initial_schema.sql` | Tablas: `profiles`, `unidades`, `temas`, `recursos` y RLS |
   | 2 | `supabase/migrations/002_storage_recursos.sql` | Bucket `recursos` y políticas de Storage |
   | 3 | `supabase/migrations/003_actividades_intentos.sql` | Tablas: `actividades`, `actividad_intentos` |
   | 4 | `supabase/migrations/004_evaluaciones.sql` | Tablas: `evaluaciones`, `evaluacion_intentos` |
   | 5 | `supabase/migrations/005_profiles_activo_admin.sql` | Columna `activo` en `profiles` y política para que admin actualice perfiles |

4. **Opcional (recomendado si solo docente/admin dan de alta):** En Authentication → Settings desactiva **Enable email confirmations** para que los usuarios creados desde Admin puedan entrar sin confirmar correo.

---

## Primer uso: crear administrador

El primer usuario debe ser administrador y se crea desde el panel de Supabase (no hay autoregistro para estudiantes).

1. En Supabase: **Authentication** → **Users** → **Add user**  
   Crea un usuario con email y contraseña y anota el **User UID** (o el email).

2. En **SQL Editor** ejecuta el script `supabase/scripts/crear_usuario_admin.sql` (o el siguiente bloque), cambiando el email por el que usaste:
   ```sql
   INSERT INTO public.profiles (id, email, full_name, role)
   SELECT id, email, 'Administrador', 'admin'
   FROM auth.users
   WHERE email = 'tu-admin@ejemplo.com'
     AND NOT EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.users.id);
   ```

3. Inicia la app (`npm run dev`), abre la URL indicada, ve a **Entrar** e inicia sesión con ese usuario. Desde **Administración** podrás dar de alta estudiantes y docentes.

**Nota – Límite al dar de alta usuarios:** Supabase (sobre todo en plan gratuito) limita el número de registros por minuto. Si al crear un usuario aparece *"email rate limit exceeded"* o *429 Too Many Requests*, espera 1–2 minutos y vuelve a intentar. La app muestra un mensaje claro cuando ocurre este límite.

---

## Scripts y puerto

| Comando | Descripción |
|---------|-------------|
| `npm run dev` | Servidor de desarrollo (por defecto en **puerto 8080**, ver `vite.config.ts`) |
| `npm run build` | Build de producción |
| `npm run preview` | Vista previa del build |
| `npm run lint` | Ejecutar ESLint |

---

## Roles y flujos

| Rol | Qué puede hacer |
|-----|------------------|
| **Estudiante** | Ver contenidos (unidades → temas → recursos), hacer actividades y evaluaciones publicadas, ver su perfil. Solo accede a lo que el docente ha publicado. |
| **Docente** | Todo lo anterior + Panel docente: CRUD de unidades, temas, recursos; CRUD de actividades y evaluaciones por tema; publicar/no publicar; ver **Progreso de estudiantes** (tabla con actividades y evaluaciones realizadas y promedios). No gestiona usuarios. |
| **Administrador** | Todo lo del docente + **Administración**: listar usuarios, dar de alta (correo, contraseña, nombre, rol), editar nombre y rol, activar/desactivar cuentas. Las cuentas desactivadas no pueden iniciar sesión. |

Los estudiantes **no** se registran solos; solo el docente o el administrador los dan de alta desde el panel.

---

## Rutas de la aplicación

### Públicas (sin sesión)
- `/login` — Inicio de sesión (redirige a `/` si ya hay sesión; soporta `?redirect=...`).

### Con sesión (cualquier rol)
- `/` — Inicio estudiante con mapa vertical gamificado (niveles del Abya Yala y progreso).
- `/perfil` — Ver y editar nombre (y en el futuro avatar).
- `/progreso` — Vista de progreso global del estudiante por unidad/misión.
- `/logros` — Galería de insignias y logros desbloqueados.

### Estudiante / todos los autenticados
- `/unidades` — Listado de unidades.
- `/unidades/:unidadId` — Temas de la unidad.
- `/temas/:temaId` — Contenido del tema, recursos, actividades y evaluaciones publicadas.
- `/actividades/:actividadId` — Realizar una actividad (se guarda el intento).
- `/evaluaciones/:evaluacionId` — Realizar una evaluación (se guarda el intento y se muestra aprobado/no y retroalimentación).

### Solo docente y admin
- `/docente` — Inicio del panel (enlaces a Contenidos y Progreso).
- `/docente/contenidos` — Listado de unidades (CRUD).
- `/docente/unidades/:unidadId` — Temas de la unidad (CRUD).
- `/docente/temas/:temaId` — Recursos del tema (CRUD).
- `/docente/temas/:temaId/actividades` — Actividades del tema (CRUD, publicar/no publicar).
- `/docente/temas/:temaId/evaluaciones` — Evaluaciones del tema (CRUD, publicar/no publicar).
- `/docente/progreso` — Tabla de progreso de estudiantes (actividades y evaluaciones realizadas, promedios).

### Solo admin
- `/admin` — Gestión de usuarios (listar, crear, editar, activar/desactivar).

---

## Estructura del proyecto

```
src/
├── components/          # Componentes reutilizables
│   ├── actividades/     # Componentes por tipo de actividad (Selección múltiple, Memoria, etc.)
│   ├── Cuestionario.tsx # Cuestionario de evaluaciones
│   ├── ErrorBoundary.tsx
│   ├── Layout.tsx       # Cabecera y navegación
│   └── ProtectedRoute.tsx
├── contexts/
│   └── AuthContext.tsx
├── hooks/               # useAuth, useUnidades, useTemas, useActividades, useEvaluaciones, etc.
├── lib/
│   └── supabase.ts      # Cliente Supabase
├── pages/               # Páginas por ruta
│   ├── docente/         # Panel docente (Contenidos, Temas, Recursos, Actividades, Evaluaciones, Progreso)
│   ├── Login.tsx, Home.tsx, Perfil.tsx
│   ├── Unidades.tsx, UnidadTemas.tsx, TemaView.tsx
│   ├── ActividadView.tsx, EvaluacionView.tsx
│   └── AdminPanel.tsx
└── types/               # Tipos TypeScript (database, actividades, evaluaciones)
```

Las migraciones SQL están en `supabase/migrations/`. El script para crear el primer admin está en `supabase/scripts/crear_usuario_admin.sql`.

---

## Portada y vídeo por unidad

Ejecuta también la migración `supabase/migrations/20260321_unidades_cover_media.sql` (columnas opcionales en `unidades`: portada, vídeo, color, intro larga, tema visual).

El docente las edita en **Docente → Contenidos** al crear o editar una unidad. Los estudiantes las ven en **`/unidades`** (tarjetas estilo Home) y en **`/unidades/:unidadId`** (hero, vídeo e intro ampliada).

Guía y checklist: [`supabase/UNIDADES_MEDIA.md`](supabase/UNIDADES_MEDIA.md).

---

## Certificado de progreso (PDF)

El certificado de unidad completada se descarga en **PDF** en **carta horizontal** (letter landscape, 11" × 8.5"). El diseño es HTML/CSS (marco, líneas y tipografía) y **incluye el emblema del colegio** en la esquina superior derecha (`public/emblema-colegio-vaca-diez.png`).

- **Descargar certificado (PDF):** genera un archivo `.pdf` listo para imprimir o archivar.
- **Cambiar el emblema:** sustituye el archivo `public/emblema-colegio-vaca-diez.png` por tu PNG (fondo blanco fuera del círculo está bien). Luego ejecuta **`npm run prepare-emblema-colegio`** para volver transparente solo el blanco **conectado al borde** de la imagen (el interior del sello se mantiene).

---

## Resumen de fases implementadas

| Fase | Contenido |
|------|-----------|
| **1** | Login, perfil, rutas protegidas por rol, esquema inicial (profiles, unidades, temas, recursos). |
| **2** | Contenidos: CRUD unidades/temas/recursos (docente); vista estudiante (unidades → temas → recursos). Storage para imágenes/vídeos. |
| **3** | Actividades: 5 tipos (selección múltiple, relación de conceptos, memoria, ordenar secuencia, ubicar en mapa). Creación por JSON (docente), intentos guardados, feedback. |
| **4** | Evaluaciones: cuestionarios por tema (preguntas JSON), umbral de aprobado, intentos, resultado aprobado/no y retroalimentación por pregunta. |
| **5** | Panel docente: vista **Progreso de estudiantes**. Admin: gestión de usuarios (alta, edición, activar/desactivar). Columna `activo` en perfiles. |
| **6** | Pulido: tipografía y botones adecuados para primaria (44px touch), branding ATENAS, mensajes amigables, responsive y focus visible. |
| **7** | Misiones (Home), plantillas, **edición**, **reordenar**, **duplicar**, **mover a otro tema**, **vista previa** (modal docente) y **estadísticas** por ítem (intentos, medias, aprobados en evaluaciones). |

---

## Despliegue

Para producción, genera el build con `npm run build` y sirve la carpeta `dist/` desde tu hosting (Vercel, Netlify, etc.). Las variables de entorno `VITE_SUPABASE_URL` y `VITE_SUPABASE_ANON_KEY` deben configurarse en el entorno de despliegue. El backend (Auth, base de datos, Storage) sigue en tu proyecto Supabase.
