# Unidades: portada, vídeo e intro ampliada

Campos en `public.unidades` (migración `20260321_unidades_cover_media.sql`):

| Campo | Uso |
|--------|-----|
| `cover_image_url` | Imagen de portada en lista `/unidades` y hero en `/unidades/:id`. URL `https://…` (pública o Storage público). |
| `cover_video_url` | Vídeo debajo del hero en la ficha de unidad. |
| `accent_color` | Hex `#RRGGBB` para acentos (botones de temas, barras de progreso). |
| `intro_extended` | Texto largo multilínea (“Más sobre esta unidad”). Sin HTML; se muestra como texto plano con saltos de línea. |
| `visual_theme` | Si no hay `cover_image_url`, imagen sugerida: `abya_yala`, `europa`, `historia`, `ciudadania` o vacío (por defecto). |

## Vídeo

- **YouTube**: enlace tipo `https://www.youtube.com/watch?v=VIDEO_ID` o `https://youtu.be/VIDEO_ID`.
- **Vimeo**: `https://vimeo.com/123456789`.
- **Archivo directo**: URL que termine en `.mp4`, `.webm` u `.ogg` (reproductor HTML5).

Si la URL no coincide con ninguno de los formatos anteriores, la app muestra un aviso en la ficha de unidad.

## Datos de ejemplo en el repositorio

- El seed **`seed_contenido_curricular.sql`** inserta las siete unidades del currículo de ejemplo con `cover_image_url`, `cover_video_url`, `accent_color`, `intro_extended` y `visual_theme` ya rellenados.
- El script **`seed_unidades_media.sql`** vuelve a aplicar esos mismos valores (útil si la base ya existía sin medios). También actualiza la fila con **`orden = 8`** (p. ej. «Abya Yala y mundo actual») si existe.
- Los **`cover_video_url`** de ejemplo enlazan a vídeos de YouTube **en español** (narración educativa de canales como Happy Learning, Kurzgesagt en español, Smile and Learn, UNICEF España, Aula365, etc.). Puedes sustituirlos en Docente → Contenidos si lo necesitas.

## Docente

Rellenar o sustituir en **Docente → Contenidos** al crear o editar una unidad.

## Checklist manual

1. Crear/editar unidad con imagen, color `#009975` e intro ampliada.
2. Abrir `/unidades` como estudiante: tarjeta con imagen y barra de progreso.
3. Abrir `/unidades/:id`: hero, vídeo (si hay URL), bloque de intro, lista de temas y certificado si aplica.
4. Probar vídeo YouTube y, si es posible, un `.mp4` público.
