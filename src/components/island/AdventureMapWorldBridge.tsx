type Props = {
  fromWorldId: 1 | 2;
};

const LABELS: Record<1 | 2, string> = {
  1: 'Completa Convivencia para desbloquear Territorio',
  2: 'Completa Territorio para desbloquear Historia',
};

export function AdventureMapWorldBridge({ fromWorldId }: Props) {
  return (
    <div
      className="relative z-10 flex h-10 w-full shrink-0 items-center justify-center bg-gradient-to-r from-sky-600/90 via-cyan-500/85 to-sky-600/90 px-4"
      aria-hidden
    >
      <div className="h-px flex-1 max-w-16 bg-white/35" />
      <p className="mx-3 text-[10px] font-bold uppercase tracking-wide text-white/95 text-center">
        {LABELS[fromWorldId]}
      </p>
      <div className="h-px flex-1 max-w-16 bg-white/35" />
    </div>
  );
}
