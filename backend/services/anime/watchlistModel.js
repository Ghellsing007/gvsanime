import mongoose from '../shared/mongooseClient.js';

const watchlistSchema = new mongoose.Schema({
  userId: { type: String, required: true, index: true },
  animeId: { type: String, required: true, index: true },
  title: { type: String },
  image: { type: String },
  createdAt: { type: Date, default: Date.now }
});

const Watchlist = mongoose.models.Watchlist || mongoose.model('Watchlist', watchlistSchema);

export default Watchlist; 