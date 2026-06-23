/**
 * Certificado de logro académico — carta (letter) horizontal.
 * Emblema del colegio: `public/emblema-colegio-vaca-diez.png` (esquina superior derecha).
 * Rostro Atenea (solo certificado): `public/logo-certificado-atena.png` (barra lateral).
 */

import { getAppPathPrefix } from './deployBaseUrl';
import { formatTiempoCertificado } from './formatTiempo';
import {
  CERT_LETTER_H_IN,
  CERT_LETTER_H_PX,
  CERT_LETTER_W_IN,
  CERT_LETTER_W_PX,
} from './certificadoDimensions';

function resolvePublicAssetUrl(fileName: string): string {
  if (typeof window === 'undefined') return '';
  const base = import.meta.env.BASE_URL;
  if (base && base !== './') {
    const normalized = base.endsWith('/') ? base : `${base}/`;
    return new URL(fileName, window.location.origin + normalized).href;
  }
  const prefix = getAppPathPrefix();
  const path = prefix === '/' ? `/${fileName}` : `${prefix}/${fileName}`;
  return `${window.location.origin}${path}`;
}

export function resolveCertificadoEmblemaUrl(): string {
  return resolvePublicAssetUrl('emblema-colegio-vaca-diez.png');
}

export function resolveCertificadoAthenaFaceUrl(): string {
  return resolvePublicAssetUrl('logo-certificado-atena.png');
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
  athenaFaceUrl?: string;
  qrDataUrl?: string;
  certificadoId?: string;
  actividadesCompletadas?: number;
  actividadesTotal?: number;
  evaluacionesAprobadas?: number;
  evaluacionesTotal?: number;
  tiempoEstudioSegundos?: number;
};

export type CertificadoDocumentOptions = {
  autoPrint?: boolean;
  variant?: 'print' | 'pdf';
  includeToolbar?: boolean;
};

