import mongoose, { Schema } from 'mongoose';

const LiveStreamSchema = new Schema({
  streamer: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true },
  category: { type: String, required: true },
  muxStreamId: { type: String },
  muxPlaybackId: { type: String },
  isActive: { type: Boolean, default: true },
  startedAt: { type: Date, default: Date.now },
  endedAt: { type: Date },
  viewers: [{ type: Schema.Types.ObjectId, ref: 'User' }],
}, { timestamps: true });

export default mongoose.models.LiveStream || mongoose.model('LiveStream', LiveStreamSchema);