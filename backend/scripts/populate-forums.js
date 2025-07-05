import dotenv from 'dotenv';
dotenv.config();
import { connectMongo } from '../services/shared/mongooseClient.js';
import ForumCategory from '../services/anime/forumCategoryModel.js';
import ForumTopic from '../services/anime/forumTopicModel.js';
import ForumPost from '../services/anime/forumPostModel.js';

async function populateForums() {
  try {
    await connectMongo();
    console.log('Conectado a MongoDB');

    // Crear categorías
    const categories = [
      {
        name: 'General',
        description: 'Discusiones generales sobre anime'
      },
      {
        name: 'Recomendaciones',
        description: 'Pide y comparte recomendaciones de anime'
      },
      {
        name: 'Noticias',
        description: 'Últimas noticias del mundo del anime'
      },
      {
        name: 'Críticas y Reseñas',
        description: 'Comparte tus opiniones sobre animes'
      },
      {
        name: 'Manga',
        description: 'Discusiones sobre manga y light novels'
      },
      {
        name: 'Cosplay',
        description: 'Comparte tus cosplays y proyectos'
      },
      {
        name: 'Música',
        description: 'OPs, EDs y bandas sonoras'
      },
      {
        name: 'Gaming',
        description: 'Videojuegos relacionados con anime'
      }
    ];

    console.log('Creando categorías...');
    const createdCategories = [];
    for (const category of categories) {
      const existing = await ForumCategory.findOne({ name: category.name });
      if (!existing) {
        const newCategory = await ForumCategory.create(category);
        createdCategories.push(newCategory);
        console.log(`Categoría creada: ${newCategory.name}`);
      } else {
        createdCategories.push(existing);
        console.log(`Categoría ya existe: ${existing.name}`);
      }
    }

    // Crear algunos temas de ejemplo
    const topics = [
      {
        title: '¿Cuál es tu anime favorito de todos los tiempos?',
        content: 'Hola a todos! Me gustaría saber cuál es vuestro anime favorito y por qué. Para mí sería difícil elegir solo uno, pero creo que me quedaría con Fullmetal Alchemist: Brotherhood por su historia, personajes y desarrollo.',
        categoryId: createdCategories[0]._id, // General
        userId: 'user1',
        username: 'AnimeLover'
      },
      {
        title: 'Recomendaciones de anime de fantasía',
        content: 'Estoy buscando animes de fantasía para ver. Ya he visto Re:Zero, Overlord y That Time I Got Reincarnated as a Slime. ¿Alguien puede recomendarme algo similar?',
        categoryId: createdCategories[1]._id, // Recomendaciones
        userId: 'user2',
        username: 'FantasyFan'
      },
      {
        title: 'Nuevo trailer de la temporada 2 de Demon Slayer',
        content: '¡Acaba de salir el nuevo trailer! Se ve increíble la animación. ¿Qué opinan?',
        categoryId: createdCategories[2]._id, // Noticias
        userId: 'user3',
        username: 'NewsHunter'
      },
      {
        title: 'Mi opinión sobre Attack on Titan Final Season',
        content: 'Después de ver la temporada final, tengo sentimientos encontrados. La animación fue espectacular, pero creo que el final podría haber sido mejor. ¿Qué piensan ustedes?',
        categoryId: createdCategories[3]._id, // Críticas
        userId: 'user4',
        username: 'CriticPro'
      }
    ];

    console.log('Creando temas...');
    const createdTopics = [];
    for (const topic of topics) {
      const newTopic = await ForumTopic.create(topic);
      createdTopics.push(newTopic);
      console.log(`Tema creado: ${newTopic.title}`);
    }

    // Crear algunos posts de ejemplo
    const posts = [
      {
        content: '¡Excelente tema! Mi anime favorito sería One Piece por su mundo tan rico y personajes memorables.',
        topicId: createdTopics[0]._id,
        userId: 'user5',
        username: 'PirateKing'
      },
      {
        content: 'Para fantasía te recomiendo Mushoku Tensei, tiene un mundo muy bien construido.',
        topicId: createdTopics[1]._id,
        userId: 'user6',
        username: 'MangaReader'
      },
      {
        content: '¡No puedo esperar! La primera temporada fue una obra maestra.',
        topicId: createdTopics[2]._id,
        userId: 'user7',
        username: 'DemonSlayerFan'
      },
      {
        content: 'Estoy de acuerdo contigo. El final fue algo apresurado.',
        topicId: createdTopics[3]._id,
        userId: 'user8',
        username: 'TitanWatcher'
      }
    ];

    console.log('Creando posts...');
    for (const post of posts) {
      const newPost = await ForumPost.create(post);
      console.log(`Post creado por: ${newPost.username}`);
    }

    console.log('¡Base de datos poblada exitosamente!');
    process.exit(0);
  } catch (error) {
    console.error('Error poblando la base de datos:', error);
    process.exit(1);
  }
}

populateForums(); 