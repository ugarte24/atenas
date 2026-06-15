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
    <div className="min-h-[100dvh] flex flex-col items-center justify-center px-4 py-10 relative overflow-hidden">
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 z-0 bg-cover bg-center"
        style={{ backgroundImage: `url(${LOGIN_BACKGROUND_URL})` }}
      />
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 z-[1] bg-gradient-to-b from-atenas-ink/70 via-atenas-ink/50 to-atenas-ink/80"
      />

      <div className="relative z-10 w-full max-w-sm flex flex-col items-center">
        <div className="flex flex-col items-center text-center mb-6">
          <div className="w-20 h-20 rounded-2xl bg-white/10 backdrop-blur border border-atenas-gold/40 flex items-center justify-center overflow-hidden shadow-elevated">
            <img
              src="/logo-athena.png"
              alt=""
              className="h-full w-full object-contain scale-110"
              decoding="async"
            />
          </div>
          <h1 className="mt-4 font-atenas font-bold uppercase text-3xl tracking-[0.15em] text-atenas-gold">
            ATENAS
          </h1>
          <p className="text-sm text-white/80 mt-1">Ciencias Sociales · 6.º Primaria</p>
        </div>

        <div className="w-full rounded-2xl border border-white/20 bg-white/95 backdrop-blur-md shadow-elevated p-6 sm:p-8">
          <p className="text-center text-sm text-atenas-muted-strong font-medium mb-6">
            Inicia sesión con tu correo y contraseña
          </p>

          <form onSubmit={handleSubmit} className="space-y-5">
            {error && <Alert tone="error">{error}</Alert>}

            <Input
              label="Correo electrónico"
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

            <button type="submit" disabled={loading} className="btn-atenas-gold w-full mt-2">
              {loading ? 'Entrando…' : 'Ingresar'}
            </button>
          </form>

          <p className="mt-6 text-center text-xs text-atenas-muted leading-relaxed">
            Si no tienes cuenta, pídele a tu docente o administrador que te registre.
          </p>
        </div>
      </div>
    </div>
  );
}
