import mongoose from '../shared/mongooseClient.js';

const reviewCacheSchema = new mongoose.Schema({
  animeId: { type: String, required: true, index: true },
  reviews: [Object],
  updatedAt: { type: Date, default: Date.now }
});

const ReviewCache = mongoose.models.ReviewCache || mongoose.model('ReviewCache', reviewCacheSchema);

export default ReviewCache; 