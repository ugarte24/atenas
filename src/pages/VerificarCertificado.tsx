import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { CheckCircle2, Loader2, ShieldAlert, XCircle } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { Card } from '../components/ui/Card';

type CertificadoEmitido = {
  id: string;
  nombre_estudiante: string;
  titulo_unidad: string;
  porcentaje: number;
  emitido_at: string;
};

export default function VerificarCertificado() {
  const { id } = useParams<{ id: string }>();
  const [loading, setLoading] = useState(true);
  const [cert, setCert] = useState<CertificadoEmitido | null>(null);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!id?.trim()) {
      setNotFound(true);
      setLoading(false);
      return;
    }

    let cancelled = false;
    setLoading(true);
    setNotFound(false);
    setCert(null);

    void supabase
      .from('certificados_emitidos')
      .select('id, nombre_estudiante, titulo_unidad, porcentaje, emitido_at')
      .eq('id', id.trim())
      .maybeSingle()
      .then(({ data, error }) => {
        if (cancelled) return;
        if (error || !data) {
          setNotFound(true);
          setCert(null);
        } else {
          setCert(data as CertificadoEmitido);
          setNotFound(false);
        }
        setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [id]);

  const fechaEmision = cert
    ? new Date(cert.emitido_at).toLocaleDateString('es-ES', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      })
    : '';

  return (
    <div className="min-h-[100dvh] bg-atenas-cream flex flex-col">
      <header className="border-b border-atenas-mist-border bg-white/80 backdrop-blur-sm px-4 py-4 sm:px-6">
        <div className="max-w-lg mx-auto flex items-center gap-3">
          <img
            src={`${import.meta.env.BASE_URL}logo-athena.png`}
            alt=""
            className="w-10 h-10 object-contain"
            aria-hidden
          />
          <div>
            <p className="font-atenas font-bold text-atenas-ink tracking-wider">ATENAS</p>
            <p className="text-xs text-atenas-muted">Verificación de certificado</p>
          </div>
        </div>
      </header>

      <main className="flex-1 flex items-start justify-center px-4 py-8 sm:py-12">
        <Card className="w-full max-w-lg p-6 sm:p-8 shadow-card">
          {loading ? (
            <div className="flex flex-col items-center gap-3 py-8 text-atenas-muted" role="status">
              <Loader2 className="w-8 h-8 animate-spin text-atenas-gold" aria-hidden />
              <p className="text-sm">Verificando certificado…</p>
            </div>
          ) : notFound || !cert ? (
            <div className="text-center space-y-4">
              <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-red-50 text-red-600 mx-auto">
                <XCircle className="w-8 h-8" aria-hidden />
              </div>
              <h1 className="font-atenas text-xl font-semibold text-atenas-ink">
                Certificado no encontrado
              </h1>
              <p className="text-sm text-atenas-muted leading-relaxed">
                El identificador <strong className="font-mono text-atenas-ink">{id}</strong> no
                corresponde a un certificado registrado en ATENAS.
              </p>
              <p className="text-xs text-atenas-muted flex items-center justify-center gap-1.5 pt-2">
                <ShieldAlert className="w-4 h-4 shrink-0" aria-hidden />
                Si escaneaste un QR, comprueba que el enlace sea oficial.
              </p>
            </div>
          ) : (
            <div className="space-y-5">
              <div className="flex items-start gap-3">
                <div className="shrink-0 w-12 h-12 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center">
                  <CheckCircle2 className="w-7 h-7" aria-hidden />
                </div>
                <div>
                  <h1 className="font-atenas text-xl font-semibold text-atenas-ink">
                    Certificado válido
                  </h1>
                  <p className="text-sm text-atenas-muted mt-0.5">
                    Este documento está registrado en la plataforma ATENAS.
                  </p>
                </div>
              </div>

              <dl className="space-y-3 text-sm border-t border-atenas-mist-border pt-5">
                <div>
                  <dt className="text-atenas-muted text-xs uppercase tracking-wide">Estudiante</dt>
                  <dd className="font-medium text-atenas-ink mt-0.5">{cert.nombre_estudiante}</dd>
                </div>
                <div>
                  <dt className="text-atenas-muted text-xs uppercase tracking-wide">Unidad</dt>
                  <dd className="font-medium text-atenas-ink mt-0.5">{cert.titulo_unidad}</dd>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <dt className="text-atenas-muted text-xs uppercase tracking-wide">Logro</dt>
                    <dd className="font-semibold text-atenas-gold mt-0.5">{cert.porcentaje}%</dd>
                  </div>
                  <div>
                    <dt className="text-atenas-muted text-xs uppercase tracking-wide">Emisión</dt>
                    <dd className="font-medium text-atenas-ink mt-0.5">{fechaEmision}</dd>
                  </div>
                </div>
                <div>
                  <dt className="text-atenas-muted text-xs uppercase tracking-wide">ID</dt>
                  <dd className="font-mono text-xs text-atenas-ink mt-0.5 break-all">{cert.id}</dd>
                </div>
              </dl>
            </div>
          )}

          <p className="text-center text-xs text-atenas-muted mt-8 pt-4 border-t border-atenas-mist-border">
            <Link to="/login" className="text-atenas-gold hover:underline">
              Ir a ATENAS
            </Link>
          </p>
        </Card>
      </main>
    </div>
  );
}
