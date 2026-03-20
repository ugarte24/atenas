import { Component, type ErrorInfo, type ReactNode } from 'react';

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
      return (
        <div className="min-h-screen flex items-center justify-center bg-slate-100 p-4">
          <div className="max-w-md w-full card p-6 shadow-elevated">
            <h1 className="atenas-logo mb-2">ATENAS</h1>
            <h2 className="text-lg font-semibold text-red-700 mb-2">Algo no ha ido bien</h2>
            <p className="text-slate-600 text-sm mb-6">Puedes volver a intentar recargando la página.</p>
            <button
              type="button"
              onClick={() => this.setState({ hasError: false, error: null })}
              className="btn-primary"
            >
              Reintentar
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
