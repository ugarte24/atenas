# Guía de contenido para docentes — ATENAS

Esta guía describe cómo estructurar el currículo de **Ciencias Sociales (6.º Primaria)** alineado al mapa del Abya Yala.

## Orden recomendado del currículo

| Orden | Mundo del mapa | Unidades (seed) | Temas sugeridos |
|-------|----------------|-----------------|-----------------|
| 1–2 | Convivencia | Unidades 1–2 | 3 temas c/u |
| 3–5 | Territorio | Unidades 3–5 | 3 temas c/u |
| 6–7 | Historia | Unidades 6–7 | 3 temas c/u |

## Checklist por tema

Cada tema publicado debería incluir:

1. **Al menos 1 recurso** (texto, PDF, imagen, vídeo o audio).
2. **Al menos 1 actividad publicada** (selección múltiple, memoria, etc.).
3. **Al menos 1 evaluación publicada** con umbral de aprobado definido.
4. **Prerequisito** (opcional): encadena temas dentro de la unidad.

## Certificados

- Umbral recomendado: **80%** de progreso en la unidad (`certificado_umbral_pct`).
- El estudiante descarga el PDF desde la pestaña **Temas** de la unidad al alcanzar el umbral.

## Publicación

1. Crea/edita contenido en **Docente → Contenidos**.
2. Marca la unidad como **publicada** solo cuando todos los temas tengan actividades y evaluaciones listas.
3. Usa **Vista mapa alumno** en Contenidos para previsualizar el recorrido gamificado.

## Seeds de demo

Para cargar contenido de ejemplo en Supabase SQL Editor:

1. Migraciones aplicadas.
2. Ejecutar `supabase/seed_contenido_curricular.sql` (7 unidades, 21 temas, actividades y evaluaciones).
3. Opcional: `supabase/seed_unidades_media.sql` para portadas coherentes con el mapa.

## Calibración del mapa

Si cambias ilustraciones del mapa:

```bash
npm run adventure:assets
npm run adventure:calibrate
```

Revisa `scripts/adventure/debug-*-nodes.png` para alinear nodos sobre el sendero.
