import { Schema, model, models, Types } from 'mongoose';

const ShareSchema = new Schema({
  userId: { type: Types.ObjectId, ref: 'User' },
  postId: { type: Types.ObjectId, ref: 'Post' },
  sharedAt: { type: Date, default: Date.now },
  type: { type: String, enum: ['share', 'copy']},
}, {
  timestamps: true,
});

export default models.Share || model('Share', ShareSchema);