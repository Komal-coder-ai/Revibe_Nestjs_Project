import { Schema, model, Types } from 'mongoose';

const ShareSchema = new Schema({
  userId: { type: Types.ObjectId, ref: 'User', required: true },
  postId: { type: Types.ObjectId, ref: 'Post', required: true },
  sharedAt: { type: Date, default: Date.now },
  platform: { type: String }
});

export default model('Share', ShareSchema);