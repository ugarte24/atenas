import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL ?? '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY ?? '';

// Si faltan variables de entorno, usamos placeholders para que la app no crashee.
// Crea un archivo .env con VITE_SUPABASE_URL y VITE_SUPABASE_ANON_KEY (ver .env.example).
const url = supabaseUrl || 'https://placeholder.supabase.co';
const key = supabaseAnonKey || 'placeholder-anon-key';

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('ATENAS: Faltan VITE_SUPABASE_URL o VITE_SUPABASE_ANON_KEY en .env. Copia .env.example a .env y configura tu proyecto Supabase.');
}

export const supabase = createClient(url, key);
