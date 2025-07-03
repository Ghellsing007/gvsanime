import dotenv from 'dotenv';
dotenv.config();

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

// Función para verificar la configuración de Supabase
export function checkSupabaseConnection() {
  if (!supabaseUrl || !supabaseKey) {
    throw new Error('SUPABASE_URL o SUPABASE_ANON_KEY no están definidas en las variables de entorno');
  }
  console.log('Conexión a Supabase configurada correctamente ✅');
}

export default supabase;
