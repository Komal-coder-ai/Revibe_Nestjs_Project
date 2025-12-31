import { Schema, model, models, Types } from 'mongoose';

const ReportSchema = new Schema({
  userId: { type: Types.ObjectId, ref: 'User' },
  postId: { type: Types.ObjectId, ref: 'Post' },
  reason: { type: String },
  reportedAt: { type: Date, default: Date.now },
  status: { type: String, enum: ['pending', 'reviewed', 'resolved'], default: 'pending' }
});

export default models.Report || model('Report', ReportSchema);