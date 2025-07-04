import mongoose from '../shared/mongooseClient.js';

const commentSchema = new mongoose.Schema({
  animeId: { type: String, required: true, index: true },
  userId: { type: String, required: true },
  username: { type: String, required: true },
  content: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
  likes: [{ type: String }], // userIds que dieron like
}, { timestamps: true });

const Comment = mongoose.models.Comment || mongoose.model('Comment', commentSchema);

export default Comment; 