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
    <div
      className="min-h-screen flex items-center justify-center px-4 py-10 relative"
      style={{
        backgroundImage: 'url(https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=1600&q=80)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
    >
      <div className="absolute inset-0 bg-[#003366]/75" aria-hidden />
      <div className="relative w-full max-w-md card overflow-hidden shadow-xl">
        <div className="px-6 py-5 text-white" style={{ backgroundColor: '#003366' }}>
          <h1 className="text-2xl font-bold tracking-tight">ATENAS</h1>
          <p className="text-blue-100 text-sm mt-0.5">Ciencias Sociales · 6.º Primaria</p>
        </div>
        <div className="p-6 sm:p-8 bg-white">
          <p className="text-slate-600 text-sm mb-6">Inicia sesión con tu correo y contraseña</p>
          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="p-4 rounded-xl bg-red-50 border border-red-100 text-red-700 text-sm" role="alert">
                {error}
              </div>
            )}
            <div>
              <label htmlFor="email" className="label">Correo electrónico</label>
              <input
                id="email"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="input-field"
                placeholder="tu@correo.com"
              />
            </div>
            <div>
              <label htmlFor="password" className="label">Contraseña</label>
              <input
                id="password"
                type="password"
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="input-field"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full py-3.5 text-base disabled:opacity-50"
            >
              {loading ? 'Entrando...' : 'Entrar'}
            </button>
          </form>
          <p className="mt-4 text-[13px] text-slate-500 text-center">
            Si todavía no tienes cuenta, pídele a tu docente o administrador que te registre en ATENAS.
          </p>
        </div>
      </div>
    </div>
  );
}
