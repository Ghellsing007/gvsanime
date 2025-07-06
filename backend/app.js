import dotenv from 'dotenv';
dotenv.config();
import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import routes from './routes/index.js';
import { connectMongo } from './services/shared/mongooseClient.js';
import { checkSupabaseConnection } from './services/shared/supabaseClient.js';
import { startBackupCronJob } from './services/backup/cron.js';


const app = express();
const PORT = process.env.PORT || 5000;
const HOST = process.env.HOST || '192.168.1.7';

// Conectar a MongoDB Atlas y verificar Supabase antes de iniciar el servidor
await connectMongo();
checkSupabaseConnection();

// Lanzar el cron job de backup de animes populares (si no es test)
if (process.env.NODE_ENV !== 'test') {
  startBackupCronJob();
}

// Configuración CORS para desarrollo y producción
const allowedOrigins = [
  'http://localhost:3000',
  'http://192.168.1.7:3000',
  'https://gvsanime.vercel.app', // Frontend en Vercel
  'https://gvsanime-frontend.vercel.app', // Alternativo
  'https://gvsanime.vercel.app', // Dominio principal
  process.env.FRONTEND_URL // Variable de entorno para el frontend
].filter(Boolean); // Eliminar valores undefined

app.use(cors({
  origin: function (origin, callback) {
    // Permitir peticiones sin origen (como Postman) o si está en la lista
    if (!origin || allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      console.log('CORS bloqueado para origen:', origin);
      callback(new Error('No permitido por CORS'));
    }
  },
  credentials: true // Si usas cookies/sesiones
}));

app.use(morgan('dev'));
app.use(express.json());

// Montar todas las rutas agrupadas bajo /api
app.use('/api', routes);

app.get('/', (req, res) => {
  res.send('GVSanime Backend Orquestador funcionando ✅');
});

app.listen(PORT, HOST, () => {
  console.log(`Servidor corriendo en http://${HOST}:${PORT}`);
});

// Explicación:
// - Ahora app.js solo importa las rutas agrupadas en routes/index.js
// - La configuración es más limpia y modular
// - Puedes agregar más rutas, controladores y middlewares fácilmente
