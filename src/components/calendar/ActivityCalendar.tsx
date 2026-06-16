import { useEffect, useState, useMemo } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuthContext } from '../../contexts/AuthContext';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '../ui/cn';

export type CalendarEvent = {
  id: string;
  titulo: string;
  tipo: 'evaluacion' | 'actividad' | 'mision';
  puntos: number;
  fecha: Date;
  color: string;
};

const TIPO_COLORS = {
  evaluacion: 'bg-violet-100 text-violet-800 border-violet-200',
  actividad: 'bg-emerald-100 text-emerald-800 border-emerald-200',
  mision: 'bg-amber-100 text-amber-900 border-amber-200',
};

function startOfWeek(d: Date): Date {
  const x = new Date(d);
  const day = x.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  x.setDate(x.getDate() + diff);
  x.setHours(0, 0, 0, 0);
  return x;
}

function addDays(d: Date, n: number): Date {
  const x = new Date(d);
  x.setDate(x.getDate() + n);
  return x;
}

function sameDay(a: Date, b: Date): boolean {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

export function ActivityCalendar({ className }: { className?: string }) {
  const { user, profile } = useAuthContext();
  const [weekStart, setWeekStart] = useState(() => startOfWeek(new Date()));
  const [selected, setSelected] = useState(new Date());
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user || profile?.role !== 'estudiante') {
      setEvents([]);
      setLoading(false);
      return;
    }
    let c = false;
    void (async () => {
      const [actRes, evalRes] = await Promise.all([
        supabase
          .from('actividad_intentos')
          .select('actividad_id, puntuacion, completado_at, actividades(title)')
          .eq('user_id', user.id)
          .not('completado_at', 'is', null)
          .order('completado_at', { ascending: false })
          .limit(20),
        supabase
          .from('evaluacion_intentos')
          .select('evaluacion_id, puntuacion, completado_at, evaluaciones(title)')
          .eq('user_id', user.id)
          .not('completado_at', 'is', null)
          .order('completado_at', { ascending: false })
          .limit(20),
      ]);
      if (c) return;
      const ev: CalendarEvent[] = [];
      for (const row of actRes.data ?? []) {
        const r = row as unknown as {
          actividad_id: string;
          puntuacion: number;
          completado_at: string;
          actividades: { title: string } | { title: string }[] | null;
        };
        const act = Array.isArray(r.actividades) ? r.actividades[0] : r.actividades;
        ev.push({
          id: `a-${r.actividad_id}`,
          titulo: act?.title ?? 'Actividad',
          tipo: 'actividad',
          puntos: r.puntuacion,
          fecha: new Date(r.completado_at),
          color: TIPO_COLORS.actividad,
        });
      }
      for (const row of evalRes.data ?? []) {
        const r = row as unknown as {
          evaluacion_id: string;
          puntuacion: number;
          completado_at: string;
          evaluaciones: { title: string } | { title: string }[] | null;
        };
        const evl = Array.isArray(r.evaluaciones) ? r.evaluaciones[0] : r.evaluaciones;
        ev.push({
          id: `e-${r.evaluacion_id}`,
          titulo: evl?.title ?? 'Evaluación',
          tipo: 'evaluacion',
          puntos: r.puntuacion,
          fecha: new Date(r.completado_at),
          color: TIPO_COLORS.evaluacion,
        });
      }
      ev.push({
        id: 'mision-demo',
        titulo: 'Misión especial: explora un tema nuevo',
        tipo: 'mision',
        puntos: 50,
        fecha: addDays(new Date(), 1),
        color: TIPO_COLORS.mision,
      });
      setEvents(ev);
      setLoading(false);
    })();
    return () => {
      c = true;
    };
  }, [user, profile?.role]);

  const days = useMemo(() => Array.from({ length: 7 }, (_, i) => addDays(weekStart, i)), [weekStart]);
  const dayEvents = events.filter((e) => sameDay(e.fecha, selected));
  const today = new Date();

  return (
    <section className={cn('rounded-2xl border border-atenas-mist-border bg-white p-5 shadow-card', className)}>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold text-atenas-ink">Calendario</h2>
        <div className="flex gap-1">
          <button type="button" onClick={() => setWeekStart(addDays(weekStart, -7))} className="p-2 rounded-lg hover:bg-atenas-mist min-h-touch" aria-label="Semana anterior">
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button type="button" onClick={() => setWeekStart(addDays(weekStart, 7))} className="p-2 rounded-lg hover:bg-atenas-mist min-h-touch" aria-label="Semana siguiente">
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="flex gap-1 mb-4 overflow-x-auto scrollbar-nav-hide">
        {days.map((d) => {
          const isSelected = sameDay(d, selected);
          const isToday = sameDay(d, today);
          return (
            <button
              key={d.toISOString()}
              type="button"
              onClick={() => setSelected(d)}
              className={cn(
                'flex flex-col items-center min-w-[3rem] rounded-xl py-2 px-1 transition-colors',
                isSelected ? 'bg-atenas-sidebar text-white' : 'hover:bg-atenas-mist',
                isToday && !isSelected && 'ring-2 ring-atenas-blue/40'
              )}
            >
              <span className="text-[10px] uppercase">{d.toLocaleDateString('es', { weekday: 'short' })}</span>
              <span className="text-sm font-bold">{d.getDate()}</span>
            </button>
          );
        })}
      </div>

      {loading ? (
        <p className="text-sm text-atenas-muted">Cargando…</p>
      ) : dayEvents.length === 0 ? (
        <p className="text-sm text-atenas-muted">Sin eventos este día.</p>
      ) : (
        <ul className="space-y-2 list-none m-0 p-0">
          {dayEvents.map((e) => (
            <li key={e.id} className={cn('rounded-xl border px-3 py-2.5 text-sm flex justify-between gap-2', e.color)}>
              <span className="font-medium truncate">{e.titulo}</span>
              <span className="shrink-0 font-bold tabular-nums">{e.tipo === 'mision' ? `+${e.puntos} XP` : `${e.puntos} pts`}</span>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
