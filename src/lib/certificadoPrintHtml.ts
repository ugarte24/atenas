/**
 * HTML/CSS para certificado de progreso.
 * Tamaño de página: carta (letter) apaisado.
 * Variante `print`: ventana para imprimir / vista previa.
 * Variante `pdf`: dimensiones fijas para captura y generación de PDF.
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
  /* data:image/... no debe pasar por escapeHtml (rompe el atributo src) */
  const escudoUrl =
    escudoRaw.startsWith('data:') ? escudoRaw : escapeHtml(escudoRaw);

  const rootClass =
    variant === 'pdf'
      ? 'certificado-root certificado-root--pdf'
      : 'certificado-root certificado-root--print';

  return `<!DOCTYPE html>
<html lang="es" class="${rootClass}">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Certificado de progreso · ATENAS</title>
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link href="https://fonts.googleapis.com/css2?family=Cinzel:wght@600;700&family=Crimson+Text:ital,wght@0,400;0,600;1,400&display=swap" rel="stylesheet" />
  <style>
    * { box-sizing: border-box; }
    /* Carta horizontal: 11" × 8.5" */
    @page { size: letter landscape; margin: 0.28in; }
    html, body { margin: 0; }
    body {
      font-family: 'Crimson Text', Georgia, 'Times New Roman', serif;
      background: linear-gradient(165deg, #f8f6f1 0%, #efe9df 45%, #e8e2d6 100%);
      color: #1a1f1c;
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }

    /* Vista impresión / ventana */
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

    /* Captura PDF: lienzo fijo proporcional a carta horizontal (96 CSS px/in ≈ 1056×816) */
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
    html.certificado-root--pdf .escudo-nombre { font-size: 0.55rem; max-width: 9.5rem; }
    html.certificado-root--pdf .escudo-lugar { font-size: 0.62rem; }
    html.certificado-root--pdf .escudo-en-esquina {
      width: 64px;
      height: 64px;
      top: 10px;
      right: 12px;
    }
    html.certificado-root--pdf h1 { font-size: 1.05rem; margin-bottom: 0.1rem; }
    html.certificado-root--pdf .sub { font-size: 0.78rem; margin-bottom: 0.35rem; }
    html.certificado-root--pdf .brand { font-size: 0.55rem; margin-bottom: 0.1rem; }
    html.certificado-root--pdf .lead { font-size: 0.82rem; margin-bottom: 0.35rem; line-height: 1.35; }
    html.certificado-root--pdf .name { font-size: 1.1rem; margin-bottom: 0.35rem; padding-bottom: 0.3rem; font-variant: normal; text-transform: none; }
    html.certificado-root--pdf .detail { font-size: 0.8rem; margin: 0.25rem 0; }
    html.certificado-root--pdf .stats { margin: 0.35rem 0 0.3rem; gap: 0.5rem; }
    html.certificado-root--pdf .pill { font-size: 0.72rem; padding: 0.25rem 0.55rem; }
    html.certificado-root--pdf .pill span { font-size: 0.88rem; }
    html.certificado-root--pdf .footer-date { font-size: 0.72rem; margin-top: 0.2rem; }
    html.certificado-root--pdf .footer-brand { margin-top: 0.35rem; padding-top: 0.3rem; font-size: 0.62rem; }
    html.certificado-root--pdf .footer-brand small { font-size: 0.55rem; }
    html.certificado-root--pdf .rule { margin-bottom: 0.35rem; }
    html.certificado-root--pdf .corner { width: 28px; height: 28px; }

    /*
     * PDF (html2canvas): CSS Grid con minmax(0,1fr) suele colapsar la columna de texto
     * y amontonar letras. Forzamos flex + anchos en px para la variante --pdf.
     */
    html.certificado-root--pdf .cert {
      display: flex !important;
      flex-direction: row;
      flex-wrap: nowrap;
      align-items: stretch;
      justify-content: flex-start;
      gap: 12px;
      grid-template-columns: unset !important;
      max-width: none;
      width: 100%;
      height: 100%;
      padding: 0.65rem 0.85rem 0.55rem;
      box-sizing: border-box;
    }
    html.certificado-root--pdf .col-escudo {
      flex: 0 0 132px;
      width: 132px;
      min-width: 132px;
      max-width: 132px;
    }
    html.certificado-root--pdf .col-main {
      flex: 0 0 auto;
      width: 812px;
      min-width: 812px;
      max-width: 812px;
      min-height: 0;
      padding-right: 5.25rem;
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
      width: 100%;
      max-width: 100%;
      box-sizing: border-box;
    }
    html.certificado-root--pdf .stats {
      width: 100%;
      justify-content: center;
    }
    html.certificado-root--pdf .pill {
      flex: 1 1 auto;
      min-width: 120px;
      max-width: 360px;
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
      display: grid;
      grid-template-columns: minmax(108px, 150px) minmax(0, 1fr);
      gap: 0.85rem 1.25rem;
      align-items: stretch;
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

    .col-escudo {
      position: relative;
      z-index: 2;
      display: flex;
      flex-direction: column;
      align-items: flex-start;
      text-align: left;
      padding: 0.15rem 0.4rem 0.15rem 0;
      border-right: 1px solid rgba(201, 166, 106, 0.55);
    }
    .escudo-nombre {
      font-family: 'Cinzel', Georgia, serif;
      font-size: 0.58rem;
      font-weight: 700;
      line-height: 1.3;
      letter-spacing: 0.03em;
      color: #1a2b44;
      text-transform: uppercase;
      margin: 0 0 0.15rem;
      max-width: 10rem;
    }
    .escudo-lugar {
      font-size: 0.68rem;
      color: #1a2b44;
      margin: 0;
      font-weight: 600;
      letter-spacing: 0.1em;
      text-transform: uppercase;
    }

    /* Escudo del colegio (PNG en public/) — esquina superior derecha */
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
        alt="Escudo del Colegio Particular Dr. Antonio Vaca Diez"
        width="82"
        height="82"
        onerror="this.classList.add('escudo-en-esquina--hidden')"
      />

      <aside class="col-escudo">
        <p class="escudo-nombre">Colegio Particular Dr. Antonio Vaca Diez</p>
        <p class="escudo-lugar">Riberalta</p>
      </aside>

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
