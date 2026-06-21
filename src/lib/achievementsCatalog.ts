import { supabase } from './supabase';

export type AchievementCatalogRow = {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  icon: string;
  orden: number;
  activo: boolean;
};

const BASE_SELECT = 'id, slug, title, description, icon, orden';

function mapRow(row: Record<string, unknown>, activoDefault = true): AchievementCatalogRow {
  return {
    id: String(row.id),
    slug: String(row.slug),
    title: String(row.title),
    description: row.description != null ? String(row.description) : null,
    icon: String(row.icon ?? '🏅'),
    orden: Number(row.orden ?? 0),
    activo: typeof row.activo === 'boolean' ? row.activo : activoDefault,
  };
}

function missingActivoColumn(message: string): boolean {
  return /achievements\.activo|column.*activo.*does not exist/i.test(message);
}

/** Catálogo de logros; reintenta sin `activo` si la migración 20260620 aún no está aplicada. */
export async function fetchAchievementCatalog(): Promise<{
  data: AchievementCatalogRow[];
  hasActivoColumn: boolean;
  error: string | null;
}> {
  const withActivo = await supabase
    .from('achievements')
    .select(`${BASE_SELECT}, activo`)
    .order('orden', { ascending: true });

  if (!withActivo.error) {
    return {
      data: (withActivo.data ?? []).map((r) => mapRow(r as Record<string, unknown>)),
      hasActivoColumn: true,
      error: null,
    };
  }

  if (!missingActivoColumn(withActivo.error.message)) {
    return { data: [], hasActivoColumn: false, error: withActivo.error.message };
  }

  const fallback = await supabase.from('achievements').select(BASE_SELECT).order('orden', { ascending: true });
  if (fallback.error) {
    return { data: [], hasActivoColumn: false, error: fallback.error.message };
  }

  return {
    data: (fallback.data ?? []).map((r) => mapRow(r as Record<string, unknown>, true)),
    hasActivoColumn: false,
    error: null,
  };
}

export const ACHIEVEMENTS_ACTIVO_MIGRATION =
  'supabase/migrations/20260620_achievements_activo.sql';
