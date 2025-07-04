import mongoose from '../shared/mongooseClient.js';

const ratingSchema = new mongoose.Schema({
  userId: { type: String, required: true, index: true },
  animeId: { type: String, required: true, index: true },
  rating: { type: Number, required: true, min: 1, max: 10 },
  comment: { type: String },
  ratedAt: { type: Date, default: Date.now }
});

const Rating = mongoose.models.Rating || mongoose.model('Rating', ratingSchema);

export default Rating; 