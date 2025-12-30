import mongoose, { Schema } from 'mongoose';

const LiveLikeSchema = new Schema({
  stream: { type: Schema.Types.ObjectId, ref: 'LiveStream', required: true },
  user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  createdAt: { type: Date, default: Date.now }
});

LiveLikeSchema.index({ stream: 1, user: 1 }, { unique: true });

export default mongoose.models.LiveLike || mongoose.model('LiveLike', LiveLikeSchema);