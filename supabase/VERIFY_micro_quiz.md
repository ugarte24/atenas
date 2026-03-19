# Verificación: micro-quiz Abya Yala

Objetivo:
- Confirmar que el estudiante ve el micro-quiz en `TemaView` y NO ve `TemaMensajes`.
- Confirmar que el estudiante puede responder y que se guarda el intento.
- Confirmar que el docente/admin sigue pudiendo administrar `evaluaciones`.

## Checklist (manual)

1. Preparación en Supabase
   - Verifica que exista al menos 1 evaluación por tema con:
     - `publicada = true`
     - `es_micro_quiz = true`
     - `micro_ubicacion` definido (por ejemplo `post_contenido`)

2. Estudiante (rol `estudiante`)
   - Entra a `/temas/:temaId` de un tema desbloqueado.
   - Confirma que:
     - Aparece el bloque “Reto rápido” (tarjeta micro-quiz).
     - No aparece el formulario / sección de `TemaMensajes`.
   - Responde el micro-quiz:
     - Enviar evaluación y verificar feedback.
     - Recarga la página y confirma que tu progreso/limitación (si aplica por `max_intentos`) se refleja.

3. Docente/Admin
   - Entra al panel `DocenteEvaluaciones` para un tema.
   - Confirmar que se puede:
     - Marcar “Usar como micro-quiz”.
     - Elegir la ubicación (“inicio” o “después de contenido”).
     - Guardar la edición sin perder otros campos.
   - Confirmar que la lista de evaluaciones y la vista completa de evaluaciones sigue funcionando.

## Evidencia sugerida
- Capturas de pantalla del estudiante viendo la tarjeta.
- Registro (en DevTools → Network/Console) si aparece algún error al insertar `evaluacion_intentos`.

