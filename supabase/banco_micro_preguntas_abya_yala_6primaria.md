# Banco de micro-preguntas Abya Yala (6.º Primaria)

Uso recomendado:
- Crear **1 evaluación** por tema con **preguntas cortas** (2-4 preguntas).
- Marcar la evaluación como `es_micro_quiz = true`.
- Publicar la evaluación (`publicada = true`).
- Recomendación de configuración: `max_intentos = 1` (o `2`) y `modo_examen = false`.
- Ubicación sugerida: `micro_ubicacion = "post_contenido"`.

## Formato de preguntas

La evaluación guarda `preguntas` como un array de objetos:

```json
[
  {
    "enunciado": "Pregunta corta...",
    "opciones": [
      { "texto": "Opción A", "correcta": true },
      { "texto": "Opción B", "correcta": false }
    ]
  }
]
```

## Nivel 1: Convivencia

### Micro-quiz (ejemplo)

```json
[
  {
    "enunciado": "¿Qué valor significa que la comunidad se ayuda entre todos?",
    "opciones": [
      { "texto": "Solidaridad (ayuda mutua)", "correcta": true },
      { "texto": "Individualismo (cada uno por su cuenta)", "correcta": false }
    ]
  },
  {
    "enunciado": "En muchos pueblos del Abya Yala, ¿qué se considera sagrado o respetado?",
    "opciones": [
      { "texto": "La naturaleza y la tierra", "correcta": true },
      { "texto": "Solo el dinero y los objetos", "correcta": false }
    ]
  },
  {
    "enunciado": "¿Qué práctica busca mantener el equilibrio (tomar solo lo necesario)?",
    "opciones": [
      { "texto": "Equilibrio y respeto a los recursos", "correcta": true },
      { "texto": "Tomar más de lo que se necesita", "correcta": false }
    ]
  }
]
```

## Nivel 2: Organización social y política

### Micro-quiz (ejemplo)

```json
[
  {
    "enunciado": "¿Qué es un ayllu, en términos generales?",
    "opciones": [
      { "texto": "Una comunidad con organización propia", "correcta": true },
      { "texto": "Un solo lugar sin vínculos entre familias", "correcta": false }
    ]
  },
  {
    "enunciado": "¿Para qué sirven las decisiones y acuerdos comunitarios?",
    "opciones": [
      { "texto": "Para organizar la vida en la comunidad", "correcta": true },
      { "texto": "Para que cada persona haga lo que quiera sin reglas", "correcta": false }
    ]
  },
  {
    "enunciado": "¿Quiénes suelen cumplir roles de liderazgo comunitario (según el contexto histórico)?",
    "opciones": [
      { "texto": "Líderes como curacas o autoridades comunitarias", "correcta": true },
      { "texto": "Personas elegidas al azar sin pertenencia", "correcta": false }
    ]
  }
]
```

## Nivel 3: Invasión europea (cambio y conflicto)

### Micro-quiz (ejemplo)

```json
[
  {
    "enunciado": "¿Qué ocurrió con la llegada europea a América (en términos generales)?",
    "opciones": [
      { "texto": "Se inició un proceso de conquista y cambios forzados", "correcta": true },
      { "texto": "No hubo cambios ni conflictos", "correcta": false }
    ]
  },
  {
    "enunciado": "¿Qué es un impacto de la conquista sobre los pueblos?",
    "opciones": [
      { "texto": "Pueden perderse tierras o imponerse nuevas reglas", "correcta": true },
      { "texto": "Todo queda igual que antes", "correcta": false }
    ]
  },
  {
    "enunciado": "¿Qué se entiende por explotación en este contexto histórico?",
    "opciones": [
      { "texto": "Aprovechar el trabajo de otros sin igualdad", "correcta": true },
      { "texto": "Compartir recursos con respeto y equilibrio", "correcta": false }
    ]
  }
]
```

## Nivel 4: Resistencia

### Micro-quiz (ejemplo)

```json
[
  {
    "enunciado": "¿Cómo se puede expresar la resistencia cultural?",
    "opciones": [
      { "texto": "Mantener tradiciones, conocimientos y lengua", "correcta": true },
      { "texto": "Olvidar todo lo propio para no recordar", "correcta": false }
    ]
  },
  {
    "enunciado": "¿Por qué fue importante defender territorios y comunidades?",
    "opciones": [
      { "texto": "Porque forman parte de la vida y la identidad", "correcta": true },
      { "texto": "Porque no tenían relación con la vida diaria", "correcta": false }
    ]
  },
  {
    "enunciado": "¿Qué significa “continuidad histórica”?",
    "opciones": [
      { "texto": "Que algunas ideas y formas de vida perduran y se transforman", "correcta": true },
      { "texto": "Que nada cambia nunca y no existe el pasado", "correcta": false }
    ]
  }
]
```

## Nivel 5: Actualidad (derechos y recuperación cultural)

### Micro-quiz (ejemplo)

```json
[
  {
    "enunciado": "¿Cuál es una forma de reconocer los derechos indígenas?",
    "opciones": [
      { "texto": "Respetar la cultura, la lengua y la identidad", "correcta": true },
      { "texto": "Ignorar las tradiciones para “integrar” a todos igual", "correcta": false }
    ]
  },
  {
    "enunciado": "¿Qué significa recuperar cultura?",
    "opciones": [
      { "texto": "Volver a practicar y valorar conocimientos y tradiciones", "correcta": true },
      { "texto": "Borrar la historia para empezar de cero", "correcta": false }
    ]
  },
  {
    "enunciado": "¿Qué valor ayuda a mantener un equilibrio con el ambiente?",
    "opciones": [
      { "texto": "Respeto a la naturaleza y uso responsable", "correcta": true },
      { "texto": "Gastar sin pensar en el futuro", "correcta": false }
    ]
  }
]
```

