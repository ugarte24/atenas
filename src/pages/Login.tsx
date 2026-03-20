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
      <path
        d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75M5.25 21h13.5a2.25 2.25 0 002.25-2.25v-9.75a2.25 2.25 0 00-2.25-2.25H5.25a2.25 2.25 0 00-2.25 2.25v9.75A2.25 2.25 0 005.25 21z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/** Grano sutil solo en la tarjeta del formulario */
const CARD_GRAIN = `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='g'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23g)' opacity='0.04'/%3E%3C/svg%3E")`;

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
    <div
      className="min-h-screen flex flex-col items-center px-4 pt-10 pb-16 relative overflow-hidden font-login"
      style={{
        backgroundColor: '#1F2D2A',
        backgroundImage: 'radial-gradient(circle at 30% 20%, #2A3A36, transparent 60%)',
      }}
    >
      <div className="relative z-10 w-full max-w-md flex flex-col items-center">
        {/* Marca sobre el fondo oscuro (como mockup) */}
        <div className="flex flex-col items-center text-center mb-5">
          <div
            className="w-[7.25rem] h-[7.25rem] rounded-full bg-[#1F2D2A] border-[2.5px] border-[#D6B98C] flex items-center justify-center overflow-hidden shadow-[0_8px_32px_rgba(0,0,0,0.45),0_0_12px_rgba(214,185,140,0.25)]"
            title="Logo ATENAS"
          >
            <img
              src="/logo-athena.png"
              alt=""
              className="h-full w-full object-contain object-center scale-[1.28] origin-center"
              decoding="async"
            />
          </div>
          <h1 className="mt-3 font-atenas text-[32px] tracking-[1.5px] font-semibold uppercase text-[#D6B98C] sm:text-[48px] sm:tracking-[2px] [text-shadow:0_2px_8px_rgba(0,0,0,0.45)]">
            ATENAS
          </h1>
        </div>

        {/* Tarjeta clara tipo pergamino */}
        <div
          className="w-full rounded-[1.75rem] border border-white/25 shadow-[0_25px_60px_-12px_rgba(0,0,0,0.55)] overflow-hidden"
          style={{
            backgroundColor: '#F5F7FA',
            backgroundImage: CARD_GRAIN,
          }}
        >
          <div className="px-6 sm:px-9 pt-8 pb-9">
            <p className="text-center text-[1.05rem] leading-snug text-[#2c3330] font-semibold mb-7">
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
                <label htmlFor="email" className="sr-only">
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
                    className="w-full rounded-2xl border border-stone-300/90 bg-white py-3.5 pl-12 pr-4 text-[1.05rem] text-[#1c2422] placeholder:text-stone-400 shadow-inner focus:border-[#1F2D2A] focus:outline-none focus:ring-2 focus:ring-[#1F2D2A]/20"
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="password"
                  className="block text-base font-bold text-[#1c2422] mb-2 tracking-tight"
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
                    className="w-full rounded-2xl border border-stone-300/90 bg-white py-3.5 pl-12 pr-4 text-[1.05rem] text-[#1c2422] placeholder:text-stone-400 shadow-inner focus:border-[#1F2D2A] focus:outline-none focus:ring-2 focus:ring-[#1F2D2A]/20"
                  />
                </div>
              </div>

              <button type="submit" disabled={loading} className="btn-login-gold mt-2">
                {loading ? 'Entrando…' : 'Ingresar'}
              </button>
            </form>

            <p className="mt-7 text-center text-[0.8125rem] leading-relaxed text-stone-600 italic">
              Si todavía no tienes cuenta, pídele a tu docente o administrador que te registre en ATENAS.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
