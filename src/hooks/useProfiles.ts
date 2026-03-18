import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import type { Profile } from '../types';

export function useProfiles(roleFilter?: Profile['role'], includeInactive = false) {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function fetch() {
    setLoading(true);
    setError(null);
    let query = supabase.from('profiles').select('*').order('full_name');
    if (roleFilter) query = query.eq('role', roleFilter);
    const { data, error: e } = await query;
    if (e) {
      setError(e.message);
      setProfiles([]);
    } else {
      const list = (data as Profile[]) ?? [];
      setProfiles(includeInactive ? list : list.filter((p) => p.activo !== false));
    }
    setLoading(false);
  }

  useEffect(() => {
    fetch();
  }, [roleFilter, includeInactive]);

  async function updateProfile(id: string, values: Partial<{ full_name: string; role: Profile['role']; activo: boolean }>) {
    const { data, error: e } = await supabase
      .from('profiles')
      .update(values)
      .eq('id', id)
      .select()
      .single();
    if (e) throw e;
    setProfiles((prev) => prev.map((p) => (p.id === id ? (data as Profile) : p)));
    return data as Profile;
  }

  return { profiles, loading, error, refetch: fetch, updateProfile };
}
