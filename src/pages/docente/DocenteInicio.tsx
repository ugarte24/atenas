import { Link } from 'react-router-dom';

export default function DocenteInicio() {
  return (
    <div>
      <div
        className="rounded-xl p-6 mb-8 text-white"
        style={{ backgroundColor: '#003366' }}
      >
        <h1 className="text-2xl font-bold">Panel del docente</h1>
        <p className="text-blue-100 mt-1">
          Gestiona contenidos, actividades y revisa el progreso de los estudiantes.
        </p>
      </div>
      <div className="grid sm:grid-cols-2 gap-4">
        <Link
          to="/docente/contenidos"
          className="flex items-center gap-4 p-6 card-hover rounded-xl"
        >
          <div
            className="w-14 h-14 rounded-xl flex items-center justify-center flex-shrink-0 text-white"
            style={{ backgroundColor: '#009975' }}
          >
            <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
          </div>
          <div>
            <h2 className="font-bold text-slate-900 text-lg">Gestionar contenidos</h2>
            <p className="text-slate-600 text-sm">Unidades, temas, recursos y actividades</p>
          </div>
        </Link>
        <Link
          to="/docente/progreso"
          className="flex items-center gap-4 p-6 card-hover rounded-xl"
        >
          <div
            className="w-14 h-14 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{ backgroundColor: '#e6edf5' }}
          >
            <svg className="w-7 h-7" style={{ color: '#003366' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </div>
          <div>
            <h2 className="font-bold text-slate-900 text-lg">Progreso de estudiantes</h2>
            <p className="text-slate-600 text-sm">Actividades y evaluaciones realizadas</p>
          </div>
        </Link>
      </div>
    </div>
  );
}
