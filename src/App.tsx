import { lazy, Suspense, type ReactNode } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { Layout } from './components/Layout';
import { ProtectedRoute } from './components/ProtectedRoute';
import { useAuthContext } from './contexts/AuthContext';
import Login from './pages/Login';

const Home = lazy(() => import('./pages/Home'));
const Perfil = lazy(() => import('./pages/Perfil'));
const Progreso = lazy(() => import('./pages/Progreso'));
const Logros = lazy(() => import('./pages/Logros'));
const Unidades = lazy(() => import('./pages/Unidades'));
const UnidadTemas = lazy(() => import('./pages/UnidadTemas'));
const TemaView = lazy(() => import('./pages/TemaView'));
const ActividadView = lazy(() => import('./pages/ActividadView'));
const EvaluacionView = lazy(() => import('./pages/EvaluacionView'));

const AdminPanel = lazy(() => import('./pages/AdminPanel'));
const DocenteLayout = lazy(() => import('./pages/docente/DocenteLayout'));
const DocenteInicio = lazy(() => import('./pages/docente/DocenteInicio'));
const DocenteContenidos = lazy(() => import('./pages/docente/DocenteContenidos'));
const DocenteTemas = lazy(() => import('./pages/docente/DocenteTemas'));
const DocenteRecursos = lazy(() => import('./pages/docente/DocenteRecursos'));
const DocenteActividades = lazy(() => import('./pages/docente/DocenteActividades'));
const DocenteEvaluaciones = lazy(() => import('./pages/docente/DocenteEvaluaciones'));
const DocenteProgreso = lazy(() => import('./pages/docente/DocenteProgreso'));

function PageLoader() {
  return (
    <div className="flex items-center justify-center min-h-[40vh]" role="status" aria-live="polite">
      <p className="text-slate-600">Cargando…</p>
    </div>
  );
}

function LandingByRole() {
  const { profile } = useAuthContext();

  if (!profile) return <Home />;

  if (profile.role === 'docente') return <Navigate to="/docente" replace />;
  if (profile.role === 'admin') return <Navigate to="/admin" replace />;

  return <Home />;
}

function WithPageSuspense({ children }: { children: ReactNode }) {
  return <Suspense fallback={<PageLoader />}>{children}</Suspense>;
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <Layout>
                  <WithPageSuspense>
                    <LandingByRole />
                  </WithPageSuspense>
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/progreso"
            element={
              <ProtectedRoute allowedRoles={['estudiante']}>
                <Layout>
                  <WithPageSuspense>
                    <Progreso />
                  </WithPageSuspense>
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/logros"
            element={
              <ProtectedRoute allowedRoles={['estudiante']}>
                <Layout>
                  <WithPageSuspense>
                    <Logros />
                  </WithPageSuspense>
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/perfil"
            element={
              <ProtectedRoute>
                <Layout>
                  <WithPageSuspense>
                    <Perfil />
                  </WithPageSuspense>
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/unidades"
            element={
              <ProtectedRoute>
                <Layout>
                  <WithPageSuspense>
                    <Unidades />
                  </WithPageSuspense>
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/unidades/:unidadId"
            element={
              <ProtectedRoute>
                <Layout>
                  <WithPageSuspense>
                    <UnidadTemas />
                  </WithPageSuspense>
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/temas/:temaId"
            element={
              <ProtectedRoute>
                <Layout>
                  <WithPageSuspense>
                    <TemaView />
                  </WithPageSuspense>
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/actividades/:actividadId"
            element={
              <ProtectedRoute>
                <Layout>
                  <WithPageSuspense>
                    <ActividadView />
                  </WithPageSuspense>
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/evaluaciones/:evaluacionId"
            element={
              <ProtectedRoute>
                <Layout>
                  <WithPageSuspense>
                    <EvaluacionView />
                  </WithPageSuspense>
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/docente"
            element={
              <ProtectedRoute allowedRoles={['docente', 'admin']}>
                <Layout>
                  <Suspense fallback={<PageLoader />}>
                    <DocenteLayout />
                  </Suspense>
                </Layout>
              </ProtectedRoute>
            }
          >
            <Route
              index
              element={
                <Suspense fallback={<PageLoader />}>
                  <DocenteInicio />
                </Suspense>
              }
            />
            <Route
              path="contenidos"
              element={
                <Suspense fallback={<PageLoader />}>
                  <DocenteContenidos />
                </Suspense>
              }
            />
            <Route
              path="unidades/:unidadId"
              element={
                <Suspense fallback={<PageLoader />}>
                  <DocenteTemas />
                </Suspense>
              }
            />
            <Route
              path="temas/:temaId"
              element={
                <Suspense fallback={<PageLoader />}>
                  <DocenteRecursos />
                </Suspense>
              }
            />
            <Route
              path="temas/:temaId/actividades"
              element={
                <Suspense fallback={<PageLoader />}>
                  <DocenteActividades />
                </Suspense>
              }
            />
            <Route
              path="temas/:temaId/evaluaciones"
              element={
                <Suspense fallback={<PageLoader />}>
                  <DocenteEvaluaciones />
                </Suspense>
              }
            />
            <Route
              path="progreso"
              element={
                <Suspense fallback={<PageLoader />}>
                  <DocenteProgreso />
                </Suspense>
              }
            />
          </Route>
          <Route
            path="/admin"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <Layout>
                  <Suspense fallback={<PageLoader />}>
                    <AdminPanel />
                  </Suspense>
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
