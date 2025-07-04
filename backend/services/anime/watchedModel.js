import mongoose from '../shared/mongooseClient.js';

const watchedSchema = new mongoose.Schema({
  userId: { type: String, required: true, index: true },
  animeId: { type: String, required: true, index: true },
  title: { type: String },
  image: { type: String },
  watchedAt: { type: Date, default: Date.now }
});

const Watched = mongoose.models.Watched || mongoose.model('Watched', watchedSchema);

export default Watched; 