const VALUE_ICONS = {
  book: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>`,
  cap: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c0 1.5 2.7 3 6 3s6-1.5 6-3v-5"/></svg>`,
  chart: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><path d="M3 3v18h18"/><path d="M7 16l4-6 4 3 5-8"/></svg>`,
  star: `<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>`,
};

function valueRow(icon: string, label: string): string {
  return `<li class="cert-aside__value">
    <span class="cert-aside__value-icon">${icon}</span>
    <span class="cert-aside__value-text">${label}</span>
  </li>`;
}

function statCell(icon: string, label: string, value: string): string {
  return `<div class="cert-stat">
    <div class="cert-stat__icon">${icon}</div>
    <p class="cert-stat__label">${label}</p>
    <p class="cert-stat__value">${value}</p>
  </div>`;
}

function formatActividadesStat(done: number, total: number): string {
  if (total === 0) return '—';
  return `${done} / ${total}`;
}

function formatEvaluacionesStat(done: number, total: number): string {
  if (total === 0) return '—';
  return `${done} / ${total}`;
}

function formatTiempoStat(tiempoSeg: number): string {
  if (tiempoSeg <= 0) return '—';
  return formatTiempoCertificado(tiempoSeg);
}

function formatGradeCopy(pct: number, actTotal: number, evalTotal: number): string {
  if (actTotal > 0 && evalTotal > 0) {
    return `${pct}% de logro en actividades y evaluaciones de la unidad.`;
  }
  if (evalTotal > 0) {
    return `${pct}% de logro en evaluaciones de la unidad.`;
  }
  if (actTotal > 0) {
    return `${pct}% de logro en actividades de la unidad.`;
  }
  return `${pct}% de logro en la unidad.`;
}

/** Tres indicadores fijos + actividades opcional como cuarta tarjeta. */
function buildSummaryGridHtml(
  actDone: number,
  actTotal: number,
  evalDone: number,
  evalTotal: number,
  tiempoSeg: number,
  pct: number
): { html: string; cols: number } {
  const cells: string[] = [];
  if (actTotal > 0) {
    cells.push(
      statCell(
        VALUE_ICONS.book,
        'Actividades completadas',
        escapeHtml(formatActividadesStat(actDone, actTotal))
      )
    );
  }
  cells.push(
    statCell(
      VALUE_ICONS.cap,
      'Evaluaciones aprobadas',
      escapeHtml(formatEvaluacionesStat(evalDone, evalTotal))
    )
  );
  cells.push(
    statCell(VALUE_ICONS.chart, 'Tiempo dedicado', escapeHtml(formatTiempoStat(tiempoSeg)))
  );
  cells.push(statCell(VALUE_ICONS.star, 'Calificación final', `${pct}%`));
  return { html: cells.join(''), cols: cells.length };
}

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
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
  const fechaEsc = escapeHtml(fecha);

  const actDone = params.actividadesCompletadas ?? 0;
  const actTotal = params.actividadesTotal ?? 0;
  const evalDone = params.evaluacionesAprobadas ?? 0;
  const evalTotal = params.evaluacionesTotal ?? 0;
  const tiempoSeg = params.tiempoEstudioSegundos ?? 0;
  const summaryGrid = buildSummaryGridHtml(actDone, actTotal, evalDone, evalTotal, tiempoSeg, pct);
  const summaryGridClass =
    summaryGrid.cols === 4
      ? 'cert-summary__grid cert-summary__grid--4'
      : 'cert-summary__grid cert-summary__grid--3';
  const gradeCopy = escapeHtml(formatGradeCopy(pct, actTotal, evalTotal));

  const emblemaRaw = params.emblemaUrl ?? resolveCertificadoEmblemaUrl();
  const emblemaUrl = emblemaRaw.startsWith('data:') ? emblemaRaw : escapeHtml(emblemaRaw);

  const athenaRaw = params.athenaFaceUrl ?? resolveCertificadoAthenaFaceUrl();
  const athenaUrl = athenaRaw.startsWith('data:') ? athenaRaw : escapeHtml(athenaRaw);

  const qrBlock = params.qrDataUrl
    ? `<div class="cert-qr">
        <img class="cert-qr__img" src="${params.qrDataUrl}" alt="" width="56" height="56" />
      </div>`
    : '';

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
          <span class="cert-toolbar__hint">Apaisado · Sin márgenes · Escala 100% · PDF</span>
        </div>
      </div>`
    : '';

  const nombreRaw = params.nombreEstudiante.trim() || 'Estudiante';
  const nombreUpperOnly =
    /[A-Za-zÁÉÍÓÚÑáéíóúñ]/.test(nombreRaw) &&
    nombreRaw.replace(/[^A-Za-zÁÉÍÓÚÑáéíóúñ]/g, '') ===
      nombreRaw.replace(/[^A-Za-zÁÉÍÓÚÑáéíóúñ]/g, '').toUpperCase();
  const nombreClass = nombreUpperOnly ? 'cert-name cert-name--upper' : 'cert-name';

  return `<!DOCTYPE html>
<html lang="es" class="${rootClass}">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Certificado de logro · ATENAS</title>
  ${fontLink}
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    @page {
      size: 11in 8.5in landscape;
      margin: 0;
    }

    :root {
      --cert-paper: #fdfbf4;
      --cert-ink: #141c2c;
      --cert-sidebar: #1c2433;
      --cert-gold: #c9a66a;
      --cert-gold-light: #e8d5a8;
      --cert-muted: #5a6570;
      --cert-tan: #f5efe0;
    }

    html, body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }

    body {
      font-family: 'Crimson Text', Georgia, 'Times New Roman', serif;
      background: #e8e4dc;
      color: var(--cert-ink);
      line-height: 1.5;
    }

    html.certificado-root--pdf body {
      width: ${CERT_LETTER_W_PX}px;
      height: ${CERT_LETTER_H_PX}px;
      overflow: hidden;
      background: var(--cert-paper) !important;
      font-family: Georgia, 'Times New Roman', Times, serif !important;
    }

    html.certificado-root--print body {
      margin: 0;
      padding: 0;
      background: #e8e4dc;
    }
    html.certificado-root--print .sheet {
      width: ${CERT_LETTER_W_IN};
      height: ${CERT_LETTER_H_IN};
      min-height: ${CERT_LETTER_H_IN};
      max-height: ${CERT_LETTER_H_IN};
      margin: 0 auto;
      padding: 0;
      display: block;
    }
    html.certificado-root--print .cert {
      width: ${CERT_LETTER_W_IN};
      height: ${CERT_LETTER_H_IN};
      min-width: ${CERT_LETTER_W_IN};
      min-height: ${CERT_LETTER_H_IN};
      max-width: ${CERT_LETTER_W_IN};
      max-height: ${CERT_LETTER_H_IN};
      aspect-ratio: 11 / 8.5;
      flex-shrink: 0;
    }

    .cert-toolbar {
      display: flex; flex-wrap: wrap; align-items: center; justify-content: space-between;
      gap: 0.75rem; padding: 0.65rem 1rem; background: #323639; color: #f3f4f6;
      font-family: system-ui, sans-serif; font-size: 0.875rem;
    }
    .cert-toolbar__title { font-weight: 600; }
    .cert-toolbar__actions { display: flex; flex-wrap: wrap; align-items: center; gap: 0.75rem; }
    .cert-toolbar__btn {
      border: none; border-radius: 6px; padding: 0.45rem 1rem;
      background: rgba(255,255,255,0.12); color: #fff; font-size: 0.8125rem; font-weight: 600; cursor: pointer;
    }
    .cert-toolbar__btn:hover { background: rgba(255,255,255,0.2); }
    .cert-toolbar__hint { font-size: 0.75rem; color: rgba(255,255,255,0.65); }

    .cert {
      display: flex; flex-direction: row; position: relative; overflow: hidden;
      background: var(--cert-paper);
      border: 3px solid var(--cert-gold);
      box-shadow: inset 0 0 0 1px rgba(20,28,44,0.3), 0 8px 28px rgba(20,28,44,0.1);
      min-height: 0;
    }
    .cert::before {
      content: ''; position: absolute; inset: 9px;
      border: 1px solid rgba(201,166,106,0.5); pointer-events: none; z-index: 0;
    }
    .cert-corner {
      position: absolute; width: 28px; height: 28px; z-index: 2; pointer-events: none;
      border-color: var(--cert-gold); border-style: solid;
    }
    .cert-corner--tl { top: 14px; left: 14px; border-width: 2px 0 0 2px; }
    .cert-corner--tr { top: 14px; right: 14px; border-width: 2px 2px 0 0; }
    .cert-corner--bl { bottom: 14px; left: 14px; border-width: 0 0 2px 2px; }
    .cert-corner--br { bottom: 14px; right: 14px; border-width: 0 2px 2px 0; }

    .cert-aside {
      position: relative; z-index: 1; flex: 0 0 23%; min-width: 0;
      background: linear-gradient(170deg, #1a2230 0%, #252f42 50%, #1c2433 100%);
      color: #f8f6f0; display: flex; flex-direction: column; align-items: center;
      padding: 1.5rem 0.8rem 0.75rem; text-align: center;
      border-right: 2px solid var(--cert-gold);
    }
    .cert-aside__athena-wrap {
      width: 74px; height: 96px;
      margin-bottom: 0.4rem;
      background: transparent;
      flex-shrink: 0;
    }
    .cert-aside__athena {
      width: 100%; height: 100%; object-fit: contain; object-position: center center;
      display: block;
      background: transparent;
      filter: drop-shadow(0 2px 6px rgba(0,0,0,0.25));
    }
    .cert-aside__athena--hidden { display: none !important; }
    .cert-aside__brand {
      font-family: 'Cinzel', Georgia, serif; font-weight: 700;
      font-size: 1.28rem; letter-spacing: 0.2em; color: var(--cert-gold-light);
    }
    .cert-aside__tagline {
      font-size: 0.58rem; letter-spacing: 0.12em; text-transform: uppercase;
      color: rgba(248,246,240,0.72); margin-top: 0.35rem; line-height: 1.4;
    }
    .cert-aside__quote-icon {
      margin: 0.65rem 0 0.3rem; color: var(--cert-gold); opacity: 0.9;
    }
    .cert-aside__quote-icon svg { width: 22px; height: 22px; }
    .cert-aside__quote {
      font-size: 0.72rem; font-style: italic; color: rgba(232,213,168,0.88);
      line-height: 1.45; padding: 0 0.25rem;
    }
    .cert-aside__values {
      list-style: none; margin: 0.65rem 0 0; padding: 0; width: 100%;
      display: flex; flex-direction: column; gap: 0.4rem;
    }
    .cert-aside__value {
      display: flex; align-items: center; gap: 0.5rem; text-align: left;
    }
    .cert-aside__value-icon {
      flex-shrink: 0; width: 28px; height: 28px; border-radius: 50%;
      border: 1px solid rgba(201,166,106,0.55);
      display: flex; align-items: center; justify-content: center;
      color: var(--cert-gold-light);
    }
    .cert-aside__value-icon svg { width: 14px; height: 14px; }
    .cert-aside__value-text {
      font-size: 0.5rem; letter-spacing: 0.08em; text-transform: uppercase;
      color: rgba(248,246,240,0.78); line-height: 1.25;
    }
    .cert-aside__year {
      margin-top: auto; padding-top: 0.85rem;
      font-family: 'Cinzel', Georgia, serif; font-size: 0.82rem;
      letter-spacing: 0.18em; color: rgba(232,213,168,0.85);
    }
    .cert-aside__year-line {
      width: 36px; height: 2px; margin: 0.35rem auto 0;
      background: linear-gradient(90deg, transparent, var(--cert-gold), transparent);
    }

    .cert-main {
      position: relative; z-index: 1; flex: 1; min-width: 0; min-height: 0;
      display: flex;
      flex-direction: column;
      height: 100%;
      padding: 0.4rem 0.85rem 0.45rem 0.8rem;
      overflow: hidden;
    }

    .cert-emblema-wrap {
      position: absolute; top: 0.22rem; right: 0.32rem;
      width: 0.92in; height: 0.92in; z-index: 4; pointer-events: none;
    }
    .cert-emblema {
      display: block; width: 100%; height: 100%;
      object-fit: contain; object-position: center;
    }
    .cert-emblema-wrap.cert-emblema--hidden { display: none !important; }

    .cert-body {
      position: relative; z-index: 2;
      flex: 1 1 auto;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      width: 100%;
      min-height: 0;
      padding: 0 0.5rem 0.1rem;
    }

    .cert-bottom {
      position: relative; z-index: 2;
      flex: 0 0 auto;
      width: 100%;
      display: flex;
      flex-direction: column;
      gap: 0;
      padding-top: 0;
    }

    .cert-header {
      width: 100%;
      text-align: center;
      margin-bottom: 0.2rem;
      position: relative;
      padding: 0 1.05in 0 0;
    }

    .cert-platform-header {
      font-family: 'Cinzel', Georgia, serif; font-weight: 700;
      font-size: 0.82rem; letter-spacing: 0.14em; text-transform: uppercase;
      color: var(--cert-muted); margin-bottom: 0.2rem; line-height: 1.2;
    }

    .cert-stars { color: var(--cert-gold); font-size: 0.68rem; letter-spacing: 0.4em; margin-bottom: 0.15rem; }

    .cert-title {
      font-family: 'Cinzel', Georgia, serif; font-weight: 700;
      font-size: 1.15rem; letter-spacing: 0.06em; text-transform: uppercase;
      color: var(--cert-ink); line-height: 1.15; margin-bottom: 0.22rem;
    }
    .cert-subtitle {
      font-size: 0.82rem; font-style: italic; color: var(--cert-muted);
      margin-bottom: 0.45rem; line-height: 1.4;
      max-width: 88%;
      margin-left: auto;
      margin-right: auto;
    }

    .cert-name-block {
      width: 100%;
      max-width: 96%;
      margin: 0.35rem 0 0.28rem;
      padding: 0.3rem 0.4rem;
      text-align: center;
    }
    .cert-name-rule {
      height: 2px;
      background: linear-gradient(90deg, transparent, var(--cert-gold) 15%, var(--cert-gold) 85%, transparent);
      position: relative;
      max-width: 88%;
      margin: 0 auto;
    }
    .cert-name-rule::after {
      content: '◆'; position: absolute; left: 50%; top: 50%; transform: translate(-50%, -50%);
      font-size: 0.5rem; color: var(--cert-gold); background: var(--cert-paper); padding: 0 0.4rem;
    }
    .cert-name {
      font-family: 'Cinzel', Georgia, serif; font-weight: 700;
      font-size: 2.05rem; letter-spacing: 0.03em; color: var(--cert-ink);
      padding: 0.4rem 0.35rem; line-height: 1.15; text-align: center;
    }
    .cert-name--upper { text-transform: uppercase; letter-spacing: 0.06em; }

    .cert-unit {
      font-size: 0.74rem; color: #2d3748; margin-bottom: 0.35rem;
      text-align: center; width: 100%;
    }
    .cert-unit strong { font-weight: 600; color: var(--cert-ink); }
    .cert-unit em { font-style: italic; }

    .cert-grade-row {
      display: flex; align-items: center; justify-content: center;
      gap: 1rem; width: fit-content; max-width: 94%;
      margin: 0 auto 0.38rem;
    }
    .cert-grade-badge {
      flex-shrink: 0; width: 104px; height: 104px; border-radius: 50%;
      border: 3px solid var(--cert-gold);
      background: linear-gradient(145deg, #fffef9 0%, #f5efe0 100%);
      display: flex; flex-direction: column; align-items: center; justify-content: center;
      box-shadow: 0 3px 14px rgba(201,166,106,0.28);
    }
    .cert-grade-stars { font-size: 0.44rem; color: var(--cert-gold); letter-spacing: 0.06em; margin-bottom: 0.12rem; }
    .cert-grade-value {
      font-family: 'Cinzel', Georgia, serif; font-weight: 700;
      font-size: 1.5rem; line-height: 1; color: #1f2d2a;
    }
    .cert-grade-label {
      font-size: 0.4rem; text-transform: uppercase; letter-spacing: 0.05em;
      color: var(--cert-muted); font-weight: 600; margin-top: 0.12rem; text-align: center; line-height: 1.2;
      max-width: 5.5rem;
    }
    .cert-grade-text {
      flex: 0 1 auto; max-width: 15rem;
      font-size: 0.76rem; color: var(--cert-muted); line-height: 1.45;
      text-align: center;
    }
    .cert-grade-text strong { color: var(--cert-ink); }

    .cert-summary {
      width: 96%;
      border: 1px solid rgba(201,166,106,0.5); border-radius: 8px;
      background: linear-gradient(180deg, #faf6ee 0%, var(--cert-tan) 100%);
      padding: 0.5rem 0.55rem 0.55rem;
      box-shadow: 0 2px 8px rgba(20,28,44,0.05);
      margin-bottom: 0.4rem;
    }
    .cert-summary__title {
      font-family: 'Cinzel', Georgia, serif; font-size: 0.62rem; font-weight: 600;
      letter-spacing: 0.16em; text-transform: uppercase; color: var(--cert-ink);
      margin-bottom: 0.5rem; text-align: center;
    }
    .cert-summary__grid {
      display: grid; gap: 0.45rem;
    }
    .cert-summary__grid--3 { grid-template-columns: repeat(3, 1fr); }
    .cert-summary__grid--4 { grid-template-columns: repeat(4, 1fr); }
    .cert-stat {
      text-align: center;
      background: transparent;
      border: none;
      border-right: 1px solid rgba(201,166,106,0.35);
      border-radius: 0;
      padding: 0.35rem 0.3rem 0.25rem;
      box-shadow: none;
    }
    .cert-stat:last-child { border-right: none; }
    .cert-stat__icon {
      width: 32px; height: 32px; margin: 0 auto 0.28rem; border-radius: 50%;
      background: var(--cert-ink); color: var(--cert-gold-light);
      display: flex; align-items: center; justify-content: center;
    }
    .cert-stat__icon svg { width: 15px; height: 15px; }
    .cert-stat__label {
      font-size: 0.46rem; text-transform: uppercase; letter-spacing: 0.05em;
      color: var(--cert-muted); line-height: 1.25; margin-bottom: 0.15rem;
      min-height: 1.5em;
    }
    .cert-stat__value {
      font-family: 'Cinzel', Georgia, serif; font-size: 0.95rem; font-weight: 700; color: var(--cert-ink);
    }

    .cert-signatures {
      display: flex; justify-content: center; align-items: flex-end;
      gap: 4rem;
      width: 100%;
      max-width: 82%;
      margin: 0.85rem auto 0;
      padding: 0 0.5rem;
    }
    .cert-signatures__col {
      flex: 0 1 11rem; text-align: center; min-width: 0;
      padding-top: 2.75rem;
    }
    .cert-signatures__line {
      height: 1px;
      background: linear-gradient(90deg, transparent, #2c2c2c 12%, #2c2c2c 88%, transparent);
      margin-bottom: 0.35rem;
    }
    .cert-signatures__label {
      font-size: 0.58rem; color: var(--cert-muted); letter-spacing: 0.06em;
      text-transform: uppercase; font-weight: 600;
    }

    .cert-footer {
      width: 100%;
      padding: 0.22rem 0.2rem 0.28rem;
      border-top: 1px solid rgba(201,166,106,0.4);
      display: flex; align-items: center; justify-content: space-between; gap: 0.75rem;
    }
    .cert-date {
      font-size: 0.62rem; color: var(--cert-muted); display: flex; align-items: center; gap: 0.28rem;
      flex-shrink: 0;
    }
    .cert-date svg { width: 12px; height: 12px; flex-shrink: 0; opacity: 0.75; }

    .cert-qr { display: flex; align-items: center; justify-content: flex-end; flex-shrink: 0; }
    .cert-qr__img {
      width: 56px; height: 56px; border: 1px solid rgba(201,166,106,0.45);
      border-radius: 4px; background: #fff;
    }

    html.certificado-root--pdf .cert-aside__brand,
    html.certificado-root--pdf .cert-title,
    html.certificado-root--pdf .cert-name,
    html.certificado-root--pdf .cert-grade-value,
    html.certificado-root--pdf .cert-platform-header,
    html.certificado-root--pdf .cert-stat__value {
      font-family: Georgia, 'Times New Roman', Times, serif !important;
    }

    html.certificado-root--pdf {
      width: ${CERT_LETTER_W_PX}px;
      height: ${CERT_LETTER_H_PX}px;
      overflow: hidden;
    }
    html.certificado-root--pdf .sheet {
      width: ${CERT_LETTER_W_PX}px;
      height: ${CERT_LETTER_H_PX}px;
      overflow: hidden;
      display: block;
    }
    html.certificado-root--pdf .cert {
      width: ${CERT_LETTER_W_PX}px;
      height: ${CERT_LETTER_H_PX}px;
      max-width: ${CERT_LETTER_W_PX}px;
      max-height: ${CERT_LETTER_H_PX}px;
      overflow: hidden;
      box-shadow: none !important;
      border-width: 2px;
    }
    html.certificado-root--pdf .cert-main {
      padding: 5px 26px 5px 24px;
    }
    html.certificado-root--pdf .cert-body {
      justify-content: center;
      padding: 0 6px 2px;
      flex: 1 1 0;
      min-height: 0;
    }
    html.certificado-root--pdf .cert-emblema-wrap {
      top: 4px;
      right: 6px;
      width: 84px;
      height: 84px;
    }
    html.certificado-root--pdf .cert-header {
      padding-right: 96px;
      margin-bottom: 0.12rem;
    }
    html.certificado-root--pdf .cert-subtitle {
      font-size: 0.76rem;
      margin-bottom: 0.32rem;
    }
    html.certificado-root--pdf .cert-name {
      font-size: 1.82rem;
      padding: 0.28rem 0.25rem;
    }
    html.certificado-root--pdf .cert-name-block {
      margin: 0.22rem 0 0.18rem;
      padding: 0.22rem 0.28rem;
    }
    html.certificado-root--pdf .cert-grade-badge {
      width: 90px;
      height: 90px;
    }
    html.certificado-root--pdf .cert-grade-value {
      font-size: 1.35rem;
    }
    html.certificado-root--pdf .cert-summary {
      padding: 0.38rem 0.42rem 0.42rem;
      margin-bottom: 0.28rem;
    }
    html.certificado-root--pdf .cert-signatures {
      margin: 0.55rem auto 0;
    }
    html.certificado-root--pdf .cert-signatures__col {
      padding-top: 2.15rem;
    }
    html.certificado-root--pdf .cert-footer {
      padding: 5px 8px 4px;
    }
    html.certificado-root--pdf .cert-aside {
      padding: 18px 10px 8px;
    }
    html.certificado-root--pdf .cert-aside__athena {
      filter: none;
    }
    html.certificado-root--pdf .cert-aside__values {
      margin-top: 0.45rem;
      gap: 0.32rem;
    }
    html.certificado-root--pdf .cert-qr__img {
      width: 50px;
      height: 50px;
    }

    @media print {
      .no-print { display: none !important; }
      html, body {
        width: ${CERT_LETTER_W_IN} !important;
        height: ${CERT_LETTER_H_IN} !important;
        margin: 0 !important;
        padding: 0 !important;
        overflow: hidden !important;
        background: #fff !important;
      }
      html.certificado-root--print .sheet {
        width: ${CERT_LETTER_W_IN} !important;
        height: ${CERT_LETTER_H_IN} !important;
        min-height: ${CERT_LETTER_H_IN} !important;
        max-height: ${CERT_LETTER_H_IN} !important;
        margin: 0 !important;
        padding: 0 !important;
        overflow: hidden !important;
        display: block !important;
        page-break-before: avoid;
        page-break-after: avoid;
        page-break-inside: avoid;
        break-inside: avoid;
      }
      html.certificado-root--print .cert {
        width: ${CERT_LETTER_W_IN} !important;
        height: ${CERT_LETTER_H_IN} !important;
        min-width: ${CERT_LETTER_W_IN} !important;
        min-height: ${CERT_LETTER_H_IN} !important;
        max-width: ${CERT_LETTER_W_IN} !important;
        max-height: ${CERT_LETTER_H_IN} !important;
        overflow: hidden !important;
        aspect-ratio: auto;
        box-shadow: none !important;
        border-width: 2px;
        page-break-before: avoid;
        page-break-after: avoid;
        page-break-inside: avoid;
        break-inside: avoid;
        zoom: 0.93;
      }
      html.certificado-root--print .cert-main {
        padding: 0.32rem 0.72rem 0.38rem 0.68rem;
      }
      html.certificado-root--print .cert-name {
        font-size: 1.88rem;
        padding: 0.32rem 0.3rem;
      }
      html.certificado-root--print .cert-grade-badge {
        width: 94px;
        height: 94px;
      }
      html.certificado-root--print .cert-aside {
        padding: 1.25rem 0.7rem 0.6rem;
      }
      .cert-main, .cert-aside, .cert-body, .cert-bottom, .cert-footer {
        page-break-inside: avoid;
        break-inside: avoid;
      }
    }
  </style>
</head>
<body>
  ${toolbar}
  <div class="sheet">
    <article class="cert" aria-label="Certificado de logro académico">
      <span class="cert-corner cert-corner--tl" aria-hidden="true"></span>
      <span class="cert-corner cert-corner--tr" aria-hidden="true"></span>
      <span class="cert-corner cert-corner--bl" aria-hidden="true"></span>
      <span class="cert-corner cert-corner--br" aria-hidden="true"></span>

      <aside class="cert-aside" aria-hidden="true">
        <div class="cert-aside__athena-wrap">
          <img
            class="cert-aside__athena"
            src="${athenaUrl}"
            alt=""
            width="74"
            height="96"
            onerror="this.classList.add('cert-aside__athena--hidden')"
          />
        </div>
        <p class="cert-aside__brand">ATENAS</p>
        <p class="cert-aside__tagline">Ciencias Sociales<br />6.º Primaria</p>
        <div class="cert-aside__quote-icon">${VALUE_ICONS.book}</div>
        <p class="cert-aside__quote">“El conocimiento es el camino hacia el éxito.”</p>
        <ul class="cert-aside__values">
          ${valueRow(VALUE_ICONS.book, 'Aprendizaje significativo')}
          ${valueRow(VALUE_ICONS.cap, 'Compromiso')}
          ${valueRow(VALUE_ICONS.chart, 'Progreso')}
          ${valueRow(VALUE_ICONS.star, 'Excelencia')}
        </ul>
        <p class="cert-aside__year">${anio}<span class="cert-aside__year-line" aria-hidden="true"></span></p>
      </aside>

      <div class="cert-main">
        <div class="cert-emblema-wrap" aria-hidden="true">
          <img
            class="cert-emblema"
            src="${emblemaUrl}"
            alt=""
            width="88"
            height="88"
            onerror="this.closest('.cert-emblema-wrap')?.classList.add('cert-emblema--hidden')"
          />
        </div>

        <div class="cert-body">
          <div class="cert-header">
            <p class="cert-platform-header">Plataforma educativa ATENAS</p>
            <p class="cert-stars" aria-hidden="true">★ ★ ★</p>
            <h1 class="cert-title">Certificado de logro académico</h1>
            <p class="cert-subtitle">Otorgado por completar satisfactoriamente la unidad de aprendizaje.</p>
          </div>

          <div class="cert-name-block">
            <div class="cert-name-rule" aria-hidden="true"></div>
            <p class="${nombreClass}">${nombre}</p>
            <div class="cert-name-rule" aria-hidden="true"></div>
          </div>

          <p class="cert-unit"><strong>Unidad:</strong> <em>${unidad}</em></p>

          <div class="cert-grade-row" aria-label="Calificación obtenida">
            <div class="cert-grade-badge">
              <span class="cert-grade-stars">★★★★★</span>
              <span class="cert-grade-value">${pct}%</span>
              <span class="cert-grade-label">Excelencia académica</span>
            </div>
            <p class="cert-grade-text">
              <strong>Calificación obtenida:</strong> ${gradeCopy}
            </p>
          </div>

          <div class="cert-summary">
            <p class="cert-summary__title">Resumen de progreso</p>
            <div class="${summaryGridClass}">
              ${summaryGrid.html}
            </div>
          </div>

          <div class="cert-signatures" role="group" aria-label="Espacios para firmas">
            <div class="cert-signatures__col">
              <div class="cert-signatures__line" aria-hidden="true"></div>
              <p class="cert-signatures__label">Docente de aula</p>
            </div>
            <div class="cert-signatures__col">
              <div class="cert-signatures__line" aria-hidden="true"></div>
              <p class="cert-signatures__label">Director(a)</p>
            </div>
          </div>
        </div>

        <div class="cert-bottom">
          <footer class="cert-footer">
            <p class="cert-date">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/></svg>
              Fecha de emisión: ${fechaEsc}
            </p>
            ${qrBlock}
          </footer>
        </div>
      </div>
    </article>
  </div>
  ${autoPrint ? `<script>window.onload=function(){window.print();}</script>` : ''}
</body>
</html>`;
}
