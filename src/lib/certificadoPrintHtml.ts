/**
 * HTML/CSS para ventana de impresión del certificado de progreso.
 * Plantilla tipo diploma formal (bordes, tipografía serif, impresión A4).
 */

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

export type CertificadoParams = {
  nombreEstudiante: string;
  tituloUnidad: string;
  porcentajeUnidad: number;
  umbralCertificado: number;
};

export function buildCertificadoPrintDocument(params: CertificadoParams): string {
  const nombre = escapeHtml(params.nombreEstudiante.trim() || 'Estudiante');
  const unidad = escapeHtml(params.tituloUnidad.trim() || 'Unidad');
  const pct = Math.round(params.porcentajeUnidad);
  const umbral = Math.round(params.umbralCertificado);
  const fecha = new Date().toLocaleDateString('es-ES', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
  const fechaEsc = escapeHtml(fecha);

  return `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Certificado de progreso · ATENAS</title>
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link href="https://fonts.googleapis.com/css2?family=Cinzel:wght@600;700&family=Crimson+Text:ital,wght@0,400;0,600;1,400&display=swap" rel="stylesheet" />
  <style>
    * { box-sizing: border-box; }
    @page { size: A4 portrait; margin: 12mm; }
    html, body { height: 100%; margin: 0; }
    body {
      font-family: 'Crimson Text', Georgia, 'Times New Roman', serif;
      background: linear-gradient(165deg, #f8f6f1 0%, #efe9df 45%, #e8e2d6 100%);
      color: #1a1f1c;
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }
    .sheet {
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 1.25rem;
    }
    .cert {
      width: 100%;
      max-width: 720px;
      background: #fffcf7;
      border: 3px double #8b7355;
      outline: 1px solid #c9a66a;
      outline-offset: 6px;
      box-shadow:
        0 0 0 4px #f5efe4,
        0 12px 40px rgba(31, 45, 42, 0.12),
        inset 0 1px 0 rgba(255,255,255,0.8);
      padding: 2.5rem 2.75rem 2rem;
      position: relative;
      overflow: hidden;
    }
    .cert::before {
      content: '';
      position: absolute;
      inset: 14px;
      border: 1px solid rgba(201, 166, 106, 0.45);
      pointer-events: none;
    }
    .corner {
      position: absolute;
      width: 48px;
      height: 48px;
      border-color: #b8956a;
      opacity: 0.55;
      pointer-events: none;
    }
    .corner-tl { top: 18px; left: 18px; border-top: 2px solid; border-left: 2px solid; }
    .corner-tr { top: 18px; right: 18px; border-top: 2px solid; border-right: 2px solid; }
    .corner-bl { bottom: 18px; left: 18px; border-bottom: 2px solid; border-left: 2px solid; }
    .corner-br { bottom: 18px; right: 18px; border-bottom: 2px solid; border-right: 2px solid; }

    .brand {
      font-family: 'Cinzel', Georgia, serif;
      font-size: 0.72rem;
      letter-spacing: 0.35em;
      text-transform: uppercase;
      color: #5c4a3a;
      text-align: center;
      margin-bottom: 0.35rem;
    }
    .ribbon {
      text-align: center;
      font-size: 1.75rem;
      margin: 0.25rem 0 0.5rem;
      line-height: 1;
    }
    h1 {
      font-family: 'Cinzel', Georgia, serif;
      font-weight: 700;
      font-size: 1.65rem;
      letter-spacing: 0.06em;
      color: #0c2340;
      text-align: center;
      margin: 0 0 0.35rem;
      text-transform: uppercase;
    }
    .sub {
      text-align: center;
      font-size: 1.05rem;
      color: #4a4f4c;
      font-style: italic;
      margin: 0 0 1.5rem;
    }
    .rule {
      height: 2px;
      width: 120px;
      margin: 0 auto 1.5rem;
      background: linear-gradient(90deg, transparent, #c9a66a, transparent);
    }
    .lead {
      text-align: center;
      font-size: 1.15rem;
      line-height: 1.55;
      margin: 0 0 1.25rem;
    }
    .name {
      font-family: 'Cinzel', Georgia, serif;
      font-weight: 700;
      font-size: 1.85rem;
      font-variant: small-caps;
      letter-spacing: 0.04em;
      color: #0c2340;
      text-align: center;
      margin: 0 0 1.35rem;
      padding-bottom: 0.6rem;
      border-bottom: 2px solid rgba(201, 166, 106, 0.65);
      display: inline-block;
      width: 100%;
    }
    .detail {
      margin: 0.85rem 0;
      font-size: 1.1rem;
      line-height: 1.5;
      text-align: center;
    }
    .detail strong { color: #1f2d2a; font-weight: 600; }
    .unidad {
      font-style: italic;
      color: #2d3a36;
    }
    .stats {
      display: flex;
      justify-content: center;
      gap: 1.25rem;
      flex-wrap: wrap;
      margin: 1.5rem 0 1.25rem;
    }
    .pill {
      background: linear-gradient(180deg, #f0ebe3, #e8e0d4);
      border: 1px solid #c9a66a;
      border-radius: 8px;
      padding: 0.5rem 1.1rem;
      font-size: 0.98rem;
      box-shadow: inset 0 1px 0 rgba(255,255,255,0.7);
    }
    .pill span { color: #0c2340; font-weight: 700; font-size: 1.15rem; }
    .footer-date {
      text-align: center;
      font-size: 0.98rem;
      color: #4a4f4c;
      margin-top: 1.75rem;
      font-style: italic;
    }
    .footer-brand {
      margin-top: 2rem;
      padding-top: 1rem;
      border-top: 1px solid rgba(139, 115, 85, 0.35);
      text-align: center;
      font-family: 'Cinzel', Georgia, serif;
      font-size: 0.85rem;
      letter-spacing: 0.2em;
      color: #6b5d4a;
    }
    .footer-brand small {
      display: block;
      margin-top: 0.35rem;
      letter-spacing: 0.08em;
      font-size: 0.72rem;
      color: #7a847d;
      font-family: 'Crimson Text', Georgia, serif;
    }
    @media print {
      body { background: #fff; }
      .sheet { padding: 0; min-height: auto; }
      .cert { box-shadow: none; max-width: none; }
    }
  </style>
</head>
<body>
  <div class="sheet">
    <article class="cert" aria-label="Certificado de progreso">
      <span class="corner corner-tl" aria-hidden="true"></span>
      <span class="corner corner-tr" aria-hidden="true"></span>
      <span class="corner corner-bl" aria-hidden="true"></span>
      <span class="corner corner-br" aria-hidden="true"></span>

      <p class="brand">Plataforma educativa</p>
      <div class="ribbon" aria-hidden="true">🎓</div>
      <h1>Certificado de progreso</h1>
      <p class="sub">Ciencias Sociales · 6.º de Primaria</p>
      <div class="rule" aria-hidden="true"></div>

      <p class="lead">Se certifica que el alumno o alumna que se nombra ha alcanzado el progreso requerido en la unidad didáctica indicada.</p>

      <p class="name">${nombre}</p>

      <p class="detail"><strong>Unidad:</strong> <span class="unidad">${unidad}</span></p>

      <div class="stats">
        <div class="pill">Progreso en la unidad: <span>${pct}%</span></div>
        <div class="pill">Mínimo exigido: <span>${umbral}%</span></div>
      </div>

      <p class="footer-date">${fechaEsc}</p>

      <div class="footer-brand">
        ATENAS
        <small>Aprendizaje de Ciencias Sociales</small>
      </div>
    </article>
  </div>
  <script>window.onload=function(){window.print();}</script>
</body>
</html>`;
}
