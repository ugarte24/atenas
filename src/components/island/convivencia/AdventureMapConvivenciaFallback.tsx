type Props = { className?: string };

/**
 * Fallback SVG premium para Convivencia — mismo layout que world-1-island.svg / WebP.
 * Solo se usa si el asset WebP no carga.
 */
export function AdventureMapConvivenciaFallback({ className }: Props) {
  return (
    <svg viewBox="0 0 400 980" className={className} aria-hidden preserveAspectRatio="xMidYMid meet">
      <defs>
        <linearGradient id="cv-sky-fade" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#7dd3fc" stopOpacity="0" />
          <stop offset="100%" stopColor="#7dd3fc" stopOpacity="0" />
        </linearGradient>
        <linearGradient id="cv-ocean" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#38bdf8" />
          <stop offset="100%" stopColor="#0369a1" />
        </linearGradient>
        <linearGradient id="cv-grass" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#6ee7b7" />
          <stop offset="55%" stopColor="#22c55e" />
          <stop offset="100%" stopColor="#15803d" />
        </linearGradient>
        <linearGradient id="cv-grass-lit" x1="0.3" y1="0" x2="0.8" y2="1">
          <stop offset="0%" stopColor="#86efac" />
          <stop offset="100%" stopColor="#16a34a" />
        </linearGradient>
        <linearGradient id="cv-sand" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#fef08a" />
          <stop offset="100%" stopColor="#eab308" />
        </linearGradient>
        <linearGradient id="cv-lagoon" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#67e8f9" />
          <stop offset="100%" stopColor="#0891b2" />
        </linearGradient>
        <linearGradient id="cv-trail" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#d4b896" />
          <stop offset="100%" stopColor="#c4a574" />
        </linearGradient>
        <radialGradient id="cv-sunlit" cx="72%" cy="28%" r="55%">
          <stop offset="0%" stopColor="#fef9c3" stopOpacity="0.35" />
          <stop offset="100%" stopColor="#fef9c3" stopOpacity="0" />
        </radialGradient>
        <filter id="cv-sh" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="10" stdDeviation="8" floodColor="#002d62" floodOpacity="0.35" />
        </filter>
        <filter id="cv-soft" x="-10%" y="-10%" width="120%" height="120%">
          <feDropShadow dx="0" dy="4" stdDeviation="3" floodColor="#000" floodOpacity="0.25" />
        </filter>
        <filter id="cv-glow">
          <feGaussianBlur stdDeviation="5" result="b" />
          <feMerge>
            <feMergeNode in="b" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {/* Océano inferior */}
      <rect x="0" y="720" width="400" height="260" fill="url(#cv-ocean)" />
      <path
        d="M 0 748 Q 50 738 100 748 T 200 748 T 300 748 T 400 748 V 980 H 0 Z"
        fill="#0284c7"
        opacity="0.45"
      />
      <path
        d="M 0 788 Q 70 776 140 788 T 280 788 T 400 788"
        stroke="white"
        strokeWidth="2.5"
        fill="none"
        opacity="0.2"
      />

      <g filter="url(#cv-sh)">
        {/* Sombra en agua */}
        <ellipse cx="200" cy="758" rx="128" ry="18" fill="#002d62" opacity="0.22" />

        {/* Isla ~70% ancho (60–340) */}
        <path
          d="M 58 748 C 52 640 68 520 108 440 C 148 360 228 338 298 378 C 348 408 368 488 362 578 C 356 658 328 718 278 752 C 228 786 158 782 108 758 C 78 742 58 768 58 748 Z"
          fill="url(#cv-sand)"
          stroke="#ca8a04"
          strokeWidth="2.5"
        />
        <path
          d="M 72 735 C 68 630 82 520 118 448 C 158 378 232 358 292 394 C 338 420 356 498 350 582 C 344 652 318 708 272 738 C 226 768 162 764 118 742 C 92 728 72 748 72 735 Z"
          fill="url(#cv-grass)"
          stroke="#166534"
          strokeWidth="2"
        />

        {/* Iluminación solar sobre la isla */}
        <path
          d="M 72 735 C 68 630 82 520 118 448 C 158 378 232 358 292 394 C 338 420 356 498 350 582 C 344 652 318 708 272 738 C 226 768 162 764 118 742 C 92 728 72 748 72 735 Z"
          fill="url(#cv-sunlit)"
        />

        {/* Colinas con profundidad */}
        <ellipse cx="130" cy="470" rx="52" ry="24" fill="url(#cv-grass-lit)" opacity="0.75" />
        <ellipse cx="280" cy="455" rx="46" ry="20" fill="#16a34a" opacity="0.55" />
        <ellipse cx="200" cy="430" rx="62" ry="26" fill="#15803d" opacity="0.35" />

        {/* Laguna */}
        <ellipse cx="248" cy="565" rx="36" ry="16" fill="url(#cv-lagoon)" opacity="0.9" />
        <ellipse cx="248" cy="562" rx="24" ry="8" fill="#a5f3fc" opacity="0.5" />

        {/* Sendero integrado (parte del terreno) */}
        <path
          d="M 255 395 C 218 435 175 478 145 515 C 168 575 185 612 198 648 C 228 678 258 702 275 715"
          stroke="url(#cv-trail)"
          strokeWidth="20"
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
          opacity="0.92"
        />
        <path
          d="M 255 395 C 218 435 175 478 145 515 C 168 575 185 612 198 648 C 228 678 258 702 275 715"
          stroke="#a8845a"
          strokeWidth="3"
          fill="none"
          strokeLinecap="round"
          opacity="0.35"
        />

        {/* Huellas / piedras en el camino */}
        <ellipse cx="195" cy="455" rx="5" ry="3" fill="#8b6914" opacity="0.4" />
        <ellipse cx="168" cy="545" rx="4" ry="2.5" fill="#8b6914" opacity="0.35" />
        <ellipse cx="215" cy="625" rx="5" ry="3" fill="#8b6914" opacity="0.35" />

        {/* Chozas comunidad */}
        <Hut x={268} y={368} scale={1.05} />
        <Hut x={210} y={388} scale={0.9} />
        <Hut x={235} y={410} scale={0.78} />

        {/* Fogata */}
        <g transform="translate(132 502)" filter="url(#cv-glow)">
          <ellipse cx="0" cy="10" rx="16" ry="6" fill="#44403c" opacity="0.35" />
          <circle cx="0" cy="6" r="11" fill="#57534e" opacity="0.5" />
          <path d="M -8 6 L 0 -12 L 8 6 Z" fill="#ea580c" />
          <path d="M -4 4 L 0 -5 L 4 4 Z" fill="#fbbf24" />
        </g>

        {/* Palmeras */}
        <Palm x={318} y={610} s={1.15} />
        <Palm x={88} y={628} s={1} />
        <Palm x={305} y={480} s={0.85} />
        <Palm x={95} y={455} s={0.8} />
        <Palm x={330} y={540} s={0.72} />
        <Palm x={145} y={680} s={0.65} />

        {/* Flores y arbustos */}
        <Bush x={175} y={575} />
        <Bush x={290} y={590} />
        <Flower x={220} y={600} />
        <Flower x={185} y={620} color="#f472b6" />

        {/* Canoa */}
        <g transform="translate(78 718) rotate(-10)" filter="url(#cv-soft)">
          <ellipse cx="0" cy="0" rx="30" ry="9" fill="#78350f" />
          <ellipse cx="0" cy="-2" rx="26" ry="6" fill="#92400e" />
        </g>

        {/* Totem ATENAS */}
        <g transform="translate(305 355)" filter="url(#cv-soft)">
          <rect x="-3" y="0" width="6" height="42" fill="#78350f" />
          <circle cx="0" cy="-6" r="9" fill="#10b981" stroke="#047857" strokeWidth="1.5" />
          <path d="M -7 -6 L 0 -22 L 7 -6 Z" fill="#059669" />
        </g>

        {/* Portal decorativo (checkpoint visual) */}
        <g transform="translate(198 628)" opacity="0.85">
          <path
            d="M -32 42 L -32 0 Q -32 -26 0 -26 Q 32 -26 32 0 L 32 42 Z"
            fill="#44403c"
            stroke="#292524"
            strokeWidth="2"
          />
          <path
            d="M -22 42 L -22 8 Q -22 -14 0 -14 Q 22 -14 22 8 L 22 42 Z"
            fill="#166534"
            opacity="0.55"
          />
          <ellipse cx="0" cy="12" rx="16" ry="20" fill="#34d399" opacity="0.45" />
        </g>

        {/* Rocas */}
        <Rock x={168} y={655} />
        <Rock x={295} y={645} s={0.85} />
      </g>
    </svg>
  );
}

