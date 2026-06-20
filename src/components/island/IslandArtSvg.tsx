import type { WorldId } from '../../lib/adventureMapTypes';

type Props = { islaId: WorldId; className?: string };

/** Islas SVG isométricas con estilo unificado (sin fondo blanco) */
export function IslandArtSvg({ islaId, className }: Props) {
  if (islaId === 1) return <IslandOne className={className} />;
  if (islaId === 2) return <IslandTwo className={className} />;
  return <IslandThree className={className} />;
}

function IslandOne({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 320 260" className={className} aria-hidden>
      <defs>
        <linearGradient id="i1-grass" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#6ee7b7" />
          <stop offset="100%" stopColor="#059669" />
        </linearGradient>
        <linearGradient id="i1-sand" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#fef9c3" />
          <stop offset="100%" stopColor="#fbbf24" />
        </linearGradient>
        <filter id="i1-sh">
          <feDropShadow dx="0" dy="8" stdDeviation="6" floodColor="#002d62" floodOpacity="0.25" />
        </filter>
      </defs>
      <g filter="url(#i1-sh)">
        <ellipse cx="160" cy="228" rx="118" ry="16" fill="#002d62" opacity="0.12" />
        <path
          d="M 38 178 C 28 148 52 118 92 108 C 132 98 178 108 210 132 C 242 156 238 192 204 212 C 168 232 118 228 82 212 C 52 198 38 178 38 178 Z"
          fill="url(#i1-sand)"
          stroke="#eab308"
          strokeWidth="3"
        />
        <path
          d="M 48 172 C 40 148 58 124 94 116 C 130 108 170 116 198 136 C 224 156 220 186 192 202 C 160 218 118 214 88 198 C 62 184 48 172 48 172 Z"
          fill="url(#i1-grass)"
          stroke="#047857"
          strokeWidth="3"
        />
        <ellipse cx="120" cy="158" rx="42" ry="18" fill="#16a34a" opacity="0.55" />
        <ellipse cx="178" cy="148" rx="34" ry="15" fill="#15803d" opacity="0.5" />
        <Palm x={210} y={188} />
        <Palm x={88} y={192} scale={0.85} />
        <g transform="translate(145 168)">
          <rect x="-11" y="4" width="22" height="14" rx="1" fill="#d6b88a" stroke="#92400e" strokeWidth="1" />
          <path d="M -14 6 L 0 -12 L 14 6 Z" fill="#c2410c" stroke="#7c2d12" strokeWidth="1" />
        </g>
        <Flag x={198} y={118} color="#10b981" />
      </g>
    </svg>
  );
}

function IslandTwo({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 320 260" className={className} aria-hidden>
      <defs>
        <linearGradient id="i2-grass" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#bbf7d0" />
          <stop offset="100%" stopColor="#16a34a" />
        </linearGradient>
        <linearGradient id="i2-sand" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#fef9c3" />
          <stop offset="100%" stopColor="#fbbf24" />
        </linearGradient>
        <linearGradient id="i2-rock" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#78716c" />
          <stop offset="100%" stopColor="#57534e" />
        </linearGradient>
        <filter id="i2-sh">
          <feDropShadow dx="0" dy="8" stdDeviation="6" floodColor="#002d62" floodOpacity="0.25" />
        </filter>
      </defs>
      <g filter="url(#i2-sh)">
        <ellipse cx="160" cy="228" rx="118" ry="16" fill="#002d62" opacity="0.12" />
        <path
          d="M 36 180 C 26 150 50 120 90 110 C 130 100 176 110 208 134 C 240 158 236 194 202 214 C 166 234 116 230 80 214 C 50 200 36 180 36 180 Z"
          fill="url(#i2-sand)"
          stroke="#eab308"
          strokeWidth="3"
        />
        <path
          d="M 46 174 C 38 150 56 126 92 118 C 128 110 168 118 196 138 C 222 158 218 188 190 204 C 158 220 116 216 86 200 C 60 186 46 174 46 174 Z"
          fill="url(#i2-grass)"
          stroke="#15803d"
          strokeWidth="3"
        />
        <ellipse cx="108" cy="142" rx="36" ry="22" fill="url(#i2-rock)" opacity="0.85" />
        <ellipse cx="128" cy="132" rx="22" ry="14" fill="#86efac" opacity="0.7" />
        <path
          d="M 148 168 Q 160 178 172 168 Q 168 182 160 188 Q 152 182 148 168 Z"
          fill="#38bdf8"
          stroke="#0284c7"
          strokeWidth="1.5"
          opacity="0.85"
        />
        <path d="M 155 188 L 165 188 L 163 200 L 157 200 Z" fill="#38bdf8" opacity="0.6" />
        <Tree x={200} y={178} />
        <Tree x={78} y={182} scale={0.9} />
        <g transform="translate(175 158)">
          <rect x="-8" y="0" width="16" height="10" fill="#a8a29e" stroke="#57534e" strokeWidth="0.8" />
          <path d="M -10 2 L 0 -8 L 10 2 Z" fill="#78716c" />
        </g>
        <Flag x={205} y={112} color="#0ea5e9" />
      </g>
    </svg>
  );
}

