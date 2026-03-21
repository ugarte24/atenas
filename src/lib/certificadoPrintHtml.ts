/**
 * HTML/CSS para ventana de impresión del certificado de progreso.
 * Formato A4 apaisado, con escudo del colegio (public/escudo-colegio-vaca-diez.png).
 */

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

/** URL absoluta del escudo para que cargue en ventana about:blank + document.write */
export function resolveCertificadoEscudoUrl(): string {
  if (typeof window === 'undefined') return '';
  const base = import.meta.env.BASE_URL || '/';
  return new URL('escudo-colegio-vaca-diez.png', window.location.origin + base).href;
}

export type CertificadoParams = {
  nombreEstudiante: string;
  tituloUnidad: string;
  porcentajeUnidad: number;
  umbralCertificado: number;
  /** Si se omite, se usa `resolveCertificadoEscudoUrl()` */
  escudoUrl?: string;
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
  const escudoUrl = escapeHtml(params.escudoUrl ?? resolveCertificadoEscudoUrl());

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
    @page { size: A4 landscape; margin: 10mm; }
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
      padding: 0.75rem 1rem;
    }
    .cert {
      width: 100%;
      max-width: 1080px;
      background: #fffcf7;
      border: 3px double #8b7355;
      outline: 1px solid #c9a66a;
      outline-offset: 5px;
      box-shadow:
        0 0 0 3px #f5efe4,
        0 10px 36px rgba(31, 45, 42, 0.1),
        inset 0 1px 0 rgba(255,255,255,0.8);
      padding: 1.35rem 1.5rem 1.15rem;
      position: relative;
      overflow: hidden;
      display: grid;
      grid-template-columns: minmax(130px, 175px) minmax(0, 1fr);
      gap: 1.25rem 1.75rem;
      align-items: stretch;
    }
    .cert::before {
      content: '';
      position: absolute;
      inset: 11px;
      border: 1px solid rgba(201, 166, 106, 0.45);
      pointer-events: none;
    }
    .corner {
      position: absolute;
      width: 36px;
      height: 36px;
      border-color: #b8956a;
      opacity: 0.5;
      pointer-events: none;
      z-index: 1;
    }
    .corner-tl { top: 14px; left: 14px; border-top: 2px solid; border-left: 2px solid; }
    .corner-tr { top: 14px; right: 14px; border-top: 2px solid; border-right: 2px solid; }
    .corner-bl { bottom: 14px; left: 14px; border-bottom: 2px solid; border-left: 2px solid; }
    .corner-br { bottom: 14px; right: 14px; border-bottom: 2px solid; border-right: 2px solid; }

    .col-escudo {
      position: relative;
      z-index: 2;
      display: flex;
      flex-direction: column;
      align-items: center;
      text-align: center;
      padding: 0.35rem 0.5rem 0.35rem 0;
      border-right: 1px solid rgba(201, 166, 106, 0.55);
    }
    .escudo-img {
      width: 130px;
      height: 130px;
      object-fit: contain;
      display: block;
      margin: 0 auto 0.5rem;
      filter: drop-shadow(0 2px 6px rgba(0,0,0,0.08));
    }
    .escudo-img--hidden { display: none; }
    .escudo-nombre {
      font-family: 'Cinzel', Georgia, serif;
      font-size: 0.62rem;
      font-weight: 700;
      line-height: 1.35;
      letter-spacing: 0.04em;
      color: #0c2340;
      text-transform: uppercase;
      margin: 0 0 0.2rem;
      max-width: 11rem;
    }
    .escudo-lugar {
      font-size: 0.72rem;
      color: #4a4f4c;
      margin: 0;
      font-weight: 600;
      letter-spacing: 0.12em;
      text-transform: uppercase;
    }

    .col-main {
      position: relative;
      z-index: 2;
      display: flex;
      flex-direction: column;
      justify-content: center;
      min-width: 0;
    }
    .brand {
      font-family: 'Cinzel', Georgia, serif;
      font-size: 0.65rem;
      letter-spacing: 0.28em;
      text-transform: uppercase;
      color: #5c4a3a;
      text-align: center;
      margin-bottom: 0.2rem;
    }
    h1 {
      font-family: 'Cinzel', Georgia, serif;
      font-weight: 700;
      font-size: 1.35rem;
      letter-spacing: 0.07em;
      color: #0c2340;
      text-align: center;
      margin: 0 0 0.2rem;
      text-transform: uppercase;
    }
    .sub {
      text-align: center;
      font-size: 0.95rem;
      color: #4a4f4c;
      font-style: italic;
      margin: 0 0 0.65rem;
    }
    .rule {
      height: 2px;
      width: 100px;
      margin: 0 auto 0.65rem;
      background: linear-gradient(90deg, transparent, #c9a66a, transparent);
    }
    .lead {
      text-align: center;
      font-size: 1rem;
      line-height: 1.45;
      margin: 0 0 0.65rem;
    }
    .name {
      font-family: 'Cinzel', Georgia, serif;
      font-weight: 700;
      font-size: 1.45rem;
      font-variant: small-caps;
      letter-spacing: 0.03em;
      color: #0c2340;
      text-align: center;
      margin: 0 0 0.55rem;
      padding-bottom: 0.45rem;
      border-bottom: 2px solid rgba(201, 166, 106, 0.65);
    }
    .detail {
      margin: 0.4rem 0;
      font-size: 0.98rem;
      line-height: 1.4;
      text-align: center;
    }
    .detail strong { color: #1f2d2a; font-weight: 600; }
    .unidad { font-style: italic; color: #2d3a36; }
    .stats {
      display: flex;
      justify-content: center;
      gap: 0.85rem;
      flex-wrap: wrap;
      margin: 0.55rem 0 0.45rem;
    }
    .pill {
      background: linear-gradient(180deg, #f0ebe3, #e8e0d4);
      border: 1px solid #c9a66a;
      border-radius: 8px;
      padding: 0.35rem 0.85rem;
      font-size: 0.88rem;
      box-shadow: inset 0 1px 0 rgba(255,255,255,0.7);
    }
    .pill span { color: #0c2340; font-weight: 700; font-size: 1.02rem; }
    .footer-date {
      text-align: center;
      font-size: 0.88rem;
      color: #4a4f4c;
      margin-top: 0.35rem;
      font-style: italic;
    }
    .footer-brand {
      margin-top: 0.55rem;
      padding-top: 0.45rem;
      border-top: 1px solid rgba(139, 115, 85, 0.35);
      text-align: center;
      font-family: 'Cinzel', Georgia, serif;
      font-size: 0.72rem;
      letter-spacing: 0.18em;
      color: #6b5d4a;
    }
    .footer-brand small {
      display: block;
      margin-top: 0.2rem;
      letter-spacing: 0.06em;
      font-size: 0.65rem;
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

      <aside class="col-escudo">
        <img
          class="escudo-img"
          src="${escudoUrl}"
          alt="Escudo del Colegio Particular Dr. Antonio Vaca Diez"
          width="130"
          height="130"
          onerror="this.classList.add('escudo-img--hidden')"
        />
        <p class="escudo-nombre">Colegio Particular Dr. Antonio Vaca Diez</p>
        <p class="escudo-lugar">Riberalta</p>
      </aside>

      <div class="col-main">
        <p class="brand">Plataforma educativa · Ciencias Sociales</p>
        <h1>Certificado de progreso</h1>
        <p class="sub">6.º de Primaria · Unidad completada en ATENAS</p>
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
      </div>
    </article>
  </div>
  <script>window.onload=function(){window.print();}</script>
</body>
</html>`;
}
