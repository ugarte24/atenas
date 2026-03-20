import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuthContext } from '../contexts/AuthContext';

function IconEnvelope({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
    >
      <path
        d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function IconLock({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
    >
      {/* Candado: arco + cuerpo */}
      <path
        d="M7 11V7a5 5 0 0 1 10 0v4"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <rect
        x="4.5"
        y="10.5"
        width="15"
        height="11"
        rx="2"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/** Textura pantalla: moteado tipo pizarra/cuero (sin feColorMatrix → sin static RGB) */
const LOGIN_BG_SLATE = `url("data:image/svg+xml,${encodeURIComponent(
  `<svg viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg"><defs><filter id="b" x="-10%" y="-10%" width="120%" height="120%" color-interpolation-filters="sRGB"><feTurbulence type="fractalNoise" baseFrequency="0.026 0.034" numOctaves="4" seed="13" stitchTiles="stitch" result="t"/><feGaussianBlur in="t" stdDeviation="1.05"/></filter></defs><rect width="100%" height="100%" filter="url(#b)" opacity="0.58"/></svg>`
)}")`;

const LOGIN_BG_FINE = `url("data:image/svg+xml,${encodeURIComponent(
  `<svg viewBox="0 0 256 256" xmlns="http://www.w3.org/2000/svg"><defs><filter id="f" x="-10%" y="-10%" width="120%" height="120%" color-interpolation-filters="sRGB"><feTurbulence type="fractalNoise" baseFrequency="0.58" numOctaves="2" seed="29" stitchTiles="stitch" result="t"/><feGaussianBlur in="t" stdDeviation="0.38"/></filter></defs><rect width="100%" height="100%" filter="url(#f)" opacity="0.3"/></svg>`
)}")`;

/** Grano muy sutil en la tarjeta (pergamino) */
const CARD_GRAIN = `url("data:image/svg+xml,${encodeURIComponent(
  `<svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg"><filter id="g"><feTurbulence type="fractalNoise" baseFrequency="0.75" numOctaves="2" stitchTiles="stitch"/></filter><rect width="100%" height="100%" filter="url(#g)" opacity="0.045"/></svg>`
)}")`;

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { signIn } = useAuthContext();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const redirectTo = searchParams.get('redirect') ?? '/';

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await signIn(email, password);
      navigate(redirectTo, { replace: true });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : '';
      setError(
        msg.includes('Invalid') || msg.includes('credentials')
          ? 'Correo o contraseña incorrectos. Intenta de nuevo.'
          : msg || 'No se pudo entrar. Revisa tu conexión e inténtalo de nuevo.'
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-[100dvh] flex flex-col items-center px-4 pt-8 pb-10 sm:pt-10 sm:pb-14 relative overflow-x-hidden overflow-y-auto isolate font-login">
      {/* Capa 1: color base + degradado radial (esquina superior izquierda) */}
      <div
        className="pointer-events-none absolute inset-0 z-0"
        style={{
          backgroundColor: '#1F2D2A',
          backgroundImage:
            'radial-gradient(ellipse 155% 135% at 24% 14%, #2F423D 0%, #2a3d38 18%, #253933 36%, #21332f 54%, #1c2e2b 72%, #1a2b28 86%, #1F2D2A 100%)',
        }}
        aria-hidden
      />
      {/* Capa 2–3: textura orgánica (luminosity) + grano fino (muy suave) */}
      <div
        className="pointer-events-none absolute inset-0 z-0 mix-blend-luminosity opacity-[0.42]"
        style={{
          backgroundImage: LOGIN_BG_SLATE,
          backgroundRepeat: 'no-repeat',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
        aria-hidden
      />
      <div
        className="pointer-events-none absolute inset-0 z-0 mix-blend-soft-light opacity-[0.07]"
        style={{
          backgroundImage: LOGIN_BG_FINE,
          backgroundRepeat: 'no-repeat',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
        aria-hidden
      />
      {/* Capa 4: viñeta — centro un poco más claro, bordes hacia negro */}
      <div
        className="pointer-events-none absolute inset-0 z-0"
        style={{
          background:
            'radial-gradient(ellipse 128% 118% at 50% 46%, transparent 26%, rgba(0, 0, 0, 0.28) 62%, rgba(0, 0, 0, 0.68) 100%)',
        }}
        aria-hidden
      />

      <div className="relative z-10 w-full max-w-md flex flex-col items-center">
        {/* Marca sobre el fondo oscuro (como mockup) */}
        <div className="flex flex-col items-center text-center mb-5">
          <div
            className="w-[7.25rem] h-[7.25rem] rounded-full bg-[#0a0e0c] border-[2.5px] border-[#c9a66a] flex items-center justify-center overflow-hidden shadow-[0_12px_40px_rgba(0,0,0,0.55),0_0_20px_rgba(201,166,106,0.2)]"
            title="Logo ATENAS"
          >
            <img
              src="/logo-athena.png"
              alt=""
              className="h-full w-full object-contain object-center scale-[1.28] origin-center"
              decoding="async"
            />
          </div>
          <h1 className="mt-4 font-atenas font-bold uppercase text-[2rem] sm:text-[3rem] tracking-[0.18em] sm:tracking-[0.22em] bg-gradient-to-b from-[#f0e6d4] via-[#d6b98c] to-[#a88b5c] bg-clip-text text-transparent drop-shadow-[0_3px_10px_rgba(0,0,0,0.55)]">
            ATENAS
          </h1>
        </div>

        {/* Tarjeta pergamino (referencia) */}
        <div
          className="w-full rounded-[30px] border border-white/20 shadow-[0_28px_64px_-8px_rgba(0,0,0,0.58),0_0_1px_rgba(0,0,0,0.2)] overflow-hidden"
          style={{
            backgroundColor: '#f2f0ec',
            backgroundImage: CARD_GRAIN,
          }}
        >
          <div className="px-6 sm:px-9 pt-8 pb-9">
            <p className="text-center text-[1.05rem] leading-snug text-[#2a3330] font-semibold mb-7 font-login">
              Escribe tu correo y contraseña para iniciar sesión.
            </p>

            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <div
                  className="p-3.5 rounded-xl bg-red-50 border border-red-100 text-red-800 text-sm"
                  role="alert"
                >
                  {error}
                </div>
              )}

              <div>
                <label
                  htmlFor="email"
                  className="block text-base font-bold text-[#1c2422] mb-2 tracking-tight font-login"
                >
                  Correo electrónico
                </label>
                <div className="relative">
                  <span
                    className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[#b8956b]"
                    aria-hidden
                  >
                    <IconEnvelope className="h-5 w-5" />
                  </span>
                  <input
                    id="email"
                    type="email"
                    autoComplete="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    placeholder="tu@correo.com"
                    className="w-full rounded-full border border-stone-300/90 bg-white py-3.5 pl-12 pr-4 text-[1.05rem] text-[#1c2422] placeholder:text-stone-400 shadow-inner focus:border-[#1F2D2A] focus:outline-none focus:ring-2 focus:ring-[#1F2D2A]/25"
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="password"
                  className="block text-base font-bold text-[#1c2422] mb-2 tracking-tight font-login"
                >
                  Contraseña
                </label>
                <div className="relative">
                  <span
                    className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[#b8956b]"
                    aria-hidden
                  >
                    <IconLock className="h-5 w-5" />
                  </span>
                  <input
                    id="password"
                    type="password"
                    autoComplete="current-password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    placeholder="Tu contraseña"
                    className="w-full rounded-full border border-stone-300/90 bg-white py-3.5 pl-12 pr-4 text-[1.05rem] text-[#1c2422] placeholder:text-stone-400 shadow-inner focus:border-[#1F2D2A] focus:outline-none focus:ring-2 focus:ring-[#1F2D2A]/25"
                  />
                </div>
              </div>

              <button type="submit" disabled={loading} className="btn-login-gold mt-2">
                {loading ? 'Entrando…' : 'Ingresar'}
              </button>
            </form>

            <p className="mt-7 text-center text-[0.8125rem] leading-relaxed text-stone-600 italic font-login">
              Si todavía no tienes cuenta, pídele a tu docente o administrador que te registre en ATENAS.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
