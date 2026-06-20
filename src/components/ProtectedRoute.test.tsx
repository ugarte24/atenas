import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { ProtectedRoute } from './ProtectedRoute';

const useAuthContextMock = vi.fn();

vi.mock('../contexts/AuthContext', () => ({
  useAuthContext: () => useAuthContextMock(),
}));

vi.mock('./AuthLoadingSplash', () => ({
  AuthLoadingSplash: () => <div>Cargando auth…</div>,
}));

function renderProtected(initialPath = '/privado') {
  return render(
    <MemoryRouter initialEntries={[initialPath]}>
      <Routes>
        <Route
          path="/privado"
          element={
            <ProtectedRoute allowedRoles={['estudiante']}>
              <div>Contenido privado</div>
            </ProtectedRoute>
          }
        />
        <Route path="/login" element={<div>Página login</div>} />
        <Route path="/" element={<div>Inicio</div>} />
      </Routes>
    </MemoryRouter>
  );
}

describe('ProtectedRoute', () => {
  it('redirige a login sin sesión', () => {
    useAuthContextMock.mockReturnValue({ user: null, profile: null, loading: false });
    renderProtected();
    expect(screen.getByText('Página login')).toBeInTheDocument();
  });

  it('muestra splash mientras carga', () => {
    useAuthContextMock.mockReturnValue({ user: null, profile: null, loading: true });
    renderProtected();
    expect(screen.getByText('Cargando auth…')).toBeInTheDocument();
  });

  it('permite acceso con rol correcto', () => {
    useAuthContextMock.mockReturnValue({
      user: { id: '1' },
      profile: { role: 'estudiante' },
      loading: false,
    });
    renderProtected();
    expect(screen.getByText('Contenido privado')).toBeInTheDocument();
  });

  it('redirige a inicio si el rol no coincide', () => {
    useAuthContextMock.mockReturnValue({
      user: { id: '1' },
      profile: { role: 'docente' },
      loading: false,
    });
    renderProtected();
    expect(screen.getByText('Inicio')).toBeInTheDocument();
  });
});
