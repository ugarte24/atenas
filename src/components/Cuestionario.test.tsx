import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Cuestionario } from './Cuestionario';

vi.mock('../hooks/useMotionSafe', () => ({
  useMotionSafe: () => ({
    reduceMotion: true,
    spring: { duration: 0 },
    fade: { duration: 0 },
    quick: { duration: 0 },
    stagger: 0,
  }),
}));

const preguntas = [
  {
    enunciado: '¿Capital de España?',
    opciones: [
      { texto: 'Madrid', correcta: true },
      { texto: 'Lisboa', correcta: false },
    ],
  },
  {
    enunciado: '¿Continente de Perú?',
    opciones: [
      { texto: 'América', correcta: true },
      { texto: 'Europa', correcta: false },
    ],
  },
];

describe('Cuestionario', () => {
  it('muestra una pregunta a la vez', () => {
    render(
      <Cuestionario
        preguntas={preguntas}
        umbralAprobado={70}
        onSubmit={vi.fn()}
        feedback="completo"
      />
    );
    expect(screen.getByText(/Pregunta 1 de 2/)).toBeInTheDocument();
    expect(screen.getByText('¿Capital de España?')).toBeInTheDocument();
    expect(screen.queryByText('¿Continente de Perú?')).not.toBeInTheDocument();
  });

  it('avanza a la siguiente pregunta al elegir respuesta', () => {
    render(
      <Cuestionario
        preguntas={preguntas}
        umbralAprobado={70}
        onSubmit={vi.fn()}
        feedback="completo"
      />
    );
    fireEvent.click(screen.getByRole('radio', { name: 'Madrid' }));
    fireEvent.click(screen.getByRole('button', { name: /Siguiente/i }));
    expect(screen.getByText(/Pregunta 2 de 2/)).toBeInTheDocument();
  });
});
