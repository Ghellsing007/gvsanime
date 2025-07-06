import mongoose from 'mongoose';
import { createClient } from '@supabase/supabase-js';

// Verificar conexión a MongoDB
async function checkMongoDB() {
  try {
    const uri = process.env.MONGODB_URI;
    if (!uri) {
      console.log('❌ MONGODB_URI no está configurada');
      return false;
    }
    
    await mongoose.connect(uri);
    console.log('✅ MongoDB conectado correctamente');
    return true;
  } catch (error) {
    console.log('❌ Error conectando a MongoDB:', error.message);
    return false;
  }
}

// Verificar conexión a Supabase
async function checkSupabase() {
  try {
    const url = process.env.SUPABASE_URL;
    const key = process.env.SUPABASE_ANON_KEY;
    
    if (!url || !key) {
      console.log('❌ Variables de Supabase no configuradas');
      return false;
    }
    
    const supabase = createClient(url, key);
    const { data, error } = await supabase.from('animes').select('count').limit(1);
    
    if (error) {
      console.log('❌ Error conectando a Supabase:', error.message);
      return false;
    }
    
    console.log('✅ Supabase conectado correctamente');
    return true;
  } catch (error) {
    console.log('❌ Error conectando a Supabase:', error.message);
    return false;
  }
}

// Verificar variables de entorno críticas
function checkEnvironmentVariables() {
  const required = [
    'MONGODB_URI',
    'SUPABASE_URL', 
    'SUPABASE_ANON_KEY',
    'JWT_SECRET'
  ];
  
  const missing = required.filter(key => !process.env[key]);
  
  if (missing.length > 0) {
    console.log('❌ Variables de entorno faltantes:', missing.join(', '));
    return false;
  }
  
  console.log('✅ Todas las variables de entorno están configuradas');
  return true;
}

// Health check principal
async function healthCheck() {
  console.log('🔍 Iniciando health check...\n');
  
  const envCheck = checkEnvironmentVariables();
  const mongoCheck = await checkMongoDB();
  const supabaseCheck = await checkSupabase();
  
  console.log('\n📊 Resumen del health check:');
  console.log(`Variables de entorno: ${envCheck ? '✅' : '❌'}`);
  console.log(`MongoDB: ${mongoCheck ? '✅' : '❌'}`);
  console.log(`Supabase: ${supabaseCheck ? '✅' : '❌'}`);
  
  const allGood = envCheck && mongoCheck && supabaseCheck;
  
  if (allGood) {
    console.log('\n🎉 ¡Todo está funcionando correctamente!');
    process.exit(0);
  } else {
    console.log('\n⚠️  Hay problemas que necesitan atención');
    process.exit(1);
  }
}

// Ejecutar health check
healthCheck().catch(error => {
  console.error('❌ Error en health check:', error);
  process.exit(1);
}); 