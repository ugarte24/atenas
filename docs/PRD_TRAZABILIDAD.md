# Trazabilidad PRD ATENAS v1.0

Documento de correspondencia entre requisitos del PRD y la implementación en código.

## Módulo 1 — Autenticación

| ID | Requisito | Estado | Implementación | Criterio de aceptación |
|----|-----------|--------|----------------|------------------------|
| M1-F1 | Inicio de sesión | Implementado | `src/pages/Login.tsx`, `src/hooks/useAuth.ts` | Solo usuarios registrados ingresan |
| M1-F2 | Cierre de sesión | Implementado | `src/contexts/AuthContext.tsx` | Sesión termina al cerrar |
| M1-F3 | Control por roles | Implementado | `src/components/ProtectedRoute.tsx`, `profiles.role` | Rutas según estudiante/docente/admin |
| M1-F4 | Bloqueo cuentas desactivadas | Implementado | `useAuth.ts` (`activo === false`), RLS `20260615_rls_profiles_admin_activo.sql` | Inactivos no acceden ni insertan intentos |

## Módulo 2 — Gestión de usuarios

| ID | Requisito | Estado | Implementación | Criterio de aceptación |
|----|-----------|--------|----------------|------------------------|
| M2-F1 | Registrar usuarios | Implementado | `src/pages/AdminPanel.tsx` | Admin crea estudiantes/docentes |
| M2-F2 | Editar usuarios | Implementado | `AdminPanel.tsx` | Nombre y rol editables |
| M2-F3 | Activar/desactivar | Implementado | `profiles.activo`, `AdminPanel.tsx` | Toggle activo/inactivo |
| M2-F4 | Asignar roles | Implementado | `AdminPanel.tsx` | Rol en alta y edición |
| M2-F5 | Solo admin gestiona usuarios | Implementado | `20260615_rls_profiles_admin_activo.sql` | Docente no inserta perfiles |

## Módulo 3 — Gestión de unidades

| ID | Requisito | Estado | Implementación | Criterio de aceptación |
|----|-----------|--------|----------------|------------------------|
| M3-F1 | CRUD unidades | Implementado | `DocenteContenidos.tsx`, `useUnidades.ts` | Crear, editar, eliminar |
| M3-F2 | Publicar/despublicar | Implementado | `unidades.publicada`, `20260615_unidades_publicada.sql`, toggle en `DocenteContenidos.tsx` | Estudiante solo ve publicadas |
| M3-F3 | Imagen y vídeo intro | Implementado | `cover_image_url`, `cover_video_url`, `UnidadHero.tsx` | Portada y hero en vista estudiante |
| M3-F4 | Certificado por unidad | Implementado | `certificado_umbral_pct`, `certificadoPdf.ts` | PDF al completar umbral |

## Módulo 4 — Gestión de temas

| ID | Requisito | Estado | Implementación | Criterio de aceptación |
|----|-----------|--------|----------------|------------------------|
| M4-F1 | CRUD temas | Implementado | `DocenteTemas.tsx`, `useTemas.ts` | Temas por unidad |
| M4-F2 | Ordenar temas | Implementado | Campo `orden`, reorden en panel docente | Orden curricular |
| M4-F3 | Prerequisitos | Extra | `prerequisito_tema_id`, `prerequisitoTema.ts` | Desbloqueo en cadena |

## Módulo 5 — Recursos educativos

| ID | Requisito | Estado | Implementación | Criterio de aceptación |
|----|-----------|--------|----------------|------------------------|
| M5-T1 | Texto | Implementado | `recursos.tipo = texto`, `contenido`, `DocenteRecursos.tsx` | Bloque de texto en tema |
| M5-T2 | PDF | Implementado | `tipo = pdf`, visor en `TemaView.tsx` | Ver/descargar PDF |
| M5-T3 | Imagen | Implementado | `tipo = imagen`, `mapa` | Imágenes y mapas |
| M5-T4 | Vídeo | Implementado | `tipo = video` | Reproductor HTML5 |
| M5-T5 | Audio | Implementado | `tipo = audio` | `<audio controls>` |
| M5-F1 | Subir/editar/eliminar | Implementado | `useRecursos.ts`, `DocenteRecursos.tsx` | CRUD docente |

## Módulo 6 — Actividades interactivas

