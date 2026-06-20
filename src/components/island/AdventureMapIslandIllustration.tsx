import type { WorldId } from '../../lib/adventureMapTypes';

type Props = { worldId: WorldId; className?: string };

export function AdventureMapIslandIllustration({ worldId, className }: Props) {
  if (worldId === 1) return <WorldOne className={className} />;
  if (worldId === 2) return <WorldTwo className={className} />;
  return <WorldThree className={className} />;
}

/** Mundo 1 — Convivencia: isla tropical comunitaria */
function WorldOne({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 400 980" className={className} aria-hidden>
      <defs>
        <linearGradient id="w1-ocean" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#0ea5e9" />
          <stop offset="100%" stopColor="#0369a1" />
        </linearGradient>
        <linearGradient id="w1-grass" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#4ade80" />
          <stop offset="100%" stopColor="#15803d" />
        </linearGradient>
        <linearGradient id="w1-sand" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#fef08a" />
          <stop offset="100%" stopColor="#eab308" />
        </linearGradient>
        <linearGradient id="w1-lagoon" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#67e8f9" />
          <stop offset="100%" stopColor="#0891b2" />
        </linearGradient>
        <filter id="w1-sh">
          <feDropShadow dx="0" dy="6" stdDeviation="5" floodColor="#002d62" floodOpacity="0.3" />
        </filter>
        <filter id="w1-glow">
          <feGaussianBlur stdDeviation="4" result="b" />
          <feMerge>
            <feMergeNode in="b" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {/* Mar */}
      <rect x="0" y="680" width="400" height="300" fill="url(#w1-ocean)" />
      <path
        d="M 0 720 Q 50 710 100 720 T 200 720 T 300 720 T 400 720 L 400 980 L 0 980 Z"
        fill="#0284c7"
        opacity="0.5"
      />
      <path
        d="M 0 760 Q 60 748 120 760 T 240 760 T 360 760 T 400 760"
        stroke="white"
        strokeWidth="2"
        fill="none"
        opacity="0.25"
      />

      <g filter="url(#w1-sh)">
        {/* Sombra isla en el agua */}
        <ellipse cx="200" cy="720" rx="175" ry="22" fill="#002d62" opacity="0.2" />

        {/* Playa / borde isla */}
        <path
          d="M 12 680 C 20 580 60 480 120 420 C 180 360 260 350 320 400 C 370 440 395 520 388 620 C 382 680 340 730 280 760 C 220 790 140 790 80 760 C 40 740 12 710 12 680 Z"
          fill="url(#w1-sand)"
          stroke="#ca8a04"
          strokeWidth="2"
        />

        {/* Tierra principal */}
        <path
          d="M 28 660 C 35 560 72 470 130 420 C 188 370 268 365 318 410 C 358 445 375 530 368 610 C 362 660 328 700 268 720 C 208 740 128 735 78 710 C 48 695 28 675 28 660 Z"
          fill="url(#w1-grass)"
          stroke="#166534"
          strokeWidth="2"
        />

        {/* Colinas */}
        <ellipse cx="110" cy="480" rx="55" ry="22" fill="#22c55e" opacity="0.6" />
        <ellipse cx="290" cy="460" rx="48" ry="20" fill="#16a34a" opacity="0.55" />
        <ellipse cx="200" cy="440" rx="70" ry="26" fill="#15803d" opacity="0.4" />

        {/* Laguna */}
        <ellipse cx="250" cy="560" rx="38" ry="18" fill="url(#w1-lagoon)" opacity="0.85" />
        <ellipse cx="250" cy="558" rx="28" ry="10" fill="#a5f3fc" opacity="0.4" />

        {/* Chozas */}
        <Hut x={255} y={370} />
        <Hut x={195} y={395} scale={0.85} />

        {/* Fogata */}
        <g transform="translate(130 505)">
          <circle cx="0" cy="8" r="14" fill="#44403c" opacity="0.3" />
          <ellipse cx="0" cy="4" rx="10" ry="4" fill="#57534e" />
          <path d="M -6 4 L 0 -8 L 6 4 Z" fill="#ea580c" filter="url(#w1-glow)" />
          <path d="M -3 2 L 0 -4 L 3 2 Z" fill="#fbbf24" />
        </g>

        {/* Palmeras */}
        <Palm x={340} y={620} scale={1.1} />
        <Palm x={55} y={640} scale={0.95} />
        <Palm x={320} y={480} scale={0.8} />
        <Palm x={90} y={450} scale={0.75} />
        <Palm x={360} y={540} scale={0.7} />

        {/* Canoa */}
        <g transform="translate(60 700) rotate(-8)">
          <ellipse cx="0" cy="0" rx="28" ry="8" fill="#92400e" />
          <ellipse cx="0" cy="-2" rx="24" ry="5" fill="#b45309" />
        </g>

        {/* Flores y rocas */}
        <Flower x={170} y={580} />
        <Flower x={220} y={600} color="#f472b6" />
        <Flower x={310} y={550} />
        <Rock x={175} y={640} />
        <Rock x={285} y={630} scale={0.8} />

        {/* Totem / bandera */}
        <g transform="translate(310 380)">
          <rect x="-3" y="0" width="6" height="40" fill="#78350f" />
          <circle cx="0" cy="-5" r="8" fill="#10b981" stroke="#047857" strokeWidth="1" />
          <path d="M -6 -5 L 0 -18 L 6 -5 Z" fill="#059669" />
        </g>

        {/* Portal sur (checkpoint decorativo) */}
        <g transform="translate(200 655)" opacity="0.9">
          <path d="M -35 45 L -35 0 Q -35 -30 0 -30 Q 35 -30 35 0 L 35 45 Z" fill="#57534e" stroke="#44403c" strokeWidth="2" />
          <path d="M -25 45 L -25 5 Q -25 -18 0 -18 Q 25 -18 25 5 L 25 45 Z" fill="#166534" opacity="0.6" />
          <ellipse cx="0" cy="10" rx="18" ry="22" fill="#34d399" opacity="0.5" />
        </g>
      </g>
    </svg>
  );
}

