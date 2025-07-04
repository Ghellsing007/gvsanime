import mongoose from 'mongoose';

export async function connectMongo() {
  const MONGO_URI = process.env.MONGO_URI;
  if (!MONGO_URI) {
    throw new Error('MONGO_URI no está definida en las variables de entorno');
  }
  try {
    await mongoose.connect(MONGO_URI);
    console.log('Conexión a MongoDB Atlas exitosa ✅');
  } catch (error) {
    console.error('Error al conectar a MongoDB Atlas:', error.message);
    throw error;
  }
}

export default mongoose; 