| ID | Requisito | Estado | Implementación | Criterio de aceptación |
|----|-----------|--------|----------------|------------------------|
| M6-T1 | Juego de memoria | Implementado | `Memoria.tsx`, `tipo = memoria` | Emparejar conceptos |
| M6-T2 | Selección múltiple | Implementado | `SeleccionMultiple.tsx` | Elegir respuesta(s) |
| M6-T3 | Relacionar columnas | Implementado | `RelacionConceptos.tsx` | Relacionar conceptos |
| M6-T4 | Arrastrar y soltar | Implementado | `OrdenarSecuencia.tsx` (DnD), `UbicarEnMapa.tsx` | Ordenar y ubicar en mapa |
| M6-F1 | Puntaje y retroalimentación | Implementado | `ActividadView.tsx`, `actividad_intentos` | Resultado inmediato |
| M6-F2 | Almacenar resultados | Implementado | `useIntento.ts` | Intentos en BD |

## Módulo 7 — Evaluaciones

| ID | Requisito | Estado | Implementación | Criterio de aceptación |
|----|-----------|--------|----------------|------------------------|
| M7-F1 | Crear evaluaciones | Implementado | `DocenteEvaluaciones.tsx` | Cuestionarios por tema |
| M7-F2 | Calificación automática | Implementado | `Cuestionario.tsx` | Nota % y aprobado |
| M7-F3 | Múltiples intentos | Implementado | `evaluacion_intentos`, `EvaluacionView.tsx` | Reintentos con `max_intentos` |
| M7-F4 | Tiempo por intento | Implementado | `tiempo_segundos`, `numero_intento`, `20260615_evaluacion_intentos_tiempo.sql` | Tiempo persistido |
| M7-F5 | Minutos límite examen | Implementado | `evaluaciones.minutos_limite`, panel docente | Configurable por evaluación |

## Módulo 8 — Gamificación

| ID | Requisito | Estado | Implementación | Criterio de aceptación |
|----|-----------|--------|----------------|------------------------|
| M8-F1 | Mapa de progreso | Implementado | `Home.tsx` | Mapa vertical por mundos |
| M8-F2 | Misiones | Implementado | `useMisiones.ts`, `/progreso` | Una misión por unidad |
| M8-F3 | Logros | Implementado | `Logros.tsx`, `achievements` | Insignias desbloqueables |
| M8-F4 | Niveles | Implementado | `gamificacion.ts`, XP unificado vía `xpDesdePuntuacionIntentos` | Niveles por XP |

> **Notas (jun 2026):** Foro por tema habilitado para estudiantes. XP unificado entre Home, Progreso y Perfil. Misiones especiales/cofre marcadas como próximamente hasta persistir bonificaciones.

## Módulo 9 — Progreso académico

| ID | Requisito | Estado | Implementación | Criterio de aceptación |
|----|-----------|--------|----------------|------------------------|
| M9-F1 | % completado | Implementado | `Progreso.tsx`, `progresoUnidad.ts` | Barra por unidad |
| M9-F2 | Actividades/evaluaciones | Implementado | `useProgresoEstudiantes.ts`, `DocenteProgreso.tsx` | Conteos y promedios |
| M9-F3 | Tiempo de estudio | Implementado | `useTiempoEstudio.ts`, `progreso_tema.tiempo_estudio_segundos` | Tiempo acumulado visible |

## Módulo 10 — Certificados

| ID | Requisito | Estado | Implementación | Criterio de aceptación |
|----|-----------|--------|----------------|------------------------|
| M10-F1 | Generación PDF | Implementado | `certificadoPdf.ts` | Descarga carta horizontal |
| M10-F2 | Completar unidad 100% | Implementado | `UnidadTemas.tsx`, umbral configurable | Condición de emisión |

## Checklist manual de validación

1. Admin crea estudiante → estudiante inicia sesión.
2. Docente crea unidad en borrador → estudiante no la ve → publica → estudiante la ve.
3. Docente sube PDF y audio → estudiante los consume en el tema.
4. Estudiante hace 2 intentos de evaluación → docente ve puntajes, tiempos e intentos.
5. Estudiante permanece en tema → `/progreso` muestra tiempo acumulado.
6. Estudiante completa unidad al 100% → descarga certificado PDF.