/** Mundo 2 — Territorio: valle con montaña, río y aldea */
function WorldTwo({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 400 980" className={className} aria-hidden>
      <defs>
        <linearGradient id="w2-ocean" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#38bdf8" />
          <stop offset="100%" stopColor="#0369a1" />
        </linearGradient>
        <linearGradient id="w2-grass" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#86efac" />
          <stop offset="100%" stopColor="#16a34a" />
        </linearGradient>
        <linearGradient id="w2-rock" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#94a3b8" />
          <stop offset="100%" stopColor="#475569" />
        </linearGradient>
        <linearGradient id="w2-river" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#7dd3fc" />
          <stop offset="100%" stopColor="#0284c7" />
        </linearGradient>
        <filter id="w2-sh">
          <feDropShadow dx="0" dy="6" stdDeviation="5" floodColor="#002d62" floodOpacity="0.3" />
        </filter>
      </defs>

      <rect x="0" y="680" width="400" height="300" fill="url(#w2-ocean)" />

      <g filter="url(#w2-sh)">
        <ellipse cx="200" cy="718" rx="178" ry="24" fill="#002d62" opacity="0.18" />

        <path
          d="M 8 670 C 15 560 55 450 115 390 C 175 330 265 325 325 375 C 375 415 398 510 390 610 C 384 670 345 715 275 745 C 205 775 115 770 65 740 C 30 718 8 690 8 670 Z"
          fill="#fde68a"
          stroke="#ca8a04"
          strokeWidth="2"
        />
        <path
          d="M 22 655 C 28 550 62 460 118 410 C 174 360 258 358 312 400 C 352 432 368 520 362 600 C 356 655 322 695 262 715 C 202 735 122 730 75 705 C 45 688 22 668 22 655 Z"
          fill="url(#w2-grass)"
          stroke="#15803d"
          strokeWidth="2"
        />

        {/* Montaña */}
        <path
          d="M 240 420 L 310 280 L 360 380 L 340 450 L 260 460 Z"
          fill="url(#w2-rock)"
          stroke="#64748b"
          strokeWidth="1.5"
        />
        <path d="M 268 380 L 310 300 L 330 360 Z" fill="#e2e8f0" opacity="0.7" />

        {/* Río */}
        <path
          d="M 200 380 Q 185 450 195 520 Q 205 580 190 640 Q 180 690 200 730"
          stroke="url(#w2-river)"
          strokeWidth="18"
          fill="none"
          strokeLinecap="round"
          opacity="0.85"
        />
        <path
          d="M 200 380 Q 185 450 195 520 Q 205 580 190 640 Q 180 690 200 730"
          stroke="#bae6fd"
          strokeWidth="4"
          fill="none"
          opacity="0.4"
        />

        {/* Puente */}
        <g transform="translate(125 175)">
          <rect x="-22" y="-4" width="44" height="8" rx="2" fill="#92400e" />
          <rect x="-20" y="4" width="6" height="18" fill="#78350f" />
          <rect x="14" y="4" width="6" height="18" fill="#78350f" />
        </g>

        {/* Aldea */}
        <AdobeHouse x={270} y={310} />
        <AdobeHouse x={230} y={335} scale={0.85} />
        <AdobeHouse x={300} y={350} scale={0.75} />

        {/* Molino */}
        <g transform="translate(135 490)">
          <rect x="-12" y="0" width="24" height="28" fill="#d6d3d1" stroke="#78716c" strokeWidth="1" />
          <path d="M -14 0 L 0 -16 L 14 0 Z" fill="#a8a29e" />
          <line x1="0" y1="-8" x2="0" y2="-22" stroke="#57534e" strokeWidth="2" />
          <path d="M 0 -22 L 8 -14 L 0 -6 L -8 -14 Z" fill="#94a3b8" />
        </g>

        {/* Torre vigilancia */}
        <g transform="translate(320 400)">
          <rect x="-8" y="0" width="16" height="35" fill="#78716c" />
          <rect x="-10" y="-8" width="20" height="10" fill="#57534e" />
        </g>

        {/* Estela mapa */}
        <g transform="translate(200 635)">
          <rect x="-18" y="0" width="36" height="50" rx="4" fill="#57534e" />
          <path d="M -10 10 L 10 10 L 8 30 L -8 30 Z" fill="#38bdf8" opacity="0.6" />
        </g>

        {/* Árboles */}
        <Pine x={70} y={520} />
        <Pine x={350} y={500} scale={0.9} />
        <Pine x={95} y={420} scale={0.8} />
        <Pine x={340} y={580} scale={0.85} />

        {/* Campos */}
        <rect x="160" y="540" width="40" height="25" fill="#ca8a04" opacity="0.35" rx="2" />
        <rect x="210" y="555" width="35" height="20" fill="#ca8a04" opacity="0.3" rx="2" />

        {/* Puerta checkpoint */}
        <g transform="translate(200 635)">
          <path d="M -40 50 L -40 0 L 40 0 L 40 50 Z" fill="#44403c" stroke="#292524" strokeWidth="2" />
          <path d="M -28 50 L -28 8 L 28 8 L 28 50 Z" fill="#0284c7" opacity="0.45" />
        </g>
      </g>
    </svg>
  );
}