function IslandThree({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 320 260" className={className} aria-hidden>
      <defs>
        <linearGradient id="i3-grass" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#fde68a" />
          <stop offset="100%" stopColor="#d97706" />
        </linearGradient>
        <linearGradient id="i3-sand" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#fef3c7" />
          <stop offset="100%" stopColor="#f59e0b" />
        </linearGradient>
        <filter id="i3-sh">
          <feDropShadow dx="0" dy="8" stdDeviation="6" floodColor="#002d62" floodOpacity="0.25" />
        </filter>
      </defs>
      <g filter="url(#i3-sh)">
        <ellipse cx="160" cy="228" rx="118" ry="16" fill="#002d62" opacity="0.12" />
        <path
          d="M 38 178 C 28 148 52 118 92 108 C 132 98 178 108 210 132 C 242 156 238 192 204 212 C 168 232 118 228 82 212 C 52 198 38 178 38 178 Z"
          fill="url(#i3-sand)"
          stroke="#d97706"
          strokeWidth="3"
        />
        <path
          d="M 48 172 C 40 148 58 124 94 116 C 130 108 170 116 198 136 C 224 156 220 186 192 202 C 160 218 118 214 88 198 C 62 184 48 172 48 172 Z"
          fill="url(#i3-grass)"
          stroke="#b45309"
          strokeWidth="3"
        />
        <ellipse cx="115" cy="152" rx="28" ry="14" fill="#92400e" opacity="0.45" />
        <ellipse cx="185" cy="145" rx="32" ry="16" fill="#b45309" opacity="0.4" />
        <g transform="translate(168 148)">
          <rect x="-4" y="0" width="8" height="22" fill="#e7e5e4" stroke="#78716c" strokeWidth="0.8" />
          <rect x="-3" y="18" width="6" height="6" fill="#d6d3d1" />
          <path d="M -6 0 L 0 -10 L 6 0 Z" fill="#fbbf24" />
          <circle cx="0" cy="-2" r="3" fill="#fef08a" opacity="0.9" />
        </g>
        <g transform="translate(108 162)">
          <rect x="-3" y="0" width="6" height="14" fill="#d6d3d1" />
          <rect x="-2" y="-10" width="4" height="10" fill="#d6d3d1" />
        </g>
        <Palm x={215} y={190} />
        <Flag x={200} y={118} color="#f59e0b" />
      </g>
    </svg>
  );
}

function Palm({ x, y, scale = 1 }: { x: number; y: number; scale?: number }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${scale})`}>
      <rect x="-2" y="0" width="4" height="20" rx="1" fill="#78350f" />
      <path d="M 0 0 Q -14 5 -12 14 Q -6 7 0 0" fill="#166534" />
      <path d="M 0 0 Q 14 5 12 14 Q 6 7 0 0" fill="#15803d" />
      <path d="M 0 0 Q -2 -14 0 -18 Q 2 -14 0 0" fill="#22c55e" />
    </g>
  );
}

function Tree({ x, y, scale = 1 }: { x: number; y: number; scale?: number }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${scale})`}>
      <rect x="-2" y="6" width="4" height="12" rx="1" fill="#78350f" />
      <circle cx="0" cy="0" r="12" fill="#15803d" />
      <circle cx="-4" cy="4" r="8" fill="#16a34a" />
      <circle cx="5" cy="3" r="7" fill="#166534" />
    </g>
  );
}

function Flag({ x, y, color }: { x: number; y: number; color: string }) {
  return (
    <g transform={`translate(${x} ${y})`}>
      <line x1="0" y1="0" x2="0" y2="24" stroke="#475569" strokeWidth="2" />
      <path d="M 0 0 L 16 6 L 0 12 Z" fill={color} stroke="white" strokeWidth="0.8" />
    </g>
  );
}
