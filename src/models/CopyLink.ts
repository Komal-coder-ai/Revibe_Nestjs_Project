import { Schema, model, Types } from 'mongoose';

const CopyLinkSchema = new Schema({
  userId: { type: Types.ObjectId, ref: 'User', required: true },
  postId: { type: Types.ObjectId, ref: 'Post', required: true },
  copiedAt: { type: Date, default: Date.now }
});

export default model('CopyLink', CopyLinkSchema);