/** Mundo 3 — Historia: ruinas costeras al atardecer */
function WorldThree({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 400 980" className={className} aria-hidden>
      <defs>
        <linearGradient id="w3-ocean" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#f97316" />
          <stop offset="100%" stopColor="#7c2d12" />
        </linearGradient>
        <linearGradient id="w3-grass" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#fde68a" />
          <stop offset="100%" stopColor="#b45309" />
        </linearGradient>
        <linearGradient id="w3-cliff" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#d97706" />
          <stop offset="100%" stopColor="#92400e" />
        </linearGradient>
        <filter id="w3-sh">
          <feDropShadow dx="0" dy="6" stdDeviation="5" floodColor="#451a03" floodOpacity="0.35" />
        </filter>
        <filter id="w3-beacon">
          <feGaussianBlur stdDeviation="6" result="b" />
          <feMerge>
            <feMergeNode in="b" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      <rect x="0" y="680" width="400" height="300" fill="url(#w3-ocean)" opacity="0.9" />

      <g filter="url(#w3-sh)">
        <ellipse cx="200" cy="715" rx="170" ry="20" fill="#451a03" opacity="0.25" />

        {/* Acantilado */}
        <path
          d="M 0 680 L 30 520 L 80 480 L 150 450 L 250 440 L 320 470 L 380 520 L 400 580 L 400 680 Z"
          fill="url(#w3-cliff)"
          stroke="#78350f"
          strokeWidth="2"
        />
        <path
          d="M 20 660 C 40 580 80 510 140 470 C 200 430 280 425 340 460 C 370 480 385 530 380 580 C 375 630 340 665 280 680 C 220 695 140 690 90 670 C 55 655 20 675 20 660 Z"
          fill="url(#w3-grass)"
          stroke="#92400e"
          strokeWidth="2"
        />

        {/* Ruinas */}
        <g transform="translate(250 300)">
          <rect x="-25" y="0" width="12" height="40" fill="#d6d3d1" />
          <rect x="-5" y="10" width="10" height="30" fill="#e7e5e4" />
          <rect x="10" y="0" width="14" height="35" fill="#d6d3d1" />
          <path d="M -30 0 L 0 -20 L 30 0 Z" fill="none" stroke="#a8a29e" strokeWidth="2" />
        </g>
        <g transform="translate(160 320)">
          <rect x="-20" y="5" width="40" height="8" fill="#a8a29e" />
          <rect x="-15" y="-15" width="8" height="20" fill="#d6d3d1" />
          <rect x="8" y="-10" width="8" height="15" fill="#d6d3d1" />
        </g>

        {/* Faro */}
        <g transform="translate(310 380)">
          <rect x="-10" y="0" width="20" height="55" fill="#f5f5f4" stroke="#78716c" strokeWidth="1.5" />
          <rect x="-8" y="45" width="16" height="12" fill="#d6d3d1" />
          <path d="M -12 0 L 0 -14 L 12 0 Z" fill="#ef4444" />
          <circle cx="0" cy="-4" r="5" fill="#fef08a" filter="url(#w3-beacon)" />
        </g>

        {/* Rocas ámbar */}
        <Rock x={90} y={400} color="#d97706" scale={1.2} />
        <Rock x={340} y={520} color="#b45309" />
        <Rock x={180} y={580} color="#92400e" scale={0.9} />

        {/* Vegetación seca */}
        <DryBush x={120} y={450} />
        <DryBush x={200} y={480} />
        <DryBush x={280} y={550} scale={0.85} />
        <Palm x={60} y={620} scale={0.7} />

        {/* Cofre final (decorativo) */}
        <g transform="translate(200 505) scale(0.9)">
          <IsometricChest closed />
        </g>
      </g>
    </svg>
  );
}

