/**
 * Certificado de progreso — carta (letter) horizontal.
 * Emblema del colegio: `public/emblema-colegio-vaca-diez.png` (esquina superior derecha; no modificar).
 */

import { getAppPathPrefix } from './deployBaseUrl';

export function resolveCertificadoEmblemaUrl(): string {
  if (typeof window === 'undefined') return '';
  const base = import.meta.env.BASE_URL;
  if (base && base !== './') {
    const normalized = base.endsWith('/') ? base : `${base}/`;
    return new URL('emblema-colegio-vaca-diez.png', window.location.origin + normalized).href;
  }
  const prefix = getAppPathPrefix();
  const path =
    prefix === '/' ? '/emblema-colegio-vaca-diez.png' : `${prefix}/emblema-colegio-vaca-diez.png`;
  return `${window.location.origin}${path}`;
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
  emblemaUrl?: string;
};

export type CertificadoDocumentOptions = {
  autoPrint?: boolean;
  variant?: 'print' | 'pdf';
  /** Barra Imprimir en ventana emergente (no se imprime) */
  includeToolbar?: boolean;
};

export function buildCertificadoPrintDocument(
  params: CertificadoParams,
  options: CertificadoDocumentOptions = {}
): string {
  const variant = options.variant ?? 'print';
  const autoPrint = options.autoPrint !== false && variant === 'print';
  const includeToolbar = options.includeToolbar === true && variant === 'print';

  const nombre = escapeHtml(params.nombreEstudiante.trim() || 'Estudiante');
  const unidad = escapeHtml(params.tituloUnidad.trim() || 'Unidad');
  const pct = Math.round(params.porcentajeUnidad);
  const anio = new Date().getFullYear();
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
  <link href="https://fonts.googleapis.com/css2?family=Cinzel:wght@500;600;700&family=Crimson+Text:ital,wght@0,400;0,600;1,400&display=swap" rel="stylesheet" />`
      : '';

  const toolbar = includeToolbar
    ? `<div class="cert-toolbar no-print" role="toolbar" aria-label="Acciones del certificado">
        <span class="cert-toolbar__title">Certificado · ATENAS</span>
        <div class="cert-toolbar__actions">
          <button type="button" class="cert-toolbar__btn" onclick="window.print()">Imprimir</button>
          <span class="cert-toolbar__hint">Para PDF: Imprimir → Guardar como PDF</span>
        </div>
      </div>`
    : '';

  return `<!DOCTYPE html>
<html lang="es" class="${rootClass}">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Certificado de progreso · ATENAS</title>
  ${fontLink}
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    @page { size: letter landscape; margin: 0.25in; }

    :root {
      --cert-paper: #fdfbf4;
      --cert-ink: #141c2c;
      --cert-sidebar: #1c2433;
      --cert-gold: #c9a66a;
      --cert-gold-light: #e8d5a8;
      --cert-muted: #5a6570;
    }

    html, body {
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }

    body {
      font-family: 'Crimson Text', Georgia, 'Times New Roman', serif;
      background: #e8e4dc;
      color: var(--cert-ink);
      line-height: 1.55;
    }

    html.certificado-root--pdf body {
      width: 1056px;
      height: 816px;
      overflow: hidden;
      background: var(--cert-paper) !important;
      font-family: Georgia, 'Times New Roman', Times, serif !important;
    }

    html.certificado-root--print .sheet {
      min-height: 100vh;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 0.5rem;
    }

    html.certificado-root--print .cert {
      width: 100%;
      max-width: 1056px;
      aspect-ratio: 11 / 8.5;
    }

    html.certificado-root--pdf .sheet {
      width: 100%;
      height: 100%;
      display: flex;
      align-items: stretch;
      justify-content: center;
    }

    html.certificado-root--pdf .cert {
      width: 100%;
      height: 100%;
    }

    .cert-toolbar {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      justify-content: space-between;
      gap: 0.75rem;
      padding: 0.65rem 1rem;
      background: #323639;
      color: #f3f4f6;
      font-family: system-ui, sans-serif;
      font-size: 0.875rem;
    }
    .cert-toolbar__title { font-weight: 600; }
    .cert-toolbar__actions {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      gap: 0.75rem;
    }
    .cert-toolbar__btn {
      border: none;
      border-radius: 6px;
      padding: 0.45rem 1rem;
      background: rgba(255,255,255,0.12);
      color: #fff;
      font-size: 0.8125rem;
      font-weight: 600;
      cursor: pointer;
    }
    .cert-toolbar__btn:hover { background: rgba(255,255,255,0.2); }
    .cert-toolbar__hint {
      font-size: 0.75rem;
      color: rgba(255,255,255,0.65);
    }

    .cert {
      display: flex;
      flex-direction: row;
      position: relative;
      overflow: hidden;
      background: var(--cert-paper);
      border: 3px solid var(--cert-gold);
      box-shadow:
        inset 0 0 0 1px rgba(20, 28, 44, 0.35),
        0 8px 32px rgba(20, 28, 44, 0.12);
    }

    .cert::before {
      content: '';
      position: absolute;
      inset: 10px;
      border: 1px solid rgba(201, 166, 106, 0.45);
      pointer-events: none;
      z-index: 0;
    }

    .cert-aside {
      position: relative;
      z-index: 1;
      flex: 0 0 24%;
      min-width: 0;
      background: linear-gradient(165deg, #1c2433 0%, #252f42 48%, #1a2230 100%);
      color: #f8f6f0;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 2rem 1.25rem;
      text-align: center;
      border-right: 2px solid var(--cert-gold);
    }

    .cert-aside__ornament {
      width: 48px;
      height: 2px;
      background: linear-gradient(90deg, transparent, var(--cert-gold), transparent);
      margin: 0.75rem 0;
    }

    .cert-aside__brand {
      font-family: 'Cinzel', Georgia, serif;
      font-weight: 700;
      font-size: 1.35rem;
      letter-spacing: 0.22em;
      color: var(--cert-gold-light);
      line-height: 1.2;
    }

    .cert-aside__tagline {
      font-size: 0.62rem;
      letter-spacing: 0.14em;
      text-transform: uppercase;
      color: rgba(248, 246, 240, 0.72);
      margin-top: 0.5rem;
      line-height: 1.45;
    }

    .cert-aside__year {
      margin-top: auto;
      padding-top: 1.5rem;
      font-family: 'Cinzel', Georgia, serif;
      font-size: 0.85rem;
      letter-spacing: 0.2em;
      color: rgba(232, 213, 168, 0.85);
    }

    .cert-main {
      position: relative;
      z-index: 1;
      flex: 1;
      min-width: 0;
      display: flex;
      flex-direction: column;
      padding: 2.25rem 2.5rem 2rem 2.25rem;
    }

    .cert-emblema-wrap {
      position: absolute;
      top: 1.35rem;
      right: 1.5rem;
      width: 118px;
      height: 118px;
      z-index: 10;
      pointer-events: none;
      border-radius: 4px;
      overflow: hidden;
      background: transparent;
      box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
    }
    .cert-emblema {
      display: block;
      width: 100%;
      height: 100%;
      object-fit: contain;
      object-position: center;
      background: transparent;
    }
    .cert-emblema--hidden { display: none !important; }

    html.certificado-root--pdf .cert-emblema-wrap {
      top: 22px;
      right: 26px;
      width: 100px;
      height: 100px;
    }

    .cert-content {
      flex: 1;
      display: flex;
      flex-direction: column;
      justify-content: center;
      padding-right: 7.5rem;
      max-width: 100%;
    }

    .cert-kicker {
      font-size: 0.68rem;
      font-weight: 600;
      letter-spacing: 0.18em;
      text-transform: uppercase;
      color: var(--cert-muted);
      margin-bottom: 0.35rem;
    }

    .cert-title {
      font-family: 'Cinzel', Georgia, serif;
      font-weight: 700;
      font-size: 1.55rem;
      letter-spacing: 0.06em;
      text-transform: uppercase;
      color: var(--cert-ink);
      line-height: 1.25;
      margin-bottom: 0.35rem;
    }

    .cert-subtitle {
      font-size: 0.88rem;
      font-style: italic;
      color: var(--cert-muted);
      margin-bottom: 1.25rem;
    }

    .cert-lead {
      font-size: 0.92rem;
      color: #2d3748;
      max-width: 36rem;
      margin-bottom: 1rem;
      line-height: 1.6;
    }

    .cert-rule {
      width: 72%;
      max-width: 420px;
      height: 2px;
      margin: 0.75rem 0 1.1rem;
      background: linear-gradient(90deg, var(--cert-gold) 0%, var(--cert-gold-light) 50%, transparent 100%);
      border: none;
    }

    .cert-name {
      font-family: 'Cinzel', Georgia, serif;
      font-weight: 700;
      font-size: 1.65rem;
      letter-spacing: 0.03em;
      color: var(--cert-ink);
      margin: 0.5rem 0 0.85rem;
      padding-bottom: 0.65rem;
      border-bottom: 1px solid rgba(201, 166, 106, 0.65);
      line-height: 1.3;
    }

    .cert-unit {
      font-size: 0.95rem;
      color: #2d3748;
      margin-bottom: 1.1rem;
      line-height: 1.55;
    }
    .cert-unit strong { font-weight: 600; color: var(--cert-ink); }
    .cert-unit em { font-style: italic; color: #3d4a5c; }

    .cert-grade-row {
      display: flex;
      align-items: center;
      gap: 1.25rem;
      flex-wrap: wrap;
      margin-bottom: 0.75rem;
    }

    .cert-grade-badge {
      flex-shrink: 0;
      width: 88px;
      height: 88px;
      border-radius: 50%;
      border: 3px solid var(--cert-gold);
      background: linear-gradient(145deg, #fffef9 0%, #f5efe0 100%);
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      box-shadow: 0 2px 12px rgba(201, 166, 106, 0.25);
    }

    .cert-grade-value {
      font-family: 'Cinzel', Georgia, serif;
      font-weight: 700;
      font-size: 1.65rem;
      line-height: 1;
      color: #1f2d2a;
    }

    .cert-grade-label {
      font-size: 0.62rem;
      text-transform: uppercase;
      letter-spacing: 0.1em;
      color: var(--cert-muted);
      font-weight: 600;
      margin-top: 0.15rem;
    }

    .cert-grade-text {
      font-size: 0.88rem;
      color: var(--cert-muted);
      line-height: 1.5;
    }
    .cert-grade-text strong { color: var(--cert-ink); }

    .cert-date {
      font-size: 0.82rem;
      font-style: italic;
      color: var(--cert-muted);
      margin-top: 0.25rem;
    }

    .cert-footer {
      margin-top: auto;
      padding-top: 1rem;
      border-top: 1px solid rgba(201, 166, 106, 0.35);
    }

    .signatures {
      display: flex;
      justify-content: space-between;
      gap: 2rem;
      max-width: 480px;
      margin: 0 0 0.85rem;
    }
    .signatures__col {
      flex: 1;
      text-align: center;
      padding-top: 1.75rem;
      min-width: 0;
    }
    .signatures__line {
      height: 1px;
      background: linear-gradient(90deg, transparent, #2c2c2c 15%, #2c2c2c 85%, transparent);
      margin-bottom: 0.4rem;
    }
    .signatures__label {
      font-size: 0.68rem;
      color: var(--cert-muted);
      letter-spacing: 0.04em;
    }

    .cert-platform {
      font-family: 'Cinzel', Georgia, serif;
      font-size: 0.72rem;
      font-weight: 600;
      letter-spacing: 0.14em;
      text-transform: uppercase;
      color: #64748b;
    }
    .cert-platform small {
      display: block;
      margin-top: 0.2rem;
      font-family: 'Crimson Text', Georgia, serif;
      font-size: 0.65rem;
      font-weight: 400;
      text-transform: none;
      letter-spacing: 0.02em;
    }

    html.certificado-root--pdf .cert-aside__brand,
    html.certificado-root--pdf .cert-title,
    html.certificado-root--pdf .cert-name,
    html.certificado-root--pdf .cert-grade-value,
    html.certificado-root--pdf .cert-platform {
      font-family: Georgia, 'Times New Roman', Times, serif !important;
    }
    html.certificado-root--pdf .cert-title { font-size: 1.38rem; }
    html.certificado-root--pdf .cert-name { font-size: 1.42rem; }
    html.certificado-root--pdf .cert-main { padding: 1.75rem 2rem 1.5rem 1.75rem; }
    html.certificado-root--pdf .cert-content { padding-right: 6.5rem; }
    html.certificado-root--pdf .cert-grade-badge { width: 80px; height: 80px; }
    html.certificado-root--pdf .cert-grade-value { font-size: 1.45rem; }

    @media print {
      .no-print { display: none !important; }
      body { background: #fff !important; }
      html.certificado-root--print .sheet { padding: 0; min-height: auto; }
      .cert { box-shadow: inset 0 0 0 1px rgba(20,28,44,0.35); }
    }
  </style>
</head>
<body>
  ${toolbar}
  <div class="sheet">
    <article class="cert" aria-label="Certificado de progreso">
      <aside class="cert-aside" aria-hidden="true">
        <div class="cert-aside__ornament"></div>
        <p class="cert-aside__brand">ATENAS</p>
        <p class="cert-aside__tagline">Ciencias Sociales<br />6.º Primaria</p>
        <div class="cert-aside__ornament"></div>
        <p class="cert-aside__year">${anio}</p>
      </aside>

      <div class="cert-main">
        <div class="cert-emblema-wrap" aria-hidden="true">
          <img
            class="cert-emblema"
            src="${emblemaUrl}"
            alt=""
            width="118"
            height="118"
            onerror="this.closest('.cert-emblema-wrap')?.classList.add('cert-emblema--hidden')"
          />
        </div>

        <div class="cert-content">
          <p class="cert-kicker">Plataforma educativa</p>
          <h1 class="cert-title">Certificado de progreso</h1>
          <p class="cert-subtitle">Unidad didáctica completada con éxito</p>

          <p class="cert-lead">Se otorga el presente certificado al estudiante que se nombra, por haber alcanzado el progreso requerido en la unidad indicada.</p>

          <div class="cert-rule" aria-hidden="true"></div>

          <p class="cert-name">${nombre}</p>

          <p class="cert-unit">
            <strong>Unidad:</strong> <em>${unidad}</em>
          </p>

          <div class="cert-grade-row" aria-label="Calificación obtenida">
            <div class="cert-grade-badge">
              <span class="cert-grade-value">${pct}%</span>
              <span class="cert-grade-label">Nota</span>
            </div>
            <p class="cert-grade-text">
              <strong>Calificación obtenida</strong> en actividades y evaluaciones de la unidad.
            </p>
          </div>

          <p class="cert-date">${fechaEsc}</p>
        </div>

        <footer class="cert-footer">
          <div class="signatures" role="group" aria-label="Espacios para firmas">
            <div class="signatures__col">
              <div class="signatures__line"></div>
              <p class="signatures__label">Docente de aula</p>
            </div>
            <div class="signatures__col">
              <div class="signatures__line"></div>
              <p class="signatures__label">Director(a)</p>
            </div>
          </div>
          <p class="cert-platform">
            ATENAS
            <small>Aprendizaje de Ciencias Sociales</small>
          </p>
        </footer>
      </div>
    </article>
  </div>
  ${autoPrint ? `<script>window.onload=function(){window.print();}</script>` : ''}
</body>
</html>`;
}
