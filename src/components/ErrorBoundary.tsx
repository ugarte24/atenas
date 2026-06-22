import { Component, type ErrorInfo, type ReactNode } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import { ClassicalBackdrop } from './ClassicalBackdrop';
import { Button } from './ui/Button';
import { Card } from './ui/Card';

type Props = { children: ReactNode };
type State = { hasError: boolean; error: Error | null };

export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false, error: null };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError && this.state.error) {
      const { error } = this.state;

      return (
        <div className="relative isolate min-h-screen min-h-[100dvh] flex flex-col items-center justify-center px-4 py-10">
          <ClassicalBackdrop />

          <div className="relative z-10 w-full max-w-md">
            <Card padding="lg" className="shadow-elevated text-center">
              <div className="flex items-center justify-center gap-3 mb-6 pb-5 border-b border-atenas-mist-border">
                <img
                  src={`${import.meta.env.BASE_URL}logo-athena.png`}
                  alt=""
                  className="w-12 h-12 sm:w-14 sm:h-14 object-contain drop-shadow-sm shrink-0 rounded-xl"
                />
                <h1 className="atenas-logo atenas-logo--login text-[1.75rem] sm:text-[2rem] leading-none">
                  ATENAS
                </h1>
              </div>

              <div
                className="mx-auto mb-5 w-14 h-14 rounded-2xl bg-amber-50 border border-amber-200/80 flex items-center justify-center text-amber-700"
                aria-hidden
              >
                <AlertTriangle className="w-7 h-7" strokeWidth={2.25} />
              </div>

              <h2 className="text-xl font-bold text-atenas-ink tracking-tight">Algo no ha ido bien</h2>
              <p className="text-sm text-atenas-muted mt-2 leading-relaxed max-w-xs mx-auto">
                Ha ocurrido un error inesperado. Puedes volver a intentar o recargar la página.
              </p>

              {import.meta.env.DEV && error.message && (
                <p className="mt-4 text-left text-xs font-mono text-red-800/90 bg-red-50 border border-red-200/70 rounded-xl px-3 py-2.5 break-words">
                  {error.message}
                </p>
              )}

              <div className="mt-6 flex flex-col sm:flex-row gap-3 justify-center">
                <Button
                  type="button"
                  fullWidth
                  className="sm:flex-1"
                  onClick={() => this.setState({ hasError: false, error: null })}
                >
                  Reintentar
                </Button>
                <Button
                  type="button"
                  variant="secondary"
                  fullWidth
                  className="sm:flex-1"
                  onClick={() => window.location.reload()}
                >
                  <RefreshCw className="w-4 h-4 mr-1.5 shrink-0" aria-hidden />
                  Recargar página
                </Button>
              </div>
            </Card>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
