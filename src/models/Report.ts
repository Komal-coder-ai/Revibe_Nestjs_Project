import { Schema, model, models, Types } from 'mongoose';

const ReportSchema = new Schema({
  userId: { type: Types.ObjectId, ref: 'User' },
  targetUserId: { type: Types.ObjectId, ref: 'User', index: true },
    postId: { type: Types.ObjectId, ref: 'Post', index: true },
  reportType: { type: String, enum: ['post', 'user']  },
  reason: { type: String },
  reportedAt: { type: Date, default: Date.now },
  status: { type: String, enum: ['pending', 'reviewed', 'resolved'], default: 'pending' }
});

  // Compound index for userId + postId
  ReportSchema.index({ userId: 1, postId: 1 });
  // Compound index for userId + targetUserId
  ReportSchema.index({ userId: 1, targetUserId: 1 });

export default models.Report || model('Report', ReportSchema);