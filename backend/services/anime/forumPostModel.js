import mongoose from '../shared/mongooseClient.js';

const forumPostSchema = new mongoose.Schema({
  topicId: { type: mongoose.Schema.Types.ObjectId, ref: 'ForumTopic', required: true },
  content: { type: String, required: true },
  userId: { type: String, required: true },
  username: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
  likes: [{ type: String }]
});

const ForumPost = mongoose.models.ForumPost || mongoose.model('ForumPost', forumPostSchema);

export default ForumPost; 