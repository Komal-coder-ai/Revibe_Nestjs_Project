import mongoose, { Schema, Types } from 'mongoose';

const PostViewSchema = new Schema({
  userId: { type: Types.ObjectId, ref: 'User', required: true },
  postId: { type: Types.ObjectId, ref: 'Post', required: true },
  viewedAt: { type: Date, default: Date.now }
}, {
  timestamps: true
});

const PostView = (mongoose.models.PostView as mongoose.Model<any>) || mongoose.model('PostView', PostViewSchema);
export default PostView;
