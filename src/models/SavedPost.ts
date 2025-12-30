import { Schema, model, Types } from 'mongoose';

const SavedPostSchema = new Schema({
  userId: { type: Types.ObjectId, ref: 'User', required: true },
  postId: { type: Types.ObjectId, ref: 'Post', required: true },
  savedAt: { type: Date, default: Date.now }
});

export default model('SavedPost', SavedPostSchema);