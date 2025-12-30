import mongoose, { Schema } from 'mongoose';

const LiveChatSchema = new Schema({
  stream: { type: Schema.Types.ObjectId, ref: 'LiveStream', required: true },
  user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  message: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.models.LiveChat || mongoose.model('LiveChat', LiveChatSchema);