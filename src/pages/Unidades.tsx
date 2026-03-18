import { Link } from 'react-router-dom';
import { useUnidades } from '../hooks/useUnidades';

const UNIT_IMAGES = [
  'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=400&q=80',
  'https://images.unsplash.com/photo-1523580494863-6f3031224c94?w=400&q=80',
  'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=400&q=80',
  'https://images.unsplash.com/photo-1516979187457-637abb4f9353?w=400&q=80',
  'https://images.unsplash.com/photo-1427504494785-3a9ca7044f45?w=400&q=80',
  'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=400&q=80',
];

export default function Unidades() {
  const { unidades, loading, error } = useUnidades();

  if (loading) return <p className="text-slate-600 text-lg">Cargando unidades...</p>;
  if (error) return <p className="text-red-600 text-lg">Algo salió mal. Vuelve a intentarlo.</p>;

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-2">Contenidos</h1>
        <p className="text-slate-600">Elige una unidad para ver sus temas.</p>
      </div>
      <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {unidades.map((u, i) => (
          <li key={u.id}>
            <Link
              to={`/unidades/${u.id}`}
              className="group block card-hover rounded-xl overflow-hidden focus:outline-none focus:ring-2 focus:ring-[#003366] focus:ring-offset-2"
            >
              <div className="aspect-[16/10] overflow-hidden bg-slate-200">
                <img
                  src={UNIT_IMAGES[i % UNIT_IMAGES.length]}
                  alt=""
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                />
              </div>
              <div className="p-5">
                <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: '#009975' }}>
                  Unidad {i + 1}
                </span>
                <h2 className="text-lg font-bold text-slate-900 mt-2">{u.title}</h2>
                {u.description && (
                  <p className="text-slate-600 text-sm mt-2 line-clamp-2">{u.description}</p>
                )}
              </div>
            </Link>
          </li>
        ))}
      </ul>
      {unidades.length === 0 && (
        <div className="card p-12 text-center">
          <img
            src="https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=300&q=80"
            alt=""
            className="w-32 h-32 mx-auto rounded-full object-cover opacity-60"
          />
          <p className="text-slate-500 text-lg mt-4">Aún no hay unidades. Tu profesor las publicará pronto.</p>
        </div>
      )}
    </div>
  );
}
