import mongoose from '../shared/mongooseClient.js';

const favoriteSchema = new mongoose.Schema({
  userId: { type: String, required: true, index: true },
  animeId: { type: String, required: true, index: true },
  title: { type: String },
  image: { type: String },
  createdAt: { type: Date, default: Date.now }
});

const Favorite = mongoose.models.Favorite || mongoose.model('Favorite', favoriteSchema);

export default Favorite; 