import mongoose, { Schema, Types } from 'mongoose';

const SavedPostSchema = new Schema({
  userId: { type: Types.ObjectId, ref: 'User', required: true },
  postId: { type: Types.ObjectId, ref: 'Post', required: true },
  savedAt: { type: Date, default: Date.now },
  isDeleted: { type: Boolean, default: false },
}, {
  timestamps: true,
});

const SavedPost = (mongoose.models.SavedPost as mongoose.Model<any>) || mongoose.model('SavedPost', SavedPostSchema);
export default SavedPost;