function Hut({ x, y, scale = 1 }: { x: number; y: number; scale?: number }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${scale})`} filter="url(#cv-soft)">
      <rect x="-15" y="5" width="30" height="18" rx="1" fill="#d6b88a" stroke="#92400e" strokeWidth="1" />
      <path d="M -19 7 L 0 -16 L 19 7 Z" fill="#c2410c" stroke="#7c2d12" strokeWidth="1" />
      <rect x="-5" y="12" width="10" height="11" fill="#44403c" rx="1" />
      <rect x="-3" y="14" width="6" height="8" fill="#292524" opacity="0.5" />
    </g>
  );
}

function Palm({ x, y, s = 1 }: { x: number; y: number; s?: number }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <ellipse cx="0" cy="22" rx="8" ry="3" fill="#000" opacity="0.15" />
      <rect x="-2.5" y="0" width="5" height="26" rx="1" fill="#78350f" />
      <path d="M 0 0 Q -18 8 -15 20 Q -8 10 0 0" fill="#166534" />
      <path d="M 0 0 Q 18 8 15 20 Q 8 10 0 0" fill="#15803d" />
      <path d="M 0 0 Q -4 -18 0 -24 Q 4 -18 0 0" fill="#22c55e" />
      <path d="M 0 0 Q -12 -10 -9 -16 Q -5 -8 0 0" fill="#16a34a" />
    </g>
  );
}

function Bush({ x, y }: { x: number; y: number }) {
  return (
    <g transform={`translate(${x} ${y})`}>
      <ellipse cx="0" cy="0" rx="12" ry="8" fill="#15803d" opacity="0.8" />
      <ellipse cx="-8" cy="3" rx="8" ry="6" fill="#166534" opacity="0.7" />
    </g>
  );
}

function Flower({ x, y, color = '#fbbf24' }: { x: number; y: number; color?: string }) {
  return (
    <g transform={`translate(${x} ${y})`}>
      <circle cx="0" cy="0" r="4" fill={color} />
      <circle cx="-3" cy="-2" r="3" fill={color} opacity="0.85" />
      <circle cx="3" cy="-2" r="3" fill={color} opacity="0.85" />
    </g>
  );
}

function Rock({ x, y, s = 1 }: { x: number; y: number; s?: number }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <ellipse cx="0" cy="5" rx="11" ry="4" fill="#000" opacity="0.12" />
      <path d="M -11 7 L -7 -5 L 5 -7 L 11 3 L 7 9 Z" fill="#78716c" stroke="#57534e" strokeWidth="0.8" />
    </g>
  );
}
