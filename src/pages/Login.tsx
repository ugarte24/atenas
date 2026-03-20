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
    <div className="min-h-screen flex items-center justify-center px-4 py-10 bg-[#1F2D2A] relative overflow-hidden">
      {/* Textura sutil (sin degradado fuerte) */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.07]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }}
        aria-hidden
      />

      <div className="relative w-full max-w-md">
        <div className="rounded-3xl bg-[var(--atenas-card)] shadow-2xl border border-white/10 overflow-hidden">
          <div className="px-8 pt-10 pb-6 flex flex-col items-center text-center">
            <div
              className="w-24 h-24 rounded-full bg-white shadow-lg ring-4 ring-[#1F2D2A]/10 flex items-center justify-center overflow-hidden p-3 mb-5"
              title="Logo ATENAS"
            >
              <img
                src="/favicon.svg"
                alt="Logo ATENAS"
                className="max-h-full max-w-full object-contain"
                decoding="async"
              />
            </div>
            <p className="text-lg sm:text-xl font-semibold uppercase tracking-[0.12em] text-[#1F2D2A] font-atenas leading-tight">
              Plataforma ATENAS
            </p>
            <p className="mt-2 text-sm text-slate-600 max-w-sm">
              Ciencias Sociales · aprendizaje con propósito
            </p>
          </div>

          <div className="px-6 sm:px-8 pb-8">
            <p className="text-slate-700 text-sm mb-5 text-center">
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
                  className="input-field rounded-2xl border-slate-200"
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
                  className="input-field rounded-2xl border-slate-200"
                  placeholder="Tu contraseña"
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="btn-atenas-gold w-full"
              >
                {loading ? 'Entrando...' : 'Ingresar'}
              </button>
            </form>
            <p className="mt-5 text-[13px] text-slate-500 text-center leading-relaxed">
              Si todavía no tienes cuenta, pídele a tu docente o administrador que te registre en ATENAS.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
