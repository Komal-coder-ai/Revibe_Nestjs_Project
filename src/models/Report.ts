import { Schema, model, models, Types } from 'mongoose';

const ReportSchema = new Schema({
  userId: { type: Types.ObjectId, ref: 'User', required: true },
  postId: { type: Types.ObjectId, ref: 'Post', required: true },
  reason: { type: String, required: true },
  reportedAt: { type: Date, default: Date.now },
  status: { type: String, enum: ['pending', 'reviewed', 'resolved'], default: 'pending' }
});

export default models.Report || model('Report', ReportSchema);