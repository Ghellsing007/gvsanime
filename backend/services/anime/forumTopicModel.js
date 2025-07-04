import mongoose from '../shared/mongooseClient.js';

const forumTopicSchema = new mongoose.Schema({
  categoryId: { type: mongoose.Schema.Types.ObjectId, ref: 'ForumCategory', required: true },
  title: { type: String, required: true },
  content: { type: String, required: true },
  userId: { type: String, required: true },
  username: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

const ForumTopic = mongoose.models.ForumTopic || mongoose.model('ForumTopic', forumTopicSchema);

export default ForumTopic; 