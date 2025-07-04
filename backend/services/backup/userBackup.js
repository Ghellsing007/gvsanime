import getSupabaseClient from '../shared/supabaseClient.js';
import User from '../anime/userModel.js';

/**
 * Realiza un backup de todos los usuarios de Supabase a MongoDB.
 * Puede ejecutarse manualmente o desde un cron job.
 */
export async function backupUsersToMongo() {
  const supabase = getSupabaseClient();
  // Obtener todos los usuarios de la tabla 'users' en Supabase
  const { data, error } = await supabase
    .from('users')
    .select('id, username, avatar_url, bio, created_at, updated_at');
  if (error) throw new Error('Error obteniendo usuarios de Supabase: ' + error.message);

  let count = 0;
  for (const user of data) {
    // Upsert en MongoDB (actualiza si existe, crea si no)
    await User.findOneAndUpdate(
      { id: user.id },
      {
        $set: {
          username: user.username,
          avatar_url: user.avatar_url,
          bio: user.bio,
          createdAt: user.created_at,
          updatedAt: user.updated_at,
        },
      },
      { upsert: true }
    );
    count++;
  }
  return { backedUp: count };
}

// Si quieres ejecutarlo como script manual:
if (require.main === module) {
  backupUsersToMongo()
    .then(res => {
      console.log('Backup de usuarios completado:', res);
      process.exit(0);
    })
    .catch(err => {
      console.error('Error en backup de usuarios:', err);
      process.exit(1);
    });
} 