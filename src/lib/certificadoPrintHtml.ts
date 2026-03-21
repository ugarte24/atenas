/**
 * HTML/CSS para certificado de progreso.
 * Tamaño de página: carta (letter) apaisado.
 * Variante `print`: fuentes web (Google) para vista previa.
 * Variante `pdf`: sin fuentes remotas + Georgia/Times para html2canvas (evita letras amontonadas).
 */

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

/** URL absoluta del escudo para ventana about:blank / iframe */
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
  escudoUrl?: string;
};

export type CertificadoDocumentOptions = {
  /** Por defecto true solo en variante `print` */
  autoPrint?: boolean;
  variant?: 'print' | 'pdf';
};

export function buildCertificadoPrintDocument(
  params: CertificadoParams,
  options: CertificadoDocumentOptions = {}
): string {
  const variant = options.variant ?? 'print';
  const autoPrint =
    options.autoPrint !== false && variant === 'print';

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
  const escudoRaw = params.escudoUrl ?? resolveCertificadoEscudoUrl();
  const escudoUrl =
    escudoRaw.startsWith('data:') ? escudoRaw : escapeHtml(escudoRaw);

  const rootClass =
    variant === 'pdf'
      ? 'certificado-root certificado-root--pdf'
      : 'certificado-root certificado-root--print';

  const fontLink =
    variant === 'print'
      ? `<link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link href="https://fonts.googleapis.com/css2?family=Cinzel:wght@600;700&family=Crimson+Text:ital,wght@0,400;0,600;1,400&display=swap" rel="stylesheet" />`
      : '';

  return `<!DOCTYPE html>
<html lang="es" class="${rootClass}">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Certificado de progreso · ATENAS</title>
  ${fontLink}
  <style>
    * { box-sizing: border-box; }
    @page { size: letter landscape; margin: 0.28in; }
    html, body { margin: 0; }
    body {
      font-family: 'Crimson Text', Georgia, 'Times New Roman', serif;
      background: linear-gradient(165deg, #f8f6f1 0%, #efe9df 45%, #e8e2d6 100%);
      color: #1a1f1c;
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }

    /* PDF: fuentes locales + sin letter-spacing amplio (html2canvas falla con Cinzel/remotas) */
    html.certificado-root--pdf body,
    html.certificado-root--pdf .cert,
    html.certificado-root--pdf .col-main {
      font-family: Georgia, 'Times New Roman', Times, serif !important;
    }
    html.certificado-root--pdf .brand,
    html.certificado-root--pdf h1,
    html.certificado-root--pdf .name,
    html.certificado-root--pdf .footer-brand {
      font-family: Georgia, 'Times New Roman', Times, serif !important;
    }
    html.certificado-root--pdf p,
    html.certificado-root--pdf .pill,
    html.certificado-root--pdf small {
      font-variant: normal;
    }
    /* Espaciado explícito (Georgia en PDF se veía muy apretado con letter-spacing: normal en todo) */
    html.certificado-root--pdf .brand {
      text-transform: uppercase;
      font-size: 0.62rem;
      letter-spacing: 0.14em !important;
      word-spacing: 0.12em;
    }
    html.certificado-root--pdf h1 {
      text-transform: uppercase;
      letter-spacing: 0.065em !important;
      word-spacing: 0.04em;
    }
    html.certificado-root--pdf .sub {
      letter-spacing: 0.02em !important;
    }
    html.certificado-root--pdf .lead {
      letter-spacing: 0.018em !important;
    }
    html.certificado-root--pdf .name {
      letter-spacing: 0.05em !important;
      word-spacing: 0.03em;
      text-transform: capitalize;
    }
    html.certificado-root--pdf .detail {
      letter-spacing: 0.018em !important;
    }
    html.certificado-root--pdf .pill {
      letter-spacing: 0.02em !important;
    }
    html.certificado-root--pdf .pill span {
      letter-spacing: 0.03em !important;
    }
    html.certificado-root--pdf .footer-date {
      letter-spacing: 0.015em !important;
    }
    html.certificado-root--pdf .footer-brand {
      letter-spacing: 0.1em !important;
    }
    html.certificado-root--pdf .footer-brand small {
      letter-spacing: 0.05em !important;
    }

    html.certificado-root--print, html.certificado-root--print body {
      min-height: 100%;
    }
    html.certificado-root--print .sheet {
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 0.5rem 0.65rem;
    }
    html.certificado-root--print .cert {
      width: 100%;
      max-width: 1024px;
    }

    html.certificado-root--pdf,
    html.certificado-root--pdf body {
      width: 1056px;
      height: 816px;
      overflow: hidden;
    }
    html.certificado-root--pdf .sheet {
      width: 100%;
      height: 100%;
      display: flex;
      align-items: stretch;
      justify-content: center;
      padding: 10px 12px;
    }
    html.certificado-root--pdf .escudo-en-esquina {
      width: 64px;
      height: 64px;
      top: 10px;
      right: 12px;
    }
    html.certificado-root--pdf h1 { font-size: 1.15rem; margin-bottom: 0.15rem; }
    html.certificado-root--pdf .sub { font-size: 0.8rem; margin-bottom: 0.4rem; }
    html.certificado-root--pdf .brand { margin-bottom: 0.15rem; }
    html.certificado-root--pdf .lead {
      font-size: 0.88rem;
      margin-bottom: 0.4rem;
      line-height: 1.45;
      padding: 0 0.25rem;
    }
    html.certificado-root--pdf .name {
      font-size: 1.15rem;
      margin-bottom: 0.4rem;
      padding-bottom: 0.3rem;
    }
    html.certificado-root--pdf .detail { font-size: 0.85rem; margin: 0.3rem 0; line-height: 1.45; }
    html.certificado-root--pdf .stats { margin: 0.4rem 0 0.35rem; gap: 0.75rem; }
    html.certificado-root--pdf .pill { font-size: 0.78rem; padding: 0.35rem 0.75rem; line-height: 1.35; }
    html.certificado-root--pdf .pill span { font-size: 0.95rem; }
    html.certificado-root--pdf .footer-date { font-size: 0.78rem; margin-top: 0.25rem; }
    html.certificado-root--pdf .footer-brand { margin-top: 0.4rem; padding-top: 0.35rem; font-size: 0.68rem; }
    html.certificado-root--pdf .footer-brand small { font-size: 0.6rem; }
    html.certificado-root--pdf .rule { margin-bottom: 0.4rem; }
    html.certificado-root--pdf .corner { width: 28px; height: 28px; }

    html.certificado-root--pdf .cert {
      display: block !important;
      width: 100%;
      height: 100%;
      padding: 0.75rem 1rem 0.6rem;
      box-sizing: border-box;
    }
    html.certificado-root--pdf .col-main {
      display: block;
      width: 100% !important;
      max-width: 100% !important;
      min-width: 0 !important;
      padding: 0 5.5rem 0 0.75rem;
      margin: 0;
      box-sizing: border-box;
    }
    html.certificado-root--pdf .col-main .brand,
    html.certificado-root--pdf .col-main h1,
    html.certificado-root--pdf .col-main .sub,
    html.certificado-root--pdf .col-main .lead,
    html.certificado-root--pdf .col-main .name,
    html.certificado-root--pdf .col-main .detail,
    html.certificado-root--pdf .col-main .footer-date,
    html.certificado-root--pdf .col-main .footer-brand {
      display: block;
      width: 100%;
      max-width: 100%;
      margin-left: auto;
      margin-right: auto;
      box-sizing: border-box;
    }
    html.certificado-root--pdf .stats {
      display: flex;
      width: 100%;
      justify-content: center;
      flex-wrap: wrap;
      gap: 0.75rem;
    }
    html.certificado-root--pdf .pill {
      flex: 0 1 auto;
      min-width: 200px;
      max-width: 420px;
      white-space: normal;
      text-align: center;
    }
    html.certificado-root--pdf .escudo-en-esquina {
      filter: none;
    }

    .cert {
      background: #fdfbf7;
      border: 3px double #8b7355;
      outline: 1px solid #c9a66a;
      outline-offset: 4px;
      box-shadow:
        0 0 0 2px #f5efe4,
        0 8px 28px rgba(31, 45, 42, 0.08),
        inset 0 1px 0 rgba(255,255,255,0.85);
      padding: 0.85rem 1rem 0.75rem;
      position: relative;
      overflow: hidden;
    }
    .cert::before {
      content: '';
      position: absolute;
      inset: 9px;
      border: 1px solid rgba(201, 166, 106, 0.45);
      pointer-events: none;
    }
    .corner {
      position: absolute;
      width: 32px;
      height: 32px;
      border-color: #b8956a;
      opacity: 0.5;
      pointer-events: none;
      z-index: 1;
    }
    .corner-tl { top: 12px; left: 12px; border-top: 2px solid; border-left: 2px solid; }
    .corner-tr { top: 12px; right: 12px; border-top: 2px solid; border-right: 2px solid; }
    .corner-bl { bottom: 12px; left: 12px; border-bottom: 2px solid; border-left: 2px solid; }
    .corner-br { bottom: 12px; right: 12px; border-bottom: 2px solid; border-right: 2px solid; }

    .escudo-en-esquina {
      position: absolute;
      top: 14px;
      right: 16px;
      width: 82px;
      height: 82px;
      object-fit: contain;
      z-index: 4;
      pointer-events: none;
      filter: drop-shadow(0 2px 8px rgba(0,0,0,0.12));
    }
    .escudo-en-esquina--hidden { display: none !important; }

    .col-main {
      position: relative;
      z-index: 2;
      display: flex;
      flex-direction: column;
      justify-content: center;
      min-width: 0;
      padding-right: 5.75rem;
    }
    .brand {
      font-family: 'Cinzel', Georgia, serif;
      font-size: 0.58rem;
      letter-spacing: 0.22em;
      text-transform: uppercase;
      color: #1a2b44;
      text-align: center;
      margin-bottom: 0.15rem;
    }
    h1 {
      font-family: 'Cinzel', Georgia, serif;
      font-weight: 700;
      font-size: 1.12rem;
      letter-spacing: 0.06em;
      color: #1a2b44;
      text-align: center;
      margin: 0 0 0.15rem;
      text-transform: uppercase;
    }
    .sub {
      text-align: center;
      font-size: 0.82rem;
      color: #4a5568;
      font-style: italic;
      margin: 0 0 0.45rem;
    }
    .rule {
      height: 2px;
      width: 100px;
      margin: 0 auto 0.45rem;
      background: linear-gradient(90deg, transparent, #d4c3a1, transparent);
    }
    .lead {
      text-align: center;
      font-size: 0.88rem;
      line-height: 1.38;
      margin: 0 0 0.45rem;
      color: #2d3748;
    }
    .name {
      font-family: 'Cinzel', Georgia, serif;
      font-weight: 700;
      font-size: 1.18rem;
      letter-spacing: 0.02em;
      color: #1a2b44;
      text-align: center;
      margin: 0 0 0.4rem;
      padding-bottom: 0.35rem;
      border-bottom: 2px solid rgba(212, 195, 161, 0.85);
    }
    .detail {
      margin: 0.3rem 0;
      font-size: 0.86rem;
      line-height: 1.35;
      text-align: center;
    }
    .detail strong { color: #1f2d2a; font-weight: 600; }
    .unidad { font-style: italic; color: #2d3a36; }
    .stats {
      display: flex;
      justify-content: center;
      gap: 0.65rem;
      flex-wrap: wrap;
      margin: 0.4rem 0 0.32rem;
    }
    .pill {
      background: linear-gradient(180deg, #f0ebe3, #e8e0d4);
      border: 1px solid #d4c3a1;
      border-radius: 8px;
      padding: 0.28rem 0.65rem;
      font-size: 0.78rem;
      box-shadow: inset 0 1px 0 rgba(255,255,255,0.7);
    }
    .pill span { color: #1a2b44; font-weight: 700; font-size: 0.92rem; }
    .footer-date {
      text-align: center;
      font-size: 0.78rem;
      color: #718096;
      margin-top: 0.25rem;
      font-style: italic;
    }
    .footer-brand {
      margin-top: 0.4rem;
      padding-top: 0.35rem;
      border-top: 1px solid rgba(212, 195, 161, 0.65);
      text-align: center;
      font-family: 'Cinzel', Georgia, serif;
      font-size: 0.65rem;
      letter-spacing: 0.15em;
      color: #7a847d;
    }
    .footer-brand small {
      display: block;
      margin-top: 0.15rem;
      letter-spacing: 0.05em;
      font-size: 0.58rem;
      color: #a0aec0;
      font-family: 'Crimson Text', Georgia, serif;
    }
    @media print {
      body { background: #fff; }
      html.certificado-root--print .sheet { padding: 0; min-height: auto; }
      html.certificado-root--print .cert { box-shadow: none; max-width: none; }
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

      <img
        class="escudo-en-esquina"
        src="${escudoUrl}"
        alt="Escudo del colegio"
        width="82"
        height="82"
        onerror="this.classList.add('escudo-en-esquina--hidden')"
      />

      <div class="col-main">
        <p class="brand">Plataforma educativa · Ciencias Sociales</p>
        <h1>Certificado de progreso</h1>
        <p class="sub">6.º de Primaria - Unidad completada en ATENAS</p>
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
  ${autoPrint ? `<script>window.onload=function(){window.print();}</script>` : ''}
</body>
</html>`;
}
