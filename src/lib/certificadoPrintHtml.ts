/**
 * Certificado de progreso — carta (letter) horizontal.
 * Emblema del colegio: `public/emblema-colegio-vaca-diez.png` (esquina superior derecha).
 * Tras reemplazar el PNG: `npm run prepare-emblema-colegio` (fondo blanco exterior → transparente).
 * Variante `print`: fuentes Google.
 * Variante `pdf`: Georgia/Times para html2canvas.
 */

/** URL absoluta del emblema (misma origen que la app) */
export function resolveCertificadoEmblemaUrl(): string {
  if (typeof window === 'undefined') return '';
  const base = import.meta.env.BASE_URL || '/';
  return new URL('emblema-colegio-vaca-diez.png', window.location.origin + base).href;
}

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
  /** Opcional: data URL del PNG para PDF (evita fallos de carga en iframe) */
  emblemaUrl?: string;
};

export type CertificadoDocumentOptions = {
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

  const emblemaRaw = params.emblemaUrl ?? resolveCertificadoEmblemaUrl();
  const emblemaUrl =
    emblemaRaw.startsWith('data:') ? emblemaRaw : escapeHtml(emblemaRaw);

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
    @page { size: letter landscape; margin: 0.32in; }

    /* Escala institucional (px) — aire, secciones, nombre, firmas */
    :root {
      --cert-pad-y: 60px;
      --cert-pad-x: 80px;
      --section-gap: 28px;
      --section-gap-tight: 24px;
      --name-margin-v: 30px;
      --pill-gap: 24px;
      --space-before-signatures: 60px;
      --lh-body: 1.62;
      --lh-title: 1.35;
    }

    html, body { margin: 0; }
    body {
      font-family: 'Crimson Text', Georgia, 'Times New Roman', serif;
      background: #f5f0e8;
      color: #1c2433;
      line-height: var(--lh-body);
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }

    /* —— PDF: fuentes del sistema + espaciado legible —— */
    html.certificado-root--pdf body,
    html.certificado-root--pdf .cert-inner {
      font-family: Georgia, 'Times New Roman', Times, serif !important;
    }
    html.certificado-root--pdf .brand,
    html.certificado-root--pdf h1,
    html.certificado-root--pdf .name,
    html.certificado-root--pdf .footer-brand {
      font-family: Georgia, 'Times New Roman', Times, serif !important;
    }
    html.certificado-root--pdf .brand {
      text-transform: uppercase;
      font-size: 0.65rem;
      letter-spacing: 0.14em !important;
      word-spacing: 0.1em;
      color: #5c6478;
    }
    html.certificado-root--pdf h1 {
      text-transform: uppercase;
      letter-spacing: 0.07em !important;
      word-spacing: 0.04em;
    }
    html.certificado-root--pdf .sub { letter-spacing: 0.02em !important; }
    html.certificado-root--pdf .lead { letter-spacing: 0.02em !important; line-height: 1.65 !important; }
    html.certificado-root--pdf .name {
      letter-spacing: 0.06em !important;
      word-spacing: 0.04em;
      text-transform: capitalize;
    }
    html.certificado-root--pdf .detail { letter-spacing: 0.02em !important; }
    html.certificado-root--pdf .pill { letter-spacing: 0.02em !important; }
    html.certificado-root--pdf .pill span { letter-spacing: 0.03em !important; }
    html.certificado-root--pdf .footer-date { letter-spacing: 0.02em !important; }
    html.certificado-root--pdf .footer-brand { letter-spacing: 0.1em !important; }
    html.certificado-root--pdf .footer-brand small { letter-spacing: 0.05em !important; }

    html.certificado-root--print .sheet {
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 0.75rem 1rem;
    }
    html.certificado-root--print .cert {
      width: 100%;
      max-width: 1040px;
    }

    /* Lienzo fijo carta horizontal ≈ 11×8.5 in a 96dpi */
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
      padding: 0;
    }
    html.certificado-root--pdf .cert {
      width: 100%;
      height: 100%;
      padding: var(--cert-pad-y) var(--cert-pad-x);
      display: flex;
      flex-direction: column;
    }
    html.certificado-root--pdf .cert-inner {
      flex: 1;
      display: flex;
      flex-direction: column;
      justify-content: flex-start;
      gap: var(--space-before-signatures);
      min-height: 0;
      width: 100%;
      max-width: 820px;
      margin: 0 auto;
      padding: 0;
      box-sizing: border-box;
    }
    html.certificado-root--pdf h1 { font-size: 1.35rem; line-height: var(--lh-title); }
    html.certificado-root--pdf .sub { font-size: 0.88rem; line-height: 1.58; }
    html.certificado-root--pdf .lead {
      font-size: 0.95rem;
      padding: 0 12px;
      line-height: 1.65;
    }
    html.certificado-root--pdf .name { font-size: 1.38rem; padding: 0 8px var(--section-gap-tight); }
    html.certificado-root--pdf .detail { font-size: 0.92rem; line-height: 1.62; }
    html.certificado-root--pdf .stats { gap: var(--pill-gap); }
    html.certificado-root--pdf .pill {
      font-size: 0.82rem;
      padding: 12px 18px;
      line-height: 1.5;
    }
    html.certificado-root--pdf .pill span { font-size: 1rem; }
    html.certificado-root--pdf .footer-date { font-size: 0.82rem; margin: 0; line-height: 1.55; }
    html.certificado-root--pdf .footer-brand { margin-top: var(--section-gap-tight); padding-top: var(--section-gap-tight); font-size: 0.78rem; }
    html.certificado-root--pdf .footer-brand small { font-size: 0.68rem; line-height: 1.5; }
    html.certificado-root--pdf .corner { width: 26px; height: 26px; }
    html.certificado-root--pdf .cert-emblema-wrap {
      top: 26px;
      right: 30px;
      width: 108px;
      height: 108px;
      z-index: 10;
    }
    html.certificado-root--pdf .cert-emblema {
      filter: none;
    }
    html.certificado-root--pdf .cert-bottom { margin-top: 0; }
    html.certificado-root--pdf .signatures {
      margin-top: 0;
      padding-top: 0;
    }
    html.certificado-root--pdf .signatures__col {
      padding-top: 2.25rem;
    }
    html.certificado-root--pdf .signatures__line {
      margin-bottom: 0.55rem;
    }
    html.certificado-root--pdf .signatures__label { font-size: 0.68rem; line-height: 1.45; }

    /* Marco: borde dorado grueso + línea interior oscura (solo CSS) */
    .cert {
      position: relative;
      background: #fffdf9;
      border: 4px solid #c4a574;
      box-shadow:
        inset 0 0 0 1px #2a2a2a,
        0 2px 12px rgba(40, 35, 30, 0.08);
      padding: var(--cert-pad-y) var(--cert-pad-x);
      overflow: hidden;
    }
    .cert::after {
      content: '';
      position: absolute;
      inset: 12px;
      border: 1px solid rgba(196, 165, 116, 0.55);
      pointer-events: none;
      z-index: 0;
    }
    .corner {
      position: absolute;
      width: 28px;
      height: 28px;
      border-color: #8b7355;
      opacity: 0.85;
      pointer-events: none;
      z-index: 1;
    }
    .corner-tl { top: 14px; left: 14px; border-top: 2px solid; border-left: 2px solid; }
    .corner-tr { top: 14px; right: 14px; border-top: 2px solid; border-right: 2px solid; }
    .corner-bl { bottom: 14px; left: 14px; border-bottom: 2px solid; border-left: 2px solid; }
    .corner-br { bottom: 14px; right: 14px; border-bottom: 2px solid; border-right: 2px solid; }

    /* Emblema: encima del texto (no reserva espacio; el texto no se desplaza) */
    .cert-emblema-wrap {
      position: absolute;
      top: 28px;
      right: 36px;
      width: 132px;
      height: 132px;
      z-index: 10;
      pointer-events: none;
      border-radius: 50%;
      overflow: hidden;
      background: transparent;
      box-shadow: 0 4px 14px rgba(0, 0, 0, 0.1);
    }
    .cert-emblema {
      display: block;
      width: 100%;
      height: 100%;
      object-fit: contain;
      object-position: center;
    }
    .cert-emblema--hidden {
      display: none !important;
    }

    .cert-inner {
      position: relative;
      z-index: 1;
      max-width: 760px;
      margin: 0 auto;
      text-align: center;
      display: flex;
      flex-direction: column;
      gap: var(--space-before-signatures);
      padding-right: 0;
      box-sizing: border-box;
    }

    .cert-main {
      flex-shrink: 0;
    }
    .cert-main .brand {
      margin-bottom: var(--section-gap-tight);
    }
    .cert-main h1 {
      margin-bottom: var(--section-gap-tight);
    }
    .cert-main .sub {
      margin-bottom: var(--section-gap);
    }
    .cert-main .lead {
      margin-bottom: 0;
    }
    .cert-main .rule--wide {
      margin-top: var(--section-gap);
      margin-bottom: 0;
    }
    .cert-main .name {
      margin-top: var(--name-margin-v);
      margin-bottom: var(--name-margin-v);
    }
    .cert-main .detail {
      margin-bottom: var(--section-gap);
    }
    .cert-main .stats {
      margin-bottom: var(--section-gap-tight);
    }
    .cert-bottom {
      flex-shrink: 0;
      margin-top: 0;
    }

    /* Dos columnas: hueco superior para firmar, luego línea, luego cargo */
    .signatures {
      display: flex;
      flex-direction: row;
      align-items: flex-end;
      justify-content: space-between;
      gap: 2rem;
      flex-wrap: nowrap;
      max-width: 560px;
      margin: 0 auto;
      padding: 0 8px;
    }
    .signatures__col {
      flex: 1 1 0;
      min-width: 0;
      max-width: 240px;
      text-align: center;
      padding-top: 2rem;
    }
    .signatures__line {
      height: 1px;
      background: linear-gradient(90deg, transparent, #2c2c2c 12%, #2c2c2c 88%, transparent);
      margin-bottom: 0.5rem;
    }
    .signatures__label {
      margin: 0;
      font-size: 0.72rem;
      color: #4a5568;
      line-height: 1.3;
    }

    .brand {
      font-family: 'Cinzel', Georgia, serif;
      font-size: 0.62rem;
      letter-spacing: 0.2em;
      text-transform: uppercase;
      color: #5c6478;
      margin: 0;
      line-height: 1.5;
    }
    h1 {
      font-family: 'Cinzel', Georgia, serif;
      font-weight: 700;
      font-size: 1.45rem;
      letter-spacing: 0.05em;
      color: #141c2c;
      margin: 0;
      text-transform: uppercase;
      line-height: var(--lh-title);
    }
    .sub {
      font-size: 0.9rem;
      color: #4a5568;
      font-style: italic;
      margin: 0;
      line-height: 1.58;
    }
    .lead {
      font-size: 0.95rem;
      line-height: 1.65;
      margin: 0;
      color: #2d3748;
      text-align: center;
    }

    .rule--wide {
      width: 80%;
      max-width: 560px;
      height: 1px;
      margin-left: auto;
      margin-right: auto;
      background: linear-gradient(90deg, transparent, #c9a66a 15%, #c9a66a 85%, transparent);
      border: none;
    }
    .rule--wide--spaced {
      margin-top: var(--section-gap);
      margin-bottom: var(--section-gap-tight);
    }

    .name {
      font-family: 'Cinzel', Georgia, serif;
      font-weight: 700;
      font-size: 1.45rem;
      letter-spacing: 0.04em;
      color: #141c2c;
      margin: var(--name-margin-v) 0;
      padding: 0 12px var(--section-gap-tight);
      border-bottom: 1px solid rgba(201, 166, 106, 0.75);
      line-height: var(--lh-title);
    }
    .detail {
      margin: 0;
      font-size: 0.92rem;
      line-height: 1.62;
      color: #2d3748;
    }
    .detail strong { color: #1a202c; font-weight: 600; }
    .unidad { font-style: italic; color: #3d4a5c; }

    .stats {
      display: flex;
      justify-content: center;
      align-items: stretch;
      gap: var(--pill-gap);
      flex-wrap: wrap;
      margin: 0;
    }
    .pill {
      background: linear-gradient(180deg, #f7f2ea, #ebe4d8);
      border: 1px solid #d4c3a1;
      border-radius: 10px;
      padding: 12px 20px;
      font-size: 0.84rem;
      line-height: 1.5;
      box-shadow: inset 0 1px 0 rgba(255,255,255,0.75);
      min-width: 200px;
      max-width: 340px;
    }
    .pill span { color: #141c2c; font-weight: 700; font-size: 1rem; }

    .footer-date {
      font-size: 0.85rem;
      color: #5a6570;
      margin: 0;
      font-style: italic;
      line-height: 1.55;
    }

    .footer-brand {
      margin-top: var(--section-gap-tight);
      padding-top: var(--section-gap-tight);
      font-family: 'Cinzel', Georgia, serif;
      font-size: 0.78rem;
      font-weight: 600;
      letter-spacing: 0.16em;
      color: #4a5568;
      text-transform: uppercase;
    }
    .footer-brand small {
      display: block;
      margin-top: 0.4rem;
      letter-spacing: 0.05em;
      font-size: 0.68rem;
      color: #64748b;
      font-family: 'Crimson Text', Georgia, serif;
      text-transform: none;
      font-style: normal;
      font-weight: 400;
    }

    @media print {
      body { background: #fff; }
      html.certificado-root--print .sheet { padding: 0; min-height: auto; }
      html.certificado-root--print .cert { box-shadow: inset 0 0 0 1px #2a2a2a, none; }
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

      <div class="cert-emblema-wrap" aria-hidden="true">
        <img
          class="cert-emblema"
          src="${emblemaUrl}"
          alt=""
          width="132"
          height="132"
          onerror="this.closest('.cert-emblema-wrap')?.classList.add('cert-emblema--hidden')"
        />
      </div>

      <div class="cert-inner">
        <div class="cert-main">
          <p class="brand">Plataforma educativa · Ciencias Sociales</p>
          <h1>Certificado de progreso</h1>
          <p class="sub">6.º de Primaria - Unidad completada en ATENAS</p>

          <p class="lead">Se certifica que el alumno o alumna que se nombra ha alcanzado el progreso requerido en la unidad didáctica indicada.</p>

          <div class="rule--wide" aria-hidden="true"></div>

          <p class="name">${nombre}</p>

          <p class="detail"><strong>Unidad:</strong> <span class="unidad">${unidad}</span></p>

          <div class="stats">
            <div class="pill">Progreso en la unidad: <span>${pct}%</span></div>
            <div class="pill">Mínimo exigido: <span>${umbral}%</span></div>
          </div>

          <p class="footer-date">${fechaEsc}</p>
        </div>

        <div class="cert-bottom">
          <div class="signatures" role="group" aria-label="Espacios para firmas">
            <div class="signatures__col">
              <div class="signatures__line"></div>
              <p class="signatures__label">Docente de aula<br />Ciencias Sociales</p>
            </div>
            <div class="signatures__col">
              <div class="signatures__line"></div>
              <p class="signatures__label">Dirección académica<br />Plataforma educativa</p>
            </div>
          </div>

          <div class="rule--wide rule--wide--spaced" aria-hidden="true"></div>

          <div class="footer-brand">
            ATENAS
            <small>Aprendizaje de Ciencias Sociales</small>
          </div>
        </div>
      </div>
    </article>
  </div>
  ${autoPrint ? `<script>window.onload=function(){window.print();}</script>` : ''}
</body>
</html>`;
}
