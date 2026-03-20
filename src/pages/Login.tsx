import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuthContext } from '../contexts/AuthContext';

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
    <div className="min-h-screen flex items-center justify-center px-4 py-10 bg-gradient-to-b from-[#E5D4FF] via-[#C6F7D0] to-[#C9E7FF] relative overflow-hidden">
      <div className="pointer-events-none absolute -left-16 -top-20 w-40 h-40 rounded-full bg-white/40" />
      <div className="pointer-events-none absolute -right-20 -bottom-24 w-56 h-56 rounded-full bg-white/30" />

      <div className="relative w-full max-w-md">
        <div className="rounded-3xl bg-white/90 shadow-xl border border-white/60 overflow-hidden backdrop-blur">
          <div className="px-6 pt-6 pb-4 flex items-center justify-between gap-4 bg-gradient-to-r from-[#C6F7D0] via-[#FFE9A9] to-[#C9E7FF]">
            <div className="text-left">
              <p className="text-lg sm:text-xl font-semibold uppercase tracking-[0.1em] text-black font-atenas leading-tight">
                Plataforma ATENAS
              </p>
            </div>
            <div
              className="w-16 h-16 shrink-0 rounded-2xl bg-[#0a0a0a] shadow-md ring-1 ring-black/20 flex items-center justify-center overflow-hidden p-1"
              title="Logo ATENAS"
            >
              <img
                src="/favicon.svg"
                alt="Logo ATENAS"
                className="max-h-full max-w-full h-full w-full object-contain"
                decoding="async"
              />
            </div>
          </div>

          <div className="p-6 sm:p-7">
            <p className="text-slate-700 text-sm mb-5">
              Escribe tu correo y contraseña para iniciar sesión.
            </p>
            <form onSubmit={handleSubmit} className="space-y-5">
              {error && (
                <div
                  className="p-3.5 rounded-2xl bg-red-50 border border-red-100 text-red-700 text-sm"
                  role="alert"
                >
                  {error}
                </div>
              )}
              <div>
                <label htmlFor="email" className="label">
                  Correo electrónico
                </label>
                <input
                  id="email"
                  type="email"
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="input-field rounded-2xl"
                  placeholder="tu@correo.com"
                />
              </div>
              <div>
                <label htmlFor="password" className="label">
                  Contraseña
                </label>
                <input
                  id="password"
                  type="password"
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="input-field rounded-2xl"
                  placeholder="Tu contraseña"
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 text-base font-semibold rounded-2xl bg-emerald-500 text-white shadow-md hover:bg-emerald-600 disabled:opacity-60 transition-colors"
              >
                {loading ? 'Entrando...' : 'Ingresar'}
              </button>
            </form>
            <p className="mt-4 text-[13px] text-slate-500 text-center">
              Si todavía no tienes cuenta, pídele a tu docente o administrador que te registre en ATENAS.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
