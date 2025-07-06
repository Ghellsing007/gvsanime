import dotenv from 'dotenv';
dotenv.config();

export const config = {
  // Puerto del servidor
  PORT: process.env.PORT || 5000,
  
  // URLs de la base de datos
  MONGODB_URI: process.env.MONGODB_URI || 'mongodb://localhost:27017/gvsanime',
  
  // Supabase
  SUPABASE_URL: process.env.SUPABASE_URL,
  SUPABASE_ANON_KEY: process.env.SUPABASE_ANON_KEY,
  SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY,
  
  // JWT
  JWT_SECRET: process.env.JWT_SECRET || 'your-secret-key',
  
  // CORS
  CORS_ORIGIN: process.env.CORS_ORIGIN || 'http://localhost:3000',
  
  // CDN
  USE_CDN: process.env.USE_CDN === 'true',
  CDN_BASE_URL: process.env.CDN_BASE_URL || 'https://your-cdn-url.com',
  
  // Entorno
  NODE_ENV: process.env.NODE_ENV || 'development',
  
  // Logs
  LOG_LEVEL: process.env.LOG_LEVEL || 'info'
};

export default config; 