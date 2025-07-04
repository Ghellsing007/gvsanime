import dotenv from 'dotenv';
dotenv.config();
import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import routes from './routes/index.js';
import { connectMongo } from './services/shared/mongooseClient.js';
import { checkSupabaseConnection } from './services/shared/supabaseClient.js';


const app = express();
const PORT = process.env.PORT || 5000;

// Conectar a MongoDB Atlas y verificar Supabase antes de iniciar el servidor
await connectMongo();
checkSupabaseConnection();

app.use(cors());
app.use(morgan('dev'));
app.use(express.json());

// Montar todas las rutas agrupadas bajo /api
app.use('/api', routes);

app.get('/', (req, res) => {
  res.send('GVSanime Backend Orquestador funcionando ✅');
});

app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});

// Explicación:
// - Ahora app.js solo importa las rutas agrupadas en routes/index.js
// - La configuración es más limpia y modular
// - Puedes agregar más rutas, controladores y middlewares fácilmente
