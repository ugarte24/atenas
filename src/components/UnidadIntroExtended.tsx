type Props = {
  text: string | null | undefined;
};

export function UnidadIntroExtended({ text }: Props) {
  const t = text?.trim();
  if (!t) return null;

  return (
    <section
      className="mb-8 rounded-3xl border border-slate-200 bg-gradient-to-br from-[#f8fafc] to-white p-6 sm:p-8 shadow-sm"
      aria-labelledby="unidad-intro-extended-h"
    >
      <h2 id="unidad-intro-extended-h" className="text-lg font-bold text-slate-900 mb-3">
        Más sobre esta unidad
      </h2>
      <div className="text-slate-700 text-base leading-relaxed whitespace-pre-wrap">{t}</div>
    </section>
  );
}
