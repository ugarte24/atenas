import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Mail, Lock } from 'lucide-react';
import { useAuthContext } from '../contexts/AuthContext';
import { Input } from '../components/ui/Input';
import { Alert } from '../components/ui/Alert';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';

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
      <div className="hidden lg:flex lg:w-1/2 relative items-start justify-center bg-atenas-sidebar overflow-hidden">
        <div
          aria-hidden
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${LOGIN_BACKGROUND_URL})` }}
        />
        <div className="absolute inset-0 bg-atenas-sidebar/10" />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/10" />
      </div>

      {/* Formulario */}
      <div className="flex-1 flex flex-col items-center justify-center px-4 py-10 bg-atenas-page relative">
        <div
          aria-hidden
          className="lg:hidden pointer-events-none fixed inset-0 z-0 bg-cover bg-center opacity-20"
          style={{ backgroundImage: `url(${LOGIN_BACKGROUND_URL})` }}
        />

        <div className="relative z-10 w-full max-w-md">
          <div className="flex flex-col items-center text-center mb-8">
            <div className="flex items-center justify-center gap-3 sm:gap-4">
              <img
                src="/logo-athena.png"
                alt=""
                className="w-16 h-16 sm:w-20 sm:h-20 object-contain drop-shadow-md shrink-0 rounded-2xl"
              />
              <h2 className="atenas-logo atenas-logo--login h-16 sm:h-20 flex items-center shrink-0 text-[2.25rem] sm:text-[2.75rem] leading-none">
                ATENAS
              </h2>
            </div>
          </div>

          <Card padding="lg" className="shadow-elevated">
            <h1 className="text-2xl font-bold text-atenas-ink text-center mb-6">Iniciar sesión</h1>
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

              <Button type="submit" disabled={loading} fullWidth className="mt-2">
                {loading ? 'Entrando…' : 'Iniciar sesión'}
              </Button>
            </form>

            <p className="mt-6 text-center text-xs text-atenas-muted leading-relaxed">
              Si olvidó su contraseña, contáctese con el administrador.
            </p>
          </Card>
        </div>
      </div>
    </div>
  );
}
