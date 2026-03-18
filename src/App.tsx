import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { Layout } from './components/Layout';
import { ProtectedRoute } from './components/ProtectedRoute';
import Login from './pages/Login';
import Home from './pages/Home';
import Perfil from './pages/Perfil';
import Progreso from './pages/Progreso';
import Logros from './pages/Logros';
import Unidades from './pages/Unidades';
import UnidadTemas from './pages/UnidadTemas';
import TemaView from './pages/TemaView';
import ActividadView from './pages/ActividadView';
import EvaluacionView from './pages/EvaluacionView';

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
                  <Home />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/progreso"
            element={
              <ProtectedRoute>
                <Layout>
                  <Progreso />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/logros"
            element={
              <ProtectedRoute>
                <Layout>
                  <Logros />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/perfil"
            element={
              <ProtectedRoute>
                <Layout>
                  <Perfil />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route path="/unidades" element={<ProtectedRoute><Layout><Unidades /></Layout></ProtectedRoute>} />
          <Route path="/unidades/:unidadId" element={<ProtectedRoute><Layout><UnidadTemas /></Layout></ProtectedRoute>} />
          <Route path="/temas/:temaId" element={<ProtectedRoute><Layout><TemaView /></Layout></ProtectedRoute>} />
          <Route path="/actividades/:actividadId" element={<ProtectedRoute><Layout><ActividadView /></Layout></ProtectedRoute>} />
          <Route path="/evaluaciones/:evaluacionId" element={<ProtectedRoute><Layout><EvaluacionView /></Layout></ProtectedRoute>} />
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
