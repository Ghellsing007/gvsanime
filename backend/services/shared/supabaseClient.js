import { createClient } from '@supabase/supabase-js';

let supabase = null;

export function getSupabaseClient() {
  if (!supabase) {
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_ANON_KEY;
    if (!supabaseUrl || !supabaseKey) {
      throw new Error('SUPABASE_URL o SUPABASE_ANON_KEY no están definidas en las variables de entorno');
    }
    supabase = createClient(supabaseUrl, supabaseKey);
  }
  return supabase;
}

export function checkSupabaseConnection() {
  getSupabaseClient(); // Esto lanzará error si falta algo
  console.log('Conexión a Supabase configurada correctamente ✅');
}

export default getSupabaseClient;
