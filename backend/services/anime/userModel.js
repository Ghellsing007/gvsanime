import mongoose from '../shared/mongooseClient.js';

const userSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true }, // id de Supabase
  username: { type: String },
  avatar_url: { type: String },
  bio: { type: String },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

const User = mongoose.models.User || mongoose.model('User', userSchema);

export default User; 