import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Mail, Lock } from 'lucide-react';
import { useAuthContext } from '../contexts/AuthContext';
import { Input } from '../components/ui/Input';
import { Alert } from '../components/ui/Alert';

const LOGIN_BACKGROUND_URL = `${import.meta.env.BASE_URL}login-background.png`;

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
    <div className="min-h-[100dvh] flex flex-col lg:flex-row relative overflow-hidden">
      {/* Panel ilustración (mockup) */}
      <div className="hidden lg:flex lg:w-1/2 relative items-end justify-center bg-atenas-sidebar overflow-hidden">
        <div
          aria-hidden
          className="absolute inset-0 bg-cover bg-center opacity-25"
          style={{ backgroundImage: `url(${LOGIN_BACKGROUND_URL})` }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-atenas-sidebar from-5% via-atenas-sidebar/90 to-atenas-sidebar/75" />
        <div
          aria-hidden
          className="absolute inset-x-0 bottom-0 h-[55%] bg-gradient-to-t from-atenas-sidebar to-transparent"
        />
        <div className="relative z-10 p-12 pb-16 text-center max-w-md">
          <img
            src="/logo-athena.png"
            alt=""
            className="w-32 h-32 mx-auto object-contain drop-shadow-[0_4px_16px_rgba(0,0,0,0.55)] mb-6"
          />
          <h2 className="atenas-logo !text-3xl !tracking-[0.12em]">
            ATENAS
          </h2>
          <p className="mt-3 text-lg leading-relaxed text-white/95 [text-shadow:0_1px_6px_rgba(0,0,0,0.85)]">
            Aprende historia y cultura con misiones, logros y un mapa de progreso interactivo.
          </p>
        </div>
      </div>

      {/* Formulario */}
      <div className="flex-1 flex flex-col items-center justify-center px-4 py-10 bg-atenas-page relative">
        <div
          aria-hidden
          className="lg:hidden pointer-events-none fixed inset-0 z-0 bg-cover bg-center opacity-20"
          style={{ backgroundImage: `url(${LOGIN_BACKGROUND_URL})` }}
        />

        <div className="relative z-10 w-full max-w-md">
          <div className="flex flex-col items-center text-center mb-8 lg:items-start lg:text-left">
            <div className="lg:hidden w-16 h-16 rounded-2xl bg-atenas-sidebar flex items-center justify-center mb-4 shadow-elevated">
              <img src="/logo-athena.png" alt="" className="w-12 h-12 object-contain" />
            </div>
            <h1 className="text-2xl font-bold text-atenas-ink">Iniciar sesión</h1>
            <p className="text-sm text-atenas-muted mt-1">
              Ciencias Sociales · 6.º Primaria
            </p>
          </div>

          <div className="rounded-2xl border border-atenas-mist-border bg-white shadow-elevated p-6 sm:p-8">
            <form onSubmit={handleSubmit} className="space-y-5">
              {error && <Alert tone="error">{error}</Alert>}

              <Input
                label="Usuario o correo"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="tu@correo.com"
                icon={<Mail className="w-5 h-5" />}
              />

              <Input
                label="Contraseña"
                type="password"
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="Tu contraseña"
                icon={<Lock className="w-5 h-5" />}
              />

              <button type="submit" disabled={loading} className="btn-primary w-full mt-2">
                {loading ? 'Entrando…' : 'Iniciar sesión'}
              </button>
            </form>

            <p className="mt-6 text-center text-xs text-atenas-muted leading-relaxed">
              Si no tienes cuenta, pídele a tu docente o administrador que te registre.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
