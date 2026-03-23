/**
 * Fondo marca (#1F2D2A) + textura clásica (piedra + fibra manuscrito).
 * Misma apariencia en Login y pantalla de carga (sesión).
 */
export const CLASSICAL_BG_STONE = `url("data:image/svg+xml,${encodeURIComponent(
  `<svg viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg"><defs><filter id="st" x="-20%" y="-20%" width="140%" height="140%" color-interpolation-filters="sRGB"><feTurbulence type="fractalNoise" baseFrequency="0.012 0.018" numOctaves="3" seed="11" stitchTiles="stitch" result="t"/><feGaussianBlur in="t" stdDeviation="1.0"/></filter></defs><rect width="100%" height="100%" filter="url(#st)" opacity="0.78"/></svg>`
)}")`;

export const CLASSICAL_BG_MANUSCRIPT = `url("data:image/svg+xml,${encodeURIComponent(
  `<svg viewBox="0 0 256 256" xmlns="http://www.w3.org/2000/svg"><defs><filter id="ms" x="-10%" y="-10%" width="120%" height="120%" color-interpolation-filters="sRGB"><feTurbulence type="fractalNoise" baseFrequency="0.52 0.48" numOctaves="2" seed="37" stitchTiles="stitch" result="t"/><feGaussianBlur in="t" stdDeviation="0.28"/></filter></defs><rect width="100%" height="100%" filter="url(#ms)" opacity="0.48"/></svg>`
)}")`;

/** Capas absolutas; el contenedor padre debe ser `relative` + altura mínima. */
export function ClassicalBackdrop() {
  return (
    <>
      <div
        className="pointer-events-none absolute inset-0 z-0"
        style={{
          backgroundColor: '#1F2D2A',
          backgroundImage:
            'radial-gradient(ellipse 140% 120% at 50% -8%, rgba(58, 82, 76, 0.72) 0%, rgba(38, 54, 50, 0.45) 38%, #1F2D2A 72%)',
        }}
        aria-hidden
      />
      <div
        className="pointer-events-none absolute inset-0 z-0 mix-blend-soft-light opacity-[0.62]"
        style={{
          backgroundImage: CLASSICAL_BG_STONE,
          backgroundRepeat: 'repeat',
          backgroundSize: '512px 512px',
        }}
        aria-hidden
      />
      <div
        className="pointer-events-none absolute inset-0 z-0 mix-blend-overlay opacity-[0.32]"
        style={{
          backgroundImage: CLASSICAL_BG_MANUSCRIPT,
          backgroundRepeat: 'repeat',
          backgroundSize: '256px 256px',
        }}
        aria-hidden
      />
      <div
        className="pointer-events-none absolute inset-0 z-0"
        style={{
          background:
            'radial-gradient(ellipse 115% 100% at 50% 44%, transparent 24%, rgba(0, 0, 0, 0.42) 100%)',
        }}
        aria-hidden
      />
    </>
  );
}
