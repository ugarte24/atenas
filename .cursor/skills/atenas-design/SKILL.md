---
name: atenas-design
description: >-
  Guía de diseño UI/UX para ATENAS (plataforma educativa Ciencias Sociales 6.º).
  Usar al crear o modificar pantallas, componentes, estilos o copy de la app estudiante/docente.
---

# Diseño ATENAS

## Cuándo usar esta skill

- Cambios visuales en cualquier página o componente de ATENAS
- Nuevos componentes UI, formularios, tarjetas o navegación
- Ajustes de gamificación (islas, XP, misiones)
- Revisión de contraste, móvil o accesibilidad

## Tokens de color (obligatorios)

Usar variables CSS de `src/index.css`. **No introducir** clases `primary-*` ni colores hex sueltos salvo acentos de unidad desde BD.

| Token | Uso |
|-------|-----|
| `--atenas-ink` | Texto principal, botones primarios, sidebar |
| `--atenas-sidebar` | Fondos oscuros de nav y pestañas activas |
| `--atenas-gold` | XP, nivel, acentos gamificación |
| `--atenas-success` | Progreso completado, CTAs positivos |
| `--atenas-blue` | Enlaces, iconos informativos |
| `--atenas-page` | Fondo de página |
| `--atenas-mist` / `--atenas-mist-border` | Bordes y fondos suaves |
| `--atenas-text-muted` | Texto secundario |

Clases utilitarias Tailwind: `text-atenas-ink`, `bg-atenas-sidebar`, etc.

## Tipografía

- **Marca:** `.atenas-logo` (Cinzel, degradado dorado) — solo logo/título ATENAS
- **Cuerpo:** fuente del sistema (sans)
- **Tamaño base:** 18px desktop, 16px móvil (`html` en `index.css`)

## Componentes canónicos

Reutilizar antes de crear nuevos:

- `Button`, `Card`, `PageHeader`, `StatCard`, `EmptyState`, `Badge`, `ProgressBar`
- Clases globales: `.card`, `.btn-primary`, `.btn-secondary`, `.btn-success`, `.btn-atenas-gold`
- Pestañas: `.segment-tab`, `.page-tab`, `.profile-tab` (siempre par `--active` / `--inactive`)
- Nav lección: `.lesson-nav-item`

## Layout

- Estudiante: `Layout` + `StudentSidebar` (lg+) + `StudentBottomNav` (móvil, máx. 5 ítems)
- Padding horizontal: `--space-page-x` / `.page-container`
- Controles táctiles: `min-h-touch` (44px mínimo)
- Safe area: `pb-safe`, `pt-safe` en nav fija

## Navegación estudiante

Fuente única: `src/constants/studentNav.ts`

- Bottom nav móvil: Inicio · Unidades · Misiones · Progreso · Perfil
- Sidebar/drawer: ítems anteriores + Logros + Certificados
- Funciones “Próximamente” (p. ej. Aula en vivo): badge visible, fuera de nav primaria móvil

## Gamificación y narrativa híbrida

- **3 islas** (Abya Yala) en Home = metáfora visual; **7 unidades** = currículo real
- Puente obligatorio: badge `Isla N` en tarjetas de unidad (`mundoUnidadMap.ts`)
- No renombrar unidades curriculares; explicar la relación isla ↔ unidades en copy
- Gradientes islas: ver `ISLAND_COLORS` en `Home.tsx`
- XP siempre `--atenas-gold`

## Pestañas y contraste

Regla crítica: fondo y color de texto en la **misma clase CSS** (`.segment-tab--active`, etc.). Nunca confiar solo en `bg-atenas-sidebar text-white` en utilidades Tailwind separadas.

## Checklist móvil

- [ ] Bottom nav ≤ 5 ítems, labels cortos
- [ ] Pestañas con scroll horizontal si hay muchas (`overflow-x-auto scrollbar-nav-hide`)
- [ ] Pestaña activa legible (fondo oscuro + texto blanco)
- [ ] Sin texto blanco sobre fondo blanco
- [ ] Índice de secciones de lección accesible en `< lg`
- [ ] `aria-current="page"` en nav activa

## Accesibilidad

- `focus-visible`: anillo definido en `index.css`
- `aria-label` en nav y diálogos
- Imágenes decorativas: `alt=""`

## Referencia

Ver `reference.md` en esta carpeta para tabla de colores y patrones de copy.