function Palm({ x, y, scale = 1 }: { x: number; y: number; scale?: number }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${scale})`}>
      <rect x="-2.5" y="0" width="5" height="24" rx="1" fill="#78350f" />
      <path d="M 0 0 Q -16 6 -14 18 Q -7 9 0 0" fill="#166534" />
      <path d="M 0 0 Q 16 6 14 18 Q 7 9 0 0" fill="#15803d" />
      <path d="M 0 0 Q -3 -16 0 -22 Q 3 -16 0 0" fill="#22c55e" />
      <path d="M 0 0 Q -10 -8 -8 -14 Q -4 -6 0 0" fill="#16a34a" />
    </g>
  );
}

function Pine({ x, y, scale = 1 }: { x: number; y: number; scale?: number }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${scale})`}>
      <rect x="-2" y="8" width="4" height="14" fill="#78350f" />
      <path d="M 0 -8 L -14 10 L 14 10 Z" fill="#15803d" />
      <path d="M 0 -2 L -11 12 L 11 12 Z" fill="#16a34a" />
    </g>
  );
}

function Hut({ x, y, scale = 1 }: { x: number; y: number; scale?: number }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${scale})`}>
      <rect x="-14" y="4" width="28" height="16" rx="1" fill="#d6b88a" stroke="#92400e" strokeWidth="1" />
      <path d="M -18 6 L 0 -14 L 18 6 Z" fill="#c2410c" stroke="#7c2d12" strokeWidth="1" />
      <rect x="-4" y="10" width="8" height="10" fill="#44403c" rx="1" />
    </g>
  );
}

function AdobeHouse({ x, y, scale = 1 }: { x: number; y: number; scale?: number }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${scale})`}>
      <rect x="-12" y="0" width="24" height="18" fill="#d6b88a" stroke="#92400e" strokeWidth="1" />
      <path d="M -14 2 L 0 -10 L 14 2 Z" fill="#a8a29e" />
      <rect x="-4" y="8" width="8" height="10" fill="#57534e" rx="1" />
    </g>
  );
}

