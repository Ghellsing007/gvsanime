import mongoose from '../shared/mongooseClient.js';

const forumCategorySchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  description: { type: String },
  createdAt: { type: Date, default: Date.now }
});

const ForumCategory = mongoose.models.ForumCategory || mongoose.model('ForumCategory', forumCategorySchema);

export default ForumCategory; 