function Flower({ x, y, color = '#fbbf24' }: { x: number; y: number; color?: string }) {
  return (
    <g transform={`translate(${x} ${y})`}>
      <circle cx="0" cy="0" r="4" fill={color} />
      <circle cx="-3" cy="-2" r="3" fill={color} opacity="0.8" />
      <circle cx="3" cy="-2" r="3" fill={color} opacity="0.8" />
    </g>
  );
}

function Rock({ x, y, scale = 1, color = '#78716c' }: { x: number; y: number; scale?: number; color?: string }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${scale})`}>
      <ellipse cx="0" cy="4" rx="12" ry="5" fill="#44403c" opacity="0.2" />
      <path d="M -10 6 L -6 -4 L 4 -6 L 10 2 L 6 8 Z" fill={color} stroke="#57534e" strokeWidth="0.8" />
    </g>
  );
}

function DryBush({ x, y, scale = 1 }: { x: number; y: number; scale?: number }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${scale})`}>
      <ellipse cx="0" cy="0" rx="10" ry="6" fill="#ca8a04" opacity="0.7" />
      <ellipse cx="-6" cy="2" rx="6" ry="4" fill="#a16207" opacity="0.6" />
    </g>
  );
}

export function IsometricChest({ closed = true }: { closed?: boolean }) {
  return (
    <g>
      <ellipse cx="0" cy="14" rx="18" ry="5" fill="#000" opacity="0.2" />
      <path d="M -20 4 L 0 -8 L 20 4 L 20 14 L -20 14 Z" fill="#92400e" stroke="#78350f" strokeWidth="1" />
      <path d="M -20 4 L 0 -8 L 20 4 L 0 16 Z" fill="#b45309" />
      {!closed && (
        <path d="M -20 4 L 0 -8 L 20 4 L 20 -2 L 0 -18 L -20 -2 Z" fill="#d97706" stroke="#92400e" strokeWidth="1" />
      )}
      {closed && <path d="M -20 4 L 0 -8 L 20 4 L 0 10 Z" fill="#d97706" stroke="#92400e" strokeWidth="1" />}
      <rect x="-20" y="8" width="40" height="4" fill="#ca8a04" />
      <rect x="-3" y="2" width="6" height="8" rx="1" fill="#fbbf24" stroke="#b45309" strokeWidth="0.8" />
    </g>
  );
}

export function IsometricPortal({ locked }: { locked: boolean }) {
  return (
    <g>
      <ellipse cx="0" cy="38" rx="28" ry="6" fill="#000" opacity="0.2" />
      <path d="M -32 40 L -32 0 Q -32 -28 0 -28 Q 32 -28 32 0 L 32 40 Z" fill="#57534e" stroke="#44403c" strokeWidth="2" />
      <path d="M -22 40 L -22 6 Q -22 -16 0 -16 Q 22 -16 22 6 L 22 40 Z" fill={locked ? '#64748b' : '#34d399'} opacity={locked ? 0.5 : 0.65} />
      {!locked && (
        <ellipse cx="0" cy="14" rx="14" ry="18" fill="#6ee7b7" opacity="0.5">
          <animate attributeName="opacity" values="0.35;0.65;0.35" dur="2.5s" repeatCount="indefinite" />
        </ellipse>
      )}
      <rect x="-4" y="-8" width="8" height="10" rx="1" fill={locked ? '#94a3b8' : '#fbbf24'} />
    </g>
  );
}
